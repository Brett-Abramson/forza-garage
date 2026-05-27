'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Car, FilterState, SOURCE_CHIPS } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import CarCard from './CarCard'
import CarRow from './CarRow'
import FilterBar from './FilterBar'
import DivisionGroupFilter from './DivisionGroupFilter'
import GarageDrawer from './GarageDrawer'
import { SortTh, GridIcon, TableIcon } from './table-ui'
import { getDivisionsForGroup } from '@/lib/divisionGroups'

type ViewMode = 'grid' | 'table'

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
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [drawerCar, setDrawerCar] = useState<Car | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set((searchParams.get('tags')?.split(',') ?? []).filter((t) => ALL_TAGS.has(t)))
  )

  const options = useMemo(() => buildOptions(cars), [cars])

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
    if (view !== 'grid') params.set('view', view)
    const qs = params.toString()
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, 300)
    return () => clearTimeout(timer)
  }, [
    filters.search, filters.piClass, filters.division, filters.make,
    filters.drivetrain, filters.country, filters.source, filters.owned,
    selectedGroupId, selectedTags, view,
  ])

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
      // Group + division filter
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
      if (filters.owned === 'owned' && !car.owned) return false
      if (filters.owned === 'not-owned' && car.owned) return false
      // Tag filter — AND logic; non-owned cars have no tags so they won't match
      if (selectedTags.size > 0) {
        const carTags = car.tags ?? []
        if (![...selectedTags].every((t) => carTags.includes(t))) return false
      }
      return true
    })
  }, [cars, filters, selectedGroupId, selectedTags])

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

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSelectedGroupId(null)
    setSelectedTags(new Set())
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

      {/* Search + active filter badge + view toggle */}
      <div className="flex gap-3 items-center">
        <input
          ref={searchRef}
          type="text"
          placeholder="Search make, model, division... (press / to focus)"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="flex-1 bg-fh-panel border border-fh-border rounded-lg px-3 py-2 text-sm text-fh-dark focus:outline-none focus:border-fh-red placeholder:text-fh-muted-2"
        />
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-fh-red-pale text-fh-red border border-fh-red hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {activeFilterCount} active · clear
          </button>
        )}
        <div className="flex bg-fh-panel border border-fh-border rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView('grid')}
            title="Grid view"
            className={`px-3 py-2 transition-colors ${view === 'grid' ? 'bg-fh-red-pale text-fh-red' : 'text-fh-muted hover:text-fh-dark'}`}
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setView('table')}
            title="Table view"
            className={`px-3 py-2 transition-colors ${view === 'table' ? 'bg-fh-red-pale text-fh-red' : 'text-fh-muted hover:text-fh-dark'}`}
          >
            <TableIcon />
          </button>
        </div>
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

      {/* Tag chips — AND filter; only owned cars carry tags */}
      <div className="flex flex-wrap gap-2">
        {CAR_TAGS.map((tag) => (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sortedCars.map((car) => (
            <div key={car.id} className={pendingIds.has(car.id) ? 'opacity-60 pointer-events-none' : ''}>
              <CarCard car={car} onToggleOwned={toggleOwned} onCardClick={setDrawerCar} />
            </div>
          ))}
        </div>
      ) : (
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
                <th className="text-left py-2.5 px-3 text-fh-muted">Garage</th>
              </tr>
            </thead>
            <tbody>
              {sortedCars.map((car) => (
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
      )}
    </div>

    <GarageDrawer
      car={drawerCar}
      onClose={() => setDrawerCar(null)}
      onStatsChange={handleStatsChange}
      onToggleOwned={toggleOwned}
    />
    </>
  )
}
