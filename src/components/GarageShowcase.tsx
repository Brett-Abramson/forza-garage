'use client'

import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavControls } from '@/context/NavControls'
import { useSearchParams } from 'next/navigation'
import { Car, FilterState } from '@/types/car'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import { buildCsvString, csvFilename } from '@/lib/exportCsv'
import CarCard from './CarCard'
import CarRow from './CarRow'
import { SortTh, GridIcon, TableIcon, TableModeToggle, SortSelect, GARAGE_SORT_COLUMNS, STICKY_COL, STICKY_COL_STATS, type TableMode } from './table-ui'

// Cumulative left offsets for stats-mode sticky header cells (Showcase has a star col)
const SC = STICKY_COL
const SHL = {
  star:  0,
  class: SC.star,
  pi:    SC.star + SC.class,
  year:  SC.star + SC.class + SC.pi,
  make:  SC.star + SC.class + SC.pi + SC.year,
  model: SC.star + SC.class + SC.pi + SC.year + SC.make,
}
const SS = STICKY_COL_STATS
const SHL_S = {
  star:  0,
  class: SS.star,
  pi:    SS.star + SS.class,
  year:  SS.star + SS.class + SS.pi,
  make:  SS.star + SS.class + SS.pi + SS.year,
  model: SS.star + SS.class + SS.pi + SS.year + SS.make,
}
import { CAR_TAGS } from '@/lib/tags'
const ALL_TAGS = new Set<string>(CAR_TAGS)
import { RACE_TYPES } from '@/lib/races'
import { filterCars, DEFAULT_FILTERS } from '@/lib/filterCars'
import { getDivisionsForGroup } from '@/lib/divisionGroups'
import GarageDrawer from './GarageDrawer'
import { resolveEffectiveStats } from '@/lib/statUtils'
import { setOwned, setPinned } from '@/server/actions/garage'
import Link from 'next/link'
import BackToTop from './BackToTop'
import FilterSidebar from './FilterSidebar'

type ViewMode = 'grid' | 'table'

// ─── CSV export ───────────────────────────────────────────────────────────────
// Pure logic lives in src/lib/exportCsv.ts — only the browser trigger is here.

function triggerCsvDownload(cars: Car[]) {
  const csv = buildCsvString(cars)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = csvFilename()
  a.click()
  URL.revokeObjectURL(url)
}

interface SortState {
  key: SortKey | null
  dir: SortDir
}

interface Props {
  initialCars: Car[]
  totalCars?: number
}

function buildOptions(cars: Car[]) {
  return {
    divisions: [...new Set(cars.map((c) => c.division))].sort(),
    makes: [...new Set(cars.map((c) => c.make))].sort(),
    countries: [...new Set(cars.map((c) => c.country))].sort(),
  }
}

// DEFAULT_FILTERS is re-exported from filterCars — imported above.

type TagDetail = { tag: string; source: string }

