/**
 * Unit tests for filterCars() — the pure filter function shared by
 * GarageView (/cars) and GarageShowcase (/garage).
 *
 * All tests operate on a small fixed mock-car array so they are fast
 * and deterministic. No database access.
 *
 * Source values use real composite strings from the DB:
 *   'Autoshow', 'Autoshow DLC', 'Autoshow, Collection Journal',
 *   'Collection Journal', 'Seasonal', 'Autoshow, Wheelspin, Loyalty'
 * Filtering uses car.source.includes(value), so 'Autoshow' matches all
 * strings that contain the word "Autoshow".
 */

import { describe, it, expect } from 'vitest'
import { filterCars, DEFAULT_FILTERS } from '@/lib/filterCars'
import type { Car, FilterState } from '@/types/car'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function f(overrides: Partial<FilterState> = {}): FilterState {
  return { ...DEFAULT_FILTERS, ...overrides }
}

function ids(cars: Car[]): number[] {
  return cars.map((c) => c.id).sort((a, b) => a - b)
}

// ─── Mock car fixtures ────────────────────────────────────────────────────────
//
// Eight cars chosen to provide distinct values across every filterable axis:
//   piClass, make, drivetrain, country, source, owned, tags, division, search fields.

const PORSCHE: Car = {
  id: 1, make: 'Porsche', model: '911 GT3', year: 2019,
  division: 'Modern Sports Cars', piClass: 'S1', piRating: 826,
  drivetrain: 'RWD', country: 'Germany', source: 'Autoshow',
  owned: true, tags: ['asphalt', 'grip', 'technical'],
  // nullable fields
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const SUBARU_WRX: Car = {
  id: 2, make: 'Subaru', model: 'WRX STI', year: 2015,
  division: 'Modern Rally', piClass: 'A', piRating: 760,
  drivetrain: 'AWD', country: 'Japan', source: 'Autoshow',
  owned: true, tags: ['dirt', 'mixed'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const TOYOTA: Car = {
  id: 3, make: 'Toyota', model: 'GR86', year: 2022,
  division: 'Modern Sports Cars', piClass: 'B', piRating: 645,
  drivetrain: 'FWD', country: 'Japan', source: 'Autoshow DLC',
  owned: false, tags: ['asphalt', 'grip', 'technical'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const BUGATTI: Car = {
  id: 4, make: 'Bugatti', model: 'Chiron', year: 2018,
  division: 'Hypercars', piClass: 'R', piRating: 998,
  drivetrain: 'AWD', country: 'France', source: 'Autoshow DLC',
  owned: false, tags: ['asphalt', 'grip', 'long straights'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const FORD_GT: Car = {
  id: 5, make: 'Ford', model: 'GT', year: 2020,
  division: 'Modern Supercars', piClass: 'S2', piRating: 900,
  drivetrain: 'RWD', country: 'USA', source: 'Autoshow, Collection Journal',
  owned: true, tags: ['asphalt', 'grip', 'long straights', 'drift'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const NISSAN_SILVIA: Car = {
  id: 6, make: 'Nissan', model: 'Silvia S13', year: 1989,
  division: 'Retro Sports Cars', piClass: 'C', piRating: 500,
  drivetrain: 'RWD', country: 'Japan', source: 'Seasonal',
  owned: false, tags: ['asphalt', 'grip', 'technical', 'tight', 'drift'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const GMC_JIMMY: Car = {
  id: 7, make: 'GMC', model: 'Jimmy', year: 1970,
  division: 'Pickups & 4x4s', piClass: 'D', piRating: 200,
  drivetrain: 'AWD', country: 'USA', source: 'Autoshow, Wheelspin, Loyalty',
  owned: false, tags: ['offroad', 'mixed', 'dirt'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const FORD_FOCUS: Car = {
  id: 8, make: 'Ford', model: 'Focus RS', year: 2017,
  division: 'Hot Hatch', piClass: 'A', piRating: 780,
  drivetrain: 'FWD', country: 'UK', source: 'Collection Journal',
  owned: true, tags: ['asphalt', 'tight', 'technical', 'grip'],
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null,
  statLaunch: null, statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
  displacementL: null, value: null, rarity: null, sourceInfo: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  tagDetails: [],
}

const ALL_CARS: Car[] = [
  PORSCHE, SUBARU_WRX, TOYOTA, BUGATTI, FORD_GT,
  NISSAN_SILVIA, GMC_JIMMY, FORD_FOCUS,
]

// ─── All filters cleared ──────────────────────────────────────────────────────

describe('filterCars — no active filters', () => {
  it('returns the full input array when all filters are at their defaults', () => {
    expect(filterCars(ALL_CARS, { filters: f() })).toHaveLength(ALL_CARS.length)
  })

  it('returns every car unchanged (same ids)', () => {
    expect(ids(filterCars(ALL_CARS, { filters: f() }))).toEqual(ids(ALL_CARS))
  })

  it('empty car array returns empty array for any filter combination', () => {
    expect(filterCars([], { filters: f({ piClass: ['S1'], make: ['Porsche'], search: 'GT3' }) })).toEqual([])
  })
})

// ─── PI class ─────────────────────────────────────────────────────────────────

describe('filterCars — PI class', () => {
  it('filters to only S1 cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['S1'] }) })
    expect(ids(result)).toEqual([PORSCHE.id])
  })

  it('filters to only A class (two cars)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['A'] }) })
    expect(ids(result)).toEqual(ids([SUBARU_WRX, FORD_FOCUS]))
  })

  it('filters to only R class', () => {
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['R'] }) })
    expect(ids(result)).toEqual([BUGATTI.id])
  })

  it('returns empty array when no car has that class', () => {
    expect(filterCars(ALL_CARS, { filters: f({ piClass: ['X'] }) })).toHaveLength(0)
  })

  it('empty piClass array is a no-op (returns all cars)', () => {
    expect(filterCars(ALL_CARS, { filters: f({ piClass: [] }) })).toHaveLength(ALL_CARS.length)
  })

  it('PI class filter is exact-match (["S"] does not match "S1" or "S2")', () => {
    expect(filterCars(ALL_CARS, { filters: f({ piClass: ['S'] }) })).toHaveLength(0)
  })

  it('multi-select: ["A", "B"] returns only A and B class cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['A', 'B'] }) })
    expect(ids(result)).toEqual(ids([SUBARU_WRX, TOYOTA, FORD_FOCUS]))
  })

  it('multi-select: ["S1", "R"] returns Porsche and Bugatti', () => {
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['S1', 'R'] }) })
    expect(ids(result)).toEqual(ids([PORSCHE, BUGATTI]))
  })

  it('multi-select with all classes selected returns all cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['D', 'C', 'B', 'A', 'S1', 'S2', 'R'] }) })
    expect(ids(result)).toHaveLength(ALL_CARS.length)
  })
})

// ─── Make ─────────────────────────────────────────────────────────────────────

describe('filterCars — make', () => {
  it('filters to only Porsche', () => {
    expect(ids(filterCars(ALL_CARS, { filters: f({ make: ['Porsche'] }) }))).toEqual([PORSCHE.id])
  })

  it('filters to only Ford (two cars)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ make: ['Ford'] }) })
    expect(ids(result)).toEqual(ids([FORD_GT, FORD_FOCUS]))
  })

  it('make filter is exact-match — ["ford"] (lowercase) returns nothing', () => {
    expect(filterCars(ALL_CARS, { filters: f({ make: ['ford'] }) })).toHaveLength(0)
  })

  it('empty make array returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f({ make: [] }) })).toHaveLength(ALL_CARS.length)
  })

  it('unknown make returns empty array', () => {
    expect(filterCars(ALL_CARS, { filters: f({ make: ['Lamborghini'] }) })).toHaveLength(0)
  })

  it('multi-select: ["Toyota", "Nissan"] returns cars from either make', () => {
    const result = filterCars(ALL_CARS, { filters: f({ make: ['Toyota', 'Nissan'] }) })
    expect(ids(result)).toEqual(ids([TOYOTA, NISSAN_SILVIA]))
  })

  it('multi-select: ["Ford"] returns same result as old single-select "Ford"', () => {
    const result = filterCars(ALL_CARS, { filters: f({ make: ['Ford'] }) })
    expect(ids(result)).toEqual(ids([FORD_GT, FORD_FOCUS]))
  })
})

