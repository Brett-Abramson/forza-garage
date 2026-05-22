import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAutoTags } from '@/lib/autotags'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const carId = parseInt(id)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { garage: { select: { id: true } } },
  })
  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

  const body = await request.json()

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
