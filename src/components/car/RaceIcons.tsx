'use client'

import React from 'react'

/**
 * Race-type icons — a 16×16 currentColor SVG set that replaces the emoji
 * fallbacks in races.ts (icon: "🏁" etc.). Same visual language as the nav
 * icons in table-ui.tsx: solid geometric primitives, fill="currentColor",
 * the occasional round-cap stroke. Size with width/height or font-size + em.
 *
 * Drop this in src/components/ and map by race id:
 *   import { RACE_ICONS } from '@/components/car/RaceIcons'
 *   const Icon = RACE_ICONS[race.id]
 *   <Icon />
 */

type IconProps = { className?: string; size?: number }

const base = (size?: number) => ({
  width: size ?? 16,
  height: size ?? 16,
  viewBox: '0 0 16 16',
  'aria-hidden': true as const,
})

/** Road Racing — checkered flag */
export function RoadIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor" className={className}>
      <rect x="2.2" y="1" width="1.4" height="14" rx="0.7" />
      <rect x="4.6" y="2" width="9" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="4.6" y="2" width="3" height="3" />
      <rect x="10.6" y="2" width="3" height="3" />
      <rect x="7.6" y="5" width="3" height="3" />
    </svg>
  )
}

/** Street Racing — city skyline */
export function StreetIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor" className={className}>
      <rect x="1.5" y="6" width="3.4" height="8" rx="0.4" />
      <rect x="5.8" y="2.5" width="3.8" height="11.5" rx="0.4" />
      <rect x="10.4" y="8" width="3.8" height="6" rx="0.4" />
    </svg>
  )
}

/** Dirt Racing — forest pine (rally stage) */
export function DirtIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor" className={className}>
      <polygon points="8,1.5 12,7 4,7" />
      <polygon points="8,5 13.5,12 2.5,12" />
      <rect x="7.2" y="12" width="1.6" height="2.6" />
    </svg>
  )
}

/** Cross Country — mountain range */
export function CrossCountryIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor" className={className}>
      <polygon points="5,2.5 10,13 0,13" />
      <polygon points="11,5.5 16,13 6,13" />
    </svg>
  )
}

/** Drift Zones — twin skid marks */
export function DriftIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className}>
      <path d="M2 11 C5 6.6 9.5 6.1 14 8.6" />
      <path d="M2 13.8 C5 9.4 9.5 8.9 14 11.4" />
    </svg>
  )
}

/** Touge Racing — hairpin bend */
export function TougeIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M5 14 L5 7.5 C5 3.5 11 3.5 11 7.5 L11 14" />
    </svg>
  )
}

/** Drag Racing — start-light tree */
export function DragIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor" className={className}>
      <rect x="5" y="1" width="6" height="14" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="4.3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="11.7" r="1.5" />
    </svg>
  )
}

/** Wristband Event — festival wristband (no discipline equivalent in races.ts) */
export function WristbandIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="10" height="10" rx="5" />
      <circle cx="8" cy="8" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Keyed by RaceType.id from races.ts */
export const RACE_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  road: RoadIcon,
  street: StreetIcon,
  dirt: DirtIcon,
  crosscountry: CrossCountryIcon,
  drift: DriftIcon,
  touge: TougeIcon,
  drag: DragIcon,
}

/**
 * Keyed by the Track model's exact `raceType` string (distinct id space from
 * RaceType.id above — Track rows use "Street Race" etc., not "street").
 * Reuses the same glyphs; only Wristband Event has no discipline equivalent.
 */
export const TRACK_TYPE_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  'Street Race': StreetIcon,
  'Road Race': RoadIcon,
  'Touge Race': TougeIcon,
  'Drag Race': DragIcon,
  'Dirt Race': DirtIcon,
  'Cross Country': CrossCountryIcon,
  'Wristband Event': WristbandIcon,
}

/** Renders the icon for a Track.raceType string, or nothing if unrecognized. */
export function TrackTypeIcon({ raceType, className, size }: { raceType: string } & IconProps) {
  const Icon = TRACK_TYPE_ICONS[raceType]
  if (!Icon) return null
  return <Icon className={className} size={size} />
}

/**
 * Drop-in renderer with emoji fallback. Prefers the SVG icon when one exists
 * for the race id; otherwise renders the race's `icon` emoji from races.ts —
 * so a newly-added race type still shows something until its icon is drawn.
 *
 *   import { RaceIcon } from '@/components/car/RaceIcons'
 *   <RaceIcon id={race.id} emoji={race.icon} />
 */
export function RaceIcon({
  id,
  emoji,
  className,
  size,
}: {
  id: string
  emoji?: string
  className?: string
  size?: number
}) {
  const Icon = RACE_ICONS[id]
  if (Icon) return <Icon className={className} size={size} />
  return (
    <span className={className} aria-hidden style={{ fontSize: size ? `${size}px` : undefined, lineHeight: 1 }}>
      {emoji}
    </span>
  )
}
