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

async function main() {
  const csv = readFileSync(join(__dirname, 'fh6-cars.csv'), 'utf-8')
  const [_header, ...rows] = parseCSV(csv)

  const carData = rows.map((cols) => {
    const [year, make, model, classField, division, country, valueStr, rarity, source, sourceInfo] = cols
    const [piClass, piRatingStr] = classField.split(' ')
    const valueRaw = valueStr ? parseInt(valueStr.replace(/,/g, '')) : null
    return {
      year: parseInt(year),
      make,
      model,
      piClass,
      piRating: parseInt(piRatingStr),
      division,
      country,
      value: isNaN(valueRaw!) ? null : valueRaw,
      rarity: rarity || null,
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
  for (const car of carData) {
    await prisma.car.upsert({
      where: { year_make_model: { year: car.year, make: car.make, model: car.model } },
      update: {
        piClass: car.piClass,
        piRating: car.piRating,
        division: car.division,
        country: car.country,
        value: car.value,
        rarity: car.rarity,
        source: car.source,
        sourceInfo: car.sourceInfo,
      },
      create: car,
    })
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
