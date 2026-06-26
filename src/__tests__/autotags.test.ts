/**
 * Comprehensive unit tests for getAutoTags() — autotag v3.
 *
 * v3 replaced the division+drivetrain system with division base tags + stat
 * gates (see src/lib/autotags.ts):
 *   - Every asphalt road division carries 'grip'; speed-oriented divisions
 *     (hypercar, GT, track, muscle) also carry 'long straights'.
 *   - Rally base is 'dirt, mixed' only — 'offroad' is earned via statOffroad ≥ 7.5.
 *   - AWD and FWD add nothing automatically. RWD adds 'drift' only when the
 *     division is eligible AND (no stats OR statHandling < 7.0).
 *   - Stat gates extend tags: long straights (speed ≥ 8.5), technical (handling
 *     ≥ 7.5), tight (handling ≥ 7.5 on a non-long-straights asphalt car),
 *     offroad (offroad ≥ 7.5), dirt/mixed (asphalt car, offroad ≥ 6.0),
 *     drag (launch ≥ 8 AND accel ≥ 8).
 *
 * Tests use exact Set equality so both missing AND unexpected tags fail.
 */

import { describe, it, expect } from 'vitest'
import { getAutoTags, type AutoTagStats } from '@/lib/autotags'
import { CAR_TAGS } from '@/lib/tags'

// ─── helper ──────────────────────────────────────────────────────────────────

function expectExactTags(
  division: string,
  drivetrain: string | undefined,
  expected: string[],
  stats?: AutoTagStats,
) {
  const tags = getAutoTags(division, drivetrain, stats)
  expect(new Set(tags), `${division} / ${drivetrain ?? 'no drivetrain'}`).toEqual(
    new Set(expected)
  )
}

// ─── Hypercar / Supercar divisions ───────────────────────────────────────────

