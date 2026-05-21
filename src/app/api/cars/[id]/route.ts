import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const carId = parseInt(id)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body = await request.json()

  if (body.owned) {
    const existing = await prisma.userGarage.findFirst({ where: { carId } })
    if (!existing) {
      await prisma.userGarage.create({ data: { carId } })
    }
  } else {
    await prisma.userGarage.deleteMany({ where: { carId } })
  }

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { garage: { select: { id: true } } },
  })
  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

  const { garage, ...carData } = car
  return NextResponse.json({ ...carData, owned: garage.length > 0 })
}
