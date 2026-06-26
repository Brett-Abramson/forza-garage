import type { Car } from '@/types/car'

// ─── Metric registry ────────────────────────────────────────────────────────
// Single source of truth for every rankable/displayable performance metric.
// sort.ts, the Sim-view column set, and the drawer's Simulation section all read
// from here — no sim/rankable field list is hardcoded anywhere else.

export type MetricDirection = 'lowerBetter' | 'higherBetter' | 'neutral'

export interface Metric {
  key: string                          // 'simZeroToSixty'
  label: string                        // 'Sim 0–60'  (drawer / full label)
  short: string                        // '0–60'      (column header)
  unit: string | null                  // 's' | 'ft' | 'g' | 'mph' | 'hp/lb' | null
  group: 'sim' | 'derived'
  direction: MetricDirection           // drives sort + future compare winner logic
  inList: boolean                      // true → field must ride along in LIST_SELECT
  column: boolean                      // true → shown as a sortable Sim-view column
  accessor?: (c: Car) => number | null // derived metrics only; default = c[key]
  decimals: number                     // display rounding
}

// `as const` keeps the key/flag literals so the sortable-key union and the
// Prisma select fragment below can be derived with exact types.
export const METRICS = [
  { key: 'simZeroToSixty',   label: 'Sim 0–60',          short: '0–60',     unit: 's',     group: 'sim',     direction: 'lowerBetter',  inList: true,  column: true,  decimals: 1 },
  { key: 'simZeroToHundred', label: 'Sim 0–100',         short: '0–100',    unit: 's',     group: 'sim',     direction: 'lowerBetter',  inList: true,  column: true,  decimals: 1 },
  { key: 'simBraking60',     label: 'Sim 60–0 braking',  short: 'brk 60',   unit: 'ft',    group: 'sim',     direction: 'lowerBetter',  inList: true,  column: true,  decimals: 0 },
  { key: 'simBraking100',    label: 'Sim 100–0 braking', short: 'brk 100',  unit: 'ft',    group: 'sim',     direction: 'lowerBetter',  inList: true,  column: true,  decimals: 0 },
  { key: 'simLateralG60',    label: 'Sim lateral G (60)',  short: 'lat 60',  unit: 'g',     group: 'sim',     direction: 'higherBetter', inList: true,  column: true,  decimals: 2 },
  { key: 'simLateralG120',   label: 'Sim lateral G (120)', short: 'lat 120', unit: 'g',     group: 'sim',     direction: 'higherBetter', inList: true,  column: true,  decimals: 2 },
  { key: 'simTopSpeed',      label: 'Sim top speed',     short: 'top',      unit: 'mph',   group: 'sim',     direction: 'higherBetter', inList: true,  column: true,  decimals: 0 },
  { key: 'simAeroEfficiency', label: 'Sim aero efficiency', short: 'aero eff', unit: null,  group: 'sim',     direction: 'neutral',      inList: false, column: false, decimals: 2 },
  { key: 'simMechBalance',   label: 'Sim mech balance',  short: 'mech bal', unit: null,    group: 'sim',     direction: 'neutral',      inList: false, column: false, decimals: 2 },
  { key: 'simAeroBalance',   label: 'Sim aero balance',  short: 'aero bal', unit: null,    group: 'sim',     direction: 'neutral',      inList: false, column: false, decimals: 2 },
  { key: 'powerToWeight',    label: 'Power-to-weight',   short: 'P:W',      unit: 'hp/lb', group: 'derived', direction: 'higherBetter', inList: false, column: true,  decimals: 3,
    accessor: (c: Car) => (c.powerHp != null && c.weightLb ? c.powerHp / c.weightLb : null) },
] as const satisfies readonly Metric[]

// Sortable / column-rendered metric keys (the 7 rankable sim fields + P:W).
type ColumnMetric = Extract<(typeof METRICS)[number], { column: true }>
export type MetricKey = ColumnMetric['key']

// Sim fields that must be selected into the list payload (the 7 `inList` rows).
type ListMetric = Extract<(typeof METRICS)[number], { inList: true }>
type ListMetricKey = ListMetric['key']

const METRIC_BY_KEY = new Map<string, Metric>(METRICS.map((m) => [m.key, m]))

/** Look up a metric by key — undefined for non-metric sort keys (make, piClass…). */
export function getMetric(key: string): Metric | undefined {
  return METRIC_BY_KEY.get(key)
}

/** Canonical value for a metric on a car: accessor first, else the raw field. */
export function getMetricValue(metric: Metric, car: Car): number | null {
  const viaAccessor = metric.accessor?.(car)
  if (viaAccessor != null) return viaAccessor
  const raw = (car as unknown as Record<string, unknown>)[metric.key]
  return typeof raw === 'number' ? raw : null
}

/** Display string for a metric value: registry-rounded, or the em dash for null. */
export function formatMetricValue(metric: Metric, car: Car): string {
  const value = getMetricValue(metric, car)
  return value == null ? '—' : value.toFixed(metric.decimals)
}

// Every metric rendered as a sortable Sim-view column, in registry order.
export const SIM_COLUMN_METRICS: readonly Metric[] = METRICS.filter((m) => m.column)

// The 10 catalog sim metrics (excludes the derived P:W) — drives the drawer
// section and its "all null → hide" check.
export const SIM_METRICS: readonly Metric[] = METRICS.filter((m) => m.group === 'sim')

// Prisma `select` fragment for the rankable sim fields. Spread into LIST_SELECT
// so the inList field list is defined only here.
export const LIST_SIM_SELECT = Object.fromEntries(
  METRICS.filter((m) => m.inList).map((m) => [m.key, true]),
) as Record<ListMetricKey, true>
