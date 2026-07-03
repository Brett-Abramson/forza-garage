/**
 * Pure helpers for the Track (race) pages — /tracks and /tracks/[track].
 * No DB access here; see src/server/dal/tracks.ts for the Prisma layer.
 */

// Fixed display order per the design handoff — real counts must total 88:
// Street 15 · Road 20 · Touge 5 · Drag 3 · Dirt 20 · Cross Country 18 · Wristband 7.
export const RACE_TYPE_ORDER = [
  'Street Race',
  'Road Race',
  'Touge Race',
  'Drag Race',
  'Dirt Race',
  'Cross Country',
  'Wristband Event',
] as const

export type RaceType = typeof RACE_TYPE_ORDER[number]

export interface TrackListItem {
  raceName: string
  raceType: string
  distanceMi: number | null
  laps: number | null
  trackImageUrl: string | null
  detailsImageUrl: string | null
}

/**
 * Deterministic, human-readable slug for routing — distinct from the
 * irregular asset slug embedded in trackImageUrl/detailsImageUrl (which is
 * never reconstructed; the stored URL is always used as-is).
 */
export function slugifyRaceName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Section id for a raceType, e.g. "Cross Country" → "cross-country". */
export function typeSlug(raceType: string): string {
  return slugifyRaceName(raceType)
}

/** "{Type}s" plural label used in the TOC, group headers and breadcrumb. */
export function typePluralLabel(raceType: string): string {
  return `${raceType}s`
}

/** Distance, nullable — render a graceful "—", never "0" or a hidden field. */
export function fmtDist(distanceMi: number | null): string {
  return distanceMi == null ? '—' : `${distanceMi} mi`
}

/** "1 lap" / "3 laps". */
export function fmtLaps(laps: number | null): string {
  if (laps == null) return '—'
  return `${laps} lap${laps === 1 ? '' : 's'}`
}

/** Groups tracks by raceType in the fixed RACE_TYPE_ORDER, dropping empty groups. */
export function groupTracksByType(
  tracks: TrackListItem[],
): { type: string; tracks: TrackListItem[] }[] {
  const byType = new Map<string, TrackListItem[]>()
  for (const t of tracks) {
    const arr = byType.get(t.raceType)
    if (arr) arr.push(t)
    else byType.set(t.raceType, [t])
  }
  return RACE_TYPE_ORDER
    .filter((type) => byType.has(type))
    .map((type) => ({ type, tracks: byType.get(type)! }))
}
