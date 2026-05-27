'use client'

import { Car, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { getBestRaceType } from '@/lib/raceMatch'

interface Props {
  car: Car
  onToggleOwned: (id: number, owned: boolean) => void
  isPending?: boolean
  onCardClick?: (car: Car) => void
  isExpanded?: boolean
}

export default function CarRow({ car, onToggleOwned, isPending, onCardClick, isExpanded }: Props) {
  const classBadge = PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'
  const sourceColor = getSourceColor(car.source)
  const bestRace = getBestRaceType(car.division, car.tags ?? [], car.drivetrain ?? undefined)

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
      <td className="py-2.5 px-3">
        <button
          onClick={(e) => { e.stopPropagation(); if (!isPending) onToggleOwned(car.id, !car.owned) }}
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
      </td>
    </tr>
  )
}