// ─── Drivetrain ───────────────────────────────────────────────────────────────

describe('filterCars — drivetrain', () => {
  it('filters to only RWD cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ drivetrain: 'RWD' }) })
    expect(ids(result)).toEqual(ids([PORSCHE, FORD_GT, NISSAN_SILVIA]))
  })

  it('filters to only AWD cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ drivetrain: 'AWD' }) })
    expect(ids(result)).toEqual(ids([SUBARU_WRX, BUGATTI, GMC_JIMMY]))
  })

  it('filters to only FWD cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ drivetrain: 'FWD' }) })
    expect(ids(result)).toEqual(ids([TOYOTA, FORD_FOCUS]))
  })

  it('empty drivetrain string returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f({ drivetrain: '' }) })).toHaveLength(ALL_CARS.length)
  })

  it('null drivetrain on a car is not matched by any drivetrain filter', () => {
    const carWithNullDrive: Car = { ...PORSCHE, id: 99, drivetrain: null }
    expect(
      filterCars([carWithNullDrive], { filters: f({ drivetrain: 'RWD' }) })
    ).toHaveLength(0)
  })
})

// ─── Country ──────────────────────────────────────────────────────────────────

describe('filterCars — country', () => {
  it('filters to Japan (three cars)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ country: 'Japan' }) })
    expect(ids(result)).toEqual(ids([SUBARU_WRX, TOYOTA, NISSAN_SILVIA]))
  })

  it('filters to USA (two cars)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ country: 'USA' }) })
    expect(ids(result)).toEqual(ids([FORD_GT, GMC_JIMMY]))
  })

  it('filters to Germany (one car)', () => {
    expect(ids(filterCars(ALL_CARS, { filters: f({ country: 'Germany' }) }))).toEqual([PORSCHE.id])
  })

  it('unknown country returns empty array', () => {
    expect(filterCars(ALL_CARS, { filters: f({ country: 'Antarctica' }) })).toHaveLength(0)
  })
})

