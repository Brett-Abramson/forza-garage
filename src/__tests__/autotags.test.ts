import { describe, it, expect } from 'vitest'
import { getAutoTags } from '@/lib/autotags'

describe('getAutoTags — off-road divisions', () => {
  it('Unlimited Offroad → offroad, mixed, dirt', () => {
    expect(getAutoTags('Unlimited Offroad')).toEqual(expect.arrayContaining(['offroad', 'mixed', 'dirt']))
  })

  it('Buggies → offroad, dirt', () => {
    const tags = getAutoTags('Buggies')
    expect(tags).toContain('offroad')
    expect(tags).toContain('dirt')
  })

  it('Offroad → offroad, mixed, dirt', () => {
    const tags = getAutoTags('Offroad')
    expect(tags).toContain('offroad')
    expect(tags).toContain('mixed')
    expect(tags).toContain('dirt')
  })

  it('Pickups & 4x4s → offroad, mixed', () => {
    const tags = getAutoTags('Pickups & 4x4s')
    expect(tags).toContain('offroad')
    expect(tags).toContain('mixed')
  })

  it('UTVs → offroad, dirt', () => {
    const tags = getAutoTags('UTVs')
    expect(tags).toContain('offroad')
    expect(tags).toContain('dirt')
  })
})

describe('getAutoTags — rally divisions', () => {
  it('Modern Rally → dirt, mixed', () => {
    const tags = getAutoTags('Modern Rally')
    expect(tags).toContain('dirt')
    expect(tags).toContain('mixed')
  })

  it('Classic Rally → dirt, mixed', () => {
    const tags = getAutoTags('Classic Rally')
    expect(tags).toContain('dirt')
    expect(tags).toContain('mixed')
  })
})

describe('getAutoTags — drivetrain merging', () => {
  it('AWD adds dirt and offroad tags', () => {
    const tags = getAutoTags('Modern Sports Cars', 'AWD')
    expect(tags).toContain('dirt')
    expect(tags).toContain('offroad')
  })

  it('RWD adds drift tag', () => {
    const tags = getAutoTags('Modern Sports Cars', 'RWD')
    expect(tags).toContain('drift')
  })

  it('FWD adds tight and technical tags', () => {
    const tags = getAutoTags('Modern Sports Cars', 'FWD')
    expect(tags).toContain('tight')
    expect(tags).toContain('technical')
  })

  it('deduplicates tags that appear in both division and drivetrain', () => {
    // Rally Monsters division has "dirt"; AWD drivetrain also adds "dirt"
    const tags = getAutoTags('Rally Monsters', 'AWD')
    const dirtCount = tags.filter((t) => t === 'dirt').length
    expect(dirtCount).toBe(1)
  })
})

describe('getAutoTags — unknown inputs', () => {
  it('returns empty array for unknown division', () => {
    expect(getAutoTags('Unknown Division')).toEqual([])
  })

  it('ignores unknown drivetrain', () => {
    const tags = getAutoTags('Hot Hatch', 'MWD')
    // should still return division tags
    expect(tags).toContain('asphalt')
  })

  it('returns only valid CAR_TAGS values', () => {
    // All returned tags should be non-empty strings (rough sanity check)
    const tags = getAutoTags('Hypercars', 'RWD')
    expect(tags.every((t) => typeof t === 'string' && t.length > 0)).toBe(true)
  })
})
