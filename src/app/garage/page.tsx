import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'
import GarageShowcase from '@/components/GarageShowcase'
import type { Car } from '@/types/car'

export const dynamic = 'force-dynamic'

// Cars the game gives every player at the start
const STARTER_CARS = [
  { year: 1989, make: 'Nissan',  model: "Silvia K's" },
  { year: 1994, make: 'Toyota',  model: 'Celica GT-Four ST205' },
  { year: 1970, make: 'GMC',     model: 'Jimmy' },
]

async function ensureStarterCars(userId: string) {
  const count = await prisma.userGarage.count({ where: { userId } })
  if (count > 0) return

  const cars = await prisma.car.findMany({
    where: {
      OR: STARTER_CARS.map(({ year, make, model }) => ({ year, make, model })),
    },
  })

  if (cars.length === 0) return

  for (const car of cars) {
    const entry = await prisma.userGarage.create({ data: { userId, carId: car.id } })
    const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
    if (autoTags.length > 0) {
      await prisma.carTag.createMany({
        data: autoTags.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
      })
    }
  }
}

export default async function GaragePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await ensureStarterCars(userId)

  const entries = await prisma.userGarage.findMany({
    where: { userId },
    include: { car: true, tags: true },
    orderBy: [{ car: { make: 'asc' } }, { car: { model: 'asc' } }],
  })

  const cars: Car[] = entries.map(({ car, tags, notes }) => ({
    ...car,
    owned: true,
    tags: [...new Set(tags.map((t) => t.tag))],
    tagDetails: tags.map((t) => ({ tag: t.tag, source: t.source })),
    notes,
  }))

  const carsWithValue = cars.filter((c) => c.value != null)
  const totalValue = carsWithValue.reduce((sum, c) => sum + c.value!, 0)
  const unknownCount = cars.length - carsWithValue.length

  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">My Garage</h1>
          <span className="text-sm text-fh-muted">
            {cars.length} {cars.length === 1 ? 'car' : 'cars'}
          </span>
          {carsWithValue.length > 0 && (
            <span className="text-sm text-fh-muted tabular-nums">
              {totalValue.toLocaleString()} Cr
              {unknownCount > 0 && (
                <span className="text-xs text-fh-muted ml-1" title={`${unknownCount} car${unknownCount === 1 ? '' : 's'} with unknown value excluded`}>
                  †
                </span>
              )}
            </span>
          )}
        </div>
        <p className="text-sm mt-1 text-fh-muted">
          Your personal collection.
          {unknownCount > 0 && (
            <span className="ml-1">† excludes {unknownCount} {unknownCount === 1 ? 'car' : 'cars'} with unknown value.</span>
          )}
        </p>
      </header>

      <Suspense fallback={null}>
        <GarageShowcase initialCars={cars} />
      </Suspense>
    </main>
  )
}