// ─── Source ───────────────────────────────────────────────────────────────────
//
// source uses substring match (car.source.includes(value)), matching
// real composite strings like "Autoshow, Collection Journal, Wheelspin".

describe('filterCars — source', () => {
  it('"Autoshow" matches plain Autoshow and all composite Autoshow strings', () => {
    // Matches: Porsche (Autoshow), WRX (Autoshow), Toyota (Autoshow DLC),
    //          Bugatti (Autoshow DLC), Ford GT (Autoshow, Collection Journal),
    //          GMC (Autoshow, Wheelspin, Loyalty)
    const result = filterCars(ALL_CARS, { filters: f({ source: 'Autoshow' }) })
    expect(ids(result)).toEqual(ids([PORSCHE, SUBARU_WRX, TOYOTA, BUGATTI, FORD_GT, GMC_JIMMY]))
  })

  it('"DLC" matches only DLC-sourced cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ source: 'DLC' }) })
    expect(ids(result)).toEqual(ids([TOYOTA, BUGATTI]))
  })

  it('"Seasonal" matches Nissan Silvia', () => {
    const result = filterCars(ALL_CARS, { filters: f({ source: 'Seasonal' }) })
    expect(ids(result)).toEqual([NISSAN_SILVIA.id])
  })

  it('"Loyalty" matches GMC Jimmy (source contains "Loyalty")', () => {
    const result = filterCars(ALL_CARS, { filters: f({ source: 'Loyalty' }) })
    expect(ids(result)).toEqual([GMC_JIMMY.id])
  })

  it('"Collection Journal" matches Ford GT and Ford Focus', () => {
    const result = filterCars(ALL_CARS, { filters: f({ source: 'Collection Journal' }) })
    expect(ids(result)).toEqual(ids([FORD_GT, FORD_FOCUS]))
  })

  it('empty source string returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f({ source: '' }) })).toHaveLength(ALL_CARS.length)
  })
})

// ─── Owned filter ─────────────────────────────────────────────────────────────

