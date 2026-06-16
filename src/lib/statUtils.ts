import type { Car } from '@/types/car'

/**
 * Returns the 12 stat/spec fields with per-user overrides applied.
 * Override fields are only present on Car in My Garage context; in Car Database
 * context (no overrides on the Car object) this falls through to the base values.
 */
export function resolveEffectiveStats(car: Car): Pick<Car,
  'statSpeed' | 'statHandling' | 'statAcceleration' | 'statLaunch' | 'statBraking' | 'statOffroad' |
  'powerHp' | 'torqueFtLb' | 'weightLb' | 'frontWeight' | 'displacementL' | 'rarity'
> {
  return {
    statSpeed:        car.statSpeedOverride        ?? car.statSpeed,
    statHandling:     car.statHandlingOverride     ?? car.statHandling,
    statAcceleration: car.statAccelerationOverride ?? car.statAcceleration,
    statLaunch:       car.statLaunchOverride       ?? car.statLaunch,
    statBraking:      car.statBrakingOverride      ?? car.statBraking,
    statOffroad:      car.statOffroadOverride      ?? car.statOffroad,
    powerHp:          car.powerHpOverride          ?? car.powerHp,
    torqueFtLb:       car.torqueFtLbOverride       ?? car.torqueFtLb,
    weightLb:         car.weightLbOverride         ?? car.weightLb,
    frontWeight:      car.frontWeightOverride      ?? car.frontWeight,
    displacementL:    car.displacementLOverride    ?? car.displacementL,
    rarity:           car.rarityOverride           ?? car.rarity,
  }
}

/**
 * Maps each of the 12 canonical stat/spec field names to its per-user override
 * column name on UserGarage. Used by the API route and client-side helpers.
 */
export const STAT_OVERRIDE_MAP: Readonly<Record<string, string>> = {
  statSpeed:        'statSpeedOverride',
  statHandling:     'statHandlingOverride',
  statAcceleration: 'statAccelerationOverride',
  statLaunch:       'statLaunchOverride',
  statBraking:      'statBrakingOverride',
  statOffroad:      'statOffroadOverride',
  powerHp:          'powerHpOverride',
  torqueFtLb:       'torqueFtLbOverride',
  weightLb:         'weightLbOverride',
  frontWeight:      'frontWeightOverride',
  displacementL:    'displacementLOverride',
  rarity:           'rarityOverride',
}

/** Returns true if any per-user stat override is active on this car. */
export function hasOverrides(car: Car): boolean {
  return (
    car.statSpeedOverride        != null ||
    car.statHandlingOverride     != null ||
    car.statAccelerationOverride != null ||
    car.statLaunchOverride       != null ||
    car.statBrakingOverride      != null ||
    car.statOffroadOverride      != null ||
    car.powerHpOverride          != null ||
    car.torqueFtLbOverride       != null ||
    car.weightLbOverride         != null ||
    car.frontWeightOverride      != null ||
    car.displacementLOverride    != null ||
    car.rarityOverride           != null
  )
}

/**
 * String-keyed stat shape used by stat entry inputs.
 * All values are strings so controlled inputs stay stable; empty string = null.
 */
export interface StatFields {
  statSpeed: string
  statHandling: string
  statAcceleration: string
  statLaunch: string
  statBraking: string
  statOffroad: string
  powerHp: string
  torqueFtLb: string
  weightLb: string
  frontWeight: string
  displacementL: string
  rarity: string
}

export const RARITY_OPTIONS = ['Common', 'Rare', 'Legendary', 'Forza Edition'] as const

/** Initialise StatFields from a Car object (or null → all empty strings). */
export function carToStats(car: Car | null): StatFields {
  return {
    statSpeed:        car?.statSpeed        != null ? String(car.statSpeed)        : '',
    statHandling:     car?.statHandling     != null ? String(car.statHandling)     : '',
    statAcceleration: car?.statAcceleration != null ? String(car.statAcceleration) : '',
    statLaunch:       car?.statLaunch       != null ? String(car.statLaunch)       : '',
    statBraking:      car?.statBraking      != null ? String(car.statBraking)      : '',
    statOffroad:      car?.statOffroad      != null ? String(car.statOffroad)      : '',
    powerHp:          car?.powerHp          != null ? String(car.powerHp)          : '',
    torqueFtLb:       car?.torqueFtLb       != null ? String(car.torqueFtLb)       : '',
    weightLb:         car?.weightLb         != null ? String(car.weightLb)         : '',
    frontWeight:      car?.frontWeight      != null ? String(car.frontWeight)      : '',
    displacementL:    car?.displacementL    != null ? String(car.displacementL)    : '',
    rarity:           car?.rarity           ?? '',
  }
}

/** Convert StatFields strings back to typed values for a PATCH request body. */
export function statsToPayload(s: StatFields): Record<string, number | string | null> {
  return {
    statSpeed:        s.statSpeed        !== '' ? parseFloat(s.statSpeed)        : null,
    statHandling:     s.statHandling     !== '' ? parseFloat(s.statHandling)     : null,
    statAcceleration: s.statAcceleration !== '' ? parseFloat(s.statAcceleration) : null,
    statLaunch:       s.statLaunch       !== '' ? parseFloat(s.statLaunch)       : null,
    statBraking:      s.statBraking      !== '' ? parseFloat(s.statBraking)      : null,
    statOffroad:      s.statOffroad      !== '' ? parseFloat(s.statOffroad)      : null,
    powerHp:          s.powerHp          !== '' ? parseInt(s.powerHp)            : null,
    torqueFtLb:       s.torqueFtLb       !== '' ? parseInt(s.torqueFtLb)         : null,
    weightLb:         s.weightLb         !== '' ? parseInt(s.weightLb)           : null,
    frontWeight:      s.frontWeight      !== '' ? parseInt(s.frontWeight)        : null,
    displacementL:    s.displacementL    !== '' ? parseFloat(s.displacementL)    : null,
    rarity:           s.rarity           !== '' ? s.rarity                       : null,
  }
}
