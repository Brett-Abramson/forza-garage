import { RACE_TYPES, RaceType } from "./races"
import { getAutoTags, type AutoTagStats } from "./autotags"

function scoreRaceType(raceTags: string[], carTags: string[]): number {
  return raceTags.filter((t) => carTags.includes(t)).length
}

/**
 * Returns the single best-matching race type for a car, or null if nothing
 * scores above zero.
 *
 * @param division  Car division — used to derive auto tags via getAutoTags
 * @param allTags   All tags already on the car (auto + user). Optional.
 * @param drivetrain  Drivetrain string ("AWD", "RWD", "FWD"). Optional.
 */
export function getBestRaceType(
  division: string,
  allTags?: string[],
  drivetrain?: string | null,
  stats?: AutoTagStats | null,
): RaceType | null {
  const autoTags = getAutoTags(division, drivetrain, stats)
  const merged = [...new Set([...autoTags, ...(allTags ?? [])])]

  let best: RaceType | null = null
  let bestScore = 0

  for (const race of RACE_TYPES) {
    const score = scoreRaceType(race.recommendedTags, merged)
    if (score > bestScore) {
      bestScore = score
      best = race
    }
  }

  return best
}

/**
 * Returns all race types that score > 0, sorted best → worst.
 * Use this when you want "Best for" + "Also suits" breakdowns.
 */
export function getRankedRaceTypes(
  division: string,
  allTags?: string[],
  drivetrain?: string | null,
  stats?: AutoTagStats | null,
): { race: RaceType; score: number }[] {
  const autoTags = getAutoTags(division, drivetrain, stats)
  const merged = [...new Set([...autoTags, ...(allTags ?? [])])]

  return RACE_TYPES
    .map((race) => ({ race, score: scoreRaceType(race.recommendedTags, merged) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
}
