import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  const { carId: carIdStr } = await params
  const carId = parseInt(carIdStr)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const entry = await prisma.userGarage.findFirst({ where: { carId } })
  if (!entry) return NextResponse.json({ error: 'Not in garage' }, { status: 404 })

  const body = await request.json()

  if ('notes' in body) {
    await prisma.userGarage.update({
      where: { id: entry.id },
      data: { notes: body.notes ?? null },
    })
  }

  if ('tags' in body) {
    const tags: string[] = body.tags ?? []
    await prisma.carTag.deleteMany({ where: { userGarageId: entry.id } })
    if (tags.length > 0) {
      await prisma.carTag.createMany({
        data: tags.map((tag) => ({ userGarageId: entry.id, tag })),
      })
    }
  }

  return NextResponse.json({ ok: true })
}
