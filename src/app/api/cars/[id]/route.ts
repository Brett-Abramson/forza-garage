import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'

// Fields on the Car model that can be updated directly (not per-user garage data)
const CAR_STAT_FIELDS = [
  'statSpeed', 'statHandling', 'statAcceleration', 'statLaunch', 'statBraking', 'statOffroad',
  'powerHp', 'torqueFtLb', 'weightLb', 'frontWeight', 'displacementL', 'rarity',
] as const

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
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: { garage: { select: { id: true } } },
    })
    if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

    if (body.owned) {
      if (car.garage.length === 0) {
        const entry = await prisma.userGarage.create({ data: { carId } })
        const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
        if (autoTags.length > 0) {
          await prisma.carTag.createMany({
            data: autoTags.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
          })
        }
      }
    } else {
      await prisma.userGarage.deleteMany({ where: { carId } })
    }

    const { garage, ...carData } = car
    return NextResponse.json({ ...carData, owned: !!body.owned })
  }

  // ── Stat / spec updates ───────────────────────────────────────────────────
  const statUpdates: Record<string, unknown> = {}
  for (const field of CAR_STAT_FIELDS) {
    if (field in body) {
      statUpdates[field] = body[field] ?? null
    }
  }

  if (Object.keys(statUpdates).length > 0) {
    const updated = await prisma.car.update({
      where: { id: carId },
      data: statUpdates,
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}
