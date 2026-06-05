import { CAR_TAGS, type CarTag } from "./tags"

export type TagSource = "auto" | "user"

// ─────────────────────────────────────────────────────────────────────────────
// Division → default tags
//
// Mapping updated to the v2 reference (June 2026). Key changes:
//   - "street racing" tag added for hot hatch / sports / saloon divisions
//   - Rally divisions (Modern Rally, Classic Rally, Retro Rally) now include
//     "offroad" alongside "dirt" — AWD rally cars are competitive off-road
//   - Sports Utility Heroes moved to asphalt (road-circuit racing in FH6)
//   - Drift Cars stripped to drift only (was also asphalt, tight)
//   - Muscle divisions simplified to asphalt + drag (removed long straights)
//   - Any division absent from this list falls back to ["asphalt"] in code
// ─────────────────────────────────────────────────────────────────────────────

const DIVISION_TAGS: Record<string, CarTag[]> = {
  // ── Hypercars / Supercars ─────────────────────────────────────────────────
  "Hypercars":              ["asphalt", "long straights"],
  "Modern Supercars":       ["asphalt"],
  "Retro Supercars":        ["asphalt"],

  // ── Track / GT ────────────────────────────────────────────────────────────
  "Extreme Track Toys":     ["asphalt", "technical"],
  "Track Toys":             ["asphalt"],
  "Classic Racers":         ["asphalt"],
  "Retro Racers":           ["asphalt"],
  "Super GT":               ["asphalt", "long straights"],
  "GT Cars":                ["asphalt"],
  "Modern Super Saloons":   ["asphalt", "street racing"],
  "Retro Super Saloons":    ["asphalt"],

  // ── Sports cars ───────────────────────────────────────────────────────────
  "Modern Sports Cars":     ["asphalt", "street racing"],
  "Retro Sports Cars":      ["asphalt", "street racing"],
  "Classic Sports Cars":    ["asphalt", "street racing"],
  "Sports Utility Heroes":  ["asphalt"],

  // ── Hot Hatch ─────────────────────────────────────────────────────────────
  "Super Hot Hatch":        ["asphalt", "street racing", "tight"],
  "Retro Hot Hatch":        ["asphalt", "street racing", "tight"],
  "Hot Hatch":              ["asphalt", "street racing", "tight"],

  // ── Muscle / Drag ─────────────────────────────────────────────────────────
  "Modern Muscle":          ["asphalt", "drag"],
  "Retro Muscle":           ["asphalt", "drag"],
  "Classic Muscle":         ["asphalt", "drag"],

  // ── Rally ─────────────────────────────────────────────────────────────────
  "Rally Monsters":         ["dirt", "offroad", "mixed"],
  "Modern Rally":           ["dirt", "offroad", "mixed"],
  "Classic Rally":          ["dirt", "offroad", "mixed"],
  // Retro Rally is not in the v2 reference but is clearly a rally division
  "Retro Rally":            ["dirt", "offroad", "mixed"],

  // ── Off-road ──────────────────────────────────────────────────────────────
  "Unlimited Offroad":      ["offroad", "mixed", "dirt"],
  "Unlimited Buggies":      ["offroad", "mixed"],
  "Buggies":                ["offroad", "dirt"],
  "Offroad":                ["offroad", "mixed", "dirt"],
  "Pickups & 4x4s":         ["offroad", "mixed", "dirt"],
  "UTVs":                   ["offroad", "dirt"],

  // ── Drift ─────────────────────────────────────────────────────────────────
  "Drift Cars":             ["drift"],
  "Formula Drift":          ["drift"],

  // ── Miscellaneous ─────────────────────────────────────────────────────────
  // Divisions below are not in the v2 reference; "asphalt" is the safe default
  // per spec ("any division not in this list should get asphalt").
  "Rods and Customs":       ["asphalt"],
  "Cult Cars":              ["asphalt"],
  "Eclectic Domestics":     ["asphalt", "tight"],
  "Rare Classics":          ["asphalt"],
  "Utility Heroes":         ["asphalt"],

  // Legacy key aliases — kept for any existing CarTag rows with old division names
  "Pickups & 4x4's":        ["offroad", "mixed", "dirt"],
  "UTV's":                  ["offroad", "dirt"],
}

// ─────────────────────────────────────────────────────────────────────────────
// Drivetrain → additional tags
// ─────────────────────────────────────────────────────────────────────────────

const DRIVETRAIN_TAGS: Record<string, CarTag[]> = {
  RWD: ["drift"],
  AWD: ["dirt", "offroad"],
  FWD: ["tight", "street racing"],
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — returns deduplicated auto tags for a car
// drivetrain is optional — pass it when the data exists
// ─────────────────────────────────────────────────────────────────────────────

export function getAutoTags(
  division: string,
  drivetrain?: string
): CarTag[] {
  const divisionTags = DIVISION_TAGS[division] ?? ["asphalt"] // safe default
  const drivetrainTags = drivetrain ? (DRIVETRAIN_TAGS[drivetrain] ?? []) : []

  // Merge and deduplicate
  const merged = [...new Set([...divisionTags, ...drivetrainTags])]

  // Safety filter — only return tags that exist in CAR_TAGS
  return merged.filter((t): t is CarTag => CAR_TAGS.includes(t as CarTag))
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — splits a car's tags into auto vs user for display purposes
// ─────────────────────────────────────────────────────────────────────────────

export function splitTagsBySource(
  allTags: { tag: string; source: string }[]
) {
  return {
    auto: allTags.filter((t) => t.source === "auto").map((t) => t.tag),
    user: allTags.filter((t) => t.source === "user").map((t) => t.tag),
  }
}
