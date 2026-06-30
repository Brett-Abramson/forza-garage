/**
 * src/components/UnitSettingsToggle.tsx
 *
 * Compact segmented-control row shown in Stats mode alongside the
 * Standard | Stats view toggle.
 *
 * Render it conditionally — only when `view === 'stats'`:
 *
 *   <div className="flex items-center gap-3">
 *     <ViewToggle view={view} onChange={setView} />   // your existing toggle
 *     {view === 'stats' && <UnitSettingsToggle />}
 *   </div>
 *
 * The component reads/writes through UnitPreferencesContext, so the provider
 * must be an ancestor (see UnitPreferencesContext.tsx usage notes).
 */

'use client'

import { useUnitPreferences } from '@/components/UnitPreferencesContext'
import type { UnitSystem, PowerUnit } from '@/lib/unitConversions'

// ─── Sub-component: a labelled pill group ─────────────────────────────────────

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label:    string
  options:  readonly T[]
  value:    T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-fh-muted select-none pr-0.5">
        {label}
      </span>
      <div className="flex items-center rounded overflow-hidden border border-fh-border">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={[
              'px-2.5 py-0.5 text-[11px] font-medium transition-colors',
              i !== 0 && 'border-l border-fh-border',
              value === opt
                ? 'bg-fh-red text-white'
                : 'bg-fh-panel text-fh-muted hover:text-fh-red',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const UNIT_OPTIONS:  readonly UnitSystem[] = ['English', 'Metric']
const POWER_OPTIONS: readonly PowerUnit[]  = ['hp', 'PS', 'kW']

export function UnitSettingsToggle() {
  const { prefs, setUnits, setPowerUnits } = useUnitPreferences()

  return (
    <div className="flex items-center gap-3" aria-label="Unit preferences">
      <PillGroup
        label="Units"
        options={UNIT_OPTIONS}
        value={prefs.units}
        onChange={setUnits}
      />
      <span className="text-fh-border text-xs select-none">·</span>
      <PillGroup
        label="Power"
        options={POWER_OPTIONS}
        value={prefs.powerUnits}
        onChange={setPowerUnits}
      />
    </div>
  )
}
