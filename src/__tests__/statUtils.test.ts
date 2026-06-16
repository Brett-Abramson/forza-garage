import { describe, it, expect } from 'vitest'
import { resolveEffectiveStats, hasOverrides } from '@/lib/statUtils'
import type { Car } from '@/types/car'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Base car with concrete values for all 12 stat/spec fields — no overrides set. */
const base: Car = {
  id: 1, make: 'Porsche', model: '911', year: 2019,
  division: 'Modern Sports Cars', piClass: 'S1', piRating: 826,
  country: 'Germany', source: 'Autoshow', sourceInfo: null,
  drivetrain: null, engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: 7.5, statHandling: 8.0, statAcceleration: 6.5, statLaunch: 5.0,
  statBraking: 7.0, statOffroad: 3.0,
  powerHp: 350, torqueFtLb: 295, weightLb: 3100, frontWeight: 45,
  displacementL: 3.0, rarity: 'Common',
  value: null,
  owned: true,
}

/** Car as it would arrive in Car Database context — no override fields present. */
const carDatabaseCar: Car = { ...base }

// ─── resolveEffectiveStats ────────────────────────────────────────────────────

describe('resolveEffectiveStats', () => {
  it('returns base car value when override field is absent (undefined)', () => {
    const result = resolveEffectiveStats(base)
    expect(result.statSpeed).toBe(7.5)
    expect(result.powerHp).toBe(350)
    expect(result.rarity).toBe('Common')
  })

  it('returns base car value when override field is explicitly null', () => {
    const car: Car = { ...base, statSpeedOverride: null, powerHpOverride: null }
    const result = resolveEffectiveStats(car)
    expect(result.statSpeed).toBe(7.5)
    expect(result.powerHp).toBe(350)
  })

  it('returns override value when override is set', () => {
    const car: Car = { ...base, statSpeedOverride: 9.5 }
    const result = resolveEffectiveStats(car)
    expect(result.statSpeed).toBe(9.5)
  })

  it('override takes priority over a non-null base value', () => {
    const car: Car = { ...base, statHandling: 6.0, statHandlingOverride: 9.9 }
    const result = resolveEffectiveStats(car)
    expect(result.statHandling).toBe(9.9)
  })

  it('resolves all 12 fields independently', () => {
    const car: Car = {
      ...base,
      statSpeedOverride:        9.1,
      statHandlingOverride:     9.2,
      statAccelerationOverride: 9.3,
      statLaunchOverride:       9.4,
      statBrakingOverride:      9.5,
      statOffroadOverride:      9.6,
      powerHpOverride:          500,
      torqueFtLbOverride:       400,
      weightLbOverride:         2800,
      frontWeightOverride:      50,
      displacementLOverride:    4.0,
      rarityOverride:           'Legendary',
    }
    const result = resolveEffectiveStats(car)
    expect(result.statSpeed).toBe(9.1)
    expect(result.statHandling).toBe(9.2)
    expect(result.statAcceleration).toBe(9.3)
    expect(result.statLaunch).toBe(9.4)
    expect(result.statBraking).toBe(9.5)
    expect(result.statOffroad).toBe(9.6)
    expect(result.powerHp).toBe(500)
    expect(result.torqueFtLb).toBe(400)
    expect(result.weightLb).toBe(2800)
    expect(result.frontWeight).toBe(50)
    expect(result.displacementL).toBe(4.0)
    expect(result.rarity).toBe('Legendary')
  })

  it('falls through to null base value when override is null and base is null', () => {
    const nullBase: Car = {
      ...base,
      statSpeed: null, statSpeedOverride: null,
    }
    const result = resolveEffectiveStats(nullBase)
    expect(result.statSpeed).toBeNull()
  })

  // Car Database context: cars have no override fields — resolution is a no-op.
  // This proves Car Database stats are never affected by any user's overrides.
  it('Car Database context — no override fields present → returns canonical Car values unchanged', () => {
    const result = resolveEffectiveStats(carDatabaseCar)
    expect(result.statSpeed).toBe(base.statSpeed)
    expect(result.statHandling).toBe(base.statHandling)
    expect(result.statAcceleration).toBe(base.statAcceleration)
    expect(result.statLaunch).toBe(base.statLaunch)
    expect(result.statBraking).toBe(base.statBraking)
    expect(result.statOffroad).toBe(base.statOffroad)
    expect(result.powerHp).toBe(base.powerHp)
    expect(result.torqueFtLb).toBe(base.torqueFtLb)
    expect(result.weightLb).toBe(base.weightLb)
    expect(result.frontWeight).toBe(base.frontWeight)
    expect(result.displacementL).toBe(base.displacementL)
    expect(result.rarity).toBe(base.rarity)
  })

  it('mixed — override set for some fields, base value used for others', () => {
    const car: Car = {
      ...base,
      statSpeedOverride: 9.5,    // override wins
      powerHpOverride:   null,   // null override → base wins (350)
      // statHandlingOverride absent → base wins (8.0)
    }
    const result = resolveEffectiveStats(car)
    expect(result.statSpeed).toBe(9.5)
    expect(result.powerHp).toBe(350)
    expect(result.statHandling).toBe(8.0)
  })
})

// ─── hasOverrides ─────────────────────────────────────────────────────────────

describe('hasOverrides', () => {
  it('returns false when no override fields are present (Car Database context)', () => {
    expect(hasOverrides(carDatabaseCar)).toBe(false)
  })

  it('returns false when all override fields are explicitly null', () => {
    const car: Car = {
      ...base,
      statSpeedOverride: null, statHandlingOverride: null,
      statAccelerationOverride: null, statLaunchOverride: null,
      statBrakingOverride: null, statOffroadOverride: null,
      powerHpOverride: null, torqueFtLbOverride: null,
      weightLbOverride: null, frontWeightOverride: null,
      displacementLOverride: null, rarityOverride: null,
    }
    expect(hasOverrides(car)).toBe(false)
  })

  it('returns true when a bar-stat override is active', () => {
    expect(hasOverrides({ ...base, statSpeedOverride: 9.5 })).toBe(true)
    expect(hasOverrides({ ...base, statHandlingOverride: 8.0 })).toBe(true)
    expect(hasOverrides({ ...base, statBrakingOverride: 7.0 })).toBe(true)
  })

  it('returns true when a spec override is active', () => {
    expect(hasOverrides({ ...base, powerHpOverride: 500 })).toBe(true)
    expect(hasOverrides({ ...base, weightLbOverride: 2800 })).toBe(true)
    expect(hasOverrides({ ...base, rarityOverride: 'Legendary' })).toBe(true)
  })

  it('returns true when only one of the twelve fields has an override', () => {
    expect(hasOverrides({ ...base, displacementLOverride: 4.0 })).toBe(true)
  })

  it('returns false when all overrides are null even if some base stats are also null', () => {
    const car: Car = { ...base, statSpeed: null, statSpeedOverride: null }
    expect(hasOverrides(car)).toBe(false)
  })
})
