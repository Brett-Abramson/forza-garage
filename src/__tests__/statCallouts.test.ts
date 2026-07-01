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

  // v3.1 Change 1 — reworded away from "meta rewards braking" toward build-priority framing
  it('frames braking as a build priority, not a meta-selection reason (v3.1)', () => {
    const callout = getStatCallouts(makeCar({ ...s1Hyper, statBraking: 6.5 }))
      .find((c) => c.id === 'weak-braking')!
    expect(callout.body).not.toContain('meta')
    expect(callout.body).not.toContain("biggest weakness")
    expect(callout.body).toContain('prioritise the brake upgrade')
    expect(callout.body).toContain('not a reason to pass on the car')
  })

  // v3.1 Change 2 — suppressed entirely on divisions where braking is a known-weak DNA trait
  it('is suppressed on a division where braking is division-weak (Classic Muscle)', () => {
    // Classic Muscle B: braking avg = 3.00, delta(B) = -1.2 → threshold = 1.80; 1.5 would fire class-only
    const ids = getStatCallouts(makeCar({ division: 'Classic Muscle', piClass: 'B', statBraking: 1.5 }))
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

  // v3.1 Change 2 — suppressed entirely on divisions where grip is a known-weak DNA trait
  it('is suppressed on a division where grip is division-weak (Classic Muscle)', () => {
    // Classic Muscle B: handling avg = 3.70, delta(B) = -1.2 → threshold = 2.50; 2.0 would fire class-only
    const ids = getStatCallouts(makeCar({ division: 'Classic Muscle', piClass: 'B', statHandling: 2.0 }))
      .map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })

  // v3.1 — genuine outliers on a grip-strong division must still flag (not silenced by DNA)
  it('still flags a genuinely low-grip car on a grip-strong division (Hot Hatch)', () => {
    // Hot Hatch B: handling avg = 5.08, delta(B) = -1.2 → threshold = 3.88; 3.0 is a real outlier
    const ids = getStatCallouts(makeCar({ division: 'Hot Hatch', piClass: 'B', statHandling: 3.0 }))
      .map((c) => c.id)
    expect(ids).toContain('low-handling')
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

// ─── Rule 9: grip vs speed ──────────────────────────────────────────────────

describe('getStatCallouts — grip vs speed rule', () => {
  it('fires comes-alive-at-speed when grip climbs hard with speed', () => {
    // Ratio clears LATERAL_AERO_GAIN_MIN but the absolute grip (0.6G) stays below HIGH_GRIP_MIN['A']
    // (1.12), so this isolates Rule 9 without also tripping the arch-fast-sweeper archetype (v3).
    const ids = getStatCallouts(makeCar({ simLateralG60: 0.5, simLateralG120: 0.6 })).map((c) => c.id)
    expect(ids).toContain('comes-alive-at-speed')
  })

  it('fires flat-grip-curve when grip drops with speed', () => {
    const ids = getStatCallouts(makeCar({ simLateralG60: 1.00, simLateralG120: 0.95 })).map((c) => c.id)
    expect(ids).toContain('flat-grip-curve')
  })

  it('fires neither for a near-flat ~1.0 ratio', () => {
    const ids = getStatCallouts(makeCar({ simLateralG60: 1.00, simLateralG120: 1.03 })).map((c) => c.id)
    expect(ids).not.toContain('comes-alive-at-speed')
    expect(ids).not.toContain('flat-grip-curve')
  })

  it('fires neither when simLateralG60 is null', () => {
    const ids = getStatCallouts(makeCar({ simLateralG60: null, simLateralG120: 1.15 })).map((c) => c.id)
    expect(ids).not.toContain('comes-alive-at-speed')
    expect(ids).not.toContain('flat-grip-curve')
  })
})

// ─── Rule 10: acceleration profile ─────────────────────────────────────────

describe('getStatCallouts — acceleration profile rule', () => {
  it('fires sustained-acceleration for a low 0-100/0-60 ratio', () => {
    const ids = getStatCallouts(makeCar({ simZeroToSixty: 4.0, simZeroToHundred: 8.0 })).map((c) => c.id)
    expect(ids).toContain('sustained-acceleration')
  })

  it('fires front-loaded-acceleration for a high 0-100/0-60 ratio', () => {
    const ids = getStatCallouts(makeCar({ simZeroToSixty: 3.0, simZeroToHundred: 8.0 })).map((c) => c.id)
    expect(ids).toContain('front-loaded-acceleration')
  })

  it('fires neither for a mid-range ratio', () => {
    const ids = getStatCallouts(makeCar({ simZeroToSixty: 4.0, simZeroToHundred: 9.0 })).map((c) => c.id)
    expect(ids).not.toContain('sustained-acceleration')
    expect(ids).not.toContain('front-loaded-acceleration')
  })

  it('fires neither when fields are null', () => {
    const ids = getStatCallouts(makeCar({ simZeroToSixty: null, simZeroToHundred: 8.0 })).map((c) => c.id)
    expect(ids).not.toContain('sustained-acceleration')
    expect(ids).not.toContain('front-loaded-acceleration')
  })
})

// ─── Rule 11: top-speed ceiling ─────────────────────────────────────────────
// A class floor = 180

describe('getStatCallouts — low-top-speed rule', () => {
  it('fires when simTopSpeed is below the class floor', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simTopSpeed: 170 })).map((c) => c.id)
    expect(ids).toContain('low-top-speed')
  })

  it('does not fire when simTopSpeed is at or above the class floor', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simTopSpeed: 180 })).map((c) => c.id)
    expect(ids).not.toContain('low-top-speed')
  })

  it('does not fire for an unaffected class at the same speed', () => {
    // 170 is above the S2 floor of 203? No — use a class where 170 is fine: D floor = 90
    const ids = getStatCallouts(makeCar({ piClass: 'D', simTopSpeed: 170 })).map((c) => c.id)
    expect(ids).not.toContain('low-top-speed')
  })

  it('is suppressed for offroad-relevant divisions (Fix 6)', () => {
    const ids = getStatCallouts(makeCar({
      division: 'Rally Monsters', piClass: 'A', simTopSpeed: 170,
    })).map((c) => c.id)
    expect(ids).not.toContain('low-top-speed')
  })

  // v3.1 Change 2 — generalizes Fix 6 via DIVISION_PROFILES: topspeed is a division-weak
  // trait for Rally Monsters (z = -1.4), so it's suppressed independent of the offroad set
  it('is suppressed on a division where topspeed is division-weak (Rally Monsters)', () => {
    const ids = getStatCallouts(makeCar({
      division: 'Rally Monsters', piClass: 'A', simTopSpeed: 170,
    })).map((c) => c.id)
    expect(ids).not.toContain('low-top-speed')
  })
})

