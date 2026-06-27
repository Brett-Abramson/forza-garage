'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { FilterState, PI_CLASS_ORDER, PI_CLASS_COLORS, SOURCE_CHIPS } from '@/types/car'
import { DIVISION_GROUPS } from '@/lib/divisionGroups'
import { AUTO_TAGS } from '@/lib/tags'
import { RACE_TYPES } from '@/lib/races'
import type { RaceType } from '@/lib/races'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  isGarage: boolean
  isSignedIn?: boolean
  filters: FilterState
  setFilters: Dispatch<SetStateAction<FilterState>>
  options: { divisions: string[]; makes: string[]; countries: string[]; years: { min: number; max: number; decades: number[] } }
  selectedGroupIds: string[]
  selectedTags: Set<string>
  selectedRaceIds: string[]
  activeFilterCount: number
  activeRace: RaceType | null
  clearAllFilters: () => void
  handleGroupChange: (groupId: string) => void
  handleDivisionChange: (division: string) => void
  toggleTag: (tag: string) => void
  toggleRace: (raceId: string) => void
  // Garage-only
  pinnedCount?: number
  /** Pass true if any car in the current result set has at least one non-null sim value. */
  hasSimData?: boolean
}

function SvgChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .18s' }}
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

function SvgFilter() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M1.5 3.5h13M3.5 8h9M6 12.5h4" />
    </svg>
  )
}

