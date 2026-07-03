import { describe, it, expect } from 'vitest'
import {
  RACE_TYPE_ORDER,
  slugifyRaceName,
  typeSlug,
  typePluralLabel,
  fmtDist,
  fmtLaps,
  groupTracksByType,
  type TrackListItem,
} from '@/lib/tracks'

function track(overrides: Partial<TrackListItem>): TrackListItem {
  return {
    raceName: 'Cedar Run Street Race',
    raceType: 'Street Race',
    distanceMi: 4.2,
    laps: 1,
    trackImageUrl: 'https://forza.labsgg.com/images/RaceCedarRunTrack.webp',
    detailsImageUrl: 'https://forza.labsgg.com/images/RaceCedarRunDetails.webp',
    ...overrides,
  }
}

describe('slugifyRaceName', () => {
  it('lowercases and kebab-cases a simple name', () => {
    expect(slugifyRaceName('Cedar Run Street Race')).toBe('cedar-run-street-race')
  })

  it('collapses punctuation into single hyphens', () => {
    expect(slugifyRaceName('Narai-Juku Circuit')).toBe('narai-juku-circuit')
    expect(slugifyRaceName('Mt. Haruna Touge Race')).toBe('mt-haruna-touge-race')
    expect(slugifyRaceName("Kinkaku-ji Trail")).toBe('kinkaku-ji-trail')
  })

  it('never leads or trails with a hyphen', () => {
    expect(slugifyRaceName('  The Goliath  ')).toBe('the-goliath')
  })
})

describe('typeSlug / typePluralLabel', () => {
  it('slugs a multi-word race type', () => {
    expect(typeSlug('Cross Country')).toBe('cross-country')
    expect(typeSlug('Wristband Event')).toBe('wristband-event')
  })

  it('pluralizes the type label', () => {
    expect(typePluralLabel('Road Race')).toBe('Road Races')
  })
})

describe('fmtDist', () => {
  it('renders a graceful dash for null, never 0', () => {
    expect(fmtDist(null)).toBe('—')
  })

  it('renders the distance with a unit suffix', () => {
    expect(fmtDist(4.2)).toBe('4.2 mi')
  })

  it('does not hide a real zero-ish distance behind the dash', () => {
    expect(fmtDist(0.2)).toBe('0.2 mi')
  })
})

describe('fmtLaps', () => {
  it('singularizes 1 lap', () => {
    expect(fmtLaps(1)).toBe('1 lap')
  })

  it('pluralizes multiple laps', () => {
    expect(fmtLaps(3)).toBe('3 laps')
  })
})

describe('groupTracksByType', () => {
  it('orders groups per RACE_TYPE_ORDER regardless of input order', () => {
    const tracks = [
      track({ raceName: 'A', raceType: 'Wristband Event' }),
      track({ raceName: 'B', raceType: 'Street Race' }),
      track({ raceName: 'C', raceType: 'Road Race' }),
    ]
    const groups = groupTracksByType(tracks)
    expect(groups.map((g) => g.type)).toEqual(['Street Race', 'Road Race', 'Wristband Event'])
  })

  it('drops types with zero tracks instead of rendering an empty group', () => {
    const tracks = [track({ raceType: 'Drag Race' })]
    const groups = groupTracksByType(tracks)
    expect(groups).toHaveLength(1)
    expect(groups[0].type).toBe('Drag Race')
  })

  it('keeps every track within its group', () => {
    const tracks = [
      track({ raceName: 'Cedar Run Street Race', raceType: 'Street Race' }),
      track({ raceName: 'Daikoku Chase Street Race', raceType: 'Street Race' }),
    ]
    const groups = groupTracksByType(tracks)
    expect(groups[0].tracks).toHaveLength(2)
  })

  it('covers all 7 real race types when present', () => {
    const tracks = RACE_TYPE_ORDER.map((type, i) => track({ raceName: `Race ${i}`, raceType: type }))
    const groups = groupTracksByType(tracks)
    expect(groups).toHaveLength(7)
  })
})
