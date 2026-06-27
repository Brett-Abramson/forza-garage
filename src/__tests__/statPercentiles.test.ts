import { describe, test, expect, beforeEach } from 'vitest'
import {
  computeBadgeMatrix,
  getBestBadge,
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
    statSpeed: null,
    statHandling: null,
    statAcceleration: null,
    statLaunch: null,
    statBraking: null,
    statOffroad: null,
    powerHp: null,
    torqueFtLb: null,
    weightLb: null,
    simZeroToSixty: null,
    simZeroToHundred: null,
    simBraking60: null,
    simLateralG60: null,
    simTopSpeed: null,
    ...overrides,
  }
}

// Build 10 cars in class A so the 10% threshold k = floor(0.1 * 10) = 1
function make10(metric: string, values: (number | null)[], piClass = 'A') {
  return values.map((v) => makeCar({ piClass, [metric]: v }))
}

beforeEach(() => { nextId = 1 })

// ── Coverage guard ─────────────────────────────────────────────────────────────
describe('coverage guard', () => {
  test('no badges when < 70% of class has non-null values', () => {
    // 10 cars, only 6 have statSpeed (60%) — below COVERAGE_FLOOR (70%)
    const cars = [
      ...Array.from({ length: 6 }, () => makeCar({ statSpeed: 9 })),
      ...Array.from({ length: 4 }, () => makeCar({ statSpeed: null })),
    ]
    const matrix = computeBadgeMatrix(cars)
    expect(Object.values(matrix).every((m) => !m.statSpeed)).toBe(true)
  })

  test('badges awarded when exactly COVERAGE_FLOOR met (10/10 = 100%)', () => {
    const cars = make10('statSpeed', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    const matrix = computeBadgeMatrix(cars)
    const badges = Object.values(matrix).filter((m) => m.statSpeed)
    expect(badges.length).toBeGreaterThan(0)
  })
})

// ── Percentile cutoff strictness ───────────────────────────────────────────────
describe('strict percentile cutoff', () => {
  test('bar stat: 10 cars → k=1, only rank-1 gets a badge', () => {
    // statSpeed higher-better; rank 1 = score 10
    const cars = make10('statSpeed', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    expect(badged).toHaveLength(1)
    expect(matrix[badged[0].id].statSpeed!.rank).toBe(1)
  })

  test('sim metric: 20 cars → k=1 (5% of 20), only rank-1 gets a badge', () => {
    // simZeroToSixty lower-better (faster = better); rank 1 = lowest time
    const values = Array.from({ length: 20 }, (_, i) => i + 1) as number[]
    const cars = values.map((v) => makeCar({ simZeroToSixty: v }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.simZeroToSixty)
    expect(badged).toHaveLength(1)
    expect(matrix[badged[0].id].simZeroToSixty!.rank).toBe(1)
  })
})

// ── Ties (competition ranking) ─────────────────────────────────────────────────
describe('competition ranking with ties', () => {
  test('ties share rank and all qualify if within threshold', () => {
    // 20 cars: top 2 tied at 10, k = floor(0.1 * 20) = 2 → both get badge at rank 1
    const values: (number | null)[] = [10, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const cars = values.map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    expect(badged).toHaveLength(2)
    badged.forEach((c) => expect(matrix[c.id].statSpeed!.rank).toBe(1))
  })

  test('tie at boundary: if tie pushes beyond k, none of the tied group qualifies', () => {
    // 10 cars; k=1; top 2 tied at 10 → both have rank 1 ≤ k=1, both qualify
    // BUT: if tie is at the cutoff edge where group rank > k, they should not qualify
    // Test: 10 cars; k=1; rank-2 tie cannot have rank <= 1
    const values: (number | null)[] = [10, 9, 9, 8, 7, 6, 5, 4, 3, 2]
    const cars = values.map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    // Only rank 1 (score=10) qualifies; the two score=9 cars have competition rank 2 > k=1
    expect(badged).toHaveLength(1)
    expect(matrix[badged[0].id].statSpeed!.rank).toBe(1)
  })
})

// ── Rank fallback (small cohorts) ─────────────────────────────────────────────
describe('rank fallback', () => {
  test('k=0 with small cohort < MIN_RANK_COHORT yields no badges', () => {
    // 5 cars at BADGE_THRESHOLD_BARS (0.10): k = floor(0.10 * 5) = 0
    // MIN_RANK_COHORT=6 → no fallback
    const cars = [1,2,3,4,5].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    expect(Object.values(matrix).every((m) => !m.statSpeed)).toBe(true)
  })

  test('k=0 with cohort >= MIN_RANK_COHORT awards top-3 rank badges', () => {
    // 9 cars: k = floor(0.10 * 9) = 0, n=9 >= 6 → rank fallback
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    expect(badged).toHaveLength(3)
    const ranks = badged.map((c) => matrix[c.id].statSpeed!.rank).sort((a,b) => a-b)
    expect(ranks).toEqual([1, 2, 3])
  })

  test('rank fallback badges use kind="rank"', () => {
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    badged.forEach((c) => expect(matrix[c.id].statSpeed!.kind).toBe('rank'))
  })
})

// ── Direction correctness ──────────────────────────────────────────────────────
describe('direction correctness', () => {
  test('weightLb: lower weight = better rank (lowerBetter)', () => {
    // 10 cars; k=1; the car with lowest weight gets the badge
    const cars = make10('weightLb', [3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900])
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.weightLb)
    expect(badged).toHaveLength(1)
    expect(badged[0].weightLb).toBe(3000)
  })

  test('simBraking60: shorter braking distance = better rank (lowerBetter)', () => {
    // 20 cars → k = floor(0.05 * 20) = 1, exactly 1 badge awarded
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ simBraking60: 80 + i * 5 }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.simBraking60)
    expect(badged).toHaveLength(1)
    expect(badged[0].simBraking60).toBe(80)
  })

  test('simZeroToSixty: lower time = better rank (lowerBetter)', () => {
    // 20 cars → k = floor(0.05 * 20) = 1, exactly 1 badge awarded
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ simZeroToSixty: 2.0 + i * 0.2 }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.simZeroToSixty)
    expect(badged).toHaveLength(1)
    expect(badged[0].simZeroToSixty).toBe(2.0)
  })

  test('statSpeed: higher = better (higherBetter)', () => {
    const cars = make10('statSpeed', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    expect(badged).toHaveLength(1)
    expect(badged[0].statSpeed).toBe(10)
  })
})