// ─── Rule 12: long braking distance ─────────────────────────────────────────
// A class ceiling = 317

describe('getStatCallouts — long-braking-distance rule', () => {
  it('fires when simBraking100 is above the class ceiling', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simBraking100: 330 })).map((c) => c.id)
    expect(ids).toContain('long-braking-distance')
  })

  it('does not fire when simBraking100 is at or below the class ceiling', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simBraking100: 317 })).map((c) => c.id)
    expect(ids).not.toContain('long-braking-distance')
  })

  it('does not fire for drift cars', () => {
    const ids = getStatCallouts(makeCar({ division: 'Drift Cars', piClass: 'A', simBraking100: 330 })).map((c) => c.id)
    expect(ids).not.toContain('long-braking-distance')
  })

  it('is suppressed for offroad-relevant divisions (Fix 6)', () => {
    const ids = getStatCallouts(makeCar({
      division: 'Rally Monsters', piClass: 'A', simBraking100: 330,
    })).map((c) => c.id)
    expect(ids).not.toContain('long-braking-distance')
  })
})

// ─── Rule 13: drag candidate ─────────────────────────────────────────────────
// S1 Hypercars: launch avg = 7.62, threshold = 8.62. QUICK_ENOUGH_MAX['S1'] = 2.8.

describe('getStatCallouts — drag-candidate rule', () => {
  const s1Hyper = { division: 'Hypercars', piClass: 'S1' } as const

  it('fires for AWD with a high launch stat and a genuinely quick 0-60 (e-tron GT case)', () => {
    const ids = getStatCallouts(makeCar({
      ...s1Hyper, drivetrain: 'AWD', statLaunch: 9.0, simZeroToSixty: 2.5,
    })).map((c) => c.id)
    expect(ids).toContain('drag-candidate')
  })

  it('does not fire for the same car as RWD', () => {
    const ids = getStatCallouts(makeCar({
      ...s1Hyper, drivetrain: 'RWD', statLaunch: 9.0, simZeroToSixty: 2.5,
    })).map((c) => c.id)
    expect(ids).not.toContain('drag-candidate')
  })

  it('does not fire when 0-60 is not genuinely quick for class', () => {
    const ids = getStatCallouts(makeCar({
      ...s1Hyper, drivetrain: 'AWD', statLaunch: 9.0, simZeroToSixty: 3.5,
    })).map((c) => c.id)
    expect(ids).not.toContain('drag-candidate')
  })

  it('is suppressed for an offroad-division truck even with a high launch stat (F-150 Lightning case)', () => {
    const ids = getStatCallouts(makeCar({
      division: 'Pickups & 4x4s', piClass: 'B', drivetrain: 'AWD',
      statLaunch: 9.0, simZeroToSixty: 2.0, simTopSpeed: 110,
    })).map((c) => c.id)
    expect(ids).not.toContain('drag-candidate')
  })
})

