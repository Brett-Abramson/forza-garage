export const CAR_TAGS = [
  'asphalt', 'dirt', 'snow', 'mixed',
  'tight', 'technical', 'long straights',
  'grip', 'drift', 'drag', 'offroad',
  'stock', 'tuned', 'needs work',
] as const

export type CarTag = typeof CAR_TAGS[number]

/**
 * Tags assigned automatically by getAutoTags() — surface and race-type tags
 * derived from a car's division and drivetrain.
 *
 * These are the only tags shown in the Car Database filter UI because
 * every car already has them computed at load time. 'stock', 'tuned', and
 * 'needs work' are excluded here — they are user-applied personal labels
 * that have no meaning when browsing the full car database.
 */
export const AUTO_TAGS = [
  'asphalt', 'dirt', 'snow', 'mixed',
  'tight', 'technical', 'long straights',
  'grip', 'drift', 'drag', 'offroad',
] as const

export type AutoTag = typeof AUTO_TAGS[number]
