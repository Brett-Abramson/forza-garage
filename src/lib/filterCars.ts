import type { Car, FilterState } from '@/types/car'
import { getDivisionsForGroup } from './divisionGroups'

export interface FilterParams {
  filters: FilterState
  /** Division group chip multi-selection — OR logic across selected groups */
  selectedGroupIds?: string[]
  /** Tag chips (AND logic) — car must have every selected tag */
  selectedTags?: Set<string>
  /**
   * Race-type filter (OR logic) — car passes if it matches any tag from any selected race.
   * Used by GarageShowcase and GarageView; omit or pass [] to disable.
   */
  activeRaces?: { recommendedTags: string[] }[]
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  piClass: [],
  division: [],
  make: [],
  drivetrain: '',
  country: '',
  source: '',
  owned: 'all',
  pinned: false,
}

/**
 * Pure filter function shared by GarageView (/cars) and GarageShowcase (/garage).
 *
 * All filtering is additive (AND): every active constraint must match.
 * Returns a new array; does not mutate the input.
 */
export function filterCars(
  cars: Car[],
  {
    filters,
    selectedGroupIds = [],
    selectedTags = new Set(),
    activeRaces = [],
  }: FilterParams
): Car[] {
  return cars.filter((car) => {
    // ── Full-text search ─────────────────────────────────────────────────────
    // Multi-token AND: every space-separated token must appear somewhere in
    // the year+make+model+division string. Case-insensitive.
    if (filters.search) {
      const haystack =
        `${car.year} ${car.make} ${car.model} ${car.division}`.toLowerCase()
      const tokens = filters.search.toLowerCase().trim().split(/\s+/)
      if (!tokens.every((t) => haystack.includes(t))) return false
    }

    // ── PI class ─────────────────────────────────────────────────────────────
    // OR logic: car passes if no class selected, or its class is in the selected set.
    if (filters.piClass.length > 0 && !filters.piClass.includes(car.piClass)) return false

    // ── Division / group ─────────────────────────────────────────────────────
    // OR across groups; sub-division chips narrow within the selected groups.
    if (selectedGroupIds.length > 0) {
      const groupDivisions = selectedGroupIds.flatMap(getDivisionsForGroup)
      if (filters.division.length > 0) {
        if (!filters.division.includes(car.division)) return false
      } else {
        if (!groupDivisions.includes(car.division)) return false
      }
    } else if (filters.division.length > 0) {
      if (!filters.division.includes(car.division)) return false
    }

    // ── Make ─────────────────────────────────────────────────────────────────
    // OR logic: car passes if no make selected, or its make is in the selected set.
    if (filters.make.length > 0 && !filters.make.includes(car.make)) return false

    // ── Drivetrain ───────────────────────────────────────────────────────────
    if (filters.drivetrain && car.drivetrain !== filters.drivetrain) return false

    // ── Country ──────────────────────────────────────────────────────────────
    if (filters.country && car.country !== filters.country) return false

    // ── Source ───────────────────────────────────────────────────────────────
    // Substring match because sources are composite strings, e.g.
    // "Autoshow, Collection Journal, Wheelspin".
    // Filtering by 'Collection Journal' matches that composite string.
    if (filters.source && !car.source.includes(filters.source)) return false

    // ── Owned filter ─────────────────────────────────────────────────────────
    // Used in GarageView (/cars). Omitting or passing 'all' is a no-op.
    if (filters.owned === 'owned' && !car.owned) return false
    if (filters.owned === 'not-owned' && car.owned) return false

    // ── Pinned / favourites filter ────────────────────────────────────────────
    // Garage-only. When active, only pinned cars pass.
    if (filters.pinned && !car.pinned) return false

    // ── Race-type filter (OR across races, OR within each race's tags) ───────
    // Car passes if it matches at least one tag from at least one selected race.
    if (activeRaces.length > 0) {
      const carTags = car.tags ?? []
      const allTags = activeRaces.flatMap((r) => r.recommendedTags)
      if (!allTags.some((t) => carTags.includes(t))) return false
    }

    // ── Tag chips (AND) ───────────────────────────────────────────────────────
    // Car must have every tag in the selected set.
    if (selectedTags.size > 0) {
      const carTags = car.tags ?? []
      if (![...selectedTags].every((t) => carTags.includes(t))) return false
    }

    return true
  })
}
