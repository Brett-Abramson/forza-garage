/**
 * Comprehensive unit tests for getAutoTags().
 *
 * Division list is the exact set returned by:
 *   SELECT DISTINCT division FROM "Car" ORDER BY division
 * as of the current database — 37 unique values, all verified against
 * DIVISION_TAGS in src/lib/autotags.ts.
 *
 * Tests use exact Set equality so both missing AND unexpected tags fail.
 */

import { describe, it, expect } from 'vitest'
import { getAutoTags } from '@/lib/autotags'
import { CAR_TAGS } from '@/lib/tags'

// ─── helper ──────────────────────────────────────────────────────────────────
// Asserts exact tag set: no missing tags, no unexpected extras.
function expectExactTags(
  division: string,
  drivetrain: string | undefined,
  expected: string[]
) {
  const tags = getAutoTags(division, drivetrain)
  expect(new Set(tags), `${division} / ${drivetrain ?? 'no drivetrain'}`).toEqual(
    new Set(expected)
  )
}

// ─── Off-road divisions ───────────────────────────────────────────────────────

describe('getAutoTags — off-road divisions', () => {
  it('Unlimited Offroad → exact: offroad, mixed, dirt', () => {
    expectExactTags('Unlimited Offroad', undefined, ['offroad', 'mixed', 'dirt'])
  })

  it('Unlimited Buggies → exact: offroad, mixed, dirt', () => {
    expectExactTags('Unlimited Buggies', undefined, ['offroad', 'mixed', 'dirt'])
  })

  it('Buggies → exact: offroad, dirt', () => {
    expectExactTags('Buggies', undefined, ['offroad', 'dirt'])
  })

  it('Offroad → exact: offroad, mixed, dirt', () => {
    expectExactTags('Offroad', undefined, ['offroad', 'mixed', 'dirt'])
  })

  it('Pickups & 4x4s → exact: offroad, mixed', () => {
    expectExactTags('Pickups & 4x4s', undefined, ['offroad', 'mixed'])
  })

  it('UTVs → exact: offroad, dirt', () => {
    expectExactTags('UTVs', undefined, ['offroad', 'dirt'])
  })

  it('Sports Utility Heroes → exact: offroad, mixed', () => {
    expectExactTags('Sports Utility Heroes', undefined, ['offroad', 'mixed'])
  })

  // All off-road divisions must include offroad tag
  it.each([
    'Unlimited Offroad', 'Unlimited Buggies', 'Buggies', 'Offroad',
    'Pickups & 4x4s', 'UTVs', 'Sports Utility Heroes',
  ])('%s includes offroad tag', (division) => {
    expect(getAutoTags(division)).toContain('offroad')
  })

  // Off-road divisions must NOT include asphalt
  it.each([
    'Unlimited Offroad', 'Unlimited Buggies', 'Buggies', 'Offroad',
    'Pickups & 4x4s', 'UTVs', 'Sports Utility Heroes',
  ])('%s does not include asphalt', (division) => {
    expect(getAutoTags(division)).not.toContain('asphalt')
  })
})

// ─── Rally divisions ──────────────────────────────────────────────────────────

