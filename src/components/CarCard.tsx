'use client'

import { Car, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { getBestRaceType } from '@/lib/raceMatch'

const DIVISION_ACCENT: Record<string, string> = {
  // Supercars / hypercars
  'Hypercars':             'border-t-[var(--fh-red)]',
  'Modern Supercars':      'border-t-[var(--fh-red)]',
  'Retro Supercars':       'border-t-[var(--fh-red)]',

  // GT / Saloons
  'GT Cars':               'border-t-[var(--fh-purple)]',
  'Super GT':              'border-t-[var(--fh-purple)]',
  'Modern Super Saloons':  'border-t-[var(--fh-purple)]',
  'Retro Super Saloons':   'border-t-[var(--fh-purple)]',
  'Classic Racers':        'border-t-[var(--fh-purple)]',
  'Retro Racers':          'border-t-[var(--fh-purple)]',

  // Muscle
  'Classic Muscle':        'border-t-[var(--fh-amber)]',
  'Retro Muscle':          'border-t-[var(--fh-amber)]',
  'Modern Muscle':         'border-t-[var(--fh-amber)]',

  // Hot Hatch / Sports
  'Hot Hatch':             'border-t-[var(--fh-blue)]',
  'Super Hot Hatch':       'border-t-[var(--fh-blue)]',
  'Retro Hot Hatch':       'border-t-[var(--fh-blue)]',
  'Classic Sports Cars':   'border-t-[var(--fh-blue)]',
  'Retro Sports Cars':     'border-t-[var(--fh-blue)]',
  'Modern Sports Cars':    'border-t-[var(--fh-blue)]',

  // Track
  'Track Toys':            'border-t-[var(--fh-pink)]',
  'Extreme Track Toys':    'border-t-[var(--fh-pink)]',

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
  'Drift Cars':            'border-t-[var(--fh-pink)]',

  // Misc
  'Rare Classics':         'border-t-[var(--fh-amber)]',
  'Cult Cars':             'border-t-[var(--fh-muted2)]',
  'Eclectic Domestics':    'border-t-[var(--fh-muted2)]',
  'Rods and Customs':      'border-t-[var(--fh-muted2)]',
  'Utility Heroes':        'border-t-[var(--fh-muted2)]',
}

function getDivisionAccent(division: string): string {
  return DIVISION_ACCENT[division] ?? 'border-t-[var(--fh-border)]'
}

interface Props {
  car: Car
  onToggleOwned: (id: number, owned: boolean) => void
  onCardClick?: (car: Car) => void
}

export default function CarCard({ car, onToggleOwned, onCardClick }: Props) {
  const classBadge = PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'
  const sourceColor = getSourceColor(car.source)
  const accent = getDivisionAccent(car.division)
  const bestRace = getBestRaceType(car.division, car.tags ?? [], car.drivetrain ?? undefined)

  return (
    <div
      onClick={() => onCardClick?.(car)}
      className={`
        relative flex flex-col rounded-xl border overflow-hidden transition-all duration-200 bg-[var(--fh-panel)]
        ${onCardClick ? 'cursor-pointer' : ''}
        ${car.owned
          ? 'border-[var(--fh-red-border)] shadow-[0_0_12px_rgba(204,0,0,0.1)]'
          : 'border-[var(--fh-border)] hover:border-[var(--fh-red-border)]'
        }
      `}
    >
      {/* Division accent header */}
      <div className={`border-t-2 ${accent} bg-[var(--fh-panel2)] flex items-end px-3 pb-2 pt-3`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
            {car.piClass}
          </span>
          <span className="text-xs text-[var(--fh-dark2)]">{car.piRating}</span>
        </div>
        {car.owned && (
          <div className="ml-auto">
            <span className="text-xs font-semibold text-[var(--fh-red)] bg-[var(--fh-red-pale)] border border-[var(--fh-red-border)] px-2 py-0.5 rounded-full">
              Owned
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-3 pt-3 pb-2 flex-1">
        <div className="text-xs text-[var(--fh-muted)]">{car.year} · {car.make}</div>
        <div className="text-sm font-semibold leading-tight">{car.model}</div>
        <div className="text-xs text-[var(--fh-muted)] mt-0.5">{car.division}</div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-[var(--fh-dark2)]">
          {car.drivetrain && <span>{car.drivetrain}</span>}
          <span>{car.country}</span>
          {car.bodyStyle && <span>{car.bodyStyle}</span>}
        </div>

        {car.engineType && (
          <div className="text-xs mt-1 text-[var(--fh-muted)] truncate">{car.engineType}</div>
        )}

        <div className={`text-xs mt-0.5 font-medium ${sourceColor}`}>{car.source}</div>
        {bestRace && (
          <div className="text-xs mt-1.5 text-[var(--fh-muted)]">
            {bestRace.icon} {bestRace.name}
          </div>
        )}
      </div>

      {/* Owned toggle */}
      <div className="px-3 pb-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleOwned(car.id, !car.owned) }}
          className={`
            w-full py-1.5 rounded-lg text-xs font-semibold transition-colors
            ${car.owned
              ? 'bg-[var(--fh-red)] text-white border border-[var(--fh-red)] hover:opacity-80'
              : 'bg-transparent border border-[var(--fh-border)] text-[var(--fh-muted)] hover:border-[var(--fh-red-border)] hover:text-[var(--fh-red)]'
            }
          `}
        >
          {car.owned ? 'Remove from garage' : 'Add to garage'}
        </button>
      </div>
    </div>
  )
}
