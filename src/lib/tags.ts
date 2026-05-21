export const CAR_TAGS = [
  'asphalt', 'dirt', 'snow', 'mixed',
  'tight', 'technical', 'long straights',
  'grip', 'drift', 'drag', 'offroad',
  'stock', 'tuned', 'needs work',
] as const

export type CarTag = typeof CAR_TAGS[number]
