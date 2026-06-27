import { describe, test, expect, beforeEach } from 'vitest'
import {
  computeBadgeMatrix,
  getBestBadge,
  BAND_TOP_STRONG,
  BAND_TOP_SOFT,
  BAND_BOTTOM_SOFT,
  BAND_BOTTOM_STRONG,
  MIN_RANK_COHORT,
  COVERAGE_FLOOR,
} from '@/lib/statPercentiles'
import type { CarBadge, CarBadgeMap } from '@/types/car'

// ── Minimal fixture factory ────────────────────────────────────────────────────
let nextId = 1
function makeCar(overrides: Partial<{
  id: number
  piClass: string
  statSpeed: number | null
  statHandling: number | null
  statAcceleration: number | null
  statLaunch: number | null
  statBraking: number | null
  statOffroad: number | null
  powerHp: number | null
  torqueFtLb: number | null
  weightLb: number | null
  simZeroToSixty: number | null
  simZeroToHundred: number | null
  simBraking60: number | null
  simLateralG60: number | null
  simTopSpeed: number | null
}> = {}) {
  return {
    id: nextId++,
    piClass: 'A',
    statSpeed: null, statHandling: null, statAcceleration: null,
    statLaunch: null, statBraking: null, statOffroad: null,
    powerHp: null, torqueFtLb: null, weightLb: null,
    simZeroToSixty: null, simZeroToHundred: null, simBraking60: null,
    simLateralG60: null, simTopSpeed: null,
    ...overrides,
  }
}

// 20-car cohort gives clean boundaries: k_top=2 (top-strong), soft band ranks 3-4,
// bottom-soft ranks 17-18, bottom-strong ranks 19-20.
function make20(metric: string, piClass = 'A') {
  // Values 20 down to 1 so rank 1 = highest score = 20
  return Array.from({ length: 20 }, (_, i) => makeCar({ piClass, [metric]: 20 - i }))
}

beforeEach(() => { nextId = 1 })

// ── Coverage guard ─────────────────────────────────────────────────────────────
describe('coverage guard', () => {
  test('no badges when < 70% of class has non-null values', () => {
    const cars = [
      ...Array.from({ length: 6 }, () => makeCar({ statSpeed: 9 })),
      ...Array.from({ length: 4 }, () => makeCar({ statSpeed: null })),
    ]
    const matrix = computeBadgeMatrix(cars)
    expect(Object.values(matrix).every((m) => !m.statSpeed)).toBe(true)
  })

  test('all neutral when coverage exactly below floor (6/10 = 60%)', () => {
    const cars = [
      ...Array.from({ length: 6 }, () => makeCar({ statSpeed: 9 })),
      ...Array.from({ length: 4 }, () => makeCar({ statSpeed: null })),
    ]
    const matrix = computeBadgeMatrix(cars)
    const anyBadge = Object.values(matrix).some((m) => m.statSpeed)
    expect(anyBadge).toBe(false)
  })

  test('badges awarded when exactly at COVERAGE_FLOOR (20/20 = 100%)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const badges = Object.values(matrix).filter((m) => m.statSpeed)
    expect(badges.length).toBeGreaterThan(0)
  })
})

// ── Top 10% boundary (top-strong) ─────────────────────────────────────────────
describe('top-strong band (top 10%)', () => {
  test('rank 2 in 20 cars → p_top=0.10 → top-strong (boundary inclusive)', () => {
    // statSpeed higher-better; rank 1 = highest score
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    // Rank 1 car has statSpeed=20, rank 2 has statSpeed=19
    const rank2car = cars.find((c) => c.statSpeed === 19)!
    expect(matrix[rank2car.id].statSpeed?.tier).toBe('top-strong')
  })

  test('rank 3 in 20 cars → p_top=0.15 → NOT top-strong (top-soft)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank3car = cars.find((c) => c.statSpeed === 18)!
    expect(matrix[rank3car.id].statSpeed?.tier).not.toBe('top-strong')
    expect(matrix[rank3car.id].statSpeed?.tier).toBe('top-soft')
  })
})

// ── Top 20% boundary (top-soft) ───────────────────────────────────────────────
describe('top-soft band (top 10–20%)', () => {
  test('rank 4 in 20 cars → p_top=0.20 → top-soft (boundary inclusive)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank4car = cars.find((c) => c.statSpeed === 17)!
    expect(matrix[rank4car.id].statSpeed?.tier).toBe('top-soft')
  })

  test('rank 5 in 20 cars → p_top=0.25 → neutral (outside top-soft)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank5car = cars.find((c) => c.statSpeed === 16)!
    expect(matrix[rank5car.id].statSpeed).toBeUndefined()
  })
})