// ─── Rule 14: power-to-weight build priority ────────────────────────────────

describe('getStatCallouts — power-to-weight build priority rule', () => {
  it('fires heavy-build-priority when lb/hp is high', () => {
    const ids = getStatCallouts(makeCar({ weightLb: 3900, powerHp: 300 })).map((c) => c.id)
    expect(ids).toContain('heavy-build-priority')
  })

  it('fires grip-build-priority when lb/hp is low', () => {
    const ids = getStatCallouts(makeCar({ weightLb: 3000, powerHp: 600 })).map((c) => c.id)
    expect(ids).toContain('grip-build-priority')
  })

  it('fires neither in the mid-range', () => {
    const ids = getStatCallouts(makeCar({ weightLb: 3200, powerHp: 400 })).map((c) => c.id)
    expect(ids).not.toContain('heavy-build-priority')
    expect(ids).not.toContain('grip-build-priority')
  })

  it('fires neither when fields are null', () => {
    const ids = getStatCallouts(makeCar({ weightLb: null, powerHp: 300 })).map((c) => c.id)
    expect(ids).not.toContain('heavy-build-priority')
    expect(ids).not.toContain('grip-build-priority')
  })
})

// ─── Rule 15: draggy aero ────────────────────────────────────────────────────

describe('getStatCallouts — draggy-aero rule', () => {
  it('fires when simAeroEfficiency is below the threshold', () => {
    const ids = getStatCallouts(makeCar({ simAeroEfficiency: 0.5 })).map((c) => c.id)
    expect(ids).toContain('draggy-aero')
  })

  it('does not fire when simAeroEfficiency is at or above the threshold', () => {
    const ids = getStatCallouts(makeCar({ simAeroEfficiency: 0.7 })).map((c) => c.id)
    expect(ids).not.toContain('draggy-aero')
  })

  it('does not fire when null', () => {
    const ids = getStatCallouts(makeCar({ simAeroEfficiency: null })).map((c) => c.id)
    expect(ids).not.toContain('draggy-aero')
  })
})

// ─── Rule 16: mechanical balance skew (direction fixed — Fix 1) ─────────────
// simMechBalance correlates NEGATIVELY with front weight%: low value = nose-heavy =
// understeer; high value = rear-heavy = oversteer.

describe('getStatCallouts — mech-understeer / mech-oversteer rules', () => {
  it('fires mech-oversteer for a high simMechBalance (911 Rallye case: 0.62)', () => {
    const ids = getStatCallouts(makeCar({ simMechBalance: 0.65 })).map((c) => c.id)
    expect(ids).toContain('mech-oversteer')
    expect(ids).not.toContain('mech-understeer')
  })

  it('does not fire for a centered simMechBalance', () => {
    const ids = getStatCallouts(makeCar({ simMechBalance: 0.50 })).map((c) => c.id)
    expect(ids).not.toContain('mech-understeer')
    expect(ids).not.toContain('mech-oversteer')
  })

  it('fires mech-understeer for a low simMechBalance (RS 6 case: 0.41)', () => {
    const ids = getStatCallouts(makeCar({ simMechBalance: 0.40 })).map((c) => c.id)
    expect(ids).toContain('mech-understeer')
    expect(ids).not.toContain('mech-oversteer')
  })
})

