/**
 * Authorization integration tests for garage API routes.
 *
 * Tests the core security property: a user can only read/write their own
 * garage data. Requests carrying one user's session cannot access or modify
 * another user's data.
 *
 * Route inventory (prompt vs reality):
 *   Prompt "GET /api/garage"         → does not exist; garage is server-side fetched
 *   Prompt "POST /api/garage"        → PATCH /api/cars/[id]  { owned: true }
 *   Prompt "DELETE /api/garage/[id]" → PATCH /api/cars/[id]  { owned: false }
 *   Prompt "PATCH /api/garage/[id]"  → PATCH /api/garage/[carId]  (notes/tags/pinned)
 *
 * Cross-user protection note: when a user tries to modify another user's
 * garage entry via PATCH /api/garage/[carId], the route returns 404 (not 403).
 * This is intentional — returning 403 would confirm the resource exists for
 * another user. 404 leaks no information about other users' garage contents.
 *
 * Security fix applied during this audit: PATCH /api/cars/[id] stat-update
 * branch previously had no auth check. Fixed to require auth before writing
 * shared car stats. See the route file comment for rationale.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PATCH as garagePatch } from '@/app/api/garage/[carId]/route'
import { PATCH as carsPatch } from '@/app/api/cars/[id]/route'

// ─── Prisma mock ──────────────────────────────────────────────────────────────

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userGarage: {
      findFirst:   vi.fn(),
      findUnique:  vi.fn(),
      update:      vi.fn(),
      create:      vi.fn(),
      deleteMany:  vi.fn(),
    },
    carTag: {
      deleteMany:  vi.fn(),
      createMany:  vi.fn(),
    },
    car: {
      findUnique:  vi.fn(),
      update:      vi.fn(),
    },
  },
}))

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(true),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Re-import after mocks are registered so we get the mocked instances
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

function req(body: object): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Minimal car object returned by prisma.car.findUnique in the owned-toggle path
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
    garage: [],   // no existing garage entries by default
    ...overrides,
  }
}

// Minimal userGarage entry
function mockGarageEntry(overrides = {}) {
  return { id: 1, carId: 5, userId: 'user-alice', notes: null, ...overrides }
}

// ─── Reset mocks before each test ────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks() // reset call histories so spies from previous tests don't bleed through
  vi.mocked(auth).mockResolvedValue({ userId: null } as never)
  const prisma = await getPrisma()
  vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(null)
  vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.userGarage.update).mockResolvedValue({} as never)
  vi.mocked(prisma.userGarage.create).mockResolvedValue({ id: 1, carId: 42, userId: 'user-alice' } as never)
  vi.mocked(prisma.userGarage.deleteMany).mockResolvedValue({ count: 1 })
  vi.mocked(prisma.carTag.deleteMany).mockResolvedValue({ count: 0 })
  vi.mocked(prisma.carTag.createMany).mockResolvedValue({ count: 0 })
  vi.mocked(prisma.car.findUnique).mockResolvedValue(null)
  vi.mocked(prisma.car.update).mockResolvedValue({} as never)
})

// ─── PATCH /api/garage/[carId] — no auth ─────────────────────────────────────

describe('PATCH /api/garage/[carId] — no auth / invalid auth', () => {
  it('returns 401 when no session exists (userId is null)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await garagePatch(req({ notes: 'hello' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 when userId is an empty string (invalid token)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const res = await garagePatch(req({ notes: 'hello' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(res.status).toBe(401)
  })

  it('response body contains an error field on 401', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await garagePatch(req({ notes: 'test' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('does not touch the database when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const prisma = await getPrisma()
    await garagePatch(req({ notes: 'hi' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(prisma.userGarage.findFirst).not.toHaveBeenCalled()
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
  })
})

// ─── PATCH /api/garage/[carId] — authenticated, own entry ────────────────────

describe('PATCH /api/garage/[carId] — authenticated, own entry', () => {
  it('returns 200 when the authenticated user updates their own entry (notes)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(
      mockGarageEntry({ userId: 'user-alice' }) as never
    )
    const res = await garagePatch(req({ notes: 'great car' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(res.status).toBe(200)
  })

  it('scopes the lookup to the authenticated userId — does not query all users', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(
      mockGarageEntry({ userId: 'user-alice' }) as never
    )
    await garagePatch(req({ notes: 'test' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(prisma.userGarage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-alice' }) })
    )
  })

  it('returns 200 when updating tags for own entry', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(
      mockGarageEntry({ userId: 'user-alice' }) as never
    )
    const res = await garagePatch(
      req({ tags: { auto: ['dirt'], user: ['grip'] } }),
      { params: Promise.resolve({ carId: '5' }) }
    )
    expect(res.status).toBe(200)
  })
})

// ─── PATCH /api/garage/[carId] — cross-user access ───────────────────────────

describe('PATCH /api/garage/[carId] — cross-user access', () => {
  /**
   * When user-bob tries to patch carId=5 which belongs only to user-alice,
   * the route queries { carId: 5, userId: 'user-bob' } — finds nothing —
   * and returns 404. This is intentional: 404 leaks no information about
   * whether carId=5 exists in another user's garage (unlike 403 which would).
   */
  it('returns 404 (not 200) when the authenticated user tries to modify a different user\'s entry', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    // findFirst returns null — user-bob has no entry for carId 5
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(null)
    const res = await garagePatch(req({ notes: 'trying to overwrite' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(res.status).toBe(404)
  })

  it('does not call prisma.update when the entry does not belong to the requester', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(null)
    await garagePatch(req({ notes: 'evil' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
    expect(prisma.carTag.deleteMany).not.toHaveBeenCalled()
    expect(prisma.carTag.createMany).not.toHaveBeenCalled()
  })

  it('query is always scoped to the authenticated user\'s userId — never queries by carId alone', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(null)
    await garagePatch(req({ pinned: true }), {
      params: Promise.resolve({ carId: '5' }),
    })
    const callArg = vi.mocked(prisma.userGarage.findFirst).mock.calls[0][0] as {
      where: { carId: number; userId: string }
    }
    expect(callArg.where.userId).toBe('user-bob')
    expect(callArg.where.carId).toBe(5)
  })
})

// ─── PATCH /api/cars/[id] { owned: true } — add to garage ────────────────────

describe('PATCH /api/cars/[id] { owned: true } — add to garage', () => {
  it('returns 401 with no auth token', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await carsPatch(req({ owned: true }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 with empty userId (invalid token)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const res = await carsPatch(req({ owned: true }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(401)
  })

  it('adds the car to the authenticated user\'s garage on success', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    const res = await carsPatch(req({ owned: true }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(200)
    expect(prisma.userGarage.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-alice', carId: 42 }) })
    )
  })

  it('does not create a garage entry for an empty userId', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const prisma = await getPrisma()
    const res = await carsPatch(req({ owned: true }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(401)
    expect(prisma.userGarage.create).not.toHaveBeenCalled()
  })

  it('returns 404 when the car does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(null)
    const res = await carsPatch(req({ owned: true }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/cars/[id] { owned: false } — remove from garage ──────────────

describe('PATCH /api/cars/[id] { owned: false } — remove from garage', () => {
  it('returns 401 with no auth token', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await carsPatch(req({ owned: false }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(401)
  })

  it('scopes the deleteMany to the authenticated userId — cannot delete another user\'s entry', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    await carsPatch(req({ owned: false }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.userGarage.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-alice' }) })
    )
  })

  it('user-bob\'s removal request cannot delete user-alice\'s entry (query uses bob\'s userId)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    await carsPatch(req({ owned: false }), {
      params: Promise.resolve({ id: '42' }),
    })
    // deleteMany uses user-bob's userId — alice's entry is untouched
    const callArg = vi.mocked(prisma.userGarage.deleteMany).mock.calls[0][0] as {
      where: { carId: number; userId: string }
    }
    expect(callArg.where.userId).toBe('user-bob')
    expect(callArg.where.userId).not.toBe('user-alice')
  })

  it('returns 200 even when the car was never in the user\'s garage (deleteMany no-op)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.car.findUnique).mockResolvedValue(mockCar() as never)
    vi.mocked(prisma.userGarage.deleteMany).mockResolvedValue({ count: 0 })
    const res = await carsPatch(req({ owned: false }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(200)
  })
})

// ─── PATCH /api/cars/[id] stat updates — auth + ownership ────────────────────

describe('PATCH /api/cars/[id] stat updates — auth required', () => {
  it('returns 401 with no auth when updating a stat field', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const res = await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 with empty userId when updating stats', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: '' } as never)
    const res = await carsPatch(req({ powerHp: 500 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(401)
  })

  it('does not touch the database when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)
    const prisma = await getPrisma()
    await carsPatch(req({ statHandling: 7.2 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.car.update).not.toHaveBeenCalled()
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
  })
})

// ─── PATCH /api/cars/[id] stat updates — writes to UserGarage, not Car ────────

describe('PATCH /api/cars/[id] stat updates — writes overrides to UserGarage', () => {
  beforeEach(async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    // findUnique succeeds → user owns this car
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue({ id: 7 } as never)
  })

  it('returns 200 when the user owns the car', async () => {
    const res = await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(200)
  })

  it('never calls prisma.car.update — stats are stored as per-user overrides', async () => {
    const prisma = await getPrisma()
    await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.car.update).not.toHaveBeenCalled()
  })

  it('calls prisma.userGarage.update with the override field name, not the base field name', async () => {
    const prisma = await getPrisma()
    await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.userGarage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ statSpeedOverride: 8.5 }),
      })
    )
  })

  it('maps powerHp → powerHpOverride on UserGarage', async () => {
    const prisma = await getPrisma()
    await carsPatch(req({ powerHp: 500, torqueFtLb: 400 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.userGarage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ powerHpOverride: 500, torqueFtLbOverride: 400 }),
      })
    )
  })

  it('a null value clears the override (reverts to canonical)', async () => {
    const prisma = await getPrisma()
    await carsPatch(req({ statSpeed: null }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.userGarage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ statSpeedOverride: null }),
      })
    )
  })

  it('scopes the garage lookup to the authenticated userId + carId', async () => {
    const prisma = await getPrisma()
    await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.userGarage.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_carId: { userId: 'user-alice', carId: 42 } },
      })
    )
  })
})

