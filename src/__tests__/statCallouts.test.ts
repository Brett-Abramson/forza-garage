import { describe, it, expect } from 'vitest'
import { getStatCallouts, getStatColor } from '@/lib/statCallouts'
import type { Car } from '@/types/car'

// Minimal car — all stat fields null, unknown division+class by default.
// Override division+class per test when testing stat-based rules.
const makeCar = (overrides: Partial<Car> = {}): Car => ({
  id: 1,
  make: 'Ford',
  model: 'GT',
  year: 2020,
  division: 'Super Cars',   // not in lookup → no stat-based callouts
  piClass: 'A',
  piRating: 800,
  drivetrain: null,
  engineType: null,
  engineCC: null,
  cylinders: null,
  country: 'USA',
  bodyStyle: null,
  statSpeed: null,
  statHandling: null,
  statAcceleration: null,
  statLaunch: null,
  statBraking: null,
  statOffroad: null,
  powerHp: null,
  torqueFtLb: null,
  weightLb: null,
  frontWeight: null,
  displacementL: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  value: null,
  rarity: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
  ...overrides,
})

// ─── Fallback: unknown division+class ────────────────────────────────────────

describe('getStatCallouts — unknown division+class fallback', () => {
  it('returns no stat-based callouts when division has no avg data', () => {
    // 'Super Cars' is not in DIVISION_CLASS_AVERAGES
    const ids = getStatCallouts(makeCar({
      statBraking: 1.0, statHandling: 1.0, statOffroad: 1.0,
      powerHp: 900, statLaunch: 9.9,
    })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
    expect(ids).not.toContain('low-handling')
    expect(ids).not.toContain('low-offroad')
    expect(ids).not.toContain('power-handling-gap')
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('still fires non-stat rules (3, 4, 7) when division is unknown', () => {
    const ids = getStatCallouts(
      makeCar({ drivetrain: 'RWD', frontWeight: 38 }),
      ['tight'],
    ).map((c) => c.id)
    expect(ids).toContain('rwd-rear-heavy')
    expect(ids).toContain('touge-damping')
  })
})

// ─── Rule 1: weak-braking ─────────────────────────────────────────────────────
// S1 Hypercars: braking avg = 7.90, delta = -1.0 → threshold = 6.90

describe('getStatCallouts — weak-braking rule', () => {
  const s1Hyper = { division: 'Hypercars', piClass: 'S1' } as const

  it('fires when statBraking is below the division+class threshold', () => {
    // 6.5 < 6.90 → fires
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statBraking: 6.5 })).map((c) => c.id)
    expect(ids).toContain('weak-braking')
  })

  it('does not fire when statBraking is at or above the threshold', () => {
    // 7.2 > 6.90 → no fire
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statBraking: 7.2 })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  it('does not fire when statBraking is null', () => {
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statBraking: null })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  it('includes the stat value in the callout body', () => {
    const callout = getStatCallouts(makeCar({ ...s1Hyper, statBraking: 6.5 }))
      .find((c) => c.id === 'weak-braking')!
    expect(callout.body).toContain('6.5')
  })

  it('is suppressed for Drift Cars regardless of braking stat', () => {
    // S1 Drift Cars: braking avg = 5.04, threshold = 4.04 → 4.0 < 4.04 would fire, but suppressed
    const ids = getStatCallouts(makeCar({ division: 'Drift Cars', piClass: 'S1', statBraking: 4.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  it('is suppressed for Formula Drift regardless of braking stat', () => {
    // Formula Drift has no S1 data but division check fires first — use A class with no data
    // to confirm the drift suppression guard, not the threshold
    const ids = getStatCallouts(makeCar({ division: 'Formula Drift', piClass: 'A', statBraking: 1.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  // Spec test 1: D class threshold is very low — most cars won't trip it
  it('D class Classic Muscle with braking 1.8 does NOT fire (threshold = 0.80)', () => {
    // avg = 2.30, delta = -1.5 → threshold = 0.80; 1.8 > 0.80
    const ids = getStatCallouts(makeCar({ division: 'Classic Muscle', piClass: 'D', statBraking: 1.8 }))
      .map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  // Spec test 2
  it('S1 Hypercars with braking 6.5 fires (threshold = 6.90)', () => {
    const ids = getStatCallouts(makeCar({ division: 'Hypercars', piClass: 'S1', statBraking: 6.5 }))
      .map((c) => c.id)
    expect(ids).toContain('weak-braking')
  })

  // Spec test 3
  it('S1 Hypercars with braking 7.2 does NOT fire (7.2 > 6.90)', () => {
    const ids = getStatCallouts(makeCar({ division: 'Hypercars', piClass: 'S1', statBraking: 7.2 }))
      .map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  // Spec test 4
  it('Drift Cars with braking 4.0 is suppressed by drift guard', () => {
    const ids = getStatCallouts(makeCar({ division: 'Drift Cars', piClass: 'S1', statBraking: 4.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })
})

// ─── Rule 2: low-handling ─────────────────────────────────────────────────────
// S1 Hypercars: handling avg = 7.20, delta = -1.0 → threshold = 6.20

describe('getStatCallouts — low-handling rule', () => {
  const s1Hyper = { division: 'Hypercars', piClass: 'S1' } as const

  it('fires when statHandling is below the division+class threshold', () => {
    // 6.0 < 6.20 → fires
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statHandling: 6.0 })).map((c) => c.id)
    expect(ids).toContain('low-handling')
  })

  it('does not fire when statHandling is at or above the threshold', () => {
    // 6.5 > 6.20 → no fire
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statHandling: 6.5 })).map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })

  it('does not fire when statHandling is null', () => {
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statHandling: null })).map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })

  it('includes the stat value in the callout body', () => {
    const callout = getStatCallouts(makeCar({ ...s1Hyper, statHandling: 6.0 }))
      .find((c) => c.id === 'low-handling')!
    expect(callout.body).toContain('6.0')
  })

  // Spec test 5: drift division suppresses low-handling
  it('A class Drift Cars with handling 3.8 is suppressed (drift division)', () => {
    // A Drift Cars: handling avg = 5.20, threshold = 4.10; 3.8 < 4.10 would fire, but suppressed
    const ids = getStatCallouts(makeCar({ division: 'Drift Cars', piClass: 'A', statHandling: 3.8 }))
      .map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })

  it('is suppressed when car has drag tag', () => {
    const ids = getStatCallouts(makeCar({ ...s1Hyper, statHandling: 5.0 }), ['drag'])
      .map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })
})

// ─── Rule 3: rwd-rear-heavy ──────────────────────────────────────────────────
// Unchanged — drivetrain+frontWeight check, no avg data needed

describe('getStatCallouts — rwd-rear-heavy rule', () => {
  it('fires when drivetrain is RWD and frontWeight is below 42', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'RWD', frontWeight: 41 })).map((c) => c.id)
    expect(ids).toContain('rwd-rear-heavy')
  })

  it('does not fire when frontWeight is exactly 42', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'RWD', frontWeight: 42 })).map((c) => c.id)
    expect(ids).not.toContain('rwd-rear-heavy')
  })

  it('does not fire for AWD with low front weight', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'AWD', frontWeight: 35 })).map((c) => c.id)
    expect(ids).not.toContain('rwd-rear-heavy')
  })

  it('does not fire for FWD with low front weight', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'FWD', frontWeight: 35 })).map((c) => c.id)
    expect(ids).not.toContain('rwd-rear-heavy')
  })

  it('does not fire when frontWeight is null', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'RWD', frontWeight: null })).map((c) => c.id)
    expect(ids).not.toContain('rwd-rear-heavy')
  })

  it('includes the weight percentage in the callout body', () => {
    const callout = getStatCallouts(makeCar({ drivetrain: 'RWD', frontWeight: 38 }))
      .find((c) => c.id === 'rwd-rear-heavy')!
    expect(callout.body).toContain('38%')
  })

  it('is suppressed for Drift Cars division', () => {
    const ids = getStatCallouts(makeCar({ division: 'Drift Cars', drivetrain: 'RWD', frontWeight: 38 }))
      .map((c) => c.id)
    expect(ids).not.toContain('rwd-rear-heavy')
  })
})

