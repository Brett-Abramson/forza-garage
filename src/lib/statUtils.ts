import type { Car } from '@/types/car'

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
