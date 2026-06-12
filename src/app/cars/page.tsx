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

// Only the fields needed for list/table display — spec fields load on drawer open
const LIST_SELECT = {
  id: true, make: true, model: true, year: true,
  piClass: true, piRating: true, division: true, drivetrain: true,
  country: true, source: true, sourceInfo: true, value: true, rarity: true,
  statSpeed: true, statHandling: true, statAcceleration: true,
  statLaunch: true, statBraking: true, statOffroad: true,
} as const

// Placeholder nulls for spec fields excluded from the list projection
const SPEC_DEFAULTS = {
  powerHp: null, torqueFtLb: null, weightLb: null,
  frontWeight: null, displacementL: null,
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
} as const

export default async function CarsPage({ searchParams }: PageProps) {
  // auth(), searchParams, and the car list query are all independent — run in parallel
  const [{ userId }, params, rawCars] = await Promise.all([
    auth(),
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
    prisma.car.findMany({
      select: LIST_SELECT,
      orderBy: [{ make: 'asc' }, { model: 'asc' }],
    }),
  ])

  // Garage lookup requires userId — fetch after auth resolves
  const garageEntries = userId
    ? await prisma.userGarage.findMany({
        where: { userId },
        select: { carId: true, tags: { select: { tag: true, source: true } } },
      })
    : []
  const garageMap = new Map(garageEntries.map((e) => [e.carId, e]))

  const cars: Car[] = rawCars.map((car) => {
    const entry = garageMap.get(car.id) ?? null
    const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
    if (entry) {
      const storedTags = entry.tags.map((t: { tag: string; source: string }) => t.tag)
      const tagDetails = entry.tags.map((t: { tag: string; source: string }) => ({ tag: t.tag, source: t.source }))
      return { ...SPEC_DEFAULTS, ...car, owned: true, tags: storedTags, tagDetails } as Car
    }
    return {
      ...SPEC_DEFAULTS, ...car,
      owned: false,
      tags: autoTags,
      tagDetails: autoTags.map((tag) => ({ tag, source: 'auto' })),
    } as Car
  })

  // Respect the user's last-used view preference from the URL so the skeleton
  // matches what they'll see when the component hydrates.
  const viewParam = params?.view
  const view = viewParam === 'grid' ? 'grid' : 'table'

  return (
    // min-h-screen prevents layout shifts above/below the virtual list container
    // from being measured as CLS when the skeleton swaps for the real component.
    <main className="max-w-screen-2xl mx-auto min-h-screen">
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
