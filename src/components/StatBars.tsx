import type { Car } from '@/types/car'

interface Props {
  car: Car
}

const BARS: { key: keyof Car; label: string; color: string }[] = [
  { key: 'statSpeed',        label: 'Speed',   color: 'bg-blue-500'   },
  { key: 'statHandling',     label: 'Handling', color: 'bg-cyan-500'  },
  { key: 'statAcceleration', label: 'Accel',   color: 'bg-green-500'  },
  { key: 'statLaunch',       label: 'Launch',  color: 'bg-yellow-500' },
  { key: 'statBraking',      label: 'Braking', color: 'bg-orange-500' },
  { key: 'statOffroad',      label: 'Offroad', color: 'bg-lime-600'   },
]

export default function StatBars({ car }: Props) {
  const hasAnyBarStat = BARS.some(({ key }) => car[key] != null)

  if (!hasAnyBarStat) {
    return (
      <p className="text-[10px] text-gray-700 italic">
        No stats yet — enter them from the in-game stat screen below.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {BARS.map(({ key, label, color }) => {
        const value = car[key] as number | null
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="text-[10px] text-gray-600 w-14 shrink-0 text-right">{label}</div>
            <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
              {value != null && (
                <div
                  className={`h-full rounded-full ${color} opacity-80 transition-all duration-300`}
                  style={{ width: `${Math.min(value / 10, 1) * 100}%` }}
                />
              )}
            </div>
            <div className="text-[10px] text-gray-500 tabular-nums w-6 shrink-0">
              {value != null ? value.toFixed(1) : '—'}
            </div>
          </div>
        )
      })}

      {/* Specs row — only show fields that have values */}
      <SpecsRow car={car} />
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
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 pt-2 border-t border-[#21262d]">
      {specs.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-1">
          <span className="text-[9px] text-gray-600 uppercase tracking-wide">{label}</span>
          <span className="text-[10px] text-gray-400 tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}
