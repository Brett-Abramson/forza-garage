import { describe, it, expect, vi, afterEach } from 'vitest'
import { compareRows, defaultSort, formatAddedAt, PI_CLASS_INDEX, PIN_FLOAT_KEYS } from '@/lib/sort'
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

// ─── compareRows — addedAt ────────────────────────────────────────────────────

describe('compareRows — addedAt', () => {
  const newer = '2026-06-01T12:00:00.000Z'
  const older = '2026-01-01T12:00:00.000Z'

  it('sorts older date first (asc)', () => {
    expect(compareRows(makeCar({ addedAt: older }), makeCar({ addedAt: newer }), 'addedAt', 'asc')).toBeLessThan(0)
  })

  it('sorts newer date first (desc)', () => {
    expect(compareRows(makeCar({ addedAt: newer }), makeCar({ addedAt: older }), 'addedAt', 'desc')).toBeLessThan(0)
  })

  it('returns 0 for equal dates', () => {
    expect(compareRows(makeCar({ addedAt: newer }), makeCar({ addedAt: newer }), 'addedAt', 'asc')).toBe(0)
  })

  it('null addedAt always sinks to bottom (asc) — null after non-null', () => {
    expect(compareRows(makeCar({ addedAt: null }), makeCar({ addedAt: older }), 'addedAt', 'asc')).toBeGreaterThan(0)
  })

  it('null addedAt always sinks to bottom (desc) — null still after non-null', () => {
    expect(compareRows(makeCar({ addedAt: null }), makeCar({ addedAt: older }), 'addedAt', 'desc')).toBeGreaterThan(0)
  })

  it('non-null sorts before null (asc)', () => {
    expect(compareRows(makeCar({ addedAt: older }), makeCar({ addedAt: null }), 'addedAt', 'asc')).toBeLessThan(0)
  })

  it('both null returns 0', () => {
    expect(compareRows(makeCar({ addedAt: null }), makeCar({ addedAt: null }), 'addedAt', 'asc')).toBe(0)
  })
})

// ─── compareRows — value (nulls always last) ─────────────────────────────────

describe('compareRows — value nulls-last', () => {
  it('sorts lower value first (asc)', () => {
    expect(compareRows(makeCar({ value: 10_000 }), makeCar({ value: 50_000 }), 'value', 'asc')).toBeLessThan(0)
  })

  it('sorts higher value first (desc)', () => {
    expect(compareRows(makeCar({ value: 50_000 }), makeCar({ value: 10_000 }), 'value', 'desc')).toBeLessThan(0)
  })

  it('null value always sinks to bottom (asc) — null after non-null', () => {
    expect(compareRows(makeCar({ value: null }), makeCar({ value: 10_000 }), 'value', 'asc')).toBeGreaterThan(0)
  })

  it('null value always sinks to bottom (desc) — null still after non-null', () => {
    expect(compareRows(makeCar({ value: null }), makeCar({ value: 10_000 }), 'value', 'desc')).toBeGreaterThan(0)
  })

  it('non-null sorts before null (desc) — a null car does not top the list', () => {
    expect(compareRows(makeCar({ value: 10_000 }), makeCar({ value: null }), 'value', 'desc')).toBeLessThan(0)
  })

  it('both null returns 0', () => {
    expect(compareRows(makeCar({ value: null }), makeCar({ value: null }), 'value', 'asc')).toBe(0)
  })
})

// ─── PIN_FLOAT_KEYS membership ───────────────────────────────────────────────

describe('PIN_FLOAT_KEYS', () => {
  it('contains addedAt, make, model, year', () => {
    expect(PIN_FLOAT_KEYS.has('addedAt')).toBe(true)
    expect(PIN_FLOAT_KEYS.has('make')).toBe(true)
    expect(PIN_FLOAT_KEYS.has('model')).toBe(true)
    expect(PIN_FLOAT_KEYS.has('year')).toBe(true)
  })

  it('does not contain piRating or value (numeric sorts — no pin float)', () => {
    expect(PIN_FLOAT_KEYS.has('piRating')).toBe(false)
    expect(PIN_FLOAT_KEYS.has('value')).toBe(false)
  })
})

