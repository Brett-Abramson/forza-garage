'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
import { useWindowVirtualizer, useVirtualizer } from '@tanstack/react-virtual'
import { useNavControls } from '@/context/NavControls'
import { useSearchParams } from 'next/navigation'
import { Car, FilterState } from '@/types/car'
import { setOwned } from '@/server/actions/garage'
import { CAR_TAGS } from '@/lib/tags'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import { SIM_COLUMN_METRICS } from '@/lib/metrics'
import { RACE_TYPES } from '@/lib/races'
import CarCard from '@/components/car/CarCard'
import CarRow from '@/components/car/CarRow'
import GarageDrawer from '@/components/car/GarageDrawer'
import { SortTh, GridIcon, TableIcon, TableModeToggle, SortSelect, STANDARD_SORT_COLUMNS, STICKY_COL, STICKY_COL_STATS, type TableMode } from '@/components/ui/table-ui'
import { useUnitPreferences } from '@/context/UnitPreferences'
import { getUnitLabels } from '@/lib/unitConversions'

// Cumulative left offsets for stats-mode sticky header cells (View has no star col)
const SC = STICKY_COL
const VHL = {
  class: 0,
  pi:    SC.class,
  year:  SC.class + SC.pi,
  make:  SC.class + SC.pi + SC.year,
  model: SC.class + SC.pi + SC.year + SC.make,
}
const SS = STICKY_COL_STATS
const VHL_S = {
  class: 0,
  pi:    SS.class,
  year:  SS.class + SS.pi,
  make:  SS.class + SS.pi + SS.year,
  model: SS.class + SS.pi + SS.year + SS.make,
}
import { filterCars, DEFAULT_FILTERS } from '@/lib/filterCars'
import { getDivisionsForGroup } from '@/lib/divisionGroups'
import BackToTop from '@/components/ui/BackToTop'
import FilterSidebar from '@/components/car/FilterSidebar'

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
// 273px fixed card height + 12px wrapper padding (padding: 6px on all sides)
const GRID_ESTIMATED_HEIGHT = 285
const TABLE_ROW_HEIGHT      = 56

interface SortState {
  key: SortKey | null
  dir: SortDir
}

interface Props {
  initialCars: Car[]
  /** Whether a user is signed in — gates the Garage (own/add) column. */
  isSignedIn?: boolean
}

function buildOptions(cars: Car[]) {
  const years = cars.map((c) => c.year)
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))].sort((a, b) => a - b)
  return {
    divisions: [...new Set(cars.map((c) => c.division))].sort(),
    makes:     [...new Set(cars.map((c) => c.make))].sort(),
    countries: [...new Set(cars.map((c) => c.country))].sort(),
    years:     years.length ? { min: Math.min(...years), max: Math.max(...years), decades } : { min: 0, max: 0, decades: [] },
  }
}

const ALL_TAGS = new Set<string>(CAR_TAGS)

