import { describe, it, expect } from 'vitest'
import {
  METRICS,
  getMetric,
  getMetricValue,
  formatMetricValue,
  SIM_COLUMN_METRICS,
  SIM_METRICS,
  LIST_SIM_SELECT,
} from '@/lib/metrics'
import type { Car } from '@/types/car'

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
  statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
  statBraking: null, statOffroad: null,
  powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null, displacementL: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null,
  simLateralG60: null, simLateralG120: null, simTopSpeed: null,
  simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  value: null, rarity: null,
  source: 'Autoshow', sourceInfo: null,
  owned: false,
  ...overrides,
})

// ─── Registry shape ───────────────────────────────────────────────────────────

describe('METRICS registry shape', () => {
  it('every metric has the required fields with sane types', () => {
    for (const m of METRICS) {
      expect(typeof m.key).toBe('string')
      expect(typeof m.label).toBe('string')
      expect(typeof m.short).toBe('string')
      expect(['lowerBetter', 'higherBetter', 'neutral']).toContain(m.direction)
      expect(['sim', 'derived']).toContain(m.group)
      expect(typeof m.inList).toBe('boolean')
      expect(typeof m.column).toBe('boolean')
      expect(typeof m.decimals).toBe('number')
    }
  })

  it('has 11 metrics: 10 sim + 1 derived (power-to-weight)', () => {
    expect(METRICS).toHaveLength(11)
    expect(SIM_METRICS).toHaveLength(10)
    expect(METRICS.filter((m) => m.group === 'derived')).toHaveLength(1)
  })

  it('exposes 7 inList sim fields and 8 sortable columns', () => {
    expect(METRICS.filter((m) => m.inList)).toHaveLength(7)
    expect(SIM_COLUMN_METRICS).toHaveLength(8)
  })

  it('the 3 balance ratios are neither inList nor columns', () => {
    for (const key of ['simAeroEfficiency', 'simMechBalance', 'simAeroBalance']) {
      const m = getMetric(key)!
      expect(m.inList).toBe(false)
      expect(m.column).toBe(false)
    }
  })

  it('keys are unique', () => {
    const keys = METRICS.map((m) => m.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('only the derived metric carries an accessor', () => {
    const withAccessor = METRICS.filter((m) => 'accessor' in m && m.accessor)
    expect(withAccessor.map((m) => m.key)).toEqual(['powerToWeight'])
  })
})

// ─── LIST_SIM_SELECT ──────────────────────────────────────────────────────────

describe('LIST_SIM_SELECT', () => {
  it('selects exactly the 7 inList sim fields, all true', () => {
    const keys = Object.keys(LIST_SIM_SELECT).sort()
    expect(keys).toEqual(
      [
        'simZeroToSixty', 'simZeroToHundred', 'simBraking60', 'simBraking100',
        'simLateralG60', 'simLateralG120', 'simTopSpeed',
      ].sort()
    )
    expect(Object.values(LIST_SIM_SELECT).every((v) => v === true)).toBe(true)
  })

  it('omits the 3 ratios (drawer-only) and power-to-weight (derived)', () => {
    expect(LIST_SIM_SELECT).not.toHaveProperty('simAeroEfficiency')
    expect(LIST_SIM_SELECT).not.toHaveProperty('simMechBalance')
    expect(LIST_SIM_SELECT).not.toHaveProperty('simAeroBalance')
    expect(LIST_SIM_SELECT).not.toHaveProperty('powerToWeight')
  })
})

// ─── getMetric ────────────────────────────────────────────────────────────────

describe('getMetric', () => {
  it('returns the metric for a known key', () => {
    expect(getMetric('simTopSpeed')?.short).toBe('top')
  })

  it('returns undefined for a non-metric key (so plain sorts pass through)', () => {
    expect(getMetric('make')).toBeUndefined()
    expect(getMetric('piClass')).toBeUndefined()
  })
})

// ─── getMetricValue ───────────────────────────────────────────────────────────

describe('getMetricValue', () => {
  it('reads a plain sim field off the car', () => {
    const m = getMetric('simZeroToSixty')!
    expect(getMetricValue(m, makeCar({ simZeroToSixty: 3.2 }))).toBe(3.2)
  })

  it('returns null for a missing sim field', () => {
    const m = getMetric('simBraking60')!
    expect(getMetricValue(m, makeCar())).toBeNull()
  })

  it('computes power-to-weight from powerHp / weightLb via the accessor', () => {
    const m = getMetric('powerToWeight')!
    expect(getMetricValue(m, makeCar({ powerHp: 500, weightLb: 2500 }))).toBeCloseTo(0.2, 5)
  })

  it('power-to-weight is null when either input is missing', () => {
    const m = getMetric('powerToWeight')!
    expect(getMetricValue(m, makeCar({ powerHp: 500, weightLb: null }))).toBeNull()
    expect(getMetricValue(m, makeCar({ powerHp: null, weightLb: 2500 }))).toBeNull()
  })

  it('power-to-weight guards divide-by-zero (weightLb 0 → null)', () => {
    const m = getMetric('powerToWeight')!
    expect(getMetricValue(m, makeCar({ powerHp: 500, weightLb: 0 }))).toBeNull()
  })
})

// ─── formatMetricValue ────────────────────────────────────────────────────────

describe('formatMetricValue', () => {
  it('rounds to the registry decimals', () => {
    expect(formatMetricValue(getMetric('simZeroToSixty')!, makeCar({ simZeroToSixty: 3.249 }))).toBe('3.2')
    expect(formatMetricValue(getMetric('simTopSpeed')!, makeCar({ simTopSpeed: 217.8 }))).toBe('218')
    expect(formatMetricValue(getMetric('simLateralG60')!, makeCar({ simLateralG60: 1.034 }))).toBe('1.03')
    expect(formatMetricValue(getMetric('powerToWeight')!, makeCar({ powerHp: 500, weightLb: 2500 }))).toBe('0.200')
  })

  it('renders the em dash for a null value', () => {
    expect(formatMetricValue(getMetric('simBraking100')!, makeCar())).toBe('—')
  })
})