describe('filterCars — owned filter', () => {
  it('"owned" returns only owned cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ owned: 'owned' }) })
    // Owned: Porsche, WRX, Ford GT, Ford Focus
    expect(ids(result)).toEqual(ids([PORSCHE, SUBARU_WRX, FORD_GT, FORD_FOCUS]))
    result.forEach((c) => expect(c.owned).toBe(true))
  })

  it('"not-owned" returns only unowned cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ owned: 'not-owned' }) })
    // Not owned: Toyota, Bugatti, Nissan, GMC
    expect(ids(result)).toEqual(ids([TOYOTA, BUGATTI, NISSAN_SILVIA, GMC_JIMMY]))
    result.forEach((c) => expect(c.owned).toBe(false))
  })

  it('"all" (default) returns all cars regardless of owned state', () => {
    expect(filterCars(ALL_CARS, { filters: f({ owned: 'all' }) })).toHaveLength(ALL_CARS.length)
  })
})

// ─── Search ───────────────────────────────────────────────────────────────────

describe('filterCars — search', () => {
  it('searching by make returns matching cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: 'Porsche' }) })
    expect(ids(result)).toEqual([PORSCHE.id])
  })

  it('searching by make is case-insensitive', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: 'porsche' }) })
    expect(ids(result)).toEqual([PORSCHE.id])
  })

  it('searching by model returns matching cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: 'Chiron' }) })
    expect(ids(result)).toEqual([BUGATTI.id])
  })

  it('searching by partial model matches', () => {
    // "GT3" appears in "911 GT3"
    const result = filterCars(ALL_CARS, { filters: f({ search: 'GT3' }) })
    expect(ids(result)).toEqual([PORSCHE.id])
  })

  it('searching by division returns all cars in that division', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: 'Modern Sports Cars' }) })
    expect(ids(result)).toEqual(ids([PORSCHE, TOYOTA]))
  })

  it('searching by year returns matching cars', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: '1989' }) })
    expect(ids(result)).toEqual([NISSAN_SILVIA.id])
  })

  it('multi-token search: both tokens must match (AND, not OR)', () => {
    // "ford gt" → matches Ford GT (make=Ford, model=GT) but not Ford Focus
    const result = filterCars(ALL_CARS, { filters: f({ search: 'ford gt' }) })
    expect(ids(result)).toEqual([FORD_GT.id])
  })

  it('multi-token search: tokens can span different fields (year + make)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: '2015 subaru' }) })
    expect(ids(result)).toEqual([SUBARU_WRX.id])
  })

  it('search with no matches returns empty array and does not throw', () => {
    expect(() => filterCars(ALL_CARS, { filters: f({ search: 'xxxxxxxxxxx' }) })).not.toThrow()
    expect(filterCars(ALL_CARS, { filters: f({ search: 'xxxxxxxxxxx' }) })).toHaveLength(0)
  })

  it('empty search string returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f({ search: '' }) })).toHaveLength(ALL_CARS.length)
  })

  it('whitespace-only search string returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f({ search: '   ' }) })).toHaveLength(ALL_CARS.length)
  })
})

// ─── Tag chips (AND logic) ────────────────────────────────────────────────────

describe('filterCars — selectedTags (AND logic)', () => {
  it('single tag: returns cars that have that tag', () => {
    const result = filterCars(ALL_CARS, { filters: f(), selectedTags: new Set(['drift']) })
    // drift tag: Ford GT, Nissan Silvia
    expect(ids(result)).toEqual(ids([FORD_GT, NISSAN_SILVIA]))
  })

  it('single tag "dirt": returns rally/offroad cars', () => {
    const result = filterCars(ALL_CARS, { filters: f(), selectedTags: new Set(['dirt']) })
    expect(ids(result)).toEqual(ids([SUBARU_WRX, GMC_JIMMY]))
  })

  it('AND: two tags — car must have BOTH', () => {
    // Both "grip" and "long straights" → Bugatti, Ford GT
    const result = filterCars(ALL_CARS, {
      filters: f(),
      selectedTags: new Set(['grip', 'long straights']),
    })
    expect(ids(result)).toEqual(ids([BUGATTI, FORD_GT]))
  })

  it('AND: two tags where no car has both → empty', () => {
    // "dirt" + "asphalt" — no car has both
    const result = filterCars(ALL_CARS, {
      filters: f(),
      selectedTags: new Set(['dirt', 'asphalt']),
    })
    expect(result).toHaveLength(0)
  })

  it('empty selectedTags returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f(), selectedTags: new Set() })).toHaveLength(ALL_CARS.length)
  })

  it('cars with no tags (tags: []) do not pass any tag filter', () => {
    const noTags: Car = { ...PORSCHE, id: 99, tags: [] }
    const result = filterCars([noTags], {
      filters: f(),
      selectedTags: new Set(['asphalt']),
    })
    expect(result).toHaveLength(0)
  })

  it('cars with tags: undefined treated as empty — do not pass tag filter', () => {
    const noTags: Car = { ...PORSCHE, id: 99, tags: undefined }
    expect(
      filterCars([noTags], { filters: f(), selectedTags: new Set(['asphalt']) })
    ).toHaveLength(0)
  })
})

