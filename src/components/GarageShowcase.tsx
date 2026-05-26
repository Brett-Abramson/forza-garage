'use client'

import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from 'react'
import { useSearchParams } from 'next/navigation'
import { Car, FilterState, PI_CLASS_ORDER, PI_CLASS_COLORS, SOURCE_CHIPS } from '@/types/car'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import CarCard from './CarCard'
import CarRow from './CarRow'
import FilterBar from './FilterBar'
import { SortTh, GridIcon, TableIcon } from './table-ui'
import { CAR_TAGS } from '@/lib/tags'
const ALL_TAGS = new Set<string>(CAR_TAGS)
import { splitTagsBySource } from '@/lib/autotags'
import { RACE_TYPES } from '@/lib/races'
import { getRankedRaceTypes } from '@/lib/raceMatch'
import { getTuningGuide } from '@/lib/tuningGuides'
import { getDivisionsForGroup } from '@/lib/divisionGroups'
import GarageDrawer from './GarageDrawer'
import DivisionGroupFilter from './DivisionGroupFilter'
import StatBars from './StatBars'
import { getStatCallouts } from '@/lib/statCallouts'
import { StatFields, carToStats, statsToPayload, RARITY_OPTIONS } from '@/lib/statUtils'
import Link from 'next/link'

type ViewMode = 'grid' | 'table'
type FilterMode = 'tags' | 'race'

interface SortState {
  key: SortKey | null
  dir: SortDir
}

interface Props {
  initialCars: Car[]
}

function buildOptions(cars: Car[]) {
  return {
    divisions: [...new Set(cars.map((c) => c.division))].sort(),
    makes: [...new Set(cars.map((c) => c.make))].sort(),
    countries: [...new Set(cars.map((c) => c.country))].sort(),
  }
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  piClass: '',
  division: '',
  make: '',
  drivetrain: '',
  country: '',
  source: '',
  owned: 'all',
}

// ─── Inline expansion row for list view ──────────────────────────────────────

type TagDetail = { tag: string; source: string }

