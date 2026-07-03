import type { ReactNode } from 'react'
import { TrackTypeBadge } from '@/components/tracks/TrackTypeBadge'
import { fmtDist } from '@/lib/tracks'

/** The three-cell facts row on the single-race page: race type, distance, laps. */
export function FactsStrip({
  raceType,
  distanceMi,
  laps,
}: {
  raceType: string
  distanceMi: number | null
  laps: number | null
}) {
  const cells: { label: string; value: ReactNode; dash?: boolean }[] = [
    { label: 'Race type', value: <TrackTypeBadge raceType={raceType} /> },
    { label: 'Distance', value: fmtDist(distanceMi), dash: distanceMi == null },
    { label: 'Laps', value: laps ?? '—', dash: laps == null },
  ]

  return (
    <div className="flex border border-fh-border rounded-xl overflow-hidden bg-fh-panel">
      {cells.map((cell, i) => (
        <div key={cell.label} className={`flex-1 px-[18px] py-[14px] ${i ? 'border-l border-fh-border' : ''}`}>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-fh-muted">{cell.label}</div>
          {typeof cell.value === 'string' || typeof cell.value === 'number' ? (
            <div className={`text-[22px] font-extrabold tabular-nums mt-[3px] ${cell.dash ? 'text-fh-muted-2' : ''}`}>
              {cell.value}
            </div>
          ) : (
            <div className="mt-[6px]">{cell.value}</div>
          )}
        </div>
      ))}
    </div>
  )
}