// ── Tier assignment ────────────────────────────────────────────────────────────
describe('tier assignment', () => {
  test('bar stat badges use tier "soft"', () => {
    const cars = make10('statSpeed', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.statSpeed)
    expect(matrix[badged[0].id].statSpeed!.tier).toBe('soft')
  })

  test('sim metric badges use tier "strong"', () => {
    // Need >= 20 cars for k=1 at 5% threshold
    const cars = Array.from({ length: 20 }, (_, i) => makeCar({ simTopSpeed: 200 - i }))
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.filter((c) => matrix[c.id]?.simTopSpeed)
    expect(badged.length).toBeGreaterThan(0)
    expect(matrix[badged[0].id].simTopSpeed!.tier).toBe('strong')
  })

  test('rank fallback #1 gets tier "strong", #2 and #3 get "soft"', () => {
    const cars = [9,8,7,6,5,4,3,2,1].map((v) => makeCar({ statSpeed: v }))
    const matrix = computeBadgeMatrix(cars)
    const rank1 = cars.find((c) => matrix[c.id]?.statSpeed?.rank === 1)!
    const rank2 = cars.find((c) => matrix[c.id]?.statSpeed?.rank === 2)!
    const rank3 = cars.find((c) => matrix[c.id]?.statSpeed?.rank === 3)!
    expect(matrix[rank1.id].statSpeed!.tier).toBe('strong')
    expect(matrix[rank2.id].statSpeed!.tier).toBe('soft')
    expect(matrix[rank3.id].statSpeed!.tier).toBe('soft')
  })
})

