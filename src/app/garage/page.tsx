import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'
import { resolveEffectiveStats } from '@/lib/statUtils'
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

/**
 * One-time backfill for garage entries that have zero stored CarTag rows.
 *
 * Cars added before the auto-tag fix never had tags written to the DB.
 * On the user's first garage load after this fix, we write getAutoTags()
 * results as source:'auto' for each such entry. Once any tag row exists
 * for an entry we never touch it again — the user owns their tag state.
 */
async function backfillMissingTags(
  entries: { id: number; car: { division: string; drivetrain: string | null }; tags: { tag: string }[] }[]
) {
  const toBackfill = entries.filter((e) => e.tags.length === 0)
  if (toBackfill.length === 0) return

  for (const entry of toBackfill) {
    const autoTags = getAutoTags(entry.car.division, entry.car.drivetrain ?? undefined)
    if (autoTags.length > 0) {
      await prisma.carTag.createMany({
        data: autoTags.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
        skipDuplicates: true,
      })
      // Patch the in-memory entry so the page renders the correct tags
      // without a second DB round-trip.
      entry.tags = autoTags.map((tag) => ({ tag }))
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

  const [entries, totalCars] = await Promise.all([
    prisma.userGarage.findMany({
      where: { userId },
      include: { car: true, tags: true },
      orderBy: [{ car: { make: 'asc' } }, { car: { model: 'asc' } }],
    }),
    prisma.car.count(),
  ])

  // One-time backfill: write auto-tags for any entry with zero stored tags.
  await backfillMissingTags(entries)

  const cars: Car[] = entries.map(({
    car, tags, notes, addedAt, pinned,
    statSpeedOverride, statHandlingOverride, statAccelerationOverride, statLaunchOverride,
    statBrakingOverride, statOffroadOverride, powerHpOverride, torqueFtLbOverride,
    weightLbOverride, frontWeightOverride, displacementLOverride, rarityOverride,
  }) => {
    const overrides = {
      statSpeedOverride, statHandlingOverride, statAccelerationOverride, statLaunchOverride,
      statBrakingOverride, statOffroadOverride, powerHpOverride, torqueFtLbOverride,
      weightLbOverride, frontWeightOverride, displacementLOverride, rarityOverride,
    }
    const base: Car = {
      ...car,
      ...overrides,
      owned: true,
      pinned,
      addedAt: addedAt?.toISOString() ?? null,
      tags: [...new Set(tags.map((t) => t.tag))],
      tagDetails: tags.map((t) => ({ tag: t.tag, source: t.source })),
      notes,
    }
    return { ...base, ...resolveEffectiveStats(base) }
  })

  const viewParam = params?.view
  const view = viewParam === 'grid' ? 'grid' : 'table'

  return (
    // min-h-screen prevents layout shifts above/below the content area
    // from registering as CLS when the skeleton swaps for the real component.
    <main className="max-w-screen-2xl mx-auto min-h-screen">
      <Suspense fallback={<GarageSkeleton view={view} />}>
        <GarageShowcaseClient initialCars={cars} totalCars={totalCars} />
      </Suspense>
    </main>
  )
}
