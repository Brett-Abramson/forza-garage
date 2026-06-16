import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'
import { checkRateLimit } from '@/lib/rateLimit'
import { STAT_OVERRIDE_MAP } from '@/lib/statUtils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const carId = parseInt(id)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const car = await prisma.car.findUnique({ where: { id: carId } })
  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  return NextResponse.json(car)
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const carId = parseInt(id)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body = await request.json()

  // ── Owned toggle ──────────────────────────────────────────────────────────
  if ('owned' in body) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: { garage: { where: { userId }, select: { id: true } } },
    })
    if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

    if (body.owned) {
      if (car.garage.length === 0) {
        const entry = await prisma.userGarage.create({ data: { carId, userId } })
        const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
        if (autoTags.length > 0) {
          await prisma.carTag.createMany({
            data: autoTags.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
          })
        }
      }
    } else {
      await prisma.userGarage.deleteMany({ where: { carId, userId } })
    }

    const { garage, ...carData } = car
    return NextResponse.json({ ...carData, owned: !!body.owned })
  }

  // ── Stat / spec updates ───────────────────────────────────────────────────
  const overrideUpdates: Record<string, unknown> = {}
  for (const [field, overrideField] of Object.entries(STAT_OVERRIDE_MAP)) {
    if (field in body) {
      overrideUpdates[overrideField] = body[field] ?? null
    }
  }

  if (Object.keys(overrideUpdates).length > 0) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const garageEntry = await prisma.userGarage.findUnique({
      where: { userId_carId: { userId, carId } },
      select: { id: true },
    })
    if (!garageEntry) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.userGarage.update({
      where: { id: garageEntry.id },
      data: overrideUpdates,
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}
