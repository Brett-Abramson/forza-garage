import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rateLimit'

const NOTES_MAX_LENGTH = 500
const TAG_MAX_LENGTH = 50
const TAG_PATTERN = /^[a-z0-9 -]+$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { carId: carIdStr } = await params
  const carId = parseInt(carIdStr)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const entry = await prisma.userGarage.findFirst({ where: { carId, userId } })
  if (!entry) return NextResponse.json({ error: 'Not in garage' }, { status: 404 })

  const body = await request.json()

  if ('notes' in body) {
    const notes: unknown = body.notes
    if (notes !== null && notes !== undefined) {
      if (typeof notes !== 'string') {
        return NextResponse.json({ error: 'notes must be a string' }, { status: 400 })
      }
      if (notes.length > NOTES_MAX_LENGTH) {
        return NextResponse.json(
          { error: `notes must be ${NOTES_MAX_LENGTH} characters or fewer` },
          { status: 400 }
        )
      }
    }
    await prisma.userGarage.update({
      where: { id: entry.id },
      data: { notes: body.notes ?? null },
    })
  }

  if ('tags' in body) {
    // Replace the full tag set — client sends { auto: string[], user: string[] }
    // so we can preserve source labels while allowing auto-tags to be removed.
    const { auto: autoTags = [], user: userTags = [] }: { auto?: string[]; user?: string[] } = body.tags ?? {}

    // Validate all tags
    const allTagStrings = [...autoTags, ...userTags]
    for (const tag of allTagStrings) {
      if (typeof tag !== 'string') {
        return NextResponse.json({ error: 'Each tag must be a string' }, { status: 400 })
      }
      if (tag.length > TAG_MAX_LENGTH) {
        return NextResponse.json(
          { error: `Tags must be ${TAG_MAX_LENGTH} characters or fewer` },
          { status: 400 }
        )
      }
      if (!TAG_PATTERN.test(tag)) {
        return NextResponse.json(
          { error: 'Tags may only contain letters, numbers, spaces, and hyphens' },
          { status: 400 }
        )
      }
    }

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
