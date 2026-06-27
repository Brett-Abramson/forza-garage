import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/db'
import { getAutoTags } from '@/lib/autotags'
import { LIST_SIM_SELECT } from '@/lib/metrics'
import { computeBadgeMatrix } from '@/lib/statPercentiles'
import type { Car, CarBadgeMap } from '@/types/car'

// Columns needed for list/table display + Stats/Sim-mode sorting. Spec-only
// fields (engineType, engineCC, cylinders, bodyStyle) and the 3 non-rankable sim
// ratios are intentionally omitted from the 618-row list payload and fetched on
// demand when the drawer opens. The rankable sim fields ride along via
// LIST_SIM_SELECT (defined in src/lib/metrics.ts — the single sim field source).
const LIST_SELECT = {
  id: true, make: true, model: true, year: true,
  piClass: true, piRating: true, division: true, drivetrain: true,
  country: true, source: true, sourceInfo: true, value: true, rarity: true,
  statSpeed: true, statHandling: true, statAcceleration: true,
  statLaunch: true, statBraking: true, statOffroad: true,
  powerHp: true, torqueFtLb: true, weightLb: true,
  frontWeight: true, displacementL: true,
  ...LIST_SIM_SELECT,
} as const

// Placeholder nulls for the fields excluded from LIST_SELECT: the spec-only
// columns plus the 3 non-rankable sim ratios (populated only by the drawer's
// full-row fetch). Keeps list rows type-complete against the Car interface.
const SPEC_DEFAULTS = {
  engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
  simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
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

// Columns needed for badge computation — a lighter projection than LIST_SELECT.
const BADGE_MATRIX_SELECT = {
  id: true, piClass: true,
  statSpeed: true, statHandling: true, statAcceleration: true,
  statLaunch: true, statBraking: true, statOffroad: true,
  powerHp: true, torqueFtLb: true, weightLb: true,
  simZeroToSixty: true, simZeroToHundred: true, simBraking60: true,
  simLateralG60: true, simTopSpeed: true,
} as const

/**
 * Per-car badge matrix keyed by car id. Computed over the full catalog by PI
 * class; cached 24h like getCarCount. Returns a plain Record so it
 * round-trips through unstable_cache's JSON serialization intact.
 */
export const getBadgeMatrix = unstable_cache(
  async (): Promise<Record<number, CarBadgeMap>> => {
    const cars = await prisma.car.findMany({ select: BADGE_MATRIX_SELECT })
    return computeBadgeMatrix(cars)
  },
  ['stat-percentiles'],
  { tags: ['stat-percentiles'], revalidate: 86400 },
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
  const [rawCars, garageEntries, badgeMatrix] = await Promise.all([
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
    getBadgeMatrix(),
  ])

  const garageMap = new Map(garageEntries.map((e) => [e.carId, e]))

  return rawCars.map((car) => {
    const badges = badgeMatrix[car.id]
    const entry = garageMap.get(car.id)
    if (entry) {
      return {
        ...SPEC_DEFAULTS, ...car,
        owned: true,
        badges,
        tags: entry.tags.map((t) => t.tag),
        tagDetails: entry.tags.map((t) => ({ tag: t.tag, source: t.source })),
      } as Car
    }
    const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined, {
      statSpeed: car.statSpeed, statHandling: car.statHandling,
      statAcceleration: car.statAcceleration, statLaunch: car.statLaunch,
      statBraking: car.statBraking, statOffroad: car.statOffroad,
    })
    return {
      ...SPEC_DEFAULTS, ...car,
      owned: false,
      badges,
      tags: autoTags,
      tagDetails: autoTags.map((tag) => ({ tag, source: 'auto' })),
    } as Car
  })
}
