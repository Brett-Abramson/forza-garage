'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavControls } from '@/context/NavControls'
import { useSearchParams } from 'next/navigation'
import { Car, FilterState, SOURCE_CHIPS } from '@/types/car'
import { CAR_TAGS, AUTO_TAGS } from '@/lib/tags'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import { RACE_TYPES } from '@/lib/races'
import CarCard from './CarCard'
import CarRow from './CarRow'
import FilterBar from './FilterBar'
import DivisionGroupFilter from './DivisionGroupFilter'
import GarageDrawer from './GarageDrawer'
import { SortTh, GridIcon, TableIcon } from './table-ui'
import { filterCars, DEFAULT_FILTERS } from '@/lib/filterCars'
import BackToTop from './BackToTop'

type ViewMode = 'grid' | 'table'
type FilterMode = 'tags' | 'race'

const PAGE_SIZE = 50

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

const ALL_TAGS = new Set<string>(CAR_TAGS)

// DEFAULT_FILTERS is re-exported from filterCars — imported above.

export default function GarageView({ initialCars }: Props) {
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
    owned: (searchParams.get('owned') as FilterState['owned']) ?? 'all',
  })
  const [view, setView] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) ?? 'grid'
  )
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'desc' })
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    searchParams.get('group') ?? null
  )
  const [page, setPage] = useState(1)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [drawerCar, setDrawerCar] = useState<Car | null>(() => {
    const openId = searchParams.get('open')
    if (!openId) return null
    return initialCars.find((c) => c.id === Number(openId)) ?? null
  })
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set((searchParams.get('tags')?.split(',') ?? []).filter((t) => ALL_TAGS.has(t)))
  )
  const [filterMode, setFilterMode] = useState<FilterMode>(
    (searchParams.get('mode') as FilterMode) ?? 'tags'
  )
  const [selectedRace, setSelectedRace] = useState<string | null>(
    searchParams.get('race') ?? null
  )
  const activeRace = useMemo(
    () => RACE_TYPES.find((r) => r.id === selectedRace) ?? null,
    [selectedRace]
  )

  const options = useMemo(() => buildOptions(cars), [cars])

  // Register search + view controls with the navbar
  const { register, unregister } = useNavControls()
  useLayoutEffect(() => {
    register({
      search: filters.search,
      setSearch: (v) => setFilters((f) => ({ ...f, search: v })),
      view,
      setView,
    })
    return () => unregister()
  }, [filters.search, view, register, unregister])

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

  // Sync filter/view state to URL — debounced 300 ms so typing doesn't thrash history
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
    if (filters.owned !== 'all') params.set('owned', filters.owned)
    if (selectedTags.size > 0) params.set('tags', [...selectedTags].sort().join(','))
    if (selectedRace) params.set('race', selectedRace)
    if (filterMode !== 'tags') params.set('mode', filterMode)
    if (view !== 'grid') params.set('view', view)
    const qs = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source, filters.owned,
    selectedGroupId, selectedTags, selectedRace, filterMode, view,
  ])

  const filteredCars = useMemo(
    () => filterCars(cars, { filters, selectedGroupId, selectedTags, activeRace }),
    [cars, filters, selectedGroupId, selectedTags, activeRace]
  )

  const sortedCars = useMemo(() => {
    const copy = [...filteredCars]
    copy.sort(sort.key ? (a, b) => compareRows(a, b, sort.key!, sort.dir) : defaultSort)
    return copy
  }, [filteredCars, sort])

  // Reset to page 1 whenever the filtered/sorted set changes
  useEffect(() => { setPage(1) }, [sortedCars.length])

  const totalPages = Math.ceil(sortedCars.length / PAGE_SIZE)
  const pagedCars = useMemo(
    () => sortedCars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedCars, page]
  )

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

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedGroupId(null)
    setSelectedTags(new Set())
    setSelectedRace(null)
    setFilterMode('tags')
  }, [])

  const switchMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode)
    if (mode === 'tags') setSelectedRace(null)
    if (mode === 'race') setSelectedTags(new Set())
  }, [])

  const toggleRace = useCallback((id: string) => {
    setSelectedRace((prev) => (prev === id ? null : id))
  }, [])

  const activeFilterCount = [
    filters.piClass !== '',
    filters.division !== '' || selectedGroupId !== null,
    filters.make !== '',
    filters.drivetrain !== '',
    filters.country !== '',
    filters.source !== '',
    filters.owned !== 'all',
    selectedTags.size > 0,
    selectedRace !== null,
  ].filter(Boolean).length

  const toggleOwned = useCallback(async (id: number, owned: boolean) => {
    setPendingIds((s) => new Set(s).add(id))
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owned }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated: Car = await res.json()
      setCars((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      // Keep drawer in sync if the toggled car is currently open
      setDrawerCar((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
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

  const handleStatsChange = useCallback((carId: number, partial: Partial<Car>) => {
    setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, ...partial } : c)))
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }, [])

  const ownedCount = cars.filter((c) => c.owned).length

  return (
    <>
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Car Database</h1>
        <p className="text-fh-muted text-sm mt-1">
          Browse all {initialCars.length} cars — mark the ones you own to add them to your garage.
        </p>
      </header>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-2xl font-bold text-fh-red">{ownedCount}</span>
          <span className="text-fh-muted ml-1.5">/ {cars.length} owned</span>
        </div>
        <div className="h-1.5 flex-1 bg-fh-panel-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-fh-red rounded-full transition-all duration-500"
            style={{ width: `${cars.length > 0 ? (ownedCount / cars.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Active filter badge */}
      {activeFilterCount > 0 && (
        <div className="flex">
          <button
            onClick={clearAllFilters}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-fh-red-pale text-fh-red border border-fh-red hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {activeFilterCount} active · clear
          </button>
        </div>
      )}

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
                ? 'bg-fh-red-pale text-fh-red border-fh-red'
                : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter mode toggle + tag/race chip row */}
      <div>
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-fh-muted uppercase tracking-wide mr-2">Filter by</span>
          <button
            onClick={() => switchMode('tags')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterMode === 'tags'
                ? 'bg-fh-red-pale text-fh-red'
                : 'text-fh-muted hover:text-fh-dark-2'
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => switchMode('race')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterMode === 'race'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-fh-muted hover:text-fh-dark-2'
            }`}
          >
            Race type
          </button>
        </div>

        {filterMode === 'tags' ? (
          // AUTO_TAGS only — user-applied labels (stock, tuned, needs work) are
          // personal garage tags with no meaning in the full car database.
          <div className="flex flex-wrap gap-2">
            {AUTO_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-fh-red-pale text-fh-red border-fh-red'
                    : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.size > 0 && (
              <button
                onClick={() => setSelectedTags(new Set())}
                className="px-3 py-1 rounded-full text-xs font-medium border border-fh-border text-fh-muted hover:text-fh-dark hover:border-fh-red transition-colors"
              >
                ✕ clear
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Pills + inline description in one stable row — no layout shift */}
            <div className="flex items-start gap-4">
              <div className="flex flex-wrap gap-2">
                {RACE_TYPES.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => toggleRace(race.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedRace === race.id
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark-2'
                    }`}
                  >
                    <span>{race.icon}</span>
                    {race.name}
                  </button>
                ))}
              </div>

              {/* Desktop inline description — never expands the row height */}
              {activeRace && (
                <div className="hidden md:flex flex-col gap-1.5 shrink-0 max-w-xs border-l border-amber-500/20 pl-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-amber-300">
                      {activeRace.icon} {activeRace.name}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400/80">
                      {activeRace.surface}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {activeRace.demands.slice(0, 3).map((d) => (
                      <li key={d} className="flex items-start gap-1 text-[11px] text-fh-muted leading-snug">
                        <span className="text-amber-500/60 mt-px shrink-0">▸</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile: compact single-line description — replaces the full accordion */}
            {activeRace && (
              <div className="md:hidden flex items-center gap-1.5 mt-2 text-xs">
                <span>{activeRace.icon}</span>
                <span className="font-medium text-amber-300">{activeRace.name}</span>
                <span className="text-amber-500/30 select-none">·</span>
                <span className="text-fh-muted">{activeRace.surface}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Results */}
      {sortedCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-fh-muted">
          <div className="text-4xl mb-3">🚗</div>
          <div className="text-lg font-medium text-fh-dark">No cars found</div>
          <div className="text-sm mt-1">Try adjusting your filters</div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 rounded-lg text-sm border border-fh-border text-fh-muted hover:border-fh-red hover:text-fh-red transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {pagedCars.map((car) => (
              <div key={car.id} className={pendingIds.has(car.id) ? 'opacity-60 pointer-events-none' : ''}>
                <CarCard car={car} onToggleOwned={toggleOwned} onCardClick={setDrawerCar} />
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={sortedCars.length} onPage={setPage} />
        </>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-fh-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-fh-panel-2 border-b border-fh-border text-xs uppercase tracking-wide select-none">
                  <SortTh label="Class" sortKey="piClass" sort={sort} onSort={handleSort} />
                  <SortTh label="PI" sortKey="piRating" sort={sort} onSort={handleSort} />
                  <SortTh label="Year" sortKey="year" sort={sort} onSort={handleSort} />
                  <SortTh label="Make" sortKey="make" sort={sort} onSort={handleSort} />
                  <SortTh label="Model" sortKey="model" sort={sort} onSort={handleSort} />
                  <SortTh label="Division" sortKey="division" sort={sort} onSort={handleSort} className="hidden md:table-cell" />
                  <SortTh label="Drive" sortKey="drivetrain" sort={sort} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortTh label="Country" sortKey="country" sort={sort} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortTh label="Source" sortKey="source" sort={sort} onSort={handleSort} className="hidden xl:table-cell" />
                  <SortTh label="Value" sortKey="value" sort={sort} onSort={handleSort} className="hidden xl:table-cell" />
                  <th className="text-left py-2.5 px-3 text-fh-muted">Garage</th>
                </tr>
              </thead>
              <tbody>
                {pagedCars.map((car) => (
                  <CarRow
                    key={car.id}
                    car={car}
                    onToggleOwned={toggleOwned}
                    isPending={pendingIds.has(car.id)}
                    onCardClick={setDrawerCar}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={sortedCars.length} onPage={setPage} />
        </>
      )}
    </div>

    <GarageDrawer
      car={drawerCar}
      onClose={() => setDrawerCar(null)}
      onStatsChange={handleStatsChange}
      onToggleOwned={toggleOwned}
    />
    <BackToTop />
    </>
  )
}

function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)
  return (
    <div className="flex items-center justify-between pt-2 select-none">
      <span className="text-xs text-fh-muted tabular-nums">
        {start}–{end} of {total} cars
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { onPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-fh-border text-fh-muted hover:text-fh-dark hover:border-fh-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <span className="text-xs text-fh-muted tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => { onPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-fh-border text-fh-muted hover:text-fh-dark hover:border-fh-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function ViewToggle({ view, setView }: { view: string; setView: (v: "grid" | "table") => void }) {
  return (
    <div className="flex bg-fh-panel border border-fh-border rounded-lg overflow-hidden shrink-0">
      <button
        onClick={() => setView("grid")}
        title="Grid view"
        className={`px-3 py-2 transition-colors ${view === "grid" ? "bg-fh-red-pale text-fh-red" : "text-fh-muted hover:text-fh-dark-2"}`}
      >
        <GridIcon />
      </button>
      <button
        onClick={() => setView("table")}
        title="Table view"
        className={`px-3 py-2 transition-colors ${view === "table" ? "bg-fh-red-pale text-fh-red" : "text-fh-muted hover:text-fh-dark-2"}`}
      >
        <TableIcon />
      </button>
    </div>
  )
}