// ─── Rule 17: aero balance skew ──────────────────────────────────────────────

describe('getStatCallouts — aero-balance-skew rule', () => {
  it('fires for a front-biased aero car', () => {
    const ids = getStatCallouts(makeCar({ simAeroBalance: 0.6 })).map((c) => c.id)
    expect(ids).toContain('aero-balance-skew')
  })

  it('does not fire for a car with no aero (simAeroBalance: 0)', () => {
    const ids = getStatCallouts(makeCar({ simAeroBalance: 0 })).map((c) => c.id)
    expect(ids).not.toContain('aero-balance-skew')
  })

  it('does not fire for a low-but-present aero balance', () => {
    const ids = getStatCallouts(makeCar({ simAeroBalance: 0.3 })).map((c) => c.id)
    expect(ids).not.toContain('aero-balance-skew')
  })
})

// ─── Rule 18: strong top speed for class ────────────────────────────────────
// A class strength floor = 208

describe('getStatCallouts — strong-top-speed rule', () => {
  it('fires at or above the class strength threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simTopSpeed: 208 })).map((c) => c.id)
    expect(ids).toContain('strong-top-speed')
  })

  it('does not fire just under the threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simTopSpeed: 207 })).map((c) => c.id)
    expect(ids).not.toContain('strong-top-speed')
  })
})

// ─── Rule 19: strong braking for class ──────────────────────────────────────
// A class strength ceiling = 250

describe('getStatCallouts — strong-braking rule', () => {
  it('fires at or below the class strength threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simBraking100: 250 })).map((c) => c.id)
    expect(ids).toContain('strong-braking')
  })

  it('does not fire just over the threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simBraking100: 251 })).map((c) => c.id)
    expect(ids).not.toContain('strong-braking')
  })
})

// ─── Rule 20: strong cornering grip for class ───────────────────────────────
// A class strength floor = 1.19

describe('getStatCallouts — strong-cornering-grip rule', () => {
  it('fires at or above the class strength threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simLateralG120: 1.19 })).map((c) => c.id)
    expect(ids).toContain('strong-cornering-grip')
  })

  it('does not fire just under the threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simLateralG120: 1.18 })).map((c) => c.id)
    expect(ids).not.toContain('strong-cornering-grip')
  })

  // v3.1 Change 2 — grip-strong divisions (Track Toys) require clearing the division's own
  // handling average too, not just the class p90 sim bar, so "strong" means strong even here.
  describe('division-strong gating (Track Toys)', () => {
    // Track Toys A: handling avg = 6.16
    it('does not fire at class p90 grip if below the division handling average', () => {
      const ids = getStatCallouts(makeCar({
        division: 'Track Toys', piClass: 'A', simLateralG120: 1.19, statHandling: 5.0,
      })).map((c) => c.id)
      expect(ids).not.toContain('strong-cornering-grip')
    })

    it('fires at class p90 grip when also above the division handling average', () => {
      const ids = getStatCallouts(makeCar({
        division: 'Track Toys', piClass: 'A', simLateralG120: 1.19, statHandling: 6.5,
      })).map((c) => c.id)
      expect(ids).toContain('strong-cornering-grip')
    })
  })

  // v3.1 — fallback: a division absent from DIVISION_PROFILES behaves exactly as before
  it('fires at the class threshold alone for a division not in DIVISION_PROFILES (GT Cars)', () => {
    const ids = getStatCallouts(makeCar({
      division: 'GT Cars', piClass: 'A', simLateralG120: 1.19, statHandling: null,
    })).map((c) => c.id)
    expect(ids).toContain('strong-cornering-grip')
  })
})

// ─── Rule 21: strong acceleration for class ─────────────────────────────────
// A class strength ceiling = 3.0

