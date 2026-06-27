import type { Car, CarBadge, CarBadgeMap } from '@/types/car'
import { getMetric } from '@/lib/metrics'
import type { MetricDirection } from '@/lib/metrics'

// ── Configurable thresholds ───────────────────────────────────────────────────
export const BAND_TOP_STRONG    = 0.10   // top 10%
export const BAND_TOP_SOFT      = 0.20   // top 10–20%
export const BAND_BOTTOM_SOFT   = 0.20   // bottom 10–20%
export const BAND_BOTTOM_STRONG = 0.10   // bottom 10%
export const MIN_RANK_COHORT    = 6      // minimum cohort size for rank fallback
export const COVERAGE_FLOOR     = 0.70   // skip (class, metric) if < 70% non-null

// ── Metric priority order ─────────────────────────────────────────────────────
// Determines tiebreaker in getBestBadge: headline bars → specs → sim.
export const METRIC_PRIORITY = [
  'statSpeed', 'statHandling', 'statAcceleration', 'statLaunch', 'statBraking', 'statOffroad',
  'powerHp', 'torqueFtLb', 'weightLb',
  'simZeroToSixty', 'simZeroToHundred', 'simBraking60', 'simLateralG60', 'simTopSpeed',
] as const

export type BadgeMetricKey = typeof METRIC_PRIORITY[number]

// ── Per-metric config ─────────────────────────────────────────────────────────
interface MetricConfig {
  direction: MetricDirection
  label: string
}

function buildConfig(): Record<BadgeMetricKey, MetricConfig> {
  const simDir   = (key: string): MetricDirection => getMetric(key)?.direction ?? 'higherBetter'
  const simLabel = (key: string, fallback: string): string => getMetric(key)?.short ?? fallback

  return {
    statSpeed:        { direction: 'higherBetter', label: 'speed'        },
    statHandling:     { direction: 'higherBetter', label: 'handling'     },
    statAcceleration: { direction: 'higherBetter', label: 'acceleration' },
    statLaunch:       { direction: 'higherBetter', label: 'launch'       },
    statBraking:      { direction: 'higherBetter', label: 'braking'      },
    statOffroad:      { direction: 'higherBetter', label: 'offroad'      },
    powerHp:          { direction: 'higherBetter', label: 'HP'           },
    torqueFtLb:       { direction: 'higherBetter', label: 'torque'       },
    weightLb:         { direction: 'lowerBetter',  label: 'weight'       },
    simZeroToSixty:   { direction: simDir('simZeroToSixty'),   label: simLabel('simZeroToSixty',   '0–60')      },
    simZeroToHundred: { direction: simDir('simZeroToHundred'), label: simLabel('simZeroToHundred', '0–100')     },
    simBraking60:     { direction: simDir('simBraking60'),     label: '60–0 braking'                           },
    simLateralG60:    { direction: simDir('simLateralG60'),    label: simLabel('simLateralG60',    'lateral G') },
    simTopSpeed:      { direction: simDir('simTopSpeed'),      label: simLabel('simTopSpeed',      'top speed') },
  }
}

const METRIC_CONFIG: Record<BadgeMetricKey, MetricConfig> = buildConfig()