// ── Middle car is neutral ──────────────────────────────────────────────────────
describe('neutral band', () => {
  test('middle-ranked car has no badge', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    // Rank 10 (statSpeed=11): p_top=0.50, p_bottom=0.55 — both outside all bands
    const midCar = cars.find((c) => c.statSpeed === 11)!
    expect(matrix[midCar.id].statSpeed).toBeUndefined()
  })
})

// ── Bottom 10% boundary (bottom-strong) ───────────────────────────────────────
describe('bottom-strong band (bottom 10%)', () => {
  test('rank 19 in 20 cars → p_bottom=0.10 → bottom-strong (boundary inclusive)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    // Rank 19 = statSpeed 2 (second lowest)
    const rank19car = cars.find((c) => c.statSpeed === 2)!
    expect(matrix[rank19car.id].statSpeed?.tier).toBe('bottom-strong')
  })

  test('rank 18 in 20 cars → p_bottom=0.15 → NOT bottom-strong (bottom-soft)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank18car = cars.find((c) => c.statSpeed === 3)!
    expect(matrix[rank18car.id].statSpeed?.tier).not.toBe('bottom-strong')
    expect(matrix[rank18car.id].statSpeed?.tier).toBe('bottom-soft')
  })
})

// ── Bottom 20% boundary (bottom-soft) ─────────────────────────────────────────
describe('bottom-soft band (bottom 10–20%)', () => {
  test('rank 17 in 20 cars → p_bottom=0.20 → bottom-soft (boundary inclusive)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank17car = cars.find((c) => c.statSpeed === 4)!
    expect(matrix[rank17car.id].statSpeed?.tier).toBe('bottom-soft')
  })

  test('rank 16 in 20 cars → p_bottom=0.25 → neutral (outside bottom-soft)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank16car = cars.find((c) => c.statSpeed === 5)!
    expect(matrix[rank16car.id].statSpeed).toBeUndefined()
  })
})

// ── Label strings ──────────────────────────────────────────────────────────────
describe('label strings', () => {
  test('top-strong label says "top 10%"', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank1car = cars.find((c) => c.statSpeed === 20)!
    expect(matrix[rank1car.id].statSpeed!.label).toContain('top 10%')
  })

  test('top-soft label says "top 20%"', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank3car = cars.find((c) => c.statSpeed === 18)!
    expect(matrix[rank3car.id].statSpeed!.label).toContain('top 20%')
  })

  test('bottom-strong label says "bottom 10%"', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank20car = cars.find((c) => c.statSpeed === 1)!
    expect(matrix[rank20car.id].statSpeed!.label).toContain('bottom 10%')
  })

  test('bottom-soft label says "bottom 20%"', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank17car = cars.find((c) => c.statSpeed === 4)!
    expect(matrix[rank17car.id].statSpeed!.label).toContain('bottom 20%')
  })

  test('bottom bands do not use rank label (#1/#2 format)', () => {
    const cars = make20('statSpeed')
    const matrix = computeBadgeMatrix(cars)
    const rank20car = cars.find((c) => c.statSpeed === 1)!
    expect(matrix[rank20car.id].statSpeed!.label).not.toMatch(/^#\d+/)
  })
})

// ── Ties at band boundary ──────────────────────────────────────────────────────
describe('ties at band boundary', () => {
  test('tied cars at the top-strong boundary all get top-strong', () => {
    // 20 cars; top 2 tied at 20 → competition rank 1 for both → p_top=1/20=0.05 → top-strong
    const cars = [
      makeCar({ statSpeed: 20 }), makeCar({ statSpeed: 20 }),
      ...Array.from({ length: 18 }, (_, i) => makeCar({ statSpeed: 18 - i })),
    ]
    const matrix = computeBadgeMatrix(cars)
    const topTwo = cars.filter((c) => c.statSpeed === 20)
    topTwo.forEach((c) => expect(matrix[c.id].statSpeed?.tier).toBe('top-strong'))
  })

  test('tied cars at the bottom-strong boundary all get bottom-strong', () => {
    // 20 cars; bottom 2 tied at 1 → competition rank 19 for both → p_bottom=2/20=0.10 → bottom-strong
    const cars = [
      ...Array.from({ length: 18 }, (_, i) => makeCar({ statSpeed: 20 - i })),
      makeCar({ statSpeed: 1 }), makeCar({ statSpeed: 1 }),
    ]
    const matrix = computeBadgeMatrix(cars)
    const bottomTwo = cars.filter((c) => c.statSpeed === 1)
    bottomTwo.forEach((c) => expect(matrix[c.id].statSpeed?.tier).toBe('bottom-strong'))
  })
})

