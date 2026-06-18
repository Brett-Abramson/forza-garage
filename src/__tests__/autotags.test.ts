/**
 * Comprehensive unit tests for getAutoTags().
 *
 * Division list is the exact set returned by:
 *   SELECT DISTINCT division FROM "Car" ORDER BY division
 * as of the current database — 37 unique values, all verified against
 * DIVISION_TAGS in src/lib/autotags.ts.
 *
 * Updated for v2 mapping (June 2026):
 *   - "street racing" tag added for hot hatch / sports / saloon divisions
 *   - Rally divisions now include "offroad" alongside "dirt"
 *   - Sports Utility Heroes → asphalt (road-circuit racing in FH6)
 *   - Drift Cars → drift only (was drift, asphalt, tight)
 *   - Muscle simplified to asphalt + drag (removed long straights)
 *   - Unknown divisions now return ["asphalt"] safe default, not []
 *
 * Tests use exact Set equality so both missing AND unexpected tags fail.
 */

import { describe, it, expect } from 'vitest'
import { getAutoTags } from '@/lib/autotags'
import { CAR_TAGS } from '@/lib/tags'

// ─── helper ──────────────────────────────────────────────────────────────────

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

// ─── Hypercar / Supercar divisions ───────────────────────────────────────────

describe('getAutoTags — hypercars and supercars', () => {
  it('Hypercars → exact: asphalt, long straights', () => {
    expectExactTags('Hypercars', undefined, ['asphalt', 'long straights'])
  })

  it('Modern Supercars → exact: asphalt', () => {
    expectExactTags('Modern Supercars', undefined, ['asphalt'])
  })

  it('Retro Supercars → exact: asphalt', () => {
    expectExactTags('Retro Supercars', undefined, ['asphalt'])
  })
})

// ─── Track / GT / Saloon divisions ───────────────────────────────────────────

describe('getAutoTags — track, GT, saloon divisions', () => {
  it('Extreme Track Toys → exact: asphalt, technical', () => {
    expectExactTags('Extreme Track Toys', undefined, ['asphalt', 'technical'])
  })

  it('Track Toys → exact: asphalt', () => {
    expectExactTags('Track Toys', undefined, ['asphalt'])
  })

  it('Classic Racers → exact: asphalt', () => {
    expectExactTags('Classic Racers', undefined, ['asphalt'])
  })

  it('Retro Racers → exact: asphalt', () => {
    expectExactTags('Retro Racers', undefined, ['asphalt'])
  })

  it('Super GT → exact: asphalt, long straights', () => {
    expectExactTags('Super GT', undefined, ['asphalt', 'long straights'])
  })

  it('GT Cars → exact: asphalt', () => {
    expectExactTags('GT Cars', undefined, ['asphalt'])
  })

  it('Modern Super Saloons → exact: asphalt, street racing', () => {
    expectExactTags('Modern Super Saloons', undefined, ['asphalt', 'street racing'])
  })

  it('Retro Super Saloons → exact: asphalt', () => {
    expectExactTags('Retro Super Saloons', undefined, ['asphalt'])
  })

  it('Sports Utility Heroes → exact: asphalt (road-circuit racing in FH6)', () => {
    expectExactTags('Sports Utility Heroes', undefined, ['asphalt'])
  })

  it('Sports Utility Heroes does NOT include offroad', () => {
    expect(getAutoTags('Sports Utility Heroes')).not.toContain('offroad')
  })
})

// ─── Sports car divisions ─────────────────────────────────────────────────────

describe('getAutoTags — sports car divisions', () => {
  it('Modern Sports Cars → exact: asphalt, street racing', () => {
    expectExactTags('Modern Sports Cars', undefined, ['asphalt', 'street racing'])
  })

  it('Retro Sports Cars → exact: asphalt, street racing', () => {
    expectExactTags('Retro Sports Cars', undefined, ['asphalt', 'street racing'])
  })

  it('Classic Sports Cars → exact: asphalt, street racing', () => {
    expectExactTags('Classic Sports Cars', undefined, ['asphalt', 'street racing'])
  })
})

