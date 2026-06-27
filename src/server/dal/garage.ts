import 'server-only'
import { prisma } from '@/server/db'
import { getAutoTags } from '@/lib/autotags'
import { resolveEffectiveStats, STAT_OVERRIDE_MAP } from '@/lib/statUtils'
import { getBadgeMatrix } from '@/server/dal/cars'
import type { Car } from '@/types/car'

// Cars the game gives every player at the start.
const STARTER_CARS = [
  { year: 1989, make: 'Nissan', model: "Silvia K's" },
  { year: 1994, make: 'Toyota', model: 'Celica GT-Four ST205' },
  { year: 1970, make: 'GMC',    model: 'Jimmy' },
]

// The 12 per-user override columns on UserGarage, derived from the canonical map.
const OVERRIDE_COLUMNS = Object.values(STAT_OVERRIDE_MAP)

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * First-load provisioning. Atomic, and skipped entirely once the user owns
 * anything — so it stops touching the database after the very first visit.
 */
export async function ensureStarterCars(userId: string): Promise<void> {
  const count = await prisma.userGarage.count({ where: { userId } })
  if (count > 0) return

  const cars = await prisma.car.findMany({
    where: { OR: STARTER_CARS.map(({ year, make, model }) => ({ year, make, model })) },
    select: {
      id: true, division: true, drivetrain: true,
      statSpeed: true, statHandling: true, statAcceleration: true,
      statLaunch: true, statBraking: true, statOffroad: true,
    },
  })
  if (cars.length === 0) return

  await prisma.$transaction(
    cars.map((car) =>
      prisma.userGarage.create({
        data: {
          userId,
          carId: car.id,
          tags: {
            create: getAutoTags(car.division, car.drivetrain ?? undefined, {
              statSpeed: car.statSpeed, statHandling: car.statHandling,
              statAcceleration: car.statAcceleration, statLaunch: car.statLaunch,
              statBraking: car.statBraking, statOffroad: car.statOffroad,
            })
              .map((tag) => ({ tag, source: 'auto' })),
          },
        },
      })
    )
  )
}

/**
 * Full garage list with effective (override-applied) stats.
 * Single query (car + tags via include); no per-row round-trips.
 */
export async function getGarageCars(userId: string): Promise<Car[]> {
  const [entries, badgeMatrix] = await Promise.all([
    prisma.userGarage.findMany({
      where: { userId },
      include: { car: true, tags: true },
      orderBy: [{ car: { make: 'asc' } }, { car: { model: 'asc' } }],
    }),
    getBadgeMatrix(),
  ])

  return entries.map((e) => {
    const overrides = {
      statSpeedOverride: e.statSpeedOverride, statHandlingOverride: e.statHandlingOverride,
      statAccelerationOverride: e.statAccelerationOverride, statLaunchOverride: e.statLaunchOverride,
      statBrakingOverride: e.statBrakingOverride, statOffroadOverride: e.statOffroadOverride,
      powerHpOverride: e.powerHpOverride, torqueFtLbOverride: e.torqueFtLbOverride,
      weightLbOverride: e.weightLbOverride, frontWeightOverride: e.frontWeightOverride,
      displacementLOverride: e.displacementLOverride, rarityOverride: e.rarityOverride,
    }
    const base: Car = {
      ...e.car,
      ...overrides,
      owned: true,
      badges: badgeMatrix[e.car.id],
      pinned: e.pinned,
      addedAt: e.addedAt?.toISOString() ?? null,
      tags: [...new Set(e.tags.map((t) => t.tag))],
      tagDetails: e.tags.map((t) => ({ tag: t.tag, source: t.source })),
      notes: e.notes,
    }
    return { ...base, ...resolveEffectiveStats(base) }
  })
}

interface ClassCount { piClass: string; _count_id: number }

/** Dashboard aggregates: total owned, per-class counts, pinned + recent cars. */
export async function getGarageStats(userId: string) {
  const [total, byClass, pinned, recent] = await Promise.all([
    prisma.userGarage.count({ where: { userId } }),

    prisma.$queryRaw<ClassCount[]>`
      SELECT c."piClass", COUNT(ug.id)::int AS "_count_id"
      FROM "UserGarage" ug
      JOIN "Car" c ON c.id = ug."carId"
      WHERE ug."userId" = ${userId}
      GROUP BY c."piClass"
    `,

    prisma.userGarage.findMany({
      where: { userId, pinned: true },
      take: 2,
      include: { car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true, division: true } } },
      orderBy: { addedAt: 'desc' },
    }),

    prisma.userGarage.findMany({
      where: { userId },
      take: 3,
      include: { car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true, division: true } } },
      orderBy: { addedAt: 'desc' },
    }),
  ])

  return { total, byClass, pinned, recent }
}

