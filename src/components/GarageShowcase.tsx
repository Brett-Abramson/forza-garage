'use client'

import { useState, useMemo, useCallback } from 'react'
import { Car, FilterState, PI_CLASS_ORDER, PI_CLASS_COLORS } from '@/types/car'
import { SortKey, SortDir, compareRows, defaultSort } from '@/lib/sort'
import CarCard from './CarCard'
import CarRow from './CarRow'
import FilterBar from './FilterBar'
import { SortTh, GridIcon, TableIcon } from './table-ui'
import Link from 'next/link'

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

const DEFAULT_FILTERS: FilterState = {
  search: '',
  piClass: '',
  division: '',
  make: '',
  drivetrain: '',
  country: '',
  owned: 'all',
}

export default function GarageShowcase({ initialCars }: Props) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'desc' })
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  const options = useMemo(() => buildOptions(cars), [cars])

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
      if (filters.division && car.division !== filters.division) return false
      if (filters.make && car.make !== filters.make) return false
      if (filters.drivetrain && car.drivetrain !== filters.drivetrain) return false
      if (filters.country && car.country !== filters.country) return false
      return true
    })
  }, [cars, filters])

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

  // In the garage every car is already owned; toggling off = remove from garage
  const handleToggle = useCallback(async (id: number, owned: boolean) => {
    if (owned) return // shouldn't happen — all cars here are owned
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
    <div className="flex flex-col gap-6">
      {/* Class stat chips — click to filter by that class */}
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

      {/* Search + view toggle */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search make, model, division..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-gray-600"
        />
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

      {/* Filter bar — hideOwned since every car here is already owned */}
      <FilterBar
        filters={filters}
        options={options}
        onChange={setFilters}
        totalCount={cars.length}
        filteredCount={filteredCars.length}
        hideOwned
      />

      {/* Results */}
      {sortedCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-medium">No cars match</div>
          <div className="text-sm">Try adjusting your filters</div>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sortedCars.map((car) => (
            <div key={car.id} className={pendingIds.has(car.id) ? 'opacity-60 pointer-events-none' : ''}>
              <CarCard car={car} onToggleOwned={handleToggle} />
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
                <CarRow key={car.id} car={car} onToggleOwned={handleToggle} isPending={pendingIds.has(car.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