// ─── Hot Hatch divisions ──────────────────────────────────────────────────────

describe('getAutoTags — hot hatch divisions', () => {
  it('Hot Hatch → exact: asphalt, street racing, tight', () => {
    expectExactTags('Hot Hatch', undefined, ['asphalt', 'street racing', 'tight'])
  })

  it('Super Hot Hatch → exact: asphalt, street racing, tight', () => {
    expectExactTags('Super Hot Hatch', undefined, ['asphalt', 'street racing', 'tight'])
  })

  it('Retro Hot Hatch → exact: asphalt, street racing, tight', () => {
    expectExactTags('Retro Hot Hatch', undefined, ['asphalt', 'street racing', 'tight'])
  })

  it('all hot hatch variants include street racing tag', () => {
    expect(getAutoTags('Hot Hatch')).toContain('street racing')
    expect(getAutoTags('Super Hot Hatch')).toContain('street racing')
    expect(getAutoTags('Retro Hot Hatch')).toContain('street racing')
  })
})

// ─── Muscle / Drag divisions ──────────────────────────────────────────────────

describe('getAutoTags — muscle and drag divisions', () => {
  it('Classic Muscle → exact: asphalt, drag', () => {
    expectExactTags('Classic Muscle', undefined, ['asphalt', 'drag'])
  })

  it('Retro Muscle → exact: asphalt, drag', () => {
    expectExactTags('Retro Muscle', undefined, ['asphalt', 'drag'])
  })

  it('Modern Muscle → exact: asphalt, drag', () => {
    expectExactTags('Modern Muscle', undefined, ['asphalt', 'drag'])
  })

  it('muscle divisions include drag tag (enables drag-race filter)', () => {
    expect(getAutoTags('Classic Muscle')).toContain('drag')
    expect(getAutoTags('Retro Muscle')).toContain('drag')
    expect(getAutoTags('Modern Muscle')).toContain('drag')
  })

  it('muscle divisions do NOT include long straights (simplified in v2)', () => {
    expect(getAutoTags('Classic Muscle')).not.toContain('long straights')
    expect(getAutoTags('Modern Muscle')).not.toContain('long straights')
  })
})

// ─── Rally divisions ──────────────────────────────────────────────────────────