// ─── Pin float — pinned cars rise above unpinned on label sorts ───────────────

describe('compareRows — pin float on label sorts', () => {
  const pinned   = makeCar({ pinned: true })
  const unpinned = makeCar({ pinned: false })

  const floatKeys: SortKey[] = ['make', 'model', 'year', 'addedAt']

  it.each(floatKeys)('%s asc: pinned car sorts before unpinned car', (key) => {
    expect(compareRows(pinned, unpinned, key, 'asc')).toBeLessThan(0)
  })

  it.each(floatKeys)('%s desc: pinned car still sorts before unpinned car', (key) => {
    expect(compareRows(pinned, unpinned, key, 'desc')).toBeLessThan(0)
  })

  it.each(floatKeys)('%s: two pinned cars are not reordered by pin alone (returns 0)', (key) => {
    const a = makeCar({ pinned: true, make: 'Same', model: 'Same', year: 2020, addedAt: '2026-01-01T00:00:00.000Z' })
    const b = makeCar({ pinned: true, make: 'Same', model: 'Same', year: 2020, addedAt: '2026-01-01T00:00:00.000Z' })
    expect(compareRows(a, b, key, 'asc')).toBe(0)
  })

  it.each(floatKeys)('%s: two unpinned cars are not reordered by pin alone (returns 0)', (key) => {
    const a = makeCar({ pinned: false, make: 'Same', model: 'Same', year: 2020, addedAt: '2026-01-01T00:00:00.000Z' })
    const b = makeCar({ pinned: false, make: 'Same', model: 'Same', year: 2020, addedAt: '2026-01-01T00:00:00.000Z' })
    expect(compareRows(a, b, key, 'asc')).toBe(0)
  })
})

describe('compareRows — NO pin float on numeric sorts', () => {
  const pinnedLow  = makeCar({ pinned: true,  piRating: 100, value: 10_000 })
  const unpinnedHi = makeCar({ pinned: false, piRating: 999, value: 999_999 })

  it('piRating asc: lower rating still sorts first even when that car is unpinned', () => {
    expect(compareRows(pinnedLow, unpinnedHi, 'piRating', 'asc')).toBeLessThan(0)
  })

  it('piRating desc: higher rating sorts first — pinned low-rating car does NOT jump ahead', () => {
    expect(compareRows(unpinnedHi, pinnedLow, 'piRating', 'desc')).toBeLessThan(0)
  })

  it('value asc: lower value sorts first regardless of pin state', () => {
    expect(compareRows(pinnedLow, unpinnedHi, 'value', 'asc')).toBeLessThan(0)
  })

  it('value desc: higher value sorts first — pinned low-value car does NOT jump ahead', () => {
    expect(compareRows(unpinnedHi, pinnedLow, 'value', 'desc')).toBeLessThan(0)
  })
})

// ─── formatAddedAt ────────────────────────────────────────────────────────────

describe('formatAddedAt', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const freeze = (iso: string) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(iso))
  }

  it('returns null for null input', () => {
    expect(formatAddedAt(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(formatAddedAt(undefined)).toBeNull()
  })

  it('returns null for invalid date string', () => {
    expect(formatAddedAt('not-a-date')).toBeNull()
  })

  it('returns "Added today" for same-day date', () => {
    freeze('2026-06-02T15:00:00.000Z')
    expect(formatAddedAt('2026-06-02T08:00:00.000Z')).toBe('Added today')
  })

  it('returns "Added yesterday" for ~1 day ago', () => {
    freeze('2026-06-02T15:00:00.000Z')
    expect(formatAddedAt('2026-06-01T08:00:00.000Z')).toBe('Added yesterday')
  })

  it('returns "Added N days ago" for 2–6 days', () => {
    freeze('2026-06-06T12:00:00.000Z')
    expect(formatAddedAt('2026-06-03T12:00:00.000Z')).toBe('Added 3 days ago')
  })

  it('returns "Added last week" for 7–13 days ago', () => {
    freeze('2026-06-10T12:00:00.000Z')
    expect(formatAddedAt('2026-06-03T12:00:00.000Z')).toBe('Added last week')
  })

  it('returns a short date string for 14+ days ago', () => {
    freeze('2026-06-20T12:00:00.000Z')
    const result = formatAddedAt('2026-06-01T12:00:00.000Z')
    expect(result).toMatch(/^Added \d+ \w+$/)
  })
})