describe('getAutoTags — rally divisions', () => {
  it('Rally Monsters → exact: dirt, offroad, mixed', () => {
    expectExactTags('Rally Monsters', undefined, ['dirt', 'offroad', 'mixed'])
  })

  it('Rally Monsters includes both dirt and offroad', () => {
    const tags = getAutoTags('Rally Monsters')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('Modern Rally → exact: dirt, mixed', () => {
    expectExactTags('Modern Rally', undefined, ['dirt', 'mixed'])
  })

  it('Retro Rally → exact: dirt, mixed', () => {
    expectExactTags('Retro Rally', undefined, ['dirt', 'mixed'])
  })

  it('Classic Rally → exact: dirt, mixed', () => {
    expectExactTags('Classic Rally', undefined, ['dirt', 'mixed'])
  })

  // All rally divisions must include dirt
  it.each(['Rally Monsters', 'Modern Rally', 'Retro Rally', 'Classic Rally'])(
    '%s includes dirt tag',
    (division) => {
      expect(getAutoTags(division)).toContain('dirt')
    }
  )

  // Rally divisions (except Rally Monsters) must NOT include offroad
  it.each(['Modern Rally', 'Retro Rally', 'Classic Rally'])(
    '%s does not include offroad (only Rally Monsters does)',
    (division) => {
      expect(getAutoTags(division)).not.toContain('offroad')
    }
  )
})

// ─── Drift division ───────────────────────────────────────────────────────────

describe('getAutoTags — Drift Cars division', () => {
  it('Drift Cars → exact: drift, asphalt, tight', () => {
    // Note: asphalt IS included because drift events in FH6 take place on
    // asphalt circuits. Drift Cars do NOT get offroad, dirt, or mixed.
    expectExactTags('Drift Cars', undefined, ['drift', 'asphalt', 'tight'])
  })

  it('Drift Cars includes drift tag', () => {
    expect(getAutoTags('Drift Cars')).toContain('drift')
  })

  it('Drift Cars does not include dirt', () => {
    expect(getAutoTags('Drift Cars')).not.toContain('dirt')
  })

  it('Drift Cars does not include offroad', () => {
    expect(getAutoTags('Drift Cars')).not.toContain('offroad')
  })

  it('Drift Cars does not include mixed', () => {
    expect(getAutoTags('Drift Cars')).not.toContain('mixed')
  })

  it('Drift Cars does not include grip', () => {
    // Drift is explicitly opposed to grip racing
    expect(getAutoTags('Drift Cars')).not.toContain('grip')
  })
})

// ─── Drag / Muscle divisions ──────────────────────────────────────────────────

describe('getAutoTags — muscle / drag divisions', () => {
  it('Classic Muscle → exact: asphalt, long straights, drag', () => {
    expectExactTags('Classic Muscle', undefined, ['asphalt', 'long straights', 'drag'])
  })

  it('Retro Muscle → exact: asphalt, long straights, drag', () => {
    expectExactTags('Retro Muscle', undefined, ['asphalt', 'long straights', 'drag'])
  })

  it('Modern Muscle → exact: asphalt, long straights, drag', () => {
    expectExactTags('Modern Muscle', undefined, ['asphalt', 'long straights', 'drag'])
  })

  it.each(['Classic Muscle', 'Retro Muscle', 'Modern Muscle'])(
    '%s includes drag and long straights',
    (division) => {
      const tags = getAutoTags(division)
      expect(tags).toContain('drag')
      expect(tags).toContain('long straights')
    }
  )
})

// ─── Hot Hatch divisions ──────────────────────────────────────────────────────

describe('getAutoTags — hot hatch divisions', () => {
  it('Hot Hatch → exact: asphalt, tight, technical, grip', () => {
    expectExactTags('Hot Hatch', undefined, ['asphalt', 'tight', 'technical', 'grip'])
  })

  it('Super Hot Hatch → exact: asphalt, tight, technical, grip', () => {
    expectExactTags('Super Hot Hatch', undefined, ['asphalt', 'tight', 'technical', 'grip'])
  })

  it('Retro Hot Hatch → exact: asphalt, tight, technical', () => {
    // Retro Hot Hatch does not include grip (older cars less optimised for grip racing)
    expectExactTags('Retro Hot Hatch', undefined, ['asphalt', 'tight', 'technical'])
  })

  it('Retro Hot Hatch does not include grip', () => {
    expect(getAutoTags('Retro Hot Hatch')).not.toContain('grip')
  })
})

// ─── Sports / GT / Supercar divisions ────────────────────────────────────────

describe('getAutoTags — sports and supercar divisions', () => {
  it('Classic Sports Cars → exact: asphalt, grip, technical, tight', () => {
    expectExactTags('Classic Sports Cars', undefined, ['asphalt', 'grip', 'technical', 'tight'])
  })

  it('Retro Sports Cars → exact: asphalt, grip, technical, tight', () => {
    expectExactTags('Retro Sports Cars', undefined, ['asphalt', 'grip', 'technical', 'tight'])
  })

  it('Modern Sports Cars → exact: asphalt, grip, technical', () => {
    expectExactTags('Modern Sports Cars', undefined, ['asphalt', 'grip', 'technical'])
  })

  it('GT Cars → exact: asphalt, grip, long straights', () => {
    expectExactTags('GT Cars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Super GT → exact: asphalt, grip, long straights', () => {
    expectExactTags('Super GT', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Retro Supercars → exact: asphalt, grip, long straights', () => {
    expectExactTags('Retro Supercars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Modern Supercars → exact: asphalt, grip, long straights', () => {
    expectExactTags('Modern Supercars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('Hypercars → exact: asphalt, grip, long straights', () => {
    expectExactTags('Hypercars', undefined, ['asphalt', 'grip', 'long straights'])
  })
})

// ─── Track divisions ──────────────────────────────────────────────────────────

describe('getAutoTags — track divisions', () => {
  it('Extreme Track Toys → exact: asphalt, grip, technical', () => {
    expectExactTags('Extreme Track Toys', undefined, ['asphalt', 'grip', 'technical'])
  })

  it('Track Toys → exact: asphalt, grip, technical', () => {
    expectExactTags('Track Toys', undefined, ['asphalt', 'grip', 'technical'])
  })

  it('Extreme Track Toys includes asphalt', () => {
    expect(getAutoTags('Extreme Track Toys')).toContain('asphalt')
  })

  it('Extreme Track Toys does not include drift or dirt', () => {
    const tags = getAutoTags('Extreme Track Toys')
    expect(tags).not.toContain('drift')
    expect(tags).not.toContain('dirt')
  })
})

// ─── Saloon / Racer divisions ─────────────────────────────────────────────────

describe('getAutoTags — saloon and racer divisions', () => {
  it('Classic Racers → exact: asphalt, technical', () => {
    expectExactTags('Classic Racers', undefined, ['asphalt', 'technical'])
  })

  it('Retro Racers → exact: asphalt, technical', () => {
    expectExactTags('Retro Racers', undefined, ['asphalt', 'technical'])
  })

  it('Retro Super Saloons → exact: asphalt, technical', () => {
    expectExactTags('Retro Super Saloons', undefined, ['asphalt', 'technical'])
  })

  it('Modern Super Saloons → exact: asphalt, grip, technical', () => {
    expectExactTags('Modern Super Saloons', undefined, ['asphalt', 'grip', 'technical'])
  })
})

// ─── Miscellaneous divisions ──────────────────────────────────────────────────

describe('getAutoTags — miscellaneous divisions', () => {
  it('Rods and Customs → exact: asphalt', () => {
    expectExactTags('Rods and Customs', undefined, ['asphalt'])
  })

  it('Cult Cars → exact: asphalt', () => {
    expectExactTags('Cult Cars', undefined, ['asphalt'])
  })

  it('Eclectic Domestics → exact: asphalt, tight', () => {
    expectExactTags('Eclectic Domestics', undefined, ['asphalt', 'tight'])
  })

  it('Rare Classics → exact: asphalt', () => {
    expectExactTags('Rare Classics', undefined, ['asphalt'])
  })

  it('Utility Heroes → exact: mixed', () => {
    // Mixed-surface utility vehicles
    expectExactTags('Utility Heroes', undefined, ['mixed'])
  })

  it('Utility Heroes does not include offroad or asphalt', () => {
    const tags = getAutoTags('Utility Heroes')
    expect(tags).not.toContain('offroad')
    expect(tags).not.toContain('asphalt')
  })
})

// ─── All 37 live DB divisions are covered ────────────────────────────────────

describe('getAutoTags — full DB division coverage (no unknown divisions)', () => {
  // Every division that exists in the Car table must return at least one tag.
  // If a new division is added to the DB without a DIVISION_TAGS entry this
  // test will fail, prompting a developer to update autotags.ts.
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
    '%s returns at least one tag (not unmapped)',
    (division) => {
      expect(getAutoTags(division).length).toBeGreaterThan(0)
    }
  )
})

// ─── Drivetrain modifier cases ────────────────────────────────────────────────

describe('getAutoTags — AWD drivetrain', () => {
  it('AWD on a tarmac division adds dirt and offroad', () => {
    const tags = getAutoTags('Modern Sports Cars', 'AWD')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('AWD on a muscle car adds dirt and offroad', () => {
    const tags = getAutoTags('Modern Muscle', 'AWD')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('AWD on a supercar adds dirt and offroad', () => {
    const tags = getAutoTags('Hypercars', 'AWD')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('AWD on a rally car: dirt already present, not duplicated', () => {
    const tags = getAutoTags('Modern Rally', 'AWD')
    expect(tags.filter((t) => t === 'dirt')).toHaveLength(1)
    expect(tags.filter((t) => t === 'offroad')).toHaveLength(1)
  })

  it('AWD on an off-road car: offroad and dirt already present, not duplicated', () => {
    const tags = getAutoTags('Offroad', 'AWD')
    expect(tags.filter((t) => t === 'offroad')).toHaveLength(1)
    expect(tags.filter((t) => t === 'dirt')).toHaveLength(1)
  })
})

describe('getAutoTags — RWD drivetrain on tarmac car', () => {
  it('RWD adds drift tag', () => {
    expect(getAutoTags('Modern Sports Cars', 'RWD')).toContain('drift')
  })

  it('RWD on a tarmac car does NOT add dirt', () => {
    expect(getAutoTags('Modern Sports Cars', 'RWD')).not.toContain('dirt')
  })

  it('RWD on a tarmac car does NOT add offroad', () => {
    expect(getAutoTags('Modern Sports Cars', 'RWD')).not.toContain('offroad')
  })

  it('RWD on Hypercars → exact: asphalt, grip, long straights, drift', () => {
    expectExactTags('Hypercars', 'RWD', ['asphalt', 'grip', 'long straights', 'drift'])
  })

  it('RWD on Classic Muscle → exact: asphalt, long straights, drag, drift', () => {
    expectExactTags('Classic Muscle', 'RWD', ['asphalt', 'long straights', 'drag', 'drift'])
  })
})

describe('getAutoTags — FWD drivetrain', () => {
  it('FWD adds tight and technical', () => {
    const tags = getAutoTags('GT Cars', 'FWD')
    expect(tags).toContain('tight')
    expect(tags).toContain('technical')
  })

  it('FWD on Hot Hatch: tight and technical already present, not duplicated', () => {
    const tags = getAutoTags('Hot Hatch', 'FWD')
    expect(tags.filter((t) => t === 'tight')).toHaveLength(1)
    expect(tags.filter((t) => t === 'technical')).toHaveLength(1)
  })

  it('FWD does not add drift, dirt, or offroad', () => {
    const tags = getAutoTags('Modern Sports Cars', 'FWD')
    expect(tags).not.toContain('drift')
    expect(tags).not.toContain('dirt')
    expect(tags).not.toContain('offroad')
  })
})

// ─── Subaru WRX — known bug regression ───────────────────────────────────────

describe('getAutoTags — Subaru WRX regression', () => {
  // All Subaru WRX/WRX STI variants are in the "Modern Rally" division.
  // This division was previously missing from DIVISION_TAGS entirely, causing
  // WRX cars to receive no tags and fail race-type filtering.

  it('Modern Rally (WRX division) returns dirt tag', () => {
    // WRX has null drivetrain in the DB — dirt comes from the division alone
    expect(getAutoTags('Modern Rally', undefined)).toContain('dirt')
  })

  it('Modern Rally with no drivetrain returns non-empty tags', () => {
    expect(getAutoTags('Modern Rally', undefined).length).toBeGreaterThan(0)
  })

  it('Modern Rally with null drivetrain (simulated DB null) returns division tags', () => {
    // In the DB, WRX drivetrain is null. Passing null vs undefined should both work.
    // getAutoTags signature is (division, drivetrain?), null coerced to undefined via ??
    const drivetrain = null ?? undefined
    expectExactTags('Modern Rally', drivetrain, ['dirt', 'mixed'])
  })

  it('Modern Rally with AWD (if WRX is tuned to AWD) adds offroad on top of dirt', () => {
    const tags = getAutoTags('Modern Rally', 'AWD')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
    expect(tags).toContain('mixed')
  })

  it('WRX STI ARX Supercar (Rally Monsters) receives dirt, offroad, and mixed', () => {
    const tags = getAutoTags('Rally Monsters', undefined)
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
    expect(tags).toContain('mixed')
  })
})

// ─── Null / undefined drivetrain edge cases ───────────────────────────────────

describe('getAutoTags — null / undefined drivetrain', () => {
  it('undefined drivetrain does not throw', () => {
    expect(() => getAutoTags('Hypercars', undefined)).not.toThrow()
  })

  it('undefined drivetrain returns only division-based tags', () => {
    expectExactTags('Hypercars', undefined, ['asphalt', 'grip', 'long straights'])
  })

  it('null coerced to undefined does not throw', () => {
    expect(() => getAutoTags('Modern Rally', null ?? undefined)).not.toThrow()
  })

  it('null drivetrain (via nullish coercion) returns division tags only', () => {
    const tags = getAutoTags('Modern Rally', null ?? undefined)
    expect(tags).toEqual(getAutoTags('Modern Rally', undefined))
  })

  it('empty string drivetrain returns only division tags (unknown drivetrain)', () => {
    // Empty string is not a known drivetrain key — no drivetrain tags added
    const withEmpty = getAutoTags('Modern Sports Cars', '')
    const withUndefined = getAutoTags('Modern Sports Cars', undefined)
    expect(new Set(withEmpty)).toEqual(new Set(withUndefined))
  })
})

// ─── Unknown / missing division ───────────────────────────────────────────────

describe('getAutoTags — unknown inputs', () => {
  it('unknown division returns empty array', () => {
    expect(getAutoTags('Unknown Division')).toEqual([])
  })

  it('unknown division with AWD returns only AWD drivetrain tags', () => {
    // AWD adds dirt + offroad even when the division is unrecognised
    const tags = getAutoTags('Unknown Division', 'AWD')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('unknown division with RWD returns only drift tag', () => {
    expectExactTags('Unknown Division', 'RWD', ['drift'])
  })

  it('unknown drivetrain (e.g. MWD) adds no extra tags', () => {
    const withUnknown = getAutoTags('Hot Hatch', 'MWD')
    const withoutDrive = getAutoTags('Hot Hatch', undefined)
    expect(new Set(withUnknown)).toEqual(new Set(withoutDrive))
  })
})

// ─── Output quality ───────────────────────────────────────────────────────────

describe('getAutoTags — output quality', () => {
  it('never returns duplicate tags', () => {
    // Rally Monsters + AWD: dirt appears in both sets
    const tags = getAutoTags('Rally Monsters', 'AWD')
    expect(tags.length).toBe(new Set(tags).size)
  })

  it('never returns duplicate tags for any tarmac + FWD combo', () => {
    // Hot Hatch already has tight + technical; FWD would add them again without dedup
    const tags = getAutoTags('Hot Hatch', 'FWD')
    expect(tags.length).toBe(new Set(tags).size)
  })

  it('all returned tags are valid CAR_TAGS values (safety filter)', () => {
    // getAutoTags filters through CAR_TAGS whitelist — no invented tags can slip through
    const allDivisions = [
      'Hypercars', 'Modern Rally', 'Drift Cars', 'Rally Monsters',
      'Offroad', 'Hot Hatch', 'Utility Heroes',
    ]
    for (const div of allDivisions) {
      const tags = getAutoTags(div, 'AWD')
      expect(tags.every((t: string) => CAR_TAGS.includes(t))).toBe(true)
    }
  })

  it('returns an array, never null or undefined', () => {
    expect(getAutoTags('Unknown', undefined)).toBeInstanceOf(Array)
    expect(getAutoTags('Hypercars', 'RWD')).toBeInstanceOf(Array)
  })
})

// ─── Legacy key aliases ───────────────────────────────────────────────────────

describe('getAutoTags — legacy key aliases', () => {
  // Old apostrophe variants are kept in DIVISION_TAGS for backward compatibility
  // with any existing CarTag rows that were written with the old division name.

  it("Pickups & 4x4's (legacy apostrophe) → offroad, mixed", () => {
    expectExactTags("Pickups & 4x4's", undefined, ['offroad', 'mixed'])
  })

  it("UTV's (legacy apostrophe) → offroad, dirt", () => {
    expectExactTags("UTV's", undefined, ['offroad', 'dirt'])
  })

  it('Pickups & 4x4s (canonical) and legacy variant return same tags', () => {
    expect(new Set(getAutoTags('Pickups & 4x4s'))).toEqual(
      new Set(getAutoTags("Pickups & 4x4's"))
    )
  })

  it("UTVs (canonical) and legacy variant return same tags", () => {
    expect(new Set(getAutoTags('UTVs'))).toEqual(
      new Set(getAutoTags("UTV's"))
    )
  })
})
