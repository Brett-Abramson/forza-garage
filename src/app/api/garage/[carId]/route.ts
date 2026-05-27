import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { carId: carIdStr } = await params
  const carId = parseInt(carIdStr)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const entry = await prisma.userGarage.findFirst({ where: { carId, userId } })
  if (!entry) return NextResponse.json({ error: 'Not in garage' }, { status: 404 })

  const body = await request.json()

  if ('notes' in body) {
    await prisma.userGarage.update({
      where: { id: entry.id },
      data: { notes: body.notes ?? null },
    })
  }

  if ('tags' in body) {
    // Replace the full tag set — client sends { auto: string[], user: string[] }
    // so we can preserve source labels while allowing auto-tags to be removed.
    const { auto: autoTags = [], user: userTags = [] }: { auto?: string[]; user?: string[] } = body.tags ?? {}
    await prisma.carTag.deleteMany({ where: { userGarageId: entry.id } })
    const all = [
      ...autoTags.map((tag: string) => ({ userGarageId: entry.id, tag, source: 'auto' })),
      ...userTags.map((tag: string) => ({ userGarageId: entry.id, tag, source: 'user' })),
    ]
    if (all.length > 0) await prisma.carTag.createMany({ data: all })
  }

  if ('pinned' in body) {
    await prisma.userGarage.update({
      where: { id: entry.id },
      data: { pinned: Boolean(body.pinned) },
    })
  }

  return NextResponse.json({ ok: true })
}