// ─── compareRows — registry metric sort (Sim view) ────────────────────────────

describe('compareRows — lowerBetter metric (simZeroToSixty)', () => {
  const fast = makeCar({ simZeroToSixty: 3.0 })
  const slow = makeCar({ simZeroToSixty: 5.0 })

  it('asc surfaces best-first: the quicker 0–60 sorts first', () => {
    expect(compareRows(fast, slow, 'simZeroToSixty', 'asc')).toBeLessThan(0)
  })

  it('desc flips it: the slower 0–60 sorts first', () => {
    expect(compareRows(fast, slow, 'simZeroToSixty', 'desc')).toBeGreaterThan(0)
  })

  it('returns 0 for equal values', () => {
    expect(compareRows(fast, makeCar({ simZeroToSixty: 3.0 }), 'simZeroToSixty', 'asc')).toBe(0)
  })
})

describe('compareRows — higherBetter metric (simTopSpeed)', () => {
  const faster = makeCar({ simTopSpeed: 220 })
  const slower = makeCar({ simTopSpeed: 150 })

  it('asc surfaces best-first: the higher top speed sorts first', () => {
    expect(compareRows(faster, slower, 'simTopSpeed', 'asc')).toBeLessThan(0)
  })

  it('desc flips it: the lower top speed sorts first', () => {
    expect(compareRows(faster, slower, 'simTopSpeed', 'desc')).toBeGreaterThan(0)
  })
})

describe('compareRows — metric nulls always sort last', () => {
  const value = makeCar({ simBraking60: 110 })
  const noScrape = makeCar({ simBraking60: null })

  it('null sinks below a value (asc)', () => {
    expect(compareRows(noScrape, value, 'simBraking60', 'asc')).toBeGreaterThan(0)
    expect(compareRows(value, noScrape, 'simBraking60', 'asc')).toBeLessThan(0)
  })

  it('null still sinks below a value (desc) — a failed scrape never tops the list', () => {
    expect(compareRows(noScrape, value, 'simBraking60', 'desc')).toBeGreaterThan(0)
    expect(compareRows(value, noScrape, 'simBraking60', 'desc')).toBeLessThan(0)
  })

  it('two nulls are equal', () => {
    expect(compareRows(noScrape, makeCar({ simBraking60: null }), 'simBraking60', 'asc')).toBe(0)
  })
})

describe('compareRows — derived power-to-weight metric', () => {
  // Computed from powerHp / weightLb via the registry accessor (higherBetter).
  const strong = makeCar({ powerHp: 600, weightLb: 3000 }) // 0.20
  const weak   = makeCar({ powerHp: 300, weightLb: 3000 }) // 0.10

  it('asc surfaces best-first: the higher ratio sorts first', () => {
    expect(compareRows(strong, weak, 'powerToWeight', 'asc')).toBeLessThan(0)
  })

  it('a car missing an input sorts last (null) regardless of direction', () => {
    const unknown = makeCar({ powerHp: null, weightLb: 3000 })
    expect(compareRows(unknown, weak, 'powerToWeight', 'asc')).toBeGreaterThan(0)
    expect(compareRows(unknown, weak, 'powerToWeight', 'desc')).toBeGreaterThan(0)
  })
})
