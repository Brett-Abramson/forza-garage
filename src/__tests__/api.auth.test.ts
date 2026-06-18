/**
 * Authorization tests for the garage mutation Server Actions.
 *
 * Mutations moved from REST route handlers (PATCH /api/cars/[id],
 * PATCH /api/garage/[carId]) to transactional Server Actions in
 * src/server/actions/garage.ts. These tests assert the same core security
 * property: a user can only read/write their own garage data, and every write
 * is scoped to the authenticated userId.
 *
 * Actions return a discriminated result ({ ok: true } | { ok: false, error })
 * instead of an HTTP Response, so assertions check `ok`/`error` rather than
 * status codes. Auth and rate-limit are validated at the edge of every action
 * before any database call.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { setOwned, setTags, setNotes, setPinned, tuneCar } from '@/server/actions/garage'

// ─── Prisma mock (the DAL imports the singleton from @/server/db) ───────────────

vi.mock('@/server/db', () => ({
  prisma: {
    userGarage: {
      findUnique:  vi.fn(),
      update:      vi.fn(),
      upsert:      vi.fn(),
      deleteMany:  vi.fn(),
      count:       vi.fn(),
    },
    carTag: {
      deleteMany:  vi.fn(),
      createMany:  vi.fn(),
    },
    car: {
      findUnique:  vi.fn(),
      update:      vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(true),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getPrisma() {
  const { prisma } = await import('@/server/db')
  return prisma
}

function mockCar(overrides = {}) {
  return {
    id: 42, make: 'Ford', model: 'GT', year: 2020,
    division: 'Modern Supercars', piClass: 'S2', piRating: 900,
    drivetrain: null, country: 'USA', source: 'Autoshow',
    engineType: null, engineCC: null, cylinders: null, bodyStyle: null,
    statSpeed: null, statHandling: null, statAcceleration: null,
    statLaunch: null, statBraking: null, statOffroad: null,
    powerHp: null, torqueFtLb: null, weightLb: null, frontWeight: null,
    displacementL: null, value: null, rarity: null, sourceInfo: null,
    ...overrides,
  }
}

// ─── Reset mocks before each test ────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ userId: null } as never)
  const prisma = await getPrisma()
  vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.userGarage.update).mockResolvedValue({} as never)
  vi.mocked(prisma.userGarage.upsert).mockResolvedValue({ id: 1, carId: 42, userId: 'user-alice' } as never)
  vi.mocked(prisma.userGarage.deleteMany).mockResolvedValue({ count: 1 } as never)
  vi.mocked(prisma.carTag.deleteMany).mockResolvedValue({ count: 0 } as never)
  vi.mocked(prisma.carTag.createMany).mockResolvedValue({ count: 0 } as never)
  vi.mocked(prisma.car.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.$transaction).mockResolvedValue([] as never)

  const { checkRateLimit } = await import('@/lib/rateLimit')
  vi.mocked(checkRateLimit).mockReturnValue(true)
})

// ─── setTags / setNotes / setPinned — no auth ─────────────────────────────────

describe('garage mutations — no auth / invalid auth', () => {
  it('setNotes returns Unauthorized when no session exists (userId null)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await setNotes(5, 'hello')
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('setNotes returns Unauthorized when userId is an empty string (invalid token)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const res = await setNotes(5, 'hello')
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('does not touch the database when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const prisma = await getPrisma()
    await setNotes(5, 'hi')
    expect(prisma.userGarage.findUnique).not.toHaveBeenCalled()
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
  })
})

// ─── setNotes / setTags — authenticated, own entry ────────────────────────────

describe('garage mutations — authenticated, own entry', () => {
  it('setNotes returns ok when the user owns the car', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue({ id: 1 } as never)
    const res = await setNotes(5, 'great car')
    expect(res).toEqual({ ok: true })
  })

  it('scopes the lookup to the authenticated userId — does not query all users', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue({ id: 1 } as never)
    await setNotes(5, 'test')
    expect(prisma.userGarage.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_carId: { userId: 'user-alice', carId: 5 } },
      })
    )
  })

  it('setTags replaces the tag set atomically via $transaction for own entry', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue({ id: 1 } as never)
    const res = await setTags(5, { auto: ['dirt'], user: ['grip'] })
    expect(res).toEqual({ ok: true })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.carTag.deleteMany).toHaveBeenCalledWith({ where: { userGarageId: 1 } })
    expect(prisma.carTag.createMany).toHaveBeenCalled()
  })
})

// ─── Cross-user access ─────────────────────────────────────────────────────────

describe('garage mutations — cross-user access', () => {
  it('setNotes returns "Not in garage" when the entry does not belong to the requester', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null) // bob has no entry for car 5
    const res = await setNotes(5, 'trying to overwrite')
    expect(res).toEqual({ ok: false, error: 'Not in garage' })
  })

  it('does not call update / carTag writes when the entry is not the requester\'s', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    await setNotes(5, 'evil')
    await setTags(5, { auto: [], user: ['x'] })
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
    expect(prisma.carTag.deleteMany).not.toHaveBeenCalled()
    expect(prisma.carTag.createMany).not.toHaveBeenCalled()
  })

  it('lookup is always scoped to the authenticated userId — never carId alone', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    await setPinned(5, true)
    const callArg = vi.mocked(prisma.userGarage.findUnique).mock.calls[0][0] as {
      where: { userId_carId: { userId: string; carId: number } }
    }
    expect(callArg.where.userId_carId.userId).toBe('user-bob')
    expect(callArg.where.userId_carId.carId).toBe(5)
  })
})

// ─── setOwned { owned: true } — add to garage ─────────────────────────────────

describe('setOwned(true) — add to garage', () => {
  it('returns Unauthorized with no auth token', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await setOwned(42, true)
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('returns Unauthorized with empty userId (invalid token)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const res = await setOwned(42, true)
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('upserts the car into the authenticated user\'s garage on success', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    const res = await setOwned(42, true)
    expect(res).toMatchObject({ ok: true, car: expect.objectContaining({ id: 42, owned: true }) })
    expect(prisma.userGarage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_carId: { userId: 'user-alice', carId: 42 } },
      })
    )
  })

  it('does not create a garage entry for an empty userId', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const prisma = await getPrisma()
    const res = await setOwned(42, true)
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
    expect(prisma.userGarage.upsert).not.toHaveBeenCalled()
  })

  it('returns "Car not found" when the car does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(null)
    const res = await setOwned(42, true)
    expect(res).toEqual({ ok: false, error: 'Car not found' })
  })
})

// ─── setOwned { owned: false } — remove from garage ───────────────────────────

describe('setOwned(false) — remove from garage', () => {
  it('returns Unauthorized with no auth token', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await setOwned(42, false)
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('scopes the deleteMany to the authenticated userId — cannot delete another user\'s entry', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    await setOwned(42, false)
    expect(prisma.userGarage.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-alice' }) })
    )
  })

  it('user-bob\'s removal request uses bob\'s userId (alice\'s entry untouched)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    await setOwned(42, false)
    const callArg = vi.mocked(prisma.userGarage.deleteMany).mock.calls[0][0] as {
      where: { carId: number; userId: string }
    }
    expect(callArg.where.userId).toBe('user-bob')
    expect(callArg.where.userId).not.toBe('user-alice')
  })
})

// ─── tuneCar (per-user overrides) — auth + ownership ──────────────────────────

describe('tuneCar — auth required', () => {
  it('returns Unauthorized with no auth when updating a stat field', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await tuneCar(42, { statSpeed: 8.5 })
    expect(res).toEqual({ ok: false, error: 'Unauthorized' })
  })

  it('does not touch the database when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const prisma = await getPrisma()
    await tuneCar(42, { statHandling: 7.2 })
    expect(prisma.car.update).not.toHaveBeenCalled()
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
  })
})

describe('tuneCar — writes overrides to UserGarage, not Car', () => {
  beforeEach(async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue({ id: 7 } as never)
  })

  it('returns ok when the user owns the car', async () => {
    const res = await tuneCar(42, { statSpeed: 8.5 })
    expect(res).toEqual({ ok: true })
  })

  it('never calls prisma.car.update — stats are stored as per-user overrides', async () => {
    const prisma = await getPrisma()
    await tuneCar(42, { statSpeed: 8.5 })
    expect(prisma.car.update).not.toHaveBeenCalled()
  })

  it('maps statSpeed → statSpeedOverride on UserGarage', async () => {
    const prisma = await getPrisma()
    await tuneCar(42, { statSpeed: 8.5 })
    expect(prisma.userGarage.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statSpeedOverride: 8.5 }) })
    )
  })

  it('maps powerHp → powerHpOverride and torqueFtLb → torqueFtLbOverride', async () => {
    const prisma = await getPrisma()
    await tuneCar(42, { powerHp: 500, torqueFtLb: 400 })
    expect(prisma.userGarage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ powerHpOverride: 500, torqueFtLbOverride: 400 }),
      })
    )
  })

  it('a null value clears the override (reverts to canonical)', async () => {
    const prisma = await getPrisma()
    await tuneCar(42, { statSpeed: null })
    expect(prisma.userGarage.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statSpeedOverride: null }) })
    )
  })

  it('scopes the garage lookup to the authenticated userId + carId', async () => {
    const prisma = await getPrisma()
    await tuneCar(42, { statSpeed: 8.5 })
    expect(prisma.userGarage.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId_carId: { userId: 'user-alice', carId: 42 } } })
    )
  })
})

describe('tuneCar — unowned car rejected', () => {
  it('returns Forbidden when the authenticated user does not own the car', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    const res = await tuneCar(42, { statSpeed: 8.5 })
    expect(res).toEqual({ ok: false, error: 'Forbidden' })
  })

  it('does not call userGarage.update when the car is unowned', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    await tuneCar(42, { statSpeed: 8.5 })
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
    expect(prisma.car.update).not.toHaveBeenCalled()
  })
})

// ─── Input validation ──────────────────────────────────────────────────────────

describe('input validation (auth passes)', () => {
  beforeEach(async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue({ id: 1 } as never)
  })

  it('setNotes returns error when notes exceeds 500 characters', async () => {
    const res = await setNotes(5, 'x'.repeat(501))
    expect(res).toMatchObject({ ok: false })
  })

  it('setTags returns error when a tag exceeds 50 characters', async () => {
    const res = await setTags(5, { auto: [], user: ['a'.repeat(51)] })
    expect(res).toMatchObject({ ok: false })
  })

  it('setTags returns error when a tag contains invalid characters', async () => {
    const res = await setTags(5, { auto: [], user: ['bad<script>'] })
    expect(res).toMatchObject({ ok: false })
  })

  it('rejects invalid input before writing to the database', async () => {
    const prisma = await getPrisma()
    await setTags(5, { auto: [], user: ['bad<script>'] })
    expect(prisma.carTag.createMany).not.toHaveBeenCalled()
  })
})

// ─── Rate limiting ────────────────────────────────────────────────────────────

describe('rate limiting', () => {
  it('setNotes returns "Too many requests" when the limit is exceeded', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const { checkRateLimit } = await import('@/lib/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValueOnce(false)
    const res = await setNotes(5, 'hi')
    expect(res).toEqual({ ok: false, error: 'Too many requests' })
  })

  it('setOwned returns "Too many requests" when the limit is exceeded', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const { checkRateLimit } = await import('@/lib/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValueOnce(false)
    const res = await setOwned(42, true)
    expect(res).toEqual({ ok: false, error: 'Too many requests' })
  })
})
