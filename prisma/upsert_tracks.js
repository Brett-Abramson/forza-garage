#!/usr/bin/env node
/**
 * upsert_tracks.js — Safe track data import from fh6-tracks.csv
 *
 * Usage:
 *   node prisma/upsert_tracks.js
 *
 * Reads:
 *   prisma/fh6-tracks.csv → raceName, raceType, distanceMi, laps, region,
 *                            trackImageUrl, detailsImageUrl, sourceUrl
 *   (produced by scrape_tracks.js against forza.labsgg.com/all-race-tracks)
 *
 * On match:   updates all scraped fields for that Track in a single
 *             operation. Null handling: never overwrites an existing
 *             non-null value with null — same COALESCE rule as
 *             upsert_cars.js. This matters here specifically for
 *             distanceMi, since the source page itself is missing it for
 *             at least one track (Hakone Nanamagari) — a future re-scrape
 *             that's still missing it should never blank out a value you
 *             filled in by hand in the meantime.
 *
 * No match:   inserts a new Track row.
 *
 * Safety:     entire operation runs inside a single transaction.
 *             Any failure rolls back completely — no partial updates.
 *
 * Never touches:
 *   - Track.id (identity key)
 *   - TrackProfile, TrackCorner — telemetry-derived data has a completely
 *     separate source (captured/community laps, not this scrape) and its
 *     own ingest pipeline. This script has no knowledge of those tables.
 */

const { PrismaClient } = require('@prisma/client')
const { readFileSync } = require('fs')
const { join } = require('path')

const prisma = new PrismaClient()

// ─── RFC 4180 CSV parser (same as upsert_cars.js) ──────────────────────────

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

// ─── Parsers ────────────────────────────────────────────────────────────────

/** Empty string / undefined / null → null */
function ns(val) {
  return (val === '' || val === undefined || val === null) ? null : String(val)
}

/** "4.2" → 4.2, blank → null */
function parseFloatOrNull(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseFloat(raw.trim())
  return isNaN(n) ? null : n
}

/** "1" → 1, blank → null */
function parseIntOrNull(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseInt(raw.trim(), 10)
  return isNaN(n) ? null : n
}

/** Lookup key for a track row */
function key(raceName) {
  return raceName.trim()
}

// ─── Field list — everything the scraper produces, all nullable-safe ───────

