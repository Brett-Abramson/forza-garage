import type { Car } from '@/types/car'
import { DIVISION_CLASS_AVERAGES, getStatColor } from '@/lib/statCallouts'
import type { StatAvg } from '@/lib/statCallouts'

interface Props {
  car: Car
  /** 'large' renders 8px bars with 12px labels for the drawer; 'default' is the compact 6px card size. */
  variant?: 'default' | 'large'
  /** When false, the bottom specs row is omitted (the drawer renders its own spec tile grid instead). */
  showSpecs?: boolean
}

const BARS: { key: keyof Car; label: string; avgKey: keyof StatAvg; description: string }[] = [
  {
    key: 'statSpeed', label: 'Speed', avgKey: 'speed',
    description: 'Top speed on long straights. Most relevant for road racing and drag.',
  },
  {
    key: 'statHandling', label: 'Handling', avgKey: 'handling',
    description: 'Cornering grip and balance through turns. The most important stat for road and street racing.',
  },
  {
    key: 'statAcceleration', label: 'Accel', avgKey: 'accel',
    description: 'Rate of speed gain mid-race. Affects overtaking and corner exit pace.',
  },
  {
    key: 'statLaunch', label: 'Launch', avgKey: 'launch',
    description: 'Standing start performance. Critical for drag racing and race starts.',
  },
  {
    key: 'statBraking', label: 'Braking', avgKey: 'braking',
    description: 'Stopping power and stability under heavy braking. Affects how late you can brake into corners.',
  },
  {
    key: 'statOffroad', label: 'Offroad', avgKey: 'offroad',
    description: 'Capability on loose, rough, or uneven terrain. Only relevant for dirt and cross country events.',
  },
]

const COLOR_LABELS: Record<string, string> = {
  'bg-green-500': 'Well above average',
  'bg-green-400': 'Above average',
  'bg-amber-400': 'Average',
  'bg-orange-500': 'Below average',
  'bg-red-500':   'Well below average',
}

export default function StatBars({ car, variant = 'default', showSpecs = true }: Props) {
  const hasAnyBarStat = BARS.some(({ key }) => car[key] != null)
  const divAvg = DIVISION_CLASS_AVERAGES[car.division]?.[car.piClass] ?? null

  const large = variant === 'large'
  const barTrack = large ? 'h-2' : 'h-1.5'
  const labelText = large ? 'text-xs' : 'text-[10px]'
  const valueText = large ? 'text-xs font-semibold' : 'text-[10px]'
  const labelW = large ? 'w-16' : 'w-14'
  const valueW = large ? 'w-8' : 'w-6'

  if (!hasAnyBarStat) {
    return (
      <p className="text-[10px] text-fh-dark-2 italic">
        No stats yet — enter them from the in-game stat screen below.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {BARS.map(({ key, label, avgKey, description }) => {
        const value = car[key] as number | null
        const avg = divAvg?.[avgKey] ?? null
        const color = value != null ? getStatColor(value, avg) : ''
        const qualLabel = COLOR_LABELS[color] ?? null

        const comparisonLine =
          value != null && avg != null
            ? `${value.toFixed(1)} vs class avg ${avg.toFixed(1)}`
            : value != null
            ? `No average data available for this division`
            : null

        const contextLine =
          value != null && qualLabel != null
            ? `This is ${qualLabel.toLowerCase()} for ${car.division} in ${car.piClass} class`
            : value != null
            ? `No comparison data available for ${car.division} in ${car.piClass} class`
            : null

        return (
          <div key={key} className="relative group flex items-center gap-2">
            <div className={`${labelText} text-fh-muted ${labelW} shrink-0 text-right`}>{label}</div>
            <div className={`flex-1 ${barTrack} bg-fh-panel-2 rounded-full overflow-hidden`}>
              {value != null && (
                <div
                  className={`h-full rounded-full ${color} opacity-80 transition-all duration-300`}
                  style={{ width: `${Math.min(value / 10, 1) * 100}%` }}
                />
              )}
            </div>
            <div className={`${valueText} text-fh-muted tabular-nums ${valueW} shrink-0`}>
              {value != null ? value.toFixed(1) : '—'}
            </div>

            {/* Tooltip */}
            <div className="
              pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
              invisible opacity-0 group-hover:visible group-hover:opacity-100
              transition-opacity duration-200 delay-200
              w-56 rounded-md bg-gray-900 border border-gray-700 px-3 py-2 shadow-lg
            ">
              <p className="text-[10px] text-gray-300 leading-snug">{description}</p>
              {comparisonLine && (
                <p className="text-[10px] text-white font-medium mt-1 tabular-nums">{comparisonLine}</p>
              )}
              {contextLine && (
                <p className={`text-[10px] mt-0.5 ${
                  color === 'bg-green-500' ? 'text-green-400' :
                  color === 'bg-green-400' ? 'text-green-400' :
                  color === 'bg-amber-400' ? 'text-amber-400' :
                  color === 'bg-orange-500' ? 'text-orange-400' :
                  color === 'bg-red-500'   ? 'text-red-400'    :
                  'text-gray-400'
                }`}>{contextLine}</p>
              )}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
            </div>
          </div>
        )
      })}

      {/* Specs row — only show fields that have values (omitted when the caller
          renders its own spec grid, e.g. the drawer's tile grid) */}
      {showSpecs && <SpecsRow car={car} />}
    </div>
  )
}

function SpecsRow({ car }: { car: Car }) {
  const specs: { label: string; value: string | null }[] = [
    car.powerHp       != null ? { label: 'HP',     value: `${car.powerHp}` }          : null,
    car.torqueFtLb    != null ? { label: 'Torque', value: `${car.torqueFtLb} ft-lb` } : null,
    car.weightLb      != null ? { label: 'Weight', value: `${car.weightLb} lb` }       : null,
    car.frontWeight   != null ? { label: 'F.Wt',   value: `${car.frontWeight}%` }      : null,
    car.displacementL != null ? { label: 'Disp',   value: `${car.displacementL}L` }    : null,
    car.rarity        != null ? { label: 'Rarity', value: car.rarity }                  : null,
  ].filter((s): s is { label: string; value: string } => s !== null)

  if (specs.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 pt-2 border-t border-fh-border">
      {specs.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-1">
          <span className="text-[9px] text-fh-muted uppercase tracking-wide">{label}</span>
          <span className="text-[10px] text-fh-dark-2 tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}
