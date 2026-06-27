export type PiClass = 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'R'
export type Drivetrain = 'FWD' | 'RWD' | 'AWD'

export interface Car {
  id: number
  make: string
  model: string
  year: number
  division: string
  piClass: string
  piRating: number
  country: string
  source: string
  sourceInfo: string | null
  // Nullable until filled in
  drivetrain: string | null
  engineType: string | null
  engineCC: number | null
  cylinders: number | null
  bodyStyle: string | null

  // Page 1 — bar stats (0–10 scale, sourced from in-game stat screen)
  statSpeed: number | null
  statHandling: number | null
  statAcceleration: number | null
  statLaunch: number | null
  statBraking: number | null
  statOffroad: number | null

  // Page 2 — raw specs
  powerHp: number | null
  torqueFtLb: number | null
  weightLb: number | null
  frontWeight: number | null  // weight distribution % — e.g. 40 means 40/60 F/R
  displacementL: number | null

  // Simulation results — catalog-only, read-only (from forza.labsgg.com).
  // Never overridden per-user; see src/lib/metrics.ts for the display registry.
  simZeroToSixty: number | null    // seconds  — 0-60 MPH
  simZeroToHundred: number | null  // seconds  — 0-100 MPH
  simBraking60: number | null      // feet     — 60-0 braking distance
  simBraking100: number | null     // feet     — 100-0 braking distance
  simLateralG60: number | null     // G-force  — lateral grip at 60 mph
  simLateralG120: number | null    // G-force  — lateral grip at 120 mph
  simTopSpeed: number | null       // mph      — simulated top speed
  simAeroEfficiency: number | null // ratio    — drag/downforce balance
  simMechBalance: number | null    // ratio    — mechanical grip balance F/R
  simAeroBalance: number | null    // ratio    — aerodynamic balance F/R

  // Identity
  value: number | null   // purchase price in credits
  rarity: string | null  // Common | Rare | Legendary | Forza Edition

  owned: boolean
  badges?: CarBadgeMap      // catalog-level percentile/rank badges, merged at the server boundary
  pinned?: boolean          // garage only — mirrors UserGarage.pinned
  addedAt?: string | null   // ISO string from UserGarage.addedAt (garage only)
  tags?: string[]
  tagDetails?: { tag: string; source: string }[]
  notes?: string | null

  // Per-user stat overrides (garage only — null means "use the shared Car value")
  statSpeedOverride?: number | null
  statHandlingOverride?: number | null
  statAccelerationOverride?: number | null
  statLaunchOverride?: number | null
  statBrakingOverride?: number | null
  statOffroadOverride?: number | null
  powerHpOverride?: number | null
  torqueFtLbOverride?: number | null
  weightLbOverride?: number | null
  frontWeightOverride?: number | null
  displacementLOverride?: number | null
  rarityOverride?: string | null
}

// ── Stat-percentile badge types ───────────────────────────────────────────────
// Defined here (not in statPercentiles.ts) to avoid a circular import; Car
// needs to carry badges and statPercentiles.ts imports Car.
export interface CarBadge {
  kind: 'percentile' | 'rank'
  tier: 'top-strong' | 'top-soft' | 'neutral' | 'bottom-soft' | 'bottom-strong'
  label: string   // e.g. "top 10% braking · B (stock)" or "#2 braking · R (stock)"
  rank: number    // competition rank within the cohort (for single-best selection)
  n: number       // cohort size with non-null values
}
export type CarBadgeMap = Partial<Record<string, CarBadge>>

export interface FilterState {
  search: string
  piClass: string[]
  division: string[]
  make: string[]
  drivetrain: string
  country: string
  source: string   // empty = all; non-empty = car.source.includes(value)
  owned: 'all' | 'owned' | 'not-owned'
  pinned: boolean  // garage only — true = show only pinned/favourite cars
  yearMin: number | null  // inclusive lower bound; null = no lower bound
  yearMax: number | null  // inclusive upper bound; null = no upper bound
  hasTopBadge: boolean    // when true, show only cars that hold at least one percentile/rank badge
  // Sim metric range filters — null = no bound; cars with null sim values are excluded when a bound is active
  simZeroToSixtyMin: number | null
  simZeroToSixtyMax: number | null
  simZeroToHundredMin: number | null
  simZeroToHundredMax: number | null
  simBraking60Min: number | null
  simBraking60Max: number | null
  simLateralG60Min: number | null
  simLateralG60Max: number | null
  simTopSpeedMin: number | null
  simTopSpeedMax: number | null
}

// Broad acquisition-method categories used for source chips
export const SOURCE_CHIPS = [
  { label: 'Autoshow',  match: 'Autoshow'            },
  { label: 'DLC',       match: 'DLC'                 },
  { label: 'Seasonal',  match: 'Seasonal'             },
  { label: 'Loyalty',   match: 'Loyalty'              },
  { label: 'Journal',   match: 'Collection Journal'   },
] as const

export const PI_CLASS_ORDER: PiClass[] = ['D', 'C', 'B', 'A', 'S1', 'S2', 'R']

export const PI_CLASS_COLORS: Record<string, string> = {
  D:  'bg-sky-400 text-black',
  C:  'bg-yellow-400 text-black',
  B:  'bg-orange-500 text-white',
  A:  'bg-red-600 text-white',
  S1: 'bg-purple-600 text-white',
  S2: 'bg-blue-600 text-white',
  R:  'bg-[#D4018B] text-white',
}

// Raw accent color per PI class — for places that need an actual CSS color value
// rather than a Tailwind class string (e.g. the garage drawer header's left-border
// stripe). Mirrors the bg- hues in PI_CLASS_COLORS.
export const PI_CLASS_HEX: Record<string, string> = {
  D:  '#38bdf8', // sky-400
  C:  '#facc15', // yellow-400
  B:  '#f97316', // orange-500
  A:  '#dc2626', // red-600
  S1: '#9333ea', // purple-600
  S2: '#2563eb', // blue-600
  R:  '#D4018B',
}

// Color the source badge by how hard the car is to obtain
export function getSourceColor(source: string): string {
  if (source.includes('DLC')) return 'text-fh-red'
  if (source.includes('Loyalty')) return 'text-purple-400'
  if (source.includes('Seasonal')) return 'text-amber-400'
  if (source.includes('Collection Journal')) return 'text-blue-400'
  return 'text-fh-muted'
}