// ── Per-class independence ─────────────────────────────────────────────────────
describe('per-class independence', () => {
  test('badge winner in class A does not affect class B', () => {
    // Class A: 10 cars with statSpeed 1–10
    // Class B: 10 cars with statSpeed 1–10
    // Each class should independently award 1 badge
    const carsA = make10('statSpeed', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 'A')
    const carsB = make10('statSpeed', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 'B')
    const matrix = computeBadgeMatrix([...carsA, ...carsB])
    const badgedA = carsA.filter((c) => matrix[c.id]?.statSpeed)
    const badgedB = carsB.filter((c) => matrix[c.id]?.statSpeed)
    expect(badgedA).toHaveLength(1)
    expect(badgedB).toHaveLength(1)
  })

  test('null-car in class A does not pollute coverage check for class B', () => {
    // Class A: 3 cars with null statSpeed (below coverage floor)
    // Class B: 10 cars with valid statSpeed → should still award badge
    const carsA = [1,2,3].map(() => makeCar({ piClass: 'A', statSpeed: null }))
    const carsB = make10('statSpeed', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 'B')
    const matrix = computeBadgeMatrix([...carsA, ...carsB])
    const badgedB = carsB.filter((c) => matrix[c.id]?.statSpeed)
    expect(badgedB.length).toBeGreaterThan(0)
  })
})

// ── Label disambiguation ───────────────────────────────────────────────────────
describe('label disambiguation', () => {
  test('statBraking label is "braking"', () => {
    const cars = make10('statBraking', [10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.find((c) => matrix[c.id]?.statBraking)!
    expect(matrix[badged.id].statBraking!.label).toContain('braking')
    expect(matrix[badged.id].statBraking!.label).not.toContain('60')
  })

  test('simBraking60 label contains "60–0 braking"', () => {
    const cars = make10('simBraking60', [80, 90, 100, 110, 120, 130, 140, 150, 160, 170])
    const matrix = computeBadgeMatrix(cars)
    const badged = cars.find((c) => matrix[c.id]?.simBraking60)!
    expect(matrix[badged.id].simBraking60!.label).toContain('60–0 braking')
  })
})

// ── getBestBadge ───────────────────────────────────────────────────────────────
describe('getBestBadge', () => {
  const makeB = (tier: CarBadge['tier'], rank: number, n: number, key = 'statSpeed'): [string, CarBadge] => [
    key,
    { kind: 'percentile', tier, label: `badge ${key}`, rank, n },
  ]

  test('returns null for empty/undefined badges', () => {
    expect(getBestBadge(undefined)).toBeNull()
    expect(getBestBadge({})).toBeNull()
  })

  test('strong tier beats soft tier', () => {
    const badges: CarBadgeMap = {
      statSpeed: { kind: 'percentile', tier: 'soft',   label: 'soft',   rank: 1, n: 10 },
      statHandling: { kind: 'percentile', tier: 'strong', label: 'strong', rank: 2, n: 10 },
    }
    const best = getBestBadge(badges)!
    expect(best.tier).toBe('strong')
  })

  test('within same tier, lowest normalised rank wins', () => {
    const badges: CarBadgeMap = {
      statSpeed:    { kind: 'percentile', tier: 'soft', label: 'a', rank: 1, n: 100 }, // 0.01
      statHandling: { kind: 'percentile', tier: 'soft', label: 'b', rank: 1, n: 10  }, // 0.10
    }
    const best = getBestBadge(badges)!
    expect(best.label).toBe('a')
  })

  test('METRIC_PRIORITY breaks ties at equal normalised rank', () => {
    const badges: CarBadgeMap = {
      statBraking: { kind: 'percentile', tier: 'soft', label: 'braking', rank: 1, n: 10 },
      statSpeed:   { kind: 'percentile', tier: 'soft', label: 'speed',   rank: 1, n: 10 },
    }
    // statSpeed comes before statBraking in METRIC_PRIORITY
    const best = getBestBadge(badges)!
    expect(best.label).toBe('speed')
  })

  test('returns the single badge when only one exists', () => {
    const badges: CarBadgeMap = {
      simTopSpeed: { kind: 'rank', tier: 'strong', label: '#1 top speed', rank: 1, n: 8 },
    }
    const best = getBestBadge(badges)!
    expect(best.kind).toBe('rank')
    expect(best.label).toBe('#1 top speed')
  })
})
