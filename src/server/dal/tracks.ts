import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/db'
import { slugifyRaceName, type TrackListItem } from '@/lib/tracks'

const TRACK_SELECT = {
  raceName: true, raceType: true, distanceMi: true, laps: true,
  trackImageUrl: true, detailsImageUrl: true,
} as const

/**
 * All 88 tracks, ordered by name. Cached 24h under the 'tracks' tag — this
 * table only changes via prisma/upsert_tracks.js (idempotent upsert on
 * raceName), so a redeploy or the script's own revalidation is the only thing
 * that should ever invalidate it before the 24h window.
 */
export const getAllTracks = unstable_cache(
  (): Promise<TrackListItem[]> =>
    prisma.track.findMany({ select: TRACK_SELECT, orderBy: { raceName: 'asc' } }),
  ['tracks-all'],
  { tags: ['tracks'], revalidate: 86400 },
)

/**
 * Single track by its routing slug (kebab-case of raceName — see
 * slugifyRaceName). Only 88 rows total, so resolving against the cached
 * full list is cheaper and simpler than a second query shape.
 */
export async function getTrackBySlug(slug: string): Promise<TrackListItem | null> {
  const tracks = await getAllTracks()
  return tracks.find((t) => slugifyRaceName(t.raceName) === slug) ?? null
}