// ─── Rule 4: fwd-front-heavy ───────────────────────────────────────────────────
// Unchanged — drivetrain+frontWeight check, no avg data needed

describe('getStatCallouts — fwd-front-heavy rule', () => {
  it('fires when drivetrain is FWD and frontWeight is above 58', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'FWD', frontWeight: 59 })).map((c) => c.id)
    expect(ids).toContain('fwd-front-heavy')
  })

  it('does not fire when frontWeight is exactly 58', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'FWD', frontWeight: 58 })).map((c) => c.id)
    expect(ids).not.toContain('fwd-front-heavy')
  })

  it('does not fire for RWD with high front weight', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'RWD', frontWeight: 65 })).map((c) => c.id)
    expect(ids).not.toContain('fwd-front-heavy')
  })

  it('does not fire for AWD with high front weight', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'AWD', frontWeight: 65 })).map((c) => c.id)
    expect(ids).not.toContain('fwd-front-heavy')
  })

  it('does not fire when frontWeight is null', () => {
    const ids = getStatCallouts(makeCar({ drivetrain: 'FWD', frontWeight: null })).map((c) => c.id)
    expect(ids).not.toContain('fwd-front-heavy')
  })
})

// ─── Rule 5: launch-braking-mismatch ─────────────────────────────────────────
// S1 Modern Super Saloons: launch avg = 8.73 → launch threshold = 9.73
//                          braking avg = 6.50, delta = -1.0 → braking threshold = 5.50

