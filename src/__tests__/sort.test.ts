import { describe, it, expect } from 'vitest'
import { compareRows, defaultSort, PI_CLASS_INDEX } from '@/lib/sort'
import type { Car } from '@/types/car'
import type { SortKey } from '@/lib/sort'

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
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
  ...overrides,
})

// ─── PI_CLASS_INDEX ──────────────────────────────────────────────────────────

describe('PI_CLASS_INDEX', () => {
  it('assigns increasing indices D → C → B → A → S1 → S2 → R', () => {
    const order = ['D', 'C', 'B', 'A', 'S1', 'S2', 'R']
    for (let i = 0; i < order.length - 1; i++) {
      expect(PI_CLASS_INDEX[order[i]]).toBeLessThan(PI_CLASS_INDEX[order[i + 1]])
    }
  })

  it('covers all seven classes', () => {
    expect(Object.keys(PI_CLASS_INDEX)).toHaveLength(7)
  })
})

// ─── compareRows ─────────────────────────────────────────────────────────────

describe('compareRows — piClass', () => {
  it('sorts lower class before higher class (asc)', () => {
    expect(compareRows(makeCar({ piClass: 'D' }), makeCar({ piClass: 'R' }), 'piClass', 'asc')).toBeLessThan(0)
  })

  it('sorts higher class before lower class (desc)', () => {
    expect(compareRows(makeCar({ piClass: 'R' }), makeCar({ piClass: 'D' }), 'piClass', 'desc')).toBeLessThan(0)
  })

  it('returns 0 for equal classes', () => {
    expect(compareRows(makeCar({ piClass: 'S1' }), makeCar({ piClass: 'S1' }), 'piClass', 'asc')).toBe(0)
  })

  it('correctly orders adjacent classes S1 < S2', () => {
    const result = compareRows(makeCar({ piClass: 'S1' }), makeCar({ piClass: 'S2' }), 'piClass', 'asc')
    expect(result).toBeLessThan(0)
  })

  it('correctly orders B < A', () => {
    const result = compareRows(makeCar({ piClass: 'B' }), makeCar({ piClass: 'A' }), 'piClass', 'asc')
    expect(result).toBeLessThan(0)
  })
})

describe('compareRows — piRating', () => {
  it('sorts lower rating first (asc)', () => {
    expect(compareRows(makeCar({ piRating: 700 }), makeCar({ piRating: 900 }), 'piRating', 'asc')).toBeLessThan(0)
  })

  it('sorts higher rating first (desc)', () => {
    expect(compareRows(makeCar({ piRating: 900 }), makeCar({ piRating: 700 }), 'piRating', 'desc')).toBeLessThan(0)
  })

  it('returns 0 for equal ratings', () => {
    expect(compareRows(makeCar({ piRating: 800 }), makeCar({ piRating: 800 }), 'piRating', 'asc')).toBe(0)
  })
})

describe('compareRows — year', () => {
  it('sorts earlier year first (asc)', () => {
    expect(compareRows(makeCar({ year: 1969 }), makeCar({ year: 2020 }), 'year', 'asc')).toBeLessThan(0)
  })

  it('sorts later year first (desc)', () => {
    expect(compareRows(makeCar({ year: 2020 }), makeCar({ year: 1969 }), 'year', 'desc')).toBeLessThan(0)
  })
})

describe('compareRows — string fields', () => {
  const stringKeys: SortKey[] = ['make', 'model', 'division', 'country', 'source']

  it.each(stringKeys)('%s sorts alphabetically (asc)', (key) => {
    const a = makeCar({ [key as string]: 'Aardvark' })
    const b = makeCar({ [key as string]: 'Zebra' })
    expect(compareRows(a, b, key, 'asc')).toBeLessThan(0)
  })

  it.each(stringKeys)('%s sorts reverse-alphabetically (desc)', (key) => {
    const a = makeCar({ [key as string]: 'Zebra' })
    const b = makeCar({ [key as string]: 'Aardvark' })
    expect(compareRows(a, b, key, 'desc')).toBeLessThan(0)
  })

  it.each(stringKeys)('%s returns 0 for equal values', (key) => {
    const a = makeCar({ [key as string]: 'Same' })
    const b = makeCar({ [key as string]: 'Same' })
    expect(compareRows(a, b, key, 'asc')).toBe(0)
  })
})

// ─── defaultSort ─────────────────────────────────────────────────────────────

describe('defaultSort', () => {
  it('puts owned cars before unowned cars', () => {
    const owned = makeCar({ owned: true, piClass: 'D', piRating: 100 })
    const unowned = makeCar({ owned: false, piClass: 'X', piRating: 999 })
    expect(defaultSort(owned, unowned)).toBeLessThan(0)
  })

  it('among unowned cars, sorts higher PI class first', () => {
    const rCar = makeCar({ piClass: 'R', piRating: 999 })
    const dCar = makeCar({ piClass: 'D', piRating: 100 })
    expect(defaultSort(rCar, dCar)).toBeLessThan(0)
  })

  it('among same PI class, sorts higher PI rating first', () => {
    const fast = makeCar({ piClass: 'A', piRating: 799 })
    const faster = makeCar({ piClass: 'A', piRating: 800 })
    expect(defaultSort(faster, fast)).toBeLessThan(0)
  })

  it('returns 0 for identical owned/class/rating', () => {
    const a = makeCar({ owned: false, piClass: 'S1', piRating: 850 })
    const b = makeCar({ owned: false, piClass: 'S1', piRating: 850 })
    expect(defaultSort(a, b)).toBe(0)
  })
})
