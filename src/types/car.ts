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
  owned: boolean
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
  owned: 'all' | 'owned' | 'not-owned'
}

export const PI_CLASS_ORDER: PiClass[] = ['D', 'C', 'B', 'A', 'S1', 'S2', 'R']

export const PI_CLASS_COLORS: Record<string, string> = {
  D: 'bg-gray-500 text-white',
  C: 'bg-green-600 text-white',
  B: 'bg-blue-600 text-white',
  A: 'bg-purple-600 text-white',
  S1: 'bg-orange-500 text-white',
  S2: 'bg-red-600 text-white',
  R: 'bg-yellow-400 text-black',
}

// Color the source badge by how hard the car is to obtain
export function getSourceColor(source: string): string {
  if (source.includes('DLC')) return 'text-cyan-400'
  if (source.includes('Loyalty')) return 'text-purple-400'
  if (source.includes('Seasonal')) return 'text-amber-400'
  if (source.includes('Collection Journal')) return 'text-blue-400'
  return 'text-gray-500'
}