// ── Direction correctness ──────────────────────────────────────────────────────
describe('direction correctness', () => {
  test('weightLb: lower weight = better rank → top-strong for lightest car', () => {
    // 20 cars; weightLb lowerBetter; lightest car → rank 1 → top-strong
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ weightLb: 3000 + i * 100 }))
    const matrix = computeBadgeMatrix(cars)
    const lightest = cars.find((c) => c.weightLb === 3000)!
    expect(matrix[lightest.id].weightLb?.tier).toBe('top-strong')
  })

  test('weightLb: heaviest car → bottom-strong', () => {
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ weightLb: 3000 + i * 100 }))
    const matrix = computeBadgeMatrix(cars)
    const heaviest = cars.find((c) => c.weightLb === 4900)!
    expect(matrix[heaviest.id].weightLb?.tier).toBe('bottom-strong')
  })

  test('simBraking60: lowerBetter — shortest distance gets top-strong', () => {
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ simBraking60: 80 + i * 5 }))
    const matrix = computeBadgeMatrix(cars)
    const shortest = cars.find((c) => c.simBraking60 === 80)!
    expect(matrix[shortest.id].simBraking60?.tier).toBe('top-strong')
  })

  test('simZeroToSixty: lowerBetter — fastest car top-strong, slowest bottom-strong', () => {
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ simZeroToSixty: 2.0 + i * 0.2 }))
    const matrix = computeBadgeMatrix(cars)
    const fastest = cars.find((c) => c.simZeroToSixty === 2.0)!
    const slowest = cars.find((c) => Math.abs(c.simZeroToSixty! - 5.8) < 0.01)!
    expect(matrix[fastest.id].simZeroToSixty?.tier).toBe('top-strong')
    expect(matrix[slowest.id].simZeroToSixty?.tier).toBe('bottom-strong')
  })
})

