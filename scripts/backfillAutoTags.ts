import { PrismaClient } from '@prisma/client'
import { getAutoTags } from '../src/lib/autotags'

// Standalone CLI script (run via tsx) — instantiate its own client like the
// sibling scripts (seed.ts, restore-garage.ts). It must not import the app's
// server-only Prisma singleton, which would throw outside the RSC graph.
const prisma = new PrismaClient()

async function main() {
  const entries = await prisma.userGarage.findMany({
    include: { car: true, tags: true },
  })

  console.log(`Checking ${entries.length} garage entries…\n`)

  let totalInserted = 0

  for (const entry of entries) {
    // Pass drivetrain so RWD→drift, AWD→dirt/offroad, FWD→tight/street racing
    // tags are included alongside the division-based tags.
    const autoTags = getAutoTags(entry.car.division, entry.car.drivetrain ?? undefined)
    const existingAuto = new Set(
      entry.tags.filter((t) => t.source === 'auto').map((t) => t.tag)
    )
    const missing = autoTags.filter((tag) => !existingAuto.has(tag))

    if (missing.length > 0) {
      await prisma.carTag.createMany({
        data: missing.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
      })
      totalInserted += missing.length
      console.log(`  ${entry.car.year} ${entry.car.make} ${entry.car.model}: +${missing.join(', ')}`)
    }
  }

  console.log(`\nDone — inserted ${totalInserted} auto tag(s) across ${entries.length} car(s)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
