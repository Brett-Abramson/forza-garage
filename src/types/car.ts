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

  // Identity
  value: number | null   // purchase price in credits
  rarity: string | null  // Common | Rare | Legendary | Forza Edition

  owned: boolean
  addedAt?: string | null   // ISO string from UserGarage.addedAt (garage only)
  tags?: string[]
  tagDetails?: { tag: string; source: string }[]
  notes?: string | null
}

export interface FilterState {
  search: string
  piClass: string
  division: string
  make: string
  drivetrain: string
  country: string
  source: string   // empty = all; non-empty = car.source.includes(value)
  owned: 'all' | 'owned' | 'not-owned'
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
  R:  'bg-cyan-400 text-black',   // R class — confirm colour if wrong
}

// Color the source badge by how hard the car is to obtain
export function getSourceColor(source: string): string {
  if (source.includes('DLC')) return 'text-fh-red'
  if (source.includes('Loyalty')) return 'text-purple-400'
  if (source.includes('Seasonal')) return 'text-amber-400'
  if (source.includes('Collection Journal')) return 'text-blue-400'
  return 'text-fh-muted'
}
