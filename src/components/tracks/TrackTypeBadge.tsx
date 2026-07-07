import { TrackTypeIcon } from '@/components/car/RaceIcons'

/**
 * Race-type badge — maps onto the existing PI-badge chip styling, type-neutral
 * variant. `compact` is the tighter list-card size; default is the facts-strip size.
 */
export function TrackTypeBadge({ raceType, compact = false }: { raceType: string; compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded-md bg-fh-panel-2 border border-fh-border text-fh-dark-2 whitespace-nowrap ${
        compact ? 'text-[9.5px] px-[7px] py-[2px]' : 'text-[10.5px] px-[9px] py-[3px]'
      }`}
    >
      <TrackTypeIcon raceType={raceType} size={compact ? 11 : 12} />
      {raceType}
    </span>
  )
}
