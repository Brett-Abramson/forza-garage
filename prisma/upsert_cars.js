#!/usr/bin/env node
/**
 * upsert_cars.js — Safe car data import from both CSVs in a single pass
 *
 * Usage:
 *   node prisma/upsert_cars.js
 *
 * Reads:
 *   prisma/fh6-cars.csv          → piClass, piRating, division, country,
 *                                   value, rarity, source, sourceInfo
 *   prisma/scraped_car_stats.csv → drivetrain, powerHp, torqueFtLb, weightLb,
 *                                   displacementL, frontWeight, statSpeed,
 *                                   statHandling, statAcceleration, statLaunch,
 *                                   statBraking, statOffroad
 *
 * Both CSVs are joined on  year + make + model  before the DB is touched.
 *
 * On match:   updates all fields from both CSVs in a single operation.
 *             Null handling: never overwrites an existing non-null value
 *             with null — if a scraped field is missing, the existing DB
 *             value is preserved.
 *             Detects division/drivetrain changes and invalidates auto-tags
 *             for affected garage entries.
 *
 * No match:   inserts a new Car row with all available fields.
 *
 * Safety:     entire operation runs inside a single transaction.
 *             Any failure rolls back completely — no partial updates.
 *
 * Never touches:
 *   - Car.id (identity key)
 *   - engineType, engineCC, cylinders, bodyStyle  (not in either CSV)
 *   - UserGarage rows, CarTag with source:'user'  (user data, never touched)
 */

const { PrismaClient } = require('@prisma/client')
const { readFileSync } = require('fs')
const { join } = require('path')

const prisma = new PrismaClient()

// ─── RFC 4180 CSV parser ──────────────────────────────────────────────────────

function parseCSV(content) {
  const rows = []
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

// ─── Parsers ──────────────────────────────────────────────────────────────────

/** Empty string / undefined / null → null */
function ns(val) {
  return (val === '' || val === undefined || val === null) ? null : String(val)
}

/** "25,000" → 25000, blank → null */
function parseCredits(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.replace(/,/g, ''), 10)
  return isNaN(n) ? null : n
}

/** "B 540" → { piClass: "B", piRating: 540 } */
function parseClass(raw) {
  const [piClass, piRatingStr] = (raw || '').split(' ')
  return { piClass: piClass || null, piRating: parseInt(piRatingStr) || null }
}

/** "28 HP" → 28, blank → null */
function parseHP(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.replace(/ HP$/i, '').trim(), 10)
  return isNaN(n) ? null : n
}

/** "34 LB-FT" → 34, blank → null */
function parseLbFt(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.replace(/ LB-FT$/i, '').trim(), 10)
  return isNaN(n) ? null : n
}

/** "1,257 LBS" → 1257, blank → null */
function parseLbs(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.replace(/,/g, '').replace(/ LBS$/i, '').trim(), 10)
  return isNaN(n) ? null : n
}

/** "0.59L" / "2L" → 0.59 / 2.0, blank → null */
function parseDisplacement(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseFloat(raw.replace(/L$/i, '').trim())
  return isNaN(n) ? null : n
}

/** "42%" → 42, blank → null */
function parseFrontPct(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.replace(/%$/, '').trim(), 10)
  return isNaN(n) ? null : n
}

/** "3.8" → 3.8, blank → null */
function parseStat(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseFloat(raw.trim())
  return isNaN(n) ? null : n
}

/** Lookup key for a car row */
function key(year, make, model) {
  return `${year}|${make}|${model}`
}

// ─── Stat field list (drivetrain + all numeric scraped fields) ─────────────────

