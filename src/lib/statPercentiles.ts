import type { Car, CarBadge, CarBadgeMap } from '@/types/car'
import { getMetric } from '@/lib/metrics'
import type { MetricDirection } from '@/lib/metrics'

// ── Configurable thresholds ───────────────────────────────────────────────────
export const BADGE_THRESHOLD_BARS = 0.10   // bar stats (0–10) + raw specs
export const BADGE_THRESHOLD_SIM  = 0.05   // the 5 sim metrics
export const MIN_RANK_COHORT      = 6      // minimum cohort size for rank fallback
export const COVERAGE_FLOOR       = 0.70   // skip (class, metric) if < 70% non-null

// ── Metric priority order ─────────────────────────────────────────────────────
// Determines tiebreaker in getBestBadge: headline bars → specs → sim.
export const METRIC_PRIORITY = [
  'statSpeed', 'statHandling', 'statAcceleration', 'statLaunch', 'statBraking', 'statOffroad',
  'powerHp', 'torqueFtLb', 'weightLb',
  'simZeroToSixty', 'simZeroToHundred', 'simBraking60', 'simLateralG60', 'simTopSpeed',
] as const

export type BadgeMetricKey = typeof METRIC_PRIORITY[number]

// ── Per-metric config ─────────────────────────────────────────────────────────
// Direction for sim fields is pulled from the registry; bars/specs defined here.
// Lower-better outliers among non-sim: only weightLb.
interface MetricConfig {
  direction: MetricDirection
  threshold: number
  label: string   // display name used in badge label copy
  isSim: boolean
}

function buildConfig(): Record<BadgeMetricKey, MetricConfig> {
  // Pull direction from the metrics registry for sim fields
  const simDir = (key: string): MetricDirection => getMetric(key)?.direction ?? 'higherBetter'
  // Pull label from the metrics registry short name for sim fields
  const simLabel = (key: string, fallback: string): string => getMetric(key)?.short ?? fallback

  return {
    // 6 bar stats — all higher-better (10 = best)
    statSpeed:        { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'speed',        isSim: false },
    statHandling:     { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'handling',     isSim: false },
    statAcceleration: { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'acceleration', isSim: false },
    statLaunch:       { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'launch',       isSim: false },
    statBraking:      { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'braking',      isSim: false },
    statOffroad:      { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'offroad',      isSim: false },
    // 3 raw specs — powerHp and torqueFtLb higher-better; weightLb lower-better
    powerHp:          { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'HP',           isSim: false },
    torqueFtLb:       { direction: 'higherBetter', threshold: BADGE_THRESHOLD_BARS, label: 'torque',       isSim: false },
    weightLb:         { direction: 'lowerBetter',  threshold: BADGE_THRESHOLD_BARS, label: 'weight',       isSim: false },
    // 5 sim metrics — direction pulled from registry to avoid drift
    // Note: '60–0 braking' (sim, feet, lower-better) differs from 'braking' (bar, 0-10, higher-better)
    simZeroToSixty:   { direction: simDir('simZeroToSixty'),   threshold: BADGE_THRESHOLD_SIM, label: simLabel('simZeroToSixty',   '0–60'),        isSim: true },
    simZeroToHundred: { direction: simDir('simZeroToHundred'), threshold: BADGE_THRESHOLD_SIM, label: simLabel('simZeroToHundred', '0–100'),       isSim: true },
    simBraking60:     { direction: simDir('simBraking60'),     threshold: BADGE_THRESHOLD_SIM, label: '60–0 braking',                              isSim: true },
    simLateralG60:    { direction: simDir('simLateralG60'),    threshold: BADGE_THRESHOLD_SIM, label: simLabel('simLateralG60',    'lateral G'),    isSim: true },
    simTopSpeed:      { direction: simDir('simTopSpeed'),      threshold: BADGE_THRESHOLD_SIM, label: simLabel('simTopSpeed',      'top speed'),    isSim: true },
  }
}

const METRIC_CONFIG: Record<BadgeMetricKey, MetricConfig> = buildConfig()

// ── Competition ranking ───────────────────────────────────────────────────────
// Returns a same-length array of 1-based ranks. Ties share a rank (1,1,1,4…).
// Null values receive Infinity so they never qualify.
function competitionRank(values: (number | null)[], direction: MetricDirection): number[] {
  const indexed = values.map((v, i) => ({ v, i }))
  const valid = indexed.filter((x) => x.v != null)

  // Sort valid entries: lowerBetter → ascending; higherBetter → descending
  valid.sort((a, b) => direction === 'lowerBetter' ? a.v! - b.v! : b.v! - a.v!)

  const ranks = new Array<number>(values.length).fill(Infinity)
  let pos = 0
  while (pos < valid.length) {
    const val = valid[pos].v!
    let end = pos
    // Find the full run of equal values
    while (end + 1 < valid.length && valid[end + 1].v! === val) end++
    const rank = pos + 1  // competition rank = 1-indexed position of first in run
    for (let j = pos; j <= end; j++) ranks[valid[j].i] = rank
    pos = end + 1
  }
  return ranks
}