// ─── Race-type filter (OR logic) ──────────────────────────────────────────────

describe('filterCars — activeRaces (OR logic)', () => {
  it('race filter: car matches if it has ANY of the recommendedTags', () => {
    // Rally race recommends ['dirt', 'mixed']
    const rally = { recommendedTags: ['dirt', 'mixed'] }
    const result = filterCars(ALL_CARS, { filters: f(), activeRaces: [rally] })
    // WRX has ['dirt','mixed'], GMC has ['offroad','mixed','dirt']
    expect(ids(result)).toEqual(ids([SUBARU_WRX, GMC_JIMMY]))
  })

  it('race filter: OR — car matching just one tag is included', () => {
    // Only one tag "drift"; Nissan Silvia and Ford GT both have it
    const driftRace = { recommendedTags: ['drift'] }
    const result = filterCars(ALL_CARS, { filters: f(), activeRaces: [driftRace] })
    expect(ids(result)).toEqual(ids([FORD_GT, NISSAN_SILVIA]))
  })

  it('race filter with no matching cars returns empty array', () => {
    const snowRace = { recommendedTags: ['snow'] }
    expect(filterCars(ALL_CARS, { filters: f(), activeRaces: [snowRace] })).toHaveLength(0)
  })

  it('empty activeRaces array is a no-op (returns all cars)', () => {
    expect(filterCars(ALL_CARS, { filters: f(), activeRaces: [] })).toHaveLength(ALL_CARS.length)
  })

  it('undefined activeRaces is a no-op', () => {
    expect(filterCars(ALL_CARS, { filters: f() })).toHaveLength(ALL_CARS.length)
  })

  it('multi-select: rally OR dirt race returns union of matching cars', () => {
    // Rally ['dirt','mixed'] + Drift ['asphalt','drift']
    // WRX: dirt+mixed ✓ rally; GMC: offroad+mixed+dirt ✓ rally; Silvia: drift ✓ drift; GT: drift ✓ drift
    const rally = { recommendedTags: ['dirt', 'mixed'] }
    const drift = { recommendedTags: ['drift'] }
    const result = filterCars(ALL_CARS, { filters: f(), activeRaces: [rally, drift] })
    expect(ids(result)).toEqual(ids([SUBARU_WRX, FORD_GT, NISSAN_SILVIA, GMC_JIMMY]))
  })
})

// ─── Division filter ──────────────────────────────────────────────────────────

describe('filterCars — division filter', () => {
  it('filters to a specific division', () => {
    const result = filterCars(ALL_CARS, { filters: f({ division: ['Modern Sports Cars'] }) })
    expect(ids(result)).toEqual(ids([PORSCHE, TOYOTA]))
  })

  it('empty division array returns all cars', () => {
    expect(filterCars(ALL_CARS, { filters: f({ division: [] }) })).toHaveLength(ALL_CARS.length)
  })

  it('unknown division returns empty array', () => {
    expect(filterCars(ALL_CARS, { filters: f({ division: ['Fictional Cars'] }) })).toHaveLength(0)
  })

  it('multi-select: Modern Sports Cars + Retro Sports Cars returns cars from both', () => {
    const result = filterCars(ALL_CARS, { filters: f({ division: ['Modern Sports Cars', 'Retro Sports Cars'] }) })
    expect(ids(result)).toEqual(ids([PORSCHE, TOYOTA, NISSAN_SILVIA]))
  })
})

// ─── selectedGroupId filter ───────────────────────────────────────────────────

