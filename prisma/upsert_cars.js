#!/usr/bin/env node
// Usage: node prisma/upsert_cars.js [path/to/cars.csv]
// Upserts cars from CSV on (year, make, model). Never touches UserGarage data.

const { PrismaClient } = require('@prisma/client')
const { readFileSync } = require('fs')
const { join } = require('path')

const prisma = new PrismaClient()

function parseCSV(content) {
  const rows = []
  for (const line of content.split('\n')) {
    if (!line.trim()) continue
    const fields = []
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
  const csvPath = process.argv[2] ?? join(__dirname, 'fh6-cars.csv')
  const csv = readFileSync(csvPath, 'utf-8')
  const [_header, ...rows] = parseCSV(csv)

  let upserted = 0
  let skipped = 0

  for (const cols of rows) {
    const [year, make, model, classField, division, country, valueStr, rarity, source, sourceInfo] = cols
    const [piClass, piRatingStr] = classField.split(' ')
    const piRating = parseInt(piRatingStr)
    const value = valueStr ? parseInt(valueStr.replace(/,/g, '')) || null : null

    if (!year || !make || !model) { skipped++; continue }

    await prisma.car.upsert({
      where: { year_make_model: { year: parseInt(year), make, model } },
      update: {
        piClass,
        piRating,
        division,
        country,
        value,
        rarity: rarity || null,
        source,
        sourceInfo: sourceInfo || null,
      },
      create: {
        year: parseInt(year),
        make,
        model,
        piClass,
        piRating,
        division,
        country,
        value,
        rarity: rarity || null,
        source,
        sourceInfo: sourceInfo || null,
      },
    })
    upserted++
  }

  console.log(`Done. ${upserted} cars upserted, ${skipped} rows skipped.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