// ── Segmented control ─────────────────────────────────────────────────────────
function Segmented({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex bg-fh-panel-2 border border-fh-border rounded-lg p-[3px] gap-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-[5px] text-[11px] font-medium rounded-md transition-colors ${
            value === o.value
              ? 'bg-fh-panel text-fh-red [box-shadow:0_1px_2px_rgba(0,0,0,0.08)]'
              : 'text-fh-muted hover:text-fh-dark-2'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Year range — custom From/To inputs, committed on blur or Enter ──────────────
// Keeps local string state while typing so partial values (e.g. "19") don't
// momentarily filter the list to empty; commits a clamped, ordered range.
function YearRange({
  min,
  max,
  yearMin,
  yearMax,
  onChange,
}: {
  min: number
  max: number
  yearMin: number | null
  yearMax: number | null
  onChange: (next: { yearMin: number | null; yearMax: number | null }) => void
}) {
  const [from, setFrom] = useState(yearMin?.toString() ?? '')
  const [to, setTo] = useState(yearMax?.toString() ?? '')

  // Re-sync inputs when the bounds change externally (decade chip / clear all).
  useEffect(() => { setFrom(yearMin?.toString() ?? '') }, [yearMin])
  useEffect(() => { setTo(yearMax?.toString() ?? '') }, [yearMax])

  function commit(rawFrom: string, rawTo: string) {
    const clamp = (raw: string): number | null => {
      if (raw.trim() === '') return null
      const n = parseInt(raw, 10)
      if (isNaN(n)) return null
      return Math.min(Math.max(n, min), max)
    }
    let lo = clamp(rawFrom)
    let hi = clamp(rawTo)
    if (lo != null && hi != null && lo > hi) [lo, hi] = [hi, lo]
    onChange({ yearMin: lo, yearMax: hi })
  }

  const inputCls =
    'w-full bg-fh-panel border border-fh-border rounded-lg px-2.5 py-1.5 text-xs text-fh-dark focus:outline-none focus:border-fh-red tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

  return (
    <div className="flex items-center gap-2">
      <input
        type="number" inputMode="numeric" aria-label="From year"
        placeholder={String(min)} value={from}
        onChange={(e) => setFrom(e.target.value)}
        onBlur={() => commit(from, to)}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        className={inputCls}
      />
      <span className="text-fh-muted text-xs shrink-0">–</span>
      <input
        type="number" inputMode="numeric" aria-label="To year"
        placeholder={String(max)} value={to}
        onChange={(e) => setTo(e.target.value)}
        onBlur={() => commit(from, to)}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        className={inputCls}
      />
    </div>
  )
}

// ── Sim metric range — numeric min/max committed on blur or Enter ──────────────
function SimRange({
  label,
  unit,
  step,
  minVal,
  maxVal,
  onChange,
}: {
  label: string
  unit: string
  step: number
  minVal: number | null
  maxVal: number | null
  onChange: (next: { min: number | null; max: number | null }) => void
}) {
  const [from, setFrom] = useState(minVal != null ? String(minVal) : '')
  const [to,   setTo]   = useState(maxVal != null ? String(maxVal) : '')

  useEffect(() => { setFrom(minVal != null ? String(minVal) : '') }, [minVal])
  useEffect(() => { setTo(maxVal != null ? String(maxVal) : '') },   [maxVal])

  function commit(rawFrom: string, rawTo: string) {
    const parse = (raw: string): number | null => {
      if (raw.trim() === '') return null
      const n = parseFloat(raw)
      return isNaN(n) ? null : n
    }
    onChange({ min: parse(rawFrom), max: parse(rawTo) })
  }

  const inputCls =
    'w-full bg-fh-panel border border-fh-border rounded-lg px-2.5 py-1.5 text-xs text-fh-dark focus:outline-none focus:border-fh-red tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-medium text-fh-muted-2">{label} <span className="lowercase">{unit}</span></div>
      <div className="flex items-center gap-2">
        <input
          type="number" inputMode="decimal" step={step} aria-label={`${label} min`}
          placeholder="Min" value={from}
          onChange={(e) => setFrom(e.target.value)}
          onBlur={() => commit(from, to)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          className={inputCls}
        />
        <span className="text-fh-muted text-xs shrink-0">–</span>
        <input
          type="number" inputMode="decimal" step={step} aria-label={`${label} max`}
          placeholder="Max" value={to}
          onChange={(e) => setTo(e.target.value)}
          onBlur={() => commit(from, to)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          className={inputCls}
        />
      </div>
    </div>
  )
}

export default function FilterSidebar({
  isOpen,
  onClose,
  isGarage,
  isSignedIn = false,
  filters,
  setFilters,
  options,
  selectedGroupIds,
  selectedTags,
  selectedRaceIds,
  activeFilterCount,
  activeRace,
  clearAllFilters,
  handleGroupChange,
  handleDivisionChange,
  toggleTag,
  toggleRace,
  pinnedCount = 0,
  hasSimData = true,
}: FilterSidebarProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [simOpen,  setSimOpen]  = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Count active "more" filters (make is now primary, so excluded)
  const moreCount =
    (filters.drivetrain ? 1 : 0) +
    (filters.country ? 1 : 0) +
    (filters.source ? 1 : 0) +
    selectedTags.size

  // Count active sim filters
  const simActiveCount = [
    filters.simZeroToSixtyMin,  filters.simZeroToSixtyMax,
    filters.simZeroToHundredMin, filters.simZeroToHundredMax,
    filters.simBraking60Min,    filters.simBraking60Max,
    filters.simLateralG60Min,   filters.simLateralG60Max,
    filters.simTopSpeedMin,     filters.simTopSpeedMax,
  ].filter((v) => v != null).length

  // Auto-open More filters if any more-filter is active
  useEffect(() => {
    if (moreCount > 0) setMoreOpen(true)
  }, [moreCount])

  // Auto-open Sim Metrics section if any sim filter is active
  useEffect(() => {
    if (simActiveCount > 0) setSimOpen(true)
  }, [simActiveCount])

  const selectedGroups = DIVISION_GROUPS.filter((g) => selectedGroupIds.includes(g.id))

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fh-border shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-fh-dark-2 uppercase tracking-wide">
          <SvgFilter />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-fh-red text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-[11px] text-fh-muted hover:text-fh-red transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-5">

        {/* Class */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Class</div>
          {/* 7-column grid keeps all classes (D…R) on one row, shrinking the
              chips to fit the sidebar width instead of wrapping R onto line 2. */}
          <div className="grid grid-cols-7 gap-1.5">
            {PI_CLASS_ORDER.map((cls) => (
              <button
                key={cls}
                onClick={() => setFilters((f) => ({
                  ...f,
                  piClass: f.piClass.includes(cls)
                    ? f.piClass.filter((c) => c !== cls)
                    : [...f.piClass, cls],
                }))}
                className={`w-full h-[26px] rounded-[6px] text-xs font-bold transition-colors ${PI_CLASS_COLORS[cls]} ${
                  filters.piClass.includes(cls)
                    ? 'ring-2 ring-offset-1 ring-offset-fh-panel ring-fh-red scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Make */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Make</div>
          <select
            value=""
            onChange={(e) => {
              const m = e.target.value
              if (m) setFilters((f) => ({ ...f, make: [...f.make, m] }))
            }}
            className="bg-fh-panel border border-fh-border rounded-lg px-2.5 py-1.5 text-xs text-fh-dark focus:outline-none focus:border-fh-red cursor-pointer"
          >
            <option value="">All makes</option>
            {options.makes.filter((m) => !filters.make.includes(m)).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {filters.make.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.make.map((m) => (
                <span key={m} className="flex items-center gap-1 pl-2 pr-1 py-[3px] rounded-full text-xs font-medium bg-fh-red-pale text-fh-red border border-fh-red">
                  {m}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, make: f.make.filter((x) => x !== m) }))}
                    className="hover:opacity-60 transition-opacity leading-none"
                    aria-label={`Remove ${m}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Year */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Year</div>
          <div className="flex flex-wrap gap-1.5">
            {options.years.decades.map((d) => {
              const active = filters.yearMin === d && filters.yearMax === d + 9
              return (
                <button
                  key={d}
                  onClick={() => setFilters((f) => active
                    ? { ...f, yearMin: null, yearMax: null }
                    : { ...f, yearMin: d, yearMax: d + 9 })}
                  className={`px-2.5 py-[5px] rounded-full text-xs font-medium border transition-colors tabular-nums ${
                    active
                      ? 'bg-fh-red-pale text-fh-red border-fh-red'
                      : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
                  }`}
                >
                  {`${d}s`}
                </button>
              )
            })}
          </div>
          <YearRange
            min={options.years.min}
            max={options.years.max}
            yearMin={filters.yearMin}
            yearMax={filters.yearMax}
            onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Category</div>
          <div className="flex flex-wrap gap-1.5">
            {DIVISION_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGroupChange(g.id)}
                className={`flex items-center gap-1 px-2.5 py-[5px] rounded-full text-xs font-medium border transition-colors ${
                  selectedGroupIds.includes(g.id)
                    ? 'bg-fh-red-pale text-fh-red border-fh-red'
                    : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
                }`}
              >
                <span>{g.icon}</span>
                {g.name}
              </button>
            ))}
          </div>
          {selectedGroups.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-1 mt-0.5">
              {selectedGroups
                .flatMap((g) => g.divisions)
                .filter((d) => options.divisions.includes(d))
                .map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDivisionChange(d)}
                    className={`px-2 py-[3px] rounded-md text-[11px] font-medium border transition-colors ${
                      filters.division.includes(d)
                        ? 'bg-fh-red-pale text-fh-red border-fh-red'
                        : 'bg-fh-panel-2 text-fh-muted border-fh-border hover:text-fh-dark'
                    }`}
                  >
                    {d}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Race type */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Race type</div>
          <div className="flex flex-wrap gap-1.5">
            {RACE_TYPES.map((race) => (
              <button
                key={race.id}
                onClick={() => toggleRace(race.id)}
                className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-xs font-medium border transition-colors ${
                  selectedRaceIds.includes(race.id)
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark-2'
                }`}
              >
                <span aria-hidden="true" style={{ fontSize: '0.9em', lineHeight: 1 }}>{race.icon}</span>
                {race.name}
              </button>
            ))}
          </div>
          {activeRace && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-fh-dark-2 leading-relaxed">
              <span className="font-medium text-amber-400">{activeRace.icon} {activeRace.name}</span>
              {' · '}
              <span className="text-fh-muted">{activeRace.surface}</span>
            </div>
          )}
        </div>

        {/* Garage status (cars page, signed-in only — owned/not-owned is
            meaningless without a garage) */}
        {!isGarage && isSignedIn && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Garage status</div>
            <Segmented
              value={filters.owned}
              onChange={(v) => setFilters((f) => ({ ...f, owned: v as FilterState['owned'] }))}
              options={[
                { value: 'all', label: 'All' },
                { value: 'owned', label: 'Owned' },
                { value: 'not-owned', label: 'Not owned' },
              ]}
            />
          </div>
        )}

        {/* Favourites (garage page only) */}
        {isGarage && pinnedCount > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Favourites</div>
            <button
              onClick={() => setFilters((f) => ({ ...f, pinned: !f.pinned }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors w-full ${
                filters.pinned
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-fh-panel text-fh-muted border-fh-border hover:text-amber-400'
              }`}
            >
              <span>★</span>
              <span>Show only favourites</span>
              <span className="ml-auto tabular-nums">{pinnedCount}</span>
            </button>
          </div>
        )}

        {/* Top badge filter */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Badges</div>
          <button
            onClick={() => setFilters((f) => ({ ...f, hasTopBadge: !f.hasTopBadge }))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors w-full ${
              filters.hasTopBadge
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-fh-panel text-fh-muted border-fh-border hover:text-amber-400'
            }`}
          >
            <span aria-hidden="true">★</span>
            <span>Has stat highlights</span>
          </button>
        </div>

        {/* Sim Metrics disclosure — only shown when result set has sim data */}
        {hasSimData && (
          <div>
            <button
              onClick={() => setSimOpen((v) => !v)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[9px] text-xs font-medium border border-fh-border bg-fh-panel-2 transition-colors hover:border-fh-border hover:text-fh-dark-2 ${simOpen ? 'text-fh-dark' : 'text-fh-muted'}`}
            >
              <SvgChevron open={simOpen} />
              Sim Metrics
              {simActiveCount > 0 && (
                <span className="ml-0.5 min-w-[16px] h-4 px-1 rounded-full bg-fh-red/10 text-fh-red text-[9px] font-bold flex items-center justify-center leading-none">
                  {simActiveCount}
                </span>
              )}
            </button>

            {simOpen && (
              <div className="flex flex-col gap-3 mt-4 pl-1">
                <SimRange
                  label="0–60" unit="s" step={0.1}
                  minVal={filters.simZeroToSixtyMin}
                  maxVal={filters.simZeroToSixtyMax}
                  onChange={({ min, max }) => setFilters((f) => ({ ...f, simZeroToSixtyMin: min, simZeroToSixtyMax: max }))}
                />
                <SimRange
                  label="0–100" unit="s" step={0.1}
                  minVal={filters.simZeroToHundredMin}
                  maxVal={filters.simZeroToHundredMax}
                  onChange={({ min, max }) => setFilters((f) => ({ ...f, simZeroToHundredMin: min, simZeroToHundredMax: max }))}
                />
                <SimRange
                  label="Braking 60–0" unit="ft" step={1}
                  minVal={filters.simBraking60Min}
                  maxVal={filters.simBraking60Max}
                  onChange={({ min, max }) => setFilters((f) => ({ ...f, simBraking60Min: min, simBraking60Max: max }))}
                />
                <SimRange
                  label="Lateral G (60)" unit="G" step={0.01}
                  minVal={filters.simLateralG60Min}
                  maxVal={filters.simLateralG60Max}
                  onChange={({ min, max }) => setFilters((f) => ({ ...f, simLateralG60Min: min, simLateralG60Max: max }))}
                />
                <SimRange
                  label="Top Speed" unit="mph" step={1}
                  minVal={filters.simTopSpeedMin}
                  maxVal={filters.simTopSpeedMax}
                  onChange={({ min, max }) => setFilters((f) => ({ ...f, simTopSpeedMin: min, simTopSpeedMax: max }))}
                />
              </div>
            )}
          </div>
        )}

        {/* More filters disclosure */}
        <div>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[9px] text-xs font-medium border border-fh-border bg-fh-panel-2 transition-colors hover:border-fh-border hover:text-fh-dark-2 ${moreOpen ? 'text-fh-dark' : 'text-fh-muted'}`}
          >
            <SvgChevron open={moreOpen} />
            More filters
            {moreCount > 0 && (
              <span className="ml-0.5 min-w-[16px] h-4 px-1 rounded-full bg-fh-red/10 text-fh-red text-[9px] font-bold flex items-center justify-center leading-none">
                {moreCount}
              </span>
            )}
          </button>

          {moreOpen && (
            <div className="flex flex-col gap-4 mt-4 pl-1">
              {/* Drivetrain */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Drivetrain</div>
                <Segmented
                  value={filters.drivetrain}
                  onChange={(v) => setFilters((f) => ({ ...f, drivetrain: f.drivetrain === v ? '' : v }))}
                  options={[
                    { value: 'AWD', label: 'AWD' },
                    { value: 'RWD', label: 'RWD' },
                    { value: 'FWD', label: 'FWD' },
                  ]}
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Country</div>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
                  className="bg-fh-panel border border-fh-border rounded-lg px-2.5 py-1.5 text-xs text-fh-dark focus:outline-none focus:border-fh-red cursor-pointer"
                >
                  <option value="">All countries</option>
                  {options.countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Source</div>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCE_CHIPS.map(({ label, match }) => (
                    <button
                      key={match}
                      onClick={() => setFilters((f) => ({ ...f, source: f.source === match ? '' : match }))}
                      className={`px-2.5 py-[5px] rounded-full text-xs font-medium border transition-colors ${
                        filters.source === match
                          ? 'bg-fh-red-pale text-fh-red border-fh-red'
                          : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-semibold text-fh-muted uppercase tracking-wider">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {AUTO_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-[5px] rounded-full text-xs font-medium border transition-colors ${
                        selectedTags.has(tag)
                          ? 'bg-fh-red-pale text-fh-red border-fh-red'
                          : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )

  // ── Desktop: sticky left column ───────────────────────────────────────────
  if (!isMobile) {
    if (!isOpen) return null
    return (
      <aside className="w-[280px] shrink-0 sticky top-12 h-[calc(100vh-48px)] overflow-y-auto border-r border-fh-border bg-fh-panel">
        {content}
      </aside>
    )
  }

  // ── Mobile: fixed off-canvas drawer ──────────────────────────────────────
  return (
    <>
      {/* Scrim */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-[260ms] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-fh-panel border-r border-fh-border overflow-y-auto transition-transform duration-[260ms] ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Filters"
      >
        {content}
      </aside>
    </>
  )
}