export default function GarageView({ initialCars, isSignedIn = false }: Props) {
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const { prefs } = useUnitPreferences()
  const labels = getUnitLabels(prefs)

  const [cars, setCars]       = useState<Car[]>(initialCars)
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    search:    searchParams.get('q')      ?? '',
    piClass:   (searchParams.get('class') ?? '').split(',').filter(Boolean),
    division:  (searchParams.get('div') ?? '').split(',').filter(Boolean),
    make:      (searchParams.get('make') ?? '').split(',').filter(Boolean),
    drivetrain:searchParams.get('drive')  ?? '',
    country:   searchParams.get('country')?? '',
    source:    searchParams.get('src')    ?? '',
    owned:     (searchParams.get('owned') as FilterState['owned']) ?? 'all',
    yearMin:   Number(searchParams.get('ymin')) || null,
    yearMax:   Number(searchParams.get('ymax')) || null,
    pinned:    false,  // pin/star is garage-only; always false on the Car Database
  })
  const [view, setView]                     = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) ?? 'grid'
  )
  const [tableMode, setTableMode]           = useState<TableMode>(
    () => (localStorage.getItem('fh-tableMode') as TableMode) ?? 'standard'
  )
  const [sort, setSort]                     = useState<SortState>({ key: null, dir: 'desc' })
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    () => (searchParams.get('group') ?? '').split(',').filter(Boolean)
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
  const [selectedRaceIds, setSelectedRaceIds] = useState<string[]>(
    () => (searchParams.get('race') ?? '').split(',').filter(Boolean)
  )
  const [columnCount, setColumnCount]       = useState(calcColumns)
  const [sidebarOpen, setSidebarOpen]       = useState(true)
  const tableContainerRef                   = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight]       = useState(600)
  const [tableContainerWidth, setTableContainerWidth] = useState(1200)

  const activeRaces = useMemo(
    () => RACE_TYPES.filter((r) => selectedRaceIds.includes(r.id)),
    [selectedRaceIds]
  )
  const activeRace = activeRaces.length === 1 ? activeRaces[0] : null
  const options = useMemo(() => buildOptions(cars), [cars])

  // Persist table mode preference; reset to standard when switching to grid
  useEffect(() => { localStorage.setItem('fh-tableMode', tableMode) }, [tableMode])
  useEffect(() => { if (view === 'grid') setTableMode('standard') }, [view])

  // Keep the table container height filling the available viewport below it.
  useLayoutEffect(() => {
    if (view !== 'table' || !tableContainerRef.current) return
    const update = () => {
      if (!tableContainerRef.current) return
      const rect = tableContainerRef.current.getBoundingClientRect()
      setTableHeight(Math.max(200, window.innerHeight - rect.top - 24))
      // A 0-width measurement means the container isn't laid out yet (e.g. just
      // mounted, or in a non-layout test env). Ignore it and keep the last good
      // width so we never collapse every responsive column to nothing.
      if (rect.width > 0) setTableContainerWidth(rect.width)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [view, sidebarOpen])

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
    filters.piClass.length > 0,
    filters.division.length > 0 || selectedGroupIds.length > 0,
    filters.make.length > 0,
    filters.drivetrain !== '',
    filters.country !== '',
    filters.source !== '',
    filters.owned !== 'all',
    filters.yearMin !== null || filters.yearMax !== null,
    selectedTags.size > 0,
    selectedRaceIds.length > 0,
    filters.hasTopBadge,
    filters.simZeroToSixtyMin != null || filters.simZeroToSixtyMax != null ||
    filters.simZeroToHundredMin != null || filters.simZeroToHundredMax != null ||
    filters.simBraking60Min != null || filters.simBraking60Max != null ||
    filters.simLateralG60Min != null || filters.simLateralG60Max != null ||
    filters.simTopSpeedMin != null || filters.simTopSpeedMax != null,
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
    if (filters.piClass.length > 0) params.set('class', filters.piClass.join(','))
    if (selectedGroupIds.length > 0) params.set('group', selectedGroupIds.join(','))
    if (filters.division.length > 0) params.set('div', filters.division.join(','))
    if (filters.make.length > 0) params.set('make', filters.make.join(','))
    if (filters.drivetrain)   params.set('drive',   filters.drivetrain)
    if (filters.country)      params.set('country', filters.country)
    if (filters.source)       params.set('src',     filters.source)
    if (filters.owned !== 'all') params.set('owned', filters.owned)
    if (filters.yearMin != null) params.set('ymin', String(filters.yearMin))
    if (filters.yearMax != null) params.set('ymax', String(filters.yearMax))
    if (selectedTags.size > 0)   params.set('tags',  [...selectedTags].sort().join(','))
    if (selectedRaceIds.length > 0) params.set('race', selectedRaceIds.join(','))
    if (view !== 'grid')         params.set('view',  view)
    const qs    = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source, filters.owned,
    filters.yearMin, filters.yearMax,
    selectedGroupIds, selectedTags, selectedRaceIds, view,
  ])

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filteredCars = useMemo(
    () => filterCars(cars, { filters, selectedGroupIds, selectedTags, activeRaces }),
    [cars, filters, selectedGroupIds, selectedTags, activeRaces]
  )

  const hasSimData = useMemo(
    () => filteredCars.some((c) =>
      c.simZeroToSixty != null || c.simZeroToHundred != null || c.simBraking60 != null ||
      c.simLateralG60 != null || c.simTopSpeed != null
    ),
    [filteredCars]
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
      if (view === 'table') {
        tableContainerRef.current?.scrollTo({ top: 0 })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
      prevFilteredLength.current = sortedCars.length
    }
  }, [sortedCars.length, view])

  // ── Virtualizer — grid (lanes) ──────────────────────────────────────────────
  const gridVirtualizer = useWindowVirtualizer({
    count:         view === 'grid' ? sortedCars.length : 0,
    estimateSize:  () => GRID_ESTIMATED_HEIGHT,
    overscan:      columnCount * 2,
    lanes:         columnCount,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  // ── Virtualizer — table (fixed rows) ───────────────────────────────────────
  const tableVirtualizer = useVirtualizer({
    count:          view === 'table' ? sortedCars.length : 0,
    estimateSize:   () => TABLE_ROW_HEIGHT,
    overscan:       10,
    measureElement: (el) => el.getBoundingClientRect().height,
    getScrollElement: () => tableContainerRef.current,
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  // Mobile SortSelect: picking a column sets it (asc by default); empty restores
  // the default sort. The direction toggle flips asc/desc for the active column.
  const handleSortSelect = useCallback((key: SortKey | '') => {
    setSort(key === '' ? { key: null, dir: 'desc' } : { key, dir: 'asc' })
  }, [])
  const toggleSortDir = useCallback(() => {
    setSort((prev) => ({ ...prev, dir: prev.dir === 'asc' ? 'desc' : 'asc' }))
  }, [])

  const handleGroupChange = useCallback((groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
      if (!next.includes(groupId)) {
        // Group deselected — clear any sub-divisions belonging to it
        const removed = getDivisionsForGroup(groupId)
        setFilters((f) => ({ ...f, division: f.division.filter((d) => !removed.includes(d)) }))
      }
      return next
    })
  }, [])

  const handleDivisionChange = useCallback((division: string) => {
    setFilters((f) => ({
      ...f,
      division: f.division.includes(division)
        ? f.division.filter((d) => d !== division)
        : [...f.division, division],
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedGroupIds([])
    setSelectedTags(new Set())
    setSelectedRaceIds([])
  }, [])

  const toggleRace = useCallback((id: string) => {
    setSelectedRaceIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }, [])

  const toggleOwned = useCallback(async (id: number, owned: boolean) => {
    setPendingIds((s) => new Set(s).add(id))
    try {
      const res = await setOwned(id, owned)
      if (!res.ok) throw new Error(res.error)
      const updated = res.car
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

  // ── JS-driven column visibility for standard table mode ─────────────────────
  // The active sort column is force-shown so the user can see the values they're
  // sorting by, even when that column would otherwise be dropped at this width.
  const sk = sort.key
  const colPiYear       = tableContainerWidth >= 500  || sk === 'piRating' || sk === 'year'
  const colDivision     = tableContainerWidth >= 700  || sk === 'division'
  const colDriveCountry = tableContainerWidth >= 900  || sk === 'drivetrain' || sk === 'country'
  const colSourceValue  = tableContainerWidth >= 1100 || sk === 'source' || sk === 'value'
  // Garage (own/add) column is only meaningful when signed in.
  const standardColCount = 3
    + (isSignedIn ? 1 : 0)
    + (colPiYear ? 2 : 0)
    + (colDivision ? 1 : 0)
    + (colDriveCountry ? 2 : 0)
    + (colSourceValue ? 2 : 0)
  // Columns get dropped to fit below 1100px — surface the SortSelect (and rotate
  // hint) so the hidden columns stay reachable.
  const hasHiddenStandardCols = tableContainerWidth < 1100
  // Virtual spacer-row colSpan must match the rendered column count per mode:
  // Stats = 5 identity + 11 stat/spec; Sim = 5 identity + the registry columns.
  const tableColSpan =
    tableMode === 'stats' ? 16
    : tableMode === 'sim' ? 5 + SIM_COLUMN_METRICS.length
    : standardColCount

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
        isSignedIn={isSignedIn}
        filters={filters}
        setFilters={setFilters}
        options={options}
        selectedGroupIds={selectedGroupIds}
        selectedTags={selectedTags}
        selectedRaceIds={selectedRaceIds}
        activeFilterCount={activeFilterCount}
        activeRace={activeRace}
        clearAllFilters={clearAllFilters}
        handleGroupChange={handleGroupChange}
        handleDivisionChange={handleDivisionChange}
        toggleTag={toggleTag}
        toggleRace={toggleRace}
        hasSimData={hasSimData}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 px-6 pt-6 pb-20">

      {/* Page header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Car Database</h1>
        <p className="text-fh-muted text-sm mt-1">
          {isSignedIn
            ? `Browse all ${initialCars.length} cars — mark the ones you own to add them to your garage.`
            : `Browse all ${initialCars.length} cars — sign in to track the ones you own.`}
        </p>
      </header>

      {/* Owned progress bar — softened (muted, not red) for signed-out visitors */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className={`text-2xl font-bold ${isSignedIn ? 'text-fh-red' : 'text-fh-muted-2'}`}>{ownedCount}</span>
          <span className="text-fh-muted ml-1.5">/ {cars.length} owned</span>
        </div>
        <div className="h-1.5 flex-1 bg-fh-panel-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isSignedIn ? 'bg-fh-red' : 'bg-fh-muted-2'}`}
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
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="text-xs text-fh-muted tabular-nums">
              Showing {sortedCars.length} of {cars.length} cars
            </div>
            <SortSelect
              columns={STANDARD_SORT_COLUMNS}
              sort={sort}
              onSelect={handleSortSelect}
              onToggleDir={toggleSortDir}
            />
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
                    <CarCard car={car} onToggleOwned={toggleOwned} onCardClick={setDrawerCar} isSignedIn={isSignedIn} />
                  </div>
                </div>
              )
            })}
          </div>
        </>

      ) : (

        /* ── Table view (virtual, spacer rows) ───────────────────────────── */
        <>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="text-xs text-fh-muted tabular-nums">
              Showing {sortedCars.length} of {cars.length} cars
            </div>
            <div className="flex items-center gap-2">
              {tableMode === 'standard' && hasHiddenStandardCols && (
                <SortSelect
                  columns={STANDARD_SORT_COLUMNS}
                  sort={sort}
                  onSelect={handleSortSelect}
                  onToggleDir={toggleSortDir}
                />
              )}
              <TableModeToggle mode={tableMode} setMode={setTableMode} />
            </div>
          </div>

          {/* Mobile-portrait hint: the full table is best in landscape */}
          {tableMode === 'standard' && hasHiddenStandardCols && (
            <div className="md:hidden landscape:hidden flex items-center gap-1.5 text-[11px] text-fh-muted mb-2">
              <span aria-hidden>📱↔</span> Rotate your phone to see more columns
            </div>
          )}

          <div
            ref={tableContainerRef}
            className="overflow-auto rounded-xl border border-fh-border"
            style={{ height: tableHeight }}
          >
            <table
              className="w-full text-sm"
              style={tableMode === 'standard' ? { tableLayout: 'fixed' } : undefined}
            >
              <thead className="sticky top-0 z-10">
                <tr className="bg-fh-panel-2 border-b border-fh-border text-xs uppercase tracking-wide select-none">
                  {tableMode === 'standard' ? (
                    <>
                      <SortTh label="Class"    sortKey="piClass"    sort={sort} onSort={handleSort} style={{ width: 52 }} />
                      {colPiYear && <SortTh label="PI"       sortKey="piRating"   sort={sort} onSort={handleSort} style={{ width: 52 }} />}
                      {colPiYear && <SortTh label="Year"     sortKey="year"       sort={sort} onSort={handleSort} style={{ width: 58 }} />}
                      <SortTh label="Make"     sortKey="make"       sort={sort} onSort={handleSort} style={{ width: 100 }} />
                      <SortTh label="Model"    sortKey="model"      sort={sort} onSort={handleSort} style={{ width: 150 }} />
                      {colDivision     && <SortTh label="Division" sortKey="division"   sort={sort} onSort={handleSort} style={{ width: 110 }} />}
                      {colDriveCountry && <SortTh label="Drive"    sortKey="drivetrain" sort={sort} onSort={handleSort} style={{ width: 72 }} />}
                      {colDriveCountry && <SortTh label="Country"  sortKey="country"    sort={sort} onSort={handleSort} style={{ width: 80 }} />}
                      {colSourceValue  && <SortTh label="Source"   sortKey="source"     sort={sort} onSort={handleSort} style={{ width: 72 }} />}
                      {colSourceValue  && <SortTh label="Value"    sortKey="value"      sort={sort} onSort={handleSort} style={{ width: 90 }} />}
                      {isSignedIn && <SortTh label="Garage"   sortKey="owned"      sort={sort} onSort={handleSort} style={{ width: 90 }} />}
                    </>
                  ) : tableMode === 'stats' ? (
                    <>
                      {/* Identity — sticky, compact widths */}
                      <SortTh label="Cls"   sortKey="piClass"  sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.class, width: SS.class, minWidth: SS.class, maxWidth: SS.class, paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="PI"    sortKey="piRating" sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.pi,    width: SS.pi,    minWidth: SS.pi,    maxWidth: SS.pi,    paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="Year"  sortKey="year"     sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.year,  width: SS.year,  minWidth: SS.year,  maxWidth: SS.year,  paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="Make"  sortKey="make"     sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.make,  width: SS.make,  minWidth: SS.make,  maxWidth: SS.make,  paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="Model" sortKey="model"    sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.model, width: SS.model, minWidth: SS.model, maxWidth: SS.model, paddingLeft: 8, paddingRight: 8 }} />
                      {/* Stat columns — not sticky */}
                      <SortTh label="Speed"    sortKey="statSpeed"        sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                      <SortTh label="Handling" sortKey="statHandling"     sort={sort} onSort={handleSort} style={{ minWidth: 80 }} />
                      <SortTh label="Accel"    sortKey="statAcceleration" sort={sort} onSort={handleSort} style={{ minWidth: 68 }} />
                      <SortTh label="Launch"   sortKey="statLaunch"       sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                      <SortTh label="Braking"  sortKey="statBraking"      sort={sort} onSort={handleSort} style={{ minWidth: 76 }} />
                      <SortTh label="Offroad"  sortKey="statOffroad"      sort={sort} onSort={handleSort} style={{ minWidth: 76 }} />
                      <SortTh label="Power"  unit={labels.power}  sortKey="powerHp"       sort={sort} onSort={handleSort} style={{ minWidth: 60 }} />
                      <SortTh label="Torque" unit={labels.torque} sortKey="torqueFtLb"    sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                      <SortTh label="Weight" unit={labels.weight} sortKey="weightLb"      sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                      <SortTh label="P:W"    unit={labels.ratio}  sortKey="powerToWeight" sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                      <SortTh label="F.WT"     sortKey="frontWeight"      sort={sort} onSort={handleSort} style={{ minWidth: 64 }} />
                      <SortTh label="Disp"     sortKey="displacementL"    sort={sort} onSort={handleSort} style={{ minWidth: 64 }} />
                    </>
                  ) : (
                    <>
                      {/* Identity — sticky, compact widths (mirrors Stats mode) */}
                      <SortTh label="Cls"   sortKey="piClass"  sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.class, width: SS.class, minWidth: SS.class, maxWidth: SS.class, paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="PI"    sortKey="piRating" sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.pi,    width: SS.pi,    minWidth: SS.pi,    maxWidth: SS.pi,    paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="Year"  sortKey="year"     sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.year,  width: SS.year,  minWidth: SS.year,  maxWidth: SS.year,  paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="Make"  sortKey="make"     sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.make,  width: SS.make,  minWidth: SS.make,  maxWidth: SS.make,  paddingLeft: 8, paddingRight: 8 }} />
                      <SortTh label="Model" sortKey="model"    sort={sort} onSort={handleSort} className="sticky bg-fh-panel-2 z-[2]" style={{ left: VHL_S.model, width: SS.model, minWidth: SS.model, maxWidth: SS.model, paddingLeft: 8, paddingRight: 8 }} />
                      {/* Sim metric columns — registry-driven (7 rankable sim fields + P:W), not sticky */}
                      {SIM_COLUMN_METRICS.map((m) => {
                        let unit: string | null = m.unit
                        if (m.key === 'simBraking60' || m.key === 'simBraking100') {
                          unit = labels.braking
                        } else if (m.key === 'simTopSpeed') {
                          unit = labels.speed
                        }
                        return (
                          <SortTh key={m.key} label={m.short} unit={unit} sortKey={m.key as SortKey} sort={sort} onSort={handleSort} style={{ minWidth: 78 }} />
                        )
                      })}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Top spacer */}
                {tablePadTop > 0 && (
                  <tr><td colSpan={tableColSpan} style={{ height: tablePadTop, padding: 0 }} /></tr>
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
                      statsMode={tableMode === 'stats'}
                      simMode={tableMode === 'sim'}
                      showStatHighlights={filters.showStatHighlights}
                      hideGarage={!isSignedIn}
                      colVis={{ piYear: colPiYear, division: colDivision, driveCountry: colDriveCountry, sourceValue: colSourceValue }}
                    />
                  )
                })}

                {/* Bottom spacer */}
                {tablePadBot > 0 && (
                  <tr><td colSpan={tableColSpan} style={{ height: tablePadBot, padding: 0 }} /></tr>
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
      isSignedIn={isSignedIn}
    />
    <BackToTop />
    </>
  )
}