// ── Competition ranking ───────────────────────────────────────────────────────
// Returns a same-length array of 1-based ranks. Ties share a rank (1,1,1,4…).
// Null values receive Infinity so they never qualify.
function competitionRank(values: (number | null)[], direction: MetricDirection): number[] {
  const indexed = values.map((v, i) => ({ v, i }))
  const valid = indexed.filter((x) => x.v != null)

  valid.sort((a, b) => direction === 'lowerBetter' ? a.v! - b.v! : b.v! - a.v!)

  const ranks = new Array<number>(values.length).fill(Infinity)
  let pos = 0
  while (pos < valid.length) {
    const val = valid[pos].v!
    let end = pos
    while (end + 1 < valid.length && valid[end + 1].v! === val) end++
    const rank = pos + 1
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
 * Compute the five-band badge matrix for a full catalog.
 *
 * Bands: top-strong (top 10%), top-soft (10–20%), neutral, bottom-soft (80–90%), bottom-strong (bottom 10%).
 * Cohort = all cars by piClass. Returns a plain Record (JSON-serializable for unstable_cache).
 */
export function computeBadgeMatrix(cars: BadgeRow[]): Record<number, CarBadgeMap> {
  const result: Record<number, CarBadgeMap> = {}
  for (const car of cars) result[car.id] = {}

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

      const values = classCars.map((c) => {
        const v = (c as Record<string, unknown>)[metricKey]
        return typeof v === 'number' ? v : null
      })

      const nonNullCount = values.filter((v) => v != null).length
      if (nonNullCount / classSize < COVERAGE_FLOOR) continue

      const n = nonNullCount
      const k_top = Math.floor(BAND_TOP_STRONG * n)
      const ranks = competitionRank(values, cfg.direction)

      for (let i = 0; i < classCars.length; i++) {
        const rank = ranks[i]
        if (rank === Infinity) continue

        let badge: CarBadge | null = null

        if (k_top === 0) {
          // Rank fallback — positive side only, requires MIN_RANK_COHORT
          if (n >= MIN_RANK_COHORT && rank <= 3) {
            badge = {
              kind: 'rank',
              tier: rank === 1 ? 'top-strong' : 'top-soft',
              label: `#${rank} ${cfg.label} · ${piClass} (stock)`,
              rank,
              n,
            }
          }
          // Bottom bands still use p_bottom formula even when k_top=0
          if (!badge) {
            const pBottom = (n - rank + 1) / n
            if (pBottom <= BAND_BOTTOM_STRONG) {
              badge = { kind: 'percentile', tier: 'bottom-strong', label: `bottom 10% ${cfg.label} · ${piClass} (stock)`, rank, n }
            } else if (pBottom <= BAND_BOTTOM_SOFT) {
              badge = { kind: 'percentile', tier: 'bottom-soft', label: `bottom 20% ${cfg.label} · ${piClass} (stock)`, rank, n }
            }
          }
        } else {
          // Percentile mode
          const pTop    = rank / n
          const pBottom = (n - rank + 1) / n

          if (pTop <= BAND_TOP_STRONG) {
            badge = { kind: 'percentile', tier: 'top-strong', label: `top 10% ${cfg.label} · ${piClass} (stock)`, rank, n }
          } else if (pTop <= BAND_TOP_SOFT) {
            badge = { kind: 'percentile', tier: 'top-soft', label: `top 20% ${cfg.label} · ${piClass} (stock)`, rank, n }
          } else if (pBottom <= BAND_BOTTOM_STRONG) {
            badge = { kind: 'percentile', tier: 'bottom-strong', label: `bottom 10% ${cfg.label} · ${piClass} (stock)`, rank, n }
          } else if (pBottom <= BAND_BOTTOM_SOFT) {
            badge = { kind: 'percentile', tier: 'bottom-soft', label: `bottom 20% ${cfg.label} · ${piClass} (stock)`, rank, n }
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
// Preference order: top-strong > top-soft > bottom-strong > bottom-soft.
// Within a tier: lowest normalised rank (rank / n), then METRIC_PRIORITY index.

const TIER_PRIORITY: Record<CarBadge['tier'], number> = {
  'top-strong':    0,
  'top-soft':      1,
  'bottom-strong': 2,
  'bottom-soft':   3,
  'neutral':       4,
}

const PRIORITY_INDEX = Object.fromEntries(METRIC_PRIORITY.map((k, i) => [k, i]))

export function getBestBadge(badges: CarBadgeMap | undefined): CarBadge | null {
  if (!badges) return null
  const entries = (Object.entries(badges) as [string, CarBadge][])
    .filter(([, b]) => b != null && b.tier !== 'neutral')
  if (entries.length === 0) return null

  return entries.sort(([ak, ab], [bk, bb]) => {
    const tierDiff = (TIER_PRIORITY[ab.tier] ?? 99) - (TIER_PRIORITY[bb.tier] ?? 99)
    if (tierDiff !== 0) return tierDiff
    const normA = ab.rank / ab.n
    const normB = bb.rank / bb.n
    if (normA !== normB) return normA - normB
    return (PRIORITY_INDEX[ak] ?? 999) - (PRIORITY_INDEX[bk] ?? 999)
  })[0][1]
}