describe('filterCars — selectedGroupIds (division group)', () => {
  it('group id "sports" includes Modern Sports Cars and Retro Sports Cars', () => {
    // Porsche and Toyota: Modern Sports Cars; Nissan Silvia: Retro Sports Cars
    const result = filterCars(ALL_CARS, {
      filters: f(),
      selectedGroupIds: ['sports'],
    })
    expect(ids(result)).toEqual(ids([PORSCHE, TOYOTA, NISSAN_SILVIA]))
  })

  it('group + division: narrows to a specific division within the group', () => {
    const result = filterCars(ALL_CARS, {
      filters: f({ division: ['Retro Sports Cars'] }),
      selectedGroupIds: ['sports'],
    })
    expect(ids(result)).toEqual([NISSAN_SILVIA.id])
  })

  it('unknown group id returns empty array', () => {
    expect(
      filterCars(ALL_CARS, { filters: f(), selectedGroupIds: ['notAGroup'] })
    ).toHaveLength(0)
  })

  it('empty selectedGroupIds is a no-op', () => {
    expect(
      filterCars(ALL_CARS, { filters: f(), selectedGroupIds: [] })
    ).toHaveLength(ALL_CARS.length)
  })

  it('multi-select: ["sports", "hotHatch"] returns cars from both groups', () => {
    // sports: Modern Sports Cars + Retro Sports Cars → Porsche, Toyota, Nissan Silvia
    // hotHatch: Hot Hatch → Ford Focus
    const result = filterCars(ALL_CARS, {
      filters: f(),
      selectedGroupIds: ['sports', 'hotHatch'],
    })
    expect(ids(result)).toEqual(ids([PORSCHE, TOYOTA, NISSAN_SILVIA, FORD_FOCUS]))
  })

  it('multi-select groups + division: narrows to selected sub-divisions across groups', () => {
    // sports + offroad groups, but only Retro Sports Cars sub-division selected
    const result = filterCars(ALL_CARS, {
      filters: f({ division: ['Retro Sports Cars'] }),
      selectedGroupIds: ['sports', 'offroad'],
    })
    expect(ids(result)).toEqual([NISSAN_SILVIA.id])
  })
})

// ─── Multiple simultaneous filters (intersection, not union) ─────────────────

describe('filterCars — multiple active filters (AND/intersection)', () => {
  it('piClass + make: returns only the intersection', () => {
    // A class + Ford → only Ford Focus (Ford GT is S2)
    const result = filterCars(ALL_CARS, { filters: f({ piClass: ['A'], make: ['Ford'] }) })
    expect(ids(result)).toEqual([FORD_FOCUS.id])
  })

  it('make + country: Ford cars from USA only', () => {
    // Ford GT (USA) — Ford Focus is UK
    const result = filterCars(ALL_CARS, { filters: f({ make: ['Ford'], country: 'USA' }) })
    expect(ids(result)).toEqual([FORD_GT.id])
  })

  it('search + piClass: search for "GT" in A class returns nothing (GT3 is S1)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ search: 'GT', piClass: ['A'] }) })
    // Ford GT is S2, Porsche 911 GT3 is S1 — no A class "GT" match
    expect(result).toHaveLength(0)
  })

  it('piClass + tag: A class + dirt tag → only WRX', () => {
    const result = filterCars(ALL_CARS, {
      filters: f({ piClass: ['A'] }),
      selectedTags: new Set(['dirt']),
    })
    expect(ids(result)).toEqual([SUBARU_WRX.id])
  })

  it('make + source + drivetrain: three active filters intersect correctly', () => {
    // Ford + AWD — there are no AWD Fords in the set
    const result = filterCars(ALL_CARS, { filters: f({ make: ['Ford'], drivetrain: 'AWD' }) })
    expect(result).toHaveLength(0)
  })

  it('search + activeRaces: search "Silvia" + drift race → Nissan Silvia only', () => {
    const drift = { recommendedTags: ['drift'] }
    const result = filterCars(ALL_CARS, {
      filters: f({ search: 'Silvia' }),
      activeRaces: [drift],
    })
    expect(ids(result)).toEqual([NISSAN_SILVIA.id])
  })

  it('all five scalar filters active simultaneously → returns only matching car', () => {
    // Target: Porsche 911 GT3 (piClass S1, make Porsche, drivetrain RWD, country Germany, source Autoshow)
    const result = filterCars(ALL_CARS, {
      filters: f({
        piClass: ['S1'],
        make: ['Porsche'],
        drivetrain: 'RWD',
        country: 'Germany',
        source: 'Autoshow',
      }),
    })
    expect(ids(result)).toEqual([PORSCHE.id])
  })

  it('all scalar filters + tag chip: still returns intersection', () => {
    const result = filterCars(ALL_CARS, {
      filters: f({ piClass: ['S1'], make: ['Porsche'], country: 'Germany' }),
      selectedTags: new Set(['grip']),
    })
    expect(ids(result)).toEqual([PORSCHE.id])
  })

  it('filter combination that matches nothing returns empty array, not a throw', () => {
    expect(() =>
      filterCars(ALL_CARS, {
        filters: f({ piClass: ['D'], make: ['Bugatti'], country: 'Japan' }),
        selectedTags: new Set(['drift']),
        activeRaces: [{ recommendedTags: ['snow'] }],
      })
    ).not.toThrow()

    expect(
      filterCars(ALL_CARS, {
        filters: f({ piClass: ['D'], make: ['Bugatti'], country: 'Japan' }),
        selectedTags: new Set(['drift']),
        activeRaces: [{ recommendedTags: ['snow'] }],
      })
    ).toHaveLength(0)
  })
})

