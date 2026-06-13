'use client'

import { Car, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { getBestRaceType } from '@/lib/raceMatch'
import { RaceIcon } from '@/components/RaceIcons'
import { formatAddedAt } from '@/lib/sort'

const DIVISION_ACCENT: Record<string, string> = {
  // Supercars / hypercars
  'Hypercars':             'border-t-fh-red',
  'Modern Supercars':      'border-t-fh-red',
  'Retro Supercars':       'border-t-fh-red',

  // GT / Saloons
  'GT Cars':               'border-t-fh-purple',
  'Super GT':              'border-t-fh-purple',
  'Modern Super Saloons':  'border-t-fh-purple',
  'Retro Super Saloons':   'border-t-fh-purple',
  'Classic Racers':        'border-t-fh-purple',
  'Retro Racers':          'border-t-fh-purple',

  // Muscle
  'Classic Muscle':        'border-t-fh-amber',
  'Retro Muscle':          'border-t-fh-amber',
  'Modern Muscle':         'border-t-fh-amber',

  // Hot Hatch / Sports
  'Hot Hatch':             'border-t-fh-blue',
  'Super Hot Hatch':       'border-t-fh-blue',
  'Retro Hot Hatch':       'border-t-fh-blue',
  'Classic Sports Cars':   'border-t-fh-blue',
  'Retro Sports Cars':     'border-t-fh-blue',
  'Modern Sports Cars':    'border-t-fh-blue',

  // Track
  'Track Toys':            'border-t-fh-pink',
  'Extreme Track Toys':    'border-t-fh-pink',

  // Rally / Offroad
  'Classic Rally':         'border-t-green-600',
  'Retro Rally':           'border-t-green-600',
  'Rally Monsters':        'border-t-green-600',
  'Unlimited Offroad':     'border-t-green-700',
  'Unlimited Buggies':     'border-t-green-700',
  "Pickups & 4x4's":       'border-t-green-700',
  "UTV's":                 'border-t-green-700',
  'Sports Utility Heroes': 'border-t-green-700',

  // Drift
  'Drift Cars':            'border-t-fh-pink',

  // Misc
  'Rare Classics':         'border-t-fh-amber',
  'Cult Cars':             'border-t-fh-muted-2',
  'Eclectic Domestics':    'border-t-fh-muted-2',
  'Rods and Customs':      'border-t-fh-muted-2',
  'Utility Heroes':        'border-t-fh-muted-2',
}

function getDivisionAccent(division: string): string {
  return DIVISION_ACCENT[division] ?? 'border-t-fh-border'
}

interface Props {
  car: Car
  onToggleOwned: (id: number, owned: boolean) => void
  onCardClick?: (car: Car) => void
  onTogglePin?: (id: number, pinned: boolean) => void
  isPending?: boolean
  showAddedAt?: boolean
}

export default function CarCard({ car, onToggleOwned, onCardClick, onTogglePin, isPending, showAddedAt }: Props) {
  const classBadge = PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'
  const sourceColor = getSourceColor(car.source)
  const accent = getDivisionAccent(car.division)
  const bestRace = getBestRaceType(car.division, car.tags ?? [], car.drivetrain ?? undefined)

  return (
    <div
      onClick={() => onCardClick?.(car)}
      className={`
        relative flex flex-col h-[273px] rounded-xl border overflow-hidden transition-all duration-200 bg-fh-panel
        ${onCardClick ? 'cursor-pointer' : ''}
        ${car.owned
          ? 'border-fh-red shadow-[0_0_12px_rgba(204,0,0,0.1)]'
          : 'border-fh-border hover:border-fh-red'
        }
      `}
    >
      {/* Division accent header */}
      <div className={`border-t-2 ${accent} bg-fh-panel-2 flex items-end px-3 pb-2 pt-3`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
            {car.piClass}
          </span>
          <span className="text-xs text-fh-dark-2">{car.piRating}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Star / pin — garage only, only rendered when onTogglePin is provided */}
          {onTogglePin && (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(car.id, !car.pinned) }}
              aria-label={car.pinned ? 'Unpin car' : 'Pin car'}
              title={car.pinned ? 'Remove from favourites' : 'Add to favourites'}
              className={`transition-colors leading-none ${
                car.pinned
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-fh-border hover:text-amber-400'
              }`}
            >
              {car.pinned ? '★' : '☆'}
            </button>
          )}
          {car.owned && !onTogglePin && (
            <span className="text-xs font-semibold text-fh-red bg-fh-red-pale border border-fh-red px-2 py-0.5 rounded-full">
              Owned
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-3 pt-3 pb-2 flex-1">
        <div className="text-xs text-fh-muted">{car.year} · {car.make}</div>
        <div className="text-sm font-semibold leading-tight">{car.model}</div>
        <div className="text-xs text-fh-muted mt-0.5">{car.division}</div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-fh-dark-2">
          {car.drivetrain && <span>{car.drivetrain}</span>}
          <span>{car.country}</span>
          {car.bodyStyle && <span>{car.bodyStyle}</span>}
        </div>

        {car.engineType && (
          <div className="text-xs mt-1 text-fh-muted">{car.engineType}</div>
        )}

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-xs font-medium ${sourceColor}`}>{car.source}</span>
          {car.value != null && (
            <>
              <span className="text-fh-muted-2 text-xs select-none">·</span>
              <span className="text-xs text-fh-muted tabular-nums">{car.value.toLocaleString()} Cr</span>
            </>
          )}
        </div>
        {bestRace && (
          <div className="text-xs mt-1.5 text-fh-muted">
            <RaceIcon id={bestRace.id} emoji={bestRace.icon} /> {bestRace.name}
          </div>
        )}
        {showAddedAt && car.addedAt && (
          <div className="text-[11px] mt-1.5 text-fh-muted-2">
            {formatAddedAt(car.addedAt)}
          </div>
        )}
      </div>

      {/* Add to garage — only shown for non-owned cars */}
      {!car.owned && (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => { e.stopPropagation(); if (!isPending) onToggleOwned(car.id, true) }}
            disabled={isPending}
            className={`
              w-full py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5
              bg-transparent border border-fh-border text-fh-muted hover:border-fh-red hover:text-fh-red
              ${isPending ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {isPending ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : 'Add to garage'}
          </button>
        </div>
      )}
    </div>
  )
}
