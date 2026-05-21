import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  for (const line of content.split('\n')) {
    if (!line.trim()) continue
    const fields: string[] = []
    let field = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        fields.push(field.trim())
        field = ''
      } else {
        field += ch
      }
    }
    fields.push(field.trim())
    rows.push(fields)
  }
  return rows
}

const STARTER_CARS = [
  { year: 1989, make: 'Nissan',  model: "Silvia K's" },
  { year: 1994, make: 'Toyota',  model: 'Celica GT-Four ST205' },
  { year: 1970, make: 'GMC',     model: 'Jimmy' },
]

async function main() {
  const csv = readFileSync(join(__dirname, 'fh6-cars.csv'), 'utf-8')
  const [_header, ...rows] = parseCSV(csv)

  const carData = rows.map((cols) => {
    const [year, make, model, classField, division, country, source, sourceInfo] = cols
    const [piClass, piRatingStr] = classField.split(' ')
    return {
      year: parseInt(year),
      make,
      model,
      piClass,
      piRating: parseInt(piRatingStr),
      division,
      country,
      source,
      sourceInfo: sourceInfo || null,
      // Not in CSV yet
      drivetrain: null,
      engineType: null,
      engineCC: null,
      cylinders: null,
      bodyStyle: null,
    }
  })

  console.log(`Seeding ${carData.length} FH6 cars...`)
  await prisma.carTag.deleteMany()
  await prisma.userGarage.deleteMany()
  await prisma.car.deleteMany()
  await prisma.car.createMany({ data: carData })

  // Seed starter cars into UserGarage
  for (const starter of STARTER_CARS) {
    const car = await prisma.car.findFirst({
      where: { year: starter.year, make: starter.make, model: starter.model },
    })
    if (car) {
      await prisma.userGarage.create({ data: { carId: car.id } })
    } else {
      console.warn(`Starter car not found: ${starter.year} ${starter.make} ${starter.model}`)
    }
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
