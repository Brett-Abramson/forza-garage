import { CAR_TAGS, type CarTag } from "./tags"

export type TagSource = "auto" | "user"

/**
 * Stat fields from the Car model used to refine and extend division-based tags.
 * All fields are nullable — cars without scraped stats degrade gracefully to
 * division-only tags, which are already more accurate than v2's drivetrain system.
 */
export type AutoTagStats = {
  statSpeed?:         number | null
  statHandling?:      number | null
  statAcceleration?:  number | null
  statLaunch?:        number | null
  statBraking?:       number | null
  statOffroad?:       number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat thresholds — all magic numbers in one place
//
// All values are on the in-game 0–10 stat scale.
//
// Observed baselines from scrape data:
//   statOffroad ≈ 5.0–5.4   road cars (Civic, 911 RS, M3, Countach…)
//   statOffroad ≈ 5.5–6.5   rally-capable or light SUVs (Rallye Golf, Cayenne…)
//   statOffroad ≈ 7.5–10    genuine off-road vehicles (F-150, X-Raid, Quattro S1…)
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  // statOffroad gates
  OFFROAD_DIRT:     6.0,  // ≥ this on an asphalt car → eligible for 'dirt'
  OFFROAD_MIXED:    6.0,  // ≥ this on an asphalt car → eligible for 'mixed'
  OFFROAD_TAG:      7.5,  // ≥ this → 'offroad' tag (genuine off-road capability)

  // statHandling gates
  HANDLING_TECH:    7.5,  // ≥ this → 'technical' (exceptional cornering precision)
  HANDLING_TIGHT:   7.5,  // ≥ this → 'tight' (only if not a long-straights car)
  // RWD drift gate — at/above this the car is a grip racer; skip auto-drift
  HANDLING_NODRIFT: 7.0,

  // statSpeed gate
  SPEED_STRAIGHTS:  8.5,  // ≥ this → 'long straights' (genuinely fast on long runs)

  // Drag gate — both must pass for non-muscle divisions
  LAUNCH_DRAG:      8.0,  // statLaunch ≥ this…
  ACCEL_DRAG:       8.0,  // …AND statAcceleration ≥ this → 'drag'
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Division → base tags
//
// Represents the PRIMARY racing context for each division in FH6.
// Stats extend this set in getAutoTags(); drivetrain only influences 'drift'.
//
// Key changes vs. v2 (division + drivetrain only):
//
//   • 'grip' added to every asphalt road-racing division.
//     Previously absent from ALL divisions, which meant road/touge/street race
//     types could never score above 1 for any car — the entire scoring system
//     was effectively broken for non-hatch non-rally cars.
//
//   • 'long straights' added to hypercar, super GT, track toy, racer, and
//     muscle divisions. This gives Road Racing a clean 3–4 point score for
//     cars that belong there, and critically prevents the Touge race type
//     (asphalt + tight + technical + grip) from stealing the top slot.
//
//   • 'technical' added to dedicated racers and track toys.
//
//   • Rally base is 'dirt, mixed' only — 'offroad' is stat-earned (≥ OFFROAD_TAG).
//     Only genuine rally monsters (Quattro S1, Peugeot 205 T16…) earn it.
//     Lighter retro/classic rally cars don't, which is accurate.
//
//   • Sports Utility Heroes: 'asphalt, grip' — road-circuit racing in FH6.
//     Off-road tags added by statOffroad where the car actually backs it up.
//
//   • Drift divisions keep 'asphalt, drift'. No drivetrain additions required.
//
// Any division not listed falls back to ["asphalt"].
// ─────────────────────────────────────────────────────────────────────────────

const DIVISION_BASE: Record<string, CarTag[]> = {
  // ── Hypercars / Super GT ──────────────────────────────────────────────────
  // long straights included so Road Racing scores 3+ and beats Touge/Street
  "Hypercars":              ["asphalt", "grip", "long straights"],
  "Modern Supercars":       ["asphalt", "grip", "long straights"],
  "Retro Supercars":        ["asphalt", "grip", "long straights"],
  "Super GT":               ["asphalt", "grip", "long straights"],

  // ── Track / Dedicated Racers ──────────────────────────────────────────────
  // technical + long straights → Road Racing scores 4/4 (perfect match)
  "Track Toys":             ["asphalt", "grip", "technical", "long straights"],
  "Extreme Track Toys":     ["asphalt", "grip", "technical", "long straights"],
  "Classic Racers":         ["asphalt", "grip", "technical", "long straights"],
  "Retro Racers":           ["asphalt", "grip", "technical", "long straights"],
  // GT Cars are fast touring cars; long straights keeps Road Racing primary
  "GT Cars":                ["asphalt", "grip", "long straights"],

  // ── Saloons ───────────────────────────────────────────────────────────────
  // street racing makes Street score 3, ahead of Road (2) — correct for M5 / RS6
  "Modern Super Saloons":   ["asphalt", "grip", "street racing"],
  "Retro Super Saloons":    ["asphalt", "grip", "street racing"],

  // ── Sports Cars ───────────────────────────────────────────────────────────
  "Modern Sports Cars":     ["asphalt", "grip", "street racing"],
  "Retro Sports Cars":      ["asphalt", "grip", "street racing"],
  "Classic Sports Cars":    ["asphalt", "grip", "street racing"],

  // ── Hot Hatch ─────────────────────────────────────────────────────────────
  // tight + street racing → Street scores 4/5, Touge scores 3 — correct
  "Super Hot Hatch":        ["asphalt", "grip", "tight", "street racing"],
  "Hot Hatch":              ["asphalt", "grip", "tight", "street racing"],
  "Retro Hot Hatch":        ["asphalt", "grip", "tight", "street racing"],

  // ── Muscle / Drag ─────────────────────────────────────────────────────────
  // drag + long straights → Drag scores 3/3 (perfect), Street/Road score 1
  "Classic Muscle":         ["asphalt", "drag", "long straights"],
  "Retro Muscle":           ["asphalt", "drag", "long straights"],
  "Modern Muscle":          ["asphalt", "drag", "long straights"],

  // ── SUV ───────────────────────────────────────────────────────────────────
  // Road-circuit racing context in FH6 per game data. Off-road tags added
  // by statOffroad gates below for cars that actually clear the threshold.
  "Sports Utility Heroes":  ["asphalt", "grip"],

  // ── Rally ─────────────────────────────────────────────────────────────────
  // 'offroad' is stat-earned only (≥ T.OFFROAD_TAG = 7.5). Only serious
  // rally weapons clear it — lighter retro/classic cars correctly don't.
  "Rally Monsters":         ["dirt", "mixed"],
  "Modern Rally":           ["dirt", "mixed"],
  "Classic Rally":          ["dirt", "mixed"],
  "Retro Rally":            ["dirt", "mixed"],

  // ── Dedicated Off-Road ────────────────────────────────────────────────────
  "Unlimited Offroad":      ["offroad", "mixed", "dirt"],
  "Unlimited Buggies":      ["offroad", "mixed"],
  "Buggies":                ["offroad", "dirt"],
  "Offroad":                ["offroad", "mixed", "dirt"],
  // Pickups also race on sealed roads (truck events)
  "Pickups & 4x4s":         ["offroad", "mixed", "dirt", "asphalt"],
  "Pickups & 4x4's":        ["offroad", "mixed", "dirt", "asphalt"],  // legacy alias
  "UTVs":                   ["offroad", "dirt"],
  "UTV's":                  ["offroad", "dirt"],                       // legacy alias

  // ── Drift ─────────────────────────────────────────────────────────────────
  "Drift Cars":             ["asphalt", "drift"],
  "Formula Drift":          ["asphalt", "drift"],

  // ── Miscellaneous ─────────────────────────────────────────────────────────
  // Rods/Cult/Rare get grip so Road Racing wins the default tie over Drift/Drag.
  // Eclectic Domestics and Utility Heroes are practical cars — asphalt only.
  "Rods and Customs":       ["asphalt", "grip"],
  "Cult Cars":              ["asphalt", "grip"],
  "Rare Classics":          ["asphalt", "grip"],
  "Eclectic Domestics":     ["asphalt"],
  "Utility Heroes":         ["asphalt"],
}

// ─────────────────────────────────────────────────────────────────────────────
// Divisions excluded from RWD → 'drift' auto-addition
//
// (a) Already drift — covered by DIVISION_BASE
// (b) High-performance grip racers — RWD here means corner precision, not
//     oversteer. A Lamborghini Countach is a road racer with RWD, not a drift
//     car. Same for any Track Toy or GT-spec racer.
// (c) Non-asphalt / wrong discipline context
// (d) Miscellaneous — too diverse for a blanket drift suggestion. A BMW Isetta
//     or 1973 Porsche 911 RS shouldn't auto-suggest Drift Zones. Users who
//     genuinely drift these cars can add the tag manually.
// ─────────────────────────────────────────────────────────────────────────────

const DRIFT_DIV_EXCLUDED = new Set<string>([
  // (a)
  "Drift Cars", "Formula Drift",
  // (b)
  "Hypercars", "Modern Supercars", "Retro Supercars", "Super GT",
  "Track Toys", "Extreme Track Toys",
  "Classic Racers", "Retro Racers", "GT Cars",
  // (c)
  "Sports Utility Heroes",
  "Rally Monsters", "Modern Rally", "Classic Rally", "Retro Rally",
  "Unlimited Offroad", "Unlimited Buggies", "Buggies", "Offroad",
  "Pickups & 4x4s", "Pickups & 4x4's",
  "UTVs", "UTV's",
  // (d)
  "Cult Cars", "Rare Classics",
  "Eclectic Domestics", "Utility Heroes",
])

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the auto-tags for a car. Three-step pipeline:
 *
 *   1. Division base   — what the division is primarily used for in FH6
 *   2. Stat extensions — add tags the car's actual stats genuinely support
 *   3. Drivetrain      — RWD adds 'drift' only where division + handling allow
 *
 * The `stats` parameter is optional. Cars without scraped stats still get
 * accurate division-based defaults — already a significant improvement over
 * the old drivetrain-only system.
 *
 * Signature change from v2: `drivetrain` is now nullable and `stats` is a new
 * optional third parameter. Existing callers `getAutoTags(division, drivetrain)`
 * continue to work without modification.
 */
export function getAutoTags(
  division: string,
  drivetrain?: string | null,
  stats?: AutoTagStats | null,
): CarTag[] {

  // ── Step 1: Division base ─────────────────────────────────────────────────

  const tags = new Set<CarTag>(DIVISION_BASE[division] ?? ["asphalt"])

  // ── Step 2: Stat extensions ───────────────────────────────────────────────
  //
  // Each block is additive and guards against re-adding existing tags.
  //
  // AWD previously auto-added 'dirt' and 'offroad'. That's removed entirely.
  // The statOffroad gates below handle this more accurately: a Mitsubishi GTO
  // in AWD should not get dirt/offroad tags just because it's AWD, but a
  // Porsche Cayenne with statOffroad 6.3 earning 'dirt' and 'mixed' is correct.

  if (stats) {
    const {
      statSpeed        = null,
      statHandling     = null,
      statAcceleration = null,
      statLaunch       = null,
      statOffroad      = null,
    } = stats

    // 'long straights' — very fast cars outside already-speed-oriented divisions
    if (!tags.has("long straights") && statSpeed != null && statSpeed >= T.SPEED_STRAIGHTS) {
      tags.add("long straights")
    }

    // 'technical' — exceptional cornering precision
    if (!tags.has("technical") && statHandling != null && statHandling >= T.HANDLING_TECH) {
      tags.add("technical")
    }

    // 'tight' — high handling, but NOT on cars already oriented toward long straights.
    // The `!tags.has("long straights")` guard catches both:
    //   • Cars with long straights in their division base (hypercars, muscle, GT Cars)
    //   • Cars that just earned long straights from statSpeed above
    // Without this guard, a hypercar with 7.5+ handling would gain 'tight',
    // making Touge score 4 and beating Road Racing for a car that shouldn't be there.
    if (
      !tags.has("tight") &&
      tags.has("asphalt") &&
      !tags.has("long straights") &&
      statHandling != null && statHandling >= T.HANDLING_TIGHT
    ) {
      tags.add("tight")
    }

    // 'offroad' — genuine off-road capability, well above the road-car baseline (~5.x)
    if (!tags.has("offroad") && statOffroad != null && statOffroad >= T.OFFROAD_TAG) {
      tags.add("offroad")
    }

    // 'dirt' + 'mixed' — meaningful mixed-surface involvement.
    // Only applied to asphalt-based cars (rally and dedicated off-road divisions
    // already carry these in their base; the guard prevents duplication).
    if (tags.has("asphalt") && statOffroad != null) {
      if (!tags.has("dirt")  && statOffroad >= T.OFFROAD_DIRT)  tags.add("dirt")
      if (!tags.has("mixed") && statOffroad >= T.OFFROAD_MIXED) tags.add("mixed")
    }

    // 'drag' — exceptional launch + acceleration in non-drag-spec divisions.
    // Muscle already carries 'drag' in its base so this only fires elsewhere.
    if (
      !tags.has("drag") &&
      statLaunch       != null && statLaunch       >= T.LAUNCH_DRAG &&
      statAcceleration != null && statAcceleration >= T.ACCEL_DRAG
    ) {
      tags.add("drag")
    }
  }

  // ── Step 3: Drivetrain — 'drift' only ────────────────────────────────────
  //
  // AWD: no automatic additions. Dirt/offroad are now stat-gated above.
  //
  // FWD: no automatic additions. Hot hatch and sports car divisions already
  //      carry the relevant tags; FWD conveys nothing additional in FH6 context.
  //
  // RWD: conditionally adds 'drift' when all three hold:
  //   • Division is eligible (not in DRIFT_DIV_EXCLUDED)
  //   • Either no stats are available, or statHandling < T.HANDLING_NODRIFT
  //     High-handling RWD supercars are grip racers — not drift builds.

  if (drivetrain === "RWD" && !tags.has("drift") && !DRIFT_DIV_EXCLUDED.has(division)) {
    const handling = stats?.statHandling ?? null
    if (handling === null || handling < T.HANDLING_NODRIFT) {
      tags.add("drift")
    }
  }

  // ── Safety filter ─────────────────────────────────────────────────────────

  return [...tags].filter((t): t is CarTag => CAR_TAGS.includes(t as CarTag))
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