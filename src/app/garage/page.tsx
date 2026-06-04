import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'
import GarageShowcaseClient from '@/components/GarageShowcaseClient'
import GarageSkeleton from '@/components/GarageSkeleton'
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

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function GaragePage({ searchParams }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const params = await searchParams

  await ensureStarterCars(userId)

  const entries = await prisma.userGarage.findMany({
    where: { userId },
    include: { car: true, tags: true },
    orderBy: [{ car: { make: 'asc' } }, { car: { model: 'asc' } }],
  })

  const cars: Car[] = entries.map(({ car, tags, notes, addedAt }) => ({
    ...car,
    owned: true,
    addedAt: addedAt?.toISOString() ?? null,
    tags: [...new Set(tags.map((t) => t.tag))],
    tagDetails: tags.map((t) => ({ tag: t.tag, source: t.source })),
    notes,
  }))

  // Respect the user's last-used view preference from the URL so the skeleton
  // matches what they'll see when the component hydrates.
  const viewParam = params?.view
  const view = viewParam === 'grid' ? 'grid' : 'table'

  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      {/*
        GarageShowcaseClient uses next/dynamic with ssr:false internally.
        The server sends GarageSkeleton as HTML immediately (FCP ≈ TTFB),
        then the JS chunk for GarageShowcase loads and replaces it.
      */}
      <Suspense fallback={<GarageSkeleton view={view} />}>
        <GarageShowcaseClient initialCars={cars} />
      </Suspense>
    </main>
  )
}
