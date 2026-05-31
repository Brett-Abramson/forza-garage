import { Car, PI_CLASS_ORDER } from '@/types/car'

export type SortKey = 'piClass' | 'piRating' | 'year' | 'make' | 'model' | 'division' | 'drivetrain' | 'country' | 'source' | 'value'
export type SortDir = 'asc' | 'desc'

export const PI_CLASS_INDEX: Record<string, number> = Object.fromEntries(
  PI_CLASS_ORDER.map((c, i) => [c, i])
)

export function compareRows(a: Car, b: Car, key: SortKey, dir: SortDir): number {
  let result = 0
  if (key === 'piClass') {
    result = (PI_CLASS_INDEX[a.piClass] ?? -1) - (PI_CLASS_INDEX[b.piClass] ?? -1)
  } else if (key === 'piRating' || key === 'year') {
    result = a[key] - b[key]
  } else if (key === 'value') {
    result = (a.value ?? -1) - (b.value ?? -1)
  } else {
    result = String(a[key]).localeCompare(String(b[key]))
  }
  return dir === 'asc' ? result : -result
}

export function defaultSort(a: Car, b: Car): number {
  if (a.owned !== b.owned) return a.owned ? -1 : 1
  const ci = (PI_CLASS_INDEX[b.piClass] ?? -1) - (PI_CLASS_INDEX[a.piClass] ?? -1)
  if (ci !== 0) return ci
  return b.piRating - a.piRating
}