describe('getStatCallouts — launch-braking-mismatch rule', () => {
  const s1Mss = { division: 'Modern Super Saloons', piClass: 'S1' } as const

  it('fires when launch is well above avg and braking is below threshold', () => {
    // launch 9.8 > 9.73, braking 5.0 < 5.50
    const ids = getStatCallouts(makeCar({ ...s1Mss, statLaunch: 9.8, statBraking: 5.0 }))
      .map((c) => c.id)
    expect(ids).toContain('launch-braking-mismatch')
  })

  it('does not fire when launch is below the avg+1.0 threshold', () => {
    // 9.0 < 9.73
    const ids = getStatCallouts(makeCar({ ...s1Mss, statLaunch: 9.0, statBraking: 5.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when braking is above its threshold', () => {
    // braking 6.0 > 5.50
    const ids = getStatCallouts(makeCar({ ...s1Mss, statLaunch: 9.8, statBraking: 6.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when statLaunch is null', () => {
    const ids = getStatCallouts(makeCar({ ...s1Mss, statLaunch: null, statBraking: 5.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when statBraking is null', () => {
    const ids = getStatCallouts(makeCar({ ...s1Mss, statLaunch: 9.8, statBraking: null }))
      .map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('includes both stat values in the callout body', () => {
    const callout = getStatCallouts(makeCar({ ...s1Mss, statLaunch: 9.8, statBraking: 5.0 }))
      .find((c) => c.id === 'launch-braking-mismatch')!
    expect(callout.body).toContain('9.8')
    expect(callout.body).toContain('5.0')
  })

  it('is suppressed for Drift Cars division', () => {
    const ids = getStatCallouts(makeCar({ division: 'Drift Cars', piClass: 'S1', statLaunch: 9.8, statBraking: 5.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('is suppressed when car has drag tag', () => {
    const ids = getStatCallouts(makeCar({ ...s1Mss, statLaunch: 9.8, statBraking: 5.0 }), ['drag'])
      .map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })
})

// ─── Rule 6: low-offroad ──────────────────────────────────────────────────────
// B class Unlimited Offroad: offroad avg = 9.73, delta = -1.2 → threshold = 8.53

describe('getStatCallouts — low-offroad rule', () => {
  // Spec test 6: non-offroad-relevant division never fires
  it('B class Hot Hatch with low offroad does NOT fire (not offroad-relevant)', () => {
    const ids = getStatCallouts(makeCar({ division: 'Hot Hatch', piClass: 'B', statOffroad: 3.5 }))
      .map((c) => c.id)
    expect(ids).not.toContain('low-offroad')
  })

  // Spec test 7
  it('B class Unlimited Offroad with offroad 8.8 does NOT fire (8.8 > 8.53)', () => {
    const ids = getStatCallouts(makeCar({ division: 'Unlimited Offroad', piClass: 'B', statOffroad: 8.8 }))
      .map((c) => c.id)
    expect(ids).not.toContain('low-offroad')
  })

  // Spec test 8
  it('B class Unlimited Offroad with offroad 7.0 fires (7.0 < 8.53)', () => {
    const ids = getStatCallouts(makeCar({ division: 'Unlimited Offroad', piClass: 'B', statOffroad: 7.0 }))
      .map((c) => c.id)
    expect(ids).toContain('low-offroad')
  })

  it('does not fire when statOffroad is null', () => {
    const ids = getStatCallouts(makeCar({ division: 'Unlimited Offroad', piClass: 'B', statOffroad: null }))
      .map((c) => c.id)
    expect(ids).not.toContain('low-offroad')
  })

  it('includes the stat value in the callout body', () => {
    const callout = getStatCallouts(makeCar({ division: 'Unlimited Offroad', piClass: 'B', statOffroad: 7.0 }))
      .find((c) => c.id === 'low-offroad')!
    expect(callout.body).toContain('7.0')
  })

  it('fires for Rally Monsters (offroad-relevant)', () => {
    // B Rally Monsters: offroad avg = 6.80, threshold = 5.60; 5.0 < 5.60 → fires
    const ids = getStatCallouts(makeCar({ division: 'Rally Monsters', piClass: 'B', statOffroad: 5.0 }))
      .map((c) => c.id)
    expect(ids).toContain('low-offroad')
  })
})

// ─── Rule 7 — touge-damping ───────────────────────────────────────────────────
// Unchanged — tag-based, no avg data needed

describe('getStatCallouts — touge-damping rule', () => {
  it('fires when garageTags includes "tight"', () => {
    const ids = getStatCallouts(makeCar(), ['tight']).map((c) => c.id)
    expect(ids).toContain('touge-damping')
  })

  it('fires when garageTags includes "technical"', () => {
    const ids = getStatCallouts(makeCar(), ['technical']).map((c) => c.id)
    expect(ids).toContain('touge-damping')
  })

  it('does not fire when garageTags is absent', () => {
    const ids = getStatCallouts(makeCar()).map((c) => c.id)
    expect(ids).not.toContain('touge-damping')
  })

  it('does not fire when garageTags contains neither trigger tag', () => {
    const ids = getStatCallouts(makeCar(), ['grip', 'asphalt']).map((c) => c.id)
    expect(ids).not.toContain('touge-damping')
  })

  it('fires when garageTags contains both trigger tags alongside others', () => {
    const ids = getStatCallouts(makeCar(), ['grip', 'tight', 'technical']).map((c) => c.id)
    expect(ids).toContain('touge-damping')
  })

  it('does not require any stat fields — fires on tags alone', () => {
    const ids = getStatCallouts(makeCar(), ['technical']).map((c) => c.id)
    expect(ids).toContain('touge-damping')
  })

  it('callout body mentions the Bump < Rebound rule', () => {
    const callout = getStatCallouts(makeCar(), ['tight']).find((c) => c.id === 'touge-damping')!
    expect(callout).toBeDefined()
    expect(callout.body.toLowerCase()).toMatch(/bump.*rebound|rebound.*bump/)
  })
})

// ─── Rule 8 — power-handling-gap ─────────────────────────────────────────────
// S2 Hypercars: handling avg = 7.57, delta = -0.9 → threshold = 6.67; HP threshold = 900

describe('getStatCallouts — power-handling-gap rule', () => {
  const s2Hyper = { division: 'Hypercars', piClass: 'S2' } as const

  // Spec test 9
  it('S2 car with 950hp and handling below threshold fires', () => {
    // 950 > 900, 6.0 < 6.67 → fires
    const ids = getStatCallouts(makeCar({ ...s2Hyper, powerHp: 950, statHandling: 6.0 }))
      .map((c) => c.id)
    expect(ids).toContain('power-handling-gap')
  })

  it('does not fire when powerHp is below class HP threshold', () => {
    // 800 < 900
    const ids = getStatCallouts(makeCar({ ...s2Hyper, powerHp: 800, statHandling: 6.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('does not fire when statHandling is at or above threshold', () => {
    // 7.0 > 6.67
    const ids = getStatCallouts(makeCar({ ...s2Hyper, powerHp: 950, statHandling: 7.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('does not fire when powerHp is null', () => {
    const ids = getStatCallouts(makeCar({ ...s2Hyper, powerHp: null, statHandling: 5.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('does not fire when statHandling is null', () => {
    const ids = getStatCallouts(makeCar({ ...s2Hyper, powerHp: 950, statHandling: null }))
      .map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  // Spec test 10
  it('R class car with 1200hp and low handling is suppressed (R exempt)', () => {
    const ids = getStatCallouts(makeCar({ division: 'Hypercars', piClass: 'R', powerHp: 1200, statHandling: 6.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('is suppressed when car has drag tag', () => {
    const ids = getStatCallouts(makeCar({ ...s2Hyper, powerHp: 950, statHandling: 6.0 }), ['drag'])
      .map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('callout body mentions power and handling values', () => {
    const callout = getStatCallouts(makeCar({ ...s2Hyper, powerHp: 950, statHandling: 6.0 }))
      .find((c) => c.id === 'power-handling-gap')!
    expect(callout).toBeDefined()
    expect(callout.body).toMatch(/950hp/i)
    expect(callout.body).toMatch(/6\.0/)
  })
})

// Spec test 11: unknown division+class combination
describe('getStatCallouts — unknown division+class combination', () => {
  it('fires no stat-based callouts for an unrecognised division+class', () => {
    const ids = getStatCallouts(makeCar({
      division: 'Super Cars', piClass: 'A',
      statBraking: 1.0, statHandling: 1.0, statOffroad: 1.0,
      powerHp: 999, statLaunch: 10.0,
    })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
    expect(ids).not.toContain('low-handling')
    expect(ids).not.toContain('low-offroad')
    expect(ids).not.toContain('power-handling-gap')
    expect(ids).not.toContain('launch-braking-mismatch')
  })
})

// ─── Multiple callouts ────────────────────────────────────────────────────────
// B class Rally Monsters: handling avg=4.60 (threshold=3.40), braking avg=3.70 (threshold=2.50),
//                         offroad avg=6.80 (threshold=5.60). Rally Monsters is offroad-relevant.

describe('getStatCallouts — multiple rules', () => {
  it('can return several callouts simultaneously for a genuinely weak car', () => {
    const callouts = getStatCallouts(makeCar({
      division: 'Rally Monsters',
      piClass: 'B',
      statBraking: 2.0,    // < 2.50 → weak-braking
      statHandling: 3.0,   // < 3.40 → low-handling
      statOffroad: 5.0,    // < 5.60 → low-offroad
    }))
    const ids = callouts.map((c) => c.id)
    expect(ids).toContain('weak-braking')
    expect(ids).toContain('low-handling')
    expect(ids).toContain('low-offroad')
    expect(callouts.length).toBeGreaterThanOrEqual(3)
  })

  it('weak-braking and launch-braking-mismatch can both fire for the same car', () => {
    // S1 Modern Super Saloons: launch threshold=9.73, braking threshold=5.50
    const callouts = getStatCallouts(makeCar({
      division: 'Modern Super Saloons',
      piClass: 'S1',
      statLaunch: 9.8,
      statBraking: 3.0,
    }))
    const ids = callouts.map((c) => c.id)
    expect(ids).toContain('weak-braking')
    expect(ids).toContain('launch-braking-mismatch')
  })
})

// ─── getStatColor ─────────────────────────────────────────────────────────────

describe('getStatColor', () => {
  it('returns neutral gray when avg is null', () => {
    expect(getStatColor(7.0, null)).toBe('bg-gray-400')
    expect(getStatColor(0.0, null)).toBe('bg-gray-400')
  })

  it('returns strong green when stat >= avg + 1.0', () => {
    expect(getStatColor(8.0, 7.0)).toBe('bg-green-500')   // delta = +1.0 exactly
    expect(getStatColor(9.5, 7.0)).toBe('bg-green-500')   // delta = +2.5
  })

  it('returns light green when stat >= avg + 0.3 and < avg + 1.0', () => {
    expect(getStatColor(7.3, 7.0)).toBe('bg-green-400')   // delta = +0.3 exactly
    expect(getStatColor(7.9, 7.0)).toBe('bg-green-400')   // delta = +0.9
  })

  it('returns amber when stat is within ±0.3 of avg', () => {
    expect(getStatColor(7.0, 7.0)).toBe('bg-amber-400')   // delta = 0 (exactly avg)
    expect(getStatColor(7.29, 7.0)).toBe('bg-amber-400')  // delta = +0.29
    expect(getStatColor(6.71, 7.0)).toBe('bg-amber-400')  // delta = -0.29
    expect(getStatColor(6.7, 7.0)).toBe('bg-amber-400')   // delta = -0.3 exactly
  })

  it('returns orange when stat >= avg - 1.0 and < avg - 0.3', () => {
    expect(getStatColor(6.5, 7.0)).toBe('bg-orange-500')  // delta = -0.5
    expect(getStatColor(6.0, 7.0)).toBe('bg-orange-500')  // delta = -1.0 exactly
  })

  it('returns red when stat < avg - 1.0', () => {
    expect(getStatColor(5.9, 7.0)).toBe('bg-red-500')     // delta = -1.1
    expect(getStatColor(4.0, 7.0)).toBe('bg-red-500')     // delta = -3.0
  })
})
