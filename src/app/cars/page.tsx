import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'
import GarageViewClient from '@/components/GarageViewClient'
import CarsSkeleton from '@/components/CarsSkeleton'
import type { Car } from '@/types/car'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CarsPage({ searchParams }: PageProps) {
  const { userId } = await auth()
  const params = await searchParams

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
      const storedTags = entry.tags.map((t: { tag: string; source: string }) => t.tag)
      const tagDetails = entry.tags.map((t: { tag: string; source: string }) => ({ tag: t.tag, source: t.source }))
      return { ...car, owned: true, tags: storedTags, tagDetails }
    }
    return {
      ...car,
      owned: false,
      tags: autoTags,
      tagDetails: autoTags.map((tag) => ({ tag, source: 'auto' })),
    }
  })

  // Respect the user's last-used view preference from the URL so the skeleton
  // matches what they'll see when the component hydrates.
  const viewParam = params?.view
  const view = viewParam === 'grid' ? 'grid' : 'table'

  return (
    // min-h-screen prevents layout shifts above/below the virtual list container
    // from being measured as CLS when the skeleton swaps for the real component.
    <main className="max-w-screen-2xl mx-auto px-4 py-8 min-h-screen">
      {/*
        GarageViewClient uses next/dynamic with ssr:false internally.
        The server sends CarsSkeleton as HTML immediately (FCP ≈ TTFB),
        then the JS chunk for GarageView loads and replaces it.
      */}
      <Suspense fallback={<CarsSkeleton view={view} totalCars={cars.length} />}>
        <GarageViewClient initialCars={cars} totalCars={cars.length} />
      </Suspense>
    </main>
  )
}
