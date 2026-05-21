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

function isStarter(year: number, make: string, model: string) {
  return STARTER_CARS.some(
    (s) => s.year === year && s.make === make && s.model === model
  )
}

async function main() {
  const csv = readFileSync(join(__dirname, 'fh6-cars.csv'), 'utf-8')
  const [_header, ...rows] = parseCSV(csv)

  const cars = rows.map((cols) => {
    const [year, make, model, classField, division, country, source, sourceInfo] = cols
    const [piClass, piRatingStr] = classField.split(' ')
    const yearInt = parseInt(year)
    return {
      year: yearInt,
      make,
      model,
      piClass,
      piRating: parseInt(piRatingStr),
      division,
      country,
      source,
      sourceInfo: sourceInfo || null,
      owned: isStarter(yearInt, make, model),
      // Not in CSV yet
      drivetrain: null,
      engineType: null,
      engineCC: null,
      cylinders: null,
      bodyStyle: null,
    }
  })

  console.log(`Seeding ${cars.length} FH6 cars...`)
  await prisma.car.deleteMany()
  await prisma.car.createMany({ data: cars })
  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
