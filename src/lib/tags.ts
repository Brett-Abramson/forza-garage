export const CAR_TAGS = [
  // Surface / race-type auto-tags (assigned by getAutoTags)
  'asphalt', 'dirt', 'snow', 'mixed',
  'tight', 'technical', 'long straights',
  'street racing',
  'grip', 'drift', 'drag', 'offroad',
  // User-only personal labels
  'stock', 'tuned', 'needs work',
] as const

export type CarTag = typeof CAR_TAGS[number]

/**
 * Tags assigned automatically by getAutoTags() — surface and race-type tags
 * derived from a car's division and drivetrain.
 *
 * Shown in the Car Database filter chips. User-only labels ('stock', 'tuned',
 * 'needs work') are excluded — they are personal garage annotations with no
 * meaning when browsing the full database.
 */
export const AUTO_TAGS = [
  'asphalt', 'dirt', 'snow', 'mixed',
  'tight', 'technical', 'long straights',
  'street racing',
  'grip', 'drift', 'drag', 'offroad',
] as const

export type AutoTag = typeof AUTO_TAGS[number]