// ─── PATCH /api/cars/[id] stat updates — unowned car ─────────────────────────

describe('PATCH /api/cars/[id] stat updates — unowned car rejected', () => {
  it('returns 403 when the authenticated user does not own the car', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    // findUnique returns null → no garage entry for user-bob + car 42
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    const res = await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(403)
  })

  it('does not call userGarage.update when the car is unowned', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    await carsPatch(req({ statSpeed: 8.5 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
    expect(prisma.car.update).not.toHaveBeenCalled()
  })

  it('user-bob cannot edit stats for a car only owned by user-alice', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-bob' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findUnique).mockResolvedValue(null)
    const res = await carsPatch(req({ powerHp: 999 }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(403)
    expect(prisma.userGarage.update).not.toHaveBeenCalled()
  })
})

// ─── Input validation — shared across routes ──────────────────────────────────

describe('PATCH /api/garage/[carId] — input validation (auth passes)', () => {
  beforeEach(async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const prisma = await getPrisma()
    vi.mocked(prisma.userGarage.findFirst).mockResolvedValue(
      mockGarageEntry() as never
    )
  })

  it('returns 400 for non-numeric carId', async () => {
    const res = await garagePatch(req({ notes: 'hi' }), {
      params: Promise.resolve({ carId: 'abc' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when notes exceeds 500 characters', async () => {
    const res = await garagePatch(req({ notes: 'x'.repeat(501) }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when a tag exceeds 50 characters', async () => {
    const res = await garagePatch(
      req({ tags: { auto: [], user: ['a'.repeat(51)] } }),
      { params: Promise.resolve({ carId: '5' }) }
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when a tag contains invalid characters', async () => {
    const res = await garagePatch(
      req({ tags: { auto: [], user: ['bad<script>'] } }),
      { params: Promise.resolve({ carId: '5' }) }
    )
    expect(res.status).toBe(400)
  })
})

// ─── Rate limiting ────────────────────────────────────────────────────────────

describe('rate limiting', () => {
  it('returns 429 when rate limit is exceeded on PATCH /api/garage/[carId]', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const { checkRateLimit } = await import('@/lib/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValueOnce(false)
    const res = await garagePatch(req({ notes: 'hi' }), {
      params: Promise.resolve({ carId: '5' }),
    })
    expect(res.status).toBe(429)
  })

  it('returns 429 when rate limit is exceeded on PATCH /api/cars/[id] owned toggle', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-alice' } as never)
    const { checkRateLimit } = await import('@/lib/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValueOnce(false)
    const res = await carsPatch(req({ owned: true }), {
      params: Promise.resolve({ id: '42' }),
    })
    expect(res.status).toBe(429)
  })
})
