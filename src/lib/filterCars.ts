import type { Car, FilterState } from '@/types/car'
import { getDivisionsForGroup } from './divisionGroups'

export interface FilterParams {
  filters: FilterState
  /** Division group chip selection — filters to all divisions within that group */
  selectedGroupId?: string | null
  /** Tag chips (AND logic) — car must have every selected tag */
  selectedTags?: Set<string>
  /**
   * Race-type filter (OR logic) — car must match at least one recommendedTag.
   * Used by GarageShowcase; omit or pass null to disable.
   */
  activeRace?: { recommendedTags: string[] } | null
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  piClass: '',
  division: '',
  make: '',
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
    selectedGroupId = null,
    selectedTags = new Set(),
    activeRace = null,
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
    // Exact match (PI classes are always uppercase: D C B A S1 S2 R).
    if (filters.piClass && car.piClass !== filters.piClass) return false

    // ── Division / group ─────────────────────────────────────────────────────
    // A group selection filters to all divisions within that group.
    // A division filter (from a dropdown inside the group) narrows further.
    if (selectedGroupId) {
      const groupDivisions = getDivisionsForGroup(selectedGroupId)
      if (filters.division) {
        if (car.division !== filters.division) return false
      } else {
        if (!groupDivisions.includes(car.division)) return false
      }
    } else if (filters.division) {
      if (car.division !== filters.division) return false
    }

    // ── Make ─────────────────────────────────────────────────────────────────
    if (filters.make && car.make !== filters.make) return false

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

    // ── Race-type filter (OR) ─────────────────────────────────────────────────
    // Used in GarageShowcase (/garage). Car must match at least one tag from
    // the race type's recommendedTags list.
    if (activeRace) {
      const carTags = car.tags ?? []
      if (!activeRace.recommendedTags.some((t) => carTags.includes(t)))
        return false
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
