import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const META_ROWS = [
  {
    year: 1991, make: 'Mazda', model: '#55 Mazda 787B',
    piClass: 'R', raceType: 'Road Racing', rank: 1,
    label: 'Leaderboard King',
    notes: 'The most-picked car across R and S2 road circuits. A Le Mans prototype that dominates every track type in FH6.',
    source: 'forza.guide/meta',
  },
  {
    year: 2018, make: 'Lotus', model: 'Scura Motorsports Exige WTAC',
    piClass: 'R', raceType: 'Road Racing', rank: 2,
    label: 'R Class Specialist',
    notes: 'The #2 R class pick. Lighter and more technical than the 787B — dominant on tight technical circuits.',
    source: 'forza.guide/meta',
  },
  {
    year: 2021, make: 'McLaren', model: '620R',
    piClass: 'S1', raceType: 'Road Racing', rank: 1,
    label: 'S1 Standard',
    notes: 'The top S1 pick for road racing. Consistent across sprints, circuits, and everything between.',
    source: 'forza.guide/meta',
  },
  {
    year: 2008, make: 'Dodge', model: 'Viper SRT-10 ACR',
    piClass: 'S1', raceType: 'Road Racing', rank: 2,
    label: 'S1 Bruiser',
    notes: 'Raw American power in the top 5 of nearly every S1 road circuit. Unforgiving but fast when tuned.',
    source: 'forza.guide/meta',
  },
  {
    year: 2005, make: 'Ford', model: 'GT',
    piClass: 'A', raceType: 'Road Racing', rank: 1,
    label: 'A Class Benchmark',
    notes: 'The #1 A class road pick across multiple circuits. One of the best performance-per-credit cars at the Autoshow.',
    source: 'forza.guide/meta',
  },
  {
    year: 1991, make: 'Honda', model: 'Beat',
    piClass: 'B', raceType: 'Road Racing', rank: 1,
    label: 'The Meta Surprise',
    notes: 'A Japanese kei car that tops A and B class road leaderboards. The most unexpected competitive pick in FH6.',
    source: 'forza.guide/meta',
  },
  {
    year: 2001, make: 'Acura', model: 'Integra Type R',
    piClass: 'C', raceType: 'Road Racing', rank: 1,
    label: 'C Class Standard',
    notes: 'The #1 C class pick. Consistent, accessible, and competitive on every road circuit in the game.',
    source: 'forza.guide/meta',
  },
  {
    year: 1962, make: 'Peel', model: 'P50',
    piClass: 'D', raceType: 'Road Racing', rank: 1,
    label: 'Tiny Terror',
    notes: 'The #1 D class pick. A three-wheeled microcar that somehow tops leaderboards. Unlocked via Trolli promo code.',
    source: 'forza.guide/meta',
  },
  {
    year: 2014, make: 'Mercedes-Benz', model: 'G 63 AMG 6x6',
    piClass: 'C', raceType: 'Cross Country', rank: 1,
    label: 'Offroad Beast',
    notes: "Best offroad stat in C class. A six-wheeled cross country threat that's legitimately competitive on loose terrain.",
    source: 'forza.guide/meta',
  },
]

async function main() {
  let matched = 0
  let skipped = 0

  for (const row of META_ROWS) {
    const car = await prisma.car.findFirst({
      where: { year: row.year, make: row.make, model: row.model },
      select: { id: true },
    })

    if (!car) {
      console.warn(`SKIP — not found: ${row.year} ${row.make} ${row.model}`)
      skipped++
      continue
    }

    await prisma.carMeta.create({
      data: {
        carId: car.id,
        piClass: row.piClass,
        raceType: row.raceType,
        rank: row.rank ?? null,
        label: row.label,
        notes: row.notes ?? null,
        source: row.source,
        active: true,
      },
    })

    console.log(`OK  — ${row.year} ${row.make} ${row.model} → carId ${car.id}`)
    matched++
  }

  console.log(`\nDone: ${matched} inserted, ${skipped} skipped.`)

  const activeCount = await prisma.carMeta.count({ where: { active: true } })
  console.log(`Active CarMeta rows: ${activeCount}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
