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
        border-b border-[#21262d] transition-colors text-sm
        ${onCardClick ? 'cursor-pointer' : ''}
        ${isExpanded ? 'bg-[#1c2330]' : car.owned ? 'bg-cyan-950/20 hover:bg-[#161b22]' : 'hover:bg-[#161b22]'}
        ${isPending ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      <td className="py-2.5 px-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
          {car.piClass}
        </span>
      </td>
      <td className="py-2.5 px-3 text-gray-400 tabular-nums">{car.piRating}</td>
      <td className="py-2.5 px-3 text-gray-400">{car.year}</td>
      <td className="py-2.5 px-3 font-medium">{car.make}</td>
      <td className="py-2.5 px-3">{car.model}</td>
      <td className="py-2.5 px-3 text-gray-400 hidden md:table-cell">
        <div>{car.division}</div>
        {bestRace && (
          <div className="text-xs text-gray-600 mt-0.5">{bestRace.icon} {bestRace.name}</div>
        )}
      </td>
      <td className="py-2.5 px-3 text-gray-400 hidden lg:table-cell">{car.drivetrain ?? '—'}</td>
      <td className="py-2.5 px-3 text-gray-400 hidden lg:table-cell">{car.country}</td>
      <td className={`py-2.5 px-3 hidden xl:table-cell text-xs font-medium ${sourceColor}`}>
        {car.source}
      </td>
      <td className="py-2.5 px-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleOwned(car.id, !car.owned) }}
          className={`
            px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap
            ${car.owned
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
              : 'bg-[#21262d] text-gray-400 border border-[#30363d] hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/40'
            }
          `}
        >
          {car.owned ? 'Owned' : '+ Add'}
        </button>
      </td>
    </tr>
  )
}
