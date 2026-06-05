import { describe, it, expect } from 'vitest'
import { RACE_TYPES, getRaceFilterUrl } from '@/lib/races'
import { CAR_TAGS } from '@/lib/tags'

const VALID_TAGS = new Set<string>(CAR_TAGS)

// ─── RACE_TYPES shape ─────────────────────────────────────────────────────────

describe('RACE_TYPES', () => {
  it('defines exactly 7 race types', () => {
    expect(RACE_TYPES).toHaveLength(7)
  })

  it('every race type has a non-empty id, name, icon, surface, and description', () => {
    for (const race of RACE_TYPES) {
      expect(race.id.length).toBeGreaterThan(0)
      expect(race.name.length).toBeGreaterThan(0)
      expect(race.icon.length).toBeGreaterThan(0)
      expect(race.surface.length).toBeGreaterThan(0)
      expect(race.description.length).toBeGreaterThan(0)
    }
  })

  it('every race type has at least one demand', () => {
    for (const race of RACE_TYPES) {
      expect(race.demands.length).toBeGreaterThan(0)
    }
  })

  it('every race type has at least one avoid entry', () => {
    for (const race of RACE_TYPES) {
      expect(race.avoid.length).toBeGreaterThan(0)
    }
  })

  it('every race type has at least one recommended tag', () => {
    for (const race of RACE_TYPES) {
      expect(race.recommendedTags.length).toBeGreaterThan(0)
    }
  })

  it('all recommendedTags are valid CAR_TAGS values', () => {
    for (const race of RACE_TYPES) {
      for (const tag of race.recommendedTags) {
        expect(VALID_TAGS.has(tag), `"${tag}" in race "${race.id}" is not a valid CAR_TAG`).toBe(true)
      }
    }
  })

  it('every race type has a non-empty piSweetSpot and drivetrainNote', () => {
    for (const race of RACE_TYPES) {
      expect(race.piSweetSpot.length).toBeGreaterThan(0)
      expect(race.drivetrainNote.length).toBeGreaterThan(0)
    }
  })

  it('all race ids are unique', () => {
    const ids = RACE_TYPES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes road, street, dirt, crosscountry, drift, touge, and drag', () => {
    const ids = RACE_TYPES.map((r) => r.id)
    expect(ids).toContain('road')
    expect(ids).toContain('street')
    expect(ids).toContain('dirt')
    expect(ids).toContain('crosscountry')
    expect(ids).toContain('drift')
    expect(ids).toContain('touge')
    expect(ids).toContain('drag')
  })
})

// ─── getRaceFilterUrl ─────────────────────────────────────────────────────────

describe('getRaceFilterUrl', () => {
  it('returns /garage for an unknown race id', () => {
    expect(getRaceFilterUrl('unknown')).toBe('/garage')
  })

  it('returns /garage?mode=race&race=<id> for a known race', () => {
    expect(getRaceFilterUrl('road')).toBe('/garage?mode=race&race=road')
    expect(getRaceFilterUrl('dirt')).toBe('/garage?mode=race&race=dirt')
  })

  it('uses the race id (not tags) so the garage activates OR/inclusion logic', () => {
    // The garage reads ?race=<id> and filters via activeRace.recommendedTags.some()
    // The old ?tags= approach used AND logic and returned 0 results.
    const url = getRaceFilterUrl('road')
    expect(url).not.toContain('tags=')
    expect(url).toContain('mode=race')
    expect(url).toContain('race=road')
  })

  it('produces a distinct URL for each race type', () => {
    const urls = RACE_TYPES.map((r) => getRaceFilterUrl(r.id))
    expect(new Set(urls).size).toBe(RACE_TYPES.length)
  })
})
