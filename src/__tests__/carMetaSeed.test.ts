/**
 * CarMeta seed data — structural fixture tests.
 *
 * No database connection required. The seed rows are duplicated here as a
 * static fixture so CI can verify the data contract without a live Prisma
 * client.  If the seed script changes, update this file to match.
 *
 * For the live-database version, run the seed script against a test DB and
 * query prisma.carMeta.findMany({ where: { active: true } }).
 */

import { describe, it, expect } from 'vitest'
import { PI_CLASS_ORDER } from '@/types/car'
import { RACE_TYPES } from '@/lib/races'

// ─── Fixture — mirrors scripts/seed_car_meta.ts exactly ──────────────────────

interface SeedRow {
  year: number
  make: string
  model: string
  piClass: string
  raceType: string
  rank: number
  label: string
  source: string
  active: boolean
}

const SEED_ROWS: SeedRow[] = [
  {
    year: 1991, make: 'Mazda', model: '#55 Mazda 787B',
    piClass: 'R', raceType: 'Road Racing', rank: 1,
    label: 'Leaderboard King',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 2018, make: 'Lotus', model: 'Scura Motorsports Exige WTAC',
    piClass: 'R', raceType: 'Road Racing', rank: 2,
    label: 'R Class Specialist',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 2021, make: 'McLaren', model: '620R',
    piClass: 'S1', raceType: 'Road Racing', rank: 1,
    label: 'S1 Standard',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 2008, make: 'Dodge', model: 'Viper SRT-10 ACR',
    piClass: 'S1', raceType: 'Road Racing', rank: 2,
    label: 'S1 Bruiser',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 2005, make: 'Ford', model: 'GT',
    piClass: 'A', raceType: 'Road Racing', rank: 1,
    label: 'A Class Benchmark',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 1991, make: 'Honda', model: 'Beat',
    piClass: 'B', raceType: 'Road Racing', rank: 1,
    label: 'The Meta Surprise',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 2001, make: 'Acura', model: 'Integra Type R',
    piClass: 'C', raceType: 'Road Racing', rank: 1,
    label: 'C Class Standard',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 1962, make: 'Peel', model: 'P50',
    piClass: 'D', raceType: 'Road Racing', rank: 1,
    label: 'Tiny Terror',
    source: 'forza.guide/meta', active: true,
  },
  {
    year: 2014, make: 'Mercedes-Benz', model: 'G 63 AMG 6x6',
    piClass: 'C', raceType: 'Cross Country', rank: 1,
    label: 'Offroad Beast',
    source: 'forza.guide/meta', active: true,
  },
]

const VALID_RACE_TYPE_NAMES = new Set(RACE_TYPES.map((r) => r.name))

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CarMeta seed data — fixture structure', () => {
  it('contains exactly 9 rows', () => {
    expect(SEED_ROWS).toHaveLength(9)
  })

  it('every row has active: true', () => {
    SEED_ROWS.forEach((row) => expect(row.active).toBe(true))
  })

  it('every piClass is a valid PI class', () => {
    SEED_ROWS.forEach((row) =>
      expect(PI_CLASS_ORDER).toContain(row.piClass)
    )
  })

  it('every raceType matches a known RaceType name', () => {
    SEED_ROWS.forEach((row) =>
      expect(VALID_RACE_TYPE_NAMES.has(row.raceType)).toBe(true)
    )
  })

  it('every row has a non-empty label and source', () => {
    SEED_ROWS.forEach((row) => {
      expect(row.label.length).toBeGreaterThan(0)
      expect(row.source.length).toBeGreaterThan(0)
    })
  })

  it('every row has a positive rank', () => {
    SEED_ROWS.forEach((row) => expect(row.rank).toBeGreaterThan(0))
  })
})

describe('CarMeta seed data — piClass distribution', () => {
  const byClass = Object.fromEntries(
    PI_CLASS_ORDER.map((cls) => [cls, SEED_ROWS.filter((r) => r.piClass === cls)])
  )

  it('has at least one row for each of D, C, B, A, S1, R', () => {
    for (const cls of ['D', 'C', 'B', 'A', 'S1', 'R']) {
      expect(byClass[cls].length).toBeGreaterThan(0)
    }
  })

  it('class C has exactly 2 rows (Road Racing + Cross Country)', () => {
    expect(byClass['C']).toHaveLength(2)
  })

  it('class R has exactly 2 rows', () => {
    expect(byClass['R']).toHaveLength(2)
  })

  it('class S1 has exactly 2 rows', () => {
    expect(byClass['S1']).toHaveLength(2)
  })
})

describe('CarMeta seed data — raceType distribution', () => {
  it('8 rows are Road Racing', () => {
    const roadRows = SEED_ROWS.filter((r) => r.raceType === 'Road Racing')
    expect(roadRows).toHaveLength(8)
  })

  it('1 row is Cross Country', () => {
    const ccRows = SEED_ROWS.filter((r) => r.raceType === 'Cross Country')
    expect(ccRows).toHaveLength(1)
  })

  it('the Cross Country row is the Mercedes-Benz G 63 AMG 6x6', () => {
    const cc = SEED_ROWS.find((r) => r.raceType === 'Cross Country')
    expect(cc?.make).toBe('Mercedes-Benz')
    expect(cc?.model).toBe('G 63 AMG 6x6')
    expect(cc?.piClass).toBe('C')
  })
})
