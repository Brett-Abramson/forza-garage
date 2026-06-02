import { CAR_TAGS, type CarTag } from "./tags"

export type TagSource = "auto" | "user"

// ─────────────────────────────────────────────────────────────────────────────
// Division → default tags
// Based on FH6 division names from the official car list
// ─────────────────────────────────────────────────────────────────────────────

const DIVISION_TAGS: Record<string, CarTag[]> = {
  // Off-road
  "Unlimited Offroad":      ["offroad", "mixed", "dirt"],
  "Unlimited Buggies":      ["offroad", "mixed", "dirt"],
  "Buggies":                ["offroad", "dirt"],
  "Offroad":                ["offroad", "mixed", "dirt"],
  "Pickups & 4x4s":         ["offroad", "mixed"],
  "UTVs":                   ["offroad", "dirt"],
  "Sports Utility Heroes":  ["offroad", "mixed"],

  // Rally
  "Rally Monsters":         ["dirt", "offroad", "mixed"],
  "Classic Rally":          ["dirt", "mixed"],
  "Retro Rally":            ["dirt", "mixed"],
  "Modern Rally":           ["dirt", "mixed"],

  // Drift
  "Drift Cars":             ["drift", "asphalt", "tight"],

  // Drag / Muscle
  "Classic Muscle":         ["asphalt", "long straights", "drag"],
  "Retro Muscle":           ["asphalt", "long straights", "drag"],
  "Modern Muscle":          ["asphalt", "long straights", "drag"],

  // Hot Hatch
  "Hot Hatch":              ["asphalt", "tight", "technical", "grip"],
  "Super Hot Hatch":        ["asphalt", "tight", "technical", "grip"],
  "Retro Hot Hatch":        ["asphalt", "tight", "technical"],

  // Sports / GT
  "Classic Sports Cars":    ["asphalt", "grip", "technical", "tight"],
  "Retro Sports Cars":      ["asphalt", "grip", "technical", "tight"],
  "Modern Sports Cars":     ["asphalt", "grip", "technical"],
  "GT Cars":                ["asphalt", "grip", "long straights"],
  "Super GT":               ["asphalt", "grip", "long straights"],

  // Supercars / Hypercars
  "Retro Supercars":        ["asphalt", "grip", "long straights"],
  "Modern Supercars":       ["asphalt", "grip", "long straights"],
  "Hypercars":              ["asphalt", "grip", "long straights"],

  // Track
  "Extreme Track Toys":     ["asphalt", "grip", "technical"],
  "Track Toys":             ["asphalt", "grip", "technical"],

  // Saloons / Sedans
  "Classic Racers":         ["asphalt", "technical"],
  "Retro Racers":           ["asphalt", "technical"],
  "Retro Super Saloons":    ["asphalt", "technical"],
  "Modern Super Saloons":   ["asphalt", "grip", "technical"],

  // Misc
  "Rods and Customs":       ["asphalt"],
  "Cult Cars":              ["asphalt"],
  "Eclectic Domestics":     ["asphalt", "tight"],
  "Rare Classics":          ["asphalt"],
  "Classic Street Cars":    ["asphalt", "tight"],
  "Utility Heroes":         ["mixed"],

  // Legacy key aliases — kept for any existing CarTag data that may reference old names
  "Pickups & 4x4's":        ["offroad", "mixed"],
  "UTV's":                  ["offroad", "dirt"],
}

// ─────────────────────────────────────────────────────────────────────────────
// Drivetrain → additional tags
// Call this when drivetrain data becomes available
// ─────────────────────────────────────────────────────────────────────────────

const DRIVETRAIN_TAGS: Record<string, CarTag[]> = {
  RWD: ["drift"],
  AWD: ["dirt", "offroad"],
  FWD: ["tight", "technical"],
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — returns deduplicated auto tags for a car
// drivetrain is optional — pass it when the data exists
// ─────────────────────────────────────────────────────────────────────────────

export function getAutoTags(
  division: string,
  drivetrain?: string
): CarTag[] {
  const divisionTags = DIVISION_TAGS[division] ?? []
  const drivetrainTags = drivetrain ? (DRIVETRAIN_TAGS[drivetrain] ?? []) : []

  // Merge and deduplicate
  const merged = [...new Set([...divisionTags, ...drivetrainTags])]

  // Safety filter — only return tags that exist in CAR_TAGS
  return merged.filter((t): t is CarTag => CAR_TAGS.includes(t as CarTag))
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — splits a car's tags into auto vs user for display purposes
// Use this in the drawer/row expand to render them differently
// ─────────────────────────────────────────────────────────────────────────────

export function splitTagsBySource(
  allTags: { tag: string; source: string }[]
) {
  return {
    auto: allTags.filter((t) => t.source === "auto").map((t) => t.tag),
    user: allTags.filter((t) => t.source === "user").map((t) => t.tag),
  }
}