describe('getAutoTags — hypercars and supercars', () => {
  it('Hypercars → exact: asphalt, grip, long straights', () => {
    expectExactTags('Hypercars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Modern Supercars → exact: asphalt, grip, long straights', () => {
    expectExactTags('Modern Supercars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Retro Supercars → exact: asphalt, grip, long straights', () => {
    expectExactTags('Retro Supercars', undefined, ['asphalt', 'grip', 'long straights'])
  })
})

// ─── Track / GT / Saloon divisions ───────────────────────────────────────────

describe('getAutoTags — track, GT, saloon divisions', () => {
  it('Extreme Track Toys → exact: asphalt, grip, technical, long straights', () => {
    expectExactTags('Extreme Track Toys', undefined, ['asphalt', 'grip', 'technical', 'long straights'])
  })

  it('Track Toys → exact: asphalt, grip, technical, long straights', () => {
    expectExactTags('Track Toys', undefined, ['asphalt', 'grip', 'technical', 'long straights'])
  })

  it('Classic Racers → exact: asphalt, grip, technical, long straights', () => {
    expectExactTags('Classic Racers', undefined, ['asphalt', 'grip', 'technical', 'long straights'])
  })

  it('Retro Racers → exact: asphalt, grip, technical, long straights', () => {
    expectExactTags('Retro Racers', undefined, ['asphalt', 'grip', 'technical', 'long straights'])
  })

  it('Super GT → exact: asphalt, grip, long straights', () => {
    expectExactTags('Super GT', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('GT Cars → exact: asphalt, grip, long straights', () => {
    expectExactTags('GT Cars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Modern Super Saloons → exact: asphalt, grip, street racing', () => {
    expectExactTags('Modern Super Saloons', undefined, ['asphalt', 'grip', 'street racing'])
  })

  it('Retro Super Saloons → exact: asphalt, grip, street racing', () => {
    expectExactTags('Retro Super Saloons', undefined, ['asphalt', 'grip', 'street racing'])
  })

  it('Sports Utility Heroes → exact: asphalt, grip (road-circuit racing in FH6)', () => {
    expectExactTags('Sports Utility Heroes', undefined, ['asphalt', 'grip'])
  })

  it('Sports Utility Heroes does NOT include offroad without supporting stats', () => {
    expect(getAutoTags('Sports Utility Heroes')).not.toContain('offroad')
  })
})

// ─── Sports car divisions ─────────────────────────────────────────────────────

describe('getAutoTags — sports car divisions', () => {
  it('Modern Sports Cars → exact: asphalt, grip, street racing', () => {
    expectExactTags('Modern Sports Cars', undefined, ['asphalt', 'grip', 'street racing'])
  })

  it('Retro Sports Cars → exact: asphalt, grip, street racing', () => {
    expectExactTags('Retro Sports Cars', undefined, ['asphalt', 'grip', 'street racing'])
  })

  it('Classic Sports Cars → exact: asphalt, grip, street racing', () => {
    expectExactTags('Classic Sports Cars', undefined, ['asphalt', 'grip', 'street racing'])
  })
})

// ─── Hot Hatch divisions ──────────────────────────────────────────────────────

describe('getAutoTags — hot hatch divisions', () => {
  it('Hot Hatch → exact: asphalt, grip, tight, street racing', () => {
    expectExactTags('Hot Hatch', undefined, ['asphalt', 'grip', 'tight', 'street racing'])
  })

  it('Super Hot Hatch → exact: asphalt, grip, tight, street racing', () => {
    expectExactTags('Super Hot Hatch', undefined, ['asphalt', 'grip', 'tight', 'street racing'])
  })

  it('Retro Hot Hatch → exact: asphalt, grip, tight, street racing', () => {
    expectExactTags('Retro Hot Hatch', undefined, ['asphalt', 'grip', 'tight', 'street racing'])
  })

  it('all hot hatch variants include street racing tag', () => {
    expect(getAutoTags('Hot Hatch')).toContain('street racing')
    expect(getAutoTags('Super Hot Hatch')).toContain('street racing')
    expect(getAutoTags('Retro Hot Hatch')).toContain('street racing')
  })
})

// ─── Muscle / Drag divisions ──────────────────────────────────────────────────

describe('getAutoTags — muscle and drag divisions', () => {
  it('Classic Muscle → exact: asphalt, drag, long straights', () => {
    expectExactTags('Classic Muscle', undefined, ['asphalt', 'drag', 'long straights'])
  })

  it('Retro Muscle → exact: asphalt, drag, long straights', () => {
    expectExactTags('Retro Muscle', undefined, ['asphalt', 'drag', 'long straights'])
  })

  it('Modern Muscle → exact: asphalt, drag, long straights', () => {
    expectExactTags('Modern Muscle', undefined, ['asphalt', 'drag', 'long straights'])
  })

  it('muscle divisions include drag tag (enables drag-race filter)', () => {
    expect(getAutoTags('Classic Muscle')).toContain('drag')
    expect(getAutoTags('Retro Muscle')).toContain('drag')
    expect(getAutoTags('Modern Muscle')).toContain('drag')
  })

  it('muscle divisions include long straights (v3 — gives Drag a clean score)', () => {
    expect(getAutoTags('Classic Muscle')).toContain('long straights')
    expect(getAutoTags('Modern Muscle')).toContain('long straights')
  })
})

// ─── Rally divisions ──────────────────────────────────────────────────────────

describe('getAutoTags — rally divisions', () => {
  it('Rally Monsters → exact: dirt, mixed (offroad is stat-earned)', () => {
    expectExactTags('Rally Monsters', undefined, ['dirt', 'mixed'])
  })

  it('Modern Rally → exact: dirt, mixed', () => {
    expectExactTags('Modern Rally', undefined, ['dirt', 'mixed'])
  })

  it('Classic Rally → exact: dirt, mixed', () => {
    expectExactTags('Classic Rally', undefined, ['dirt', 'mixed'])
  })

  it('Retro Rally → exact: dirt, mixed', () => {
    expectExactTags('Retro Rally', undefined, ['dirt', 'mixed'])
  })

  it('all rally divisions include dirt + mixed, but NOT offroad without stats', () => {
    for (const d of ['Rally Monsters', 'Modern Rally', 'Classic Rally', 'Retro Rally']) {
      const tags = getAutoTags(d)
      expect(tags, d).toContain('dirt')
      expect(tags, d).toContain('mixed')
      expect(tags, d).not.toContain('offroad')
    }
  })

  it('rally earns offroad only with a high statOffroad (≥ 7.5)', () => {
    // A genuine rally weapon (Quattro S1-class) clears the gate…
    expect(getAutoTags('Rally Monsters', 'AWD', { statOffroad: 8.1 })).toContain('offroad')
    // …a lighter retro/classic rally car does not.
    expect(getAutoTags('Retro Rally', 'AWD', { statOffroad: 5.9 })).not.toContain('offroad')
  })
})

// ─── Off-road divisions ───────────────────────────────────────────────────────

describe('getAutoTags — off-road divisions', () => {
  it('Unlimited Offroad → exact: offroad, mixed, dirt', () => {
    expectExactTags('Unlimited Offroad', undefined, ['offroad', 'mixed', 'dirt'])
  })

  it('Unlimited Buggies → exact: offroad, mixed', () => {
    expectExactTags('Unlimited Buggies', undefined, ['offroad', 'mixed'])
  })

  it('Buggies → exact: offroad, dirt', () => {
    expectExactTags('Buggies', undefined, ['offroad', 'dirt'])
  })

  it('Offroad → exact: offroad, mixed, dirt', () => {
    expectExactTags('Offroad', undefined, ['offroad', 'mixed', 'dirt'])
  })

  it('Pickups & 4x4s → exact: offroad, mixed, dirt, asphalt (also race sealed roads)', () => {
    expectExactTags('Pickups & 4x4s', undefined, ['offroad', 'mixed', 'dirt', 'asphalt'])
  })

  it('UTVs → exact: offroad, dirt', () => {
    expectExactTags('UTVs', undefined, ['offroad', 'dirt'])
  })

  it.each([
    'Unlimited Offroad', 'Unlimited Buggies', 'Buggies', 'Offroad',
    'Pickups & 4x4s', 'UTVs',
  ])('%s includes offroad tag', (d) => {
    expect(getAutoTags(d)).toContain('offroad')
  })

  // Pickups & 4x4s intentionally carries asphalt (truck events on sealed roads);
  // the dedicated off-road divisions do not.
  it.each([
    'Unlimited Offroad', 'Unlimited Buggies', 'Buggies', 'Offroad', 'UTVs',
  ])('%s does not include asphalt', (d) => {
    expect(getAutoTags(d)).not.toContain('asphalt')
  })
})

// ─── Drift divisions ──────────────────────────────────────────────────────────

describe('getAutoTags — drift divisions', () => {
  it('Drift Cars → exact: asphalt, drift', () => {
    expectExactTags('Drift Cars', undefined, ['asphalt', 'drift'])
  })

  it('Formula Drift → exact: asphalt, drift', () => {
    expectExactTags('Formula Drift', undefined, ['asphalt', 'drift'])
  })

  it('Drift Cars includes both asphalt and drift', () => {
    const tags = getAutoTags('Drift Cars')
    expect(tags).toContain('asphalt')
    expect(tags).toContain('drift')
  })

  it('Drift Cars does NOT include tight', () => {
    expect(getAutoTags('Drift Cars')).not.toContain('tight')
  })

  it('Drift Cars does NOT include dirt or offroad', () => {
    const tags = getAutoTags('Drift Cars')
    expect(tags).not.toContain('dirt')
    expect(tags).not.toContain('offroad')
  })
})

// ─── Miscellaneous divisions ──────────────────────────────────────────────────

describe('getAutoTags — miscellaneous divisions', () => {
  it('Rods and Customs → exact: asphalt, grip', () => {
    expectExactTags('Rods and Customs', undefined, ['asphalt', 'grip'])
  })

  it('Cult Cars → exact: asphalt, grip', () => {
    expectExactTags('Cult Cars', undefined, ['asphalt', 'grip'])
  })

  it('Eclectic Domestics → exact: asphalt', () => {
    expectExactTags('Eclectic Domestics', undefined, ['asphalt'])
  })

  it('Rare Classics → exact: asphalt, grip', () => {
    expectExactTags('Rare Classics', undefined, ['asphalt', 'grip'])
  })

  it('Utility Heroes → exact: asphalt', () => {
    expectExactTags('Utility Heroes', undefined, ['asphalt'])
  })
})

// ─── All 37 live DB divisions are covered ────────────────────────────────────

describe('getAutoTags — full DB division coverage', () => {
  // Every division in the Car table must return at least one tag.
  // Unknown divisions return ["asphalt"] as a safe default, so this also
  // verifies the fallback path works.
  const ALL_DB_DIVISIONS = [
    'Buggies', 'Classic Muscle', 'Classic Racers', 'Classic Rally',
    'Classic Sports Cars', 'Cult Cars', 'Drift Cars', 'Eclectic Domestics',
    'Extreme Track Toys', 'GT Cars', 'Hot Hatch', 'Hypercars',
    'Modern Muscle', 'Modern Rally', 'Modern Sports Cars',
    'Modern Super Saloons', 'Modern Supercars', 'Offroad',
    'Pickups & 4x4s', 'Rally Monsters', 'Rare Classics',
    'Retro Hot Hatch', 'Retro Muscle', 'Retro Racers', 'Retro Rally',
    'Retro Sports Cars', 'Retro Super Saloons', 'Retro Supercars',
    'Rods and Customs', 'Sports Utility Heroes', 'Super GT',
    'Super Hot Hatch', 'Track Toys', 'UTVs', 'Unlimited Buggies',
    'Unlimited Offroad', 'Utility Heroes',
  ]

  it.each(ALL_DB_DIVISIONS)(
    '%s returns at least one tag',
    (division) => {
      expect(getAutoTags(division).length).toBeGreaterThan(0)
    }
  )
})

// ─── Unknown division safe default ───────────────────────────────────────────

describe('getAutoTags — unknown division safe default', () => {
  it('unknown division returns ["asphalt"] instead of []', () => {
    expectExactTags('Unknown Division', undefined, ['asphalt'])
  })

  it('unknown division with AWD: still just asphalt (AWD adds nothing in v3)', () => {
    const tags = getAutoTags('Unknown Division', 'AWD')
    expect(tags).toContain('asphalt')
    expect(tags).not.toContain('dirt')
    expect(tags).not.toContain('offroad')
  })

  it('unknown division with RWD: asphalt + drift (eligible, no handling stat)', () => {
    expectExactTags('Unknown Division', 'RWD', ['asphalt', 'drift'])
  })
})

// ─── Drivetrain modifier cases ────────────────────────────────────────────────

describe('getAutoTags — AWD drivetrain', () => {
  it('AWD on a tarmac division adds nothing — stays on the division base', () => {
    const tags = getAutoTags('Modern Sports Cars', 'AWD')
    expect(tags).not.toContain('dirt')
    expect(tags).not.toContain('offroad')
    expect(new Set(tags)).toEqual(new Set(getAutoTags('Modern Sports Cars', undefined)))
  })

  it('AWD on a muscle car adds nothing (no blind dirt/offroad)', () => {
    const tags = getAutoTags('Modern Muscle', 'AWD')
    expect(tags).not.toContain('dirt')
    expect(tags).not.toContain('offroad')
  })

  it('AWD on a rally car: dirt + mixed from the base, no duplicates, no offroad', () => {
    const tags = getAutoTags('Modern Rally', 'AWD')
    expect(tags.filter((t) => t === 'dirt')).toHaveLength(1)
    expect(tags).toContain('mixed')
    expect(tags).not.toContain('offroad')
  })

  it('AWD on an off-road car: offroad and dirt from the base, not duplicated', () => {
    const tags = getAutoTags('Offroad', 'AWD')
    expect(tags.filter((t) => t === 'offroad')).toHaveLength(1)
    expect(tags.filter((t) => t === 'dirt')).toHaveLength(1)
  })
})

describe('getAutoTags — RWD drivetrain', () => {
  it('RWD adds drift on an eligible tarmac division', () => {
    expect(getAutoTags('Modern Sports Cars', 'RWD')).toContain('drift')
  })

  it('RWD on a tarmac car does NOT add dirt', () => {
    expect(getAutoTags('Modern Sports Cars', 'RWD')).not.toContain('dirt')
  })

  it('RWD on a tarmac car does NOT add offroad', () => {
    expect(getAutoTags('Modern Sports Cars', 'RWD')).not.toContain('offroad')
  })

  it('RWD on Hypercars → exact: asphalt, grip, long straights (excluded from drift)', () => {
    expectExactTags('Hypercars', 'RWD', ['asphalt', 'grip', 'long straights'])
  })

  it('RWD on Classic Muscle → exact: asphalt, drag, long straights, drift', () => {
    expectExactTags('Classic Muscle', 'RWD', ['asphalt', 'drag', 'long straights', 'drift'])
  })

  it('high-handling RWD car (≥ 7.0) is a grip racer — no auto drift', () => {
    const tags = getAutoTags('Modern Sports Cars', 'RWD', { statHandling: 8.0 })
    expect(tags).not.toContain('drift')
  })
})

describe('getAutoTags — FWD drivetrain', () => {
  it('FWD adds nothing — division base is unchanged', () => {
    const tags = getAutoTags('GT Cars', 'FWD')
    expect(new Set(tags)).toEqual(new Set(getAutoTags('GT Cars', undefined)))
  })

  it('FWD on Hot Hatch: tight and street racing come from the base, not duplicated', () => {
    const tags = getAutoTags('Hot Hatch', 'FWD')
    expect(tags.filter((t) => t === 'tight')).toHaveLength(1)
    expect(tags.filter((t) => t === 'street racing')).toHaveLength(1)
  })

  it('FWD does not add drift, dirt, or offroad', () => {
    const tags = getAutoTags('Modern Sports Cars', 'FWD')
    expect(tags).not.toContain('drift')
    expect(tags).not.toContain('dirt')
    expect(tags).not.toContain('offroad')
  })
})

// ─── Stat-gated extensions (v3) ───────────────────────────────────────────────

describe('getAutoTags — stat gates', () => {
  it('statOffroad ≥ 6.0 on an asphalt car earns dirt + mixed (e.g. a Cayenne SUV)', () => {
    expectExactTags('Sports Utility Heroes', undefined, ['asphalt', 'grip', 'dirt', 'mixed'], {
      statOffroad: 6.3,
    })
  })

  it('statOffroad ≥ 7.5 earns the offroad tag', () => {
    expect(getAutoTags('Sports Utility Heroes', undefined, { statOffroad: 7.8 })).toContain('offroad')
  })

  it('statSpeed ≥ 8.5 earns long straights on a division that lacks it', () => {
    const tags = getAutoTags('Modern Sports Cars', undefined, { statSpeed: 9.0 })
    expect(tags).toContain('long straights')
  })

  it('statHandling ≥ 7.5 earns technical', () => {
    expect(getAutoTags('Modern Sports Cars', undefined, { statHandling: 7.8 })).toContain('technical')
  })

  it('launch + acceleration ≥ 8 earns drag on a non-muscle division', () => {
    const tags = getAutoTags('Modern Sports Cars', undefined, {
      statLaunch: 8.4, statAcceleration: 8.3,
    })
    expect(tags).toContain('drag')
  })

  it('all-null stats behave the same as no stats (division-only)', () => {
    const withNulls = getAutoTags('Modern Sports Cars', 'RWD', {
      statSpeed: null, statHandling: null, statAcceleration: null,
      statLaunch: null, statBraking: null, statOffroad: null,
    })
    expect(new Set(withNulls)).toEqual(new Set(getAutoTags('Modern Sports Cars', 'RWD')))
  })
})

// ─── Null / undefined drivetrain edge cases ───────────────────────────────────

describe('getAutoTags — null / undefined drivetrain', () => {
  it('undefined drivetrain does not throw', () => {
    expect(() => getAutoTags('Hypercars', undefined)).not.toThrow()
  })

  it('null drivetrain is accepted and returns division tags only', () => {
    const tags = getAutoTags('Modern Rally', null)
    expect(tags).toEqual(getAutoTags('Modern Rally', undefined))
  })

  it('empty string drivetrain returns only division tags (unknown drivetrain)', () => {
    const withEmpty = getAutoTags('Modern Sports Cars', '')
    const withUndefined = getAutoTags('Modern Sports Cars', undefined)
    expect(new Set(withEmpty)).toEqual(new Set(withUndefined))
  })
})

// ─── Output quality ───────────────────────────────────────────────────────────

describe('getAutoTags — output quality', () => {
  it('never returns duplicate tags (rally + AWD dedup check)', () => {
    const tags = getAutoTags('Rally Monsters', 'AWD')
    expect(tags.length).toBe(new Set(tags).size)
  })

  it('never returns duplicate tags (hot hatch + FWD dedup check)', () => {
    const tags = getAutoTags('Hot Hatch', 'FWD')
    expect(tags.length).toBe(new Set(tags).size)
  })

  it('all returned tags are valid CAR_TAGS values (safety filter)', () => {
    const testCases = [
      ['Hypercars', 'RWD'], ['Modern Rally', undefined], ['Drift Cars', undefined],
      ['Rally Monsters', 'AWD'], ['Offroad', 'AWD'], ['Hot Hatch', 'FWD'],
      ['Utility Heroes', undefined],
    ] as const
    for (const [div, drive] of testCases) {
      const tags = getAutoTags(div, drive as string | undefined)
      expect(tags.every((t) => CAR_TAGS.includes(t as typeof CAR_TAGS[number]))).toBe(true)
    }
  })

  it('returns an array, never null or undefined', () => {
    expect(getAutoTags('Unknown', undefined)).toBeInstanceOf(Array)
    expect(getAutoTags('Hypercars', 'RWD')).toBeInstanceOf(Array)
  })
})

// ─── Race filter integration — key scenarios ─────────────────────────────────

describe('getAutoTags — race filter integration', () => {
  it('dirt filter returns rally divisions (rally base carries dirt)', () => {
    expect(getAutoTags('Modern Rally')).toContain('dirt')
    expect(getAutoTags('Classic Rally')).toContain('dirt')
    expect(getAutoTags('Rally Monsters')).toContain('dirt')
  })

  it('AWD no longer forces dirt — a tarmac AWD car stays on asphalt', () => {
    expect(getAutoTags('Hot Hatch', 'AWD')).not.toContain('dirt')
    expect(getAutoTags('Hypercars', 'AWD')).not.toContain('dirt')
  })

  it('drag filter returns muscle cars', () => {
    expect(getAutoTags('Classic Muscle')).toContain('drag')
    expect(getAutoTags('Retro Muscle')).toContain('drag')
    expect(getAutoTags('Modern Muscle')).toContain('drag')
  })

  it('street racing filter returns sports/hatch divisions', () => {
    expect(getAutoTags('Hot Hatch')).toContain('street racing')
    expect(getAutoTags('Modern Sports Cars')).toContain('street racing')
    expect(getAutoTags('Retro Sports Cars')).toContain('street racing')
  })

  it('drift filter returns Drift Cars', () => {
    expect(getAutoTags('Drift Cars')).toContain('drift')
  })
})

// ─── Legacy key aliases ───────────────────────────────────────────────────────

describe('getAutoTags — legacy key aliases', () => {
  it("Pickups & 4x4's (legacy apostrophe) returns offroad, mixed, dirt", () => {
    const tags = getAutoTags("Pickups & 4x4's")
    expect(tags).toContain('offroad')
    expect(tags).toContain('mixed')
    expect(tags).toContain('dirt')
  })

  it("UTV's (legacy apostrophe) returns offroad, dirt", () => {
    const tags = getAutoTags("UTV's")
    expect(tags).toContain('offroad')
    expect(tags).toContain('dirt')
  })
})
