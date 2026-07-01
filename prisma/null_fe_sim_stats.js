#!/usr/bin/env node
/**
 * null_fe_sim_stats.js — one-off: clear Sim_* fields for known-bad Forza Edition rows
 *
 * Usage:
 *   node prisma/null_fe_sim_stats.js
 *
 * Why this exists (not folded into upsert_cars.js): upsert_cars.js's COALESCE rule
 * never overwrites an existing non-null DB value with null — a deliberate safety
 * rule so a partial/failed scrape can't blank out good data. That's exactly what
 * blocks this correction: scraper-pipline/null_fe_sim_stats.py already blanked the
 * Sim_* columns to "N/A" in prisma/scraped_car_stats.csv for these rows, but running
 * upsert_cars.js against that file left the DB's stale values untouched (confirmed:
 * 0 cars updated). See the v3.2 statCallouts handoff / audit_scraped_stats.py for
 * the root-cause investigation — forza.labsgg.com serves stale Simulation Results
 * (0-60, 0-100, braking, lateral G, top speed, aero/mech balance) for Forza Edition
 * variant pages; re-scraping returns the same wrong numbers, so there's no correct
 * replacement value to coalesce in. Nulling is the correction.
 *
 * Scope: only the 10 sim* fields, only the 15 (year, make, model) rows below.
 * Everything else on these Car rows (drivetrain, power, weight, the 0-10 performance
 * bars, division, etc.) is untouched — those were spot-checked as correct.
 * Never touches UserGarage or CarTag rows.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// The 15 Forza Edition cars confirmed by audit_scraped_stats.py to carry stale
// Sim_* data (12 failed a physical-plausibility check outright; the other 3 —
// BMW M2 FE, Viper GTS ACR FE, Lotus Evija FE — had small enough power deltas to
// look plausible in isolation, but are nulled too since the site bug is category-wide).
const TARGET_CARS = [
  { year: 2023, make: 'BMW',            model: 'M2 Forza Edition' },
  { year: 1999, make: 'Dodge',          model: 'Viper GTS ACR Forza Edition' },
  { year: 1968, make: 'Ford',           model: 'Mustang GT 2+2 Fastback Forza Edition' },
  { year: 2020, make: 'Ford',           model: 'Super Duty F-450 DRW PLATINUM Forza Edition' },
  { year: 2010, make: 'Lexus',          model: 'LFA Forza Edition' },
  { year: 2020, make: 'Lotus',          model: 'Evija Forza Edition' },
  { year: 1994, make: 'Mazda',          model: 'MX-5 Miata Forza Edition' },
  { year: 1973, make: 'Mazda',          model: 'RX-3 Forza Edition' },
  { year: 2012, make: 'Nissan',         model: 'GT-R Black Edition (R35) Forza Edition' },
  { year: 1989, make: 'Nissan',         model: 'S-Cargo Forza Edition' },
  { year: 1970, make: 'Porsche',        model: '#3 917 LH Forza Edition' },
  { year: 2022, make: 'Subaru',         model: 'BRZ Forza Edition' },
  { year: 1994, make: 'Subaru',         model: 'Vivio RX-R Forza Edition' },
  { year: 1985, make: 'Toyota',         model: 'Sprinter Trueno GT Apex Forza Edition' },
  { year: 2019, make: 'Toyota',         model: 'Tacoma TRD Pro Forza Edition' },
]

const SIM_FIELD_NULLS = {
  simZeroToSixty:    null,
  simZeroToHundred:  null,
  simBraking60:      null,
  simBraking100:     null,
  simLateralG60:     null,
  simLateralG120:    null,
  simTopSpeed:       null,
  simAeroEfficiency: null,
  simMechBalance:    null,
  simAeroBalance:    null,
}

async function main() {
  const results = await prisma.$transaction(async (tx) => {
    const summary = []
    for (const { year, make, model } of TARGET_CARS) {
      const existing = await tx.car.findFirst({ where: { year, make, model } })
      if (!existing) {
        summary.push({ year, make, model, status: 'NOT FOUND' })
        continue
      }
      await tx.car.update({
        where: { id: existing.id },
        data: SIM_FIELD_NULLS,
      })
      summary.push({ year, make, model, status: `updated (id ${existing.id})` })
    }
    return summary
  })

  console.log('Cleared Sim_* fields for known-bad Forza Edition rows:\n')
  for (const { year, make, model, status } of results) {
    console.log(`  ${status === 'NOT FOUND' ? '⚠' : '✅'} ${year} ${make} ${model} — ${status}`)
  }
  const updated = results.filter(r => r.status !== 'NOT FOUND').length
  console.log(`\n${updated}/${TARGET_CARS.length} cars updated.`)
}

main()
  .catch((e) => {
    console.error('\nFatal error — transaction rolled back:')
    console.error(e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
