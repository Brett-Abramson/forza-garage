import Link from 'next/link'
import { TrackImage } from '@/components/tracks/TrackImage'
import { TrackTypeBadge } from '@/components/tracks/TrackTypeBadge'
import { fmtDist, fmtLaps, slugifyRaceName, type TrackListItem } from '@/lib/tracks'

/** One race in the list grid — reuses CarCard's grid rhythm. Card face is the track map. */
export function TrackCard({ track }: { track: TrackListItem }) {
  const slug = slugifyRaceName(track.raceName)
  return (
    <Link
      href={`/tracks/${slug}`}
      className="flex flex-col rounded-xl border border-fh-border bg-fh-panel overflow-hidden transition-colors duration-150 hover:border-fh-red"
    >
      <TrackImage
        src={track.trackImageUrl}
        alt={`${track.raceName} track map`}
        filename={`${track.raceName}Track.webp`}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-col gap-[7px] px-[13px] pt-[11px] pb-[13px]">
        <div className="text-[13px] font-bold leading-tight tracking-tight">{track.raceName}</div>
        <div className="flex items-center gap-[9px] text-[11px] text-fh-muted">
          <TrackTypeBadge raceType={track.raceType} compact />
          <span className="tabular-nums text-fh-dark-2 font-semibold">{fmtDist(track.distanceMi)}</span>
          <span className="text-fh-muted-2">·</span>
          <span className="tabular-nums text-fh-dark-2 font-semibold">{fmtLaps(track.laps)}</span>
        </div>
      </div>
    </Link>
  )
}
