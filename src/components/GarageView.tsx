'use client'

import { useState, useMemo, useCallback } from 'react'
import { Car, FilterState } from '@/types/car'
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

const DEFAULT_FILTERS: FilterState = {
  search: '',
  piClass: '',
  division: '',
  make: '',
  drivetrain: '',
  country: '',
  owned: 'all',
}

export default function GarageView({ initialCars }: Props) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'desc' })
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [drawerCar, setDrawerCar] = useState<Car | null>(null)

  const options = useMemo(() => buildOptions(cars), [cars])

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
      // Group + division filter — group is OR across its divisions; selecting a
      // sub-chip narrows to that specific division within the group
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
      if (filters.owned === 'owned' && !car.owned) return false
      if (filters.owned === 'not-owned' && car.owned) return false
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

  const handleGroupChange = useCallback((groupId: string | null) => {
    setSelectedGroupId(groupId)
    setFilters((f) => ({ ...f, division: '' }))
  }, [])

  const handleDivisionChange = useCallback((division: string) => {
    setFilters((f) => ({ ...f, division }))
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

  const ownedCount = cars.filter((c) => c.owned).length

  return (
    <>
    <div className="flex flex-col gap-6">
      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-2xl font-bold text-cyan-400">{ownedCount}</span>
          <span className="text-gray-500 ml-1.5">/ {cars.length} owned</span>
        </div>
        <div className="h-1.5 flex-1 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${cars.length > 0 ? (ownedCount / cars.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Search + view toggle row */}
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

      {/* Results */}
      {sortedCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <div className="text-4xl mb-3">🚗</div>
          <div className="text-lg font-medium">No cars found</div>
          <div className="text-sm">Try adjusting your filters</div>
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
    />
    </>
  )
}