// ── Core computation ──────────────────────────────────────────────────────────

type BadgeRow = Pick<Car,
  'id' | 'piClass' |
  'statSpeed' | 'statHandling' | 'statAcceleration' | 'statLaunch' | 'statBraking' | 'statOffroad' |
  'powerHp' | 'torqueFtLb' | 'weightLb' |
  'simZeroToSixty' | 'simZeroToHundred' | 'simBraking60' | 'simLateralG60' | 'simTopSpeed'
>

/**
 * Compute the badge matrix for a full catalog.
 *
 * Cohort = all cars by piClass (never filtered, never override-adjusted).
 * Returns a plain Record (JSON-serializable for unstable_cache).
 */
export function computeBadgeMatrix(cars: BadgeRow[]): Record<number, CarBadgeMap> {
  // Initialize every car with an empty badge map
  const result: Record<number, CarBadgeMap> = {}
  for (const car of cars) result[car.id] = {}

  // Group by piClass
  const byClass = new Map<string, BadgeRow[]>()
  for (const car of cars) {
    const cls = car.piClass
    if (!byClass.has(cls)) byClass.set(cls, [])
    byClass.get(cls)!.push(car)
  }

  for (const [piClass, classCars] of byClass) {
    const classSize = classCars.length

    for (const metricKey of METRIC_PRIORITY) {
      const cfg = METRIC_CONFIG[metricKey]

      // Extract raw numeric values (null when missing)
      const values = classCars.map((c) => {
        const v = (c as Record<string, unknown>)[metricKey]
        return typeof v === 'number' ? v : null
      })

      // Coverage guard: too many nulls → no badge for this (class, metric)
      const nonNullCount = values.filter((v) => v != null).length
      if (nonNullCount / classSize < COVERAGE_FLOOR) continue

      const n = nonNullCount
      const k = Math.floor(cfg.threshold * n)
      const ranks = competitionRank(values, cfg.direction)

      for (let i = 0; i < classCars.length; i++) {
        const rank = ranks[i]
        if (rank === Infinity) continue  // null value — no badge

        let badge: CarBadge | null = null
        const pct = cfg.isSim ? 5 : 10

        if (k >= 1) {
          // Percentile mode: strict cut — rank must be ≤ k
          if (rank <= k) {
            badge = {
              kind: 'percentile',
              tier: cfg.isSim ? 'strong' : 'soft',
              label: `top ${pct}% ${cfg.label} · ${piClass} (stock)`,
              rank,
              n,
            }
          }
        } else {
          // k == 0 → rank fallback (only when cohort ≥ MIN_RANK_COHORT)
          if (n >= MIN_RANK_COHORT && rank <= 3) {
            badge = {
              kind: 'rank',
              tier: rank === 1 ? 'strong' : 'soft',
              label: `#${rank} ${cfg.label} · ${piClass} (stock)`,
              rank,
              n,
            }
          }
        }

        if (badge) {
          result[classCars[i].id][metricKey] = badge
        }
      }
    }
  }

  return result
}

// ── Single-best-badge helper ──────────────────────────────────────────────────
// Used by the drawer pill. Returns the single most impressive badge:
//   1. strong before soft
//   2. lowest normalised rank (rank / n)
//   3. METRIC_PRIORITY tiebreaker (headline bars first, then specs, then sim)

const PRIORITY_INDEX = Object.fromEntries(METRIC_PRIORITY.map((k, i) => [k, i]))

export function getBestBadge(badges: CarBadgeMap | undefined): CarBadge | null {
  if (!badges) return null
  const entries = (Object.entries(badges) as [string, CarBadge][])
    .filter(([, b]) => b != null)
  if (entries.length === 0) return null

  return entries.sort(([ak, ab], [bk, bb]) => {
    if (ab.tier !== bb.tier) return ab.tier === 'strong' ? -1 : 1
    const normA = ab.rank / ab.n
    const normB = bb.rank / bb.n
    if (normA !== normB) return normA - normB
    return (PRIORITY_INDEX[ak] ?? 999) - (PRIORITY_INDEX[bk] ?? 999)
  })[0][1]
}
