import { Car, PI_CLASS_ORDER } from '@/types/car'
import { getMetric, getMetricValue, type MetricKey } from '@/lib/metrics'

export type SortKey =
  | 'piClass' | 'piRating' | 'year' | 'make' | 'model' | 'division' | 'drivetrain' | 'country' | 'source' | 'value' | 'addedAt' | 'owned'
  | 'statSpeed' | 'statHandling' | 'statAcceleration' | 'statLaunch' | 'statBraking' | 'statOffroad'
  | 'powerHp' | 'torqueFtLb' | 'weightLb' | 'frontWeight' | 'displacementL' | 'powerToWeight'
  | MetricKey  // registry-driven Sim-view columns
export type SortDir = 'asc' | 'desc'

export const PI_CLASS_INDEX: Record<string, number> = Object.fromEntries(
  PI_CLASS_ORDER.map((c, i) => [c, i])
)

// Sort keys where pinned cars float to the top within their sort group.
// Numeric sorts (PI, Value) are intentionally excluded — don't break those.
export const PIN_FLOAT_KEYS: Set<SortKey> = new Set(['addedAt', 'make', 'model', 'year'])

export function compareRows(a: Car, b: Car, key: SortKey, dir: SortDir): number {
  // Pinned cars float to the top for non-numeric sort keys.
  if (PIN_FLOAT_KEYS.has(key)) {
    const aPinned = a.pinned ? 1 : 0
    const bPinned = b.pinned ? 1 : 0
    if (aPinned !== bPinned) return bPinned - aPinned  // pinned first, direction-independent
  }

  // Registry-driven metric sort (Sim-view columns + derived power-to-weight).
  // The first click ('asc') always surfaces best-first via metric.direction:
  // lowerBetter ascends by value, higherBetter descends by value. Nulls always
  // sink last, regardless of direction — a failed scrape never tops the list.
  const metric = getMetric(key)
  if (metric) {
    const aVal = getMetricValue(metric, a)
    const bVal = getMetricValue(metric, b)
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1
    const cmp = metric.direction === 'higherBetter' ? bVal - aVal : aVal - bVal
    return dir === 'asc' ? cmp : -cmp
  }

  let result = 0
  if (key === 'piClass') {
    result = (PI_CLASS_INDEX[a.piClass] ?? -1) - (PI_CLASS_INDEX[b.piClass] ?? -1)
  } else if (key === 'owned') {
    // Owned cars first on the natural (asc) click — first tap groups your garage at the top.
    result = (b.owned ? 1 : 0) - (a.owned ? 1 : 0)
  } else if (key === 'piRating' || key === 'year') {
    result = a[key] - b[key]
  } else if (key === 'value') {
    // nulls (unknown price) always sink to the bottom regardless of direction
    const av = a.value
    const bv = b.value
    if (av === null && bv === null) result = 0
    else if (av === null) return 1   // a sinks regardless
    else if (bv === null) return -1  // b sinks regardless
    else result = av - bv
  } else if (key === 'addedAt') {
    // nulls always sink to the bottom regardless of direction
    const at = (a.addedAt ? new Date(a.addedAt).getTime() : null)
    const bt = (b.addedAt ? new Date(b.addedAt).getTime() : null)
    if (at === null && bt === null) result = 0
    else if (at === null) return 1   // a sinks regardless
    else if (bt === null) return -1  // b sinks regardless
    else result = at - bt
  } else if (
    key === 'statSpeed' || key === 'statHandling' || key === 'statAcceleration' ||
    key === 'statLaunch' || key === 'statBraking' || key === 'statOffroad' ||
    key === 'powerHp' || key === 'torqueFtLb' || key === 'weightLb' ||
    key === 'frontWeight' || key === 'displacementL'
  ) {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal === null && bVal === null) result = 0
    else if (aVal === null) return 1   // nulls sink regardless of direction
    else if (bVal === null) return -1
    else result = aVal - bVal
  } else {
    // Residual string sorts (make, model, division, country, source, drivetrain).
    // Metric keys are handled and returned above, so they never reach here.
    const av = (a as unknown as Record<string, unknown>)[key]
    const bv = (b as unknown as Record<string, unknown>)[key]
    result = String(av).localeCompare(String(bv))
  }
  return dir === 'asc' ? result : -result
}

/** Formats an ISO date string as a short relative or absolute label. */
export function formatAddedAt(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const diffMs = Date.now() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return 'Added today'
  if (diffDays === 1) return 'Added yesterday'
  if (diffDays < 7)  return `Added ${diffDays} days ago`
  if (diffDays < 14) return 'Added last week'
  // Older: show short date e.g. "Added Jun 1"
  return `Added ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
}

export function defaultSort(a: Car, b: Car): number {
  if (a.owned !== b.owned) return a.owned ? -1 : 1
  const ci = (PI_CLASS_INDEX[b.piClass] ?? -1) - (PI_CLASS_INDEX[a.piClass] ?? -1)
  if (ci !== 0) return ci
  return b.piRating - a.piRating
}
