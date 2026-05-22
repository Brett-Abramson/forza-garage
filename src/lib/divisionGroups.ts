export interface DivisionGroup {
  id: string
  name: string
  icon: string
  divisions: string[]
}

export const DIVISION_GROUPS: DivisionGroup[] = [
  {
    id: 'supercars',
    name: 'Supercars',
    icon: '🏎️',
    divisions: ['Retro Supercars', 'Modern Supercars', 'Hypercars'],
  },
  {
    id: 'sports',
    name: 'Sports Cars',
    icon: '🚗',
    divisions: ['Classic Sports Cars', 'Retro Sports Cars', 'Modern Sports Cars'],
  },
  {
    id: 'hotHatch',
    name: 'Hot Hatches',
    icon: '🔥',
    divisions: ['Retro Hot Hatch', 'Hot Hatch', 'Super Hot Hatch'],
  },
  {
    id: 'muscle',
    name: 'Muscle Cars',
    icon: '💪',
    divisions: ['Classic Muscle', 'Retro Muscle', 'Modern Muscle'],
  },
  {
    id: 'gt',
    name: 'GT & Saloons',
    icon: '🏁',
    divisions: [
      'GT Cars',
      'Super GT',
      'Classic Racers',
      'Retro Racers',
      'Retro Super Saloons',
      'Modern Super Saloons',
    ],
  },
  {
    id: 'track',
    name: 'Track Cars',
    icon: '⏱️',
    divisions: ['Track Toys', 'Extreme Track Toys'],
  },
  {
    id: 'rally',
    name: 'Rally',
    icon: '🌲',
    divisions: ['Classic Rally', 'Retro Rally', 'Rally Monsters'],
  },
  {
    id: 'offroad',
    name: 'Off-Road',
    icon: '🏔️',
    divisions: [
      'Unlimited Offroad',
      'Unlimited Buggies',
      "Pickups & 4x4's",
      "UTV's",
      'Sports Utility Heroes',
    ],
  },
  {
    id: 'drift',
    name: 'Drift',
    icon: '💨',
    divisions: ['Drift Cars'],
  },
  {
    id: 'misc',
    name: 'Misc',
    icon: '🚙',
    divisions: [
      'Cult Cars',
      'Rare Classics',
      'Rods and Customs',
      'Eclectic Domestics',
      'Utility Heroes',
    ],
  },
]

// Helper — given a division string returns its parent group or null
export function getGroupForDivision(division: string): DivisionGroup | null {
  return DIVISION_GROUPS.find((g) => g.divisions.includes(division)) ?? null
}

// Helper — given a group id returns all division strings in it
export function getDivisionsForGroup(groupId: string): string[] {
  return DIVISION_GROUPS.find((g) => g.id === groupId)?.divisions ?? []
}