describe('getAutoTags — rally divisions', () => {
  it('Rally Monsters → exact: dirt, offroad, mixed', () => {
    expectExactTags('Rally Monsters', undefined, ['dirt', 'offroad', 'mixed'])
  })

  it('Modern Rally → exact: dirt, offroad, mixed', () => {
    expectExactTags('Modern Rally', undefined, ['dirt', 'offroad', 'mixed'])
  })

  it('Classic Rally → exact: dirt, offroad, mixed', () => {
    expectExactTags('Classic Rally', undefined, ['dirt', 'offroad', 'mixed'])
  })

  it('Retro Rally → exact: dirt, offroad, mixed', () => {
    expectExactTags('Retro Rally', undefined, ['dirt', 'offroad', 'mixed'])
  })

  it('all rally divisions include both dirt AND offroad (v2: rally cars go off-road too)', () => {
    for (const d of ['Rally Monsters', 'Modern Rally', 'Classic Rally', 'Retro Rally']) {
      const tags = getAutoTags(d)
      expect(tags, d).toContain('dirt')
      expect(tags, d).toContain('offroad')
    }
  })

  it('Modern Rally includes offroad (Subaru WRX regression check)', () => {
    // All WRX variants are in Modern Rally — dirt must come from division alone
    // (drivetrain is null in DB for WRX rows)
    const tags = getAutoTags('Modern Rally', undefined)
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
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

  it('Pickups & 4x4s → exact: offroad, mixed, dirt (v2: now includes dirt)', () => {
    expectExactTags('Pickups & 4x4s', undefined, ['offroad', 'mixed', 'dirt'])
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

  it.each([
    'Unlimited Offroad', 'Unlimited Buggies', 'Buggies', 'Offroad',
    'Pickups & 4x4s', 'UTVs',
  ])('%s does not include asphalt', (d) => {
    expect(getAutoTags(d)).not.toContain('asphalt')
  })
})

// ─── Drift divisions ──────────────────────────────────────────────────────────

describe('getAutoTags — drift divisions', () => {
  it('Drift Cars → exact: drift only (v2: asphalt and tight removed)', () => {
    expectExactTags('Drift Cars', undefined, ['drift'])
  })

  it('Formula Drift → exact: drift', () => {
    expectExactTags('Formula Drift', undefined, ['drift'])
  })

  it('Drift Cars does NOT include asphalt', () => {
    expect(getAutoTags('Drift Cars')).not.toContain('asphalt')
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

  it('Utility Heroes → exact: asphalt (v2: asphalt default for unlisted divisions)', () => {
    expectExactTags('Utility Heroes', undefined, ['asphalt'])
  })
})

// ─── All 37 live DB divisions are covered ────────────────────────────────────

describe('getAutoTags — full DB division coverage', () => {
  // Every division in the Car table must return at least one tag.
  // Unknown divisions now return ["asphalt"] as a safe default, so this
  // test also verifies the fallback path works.
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
  it('unknown division returns ["asphalt"] instead of [] (v2 safe default)', () => {
    expectExactTags('Unknown Division', undefined, ['asphalt'])
  })

  it('unknown division with AWD: asphalt + dirt + offroad', () => {
    const tags = getAutoTags('Unknown Division', 'AWD')
    expect(tags).toContain('asphalt')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('unknown division with RWD: asphalt + drift', () => {
    expectExactTags('Unknown Division', 'RWD', ['asphalt', 'drift'])
  })
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

  it('RWD on Hypercars → exact: asphalt, long straights, drift', () => {
    expectExactTags('Hypercars', 'RWD', ['asphalt', 'long straights', 'drift'])
  })

  it('RWD on Classic Muscle → exact: asphalt, drag, drift', () => {
    expectExactTags('Classic Muscle', 'RWD', ['asphalt', 'drag', 'drift'])
  })
})

describe('getAutoTags — FWD drivetrain', () => {
  it('FWD adds tight and street racing', () => {
    const tags = getAutoTags('GT Cars', 'FWD')
    expect(tags).toContain('tight')
    expect(tags).toContain('street racing')
  })

  it('FWD on Hot Hatch: tight and street racing already present, not duplicated', () => {
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

// ─── Null / undefined drivetrain edge cases ───────────────────────────────────

describe('getAutoTags — null / undefined drivetrain', () => {
  it('undefined drivetrain does not throw', () => {
    expect(() => getAutoTags('Hypercars', undefined)).not.toThrow()
  })

  it('null coerced to undefined returns division tags only', () => {
    // Mirrors callers that hold `drivetrain: string | null` and pass `?? undefined`.
    const nullDrivetrain: string | null = null
    const tags = getAutoTags('Modern Rally', nullDrivetrain ?? undefined)
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
  it('dirt filter returns rally divisions (Modern Rally has dirt tag)', () => {
    expect(getAutoTags('Modern Rally')).toContain('dirt')
    expect(getAutoTags('Classic Rally')).toContain('dirt')
    expect(getAutoTags('Rally Monsters')).toContain('dirt')
  })

  it('dirt filter returns AWD cars on any division (AWD adds dirt)', () => {
    const hotHatchAWD = getAutoTags('Hot Hatch', 'AWD')
    expect(hotHatchAWD).toContain('dirt')
    const supercarsAWD = getAutoTags('Hypercars', 'AWD')
    expect(supercarsAWD).toContain('dirt')
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
