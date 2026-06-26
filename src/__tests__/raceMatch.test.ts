import { describe, it, expect } from 'vitest'
import { getBestRaceType, getRankedRaceTypes } from '@/lib/raceMatch'
import type { AutoTagStats } from '@/lib/autotags'

// Each row verifies an end-to-end fix from the v2 (division + drivetrain only)
// system: division base tags + the new stat gates → ranked race type.
const cases: {
  label: string
  division: string
  drivetrain: string
  stats: AutoTagStats
  expected: string
}[] = [
  {
    label: 'Retro Supercars, RWD (grip racer, not drift)',
    division: 'Retro Supercars', drivetrain: 'RWD',
    stats: { statHandling: 5.6, statSpeed: 6.8 }, expected: 'Road Racing',
  },
  {
    label: 'Retro Super Saloons, RWD',
    division: 'Retro Super Saloons', drivetrain: 'RWD',
    stats: { statHandling: 5.0, statSpeed: 7.2 }, expected: 'Street Racing',
  },
  {
    label: 'Rally Monsters, AWD (genuine off-road)',
    division: 'Rally Monsters', drivetrain: 'AWD',
    stats: { statOffroad: 8.1 }, expected: 'Cross Country',
  },
  {
    label: 'Retro Rally, AWD (mid off-road, no offroad tag)',
    division: 'Retro Rally', drivetrain: 'AWD',
    stats: { statOffroad: 5.9 }, expected: 'Cross Country',
  },
  {
    label: 'Super Hot Hatch, FWD',
    division: 'Super Hot Hatch', drivetrain: 'FWD',
    stats: { statHandling: 5.5 }, expected: 'Street Racing',
  },
  {
    label: 'Modern Muscle, RWD',
    division: 'Modern Muscle', drivetrain: 'RWD',
    stats: { statHandling: 4.7, statLaunch: 4.6 }, expected: 'Drag Racing',
  },
  {
    label: 'Drift Cars, RWD',
    division: 'Drift Cars', drivetrain: 'RWD',
    stats: {}, expected: 'Drift Zones',
  },
]

describe('raceMatch v3 — primary race type with stats', () => {
  for (const c of cases) {
    it(`${c.label} → ${c.expected}`, () => {
      const best = getBestRaceType(c.division, [], c.drivetrain, c.stats)
      expect(best?.name).toBe(c.expected)
    })
  }

  it('Retro Rally with null stats → Cross Country (division fallback)', () => {
    const best = getBestRaceType('Retro Rally', [], 'AWD', null)
    expect(best?.name).toBe('Cross Country')
  })
})

describe('raceMatch v3 — optional stats param contract', () => {
  it('getRankedRaceTypes still compiles and returns a non-empty ranking with no stats arg', () => {
    const ranked = getRankedRaceTypes('Modern Sports Cars', [], 'RWD')
    expect(ranked.length).toBeGreaterThan(0)
  })

  it('getBestRaceType returns a race with no stats arg', () => {
    expect(getBestRaceType('Hypercars', [], 'RWD')).not.toBeNull()
  })

  it('passing stats does not regress the no-stats result for a division-only car', () => {
    const withStats = getBestRaceType('Hypercars', [], 'RWD', { statSpeed: 9.0 })
    expect(withStats?.name).toBe('Road Racing')
  })
})
