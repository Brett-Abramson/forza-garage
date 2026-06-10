'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useNavControls } from '@/context/NavControls'
import { useSearchParams } from 'next/navigation'
import { Car, FilterState } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import { RACE_TYPES } from '@/lib/races'
import CarCard from './CarCard'
import CarRow from './CarRow'
import GarageDrawer from './GarageDrawer'
import { SortTh, GridIcon, TableIcon } from './table-ui'
import { filterCars, DEFAULT_FILTERS } from '@/lib/filterCars'
import BackToTop from './BackToTop'
import FilterSidebar from './FilterSidebar'

type ViewMode = 'grid' | 'table'

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
  const [selectedRace, setSelectedRace]     = useState<string | null>(
    searchParams.get('race') ?? null
  )
  const [columnCount, setColumnCount]       = useState(calcColumns)
  const [sidebarOpen, setSidebarOpen]       = useState(true)

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

  // ── Close sidebar on mobile by default ──────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setSidebarOpen(false)
    }
  }, [])

  // ── Derived counts (needed by both Nav registration and render) ─────────────
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

  // ── Register search + view + sidebar controls with the navbar ───────────────
  const { register, unregister } = useNavControls()
  useLayoutEffect(() => {
    register({
      search:           filters.search,
      setSearch:        (v) => setFilters((f) => ({ ...f, search: v })),
      view,
      setView,
      sidebarOpen,
      setSidebarOpen,
      activeFilterCount,
    })
    return () => unregister()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, view, sidebarOpen, activeFilterCount, register, unregister])

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
    if (selectedRace)            params.set('race',  selectedRace)
    if (view !== 'grid')         params.set('view',  view)
    const qs    = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source, filters.owned,
    selectedGroupId, selectedTags, selectedRace, view,
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
  }, [])

  const toggleRace = useCallback((id: string) => {
    setSelectedRace((prev) => (prev === id ? null : id))
  }, [])

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
    <div className="flex items-start min-h-screen">

      {/* ── Filter sidebar ────────────────────────────────────────────────── */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isGarage={false}
        filters={filters}
        setFilters={setFilters}
        options={options}
        selectedGroupId={selectedGroupId}
        selectedTags={selectedTags}
        selectedRace={selectedRace}
        activeFilterCount={activeFilterCount}
        activeRace={activeRace}
        clearAllFilters={clearAllFilters}
        handleGroupChange={handleGroupChange}
        handleDivisionChange={handleDivisionChange}
        toggleTag={toggleTag}
        toggleRace={toggleRace}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 px-6 pt-6 pb-20">

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

      {/* ── end sticky filter bank — replaced by sidebar ───────────────────── */}

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
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <thead className="sticky top-12 z-10">
                <tr className="bg-fh-panel-2 border-b border-fh-border text-xs uppercase tracking-wide select-none">
                  <SortTh label="Class"    sortKey="piClass"    sort={sort} onSort={handleSort} width="5%" />
                  <SortTh label="PI"       sortKey="piRating"   sort={sort} onSort={handleSort} width="4%" />
                  <SortTh label="Year"     sortKey="year"       sort={sort} onSort={handleSort} width="5%" />
                  <SortTh label="Make"     sortKey="make"       sort={sort} onSort={handleSort} width="10%" />
                  <SortTh label="Model"    sortKey="model"      sort={sort} onSort={handleSort} width="14%" />
                  <SortTh label="Division" sortKey="division"   sort={sort} onSort={handleSort} className="hidden md:table-cell" width="17%" />
                  <SortTh label="Drive"    sortKey="drivetrain" sort={sort} onSort={handleSort} className="hidden lg:table-cell" width="5%" />
                  <SortTh label="Country"  sortKey="country"    sort={sort} onSort={handleSort} className="hidden lg:table-cell" width="8%" />
                  <SortTh label="Source"   sortKey="source"     sort={sort} onSort={handleSort} className="hidden xl:table-cell" width="12%" />
                  <SortTh label="Value"    sortKey="value"      sort={sort} onSort={handleSort} className="hidden xl:table-cell" width="10%" />
                  <th className="text-left py-2.5 px-3 text-fh-muted" style={{ width: '10%' }}>Garage</th>
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
      </div>{/* end main content column */}
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