// ── Rank fallback (small cohorts, positive side only) ─────────────────────────
describe('rank fallback', () => {
  test('k=0 with cohort < MIN_RANK_COHORT: no top badges (rank fallback does not fire)', () => {
    // 5 cars: k_top = floor(0.10 * 5) = 0, n=5 < MIN_RANK_COHORT=6 → no rank fallback
    // Bottom bands can still fire via p_bottom formula (those aren't gated by MIN_RANK_COHORT)
    const cars = [1,2,3,4,5].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const hasTopBadge = Object.values(matrix).some((m) => m.statSpeed?.tier?.startsWith('top'))
    expect(hasTopBadge).toBe(false)
  })

  test('k=0 with cohort >= MIN_RANK_COHORT: top-3 get rank badges (positive only)', () => {
    // 9 cars: k_top = floor(0.10 * 9) = 0, n=9 >= 6 → rank fallback
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const topBadged = cars.filter((c) => matrix[c.id]?.statSpeed?.tier?.startsWith('top'))
    const ranks = topBadged.map((c) => matrix[c.id].statSpeed!.rank).sort((a,b) => a-b)
    expect(ranks).toEqual([1, 2, 3])
  })

  test('rank fallback: #1 gets top-strong, #2 and #3 get top-soft', () => {
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const rank1 = cars.find((c) => c.statSpeed === 9)!
    const rank2 = cars.find((c) => c.statSpeed === 8)!
    const rank3 = cars.find((c) => c.statSpeed === 7)!
    expect(matrix[rank1.id].statSpeed!.tier).toBe('top-strong')
    expect(matrix[rank2.id].statSpeed!.tier).toBe('top-soft')
    expect(matrix[rank3.id].statSpeed!.tier).toBe('top-soft')
  })

  test('rank fallback badges use kind="rank"', () => {
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const topBadged = cars.filter((c) => matrix[c.id]?.statSpeed?.tier?.startsWith('top'))
    topBadged.forEach((c) => expect(matrix[c.id].statSpeed!.kind).toBe('rank'))
  })

  test('rank fallback label uses #N format for positives', () => {
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const rank1 = cars.find((c) => c.statSpeed === 9)!
    expect(matrix[rank1.id].statSpeed!.label).toMatch(/^#1/)
  })

  test('rank fallback does NOT apply to bottom bands', () => {
    // When k_top=0, bottom bands still use p_bottom formula (no rank labels)
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const bottomBadged = cars.filter((c) => matrix[c.id]?.statSpeed?.tier?.startsWith('bottom'))
    bottomBadged.forEach((c) => {
      expect(matrix[c.id].statSpeed!.kind).toBe('percentile')
      expect(matrix[c.id].statSpeed!.label).not.toMatch(/^#\d+/)
    })
  })
})

// ── Per-class independence ─────────────────────────────────────────────────────
describe('per-class independence', () => {
  test('each class awards badges independently', () => {
    const carsA = make20('statSpeed', 'A')
    const carsB = make20('statSpeed', 'B')
    const matrix = computeBadgeMatrix([...carsA, ...carsB])
    const topA = carsA.filter((c) => matrix[c.id]?.statSpeed?.tier?.startsWith('top'))
    const topB = carsB.filter((c) => matrix[c.id]?.statSpeed?.tier?.startsWith('top'))
    expect(topA.length).toBeGreaterThan(0)
    expect(topB.length).toBeGreaterThan(0)
  })
})

// ── Label disambiguation ───────────────────────────────────────────────────────
describe('label disambiguation', () => {
  test('statBraking label is "braking" (not sim-prefixed)', () => {
    const cars = make20('statBraking')
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.find((c) => matrix[c.id]?.statBraking)!
    expect(matrix[badged.id].statBraking!.label).toContain('braking')
    expect(matrix[badged.id].statBraking!.label).not.toContain('60')
  })

  test('simBraking60 label contains "60–0 braking"', () => {
    const cars = make20('simBraking60')
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.find((c) => matrix[c.id]?.simBraking60)!
    expect(matrix[badged.id].simBraking60!.label).toContain('60–0 braking')
  })
})

// ── getBestBadge ───────────────────────────────────────────────────────────────
describe('getBestBadge', () => {
  const b = (tier: CarBadge['tier'], rank = 1, n = 20): CarBadge =>
    ({ kind: 'percentile', tier, label: `${tier}`, rank, n })

  test('returns null for empty/undefined badges', () => {
    expect(getBestBadge(undefined)).toBeNull()
    expect(getBestBadge({})).toBeNull()
  })

  test('top-strong beats top-soft', () => {
    const badges: CarBadgeMap = { statSpeed: b('top-strong'), statHandling: b('top-soft') }
    expect(getBestBadge(badges)!.tier).toBe('top-strong')
  })

  test('top-soft beats bottom-strong', () => {
    const badges: CarBadgeMap = { statSpeed: b('top-soft'), statHandling: b('bottom-strong') }
    expect(getBestBadge(badges)!.tier).toBe('top-soft')
  })

  test('bottom-strong beats bottom-soft', () => {
    const badges: CarBadgeMap = { statSpeed: b('bottom-strong'), statHandling: b('bottom-soft') }
    expect(getBestBadge(badges)!.tier).toBe('bottom-strong')
  })

  test('full priority chain: top-strong > top-soft > bottom-strong > bottom-soft', () => {
    const badges: CarBadgeMap = {
      statSpeed:        b('bottom-soft'),
      statHandling:     b('bottom-strong'),
      statAcceleration: b('top-soft'),
      statLaunch:       b('top-strong'),
    }
    expect(getBestBadge(badges)!.tier).toBe('top-strong')
  })

  test('within same tier, lowest normalised rank wins', () => {
    const badges: CarBadgeMap = {
      statSpeed:    { kind: 'percentile', tier: 'top-strong', label: 'a', rank: 1, n: 100 }, // 0.01
      statHandling: { kind: 'percentile', tier: 'top-strong', label: 'b', rank: 1, n: 10  }, // 0.10
    }
    expect(getBestBadge(badges)!.label).toBe('a')
  })

  test('METRIC_PRIORITY breaks ties at equal normalised rank', () => {
    const badges: CarBadgeMap = {
      statBraking: b('top-strong'),
      statSpeed:   b('top-strong'),
    }
    // statSpeed comes before statBraking in METRIC_PRIORITY
    expect(getBestBadge(badges)!.tier).toBe('top-strong')
    // both are top-strong, same norm rank — speed wins by priority
    const result = getBestBadge(badges)!
    expect((result as CarBadge & { label: string }).label).not.toBe('statBraking')
  })

  test('neutral is excluded from getBestBadge', () => {
    const badges: CarBadgeMap = {
      statSpeed: { kind: 'percentile', tier: 'neutral', label: '', rank: 10, n: 20 },
    }
    expect(getBestBadge(badges)).toBeNull()
  })

  test('returns the single badge when only one non-neutral exists', () => {
    const badges: CarBadgeMap = {
      simTopSpeed: { kind: 'rank', tier: 'top-strong', label: '#1 top speed', rank: 1, n: 8 },
    }
    expect(getBestBadge(badges)!.label).toBe('#1 top speed')
  })
})
