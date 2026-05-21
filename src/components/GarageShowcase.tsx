'use client'

import { useState, useMemo, useCallback } from 'react'
import { Car, PI_CLASS_ORDER, PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import Link from 'next/link'

interface Props {
  initialCars: Car[]
}

export default function GarageShowcase({ initialCars }: Props) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [search, setSearch] = useState('')
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  const filtered = useMemo(() => {
    if (!search.trim()) return cars
    const q = search.toLowerCase()
    return cars.filter(
      (c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.division.toLowerCase().includes(q)
    )
  }, [cars, search])

  const groups = useMemo(() => {
    return [...PI_CLASS_ORDER].reverse().flatMap((cls) => {
      const group = filtered.filter((c) => c.piClass === cls)
      return group.length > 0 ? [{ cls, cars: group }] : []
    })
  }, [filtered])

  const classCounts = useMemo(() => {
    return Object.fromEntries(
      PI_CLASS_ORDER.map((cls) => [cls, cars.filter((c) => c.piClass === cls).length])
    )
  }, [cars])

  const removeFromGarage = useCallback(async (id: number) => {
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
          href="/"
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
        >
          Browse Car Database
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Class stat chips */}
      <div className="flex flex-wrap gap-2">
        {PI_CLASS_ORDER.filter((cls) => classCounts[cls] > 0)
          .reverse()
          .map((cls) => (
            <div
              key={cls}
              className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2"
            >
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${PI_CLASS_COLORS[cls]}`}>
                {cls}
              </span>
              <span className="text-sm font-semibold">{classCounts[cls]}</span>
              <span className="text-xs text-gray-500">{classCounts[cls] === 1 ? 'car' : 'cars'}</span>
            </div>
          ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search your garage..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-gray-600"
      />

      {groups.length === 0 ? (
        <p className="text-gray-500 text-sm">No cars match your search.</p>
      ) : (
        groups.map(({ cls, cars: groupCars }) => (
          <section key={cls}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-sm font-bold px-2.5 py-1 rounded ${PI_CLASS_COLORS[cls]}`}>
                {cls}
              </span>
              <span className="text-gray-400 text-sm">
                {groupCars.length} {groupCars.length === 1 ? 'car' : 'cars'}
              </span>
              <div className="flex-1 h-px bg-[#21262d]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupCars
                .sort((a, b) => b.piRating - a.piRating)
                .map((car) => (
                  <GarageCard
                    key={car.id}
                    car={car}
                    isPending={pendingIds.has(car.id)}
                    onRemove={removeFromGarage}
                  />
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

function GarageCard({
  car,
  isPending,
  onRemove,
}: {
  car: Car
  isPending: boolean
  onRemove: (id: number) => void
}) {
  const sourceColor = getSourceColor(car.source)

  return (
    <div
      className={`
        bg-[#161b22] border border-cyan-500/30 rounded-xl overflow-hidden
        transition-all duration-200 hover:border-cyan-500/60
        ${isPending ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className={`h-1 w-full ${stripeColor(car.piClass)}`} />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">{car.year} · {car.make}</div>
            <div className="text-sm font-semibold leading-snug truncate">{car.model}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${PI_CLASS_COLORS[car.piClass]}`}>
              {car.piClass}
            </span>
            <span className="text-xs text-gray-500 tabular-nums">{car.piRating}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
          <Spec label="Division" value={car.division} />
          <Spec label="Country" value={car.country} />
          {car.drivetrain && <Spec label="Drivetrain" value={car.drivetrain} />}
          {car.engineType && <Spec label="Engine" value={car.engineType} />}
        </div>

        <div className={`text-xs font-medium ${sourceColor}`}>
          {car.source}
          {car.sourceInfo && <span className="text-gray-600 font-normal"> · {car.sourceInfo}</span>}
        </div>

        <button
          onClick={() => onRemove(car.id)}
          className="w-full py-1.5 rounded-lg text-xs font-semibold border border-[#30363d] text-gray-500 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Remove from garage
        </button>
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-gray-600 text-[10px] uppercase tracking-wide">{label}</div>
      <div className="truncate">{value}</div>
    </div>
  )
}

function stripeColor(piClass: string) {
  const map: Record<string, string> = {
    D: 'bg-gray-500', C: 'bg-green-600', B: 'bg-blue-600',
    A: 'bg-purple-600', S1: 'bg-orange-500', S2: 'bg-red-600', R: 'bg-yellow-400',
  }
  return map[piClass] ?? 'bg-gray-700'
}