const TRACK_FIELDS = [
  'raceType', 'distanceMi', 'laps', 'region',
  'trackImageUrl', 'detailsImageUrl', 'sourceUrl',
]

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = join(__dirname, 'fh6-tracks.csv')

  console.log(`Reading: ${csvPath}`)
  const [_header, ...rows] = parseCSV(readFileSync(csvPath, 'utf-8'))

  const csvTracks   = []
  const parseErrors = []

  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i]
    // Columns: RaceName, RaceType, DistanceMi, Laps, Region, TrackImageUrl, DetailsImageUrl, SourceUrl
    const [raceName, raceType, distanceMiStr, lapsStr, region,
           trackImageUrl, detailsImageUrl, sourceUrl] = cols

    if (!raceName || !raceType) {
      parseErrors.push(`fh6-tracks.csv row ${i + 2}: missing required field (raceName=${raceName}, raceType=${raceType})`)
      continue
    }
    if (!sourceUrl) {
      parseErrors.push(`fh6-tracks.csv row ${i + 2}: missing sourceUrl for "${raceName}" — refusing to import a row with no provenance`)
      continue
    }

    csvTracks.push({
      raceName:        raceName.trim(),
      raceType:        raceType.trim(),
      distanceMi:      parseFloatOrNull(distanceMiStr),
      laps:            parseIntOrNull(lapsStr),
      region:          ns(region),
      trackImageUrl:   ns(trackImageUrl),
      detailsImageUrl: ns(detailsImageUrl),
      sourceUrl:       sourceUrl.trim(),
    })
  }

  if (parseErrors.length > 0) {
    console.error('\nCSV parse errors (aborting):')
    parseErrors.forEach(e => console.error(' ', e))
    process.exit(1)
  }

  console.log(`Parsed ${csvTracks.length} track(s) from fh6-tracks.csv.\n`)

  // Duplicate raceName check — the CSV is the join key, so a dupe here would
  // silently overwrite one row with another inside the same run. Catch it
  // before touching the DB rather than let @@unique surface it mid-transaction.
  const seen = new Set()
  const dupes = new Set()
  for (const t of csvTracks) {
    if (seen.has(t.raceName)) dupes.add(t.raceName)
    seen.add(t.raceName)
  }
  if (dupes.size > 0) {
    console.error('\nDuplicate raceName(s) in CSV (aborting):')
    dupes.forEach(d => console.error(' ', d))
    process.exit(1)
  }

  // ── Single transaction ────────────────────────────────────────────────────
  const summary = await prisma.$transaction(async (tx) => {
    const existing = await tx.track.findMany({
      select: {
        id: true, raceName: true, raceType: true,
        distanceMi: true, laps: true, region: true,
        trackImageUrl: true, detailsImageUrl: true, sourceUrl: true,
      },
    })

    const dbMap = new Map()
    for (const track of existing) {
      dbMap.set(key(track.raceName), track)
    }

    const updatedTracks  = []   // { label, changes }
    const insertedTracks = []   // { raceName }
    const unchangedIds   = []

    for (const csv of csvTracks) {
      const k  = key(csv.raceName)
      const db = dbMap.get(k)

      if (!db) {
        // ── Insert ──────────────────────────────────────────────────────────
        await tx.track.create({
          data: {
            raceName:        csv.raceName,
            raceType:        csv.raceType,
            distanceMi:      csv.distanceMi,
            laps:            csv.laps,
            region:          csv.region,
            trackImageUrl:   csv.trackImageUrl,
            detailsImageUrl: csv.detailsImageUrl,
            sourceUrl:       csv.sourceUrl,
            scrapedAt:       new Date(),
          },
        })
        insertedTracks.push({ raceName: csv.raceName })
        continue
      }

      // ── Resolve fields: new value if non-null, else keep existing ─────────
      // COALESCE rule, same as upsert_cars.js — never overwrite a real value
      // with null. Applies to every field here, not just distanceMi, since
      // any of them could theoretically go missing on a future re-scrape
      // (e.g. ForzaLabs briefly serving a broken image) and we don't want
      // that to blank out good data already in the DB.
      const resolved = {}
      for (const field of TRACK_FIELDS) {
        const newVal = csv[field] ?? null
        const oldVal = db[field]  ?? null
        resolved[field] = newVal !== null ? newVal : oldVal
      }

      // ── Detect changes ──────────────────────────────────────────────────
      const changes = {}
      for (const field of TRACK_FIELDS) {
        const n = resolved[field]
        const o = db[field] ?? null
        if (n !== o) changes[field] = { from: o, to: n }
      }

      if (Object.keys(changes).length === 0) {
        unchangedIds.push(db.id)
        continue
      }

      // ── Update ──────────────────────────────────────────────────────────
      await tx.track.update({
        where: { id: db.id },
        data: {
          ...resolved,
          scrapedAt: new Date(),
        },
      })

      updatedTracks.push({ id: db.id, label: csv.raceName, changes })
    }

    return {
      updatedTracks, insertedTracks,
      unchangedCount: unchangedIds.length,
    }
  }, { timeout: 300_000 })

  // ── Output ──────────────────────────────────────────────────────────────
  const { updatedTracks, insertedTracks, unchangedCount } = summary

  if (updatedTracks.length > 0) {
    console.log(`\nUpdated ${updatedTracks.length} track(s):`)
    for (const { label, changes } of updatedTracks) {
      for (const [f, { from: o, to: n }] of Object.entries(changes)) {
        if (f === 'raceType') {
          console.log(`  ⚠ raceType changed: ${label}: ${o} → ${n}`)
        } else {
          console.log(`  ${label}: ${f}  ${o} → ${n}`)
        }
      }
    }
  }

  if (insertedTracks.length > 0) {
    console.log(`\nInserted ${insertedTracks.length} new track(s):`)
    for (const { raceName } of insertedTracks) {
      console.log(`  + ${raceName}`)
    }
  }

  console.log('\n──────────────────────────────────────────────────────')
  console.log(`Updated:    ${updatedTracks.length} tracks`)
  console.log(`Unchanged:  ${unchangedCount} tracks`)
  console.log(`Inserted:   ${insertedTracks.length} new tracks`)
  console.log('──────────────────────────────────────────────────────')

  const raceTypeChanges = updatedTracks.filter(t => t.changes.raceType)
  if (raceTypeChanges.length > 0) {
    console.log(`\n⚠ ${raceTypeChanges.length} track(s) changed raceType — if you've grouped/filtered`)
    console.log('  by race type anywhere in the UI or in RACE_TYPES-linked logic, double-check those views.')
  }

  if (insertedTracks.length > 0) {
    console.log('\nNote: newly inserted tracks have no TrackProfile yet (elevation/corner')
    console.log('data is populated separately by the telemetry-ingest pipeline, not this script).')
  }
}

main()
  .catch((e) => {
    console.error('\nFatal error — transaction rolled back:')
    console.error(e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())