export default function GarageShowcase({ initialCars, totalCars }: Props) {
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  const [exportPending, setExportPending] = useState(false)

  // Tags come directly from stored CarTag rows (backfilled at load time in
  // garage/page.tsx for cars added before the auto-tag fix). No client-side
  // merge — what's in the DB is what's shown.
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') ?? '',
    piClass: (searchParams.get('class') ?? '').split(',').filter(Boolean),
    division: (searchParams.get('div') ?? '').split(',').filter(Boolean),
    make: (searchParams.get('make') ?? '').split(',').filter(Boolean),
    drivetrain: searchParams.get('drive') ?? '',
    country: searchParams.get('country') ?? '',
    source: searchParams.get('src') ?? '',
    owned: 'all',
    pinned: searchParams.get('fav') === '1',
  })
  const [view, setView] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) ?? 'table'
  )
  const [tableMode, setTableMode] = useState<TableMode>(
    () => (localStorage.getItem('fh-tableMode') as TableMode) ?? 'standard'
  )
  const [sort, setSort] = useState<SortState>({ key: 'addedAt', dir: 'desc' })
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set((searchParams.get('tags')?.split(',') ?? []).filter((t) => ALL_TAGS.has(t)))
  )
  const [selectedRaceIds, setSelectedRaceIds] = useState<string[]>(
    () => (searchParams.get('race') ?? '').split(',').filter(Boolean)
  )
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    () => (searchParams.get('group') ?? '').split(',').filter(Boolean)
  )
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [drawerCar, setDrawerCar] = useState<Car | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // True when the viewport is narrow enough that standard columns are dropped
  // (Source/Value/Added hide below the xl breakpoint) — gates the SortSelect.
  const [columnsHidden, setColumnsHidden] = useState(false)

  // Close sidebar on mobile by default
  useEffect(() => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setSidebarOpen(false)
    }
  }, [])

  // Track whether standard columns are dropped so the mobile sort control can
  // appear, keeping the hidden columns sortable. xl breakpoint = 1280px.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)')
    const update = () => setColumnsHidden(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

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
    if (filters.piClass.length > 0) params.set('class', filters.piClass.join(','))
    if (selectedGroupIds.length > 0) params.set('group', selectedGroupIds.join(','))
    if (filters.division.length > 0) params.set('div', filters.division.join(','))
    if (filters.make.length > 0) params.set('make', filters.make.join(','))
    if (filters.drivetrain) params.set('drive', filters.drivetrain)
    if (filters.country) params.set('country', filters.country)
    if (filters.source) params.set('src', filters.source)
    if (filters.pinned) params.set('fav', '1')
    if (selectedTags.size > 0) params.set('tags', [...selectedTags].sort().join(','))
    if (selectedRaceIds.length > 0) params.set('race', selectedRaceIds.join(','))
    if (view !== 'table') params.set('view', view)
    const qs = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source, filters.pinned,
    selectedGroupIds, selectedTags, selectedRaceIds, view,
  ])

  // Persist table mode preference; reset to standard when switching to grid
  useEffect(() => { localStorage.setItem('fh-tableMode', tableMode) }, [tableMode])
  useEffect(() => { if (view === 'grid') setTableMode('standard') }, [view])

  const options = useMemo(() => buildOptions(cars), [cars])

  // Compute activeFilterCount early so it can be registered with Nav
  const activeFilterCount = [
    filters.piClass.length > 0,
    filters.division.length > 0 || selectedGroupIds.length > 0,
    filters.make.length > 0,
    filters.drivetrain !== '',
    filters.country !== '',
    filters.source !== '',
    filters.pinned,
    selectedTags.size > 0,
    selectedRaceIds.length > 0,
  ].filter(Boolean).length

  // Register search + view + sidebar controls with the navbar
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

  const activeRaces = useMemo(() => RACE_TYPES.filter((r) => selectedRaceIds.includes(r.id)), [selectedRaceIds])
  const activeRace = activeRaces.length === 1 ? activeRaces[0] : null

  const filteredCars = useMemo(
    () => filterCars(cars, { filters, selectedGroupIds, selectedTags, activeRaces }),
    [cars, filters, activeRaces, selectedGroupIds, selectedTags]
  )

  const sortedCars = useMemo(() => {
    const copy = [...filteredCars]
    copy.sort(sort.key ? (a, b) => compareRows(a, b, sort.key!, sort.dir) : defaultSort)
    return copy
  }, [filteredCars, sort])

  const handleExport = useCallback(() => {
    if (sortedCars.length < cars.length) {
      setExportPending(true)
    } else {
      triggerCsvDownload(sortedCars)
    }
  }, [sortedCars, cars.length])

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

  const toggleRace = useCallback((id: string) => {
    setSelectedRaceIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
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

  const handleStatsChange = useCallback((carId: number, partial: Partial<Car>) => {
    setCars((prev) => prev.map((c) => {
      if (c.id !== carId) return c
      const next: Car = { ...c, ...partial }
      // Re-resolve effective stat values whenever override fields are part of the update
      const hasOverrideKeys = Object.keys(partial).some((k) => k.endsWith('Override'))
      return hasOverrideKeys ? { ...next, ...resolveEffectiveStats(next) } : next
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedGroupIds([])
    setSelectedTags(new Set())
    setSelectedRaceIds([])
  }, [])

  const handleToggle = useCallback(async (id: number, owned: boolean) => {
    if (owned) return
    setPendingIds((s) => new Set(s).add(id))
    try {
      const res = await setOwned(id, false)
      if (!res.ok) throw new Error(res.error)
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

  // Optimistic pin toggle — update UI immediately, revert on failure
  const handleTogglePin = useCallback(async (id: number, pinned: boolean) => {
    // Optimistic update
    setCars((prev) => prev.map((c) => (c.id === id ? { ...c, pinned } : c)))
    try {
      const res = await setPinned(id, pinned)
      if (!res.ok) throw new Error(res.error)
    } catch (err) {
      // Revert on failure
      setCars((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !pinned } : c)))
      console.error(err)
    }
  }, [])

  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🏎️</div>
        <h2 className="text-xl font-semibold mb-2">Your garage is empty</h2>
        <p className="text-fh-muted text-sm mb-6">
          Head to the Car Database to find and add cars to your collection.
        </p>
        <Link
          href="/cars"
          className="px-4 py-2 bg-fh-red-pale text-fh-red border border-fh-red rounded-lg text-sm font-medium hover:bg-fh-red-pale transition-colors"
        >
          Browse Car Database
        </Link>
      </div>
    )
  }

  const carsWithValue = cars.filter((c) => c.value != null)
  const totalValue = carsWithValue.reduce((sum, c) => sum + c.value!, 0)
  const unknownCount = cars.length - carsWithValue.length
  const pinnedCount = cars.filter((c) => c.pinned).length

  return (
    <>
    <div className="flex items-start min-h-screen">

      {/* ── Filter sidebar ────────────────────────────────────────────────── */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isGarage={true}
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
        pinnedCount={pinnedCount}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 px-6 pt-6 pb-20">
      {/* Page header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold tracking-tight">My Garage</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-fh-muted uppercase tracking-wide leading-none mb-0.5">Cars</span>
              <span className="text-sm font-medium tabular-nums">{cars.length}</span>
            </div>
            {carsWithValue.length > 0 && (
              <>
                <span className="text-fh-border select-none">|</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-fh-muted uppercase tracking-wide leading-none mb-0.5">Total value</span>
                  <span className="text-sm font-medium tabular-nums">
                    {totalValue.toLocaleString()} Cr
                    {unknownCount > 0 && (
                      <span
                        className="text-[10px] text-fh-muted align-super ml-0.5 cursor-help"
                        title={`Excludes ${unknownCount} ${unknownCount === 1 ? 'car' : 'cars'} with unknown value`}
                      >†</span>
                    )}
                  </span>
                </div>
              </>
            )}
            {pinnedCount > 0 && (
              <>
                <span className="text-fh-border select-none">|</span>
                <button
                  onClick={() => setFilters((f) => ({ ...f, pinned: !f.pinned }))}
                  title={filters.pinned ? 'Clear favourites filter' : 'Show only favourites'}
                  className={`flex flex-col transition-colors ${filters.pinned ? 'text-amber-400' : 'text-fh-muted hover:text-amber-400'}`}
                >
                  <span className="text-[10px] uppercase tracking-wide leading-none mb-0.5">Favourites</span>
                  <span className="text-sm font-medium tabular-nums">★ {pinnedCount}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Export CSV */}
        {cars.length === 0 ? (
          <button
            disabled
            title="No cars to export"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-fh-border text-fh-muted opacity-40 cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" />
            </svg>
            Export CSV
          </button>
        ) : (
          <button
            onClick={handleExport}
            title={sortedCars.length < cars.length ? `${sortedCars.length} of ${cars.length} cars (filtered)` : `Export all ${cars.length} cars`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-fh-border text-fh-muted hover:text-fh-dark hover:border-fh-dark transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" />
            </svg>
            Export CSV
          </button>
        )}
      </header>

      {/* Owned progress bar */}
      {totalCars != null && (
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-2xl font-bold text-fh-red">{cars.length}</span>
            <span className="text-fh-muted ml-1.5">/ {totalCars} owned</span>
          </div>
          <div className="h-1.5 flex-1 bg-fh-panel-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-fh-red rounded-full transition-all duration-500"
              style={{ width: `${totalCars > 0 ? (cars.length / totalCars) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Export confirmation (filtered subset) */}
      {exportPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setExportPending(false)}>
          <div
            className="bg-fh-panel border border-fh-border rounded-xl shadow-xl px-6 py-5 max-w-sm w-full mx-4 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="font-semibold text-fh-dark">Export filtered results?</p>
              <p className="text-sm text-fh-muted mt-1">
                Exporting <span className="font-medium text-fh-dark">{sortedCars.length}</span> of{' '}
                <span className="font-medium text-fh-dark">{cars.length}</span> cars — active filters are applied.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setExportPending(false)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium border border-fh-border text-fh-muted hover:text-fh-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { triggerCsvDownload(sortedCars); setExportPending(false) }}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-fh-red text-white hover:opacity-90 transition-opacity"
              >
                Export {sortedCars.length} cars
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Sort pills (grid mode — table mode uses column headers) */}
      {view === 'grid' && sortedCars.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-fh-muted mr-1">Sort:</span>
          {(
            [
              { key: 'addedAt', label: 'Recently Added' },
              { key: 'piRating', label: 'PI' },
              { key: 'make', label: 'Make' },
              { key: 'value', label: 'Value' },
            ] as { key: SortKey; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                sort.key === key
                  ? 'bg-fh-red-pale text-fh-red border-fh-red'
                  : 'bg-fh-panel text-fh-muted border-fh-border hover:text-fh-dark'
              }`}
            >
              {label}
              {sort.key === key && (
                <span className="ml-1 opacity-60">{sort.dir === 'desc' ? '↓' : '↑'}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {sortedCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-fh-muted">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-medium">No cars match</div>
          <div className="text-sm mt-1">Try adjusting your filters</div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 rounded-lg text-sm border border-fh-border text-fh-muted hover:border-fh-border hover:text-fh-dark transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <>
              <div className="text-xs text-fh-muted tabular-nums mb-1">
                Showing {sortedCars.length} of {cars.length} cars
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {sortedCars.map((car) => (
                  <CarCard key={car.id} car={car} onToggleOwned={handleToggle} onCardClick={setDrawerCar} onTogglePin={handleTogglePin} isPending={pendingIds.has(car.id)} showAddedAt={sort.key === 'addedAt'} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Toolbar: mobile sort control + Standard / Stats toggle */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="text-xs text-fh-muted tabular-nums">
                  Showing {sortedCars.length} of {cars.length} cars
                </div>
                <div className="flex items-center gap-2">
                  {tableMode === 'standard' && columnsHidden && (
                    <SortSelect
                      columns={GARAGE_SORT_COLUMNS}
                      sort={sort}
                      onSelect={handleSortSelect}
                      onToggleDir={toggleSortDir}
                    />
                  )}
                  <TableModeToggle mode={tableMode} setMode={setTableMode} />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-fh-border">
                <table
                  className="w-full text-sm"
                  style={tableMode === 'standard' ? { tableLayout: 'fixed' } : undefined}
                >
                  <thead>
                    <tr className="bg-fh-panel-2 border-b border-fh-border text-xs uppercase tracking-wide select-none">
                      {tableMode === 'standard' ? (
                        <>
                          <th className="py-2.5 pl-3 pr-1" style={{ width: '3%' }} aria-label="Favourite" />
                          <SortTh label="Class"    sortKey="piClass"    sort={sort} onSort={handleSort} width="5%" />
                          <SortTh label="PI"       sortKey="piRating"   sort={sort} onSort={handleSort} width="6%" />
                          <SortTh label="Year"     sortKey="year"       sort={sort} onSort={handleSort} width="5%" />
                          <SortTh label="Make"     sortKey="make"       sort={sort} onSort={handleSort} width="10%" />
                          <SortTh label="Model"    sortKey="model"      sort={sort} onSort={handleSort} width="12%" />
                          <SortTh label="Division" sortKey="division"   sort={sort} onSort={handleSort} className="hidden md:table-cell" width="17%" />
                          <SortTh label="Drive"    sortKey="drivetrain" sort={sort} onSort={handleSort} className="hidden lg:table-cell" width="5%" />
                          <SortTh label="Country"  sortKey="country"    sort={sort} onSort={handleSort} className="hidden lg:table-cell" width="8%" />
                          <SortTh label="Source"   sortKey="source"     sort={sort} onSort={handleSort} className="hidden xl:table-cell" width="11%" />
                          <SortTh label="Value"    sortKey="value"      sort={sort} onSort={handleSort} className="hidden xl:table-cell" width="9%" />
                          <SortTh label="Added"    sortKey="addedAt"    sort={sort} onSort={handleSort} className="hidden xl:table-cell" width="9%" />
                        </>
                      ) : (
                        <>
                          {/* Star — sticky */}
                          <th className="py-2.5 pl-3 pr-1 sticky bg-fh-panel z-[2]" style={{ left: SHL_S.star, minWidth: SS.star }} aria-label="Favourite" />
                          {/* Identity — sticky, compact widths */}
                          <SortTh label="Cls"   sortKey="piClass"  sort={sort} onSort={handleSort} className="sticky bg-fh-panel z-[2]" style={{ left: SHL_S.class, minWidth: SS.class, paddingLeft: 8, paddingRight: 8 }} />
                          <SortTh label="PI"    sortKey="piRating" sort={sort} onSort={handleSort} className="sticky bg-fh-panel z-[2]" style={{ left: SHL_S.pi,    minWidth: SS.pi,    paddingLeft: 8, paddingRight: 8 }} />
                          <SortTh label="Year"  sortKey="year"     sort={sort} onSort={handleSort} className="sticky bg-fh-panel z-[2]" style={{ left: SHL_S.year,  minWidth: SS.year,  paddingLeft: 8, paddingRight: 8 }} />
                          <SortTh label="Make"  sortKey="make"     sort={sort} onSort={handleSort} className="sticky bg-fh-panel z-[2]" style={{ left: SHL_S.make,  minWidth: SS.make,  paddingLeft: 8, paddingRight: 8 }} />
                          <SortTh label="Model" sortKey="model"    sort={sort} onSort={handleSort} className="sticky bg-fh-panel z-[2]" style={{ left: SHL_S.model, minWidth: SS.model, paddingLeft: 8, paddingRight: 8 }} />
                          {/* Stat columns — not sticky */}
                          <SortTh label="Speed"    sortKey="statSpeed"        sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                          <SortTh label="Handling" sortKey="statHandling"     sort={sort} onSort={handleSort} style={{ minWidth: 80 }} />
                          <SortTh label="Accel"    sortKey="statAcceleration" sort={sort} onSort={handleSort} style={{ minWidth: 68 }} />
                          <SortTh label="Launch"   sortKey="statLaunch"       sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                          <SortTh label="Braking"  sortKey="statBraking"      sort={sort} onSort={handleSort} style={{ minWidth: 76 }} />
                          <SortTh label="Offroad"  sortKey="statOffroad"      sort={sort} onSort={handleSort} style={{ minWidth: 76 }} />
                          <SortTh label="HP"       sortKey="powerHp"          sort={sort} onSort={handleSort} style={{ minWidth: 60 }} />
                          <SortTh label="Torque"   sortKey="torqueFtLb"       sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                          <SortTh label="Weight"   sortKey="weightLb"         sort={sort} onSort={handleSort} style={{ minWidth: 72 }} />
                          <SortTh label="F.WT"     sortKey="frontWeight"      sort={sort} onSort={handleSort} style={{ minWidth: 64 }} />
                          <SortTh label="Disp"     sortKey="displacementL"    sort={sort} onSort={handleSort} style={{ minWidth: 64 }} />
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCars.map((car) => (
                      <CarRow
                        key={car.id}
                        car={car}
                        onToggleOwned={handleToggle}
                        onTogglePin={handleTogglePin}
                        isPending={pendingIds.has(car.id)}
                        isExpanded={drawerCar?.id === car.id}
                        onCardClick={setDrawerCar}
                        showAddedAt={sort.key === 'addedAt'}
                        showAddedAtColumn
                        hideGarage
                        statsMode={tableMode === 'stats'}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
      </div>{/* end main content column */}
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
    <BackToTop minItems={20} itemCount={cars.length} />
    </>
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