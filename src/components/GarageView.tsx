'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { RaceIcon } from '@/components/RaceIcons'
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

// Matches the responsive CSS grid: 2 / sm:3 / lg:4 / xl:5
function calcColumns(): number {
  if (typeof window === 'undefined') return 2
  const w = window.innerWidth
  if (w >= 1280) return 5
  if (w >= 1024) return 4
  if (w >= 640)  return 3
  return 2
}

// Estimated item heights (px) — measureElement refines these live
const GRID_ESTIMATED_HEIGHT = 220
const TABLE_ROW_HEIGHT      = 56

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
    makes:     [...new Set(cars.map((c) => c.make))].sort(),
    countries: [...new Set(cars.map((c) => c.country))].sort(),
  }
}

const ALL_TAGS = new Set<string>(CAR_TAGS)

export default function GarageView({ initialCars }: Props) {
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  const [cars, setCars]       = useState<Car[]>(initialCars)
  const [filters, setFilters] = useState<FilterState>({
    search:    searchParams.get('q')      ?? '',
    piClass:   searchParams.get('class')  ?? '',
    division:  searchParams.get('div')    ?? '',
    make:      searchParams.get('make')   ?? '',
    drivetrain:searchParams.get('drive')  ?? '',
    country:   searchParams.get('country')?? '',
    source:    searchParams.get('src')    ?? '',
    owned:     (searchParams.get('owned') as FilterState['owned']) ?? 'all',
    pinned:    false,  // pin/star is garage-only; always false on the Car Database
  })
  const [view, setView]                     = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) ?? 'grid'
  )
  const [sort, setSort]                     = useState<SortState>({ key: null, dir: 'desc' })
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    searchParams.get('group') ?? null
  )
  const [pendingIds, setPendingIds]         = useState<Set<number>>(new Set())
  const [drawerCar, setDrawerCar]           = useState<Car | null>(() => {
    const openId = searchParams.get('open')
    if (!openId) return null
    return initialCars.find((c) => c.id === Number(openId)) ?? null
  })
  const [selectedTags, setSelectedTags]     = useState<Set<string>>(
    () => new Set((searchParams.get('tags')?.split(',') ?? []).filter((t) => ALL_TAGS.has(t)))
  )
  const [filterMode, setFilterMode]         = useState<FilterMode>(
    (searchParams.get('mode') as FilterMode) ?? 'race'
  )
  const [selectedRace, setSelectedRace]     = useState<string | null>(
    searchParams.get('race') ?? null
  )
  const [columnCount, setColumnCount]       = useState(calcColumns)

  const activeRace = useMemo(
    () => RACE_TYPES.find((r) => r.id === selectedRace) ?? null,
    [selectedRace]
  )
  const options = useMemo(() => buildOptions(cars), [cars])

  // ── Recalculate column count on resize ─────────────────────────────────────
  useEffect(() => {
    const onResize = () => setColumnCount(calcColumns())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ── Register search + view controls with the navbar ─────────────────────────
  const { register, unregister } = useNavControls()
  useLayoutEffect(() => {
    register({
      search:    filters.search,
      setSearch: (v) => setFilters((f) => ({ ...f, search: v })),
      view,
      setView,
    })
    return () => unregister()
  }, [filters.search, view, register, unregister])

  // ── Press / to focus search ─────────────────────────────────────────────────
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

  // ── Sync filter/view state to URL ────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search)       params.set('q',       filters.search)
    if (filters.piClass)      params.set('class',   filters.piClass)
    if (selectedGroupId)      params.set('group',   selectedGroupId)
    if (filters.division)     params.set('div',     filters.division)
    if (filters.make)         params.set('make',    filters.make)
    if (filters.drivetrain)   params.set('drive',   filters.drivetrain)
    if (filters.country)      params.set('country', filters.country)
    if (filters.source)       params.set('src',     filters.source)
    if (filters.owned !== 'all') params.set('owned', filters.owned)
    if (selectedTags.size > 0)   params.set('tags',  [...selectedTags].sort().join(','))
    if (selectedRace)         params.set('race',    selectedRace)
    if (filterMode !== 'race')   params.set('mode',  filterMode)
    if (view !== 'grid')         params.set('view',  view)
    const qs    = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source, filters.owned,
    selectedGroupId, selectedTags, selectedRace, filterMode, view,
  ])

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filteredCars = useMemo(
    () => filterCars(cars, { filters, selectedGroupId, selectedTags, activeRace }),
    [cars, filters, selectedGroupId, selectedTags, activeRace]
  )

  const sortedCars = useMemo(() => {
    const copy = [...filteredCars]
    copy.sort(sort.key ? (a, b) => compareRows(a, b, sort.key!, sort.dir) : defaultSort)
    return copy
  }, [filteredCars, sort])

  // ── Scroll to top when the filtered result set changes ──────────────────────
  const prevFilteredLength = useRef(sortedCars.length)
  useEffect(() => {
    if (prevFilteredLength.current !== sortedCars.length) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      prevFilteredLength.current = sortedCars.length
    }
  }, [sortedCars.length])

  // ── Virtualizer — grid (lanes) ──────────────────────────────────────────────
  const gridVirtualizer = useWindowVirtualizer({
    count:         view === 'grid' ? sortedCars.length : 0,
    estimateSize:  () => GRID_ESTIMATED_HEIGHT,
    overscan:      columnCount * 2,
    lanes:         columnCount,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  // ── Virtualizer — table (fixed rows) ───────────────────────────────────────
  const tableVirtualizer = useWindowVirtualizer({
    count:         view === 'table' ? sortedCars.length : 0,
    estimateSize:  () => TABLE_ROW_HEIGHT,
    overscan:      10,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
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
    if (mode === 'tags')  setSelectedRace(null)
    if (mode === 'race')  setSelectedTags(new Set())
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
      setDrawerCar((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
    } catch (err) {
      console.error(err)
    } finally {
      setPendingIds((s) => { const next = new Set(s); next.delete(id); return next })
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

  // ── Grid virtual items ──────────────────────────────────────────────────────
  const gridItems    = gridVirtualizer.getVirtualItems()
  const gridTotal    = gridVirtualizer.getTotalSize()

  // ── Table virtual items ─────────────────────────────────────────────────────
  const tableItems   = tableVirtualizer.getVirtualItems()
  const tableTotal   = tableVirtualizer.getTotalSize()
  const tablePadTop  = tableItems.length > 0 ? tableItems[0].start                               : 0
  const tablePadBot  = tableItems.length > 0 ? tableTotal - tableItems[tableItems.length - 1].end : 0

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

      {/* Owned progress bar */}
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

      {/* ── Sticky filter bank ─────────────────────────────────────────────── */}
      {/* top-12 = navbar height (h-12 / 48px). z-10 keeps it above card content. */}
      <div className="sticky top-12 z-10 bg-fh-bg pt-2 pb-3 -mx-4 px-4 flex flex-col gap-4 border-b border-fh-border">

        <DivisionGroupFilter
          selectedGroupId={selectedGroupId}
          selectedDivision={filters.division}
          availableDivisions={options.divisions}
          onGroupChange={handleGroupChange}
          onDivisionChange={handleDivisionChange}
        />

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

        {/* Filter mode toggle + tag / race chips */}
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
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-auto text-xs text-fh-muted hover:text-fh-dark-2 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {filterMode === 'tags' ? (
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
              <div className="relative">
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
                      <RaceIcon id={race.id} emoji={race.icon} />
                      {race.name}
                      {selectedRace === race.id && (
                        <span aria-label={`Clear ${race.name} filter`} className="ml-0.5 opacity-60 hover:opacity-100">×</span>
                      )}
                    </button>
                  ))}
                </div>

                {activeRace && (
                  <div className="hidden md:block absolute right-0 bottom-full mb-2 w-72 z-10
                                  rounded-xl border border-amber-500/30 bg-fh-panel shadow-lg">
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="text-sm font-semibold text-amber-300">
                          {activeRace.icon} {activeRace.name}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded
                                         bg-amber-100 text-amber-900
                                         dark:bg-amber-900/40 dark:text-amber-400">
                          {activeRace.surface}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {activeRace.demands.map((d) => (
                          <li key={d} className="flex items-start gap-1.5 text-xs text-fh-dark-2 leading-snug">
                            <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

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

      </div>
      {/* ── End sticky filter bank ──────────────────────────────────────────── */}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
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

        /* ── Grid view (virtual, lanes) ──────────────────────────────────── */
        <>
          <div className="text-xs text-fh-muted tabular-nums mb-1">
            Showing {sortedCars.length} of {cars.length} cars
          </div>
          {/* Total-height placeholder; items positioned absolutely inside */}
          <div style={{ height: gridTotal, position: 'relative' }}>
            {gridItems.map((vItem) => {
              const car = sortedCars[vItem.index]
              const laneWidth = 100 / columnCount
              return (
                <div
                  key={vItem.key}
                  data-index={vItem.index}
                  ref={(el) => { if (el) gridVirtualizer.measureElement(el) }}
                  style={{
                    position:  'absolute',
                    top:       0,
                    left:      `${vItem.lane * laneWidth}%`,
                    width:     `${laneWidth}%`,
                    transform: `translateY(${vItem.start}px)`,
                    padding:   '6px',
                  }}
                >
                  <div className={pendingIds.has(car.id) ? 'opacity-60 pointer-events-none' : ''}>
                    <CarCard car={car} onToggleOwned={toggleOwned} onCardClick={setDrawerCar} />
                  </div>
                </div>
              )
            })}
          </div>
        </>

      ) : (

        /* ── Table view (virtual, spacer rows) ───────────────────────────── */
        <>
          <div className="text-xs text-fh-muted tabular-nums mb-1">
            Showing {sortedCars.length} of {cars.length} cars
          </div>
          <div className="overflow-x-auto rounded-xl border border-fh-border">
            <table className="w-full text-sm">
              <thead className="sticky top-12 z-10">
                <tr className="bg-fh-panel-2 border-b border-fh-border text-xs uppercase tracking-wide select-none">
                  <SortTh label="Class"    sortKey="piClass"    sort={sort} onSort={handleSort} />
                  <SortTh label="PI"       sortKey="piRating"   sort={sort} onSort={handleSort} />
                  <SortTh label="Year"     sortKey="year"       sort={sort} onSort={handleSort} />
                  <SortTh label="Make"     sortKey="make"       sort={sort} onSort={handleSort} />
                  <SortTh label="Model"    sortKey="model"      sort={sort} onSort={handleSort} />
                  <SortTh label="Division" sortKey="division"   sort={sort} onSort={handleSort} className="hidden md:table-cell" />
                  <SortTh label="Drive"    sortKey="drivetrain" sort={sort} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortTh label="Country"  sortKey="country"    sort={sort} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortTh label="Source"   sortKey="source"     sort={sort} onSort={handleSort} className="hidden xl:table-cell" />
                  <SortTh label="Value"    sortKey="value"      sort={sort} onSort={handleSort} className="hidden xl:table-cell" />
                  <th className="text-left py-2.5 px-3 text-fh-muted">Garage</th>
                </tr>
              </thead>
              <tbody>
                {/* Top spacer */}
                {tablePadTop > 0 && (
                  <tr><td colSpan={11} style={{ height: tablePadTop, padding: 0 }} /></tr>
                )}

                {tableItems.map((vItem) => {
                  const car = sortedCars[vItem.index]
                  return (
                    <CarRow
                      key={car.id}
                      car={car}
                      onToggleOwned={toggleOwned}
                      isPending={pendingIds.has(car.id)}
                      onCardClick={setDrawerCar}
                    />
                  )
                })}

                {/* Bottom spacer */}
                {tablePadBot > 0 && (
                  <tr><td colSpan={11} style={{ height: tablePadBot, padding: 0 }} /></tr>
                )}
              </tbody>
            </table>
          </div>
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
