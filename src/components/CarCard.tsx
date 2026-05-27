'use client'

import { Car, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { getBestRaceType } from '@/lib/raceMatch'

const DIVISION_GRADIENTS: Record<string, string> = {
  'Hypercars':             'from-red-900/60 to-orange-900/40',
  'Super GT':              'from-orange-900/60 to-red-900/40',
  'Modern Supercars':      'from-orange-900/60 to-yellow-900/40',
  'Retro Supercars':       'from-amber-900/60 to-yellow-900/40',
  'Modern Muscle':         'from-blue-900/60 to-indigo-900/40',
  'Retro Muscle':          'from-zinc-800/60 to-stone-800/40',
  'Modern Sports Cars':    'from-cyan-900/60 to-blue-900/40',
  'Retro Sports Cars':     'from-teal-900/60 to-cyan-900/40',
  'GT Cars':               'from-purple-900/60 to-violet-900/40',
  'Modern Super Saloons':  'from-indigo-900/60 to-blue-900/40',
  'Retro Super Saloons':   'from-slate-800/60 to-indigo-900/40',
  'Hot Hatch':             'from-green-900/60 to-emerald-900/40',
  'Retro Hot Hatch':       'from-lime-900/60 to-green-900/40',
  'Super Hot Hatch':       'from-emerald-900/60 to-green-900/40',
  'Classic Racers':        'from-yellow-900/60 to-amber-900/40',
  'Retro Racers':          'from-amber-900/60 to-orange-900/40',
  'Rare Classics':         'from-yellow-900/60 to-orange-900/40',
  'Cult Cars':             'from-violet-900/60 to-purple-900/40',
  'Eclectic Domestics':    'from-gray-800/60 to-slate-800/40',
  'Sports Utility Heroes': 'from-slate-800/60 to-gray-800/40',
  'Utility Heroes':        'from-stone-800/60 to-gray-800/40',
  'Extreme Track Toys':    'from-pink-900/60 to-rose-900/40',
  'Track Toys':            'from-rose-900/60 to-pink-900/40',
  'Classic Rally':         'from-stone-800/60 to-amber-900/40',
  'Rally Monsters':        'from-green-900/60 to-stone-800/40',
  'Unlimited Buggies':     'from-stone-800/60 to-zinc-800/40',
  'Unlimited Offroad':     'from-zinc-800/60 to-stone-800/40',
  'UTVs':                  'from-stone-900/60 to-zinc-900/40',
}

function getDivisionGradient(division: string) {
  return DIVISION_GRADIENTS[division] ?? 'from-gray-800/60 to-gray-900/40'
}

interface Props {
  car: Car
  onToggleOwned: (id: number, owned: boolean) => void
  onCardClick?: (car: Car) => void
}

export default function CarCard({ car, onToggleOwned, onCardClick }: Props) {
  const classBadge = PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'
  const sourceColor = getSourceColor(car.source)
  const gradient = getDivisionGradient(car.division)
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
      {/* Visual header */}
      <div className={`h-24 bg-gradient-to-br ${gradient} flex items-end px-3 pb-2`}>
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