// ─── Multi-select cross-dimension (spec requirement) ─────────────────────────

describe('filterCars — multi-select category AND race type', () => {
  it('muscle group + drag race: only muscle cars tagged for drag', () => {
    // Muscle group = Classic/Retro/Modern Muscle; drag race recommendedTags includes 'drag'
    // In fixtures: Toyota (Modern Sports Cars) has 'asphalt' only — not muscle, not drag
    // FORD_GT is Modern Supercars, not muscle either
    // None of the 8 fixtures are in Muscle divisions, so result should be empty
    const result = filterCars(ALL_CARS, {
      filters: f(),
      selectedGroupIds: ['muscle'],
      activeRaces: [{ recommendedTags: ['asphalt', 'drag'] }],
    })
    expect(result).toHaveLength(0)
  })

  it('sports group + road race: sports cars with asphalt tag', () => {
    // sports group: Modern Sports Cars + Retro Sports Cars → Porsche, Toyota, Nissan Silvia
    // road race tags: ['asphalt', 'grip', 'long straights', 'technical']
    // Porsche: asphalt+grip+technical ✓; Toyota: asphalt ✓; Nissan Silvia: asphalt+grip+technical ✓
    const result = filterCars(ALL_CARS, {
      filters: f(),
      selectedGroupIds: ['sports'],
      activeRaces: [{ recommendedTags: ['asphalt', 'grip', 'long straights', 'technical'] }],
    })
    expect(ids(result)).toEqual(ids([PORSCHE, TOYOTA, NISSAN_SILVIA]))
  })
})

// ─── Empty input ──────────────────────────────────────────────────────────────

describe('filterCars — empty input array', () => {
  it('returns [] for default filters on empty input', () => {
    expect(filterCars([], { filters: f() })).toEqual([])
  })

  it('returns [] when all filters are active on empty input', () => {
    expect(
      filterCars([], {
        filters: f({ search: 'x', piClass: ['S1'], make: ['Porsche'], drivetrain: 'RWD', country: 'Germany', source: 'Autoshow' }),
        selectedTags: new Set(['grip']),
        activeRaces: [{ recommendedTags: ['asphalt'] }],
        selectedGroupIds: ['sports'],
      })
    ).toEqual([])
  })
})

// ─── Pinned / favourite filter ────────────────────────────────────────────────