function ExpandedRow({
  car,
  onTagDetailsChange,
  onNotesChange,
  onStatsChange,
}: {
  car: Car
  onTagDetailsChange: (carId: number, tagDetails: TagDetail[]) => void
  onNotesChange: (carId: number, notes: string) => void
  onStatsChange: (carId: number, partial: Partial<Car>) => void
}) {
  const { auto: autoTags, user: initUserTags } = splitTagsBySource(car.tagDetails ?? [])
  const [userTags, setUserTags] = useState<string[]>(initUserTags)
  const [notes, setNotes] = useState(car.notes ?? '')
  const [notesDirty, setNotesDirty] = useState(false)

  // Stat entry state
  const [stats, setStats] = useState<StatFields>(() => carToStats(car))
  const [statsDirty, setStatsDirty] = useState(false)
  const [savingStats, setSavingStats] = useState(false)

  const rankedRaces = getRankedRaceTypes(
    car.division,
    [...autoTags, ...userTags],
    car.drivetrain ?? undefined
  )
  const tuningGuide =
    rankedRaces.length > 0
      ? getTuningGuide(rankedRaces[0].race.id, car.division)
      : null
  const statCallouts = getStatCallouts(car)

  async function patchUserTags(next: string[]) {
    setUserTags(next)
    const nextDetails: TagDetail[] = [
      ...autoTags.map((tag) => ({ tag, source: 'auto' })),
      ...next.map((tag) => ({ tag, source: 'user' })),
    ]
    onTagDetailsChange(car.id, nextDetails)
    await fetch(`/api/garage/${car.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: next }),
    })
  }

  async function saveNotes() {
    if (!notesDirty) return
    setNotesDirty(false)
    onNotesChange(car.id, notes)
    await fetch(`/api/garage/${car.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
  }

  async function saveStats() {
    if (!statsDirty) return
    setSavingStats(true)
    const payload = statsToPayload(stats)
    await fetch(`/api/cars/${car.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    onStatsChange(car.id, payload as Partial<Car>)
    setSavingStats(false)
    setStatsDirty(false)
  }

  function updateStat(key: keyof StatFields, value: string) {
    setStats((prev) => ({ ...prev, [key]: value }))
    setStatsDirty(true)
  }

  const hasAnyStats = Object.values(stats).some((v) => v !== '')

  const available = (CAR_TAGS as readonly string[]).filter(
    (t) => !userTags.includes(t) && !autoTags.includes(t)
  )

  return (
    <tr className="border-b border-[#21262d] bg-[#0d1117]">
      <td colSpan={10} className="px-5 py-3">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {autoTags.length === 0 && userTags.length === 0 && (
                <span className="text-xs text-gray-600">No tags — add one below</span>
              )}
              {/* Auto tags — muted, no remove button */}
              {autoTags.map((tag) => (
                <span
                  key={`auto-${tag}`}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 opacity-60"
                >
                  {tag}
                </span>
              ))}
              {/* User tags — full color, removable */}
              {userTags.map((tag) => (
                <button
                  key={`user-${tag}`}
                  onClick={() => patchUserTags(userTags.filter((t) => t !== tag))}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-colors"
                >
                  {tag} <span className="opacity-70">×</span>
                </button>
              ))}
            </div>
            {available.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {available.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => patchUserTags([...userTags, tag])}
                    className="px-2.5 py-0.5 rounded-full text-xs border border-dashed border-[#30363d] text-gray-600 hover:text-gray-300 hover:border-[#484f58] transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesDirty(true) }}
            onBlur={saveNotes}
            placeholder="Notes..."
            rows={2}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/60 resize-none"
          />
          {/* Stat bars — compact version */}
          <div className="border-t border-[#21262d] pt-3">
            <StatBars car={car} />
          </div>

          {rankedRaces.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-600 mt-1">
              <span>Best for:</span>
              <a
                href={`/races/${rankedRaces[0].race.id}`}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {rankedRaces[0].race.icon} {rankedRaces[0].race.name}
              </a>
              {rankedRaces.slice(1).map(({ race }) => (
                <span key={race.id} className="flex items-center gap-1.5">
                  <span className="text-gray-700">·</span>
                  <a
                    href={`/races/${race.id}`}
                    className="text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {race.icon} {race.name}
                  </a>
                </span>
              ))}
            </div>
          )}

          {/* Stat analysis callouts */}
          {statCallouts.length > 0 && (
            <div className="border-t border-[#21262d] pt-3">
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Stat analysis</div>
                <div className="text-[9px] text-gray-700 italic">based on available data</div>
              </div>
              <div className="flex flex-col gap-2">
                {statCallouts.map((c) => (
                  <div key={c.id} className="rounded border border-blue-500/20 bg-blue-500/5 px-2.5 py-2">
                    <div className="text-[10px] text-blue-400/80 font-medium uppercase tracking-wide mb-0.5">
                      {c.title}
                    </div>
                    <p className="text-xs text-blue-200/60 leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tuning guide */}
          {rankedRaces.length > 0 && (
            <div className="border-t border-[#21262d] pt-3 flex flex-col gap-3">
              {tuningGuide ? (
                <>
                  <p className="text-xs text-gray-500 leading-relaxed">{tuningGuide.philosophy}</p>
                  <p className="text-xs text-gray-600 italic leading-relaxed">{tuningGuide.spectrum}</p>
                  <ol className="space-y-1">
                    {tuningGuide.priorities.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs">
                        <span className="text-cyan-500/50 font-mono shrink-0 w-4">{i + 1}.</span>
                        <span className="text-gray-400">{p}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="rounded border border-amber-500/20 bg-amber-500/5 px-2.5 py-2">
                    <span className="text-[10px] text-amber-500/70 uppercase tracking-wide mr-1.5">Watch out:</span>
                    <span className="text-xs text-amber-200/60 leading-relaxed">{tuningGuide.watchOut}</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-600 italic">Tuning guide coming soon for this combination.</p>
              )}
            </div>
          )}

          {/* Stat entry */}
          <div className="border-t border-[#21262d] pt-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Stats</div>
              {savingStats && <span className="text-[10px] text-gray-600">Saving…</span>}
              {!savingStats && !statsDirty && hasAnyStats && (
                <span className="text-[10px] text-gray-600">Saved</span>
              )}
            </div>
            {/* Performance — 3 columns for compact row layout */}
            <div className="mb-3">
              <div className="text-[10px] text-gray-700 mb-1.5">Performance · 0–10</div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                {([
                  ['statSpeed', 'Speed'], ['statHandling', 'Handling'], ['statAcceleration', 'Accel'],
                  ['statLaunch', 'Launch'], ['statBraking', 'Braking'], ['statOffroad', 'Offroad'],
                ] as [keyof StatFields, string][]).map(([key, label]) => (
                  <RowStatInput
                    key={key}
                    label={label}
                    value={stats[key]}
                    step={0.1}
                    min={0}
                    max={10}
                    onChange={(v) => updateStat(key, v)}
                    onBlur={saveStats}
                  />
                ))}
              </div>
            </div>
            {/* Specs — 3 columns */}
            <div>
              <div className="text-[10px] text-gray-700 mb-1.5">Specs</div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                <RowStatInput label="HP" value={stats.powerHp} onChange={(v) => updateStat('powerHp', v)} onBlur={saveStats} />
                <RowStatInput label="Torque" value={stats.torqueFtLb} onChange={(v) => updateStat('torqueFtLb', v)} onBlur={saveStats} />
                <RowStatInput label="Weight" value={stats.weightLb} onChange={(v) => updateStat('weightLb', v)} onBlur={saveStats} />
                <RowStatInput label="F.Wt %" value={stats.frontWeight} min={0} max={100} onChange={(v) => updateStat('frontWeight', v)} onBlur={saveStats} />
                <RowStatInput label="Disp (L)" value={stats.displacementL} step={0.1} onChange={(v) => updateStat('displacementL', v)} onBlur={saveStats} />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-600 mb-0.5">Rarity</div>
                  <select
                    value={stats.rarity}
                    onChange={(e) => updateStat('rarity', e.target.value)}
                    onBlur={saveStats}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[10px] text-gray-300 focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="">—</option>
                    {RARITY_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

function RowStatInput({
  label, value, step, min, max, onChange, onBlur,
}: {
  label: string
  value: string
  step?: number
  min?: number
  max?: number
  onChange: (v: string) => void
  onBlur: () => void
}) {
  function handleBlur() {
    if (value !== '' && min != null && max != null) {
      const isFloat = step != null && step < 1
      const num = isFloat ? parseFloat(value) : parseInt(value)
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, min), max)
        if (clamped !== num) onChange(String(clamped))
      }
    }
    onBlur()
  }

  return (
    <div className="min-w-0">
      <div className="text-[10px] text-gray-600 mb-0.5">{label}</div>
      <input
        type="number"
        aria-label={label}
        value={value}
        step={step ?? 1}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="—"
        className="w-full bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[10px] text-gray-300 focus:outline-none focus:border-cyan-500/60 placeholder:text-gray-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  )
}

export default function GarageShowcase({ initialCars }: Props) {
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  const [cars, setCars] = useState<Car[]>(initialCars)
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') ?? '',
    piClass: searchParams.get('class') ?? '',
    division: searchParams.get('div') ?? '',
    make: searchParams.get('make') ?? '',
    drivetrain: searchParams.get('drive') ?? '',
    country: searchParams.get('country') ?? '',
    source: searchParams.get('src') ?? '',
    owned: 'all',
  })
  const [view, setView] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) ?? 'table'
  )
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'desc' })
  const [filterMode, setFilterMode] = useState<FilterMode>(
    (searchParams.get('mode') as FilterMode) ?? 'tags'
  )
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set((searchParams.get('tags')?.split(',') ?? []).filter((t) => ALL_TAGS.has(t)))
  )
  const [selectedRace, setSelectedRace] = useState<string | null>(
    searchParams.get('race') ?? null
  )
  const [displayedRaceId, setDisplayedRaceId] = useState<string | null>(
    searchParams.get('race') ?? null
  )
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    searchParams.get('group') ?? null
  )
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [drawerCar, setDrawerCar] = useState<Car | null>(null)
  const [expandedCarId, setExpandedCarId] = useState<number | null>(null)

  useEffect(() => { if (selectedRace) setDisplayedRaceId(selectedRace) }, [selectedRace])

  // Press / to focus search (skips when cursor is already in a form field)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Sync filter/view state to URL — debounced 300 ms
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('q', filters.search)
    if (filters.piClass) params.set('class', filters.piClass)
    if (selectedGroupId) params.set('group', selectedGroupId)
    if (filters.division) params.set('div', filters.division)
    if (filters.make) params.set('make', filters.make)
    if (filters.drivetrain) params.set('drive', filters.drivetrain)
    if (filters.country) params.set('country', filters.country)
    if (filters.source) params.set('src', filters.source)
    if (selectedTags.size > 0) params.set('tags', [...selectedTags].sort().join(','))
    if (selectedRace) params.set('race', selectedRace)
    if (filterMode !== 'tags') params.set('mode', filterMode)
    if (view !== 'table') params.set('view', view)
    const qs = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source,
    selectedGroupId, selectedTags, selectedRace, filterMode, view,
  ])

  const options = useMemo(() => buildOptions(cars), [cars])
  const activeRace = useMemo(() => RACE_TYPES.find((r) => r.id === selectedRace) ?? null, [selectedRace])
  const displayedRace = useMemo(() => RACE_TYPES.find((r) => r.id === displayedRaceId) ?? null, [displayedRaceId])

  const classCounts = useMemo(
    () => Object.fromEntries(PI_CLASS_ORDER.map((cls) => [cls, cars.filter((c) => c.piClass === cls).length])),
    [cars]
  )

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !car.make.toLowerCase().includes(q) &&
          !car.model.toLowerCase().includes(q) &&
          !car.division.toLowerCase().includes(q)
        )
          return false
      }
      if (filters.piClass && car.piClass !== filters.piClass) return false
      if (selectedGroupId) {
        const groupDivisions = getDivisionsForGroup(selectedGroupId)
        if (filters.division) {
          if (car.division !== filters.division) return false
        } else {
          if (!groupDivisions.includes(car.division)) return false
        }
      } else if (filters.division) {
        if (car.division !== filters.division) return false
      }
      if (filters.make && car.make !== filters.make) return false
      if (filters.drivetrain && car.drivetrain !== filters.drivetrain) return false
      if (filters.country && car.country !== filters.country) return false
      if (filters.source && !car.source.includes(filters.source)) return false
      // Race filter: OR — car matches any of the recommended tags
      if (activeRace) {
        const carTags = car.tags ?? []
        if (!activeRace.recommendedTags.some((t) => carTags.includes(t))) return false
      }
      // Tag filter: AND — car must have every selected tag
      if (selectedTags.size > 0) {
        const carTags = car.tags ?? []
        if (![...selectedTags].every((t) => carTags.includes(t))) return false
      }
      return true
    })
  }, [cars, filters, activeRace, selectedGroupId, selectedTags])

  const sortedCars = useMemo(() => {
    const copy = [...filteredCars]
    copy.sort(sort.key ? (a, b) => compareRows(a, b, sort.key!, sort.dir) : defaultSort)
    return copy
  }, [filteredCars, sort])

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const handleGroupChange = useCallback((groupId: string | null) => {
    setSelectedGroupId(groupId)
    setFilters((f) => ({ ...f, division: '' }))
  }, [])

  const handleDivisionChange = useCallback((division: string) => {
    setFilters((f) => ({ ...f, division }))
  }, [])

  const switchMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode)
    if (mode === 'tags') setSelectedRace(null)
    if (mode === 'race') setSelectedTags(new Set())
  }, [])

  const toggleRace = useCallback((id: string) => {
    setSelectedRace((prev) => (prev === id ? null : id))
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }, [])

  const handleTagDetailsChange = useCallback((carId: number, tagDetails: TagDetail[]) => {
    setCars((prev) => prev.map((c) => c.id === carId ? {
      ...c,
      tags: [...new Set(tagDetails.map((t) => t.tag))],
      tagDetails,
    } : c))
  }, [])

  const handleNotesChange = useCallback((carId: number, notes: string) => {
    setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, notes } : c)))
  }, [])

  const handleStatsChange = useCallback((carId: number, partial: Partial<Car>) => {
    setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, ...partial } : c)))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedGroupId(null)
    setSelectedTags(new Set())
    setSelectedRace(null)
    setFilterMode('tags')
  }, [])

  const activeFilterCount = [
    filters.piClass !== '',
    filters.division !== '' || selectedGroupId !== null,
    filters.make !== '',
    filters.drivetrain !== '',
    filters.country !== '',
    filters.source !== '',
    selectedTags.size > 0,
    selectedRace !== null,
  ].filter(Boolean).length

  const toggleExpanded = useCallback((carId: number) => {
    setExpandedCarId((prev) => (prev === carId ? null : carId))
  }, [])

  const handleToggle = useCallback(async (id: number, owned: boolean) => {
    if (owned) return
    setPendingIds((s) => new Set(s).add(id))
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owned: false }),
      })
      if (!res.ok) throw new Error('Failed')
      setCars((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setPendingIds((s) => {
        const next = new Set(s)
        next.delete(id)
        return next
      })
    }
  }, [])

  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🏎️</div>
        <h2 className="text-xl font-semibold mb-2">Your garage is empty</h2>
        <p className="text-gray-500 text-sm mb-6">
          Head to the Car Database to find and add cars to your collection.
        </p>
        <Link
          href="/cars"
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
        >
          Browse Car Database
        </Link>
      </div>
    )
  }

  return (
    <>
    <div className="flex flex-col gap-6">
      {/* Search + active filter badge + view toggle */}
      <div className="flex gap-3 items-center">
        <input
          ref={searchRef}
          type="text"
          placeholder="Search make, model, division... (press / to focus)"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-gray-600"
        />
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors whitespace-nowrap"
          >
            {activeFilterCount} active · clear
          </button>
        )}
        <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView('grid')}
            title="Grid view"
            className={`px-3 py-2 transition-colors ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setView('table')}
            title="Table view"
            className={`px-3 py-2 transition-colors ${view === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <TableIcon />
          </button>
        </div>
      </div>

      {/* Class stat chips */}
      <div className="flex flex-wrap gap-2">
        {PI_CLASS_ORDER.filter((cls) => classCounts[cls] > 0)
          .reverse()
          .map((cls) => (
            <button
              key={cls}
              onClick={() => setFilters((f) => ({ ...f, piClass: f.piClass === cls ? '' : cls }))}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors ${
                filters.piClass === cls
                  ? 'bg-cyan-500/15 border-cyan-500/40'
                  : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
              }`}
            >
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${PI_CLASS_COLORS[cls]}`}>
                {cls}
              </span>
              <span className="text-sm font-semibold">{classCounts[cls]}</span>
              <span className="text-xs text-gray-500">{classCounts[cls] === 1 ? 'car' : 'cars'}</span>
            </button>
          ))}
      </div>

      {/* Division group filter */}
      <DivisionGroupFilter
        selectedGroupId={selectedGroupId}
        selectedDivision={filters.division}
        availableDivisions={options.divisions}
        onGroupChange={handleGroupChange}
        onDivisionChange={handleDivisionChange}
      />

      {/* Filter bar — division handled by group chips above */}
      <FilterBar
        filters={filters}
        options={options}
        onChange={setFilters}
        totalCount={cars.length}
        filteredCount={filteredCars.length}
        hideOwned
        hideDivision
      />

      {/* Source chips */}
      <div className="flex flex-wrap gap-2">
        {SOURCE_CHIPS.map(({ label, match }) => (
          <button
            key={match}
            onClick={() => setFilters((f) => ({ ...f, source: f.source === match ? '' : match }))}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filters.source === match
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-[#161b22] text-gray-500 border-[#30363d] hover:border-[#484f58] hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter mode toggle + chip row */}
      <div>
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">Filter by</span>
          <button
            onClick={() => switchMode('tags')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterMode === 'tags'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => switchMode('race')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterMode === 'race'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Race type
          </button>
        </div>

        {filterMode === 'tags' ? (
          <div className="flex flex-wrap gap-2">
            {CAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-[#161b22] text-gray-500 border-[#30363d] hover:border-[#484f58] hover:text-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.size > 0 && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="px-3 py-1 rounded-full text-xs font-medium border border-[#30363d] text-gray-500 hover:text-gray-300 hover:border-[#484f58] transition-colors"
              >
                ✕ clear
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {RACE_TYPES.map((race) => (
              <button
                key={race.id}
                onClick={() => toggleRace(race.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedRace === race.id
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-[#161b22] text-gray-500 border-[#30363d] hover:border-[#484f58] hover:text-gray-300'
                }`}
              >
                <span>{race.icon}</span>
                {race.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Race tray — slides in when a race pill is active */}
      <div className={`grid transition-all duration-300 ease-in-out ${selectedRace ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {displayedRace && (
            <div className="pb-2">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{displayedRace.icon}</span>
                    <span className="text-sm font-semibold text-amber-300">{displayedRace.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-500/20">
                      {displayedRace.surface}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRace(null)}
                    aria-label="Close race tray"
                    className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                    </svg>
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <ul className="space-y-1">
                    {displayedRace.demands.map((d) => (
                      <li key={d} className="flex items-start gap-1.5 text-xs text-gray-300">
                        <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Filtering by</p>
                    <div className="flex flex-wrap gap-1.5">
                      {displayedRace.recommendedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {sortedCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-medium">No cars match</div>
          <div className="text-sm mt-1">Try adjusting your filters</div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 rounded-lg text-sm border border-[#30363d] text-gray-500 hover:border-[#484f58] hover:text-gray-200 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 -mb-3">
            Showing {sortedCars.length} {sortedCars.length === 1 ? 'car' : 'cars'}
            {sortedCars.length < cars.length && ` of ${cars.length}`}
          </p>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sortedCars.map((car) => (
                <div key={car.id} className={pendingIds.has(car.id) ? 'opacity-60 pointer-events-none' : ''}>
                  <CarCard car={car} onToggleOwned={handleToggle} onCardClick={setDrawerCar} />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#30363d]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#161b22] border-b border-[#30363d] text-xs uppercase tracking-wide select-none">
                    <SortTh label="Class" sortKey="piClass" sort={sort} onSort={handleSort} />
                    <SortTh label="PI" sortKey="piRating" sort={sort} onSort={handleSort} />
                    <SortTh label="Year" sortKey="year" sort={sort} onSort={handleSort} />
                    <SortTh label="Make" sortKey="make" sort={sort} onSort={handleSort} />
                    <SortTh label="Model" sortKey="model" sort={sort} onSort={handleSort} />
                    <SortTh label="Division" sortKey="division" sort={sort} onSort={handleSort} className="hidden md:table-cell" />
                    <SortTh label="Drive" sortKey="drivetrain" sort={sort} onSort={handleSort} className="hidden lg:table-cell" />
                    <SortTh label="Country" sortKey="country" sort={sort} onSort={handleSort} className="hidden lg:table-cell" />
                    <SortTh label="Source" sortKey="source" sort={sort} onSort={handleSort} className="hidden xl:table-cell" />
                    <th className="text-left py-2.5 px-3 text-gray-500">Garage</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCars.map((car) => (
                    <Fragment key={car.id}>
                      <CarRow
                        car={car}
                        onToggleOwned={handleToggle}
                        isPending={pendingIds.has(car.id)}
                        isExpanded={expandedCarId === car.id}
                        onCardClick={(c) => toggleExpanded(c.id)}
                      />
                      {expandedCarId === car.id && (
                        <ExpandedRow
                          car={car}
                          onTagDetailsChange={handleTagDetailsChange}
                          onNotesChange={handleNotesChange}
                          onStatsChange={handleStatsChange}
                        />
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>

    <GarageDrawer
      car={drawerCar}
      onClose={() => setDrawerCar(null)}
      onTagDetailsChange={handleTagDetailsChange}
      onStatsChange={handleStatsChange}
      onToggleOwned={async (id, owned) => {
        await handleToggle(id, owned)
        if (!owned) setDrawerCar(null)
      }}
    />
    </>
  )
}
