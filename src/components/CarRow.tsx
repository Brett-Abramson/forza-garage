'use client'

import { useState } from 'react'
import { Car, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { getBestRaceType } from '@/lib/raceMatch'
import { formatAddedAt } from '@/lib/sort'

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
}

export default function CarRow({ car, onToggleOwned, isPending, onCardClick, isExpanded, showAddedAt, showAddedAtColumn, hideGarage }: Props) {
  const classBadge = PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'
  const sourceColor = getSourceColor(car.source)
  const bestRace = getBestRaceType(car.division, car.tags ?? [], car.drivetrain ?? undefined)
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <tr
      onClick={() => onCardClick?.(car)}
      className={`
        border-b border-fh-border transition-colors text-sm
        ${onCardClick ? 'cursor-pointer' : ''}
        ${isExpanded
          ? 'bg-fh-panel-2'
          : car.owned
          ? 'bg-fh-red-pale hover:bg-fh-panel-2'
          : 'hover:bg-fh-panel-2'}
        ${isPending ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      <td className="py-2.5 px-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
          {car.piClass}
        </span>
      </td>
      <td className="py-2.5 px-3 text-fh-dark-2 tabular-nums">{car.piRating}</td>
      <td className="py-2.5 px-3 text-fh-dark-2">{car.year}</td>
      <td className="py-2.5 px-3 font-medium">{car.make}</td>
      <td className="py-2.5 px-3">{car.model}</td>
      <td className="py-2.5 px-3 text-fh-dark-2 hidden md:table-cell">
        <div>{car.division}</div>
        {bestRace && (
          <div className="text-xs text-fh-muted mt-0.5">{bestRace.icon} {bestRace.name}</div>
        )}
      </td>
      <td className="py-2.5 px-3 text-fh-dark-2 hidden lg:table-cell">{car.drivetrain ?? '—'}</td>
      <td className="py-2.5 px-3 text-fh-dark-2 hidden lg:table-cell">{car.country}</td>
      <td className={`py-2.5 px-3 hidden xl:table-cell text-xs font-medium ${sourceColor}`}>
        {car.source}
      </td>
      <td className="py-2.5 px-3 text-fh-dark-2 tabular-nums hidden xl:table-cell text-xs">
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
      {showAddedAtColumn && (
        <td className="py-2.5 px-3 text-fh-muted-2 tabular-nums hidden xl:table-cell text-[11px]">
          {showAddedAt && car.addedAt ? formatAddedAt(car.addedAt) : null}
        </td>
      )}
      {!hideGarage && <td className="py-2.5 px-3">
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
