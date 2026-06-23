import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/db'
import { getAutoTags } from '@/lib/autotags'
import type { Car } from '@/types/car'

// Columns needed for list/table display + Stats-mode sorting. Spec-only fields
// (engineType, engineCC, cylinders, bodyStyle) are intentionally omitted from
// the 618-row list payload and fetched on demand when the drawer opens.
const LIST_SELECT = {
  id: true, make: true, model: true, year: true,
  piClass: true, piRating: true, division: true, drivetrain: true,
  country: true, source: true, sourceInfo: true, value: true, rarity: true,
  statSpeed: true, statHandling: true, statAcceleration: true,
  statLaunch: true, statBraking: true, statOffroad: true,
  powerHp: true, torqueFtLb: true, weightLb: true,
  frontWeight: true, displacementL: true,
} as const

// Placeholder nulls for the spec fields excluded from LIST_SELECT.
const SPEC_DEFAULTS = {
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
} as const

/**
 * Total number of cars in the database. Used on the hero of `/` and as the
 * garage's totalCars. Cached for 24h with the 'car-count' tag — the count only
 * changes when new cars are imported (upsert_cars.js inserts; it never deletes).
 * A redeploy clears this cache; otherwise it self-revalidates within 24h.
 * upsert_cars.js prints a reminder whenever it inserts cars.
 */
export const getCarCount = unstable_cache(
  (): Promise<number> => prisma.car.count(),
  ['car-count'],
  { tags: ['car-count'], revalidate: 86400 },
)

/** Full single car (all columns), or null. Used by the on-demand spec fetch. */
export function getCarById(carId: number) {
  return prisma.car.findUnique({ where: { id: carId } })
}

/** Every car ordered for display — used by the public list endpoint. */
export function getAllCars() {
  return prisma.car.findMany({ orderBy: [{ make: 'asc' }, { model: 'asc' }] })
}

/**
 * Full Car Database list with per-user ownership + tags folded in.
 * One car query + one garage query (no N+1); ownership joined in memory.
 * Pass null for signed-out visitors.
 */
export async function getCarsWithOwnership(userId: string | null): Promise<Car[]> {
  const [rawCars, garageEntries] = await Promise.all([
    prisma.car.findMany({
      select: LIST_SELECT,
      orderBy: [{ make: 'asc' }, { model: 'asc' }],
    }),
    userId
      ? prisma.userGarage.findMany({
          where: { userId },
          select: { carId: true, tags: { select: { tag: true, source: true } } },
        })
      : Promise.resolve([]),
  ])

  const garageMap = new Map(garageEntries.map((e) => [e.carId, e]))

  return rawCars.map((car) => {
    const entry = garageMap.get(car.id)
    if (entry) {
      return {
        ...SPEC_DEFAULTS, ...car,
        owned: true,
        tags: entry.tags.map((t) => t.tag),
        tagDetails: entry.tags.map((t) => ({ tag: t.tag, source: t.source })),
      } as Car
    }
    const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
    return {
      ...SPEC_DEFAULTS, ...car,
      owned: false,
      tags: autoTags,
      tagDetails: autoTags.map((tag) => ({ tag, source: 'auto' })),
    } as Car
  })
}
