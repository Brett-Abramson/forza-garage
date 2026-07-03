import { notFound } from 'next/navigation'
import { getAllTracks, getTrackBySlug } from '@/server/dal/tracks'
import { slugifyRaceName, fmtDist } from '@/lib/tracks'
import { TrackBreadcrumb } from '@/components/tracks/TrackBreadcrumb'
import { TrackMapHero } from '@/components/tracks/TrackMapHero'
import { FactsStrip } from '@/components/tracks/FactsStrip'

export async function generateStaticParams() {
  const tracks = await getAllTracks()
  return tracks.map((t) => ({ track: slugifyRaceName(t.raceName) }))
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }) {
  const { track: slug } = await params
  const track = await getTrackBySlug(slug)
  if (!track) return {}
  return { title: `${track.raceName} — Forza Garage` }
}

export default async function TrackDetailPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: slug } = await params
  const track = await getTrackBySlug(slug)
  if (!track) notFound()

  return (
    <main className="max-w-screen-md mx-auto px-[26px] py-[22px] pb-[26px]">
      <TrackBreadcrumb raceType={track.raceType} raceName={track.raceName} />

      <h1 className="text-[27px] font-extrabold uppercase tracking-[-0.02em] leading-[1.02] max-w-[20ch] my-[14px] text-fh-dark">
        {track.raceName}
      </h1>

      <TrackMapHero
        src={track.trackImageUrl}
        raceName={track.raceName}
        filename={`${track.raceName}Track.webp`}
      />

      <div className="mt-4">
        <FactsStrip raceType={track.raceType} distanceMi={track.distanceMi} laps={track.laps} />
      </div>

      {track.distanceMi == null && (
        <div className="flex items-center gap-2 mt-[9px] text-[11px] text-fh-muted">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fh-muted-2 shrink-0" aria-hidden>
            <circle cx="8" cy="8" r="6.4" />
            <path d="M8 5.2v3.4M8 11h.01" />
          </svg>
          <span>
            Distance isn&rsquo;t listed on the source for this touge — shown as{' '}
            <b className="text-fh-dark font-semibold">&ldquo;{fmtDist(null)}&rdquo;</b>, not hidden or zeroed.
          </span>
        </div>
      )}
    </main>
  )
}