describe('getStatCallouts — strong-acceleration rule', () => {
  it('fires at or below the class strength threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simZeroToSixty: 3.0, weightLb: 3500, powerHp: 500 })).map((c) => c.id)
    expect(ids).toContain('strong-acceleration')
  })

  it('does not fire just over the threshold', () => {
    const ids = getStatCallouts(makeCar({ piClass: 'A', simZeroToSixty: 3.1, weightLb: 3500, powerHp: 500 })).map((c) => c.id)
    expect(ids).not.toContain('strong-acceleration')
  })
})

// ─── Rule 22 (retired in v3) — corner-exit / point-and-squirt ───────────────
// v3 note: Rule 22's gate was identical to arch-point-squirt's, so it always fired and was
// always immediately subsumed — dead weight. It's retired; the archetype below owns this
// identity outright. Coverage moves to the "arch-point-squirt archetype" describe block.

// ─── v3: archetype synthesis layer ──────────────────────────────────────────
// A class thresholds used below: STRONG_GRIP_MIN=1.19, STRONG_BRAKING_MAX=250,
// HIGH_GRIP_MIN=1.12, TOP_SPEED_MID=191, STRONG_TOP_SPEED_MIN=208, LOW_GRIP_MAX=0.97,
// QUICK_ENOUGH_MAX=3.4, TOP_SPEED_FLOOR=180, ACCEL_SUSTAINED_MAX=2.10.

