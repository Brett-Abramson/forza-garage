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
  const car = await prisma.car.update({
    where: { id: carId },
    data: { owned: body.owned },
  })
  return NextResponse.json(car)
}