// ── Mutations (caller MUST have already authorized `userId`) ───────────────────
//
// Every write is scoped by userId so one user can never touch another's data.
// Functions return false / null when the car is not in the user's garage rather
// than throwing, so the action layer can map that to a 403/404 cleanly.

/** Add a car to the garage (idempotent) with its auto-tags, atomically. */
export async function markOwned(
  userId: string,
  car: {
    id: number; division: string; drivetrain: string | null
    statSpeed: number | null; statHandling: number | null; statAcceleration: number | null
    statLaunch: number | null; statBraking: number | null; statOffroad: number | null
  }
): Promise<void> {
  await prisma.userGarage.upsert({
    where: { userId_carId: { userId, carId: car.id } },
    update: {},
    create: {
      userId,
      carId: car.id,
      tags: {
        create: getAutoTags(car.division, car.drivetrain ?? undefined, {
          statSpeed: car.statSpeed, statHandling: car.statHandling,
          statAcceleration: car.statAcceleration, statLaunch: car.statLaunch,
          statBraking: car.statBraking, statOffroad: car.statOffroad,
        })
          .map((tag) => ({ tag, source: 'auto' })),
      },
    },
  })
}

/** Remove a car from the garage. CarTag rows cascade-delete with the parent. */
export async function unmarkOwned(userId: string, carId: number): Promise<void> {
  await prisma.userGarage.deleteMany({ where: { carId, userId } })
}

/** Resolve the user's garage row id for a car, or null. */
function findEntryId(userId: string, carId: number) {
  return prisma.userGarage.findUnique({
    where: { userId_carId: { userId, carId } },
    select: { id: true },
  })
}

/** Replace the entire tag set for an owned car, atomically. Returns false if unowned. */
export async function replaceTags(
  userId: string,
  carId: number,
  auto: string[],
  user: string[]
): Promise<boolean> {
  const entry = await findEntryId(userId, carId)
  if (!entry) return false

  const rows = [
    ...auto.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
    ...user.map((tag) => ({ userGarageId: entry.id, tag, source: 'user' })),
  ]

  await prisma.$transaction([
    prisma.carTag.deleteMany({ where: { userGarageId: entry.id } }),
    ...(rows.length ? [prisma.carTag.createMany({ data: rows })] : []),
  ])
  return true
}

/** Apply per-user stat/spec overrides to an owned car. Returns false if unowned. */
export async function applyOverrides(
  userId: string,
  carId: number,
  overrides: Record<string, number | string | null>
): Promise<boolean> {
  const entry = await findEntryId(userId, carId)
  if (!entry) return false
  await prisma.userGarage.update({ where: { id: entry.id }, data: overrides })
  return true
}

/** Clear every per-user override on an owned car. Returns false if unowned. */
export async function resetOverrides(userId: string, carId: number): Promise<boolean> {
  const entry = await findEntryId(userId, carId)
  if (!entry) return false
  const cleared = Object.fromEntries(OVERRIDE_COLUMNS.map((col) => [col, null]))
  await prisma.userGarage.update({ where: { id: entry.id }, data: cleared })
  return true
}

/** Update notes on an owned car. Returns false if unowned. */
export async function updateNotes(
  userId: string,
  carId: number,
  notes: string | null
): Promise<boolean> {
  const entry = await findEntryId(userId, carId)
  if (!entry) return false
  await prisma.userGarage.update({ where: { id: entry.id }, data: { notes } })
  return true
}

/** Toggle the pinned/favourite flag on an owned car. Returns false if unowned. */
export async function updatePinned(
  userId: string,
  carId: number,
  pinned: boolean
): Promise<boolean> {
  const entry = await findEntryId(userId, carId)
  if (!entry) return false
  await prisma.userGarage.update({ where: { id: entry.id }, data: { pinned } })
  return true
}