describe('filterCars — pinned filter', () => {
  // Extend two fixture cars with explicit pinned state
  const PINNED_PORSCHE: Car = { ...PORSCHE, pinned: true }
  const PINNED_FORD_GT: Car = { ...FORD_GT, pinned: true }
  const UNPINNED_WRX: Car = { ...SUBARU_WRX, pinned: false }
  const UNPINNED_BUGATTI: Car = { ...BUGATTI, pinned: undefined }  // no pinned field
  const PINNED_CARS = [PINNED_PORSCHE, PINNED_FORD_GT, UNPINNED_WRX, UNPINNED_BUGATTI]

  it('filters.pinned: true returns only cars where car.pinned === true', () => {
    const result = filterCars(PINNED_CARS, { filters: f({ pinned: true }) })
    expect(ids(result)).toEqual(ids([PINNED_PORSCHE, PINNED_FORD_GT]))
    result.forEach((c) => expect(c.pinned).toBe(true))
  })

  it('filters.pinned: false is a no-op — returns all cars regardless of pin state', () => {
    const result = filterCars(PINNED_CARS, { filters: f({ pinned: false }) })
    expect(result).toHaveLength(PINNED_CARS.length)
  })

  it('car with pinned: undefined does not pass the pinned filter', () => {
    const result = filterCars([UNPINNED_BUGATTI], { filters: f({ pinned: true }) })
    expect(result).toHaveLength(0)
  })

  it('car with pinned: false does not pass the pinned filter', () => {
    const result = filterCars([UNPINNED_WRX], { filters: f({ pinned: true }) })
    expect(result).toHaveLength(0)
  })

  it('pinned filter combines with piClass — returns only pinned cars of that class', () => {
    // PINNED_PORSCHE is S1, PINNED_FORD_GT is S2 — only S1 + pinned → Porsche
    const result = filterCars(PINNED_CARS, { filters: f({ pinned: true, piClass: ['S1'] }) })
    expect(ids(result)).toEqual([PINNED_PORSCHE.id])
  })

  it('pinned filter combines with race type — intersection of pinned AND matching race tags', () => {
    // Road racing recommends ['asphalt', 'grip', 'long straights', 'technical']
    // PINNED_PORSCHE has asphalt+grip+technical (matches), PINNED_FORD_GT has asphalt+grip+long straights+drift (matches)
    // UNPINNED_WRX has dirt+mixed (no road match) — already excluded by pinned filter
    const roadRace = { recommendedTags: ['asphalt', 'grip'] as string[] }
    const result = filterCars(PINNED_CARS, {
      filters: f({ pinned: true }),
      activeRaces: [roadRace],
    })
    expect(ids(result)).toEqual(ids([PINNED_PORSCHE, PINNED_FORD_GT]))
    result.forEach((c) => expect(c.pinned).toBe(true))
  })

  it('pinned + race type with no overlap returns empty', () => {
    const snowRace = { recommendedTags: ['snow'] as string[] }
    const result = filterCars(PINNED_CARS, {
      filters: f({ pinned: true }),
      activeRaces: [snowRace],
    })
    expect(result).toHaveLength(0)
  })
})

// ─── Does not mutate input ────────────────────────────────────────────────────

describe('filterCars — purity', () => {
  it('does not mutate the input array', () => {
    const input = [...ALL_CARS]
    const before = input.map((c) => c.id)
    filterCars(input, { filters: f({ piClass: ['S1'] }) })
    expect(input.map((c) => c.id)).toEqual(before)
  })
})

// ─── Year range ───────────────────────────────────────────────────────────────
// Fixture years: 1=2019, 2=2015, 3=2022, 4=2018, 5=2020, 6=1989, 7=1970, 8=2017.

describe('filterCars — year range', () => {
  it('yearMin only keeps cars at or after the lower bound (inclusive)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMin: 2018 }) })
    expect(ids(result)).toEqual([1, 3, 4, 5]) // 2019, 2022, 2018, 2020
  })

  it('yearMax only keeps cars at or before the upper bound (inclusive)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMax: 1989 }) })
    expect(ids(result)).toEqual([6, 7]) // 1989, 1970
  })

  it('a decade range (the 80s: 1980–1989) keeps only that decade', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMin: 1980, yearMax: 1989 }) })
    expect(ids(result)).toEqual([6]) // only the 1989 Silvia
  })

  it('the 70s (1970–1979) keeps only the 1970 GMC', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMin: 1970, yearMax: 1979 }) })
    expect(ids(result)).toEqual([7])
  })

  it('null bounds are a no-op (returns every car)', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMin: null, yearMax: null }) })
    expect(ids(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('an empty range (min > max with no matching year) returns nothing', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMin: 1990, yearMax: 1999 }) })
    expect(result).toHaveLength(0)
  })

  it('combines with other filters (AND): 80s + make Nissan', () => {
    const result = filterCars(ALL_CARS, { filters: f({ yearMin: 1980, yearMax: 1989, make: ['Nissan'] }) })
    expect(ids(result)).toEqual([6])
  })
})