describe('getStatCallouts — arch-dirt archetype', () => {
  it('leads the list and subsumes sustained-acceleration for an offroad-division car', () => {
    // Without the archetype, ratio 4.0/8.0=2.0 <= ACCEL_SUSTAINED_MAX would fire sustained-acceleration
    const ids = getStatCallouts(makeCar({
      division: 'Pickups & 4x4s', piClass: 'B', statOffroad: 8.5,
      simZeroToSixty: 4.0, simZeroToHundred: 8.0,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-dirt')
    expect(ids).not.toContain('sustained-acceleration')
  })
})

describe('getStatCallouts — arch-point-squirt archetype', () => {
  it('leads the list and subsumes flat-grip-curve for a low-grip, quick-launch car', () => {
    // Without the archetype, 0.95/1.05 = 0.90 < LATERAL_FLAT_MAX would fire flat-grip-curve
    const ids = getStatCallouts(makeCar({
      piClass: 'A', simLateralG60: 1.05, simLateralG120: 0.95, simZeroToSixty: 3.0,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-point-squirt')
    expect(ids).not.toContain('flat-grip-curve')
  })
})

describe('getStatCallouts — arch-fast-sweeper archetype', () => {
  it('leads the list and subsumes comes-alive-at-speed and strong-cornering-grip', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'A', simLateralG60: 1.00, simLateralG120: 1.20,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-fast-sweeper')
    expect(ids).not.toContain('comes-alive-at-speed')
    expect(ids).not.toContain('strong-cornering-grip')
  })
})

describe('getStatCallouts — arch-top-end archetype', () => {
  it('leads the list and subsumes strong-top-speed and sustained-acceleration', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'A', simTopSpeed: 215, simZeroToSixty: 3.0, simZeroToHundred: 6.0,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-top-end')
    expect(ids).not.toContain('strong-top-speed')
    expect(ids).not.toContain('sustained-acceleration')
  })
})

describe('getStatCallouts — arch-heavy-gt archetype', () => {
  it('leads the list and subsumes power-handling-gap, but leaves low-handling visible (RS 6 case)', () => {
    // GT Cars A: handling avg = 5.58, delta(A) = -1.1 -> threshold 4.48; HP_THRESHOLD['A'] = 450
    const ids = getStatCallouts(makeCar({
      division: 'GT Cars', piClass: 'A', weightLb: 4376, frontWeight: 59,
      simLateralG120: 1.00, simTopSpeed: 195, powerHp: 700, statHandling: 4.0,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-heavy-gt')
    expect(ids).not.toContain('power-handling-gap')
    expect(ids).toContain('low-handling')   // a genuine weakness still surfaces under the archetype
  })
})

describe('getStatCallouts — archetype precedence & mutual exclusion', () => {
  it('an offroad + low-grip + quick fixture returns arch-dirt, not arch-point-squirt', () => {
    const ids = getStatCallouts(makeCar({
      division: 'Pickups & 4x4s', piClass: 'A', simLateralG120: 0.90, simZeroToSixty: 3.0,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-dirt')
    expect(ids).not.toContain('arch-point-squirt')
  })

  it('a fixture matching both fast-sweeper and top-end-cruiser gates returns only fast-sweeper', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'A', simLateralG60: 1.00, simLateralG120: 1.20,
      simTopSpeed: 215, simZeroToSixty: 3.0, simZeroToHundred: 6.0,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-fast-sweeper')
    expect(ids).not.toContain('arch-top-end')
    expect(ids.filter((id) => id.startsWith('arch-'))).toHaveLength(1)
  })

  it('a point-and-squirt car with mech-oversteer still shows the balance card below the archetype', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'A', simLateralG120: 0.90, simZeroToSixty: 3.0, simMechBalance: 0.65,
    })).map((c) => c.id)
    expect(ids[0]).toBe('arch-point-squirt')
    expect(ids).toContain('mech-oversteer')
  })
})

describe('getStatCallouts — archetype simDataLooksConsistent guard', () => {
  it('blocks point-and-squirt and top-end-cruiser on an inconsistent D-class row', () => {
    // 2.3 lb/hp with a 7.48s 0-60 is physically impossible (Tacoma FE slug-collision shape);
    // every other gate value (grip, quick-enough-for-D, top speed, accel ratio) would otherwise pass.
    const ids = getStatCallouts(makeCar({
      piClass: 'D', weightLb: 2661, powerHp: 1149, simZeroToSixty: 7.48,
      simLateralG120: 0.70, simTopSpeed: 150, simZeroToHundred: 14.0,
    })).map((c) => c.id)
    expect(ids).not.toContain('arch-point-squirt')
    expect(ids).not.toContain('arch-top-end')
  })

  it('blocks heavy-gt on an inconsistent, otherwise-qualifying heavy row', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'D', weightLb: 4000, powerHp: 900, simZeroToSixty: 7.0,
      frontWeight: 55, simLateralG120: 0.80, simTopSpeed: 120,
    })).map((c) => c.id)
    expect(ids).not.toContain('arch-heavy-gt')
  })
})

describe('getStatCallouts — archetype regression: balanced car unchanged', () => {
  it('a car matching no archetype gate returns the v2 list unchanged', () => {
    const ids = getStatCallouts(makeCar({ division: 'Hypercars', piClass: 'S1', statBraking: 6.5 }))
      .map((c) => c.id)
    expect(ids).toEqual(['weak-braking'])
    expect(ids[0]).not.toMatch(/^arch-/)
  })
})

// ─── Fix 8: sanity guard for impossible sim rows ────────────────────────────

describe('getStatCallouts — simDataLooksConsistent guard', () => {
  // 2.3 lb/hp but 7.48s to 60 is physically impossible (Tacoma TRD Pro FE slug-collision case)
  const inconsistent = { weightLb: 2661, powerHp: 1149, simZeroToSixty: 7.48 } as const

  it('suppresses longitudinal callouts for an inconsistent sim row', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'S1', ...inconsistent, simZeroToHundred: 15.0, simTopSpeed: 170,
      drivetrain: 'AWD', division: 'Hypercars', statLaunch: 9.0,
    })).map((c) => c.id)
    expect(ids).not.toContain('sustained-acceleration')
    expect(ids).not.toContain('front-loaded-acceleration')
    expect(ids).not.toContain('low-top-speed')
    expect(ids).not.toContain('drag-candidate')
    expect(ids).not.toContain('strong-acceleration')
    expect(ids).not.toContain('arch-point-squirt')
    expect(ids).not.toContain('arch-top-end')
  })

  it('does not suppress callouts for a consistent sim row', () => {
    const ids = getStatCallouts(makeCar({
      piClass: 'A', weightLb: 3500, powerHp: 500, simZeroToSixty: 3.0,
      simZeroToHundred: 8.0, simTopSpeed: 170,
    })).map((c) => c.id)
    expect(ids).toContain('front-loaded-acceleration')
    expect(ids).toContain('low-top-speed')
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
