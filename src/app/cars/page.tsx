import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'
import GarageView from '@/components/GarageView'
import type { Car } from '@/types/car'

export const dynamic = 'force-dynamic'

export default async function CarsPage() {
  const { userId } = await auth()

  const rawCars = await prisma.car.findMany({
    include: {
      garage: userId
        ? { where: { userId }, select: { id: true, tags: true } }
        : { select: { id: true, tags: true }, take: 0 },
    },
    orderBy: [{ make: 'asc' }, { model: 'asc' }],
  })

  const cars: Car[] = rawCars.map(({ garage, ...car }) => {
    const entry = garage[0] ?? null
    const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
    if (entry) {
      // Owned: use the user's stored tag state (may differ from defaults)
      const storedTags = entry.tags.map((t: { tag: string; source: string }) => t.tag)
      const tagDetails = entry.tags.map((t: { tag: string; source: string }) => ({ tag: t.tag, source: t.source }))
      return { ...car, owned: true, tags: storedTags, tagDetails }
    }
    // Not owned: compute auto-tags from division so filtering still works
    return {
      ...car,
      owned: false,
      tags: autoTags,
      tagDetails: autoTags.map((tag) => ({ tag, source: 'auto' })),
    }
  })

  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Car Database</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse all {cars.length} cars — mark the ones you own to add them to your garage.
        </p>
      </header>

      <Suspense fallback={null}>
        <GarageView initialCars={cars} />
      </Suspense>
    </main>
  )
}
