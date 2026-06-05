#!/usr/bin/env node
/**
 * upsert_cars.js — Safe car data import from CSV
 *
 * Usage:
 *   node prisma/upsert_cars.js [path/to/cars.csv]
 *
 * Match key:  year + make + model  (never touches Car.id)
 *
 * On match:   updates piClass, piRating, division, country, value,
 *             rarity, source, sourceInfo.
 *             Detects division changes and invalidates auto-tags for
 *             affected garage entries.
 *
 * No match:   inserts a new Car row with all CSV fields.
 *
 * Safety:     entire operation runs inside a single transaction.
 *             Any failure rolls back completely — no partial updates.
 *
 * Never touches:
 *   - Car.id (identity key)
 *   - drivetrain, engineType, engineCC, cylinders, bodyStyle,
 *     stat*, powerHp, torqueFtLb, weightLb, frontWeight, displacementL
 *     (filled in separately, not present in this CSV)
 *   - UserGarage, CarTag with source:'user'  (user data, never touched)
 */

const { PrismaClient } = require('@prisma/client')
const { readFileSync } = require('fs')
const { join } = require('path')

const prisma = new PrismaClient()

// ─── RFC 4180 CSV parser ──────────────────────────────────────────────────────

function parseCSV(content) {
  const rows = []
  // Normalise Windows line endings
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  for (const line of lines) {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Empty string / undefined → null for nullable DB fields */
function ns(val) {
  return (val === '' || val === undefined || val === null) ? null : String(val)
}

/** Parse credit value: "25,000" → 25000, blank → null */
function parseValue(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.replace(/,/g, ''), 10)
  return isNaN(n) ? null : n
}

/** Split "B 540" into { piClass: "B", piRating: 540 } */
function parseClass(raw) {
  const [piClass, piRatingStr] = (raw || '').split(' ')
  return { piClass: piClass || null, piRating: parseInt(piRatingStr) || null }
}

/** Lookup key for a car row */
function key(year, make, model) {
  return `${year}|${make}|${model}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2] ?? join(__dirname, 'fh6-cars.csv')

  console.log(`Reading CSV: ${csvPath}`)
  const csv = readFileSync(csvPath, 'utf-8')
  const [_header, ...rows] = parseCSV(csv)

  // Parse every CSV row upfront so we validate before touching the DB
  const csvCars = []
  const parseErrors = []

  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i]
    // CSV columns: Year, Make, Model, Class, Type (division), Country,
    //              Value (Cr), Rarity, Source, Source Info
    const [yearStr, make, model, classField, division, country,
           valueStr, rarity, source, sourceInfo] = cols

    const year = parseInt(yearStr)
    const { piClass, piRating } = parseClass(classField)

    if (!year || isNaN(year) || !make || !model) {
      parseErrors.push(`Row ${i + 2}: missing required field (year=${yearStr}, make=${make}, model=${model})`)
      continue
    }
    if (!piClass || !piRating) {
      parseErrors.push(`Row ${i + 2}: invalid class field "${classField}" for ${year} ${make} ${model}`)
      continue
    }

    csvCars.push({
      year,
      make:       make.trim(),
      model:      model.trim(),
      piClass:    piClass.trim(),
      piRating,
      division:   division?.trim() || '',
      country:    country?.trim() || '',
      value:      parseValue(valueStr),
      rarity:     ns(rarity),
      source:     ns(source) ?? '',
      sourceInfo: ns(sourceInfo),
    })
  }

  if (parseErrors.length > 0) {
    console.error('\nCSV parse errors (aborting):')
    parseErrors.forEach(e => console.error(' ', e))
    process.exit(1)
  }

  console.log(`Parsed ${csvCars.length} cars from CSV.\n`)

  // ── Run everything in a single transaction ──────────────────────────────────
  const summary = await prisma.$transaction(async (tx) => {
    // Load all existing cars for comparison (no UserGarage data touched)
    const existing = await tx.car.findMany({
      select: {
        id: true, year: true, make: true, model: true,
        piClass: true, piRating: true, division: true, country: true,
        value: true, rarity: true, source: true, sourceInfo: true,
        drivetrain: true,
      },
    })

    const dbMap = new Map()
    for (const car of existing) {
      dbMap.set(key(car.year, car.make, car.model), car)
    }

    const updatedCars   = []   // { label, changes }
    const insertedCars  = []   // { year, make, model }
    const unchangedIds  = []   // just for counting
    const divChangedIds = []   // car IDs whose division or drivetrain changed

    for (const csv of csvCars) {
      const k = key(csv.year, csv.make, csv.model)
      const db = dbMap.get(k)

      if (!db) {
        // ── Insert new car ────────────────────────────────────────────────────
        await tx.car.create({
          data: {
            year:       csv.year,
            make:       csv.make,
            model:      csv.model,
            piClass:    csv.piClass,
            piRating:   csv.piRating,
            division:   csv.division,
            country:    csv.country,
            value:      csv.value,
            rarity:     csv.rarity,
            source:     csv.source,
            sourceInfo: csv.sourceInfo,
          },
        })
        insertedCars.push({ year: csv.year, make: csv.make, model: csv.model })
        continue
      }

      // ── Compare fields ────────────────────────────────────────────────────
      const changes = {}
      const DATA_FIELDS = [
        ['piClass',    csv.piClass,    db.piClass],
        ['piRating',   csv.piRating,   db.piRating],
        ['division',   csv.division,   db.division],
        ['country',    csv.country,    db.country],
        ['value',      csv.value,      db.value],
        ['rarity',     csv.rarity,     db.rarity],
        ['source',     csv.source,     db.source],
        ['sourceInfo', csv.sourceInfo, db.sourceInfo],
      ]

      for (const [field, newVal, oldVal] of DATA_FIELDS) {
        // Normalise null vs '' for comparison
        const n = newVal === '' ? null : newVal
        const o = oldVal === '' ? null : oldVal
        if (n !== o) changes[field] = { from: o, to: n }
      }

      if (Object.keys(changes).length === 0) {
        unchangedIds.push(db.id)
        continue
      }

      // ── Update ────────────────────────────────────────────────────────────
      await tx.car.update({
        where: { id: db.id },
        data: {
          piClass:    csv.piClass,
          piRating:   csv.piRating,
          division:   csv.division,
          country:    csv.country,
          value:      csv.value,
          rarity:     csv.rarity,
          source:     csv.source,
          sourceInfo: csv.sourceInfo,
        },
      })

      const label = `${csv.year} ${csv.make} ${csv.model}`
      updatedCars.push({ id: db.id, label, changes })

      // Flag division / drivetrain changes for auto-tag invalidation
      if (changes.division || changes.drivetrain) {
        divChangedIds.push(db.id)
      }

      continue
    }

    // ── Invalidate auto-tags for division-changed cars ────────────────────────
    let invalidatedCount = 0
    if (divChangedIds.length > 0) {
      const garageEntries = await tx.userGarage.findMany({
        where: { carId: { in: divChangedIds } },
        select: { id: true },
      })
      if (garageEntries.length > 0) {
        const garageIds = garageEntries.map(e => e.id)
        const result = await tx.carTag.deleteMany({
          where: { userGarageId: { in: garageIds }, source: 'auto' },
        })
        invalidatedCount = result.count
      }
    }

    return { updatedCars, insertedCars, unchangedCount: unchangedIds.length, divChangedIds, invalidatedCount }
  })

  // ── Summary output ────────────────────────────────────────────────────────
  const { updatedCars, insertedCars, unchangedCount, divChangedIds, invalidatedCount } = summary

  if (updatedCars.length > 0) {
    console.log(`\nUpdated ${updatedCars.length} cars:`)
    for (const { label, changes } of updatedCars) {
      const changesStr = Object.entries(changes)
        .map(([f, { from: o, to: n }]) => {
          if (f === 'division' || f === 'drivetrain') {
            return `  Division changed: ${label}: ${o} → ${n}`
          }
          return `  ${label}: ${f} ${o} → ${n}`
        })
        .join('\n')
      console.log(changesStr)
    }
  }

  if (insertedCars.length > 0) {
    console.log(`\nInserted ${insertedCars.length} new cars:`)
    for (const { year, make, model } of insertedCars) {
      console.log(`  + ${year} ${make} ${model}`)
    }
  }

  if (divChangedIds.length > 0) {
    console.log(`\nDivision/drivetrain changes detected for ${divChangedIds.length} car(s) — review above.`)
    console.log(`Auto-tags for ${invalidatedCount} CarTag row(s) deleted.`)
    console.log('Affected users will have fresh auto-tags applied on next garage load.')
  }

  console.log('\n─────────────────────────────────')
  console.log(`Updated:              ${updatedCars.length} cars`)
  console.log(`Unchanged:            ${unchangedCount} cars`)
  console.log(`Inserted:             ${insertedCars.length} new cars`)
  console.log(`Auto-tags invalidated: ${invalidatedCount} CarTag rows (${divChangedIds.length} car(s) changed division/drivetrain)`)
  console.log('─────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('\nFatal error — transaction rolled back:')
    console.error(e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
