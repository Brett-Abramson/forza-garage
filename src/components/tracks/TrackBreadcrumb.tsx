import Link from 'next/link'
import { typeSlug, typePluralLabel } from '@/lib/tracks'

export function TrackBreadcrumb({ raceType, raceName }: { raceType: string; raceName: string }) {
  return (
    <div className="flex items-center gap-2 text-[11.5px] text-fh-muted flex-wrap">
      <Link href="/tracks" className="fh-hover-red-fg">
        Tracks
      </Link>
      <span className="text-fh-muted-2">/</span>
      <Link href={`/tracks#${typeSlug(raceType)}`} className="fh-hover-red-fg">
        {typePluralLabel(raceType)}
      </Link>
      <span className="text-fh-muted-2">/</span>
      <span className="text-fh-dark font-semibold">{raceName}</span>
    </div>
  )
}
