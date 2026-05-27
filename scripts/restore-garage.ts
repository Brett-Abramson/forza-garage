/**
 * Restores a saved garage list into Neon for a given Clerk userId.
 *
 * Usage:
 *   npx tsx scripts/restore-garage.ts <clerkUserId>
 *
 * Example:
 *   npx tsx scripts/restore-garage.ts user_abc123
 */

import { PrismaClient } from '@prisma/client'
import { getAutoTags } from '../src/lib/autotags'

const prisma = new PrismaClient()

const GARAGE_CARS = [
  { year: 2022, make: 'Acura',         model: 'NSX Type S' },
  { year: 2002, make: 'Acura',         model: 'RSX Type S' },
  { year: 2016, make: 'Ariel',         model: 'Nomad' },
  { year: 2011, make: 'Audi',          model: 'RS 3 Sportback' },
  { year: 2009, make: 'Audi',          model: 'RS 6' },
  { year: 1993, make: 'Autozam',       model: 'AZ-1' },
  { year: 1981, make: 'BMW',           model: 'M1' },
  { year: 2020, make: 'BMW',           model: 'M2 Competition Coupé' },
  { year: 1997, make: 'BMW',           model: 'M3' },
  { year: 2019, make: 'BMW',           model: 'Z4 Roadster' },
  { year: 2024, make: 'Chevrolet',     model: 'Corvette E-Ray' },
  { year: 2015, make: 'Chevrolet',     model: 'Corvette Z06' },
  { year: 1964, make: 'Chevrolet',     model: 'Impala Super Sport 409' },
  { year: 2021, make: 'Dodge',         model: 'Durango SRT Hellcat' },
  { year: 1967, make: 'Ferrari',       model: '#24  Spa 330 P4' },
  { year: 2022, make: 'Ferrari',       model: '296 GTB' },
  { year: 2017, make: 'Ford',          model: 'Focus RS' },
  { year: 1969, make: 'Ford',          model: 'Mustang Boss 302' },
  { year: 2024, make: 'Ford',          model: 'Mustang Dark Horse' },
  { year: 2013, make: 'Ford',          model: 'Mustang Shelby GT500' },
  { year: 1985, make: 'Ford',          model: 'RS200 Evolution' },
  { year: 1987, make: 'Ford',          model: 'Sierra Cosworth RS500' },
  { year: 2007, make: 'Formula Drift', model: '#117 599 GTB Fiorano' },
  { year: 1997, make: 'Formula Drift', model: '#777 Nissan 240SX' },
  { year: 1970, make: 'GMC',           model: 'Jimmy' },
  { year: 1991, make: 'Honda',         model: 'Beat' },
  { year: 1984, make: 'Honda',         model: 'City E II' },
  { year: 1997, make: 'Honda',         model: 'Civic Type R' },
  { year: 2023, make: 'Honda',         model: 'Civic Type R' },
  { year: 2005, make: 'Honda',         model: 'NSX-R' },
  { year: 2024, make: 'Lamborghini',   model: 'Revuelto' },
  { year: 2015, make: 'Land Rover',    model: 'Range Rover Sport SVR' },
  { year: 1986, make: 'MG',            model: 'Metro 6R4' },
  { year: 1997, make: 'Maserati',      model: 'Ghibli Cup' },
  { year: 2021, make: 'McLaren',       model: 'Sabre' },
  { year: 2021, make: 'Mercedes-AMG',  model: 'ONE' },
  { year: 1995, make: 'Mitsubishi',    model: 'Eclipse GSX' },
  { year: 2001, make: 'Mitsubishi',    model: 'Lancer Evolution VI GSR TM Edition' },
  { year: 2008, make: 'Mitsubishi',    model: 'Lancer Evolution X GSR' },
  { year: 2003, make: 'Nissan',        model: 'Fairlady Z' },
  { year: 2012, make: 'Nissan',        model: 'GT-R Black Edition (R35) Forza Edition' },
  { year: 1985, make: 'Nissan',        model: 'Safari Turbo' },
  { year: 1989, make: 'Nissan',        model: "Silvia K's" },
  { year: 1984, make: 'Peugeot',       model: '205 Turbo 16' },
  { year: 2007, make: 'Peugeot',       model: '207 Super 2000' },
  { year: 1985, make: 'Porsche',       model: '#185 959 Prodrive Rally Raid' },
  { year: 2024, make: 'Ram',           model: '1500 TRX' },
  { year: 2022, make: 'Subaru',        model: 'BRZ Forza Edition' },
  { year: 1998, make: 'Subaru',        model: 'Impreza 22B-STi Version' },
  { year: 2008, make: 'Subaru',        model: 'Impreza WRX STI' },
  { year: 1969, make: 'Toyota',        model: '2000GT' },
  { year: 1999, make: 'Toyota',        model: 'Altezza RS200 Z Edition' },
  { year: 1994, make: 'Toyota',        model: 'Celica GT-Four ST205' },
  { year: 2005, make: 'Toyota',        model: 'Crown Super Deluxe Taxi' },
  { year: 2020, make: 'Toyota',        model: 'GR Supra' },
  { year: 2022, make: 'Toyota',        model: 'GR86' },
  { year: 1989, make: 'Toyota',        model: 'MR2 SC' },
  { year: 1998, make: 'Toyota',        model: 'Supra RZ' },
  { year: 1983, make: 'Volvo',         model: '242 Turbo Evolution' },
]

async function main() {
  const userId = process.argv[2]
  const fixTags = process.argv.includes('--fix-tags')
  if (!userId) {
    console.error('Usage: npx tsx scripts/restore-garage.ts <clerkUserId> [--fix-tags]')
    process.exit(1)
  }

  console.log(`Restoring ${GARAGE_CARS.length} cars for user ${userId}...`)

  let found = 0
  let missing = 0
  let skipped = 0
  let tagFixed = 0

  for (const { year, make, model } of GARAGE_CARS) {
    const car = await prisma.car.findFirst({ where: { year, make, model } })
    if (!car) {
      console.warn(`  ⚠ Not found in DB: ${year} ${make} ${model}`)
      missing++
      continue
    }

    const existing = await prisma.userGarage.findUnique({
      where: { userId_carId: { userId, carId: car.id } },
      include: { tags: { where: { source: 'auto' } } },
    })
    if (existing) {
      // Backfill missing auto-tags for already-owned cars
      if (fixTags && existing.tags.length === 0) {
        const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
        if (autoTags.length > 0) {
          await prisma.carTag.createMany({
            data: autoTags.map((tag) => ({ userGarageId: existing.id, tag, source: 'auto' })),
          })
          console.log(`  ↻ Fixed tags: ${year} ${make} ${model}`)
          tagFixed++
        }
      }
      skipped++
      continue
    }

    const entry = await prisma.userGarage.create({ data: { userId, carId: car.id } })
    const autoTags = getAutoTags(car.division, car.drivetrain ?? undefined)
    if (autoTags.length > 0) {
      await prisma.carTag.createMany({
        data: autoTags.map((tag) => ({ userGarageId: entry.id, tag, source: 'auto' })),
      })
    }
    console.log(`  ✓ ${year} ${make} ${model}`)
    found++
  }

  console.log(`\nDone. Added: ${found}, Already owned: ${skipped}, Tags fixed: ${tagFixed}, Not in DB: ${missing}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