const STAT_FIELDS = [
  'drivetrain',
  'powerHp', 'torqueFtLb', 'weightLb', 'displacementL', 'frontWeight',
  'statSpeed', 'statHandling', 'statAcceleration',
  'statLaunch', 'statBraking', 'statOffroad',
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mainCsvPath  = join(__dirname, 'fh6-cars.csv')
  const statsCsvPath = join(__dirname, 'scraped_car_stats.csv')

  // ── Parse fh6-cars.csv ───────────────────────────────────────────────────
  console.log(`Reading: ${mainCsvPath}`)
  const [_mHeader, ...mainRows] = parseCSV(readFileSync(mainCsvPath, 'utf-8'))

  const csvCars    = []
  const parseErrors = []

  for (let i = 0; i < mainRows.length; i++) {
    const cols = mainRows[i]
    // Columns: Year, Make, Model, Class, Type, Country, Value (Cr), Rarity, Source, Source Info
    const [yearStr, make, model, classField, division, country,
           valueStr, rarity, source, sourceInfo] = cols

    const year = parseInt(yearStr)
    const { piClass, piRating } = parseClass(classField)

    if (!year || isNaN(year) || !make || !model) {
      parseErrors.push(`fh6-cars.csv row ${i + 2}: missing required field (year=${yearStr}, make=${make}, model=${model})`)
      continue
    }
    if (!piClass || !piRating) {
      parseErrors.push(`fh6-cars.csv row ${i + 2}: invalid class "${classField}" for ${year} ${make} ${model}`)
      continue
    }

    csvCars.push({
      year,
      make:       make.trim(),
      model:      model.trim(),
      piClass:    piClass.trim(),
      piRating,
      division:   division?.trim() || '',
      country:    country?.trim()  || '',
      value:      parseCredits(valueStr),
      rarity:     ns(rarity),
      source:     ns(source) ?? '',
      sourceInfo: ns(sourceInfo),
    })
  }

  // ── Parse scraped_car_stats.csv ───────────────────────────────────────────
  console.log(`Reading: ${statsCsvPath}`)
  const [_sHeader, ...statsRows] = parseCSV(readFileSync(statsCsvPath, 'utf-8'))

  const statsMap = new Map()
  for (let i = 0; i < statsRows.length; i++) {
    const cols = statsRows[i]
    // Columns: Year, Make, Model, Drivetrain, Power, Torque, Weight,
    //          Displacement, Front %, Speed, Handling, Acceleration,
    //          Launch, Braking, Offroad
    const [yearStr, make, model, drivetrain, power, torque, weight,
           displacement, frontPct, speed, handling, accel, launch, braking, offroad] = cols

    const year = parseInt(yearStr)
    if (!year || !make || !model) {
      parseErrors.push(`scraped_car_stats.csv row ${i + 2}: missing required field`)
      continue
    }

    statsMap.set(key(year, make.trim(), model.trim()), {
      drivetrain:       ns(drivetrain),
      powerHp:          parseHP(power),
      torqueFtLb:       parseLbFt(torque),
      weightLb:         parseLbs(weight),
      displacementL:    parseDisplacement(displacement),
      frontWeight:      parseFrontPct(frontPct),
      statSpeed:        parseStat(speed),
      statHandling:     parseStat(handling),
      statAcceleration: parseStat(accel),
      statLaunch:       parseStat(launch),
      statBraking:      parseStat(braking),
      statOffroad:      parseStat(offroad),
    })
  }

  if (parseErrors.length > 0) {
    console.error('\nCSV parse errors (aborting):')
    parseErrors.forEach(e => console.error(' ', e))
    process.exit(1)
  }

  console.log(`Parsed ${csvCars.length} cars from fh6-cars.csv.`)
  console.log(`Parsed ${statsMap.size} rows from scraped_car_stats.csv.\n`)

  const noStats = csvCars.filter(c => !statsMap.has(key(c.year, c.make, c.model)))
  if (noStats.length > 0) {
    console.log(`Note: ${noStats.length} car(s) have no matching stat row — stat fields left unchanged for those cars.`)
  }

  // ── Single transaction ────────────────────────────────────────────────────
  const summary = await prisma.$transaction(async (tx) => {
    // Load all existing cars with every field we might compare or preserve
    const existing = await tx.car.findMany({
      select: {
        id: true, year: true, make: true, model: true,
        piClass: true, piRating: true, division: true, country: true,
        value: true, rarity: true, source: true, sourceInfo: true,
        drivetrain: true,
        powerHp: true, torqueFtLb: true, weightLb: true,
        displacementL: true, frontWeight: true,
        statSpeed: true, statHandling: true, statAcceleration: true,
        statLaunch: true, statBraking: true, statOffroad: true,
      },
    })

    const dbMap = new Map()
    for (const car of existing) {
      dbMap.set(key(car.year, car.make, car.model), car)
    }

    const updatedCars   = []   // { label, changes }
    const insertedCars  = []   // { year, make, model }
    const unchangedIds  = []
    const divChangedIds = []   // car IDs whose division or drivetrain changed
    let statFieldsNewlyPopulated = 0  // null → non-null transitions
    let statFieldsAlreadyPresent = 0  // non-null in both CSV and DB

    for (const csv of csvCars) {
      const k     = key(csv.year, csv.make, csv.model)
      const db    = dbMap.get(k)
      const stats = statsMap.get(k) ?? {}

      if (!db) {
        // ── Insert ──────────────────────────────────────────────────────────
        await tx.car.create({
          data: {
            year:             csv.year,
            make:             csv.make,
            model:            csv.model,
            piClass:          csv.piClass,
            piRating:         csv.piRating,
            division:         csv.division,
            country:          csv.country,
            value:            csv.value,
            rarity:           csv.rarity,
            source:           csv.source,
            sourceInfo:       csv.sourceInfo,
            drivetrain:       stats.drivetrain       ?? null,
            powerHp:          stats.powerHp          ?? null,
            torqueFtLb:       stats.torqueFtLb       ?? null,
            weightLb:         stats.weightLb         ?? null,
            displacementL:    stats.displacementL    ?? null,
            frontWeight:      stats.frontWeight      ?? null,
            statSpeed:        stats.statSpeed        ?? null,
            statHandling:     stats.statHandling     ?? null,
            statAcceleration: stats.statAcceleration ?? null,
            statLaunch:       stats.statLaunch       ?? null,
            statBraking:      stats.statBraking      ?? null,
            statOffroad:      stats.statOffroad      ?? null,
          },
        })
        insertedCars.push({ year: csv.year, make: csv.make, model: csv.model })
        continue
      }

      // ── Resolve stat fields: new value if non-null, else keep existing ────
      // This is the COALESCE rule — never overwrite a real value with null.
      const resolvedStats = {}
      for (const field of STAT_FIELDS) {
        const newVal = stats[field] ?? null
        const oldVal = db[field]   ?? null
        resolvedStats[field] = newVal !== null ? newVal : oldVal

        if (newVal !== null && oldVal === null) statFieldsNewlyPopulated++
        else if (newVal !== null && oldVal !== null) statFieldsAlreadyPresent++
      }

      // ── Detect changes ────────────────────────────────────────────────────
      const changes = {}

      const CORE_FIELDS = [
        ['piClass',    csv.piClass,    db.piClass],
        ['piRating',   csv.piRating,   db.piRating],
        ['division',   csv.division,   db.division],
        ['country',    csv.country,    db.country],
        ['value',      csv.value,      db.value],
        ['rarity',     csv.rarity,     db.rarity],
        ['source',     csv.source,     db.source],
        ['sourceInfo', csv.sourceInfo, db.sourceInfo],
      ]
      for (const [field, newVal, oldVal] of CORE_FIELDS) {
        const n = newVal === '' ? null : newVal
        const o = oldVal === '' ? null : oldVal
        if (n !== o) changes[field] = { from: o, to: n }
      }
      for (const field of STAT_FIELDS) {
        const n = resolvedStats[field]
        const o = db[field] ?? null
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
          ...resolvedStats,
        },
      })

      const label = `${csv.year} ${csv.make} ${csv.model}`
      updatedCars.push({ id: db.id, label, changes })

      if (changes.division || changes.drivetrain) {
        divChangedIds.push(db.id)
      }
    }

    // ── Invalidate auto-tags for cars whose division or drivetrain changed ───
    let invalidatedCount = 0
    if (divChangedIds.length > 0) {
      const garageEntries = await tx.userGarage.findMany({
        where:  { carId: { in: divChangedIds } },
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

    return {
      updatedCars, insertedCars,
      unchangedCount: unchangedIds.length,
      divChangedIds, invalidatedCount,
      statFieldsNewlyPopulated, statFieldsAlreadyPresent,
    }
  })

  // ── Output ────────────────────────────────────────────────────────────────
  const {
    updatedCars, insertedCars, unchangedCount,
    divChangedIds, invalidatedCount,
    statFieldsNewlyPopulated, statFieldsAlreadyPresent,
  } = summary

  if (updatedCars.length > 0) {
    console.log(`\nUpdated ${updatedCars.length} car(s):`)
    for (const { label, changes } of updatedCars) {
      for (const [f, { from: o, to: n }] of Object.entries(changes)) {
        if (f === 'division' || f === 'drivetrain') {
          console.log(`  ⚠ ${f} changed: ${label}: ${o} → ${n}`)
        } else {
          console.log(`  ${label}: ${f}  ${o} → ${n}`)
        }
      }
    }
  }

  if (insertedCars.length > 0) {
    console.log(`\nInserted ${insertedCars.length} new car(s):`)
    for (const { year, make, model } of insertedCars) {
      console.log(`  + ${year} ${make} ${model}`)
    }
  }

  if (divChangedIds.length > 0) {
    console.log(`\n⚠ Division/drivetrain changes detected for ${divChangedIds.length} car(s) — review above.`)
    console.log(`  Auto-tags for ${invalidatedCount} CarTag row(s) deleted.`)
    console.log('  Affected users will have fresh auto-tags applied on next garage load.')
  }

  console.log('\n──────────────────────────────────────────────────────')
  console.log(`Updated:               ${updatedCars.length} cars`)
  console.log(`Unchanged:             ${unchangedCount} cars`)
  console.log(`Inserted:              ${insertedCars.length} new cars`)
  console.log(`Auto-tags invalidated: ${invalidatedCount} CarTag rows (${divChangedIds.length} car(s) changed division/drivetrain)`)
  console.log(`Stat fields populated: ${statFieldsNewlyPopulated} newly filled, ${statFieldsAlreadyPresent} already present`)
  console.log('──────────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('\nFatal error — transaction rolled back:')
    console.error(e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
