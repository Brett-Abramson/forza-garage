'use client'

import { useState, useRef, useEffect } from 'react'
import { useUnitPreferences } from '@/components/UnitPreferencesContext'
import type { UnitSystem, PowerUnit } from '@/lib/unitConversions'

function RulerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 17 17 3l4 4L7 21z" />
      <path d="m13 7 2 2M9 11l2 2M5 15l2 2" />
    </svg>
  )
}

function PillRow<T extends string>({
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
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-fh-muted">{label}</span>
      <div className="flex items-center rounded overflow-hidden border border-fh-border">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={[
              'px-2 py-1 text-[11px] font-medium transition-colors',
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

const UNIT_OPTIONS:  readonly UnitSystem[] = ['English', 'Metric']
const POWER_OPTIONS: readonly PowerUnit[]  = ['hp', 'PS', 'kW']

export function UnitsNavButton() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { prefs, setUnits, setPowerUnits } = useUnitPreferences()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Unit preferences"
        title="Unit preferences"
        className="p-2 rounded text-fh-muted hover:text-fh-red hover:bg-fh-panel-2 transition-colors"
      >
        <RulerIcon className="w-[18px] h-[18px]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-fh-border bg-fh-panel shadow-lg p-4 z-50 flex flex-col gap-3"
        >
          <PillRow label="Units" options={UNIT_OPTIONS}  value={prefs.units}      onChange={setUnits} />
          <PillRow label="Power" options={POWER_OPTIONS} value={prefs.powerUnits} onChange={setPowerUnits} />
          <p className="text-[11px] text-fh-muted leading-snug pt-2 border-t border-fh-border">
            Applies across the car database, garage, and tuning guides.
          </p>
        </div>
      )}
    </div>
  )
}
