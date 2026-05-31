import { describe, it, expect } from 'vitest'
import { getStatCallouts } from '@/lib/statCallouts'
import type { Car } from '@/types/car'

// Minimal car with all stat fields null — override per test
const makeCar = (overrides: Partial<Car> = {}): Car => ({
  id: 1,
  make: 'Ford',
  model: 'GT',
  year: 2020,
  division: 'Super Cars',
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
  value: null,
  rarity: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
  ...overrides,
})

// ─── No stats ─────────────────────────────────────────────────────────────────

describe('getStatCallouts — no stats', () => {
  it('returns an empty array when all stat fields are null', () => {
    expect(getStatCallouts(makeCar())).toHaveLength(0)
  })
})

// ─── Rule 1: weak-braking ─────────────────────────────────────────────────────

describe('getStatCallouts — weak-braking rule', () => {
  it('fires when statBraking is below 6.0', () => {
    const ids = getStatCallouts(makeCar({ statBraking: 5.9 })).map((c) => c.id)
    expect(ids).toContain('weak-braking')
  })

  it('does not fire when statBraking is exactly 6.0', () => {
    const ids = getStatCallouts(makeCar({ statBraking: 6.0 })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  it('does not fire when statBraking is above 6.0', () => {
    const ids = getStatCallouts(makeCar({ statBraking: 7.5 })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  it('does not fire when statBraking is null', () => {
    const ids = getStatCallouts(makeCar({ statBraking: null })).map((c) => c.id)
    expect(ids).not.toContain('weak-braking')
  })

  it('includes the stat value in the callout body', () => {
    const callout = getStatCallouts(makeCar({ statBraking: 4.5 })).find((c) => c.id === 'weak-braking')!
    expect(callout.body).toContain('4.5')
  })
})

// ─── Rule 2: low-handling ─────────────────────────────────────────────────────

describe('getStatCallouts — low-handling rule', () => {
  it('fires when statHandling is below 5.5', () => {
    const ids = getStatCallouts(makeCar({ statHandling: 5.4 })).map((c) => c.id)
    expect(ids).toContain('low-handling')
  })

  it('does not fire when statHandling is exactly 5.5', () => {
    const ids = getStatCallouts(makeCar({ statHandling: 5.5 })).map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })

  it('does not fire when statHandling is null', () => {
    const ids = getStatCallouts(makeCar({ statHandling: null })).map((c) => c.id)
    expect(ids).not.toContain('low-handling')
  })

  it('includes the stat value in the callout body', () => {
    const callout = getStatCallouts(makeCar({ statHandling: 3.2 })).find((c) => c.id === 'low-handling')!
    expect(callout.body).toContain('3.2')
  })
})

// ─── Rule 3: rwd-rear-heavy ──────────────────────────────────────────────────

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
})

// ─── Rule 4: fwd-front-heavy ───────────────────────────────────────────────────

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

describe('getStatCallouts — launch-braking-mismatch rule', () => {
  it('fires when statLaunch > 7.5 AND statBraking < 6.0', () => {
    const ids = getStatCallouts(makeCar({ statLaunch: 7.6, statBraking: 5.9 })).map((c) => c.id)
    expect(ids).toContain('launch-braking-mismatch')
  })

  it('does not fire when only launch is high (braking is fine)', () => {
    const ids = getStatCallouts(makeCar({ statLaunch: 8.5, statBraking: 6.5 })).map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when only braking is weak (launch is moderate)', () => {
    const ids = getStatCallouts(makeCar({ statLaunch: 5.0, statBraking: 4.0 })).map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when both are exactly at their thresholds (7.5 / 6.0)', () => {
    const ids = getStatCallouts(makeCar({ statLaunch: 7.5, statBraking: 6.0 })).map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when statLaunch is null', () => {
    const ids = getStatCallouts(makeCar({ statLaunch: null, statBraking: 4.0 })).map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('does not fire when statBraking is null', () => {
    const ids = getStatCallouts(makeCar({ statLaunch: 9.0, statBraking: null })).map((c) => c.id)
    expect(ids).not.toContain('launch-braking-mismatch')
  })

  it('includes both stat values in the callout body', () => {
    const callout = getStatCallouts(makeCar({ statLaunch: 8.2, statBraking: 4.8 }))
      .find((c) => c.id === 'launch-braking-mismatch')!
    expect(callout.body).toContain('8.2')
    expect(callout.body).toContain('4.8')
  })
})

// ─── Rule 6: low-offroad ──────────────────────────────────────────────────────

describe('getStatCallouts — low-offroad rule', () => {
  it('fires when statOffroad is below 5.0', () => {
    const ids = getStatCallouts(makeCar({ statOffroad: 4.9 })).map((c) => c.id)
    expect(ids).toContain('low-offroad')
  })

  it('does not fire when statOffroad is exactly 5.0', () => {
    const ids = getStatCallouts(makeCar({ statOffroad: 5.0 })).map((c) => c.id)
    expect(ids).not.toContain('low-offroad')
  })

  it('does not fire when statOffroad is null', () => {
    const ids = getStatCallouts(makeCar({ statOffroad: null })).map((c) => c.id)
    expect(ids).not.toContain('low-offroad')
  })

  it('includes the stat value in the callout body', () => {
    const callout = getStatCallouts(makeCar({ statOffroad: 2.1 })).find((c) => c.id === 'low-offroad')!
    expect(callout.body).toContain('2.1')
  })
})

// ─── Rule 7 — touge-damping ───────────────────────────────────────────────────

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

describe('getStatCallouts — power-handling-gap rule', () => {
  it('fires when powerHp > 450 and statHandling < 6.0', () => {
    const ids = getStatCallouts(makeCar({ powerHp: 451, statHandling: 5.9 })).map((c) => c.id)
    expect(ids).toContain('power-handling-gap')
  })

  it('does not fire when powerHp is exactly 450', () => {
    const ids = getStatCallouts(makeCar({ powerHp: 450, statHandling: 5.0 })).map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('does not fire when statHandling is exactly 6.0', () => {
    const ids = getStatCallouts(makeCar({ powerHp: 600, statHandling: 6.0 })).map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('does not fire when powerHp is null', () => {
    const ids = getStatCallouts(makeCar({ powerHp: null, statHandling: 4.0 })).map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('does not fire when statHandling is null', () => {
    const ids = getStatCallouts(makeCar({ powerHp: 600, statHandling: null })).map((c) => c.id)
    expect(ids).not.toContain('power-handling-gap')
  })

  it('callout body mentions power and handling', () => {
    const callout = getStatCallouts(makeCar({ powerHp: 520, statHandling: 4.5 }))
      .find((c) => c.id === 'power-handling-gap')!
    expect(callout).toBeDefined()
    expect(callout.body).toMatch(/520hp/i)
    expect(callout.body).toMatch(/4\.5/)
  })
})

// ─── Multiple callouts ────────────────────────────────────────────────────────

describe('getStatCallouts — multiple rules', () => {
  it('can return several callouts simultaneously', () => {
    const callouts = getStatCallouts(makeCar({
      statBraking: 4.0,   // weak-braking
      statHandling: 3.0,  // low-handling
      statOffroad: 2.0,   // low-offroad
    }))
    const ids = callouts.map((c) => c.id)
    expect(ids).toContain('weak-braking')
    expect(ids).toContain('low-handling')
    expect(ids).toContain('low-offroad')
    expect(callouts.length).toBeGreaterThanOrEqual(3)
  })

  it('weak-braking and launch-braking-mismatch can both fire for the same car', () => {
    const callouts = getStatCallouts(makeCar({ statLaunch: 9.0, statBraking: 3.0 }))
    const ids = callouts.map((c) => c.id)
    expect(ids).toContain('weak-braking')
    expect(ids).toContain('launch-braking-mismatch')
  })
})
