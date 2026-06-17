'use client'

import { useState, type ReactNode } from 'react'
import { Car, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { getBestRaceType } from '@/lib/raceMatch'
import { hasOverrides } from '@/lib/statUtils'
import { RaceIcon } from '@/components/RaceIcons'
import { formatAddedAt } from '@/lib/sort'
import { STICKY_COL_STATS } from './table-ui'

interface Props {
  car: Car
  onToggleOwned: (id: number, owned: boolean) => void
  isPending?: boolean
  onCardClick?: (car: Car) => void
  isExpanded?: boolean
  /** Show the date text in the Added column (e.g. when sorted by addedAt) */
  showAddedAt?: boolean
  /** Render a dedicated <td> for the Added column — pass from GarageShowcase to keep column counts aligned */
  showAddedAtColumn?: boolean
  /** Hide the Garage action column — pass from GarageShowcase where every car is already owned */
  hideGarage?: boolean
  /** Garage only — callback to toggle pinned/favourite state */
  onTogglePin?: (id: number, pinned: boolean) => void
  /** Swap standard right-side columns for the 11 stat/spec columns with sticky identity cols */
  statsMode?: boolean
  /** JS-driven column visibility (GarageView only). When omitted, falls back to CSS responsive classes. */
  colVis?: { piYear: boolean; division: boolean; driveCountry: boolean; sourceValue: boolean }
}

export default function CarRow({ car, onToggleOwned, isPending, onCardClick, isExpanded, showAddedAt, showAddedAtColumn, hideGarage, onTogglePin, statsMode, colVis }: Props) {
  const classBadge = PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'
  const sourceColor = getSourceColor(car.source)
  const bestRace = getBestRaceType(car.division, car.tags ?? [], car.drivetrain ?? undefined)
  const [confirmRemove, setConfirmRemove] = useState(false)

  // Sticky left offsets for stats mode — uses tighter STICKY_COL_STATS widths
  const SS = STICKY_COL_STATS
  const hasPin = !!onTogglePin
  const classLeft = hasPin ? SS.star : 0
  const piLeft    = classLeft + SS.class
  const yearLeft  = piLeft   + SS.pi
  const makeLeft  = yearLeft + SS.year
  const modelLeft = makeLeft + SS.make

  const trCls = `
    border-b border-fh-border transition-colors text-sm
    ${onCardClick ? 'cursor-pointer' : ''}
    ${isExpanded
      ? 'bg-fh-panel-2'
      : car.owned
      ? 'bg-fh-red-pale hover:bg-fh-panel-2'
      : 'hover:bg-fh-panel-2'}
    ${isPending ? 'opacity-60 pointer-events-none' : ''}
  `

  if (statsMode) {
    return (
      <tr onClick={() => onCardClick?.(car)} className={trCls}>
        {onTogglePin && (
          <td className="py-2.5 pl-3 pr-1 bg-fh-bg sticky z-[1]" style={{ left: 0, minWidth: SS.star }}>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(car.id, !car.pinned) }}
              aria-label={car.pinned ? 'Unpin car' : 'Pin car'}
              className={`text-base leading-none transition-colors ${car.pinned ? 'text-amber-400 hover:text-amber-300' : 'text-fh-border hover:text-amber-400'}`}
            >
              {car.pinned ? '★' : '☆'}
            </button>
          </td>
        )}
        <td className="py-2.5 px-2 bg-fh-bg sticky z-[1] text-center" style={{ left: classLeft, minWidth: SS.class }}>
          <span className={`inline-block w-3 h-3 rounded-sm ${classBadge}`} />
        </td>
        <td className="py-2.5 px-2 bg-fh-bg sticky z-[1] tabular-nums text-fh-dark-2 overflow-hidden" style={{ left: piLeft, minWidth: SS.pi }}>
          {car.piRating}
        </td>
        <td className="py-2.5 px-2 bg-fh-bg sticky z-[1] text-fh-dark-2 overflow-hidden" style={{ left: yearLeft, minWidth: SS.year }}>
          {car.year}
        </td>
        <td className="py-2.5 px-2 bg-fh-bg sticky z-[1] font-medium overflow-hidden whitespace-nowrap text-ellipsis" style={{ left: makeLeft, minWidth: SS.make }}>
          {car.make}
        </td>
        <td className="py-2.5 px-2 bg-fh-bg sticky z-[1]" style={{ left: modelLeft, minWidth: SS.model }}>
          <div className="flex items-center gap-1 overflow-hidden" style={{ maxWidth: SS.model - 16 }}>
            <span className="overflow-hidden whitespace-nowrap text-ellipsis">{car.model}</span>
            {hasOverrides(car) && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-fh-red" title="Stats edited" />
            )}
          </div>
        </td>
        <StatTd>{car.statSpeed        ?? '—'}</StatTd>
        <StatTd>{car.statHandling     ?? '—'}</StatTd>
        <StatTd>{car.statAcceleration ?? '—'}</StatTd>
        <StatTd>{car.statLaunch       ?? '—'}</StatTd>
        <StatTd>{car.statBraking      ?? '—'}</StatTd>
        <StatTd>{car.statOffroad      ?? '—'}</StatTd>
        <StatTd>{car.powerHp          ?? '—'}</StatTd>
        <StatTd>{car.torqueFtLb       ?? '—'}</StatTd>
        <StatTd>{car.weightLb         ?? '—'}</StatTd>
        <StatTd>{car.frontWeight   != null ? `${car.frontWeight}%`            : '—'}</StatTd>
        <StatTd>{car.displacementL != null ? car.displacementL.toFixed(1)     : '—'}</StatTd>
      </tr>
    )
  }

  return (
    <tr onClick={() => onCardClick?.(car)} className={trCls}>
      {/* Star — only rendered in garage (when onTogglePin is provided) */}
      {onTogglePin && (
        <td className="py-2.5 pl-3 pr-1 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(car.id, !car.pinned) }}
            aria-label={car.pinned ? 'Unpin car' : 'Pin car'}
            title={car.pinned ? 'Remove from favourites' : 'Add to favourites'}
            className={`text-base leading-none transition-colors ${
              car.pinned
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-fh-border hover:text-amber-400'
            }`}
          >
            {car.pinned ? '★' : '☆'}
          </button>
        </td>
      )}
      <td className="py-2.5 px-3 overflow-hidden whitespace-nowrap">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
          {car.piClass}
        </span>
      </td>
      {(!colVis || colVis.piYear) && <td className="py-2.5 px-3 text-fh-dark-2 tabular-nums overflow-hidden whitespace-nowrap text-ellipsis">{car.piRating}</td>}
      {(!colVis || colVis.piYear) && <td className="py-2.5 px-3 text-fh-dark-2 overflow-hidden whitespace-nowrap text-ellipsis">{car.year}</td>}
      <td className="py-2.5 px-3 font-medium overflow-hidden whitespace-nowrap text-ellipsis">{car.make}</td>
      <td className="py-2.5 px-3 overflow-hidden whitespace-nowrap text-ellipsis">{car.model}</td>
      {(!colVis || colVis.division) && (
        <td className={`py-2.5 px-3 text-fh-dark-2 overflow-hidden${!colVis ? ' hidden md:table-cell' : ''}`}>
          <div className="truncate">{car.division}</div>
          {bestRace && (
            <div className="text-xs text-fh-muted mt-0.5 flex items-center gap-1 min-w-0">
              <RaceIcon id={bestRace.id} emoji={bestRace.icon} />
              <span className="truncate">{bestRace.name}</span>
            </div>
          )}
        </td>
      )}
      {(!colVis || colVis.driveCountry) && <td className={`py-2.5 px-3 text-fh-dark-2 overflow-hidden whitespace-nowrap text-ellipsis${!colVis ? ' hidden lg:table-cell' : ''}`}>{car.drivetrain ?? '—'}</td>}
      {(!colVis || colVis.driveCountry) && <td className={`py-2.5 px-3 text-fh-dark-2 overflow-hidden whitespace-nowrap text-ellipsis${!colVis ? ' hidden lg:table-cell' : ''}`}>{car.country}</td>}
      {(!colVis || colVis.sourceValue) && (
        <td className={`py-2.5 px-3 text-xs font-medium overflow-hidden whitespace-nowrap text-ellipsis${!colVis ? ' hidden xl:table-cell' : ''} ${sourceColor}`}>
          {car.source}
        </td>
      )}
      {(!colVis || colVis.sourceValue) && (
        <td className={`py-2.5 px-3 text-fh-dark-2 tabular-nums text-xs overflow-hidden whitespace-nowrap text-ellipsis${!colVis ? ' hidden xl:table-cell' : ''}`}>
          {car.value != null
            ? `${car.value.toLocaleString()} Cr`
            : (
              <span
                className="cursor-default"
                title={car.sourceInfo ?? undefined}
              >—</span>
            )
          }
        </td>
      )}
      {showAddedAtColumn && (
        <td className="py-2.5 px-3 text-fh-muted-2 tabular-nums hidden xl:table-cell text-[11px] overflow-hidden whitespace-nowrap text-ellipsis">
          {showAddedAt && car.addedAt ? formatAddedAt(car.addedAt) : null}
        </td>
      )}
      {!hideGarage && <td className="py-2.5 px-3 overflow-hidden">
        {car.owned && confirmRemove ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-2 py-1 rounded bg-fh-red-pale border border-fh-red/30 whitespace-nowrap"
          >
            <span className="text-xs text-fh-red">Remove?</span>
            <button
              onClick={() => setConfirmRemove(false)}
              className="text-xs text-fh-muted hover:text-fh-dark transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              onClick={() => { onToggleOwned(car.id, false); setConfirmRemove(false) }}
              className="text-xs text-fh-red font-semibold hover:opacity-70 transition-colors disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (isPending) return
              if (car.owned) { setConfirmRemove(true) } else { onToggleOwned(car.id, true) }
            }}
            disabled={isPending}
            className={`
              px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5
              ${car.owned
                ? 'bg-fh-red text-white border border-fh-red hover:opacity-80'
                : 'bg-transparent border border-fh-border text-fh-muted hover:border-fh-red hover:text-fh-red'
              }
              ${isPending ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {isPending ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              car.owned ? 'Owned' : '+ Add'
            )}
          </button>
        )}
      </td>}
    </tr>
  )
}

function StatTd({ children }: { children: ReactNode }) {
  return (
    <td className="py-2.5 px-3 tabular-nums text-fh-dark-2 text-right whitespace-nowrap" style={{ minWidth: 72 }}>
      {children}
    </td>
  )
}
