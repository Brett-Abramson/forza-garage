import type { Car } from '@/types/car'

export interface StatCallout {
  id:    string
  title: string
  body:  string
}

// ── Lookup data ───────────────────────────────────────────────────────────────

export interface StatAvg {
  speed?:    number
  handling?: number
  accel?:    number
  launch?:   number
  braking?:  number
  offroad?:  number
}

// Nested: division → piClass → per-stat averages derived from production data (618 cars).
export const DIVISION_CLASS_AVERAGES: Record<string, Partial<Record<string, StatAvg>>> = {
  'Buggies': {
    D: { speed: 3.30, handling: 4.10, accel: 2.70, launch: 5.00, braking: 2.85, offroad: 7.10 },
  },
  'Classic Muscle': {
    D: { speed: 5.10, handling: 3.77, accel: 3.33, launch: 2.73, braking: 2.30, offroad: 5.73 },
    C: { speed: 5.25, handling: 3.60, accel: 3.47, launch: 3.19, braking: 2.58, offroad: 5.50 },
    B: { speed: 4.65, handling: 3.70, accel: 4.00, launch: 3.60, braking: 3.00, offroad: 5.55 },
  },
  'Classic Racers': {
    C: { speed: 6.40, handling: 3.60, accel: 3.50, launch: 2.50, braking: 2.80, offroad: 5.40 },
    B: { speed: 6.20, handling: 3.90, accel: 4.53, launch: 3.77, braking: 3.18, offroad: 4.98 },
    A: { speed: 7.35, handling: 4.50, accel: 5.30, launch: 4.70, braking: 4.00, offroad: 5.00 },
    S1: { speed: 8.05, handling: 5.85, accel: 6.85, launch: 6.55, braking: 5.25, offroad: 4.70 },
  },
  'Classic Rally': {
    D: { speed: 3.97, handling: 3.77, accel: 3.40, launch: 3.13, braking: 2.70, offroad: 5.43 },
    C: { speed: 5.15, handling: 4.10, accel: 4.40, launch: 3.95, braking: 3.10, offroad: 5.85 },
  },
  'Classic Sports Cars': {
    D: { speed: 4.10, handling: 4.09, accel: 2.89, launch: 2.38, braking: 2.51, offroad: 5.62 },
    C: { speed: 5.00, handling: 4.03, accel: 3.60, launch: 2.17, braking: 2.77, offroad: 5.87 },
    B: { speed: 5.90, handling: 4.90, accel: 4.80, launch: 5.00, braking: 4.20, offroad: 4.90 },
  },
  'Cult Cars': {
    D: { speed: 2.30, handling: 3.32, accel: 1.68, launch: 2.63, braking: 3.12, offroad: 5.30 },
  },
  'Drift Cars': {
    A:  { speed: 7.30, handling: 5.20, accel: 5.20, launch: 3.40, braking: 4.30, offroad: 5.20 },
    S1: { speed: 6.74, handling: 4.98, accel: 5.11, launch: 4.97, braking: 5.04, offroad: 4.37 },
    S2: { speed: 7.90, handling: 6.10, accel: 5.60, launch: 6.00, braking: 7.90, offroad: 4.20 },
  },
  'Eclectic Domestics': {
    D: { speed: 3.44, handling: 4.24, accel: 2.39, launch: 2.45, braking: 2.99, offroad: 5.80 },
  },
  'Extreme Track Toys': {
    S1: { speed: 5.40, handling: 8.10, accel: 5.40, launch: 2.80, braking: 10.00, offroad: 5.00 },
    S2: { speed: 7.43, handling: 8.71, accel: 7.31, launch: 7.13, braking:  9.42, offroad: 4.56 },
    R:  { speed: 7.62, handling: 9.24, accel: 8.01, launch: 7.24, braking:  9.92, offroad: 4.73 },
  },
  'GT Cars': {
    B: { speed: 7.00, handling: 5.30, accel: 4.80, launch: 5.00, braking: 4.40, offroad: 5.20 },
    A: { speed: 7.36, handling: 5.58, accel: 6.98, launch: 8.20, braking: 5.28, offroad: 5.34 },
  },
  'Hot Hatch': {
    D: { speed: 3.20, handling: 4.60, accel: 2.70, launch: 3.20, braking: 3.30, offroad: 5.70 },
    C: { speed: 5.40, handling: 4.87, accel: 4.13, launch: 3.90, braking: 3.70, offroad: 5.40 },
    B: { speed: 5.60, handling: 5.08, accel: 4.60, launch: 4.39, braking: 4.19, offroad: 5.31 },
  },
  'Hypercars': {
    S1: { speed: 8.06, handling: 7.20, accel: 8.58, launch: 7.62, braking: 7.90, offroad: 5.02 },
    S2: { speed: 9.20, handling: 7.57, accel: 7.59, launch: 7.89, braking: 8.57, offroad: 4.86 },
    R:  { speed: 8.70, handling: 8.20, accel: 8.00, launch: 8.60, braking: 9.66, offroad: 4.72 },
  },
  'Modern Muscle': {
    A:  { speed: 7.22, handling: 5.08, accel: 5.02, launch: 4.62, braking: 4.70, offroad: 5.17 },
    S1: { speed: 7.60, handling: 5.87, accel: 5.75, launch: 5.35, braking: 6.27, offroad: 5.10 },
  },
  'Modern Rally': {
    B: { speed: 5.88, handling: 5.11, accel: 5.59, launch: 3.55, braking: 3.88, offroad: 5.95 },
    A: { speed: 6.90, handling: 6.50, accel: 7.70, launch: 4.10, braking: 5.10, offroad: 6.90 },
  },
  'Modern Sports Cars': {
    C:  { speed: 5.35, handling: 4.80, accel: 4.22, launch: 3.82, braking: 3.35, offroad: 5.35 },
    B:  { speed: 5.95, handling: 5.24, accel: 4.97, launch: 4.79, braking: 3.99, offroad: 5.44 },
    A:  { speed: 6.59, handling: 5.77, accel: 5.78, launch: 6.16, braking: 4.86, offroad: 5.16 },
    S1: { speed: 7.30, handling: 6.75, accel: 6.15, launch: 6.60, braking: 7.20, offroad: 4.85 },
  },
  'Modern Super Saloons': {
    D:  { speed: 5.30, handling: 4.50, accel: 2.70, launch: 1.80, braking: 3.00, offroad: 5.80 },
    B:  { speed: 6.95, handling: 5.28, accel: 5.40, launch: 5.32, braking: 4.55, offroad: 5.55 },
    A:  { speed: 7.10, handling: 5.53, accel: 6.30, launch: 6.91, braking: 5.19, offroad: 5.39 },
    S1: { speed: 7.13, handling: 6.07, accel: 8.03, launch: 8.73, braking: 6.50, offroad: 5.10 },
    S2: { speed: 7.20, handling: 5.40, accel: 9.10, launch: 10.00, braking: 6.20, offroad: 4.90 },
  },
  'Modern Supercars': {
    A:  { speed: 7.30, handling: 6.13, accel: 6.60, launch: 6.73, braking: 6.33, offroad: 5.30 },
    S1: { speed: 7.73, handling: 6.38, accel: 7.42, launch: 6.98, braking: 6.89, offroad: 5.19 },
    S2: { speed: 8.20, handling: 7.00, accel: 7.87, launch: 8.53, braking: 7.77, offroad: 4.70 },
  },
  'Offroad': {
    D: { speed: 2.80, handling: 3.00, accel: 1.30, launch: 3.00, braking: 2.70, offroad:  9.00 },
    C: { speed: 4.20, handling: 3.90, accel: 3.20, launch: 5.20, braking: 4.80, offroad: 10.00 },
    B: { speed: 4.42, handling: 4.12, accel: 4.82, launch: 5.98, braking: 4.42, offroad:  9.25 },
  },
  'Pickups & 4x4s': {
    D: { speed: 4.03, handling: 2.90, accel: 2.97, launch: 3.40, braking: 2.60, offroad: 8.36 },
    C: { speed: 4.92, handling: 3.40, accel: 4.69, launch: 3.95, braking: 3.12, offroad: 8.14 },
    B: { speed: 6.05, handling: 3.02, accel: 6.75, launch: 6.38, braking: 3.50, offroad: 8.85 },
    A: { speed: 5.65, handling: 3.35, accel: 6.95, launch: 7.70, braking: 4.20, offroad: 9.00 },
  },
  'Rally Monsters': {
    B:  { speed: 5.80, handling: 4.60, accel: 4.60, launch: 4.80, braking: 3.70, offroad: 6.80 },
    A:  { speed: 5.35, handling: 5.55, accel: 6.92, launch: 7.12, braking: 5.08, offroad: 8.23 },
    S1: { speed: 5.92, handling: 5.70, accel: 8.28, launch: 4.56, braking: 5.68, offroad: 8.16 },
  },
  'Rare Classics': {
    D: { speed: 4.73, handling: 3.87, accel: 3.67, launch: 2.73, braking: 2.60, offroad: 5.47 },
    C: { speed: 5.20, handling: 4.27, accel: 4.10, launch: 2.83, braking: 2.87, offroad: 5.47 },
    B: { speed: 5.90, handling: 4.20, accel: 4.15, launch: 3.65, braking: 3.15, offroad: 5.05 },
  },
  'Retro Hot Hatch': {
    D: { speed: 4.28, handling: 3.98, accel: 3.35, launch: 2.98, braking: 2.48, offroad: 5.25 },
    C: { speed: 5.37, handling: 4.51, accel: 3.86, launch: 3.16, braking: 3.26, offroad: 5.37 },
  },
  'Retro Muscle': {
    D: { speed: 5.23, handling: 3.80, accel: 3.20, launch: 2.43, braking: 2.30, offroad: 5.37 },
    C: { speed: 5.33, handling: 3.90, accel: 3.70, launch: 2.67, braking: 2.70, offroad: 5.40 },
    B: { speed: 6.70, handling: 4.70, accel: 5.00, launch: 4.05, braking: 3.85, offroad: 5.05 },
    A: { speed: 7.20, handling: 5.20, accel: 4.60, launch: 4.50, braking: 3.90, offroad: 5.00 },
  },
  'Retro Racers': {
    S2: { speed: 6.83, handling: 8.20, accel: 7.53, launch: 2.70, braking: 8.90, offroad: 4.60 },
    R:  { speed: 8.50, handling: 9.70, accel: 7.30 },
  },
  'Retro Rally': {
    C: { speed: 5.20, handling: 4.39, accel: 4.55, launch: 2.79, braking: 3.11, offroad: 5.95 },
    B: { speed: 5.48, handling: 4.95, accel: 6.20, launch: 4.85, braking: 3.85, offroad: 6.22 },
  },
  'Retro Sports Cars': {
    D:  { speed: 4.70, handling: 4.30, accel: 3.46, launch: 2.76, braking: 2.70, offroad: 5.62 },
    C:  { speed: 5.70, handling: 4.66, accel: 4.06, launch: 2.88, braking: 3.25, offroad: 5.47 },
    B:  { speed: 6.22, handling: 5.04, accel: 5.15, launch: 3.63, braking: 3.93, offroad: 5.32 },
    A:  { speed: 6.55, handling: 5.80, accel: 5.45, launch: 4.95, braking: 5.25, offroad: 4.90 },
    S2: { speed: 9.40, handling: 6.90, accel: 10.00, launch: 4.80, braking: 6.70, offroad: 4.40 },
  },
  'Retro Super Saloons': {
    D: { speed: 3.60, handling: 4.30, accel: 1.90, launch: 1.30, braking: 2.50, offroad: 5.90 },
    C: { speed: 5.60, handling: 4.58, accel: 4.11, launch: 3.06, braking: 3.18, offroad: 5.61 },
    B: { speed: 6.58, handling: 4.88, accel: 4.91, launch: 4.51, braking: 3.66, offroad: 5.52 },
  },
  'Retro Supercars': {
    B:  { speed: 6.10, handling: 4.90, accel: 4.57, launch: 2.90, braking: 3.87, offroad: 5.30 },
    A:  { speed: 7.27, handling: 5.66, accel: 5.78, launch: 3.91, braking: 4.95, offroad: 5.27 },
    S1: { speed: 7.94, handling: 6.62, accel: 6.10, launch: 4.70, braking: 6.70, offroad: 4.91 },
  },
  'Rods and Customs': {
    D: { speed: 4.56, handling: 3.52, accel: 2.70, launch: 2.34, braking: 1.98, offroad: 5.86 },
    C: { speed: 5.50, handling: 3.40, accel: 3.40, launch: 3.00, braking: 2.30, offroad: 5.60 },
  },
  'Sports Utility Heroes': {
    C: { speed: 5.55, handling: 2.55, accel: 4.80, launch: 6.35, braking: 2.90, offroad: 7.65 },
    B: { speed: 5.35, handling: 4.20, accel: 5.55, launch: 6.00, braking: 3.60, offroad: 6.35 },
    A: { speed: 6.73, handling: 4.60, accel: 6.96, launch: 7.26, braking: 4.86, offroad: 6.43 },
  },
  'Super GT': {
    A:  { speed: 7.60, handling: 5.65, accel: 5.50, launch: 5.45, braking: 5.65, offroad: 5.10 },
    S1: { speed: 8.05, handling: 6.18, accel: 6.23, launch: 6.72, braking: 7.17, offroad: 4.92 },
  },
  'Super Hot Hatch': {
    B:  { speed: 5.95, handling: 5.40, accel: 5.16, launch: 4.82, braking: 4.12, offroad: 5.57 },
    A:  { speed: 6.80, handling: 5.45, accel: 4.65, launch: 4.85, braking: 4.65, offroad: 5.15 },
  },
  'Track Toys': {
    D:  { speed: 2.30, handling: 6.90, accel: 1.90, launch: 4.50, braking: 9.20, offroad: 5.20 },
    B:  { speed: 5.10, handling: 6.05, accel: 3.75, launch: 3.65, braking: 5.00, offroad: 4.65 },
    A:  { speed: 6.62, handling: 6.16, accel: 5.30, launch: 5.46, braking: 5.72, offroad: 4.76 },
    S1: { speed: 7.18, handling: 7.14, accel: 7.02, launch: 6.62, braking: 7.73, offroad: 4.95 },
    S2: { speed: 7.50, handling: 8.00, accel: 7.47, launch: 8.17, braking: 8.93, offroad: 4.80 },
    R:  { speed: 7.62, handling: 9.24, accel: 8.01, launch: 7.24, braking: 9.92, offroad: 4.73 },
  },
  'UTVs': {
    D: { speed: 2.70, handling: 5.30, accel: 4.10, launch: 6.90, braking: 6.30, offroad:  8.60 },
    C: { speed: 3.20, handling: 3.40, accel: 4.00, launch: 4.20, braking: 4.80, offroad:  9.10 },
    B: { speed: 4.10, handling: 3.60, accel: 6.80, launch: 9.60, braking: 4.50, offroad: 10.00 },
    A: { speed: 4.30, handling: 4.90, accel: 6.40, launch: 7.10, braking: 5.90, offroad:  7.90 },
  },
  'Unlimited Buggies': {
    C:  { speed: 3.20, handling: 3.40, accel: 4.00, launch: 4.20, braking: 4.80, offroad:  9.10 },
    B:  { speed: 4.47, handling: 3.40, accel: 5.70, launch: 4.73, braking: 4.80, offroad:  9.67 },
    A:  { speed: 5.40, handling: 3.50, accel: 6.40, launch: 6.75, braking: 4.35, offroad:  8.55 },
    S1: { speed: 5.20, handling: 2.90, accel: 7.60, launch: 8.50, braking: 5.10, offroad:  8.90 },
  },
  'Unlimited Offroad': {
    C: { speed: 4.40, handling: 3.00, accel: 3.60, launch: 2.60, braking: 5.00, offroad: 9.40 },
    B: { speed: 5.17, handling: 3.60, accel: 5.27, launch: 4.47, braking: 4.43, offroad: 9.73 },
    A: { speed: 5.73, handling: 3.62, accel: 6.46, launch: 6.08, braking: 4.98, offroad: 9.72 },
  },
  'Utility Heroes': {
    D: { speed: 3.30, handling: 3.60, accel: 2.06, launch: 2.80, braking: 2.26, offroad: 6.32 },
    C: { speed: 5.90, handling: 3.40, accel: 3.20, launch: 3.10, braking: 2.40, offroad: 5.60 },
    B: { speed: 6.30, handling: 4.60, accel: 4.70, launch: 4.90, braking: 3.70, offroad: 5.40 },
    A: { speed: 6.50, handling: 5.00, accel: 4.80, launch: 4.60, braking: 4.80, offroad: 4.80 },
  },
}

// Per-class sensitivity — how far below division average before a callout fires.
// Higher classes get tighter deltas; D class gives wide latitude since stats vary more.
const CLASS_DELTAS: Record<string, number> = {
  D: -1.5, C: -1.3, B: -1.2, A: -1.1, S1: -1.0, S2: -0.9, R: -0.8,
}

// Division "DNA" — each division's within-class z-score character (|z| >= 0.5), derived
// from ~580 scraped cars (divisions with n>=8). Snapshot of the current dataset — re-derive
// on catalog change, and treat like a tier list (verify against live community sources)
// rather than as final. Divisions absent here (n<8, or omitted metrics) fall back to
// class-only comparison everywhere they're read. Metric keys: grip, braking, accel,
// topspeed, offroad, aeroGain, noseHeavy, rearBalance.
export const DIVISION_PROFILES: Record<string, {
  strong: string[]; weak: string[]; archetype: 'fast-sweeper' | 'top-end' | 'offroad' | 'rotation' | 'straight-line-weak' | 'neutral'
}> = {
  'Track Toys':            { strong: ['grip', 'braking', 'aeroGain'],             weak: ['accel'],                                          archetype: 'fast-sweeper' },
  'Extreme Track Toys':    { strong: ['grip', 'aeroGain'],                        weak: [],                                                 archetype: 'fast-sweeper' },
  'Hot Hatch':             { strong: ['grip', 'braking', 'aeroGain', 'noseHeavy'], weak: ['accel'],                                          archetype: 'fast-sweeper' },
  'Modern Sports Cars':    { strong: ['grip', 'aeroGain'],                        weak: [],                                                 archetype: 'fast-sweeper' },
  'Retro Sports Cars':     { strong: ['grip', 'topspeed'],                        weak: [],                                                 archetype: 'fast-sweeper' },
  'Retro Supercars':       { strong: ['grip', 'topspeed', 'aeroGain', 'rearBalance'], weak: ['noseHeavy'],                                  archetype: 'rotation' },
  'Modern Supercars':      { strong: ['rearBalance', 'topspeed'],                 weak: ['noseHeavy'],                                       archetype: 'rotation' },
  'Retro Hot Hatch':       { strong: ['noseHeavy', 'rearBalance'],                weak: ['offroad'],                                         archetype: 'rotation' },
  'Classic Racers':        { strong: ['topspeed', 'rearBalance'],                 weak: ['grip', 'braking', 'aeroGain', 'noseHeavy'],        archetype: 'rotation' },
  'Rare Classics':         { strong: ['rearBalance'],                            weak: ['grip', 'braking', 'noseHeavy'],                     archetype: 'rotation' },
  'Hypercars':             { strong: ['topspeed'],                               weak: [],                                                 archetype: 'top-end' },
  'Super GT':              { strong: ['braking', 'topspeed'],                    weak: [],                                                 archetype: 'top-end' },
  'Modern Super Saloons':  { strong: ['noseHeavy', 'topspeed'],                   weak: ['rearBalance'],                                     archetype: 'top-end' },
  'Retro Super Saloons':   { strong: ['topspeed'],                               weak: [],                                                 archetype: 'top-end' },
  'Modern Muscle':         { strong: ['noseHeavy'],                              weak: ['rearBalance'],                                     archetype: 'top-end' },
  'Retro Muscle':          { strong: ['accel', 'topspeed'],                      weak: ['offroad'],                                         archetype: 'top-end' },
  'Rally Monsters':        { strong: ['offroad', 'grip', 'braking'],             weak: ['topspeed'],                                        archetype: 'offroad' },
  'Pickups & 4x4s':        { strong: ['offroad'],                                weak: ['grip', 'aeroGain', 'rearBalance'],                  archetype: 'offroad' },
  'Unlimited Offroad':     { strong: ['offroad'],                                weak: ['grip', 'topspeed', 'aeroGain'],                     archetype: 'offroad' },
  'Sports Utility Heroes': { strong: [],                                        weak: ['grip', 'aeroGain'],                                 archetype: 'offroad' },
  'Classic Muscle':        { strong: [],                                        weak: ['grip', 'braking', 'aeroGain', 'rearBalance'],       archetype: 'straight-line-weak' },
  'Classic Sports Cars':   { strong: [],                                        weak: ['braking', 'accel'],                                 archetype: 'straight-line-weak' },
  'Utility Heroes':        { strong: ['noseHeavy'],                             weak: ['grip', 'braking', 'accel', 'aeroGain', 'rearBalance'], archetype: 'straight-line-weak' },
  'Drift Cars':            { strong: ['noseHeavy'],                             weak: ['grip', 'braking', 'topspeed', 'aeroGain', 'rearBalance'], archetype: 'neutral' },
  'Eclectic Domestics':    { strong: ['braking'],                               weak: [],                                                 archetype: 'neutral' },
  'Modern Rally':          { strong: ['noseHeavy'],                             weak: ['rearBalance'],                                     archetype: 'neutral' },
  'Super Hot Hatch':       { strong: ['noseHeavy'],                             weak: [],                                                 archetype: 'neutral' },
  'Retro Rally':           { strong: [],                                       weak: [],                                                 archetype: 'neutral' },
}

// Only these divisions should receive the low offroad callout.
const OFFROAD_RELEVANT_DIVISIONS = new Set([
  'Offroad', 'Pickups & 4x4s', 'UTVs', 'Unlimited Offroad', 'Unlimited Buggies',
  'Utility Heroes', 'Rally Monsters', 'Modern Rally', 'Classic Rally', 'Retro Rally',
  'Sports Utility Heroes', 'Buggies',
])

// HP threshold to trigger the power-exceeds-handling callout, by PI class.
// R class is omitted — suppressed entirely (those cars are purpose-built race machines).
const HP_THRESHOLD: Record<string, number> = {
  D: 200, C: 250, B: 350, A: 450, S1: 650, S2: 900,
}

// Per-class sim thresholds — derived from 580 joined cars (fh6-cars × scraped_car_stats).
// TOP_SPEED_FLOOR = per-class p25; BRAKING_100_CEILING = per-class p75.

const TOP_SPEED_FLOOR: Record<string, number> = {
  D: 90, C: 139, B: 153, A: 180, S1: 192, S2: 203, R: 195,
}

const BRAKING_100_CEILING: Record<string, number> = {
  D: 430, C: 398, B: 354, A: 317, S1: 258, S2: 207, R: 163,
}

// Lateral grip vs speed = simLateralG120 / simLateralG60.
// Data median 1.03 — grip RISES with speed (downforce). So:
const LATERAL_AERO_GAIN_MIN = 1.12   // >= : grip climbs hard with speed → fast-sweeper specialist (~top 20%)
const LATERAL_FLAT_MAX      = 0.98   // <  : grip genuinely drops → low-speed chassis (~bottom 10%)

// Acceleration shape = simZeroToHundred / simZeroToSixty (p25 / p75).
const ACCEL_SUSTAINED_MAX = 2.10     // <= : strong top-end puller
const ACCEL_LAUNCHY_MIN   = 2.60     // >= : front-loaded launcher

// lbs/hp build-priority bands (p25 / ~p80).
const PWR_TO_WEIGHT_LIGHT = 6        // <= : power-rich → spend PI on grip
const PWR_TO_WEIGHT_HEAVY = 13       // >= : heavy for power → spend PI on power/weight

// Ratio fields — scale/direction confirmed from data:
const AERO_EFF_DRAGGY_MAX   = 0.70   // simAeroEfficiency below this = draggy (p10; range 0.07–0.93, higher=better)
// simMechBalance correlates NEGATIVELY with front weight% (corr -0.61 across 549 cars): a low value means
// nose-heavy / front-grip-biased → understeer; a high value means rear-heavy / rear-grip-biased → oversteer.
// Confirmed against 2009 Audi RS 6 (59% front, mechbal 0.41 → understeer) and 2023 Porsche 911 Rallye
// (40% front, rear-engine, mechbal 0.62 → oversteer).
const MECH_UNDERSTEER_MAX   = 0.43   // <= : nose-heavy / front-grip-biased → understeer
const MECH_OVERSTEER_MIN    = 0.61   // >= : rear-heavy / rear-grip-biased  → oversteer
const AERO_BALANCE_PRESENT  = 0.10   // simAeroBalance must exceed this to count as "has aero" (135/549 cars are 0)
const AERO_FRONT_BIAS_MIN   = 0.52   // p95 of cars-with-aero — direction is the least-verified sim field

// Per-class "top of class" strength thresholds (p90 unless noted) — mirror-positives so a
// genuinely strong car (e.g. a top-speed/braking standout) gets credit, not just weaknesses.
const STRONG_TOP_SPEED_MIN: Record<string, number> = { // simTopSpeed >= class p90
  D: 141, C: 159, B: 184, A: 208, S1: 225, S2: 274, R: 252,
}
const STRONG_BRAKING_MAX: Record<string, number> = {   // simBraking100 <= class p10 (shorter = better)
  D: 386, C: 352, B: 313, A: 250, S1: 198, S2: 153, R: 139,
}
const STRONG_GRIP_MIN: Record<string, number> = {      // simLateralG120 >= class p90
  D: 0.92, C: 0.95, B: 1.04, A: 1.19, S1: 1.47, S2: 2.22, R: 2.78,
}
const STRONG_ACCEL_MAX: Record<string, number> = {     // simZeroToSixty <= class p10 (quicker = better)
  D: 7.0, C: 5.3, B: 4.2, A: 3.0, S1: 2.6, S2: 2.2, R: 2.0,
}

// "Point-and-squirt" identity — low cornering grip but strong off-the-line acceleration.
const LOW_GRIP_MAX: Record<string, number> = {     // simLateralG120 <= class p25
  D: 0.77, C: 0.81, B: 0.91, A: 0.97, S1: 1.15, S2: 1.39, R: 2.10,
}
const QUICK_ENOUGH_MAX: Record<string, number> = { // simZeroToSixty <= class p25
  D: 8.0, C: 5.9, B: 4.5, A: 3.4, S1: 2.8, S2: 2.5, R: 2.4,
}

// Archetype-only thresholds (v3) — looser than the single-field strength bars above, because
// an archetype is a synthesis of several fields agreeing, not one field being exceptional.
const HIGH_GRIP_MIN: Record<string, number> = {  // simLateralG120 >= class p75 — "high grip for class"
  D: 0.85, C: 0.91, B: 0.99, A: 1.12, S1: 1.37, S2: 2.07, R: 2.58,
}
const TOP_SPEED_MID: Record<string, number> = {  // simTopSpeed >= class p50 — "decent top speed for class"
  D: 113, C: 147, B: 164, A: 191, S1: 207, S2: 224, R: 222,
}
const HEAVY_GT_WEIGHT_MIN = 3800  // lb — physically heavy (saloon/GT mass), class-agnostic

// ── Color helper ─────────────────────────────────────────────────────────────

export function getStatColor(stat: number, avg: number | null): string {
  if (avg === null) return 'bg-gray-400'
  const delta = Math.round((stat - avg) * 100) / 100
  if (delta >= 1.0)  return 'bg-green-500'
  if (delta >= 0.3)  return 'bg-green-400'
  if (delta >= -0.3) return 'bg-amber-400'
  if (delta >= -1.0) return 'bg-orange-500'
  return 'bg-red-500'
}

// A handful of scraped rows (e.g. "Forza Edition" slug collisions resolving to the
// base car's page) have power/weight that physically can't match the scraped 0-60 —
// e.g. a sub-5 lb/hp car can't take longer than ~4.5s to reach 60mph. Gate the
// longitudinal (accel/drag/top-end) callouts behind this so a Frankenstein row
// doesn't surface contradictory advice. Root cause is in the scraper's slug
// generation, not here — see run_pipeline.py follow-up.
function simDataLooksConsistent(car: Car): boolean {
  if (car.weightLb == null || car.powerHp == null || car.simZeroToSixty == null) return true
  const lbPerHp = car.weightLb / car.powerHp
  if (lbPerHp < 5 && car.simZeroToSixty > 4.5) return false
  return true
}

// Division-DNA gates (v3.1) — class-only thresholds mis-fire on divisions with strong DNA:
// flagging every Classic Muscle car "weak braking" is noise (that's the whole division), and
// handing a Track Toy a "strong grip" badge for merely clearing the class bar undersells what
// grip-specialist divisions actually deliver. Divisions absent from DIVISION_PROFILES (n<8)
// or metrics not listed fall through to class-only behaviour unchanged.
function isDivisionWeakFor(division: string, metric: string): boolean {
  return DIVISION_PROFILES[division]?.weak.includes(metric) ?? false
}

function isDivisionStrongFor(division: string, metric: string): boolean {
  return DIVISION_PROFILES[division]?.strong.includes(metric) ?? false
}

// For a division/metric marked "strong" in DIVISION_PROFILES, require the car to also clear
// its own division+class bar-stat average (DIVISION_CLASS_AVERAGES) — not just the flat
// class-wide sim threshold — so the positive callout means "strong even for this division,"
// not merely "average for a division that's already ahead." Reuses the existing division+class
// average table rather than a new per-division sim-median table. If the division isn't
// strong-flagged for the metric, or data is missing, this doesn't gate (fails open).
function meetsDivisionStrengthBar(
  division: string,
  metric: string,
  avgValue: number | undefined | null,
  carValue: number | null
): boolean {
  if (!isDivisionStrongFor(division, metric)) return true
  if (avgValue == null || carValue == null) return true
  return carValue >= avgValue
}

// ── Archetype synthesis (v3) ─────────────────────────────────────────────────
// Rules 1-22 each describe one number; a car with a clear identity ends up with several
// cards the user has to assemble by hand. An archetype does that assembly: at most one
// fires per car (precedence order = evaluation order below), it leads the returned list,
// and it absorbs (`subsumes`) the single-field callouts it re-explains. Callouts it doesn't
// subsume — tuning notes, unrelated strengths, genuine weaknesses — still render below it.
// A car matching none behaves exactly as v1/v2 (every individual callout renders standalone).

export interface Archetype {
  id:       string
  title:    string
  body:     string
  suits:    string[]   // race-type labels this identity favours (for future raceMatch use — v4)
  subsumes: string[]   // callout ids absorbed when this archetype fires
}

// Mirrors Rule 6's low-offroad gate exactly (same DIVISION_CLASS_AVERAGES + CLASS_DELTAS
// margin) so detectArchetype's arch-offroad-outlier branch and the low-offroad callout can
// never disagree about which cars are weak-for-division on offroad. If Rule 6's threshold
// changes, update this alongside it — don't let a second copy of the comparison drift.
function offroadWeaknessForDivision(car: Car): { weak: boolean; avgOffroad: number | null } {
  const avg        = DIVISION_CLASS_AVERAGES[car.division]?.[car.piClass] ?? null
  const delta       = CLASS_DELTAS[car.piClass] ?? -1.2
  const avgOffroad  = avg?.offroad ?? null
  const weak        = avgOffroad != null && car.statOffroad != null && car.statOffroad < avgOffroad + delta
  return { weak, avgOffroad }
}

function detectArchetype(car: Car): Archetype | null {
  const strongGripMin     = STRONG_GRIP_MIN[car.piClass]
  const strongBrakingMax  = STRONG_BRAKING_MAX[car.piClass]
  const highGripMin       = HIGH_GRIP_MIN[car.piClass]
  const topSpeedMid       = TOP_SPEED_MID[car.piClass]
  const strongTopSpeedMin = STRONG_TOP_SPEED_MIN[car.piClass]
  const lowGripMax        = LOW_GRIP_MAX[car.piClass]
  const quickEnoughMax    = QUICK_ENOUGH_MAX[car.piClass]
  const topSpeedFloor     = TOP_SPEED_FLOOR[car.piClass]

  // 1 — Cross-country / dirt car
  if (OFFROAD_RELEVANT_DIVISIONS.has(car.division)) {
    const strongGrip    = strongGripMin != null && car.simLateralG120 != null && car.simLateralG120 >= strongGripMin
    const strongBraking = strongBrakingMax != null && car.simBraking100 != null && car.simBraking100 <= strongBrakingMax
    const strongOffroad = car.statOffroad != null && car.statOffroad >= 8.0
    const isWeapon = strongGrip || strongBraking || strongOffroad

    if (isWeapon) {
      const strengths: string[] = []
      if (strongGrip) strengths.push('cornering grip')
      if (strongBraking) strengths.push('braking')
      if (strongOffroad) strengths.push('offroad handling')
      return {
        id:    'arch-dirt',
        title: 'Cross-country weapon',
        body:  `Built for loose surfaces — read it on dirt terms, not tarmac. Its ${strengths.join(' and ')} stand out for the class, which is what actually wins cross-country and dirt events; tarmac numbers like top speed and braking distance aren't the point.`,
        suits:    ['Cross Country', 'Dirt Racing'],
        subsumes: ['low-top-speed', 'long-braking-distance', 'sustained-acceleration', 'front-loaded-acceleration'],
      }
    }

    // Street-tuned outlier — a division/body-style tag that reads as offroad-focused, but
    // this specific car is weak-for-division on offroad (same gate as the low-offroad
    // callout). The division tag is a category, not a capability claim; don't let the
    // archetype assert dirt competence this car's own numbers contradict. Unlike the other
    // two buckets, its on-road numbers ARE the story, so nothing is subsumed here.
    const { weak: weakOffroad, avgOffroad } = offroadWeaknessForDivision(car)
    if (weakOffroad && avgOffroad != null && car.statOffroad != null) {
      return {
        id:    'arch-offroad-outlier',
        title: 'Street-tuned outlier',
        body:  `This car sits in a typically offroad-heavy division, but its own numbers don't back that up — offroad reads well below the division average. Treat it like the street/tarmac performer it actually is: judge it on top speed, braking, and acceleration like any road car, not on how it handles loose surfaces.`,
        suits:    [],
        subsumes: [],
      }
    }

    return {
      id:    'arch-dirt',
      title: 'Dirt-focused car',
      body:  `Built for loose surfaces — read it on dirt terms, not tarmac. Its on-road numbers (top speed, tarmac braking distance, sustained acceleration) don't define this car; judge it by how it handles dirt, gravel, and mixed surfaces instead.`,
      suits:    ['Cross Country', 'Dirt Racing'],
      subsumes: ['low-top-speed', 'long-braking-distance', 'sustained-acceleration', 'front-loaded-acceleration'],
    }
  }

  // 2 — Point-and-squirt (generalises Rule 22 — low absolute grip, strong launch)
  if (
    simDataLooksConsistent(car) &&
    lowGripMax != null && car.simLateralG120 != null && car.simLateralG120 <= lowGripMax &&
    quickEnoughMax != null && car.simZeroToSixty != null && car.simZeroToSixty <= quickEnoughMax
  ) {
    const limitedTopSpeedNote =
      topSpeedFloor != null && car.simTopSpeed != null && car.simTopSpeed < topSpeedFloor
        ? ` A low top speed means it gets run down in long drags, though it still shines in short ones.`
        : ''
    return {
      id:    'arch-point-squirt',
      title: 'Point-and-squirt',
      body:  `Low cornering grip means it won't carry speed through fast corners, but it launches hard and punches out of slow ones — this car wins on exit, not entry. Favour Street Racing, Touge, and tight technical layouts; it's also strong off the line for short drags.${limitedTopSpeedNote}`,
      suits:    ['Street Racing', 'Touge Racing', 'Drag Racing'],
      subsumes: ['corner-exit', 'flat-grip-curve', 'drag-candidate', 'low-top-speed', 'front-loaded-acceleration'],
    }
  }

  // 3 — Fast-sweeper / downforce car (mutually exclusive with point-and-squirt by construction:
  // low absolute grip there vs high-and-rising grip here)
  if (
    car.simLateralG60  != null && car.simLateralG60 > 0 &&
    car.simLateralG120 != null &&
    car.simLateralG120 / car.simLateralG60 >= LATERAL_AERO_GAIN_MIN &&
    highGripMin != null && car.simLateralG120 >= highGripMin
  ) {
    return {
      id:    'arch-fast-sweeper',
      title: 'Fast-sweeper',
      body:  `Grip climbs with speed (downforce-driven) and is high for its class — strong in high-speed road racing and flowing circuits. It can feel inert in slow corners, so don't judge it on tight, technical layouts.`,
      suits:    ['Road Racing'],
      subsumes: ['comes-alive-at-speed', 'strong-cornering-grip'],
    }
  }

  // 4 — Top-end cruiser
  if (
    simDataLooksConsistent(car) &&
    strongTopSpeedMin != null && car.simTopSpeed != null && car.simTopSpeed >= strongTopSpeedMin &&
    car.simZeroToSixty != null && car.simZeroToSixty > 0 &&
    car.simZeroToHundred != null &&
    car.simZeroToHundred / car.simZeroToSixty <= ACCEL_SUSTAINED_MAX
  ) {
    return {
      id:    'arch-top-end',
      title: 'Top-end cruiser',
      body:  `Class-leading top speed with acceleration that keeps pulling all the way up — strong on long straights and high-speed circuits. It gives time back in tight, technical sections.`,
      suits:    ['Road Racing'],
      subsumes: ['strong-top-speed', 'sustained-acceleration'],
    }
  }

  // 5 — Heavy GT / saloon (fallback — lowest precedence)
  if (
    simDataLooksConsistent(car) &&
    car.weightLb     != null && car.weightLb >= HEAVY_GT_WEIGHT_MIN &&
    car.frontWeight  != null && car.frontWeight >= 48 && car.frontWeight <= 62 &&
    highGripMin != null && car.simLateralG120 != null && car.simLateralG120 <= highGripMin &&
    topSpeedMid != null && car.simTopSpeed    != null && car.simTopSpeed >= topSpeedMid
  ) {
    return {
      id:    'arch-heavy-gt',
      title: 'Heavy GT / saloon',
      body:  `Stable and consistent — it carries speed through corners better than its weight suggests, but won't match a lighter car's peak grip. Build for consistency: strong tyres, balanced spring rates, and brakes; prioritise weight reduction over more power.`,
      suits:    ['Road Racing', 'Street Racing'],
      subsumes: ['power-handling-gap'],
    }
  }

  return null
}

// ── Main export ───────────────────────────────────────────────────────────────

export function getStatCallouts(
  car: Car,
  garageTags?: string[]
): StatCallout[] {
  const callouts: StatCallout[] = []
  const tags = garageTags ?? []

  const isDrift = car.division.includes('Drift')
  const isDrag  = tags.includes('drag')

  const avg   = DIVISION_CLASS_AVERAGES[car.division]?.[car.piClass] ?? null
  const delta = CLASS_DELTAS[car.piClass] ?? -1.2

  // ── Rule 1 — Weak braking ────────────────────────────────────────────────
  // Reworded per v3.2: braking calibration based on forza.guide/meta (live, checked 6/2026,
  // 113 matched cars) — re-verify against that site if this copy is revisited later. Road-meta
  // cars sit at within-class braking p67 vs p49 baseline (39% vs 23% top-quartile), a real
  // secondary signal but clearly behind grip (p77, 57% vs 26%).
  if (
    !isDrift &&
    !isDivisionWeakFor(car.division, 'braking') &&
    avg?.braking != null &&
    car.statBraking != null &&
    car.statBraking < avg.braking + delta
  ) {
    callouts.push({
      id:    'weak-braking',
      title: 'Weak braking',
      body:  `Braking reads as ${car.statBraking.toFixed(1)} — below the ${car.division} ${car.piClass} average of ${avg.braking.toFixed(1)}. Stock braking is short for its class — worth weighing if you're comparing similar options, though grip separates the competitive field more than braking does. Either way, prioritise the brake upgrade first; most competitive builds max brakes, so it's a cheap fix once you're tuning. Move brake bias slightly forward (52% front is a safe starting point) and increase brake pressure if the car takes too long to scrub speed.`,
    })
  }

  // ── Rule 2 — Low handling ────────────────────────────────────────────────
  if (
    !isDrift &&
    !isDrag &&
    !isDivisionWeakFor(car.division, 'grip') &&
    avg?.handling != null &&
    car.statHandling != null &&
    car.statHandling < avg.handling + delta
  ) {
    callouts.push({
      id:    'low-handling',
      title: 'Low handling',
      body:  `Handling reads as ${car.statHandling.toFixed(1)} — below the ${car.division} ${car.piClass} average of ${avg.handling.toFixed(1)}. The car will likely understeer or feel vague through corners. Focus on alignment (more negative front camber, around -1.5° to -2.0°), stiffer front anti-roll bars, and softer springs to keep all four tyres loaded through direction changes.`,
    })
  }

  // ── Rule 3 — RWD rear-heavy ──────────────────────────────────────────────
  if (
    !isDrift &&
    car.frontWeight != null &&
    car.drivetrain === 'RWD' &&
    car.frontWeight < 42
  ) {
    callouts.push({
      id:    'rwd-rear-heavy',
      title: 'RWD — rear-heavy balance',
      body:  `Front weight is ${car.frontWeight}% on a RWD car — the rear is carrying most of the mass. This makes the rear end prone to stepping out under power. Tune differential decel carefully (start around 15-25%) to manage corner entry stability. Add rear downforce if PI allows. Be conservative with throttle on corner exit until the tune is dialled in.`,
    })
  }

  // ── Rule 4 — FWD front-heavy ─────────────────────────────────────────────
  if (
    car.frontWeight != null &&
    car.drivetrain === 'FWD' &&
    car.frontWeight > 58
  ) {
    callouts.push({
      id:    'fwd-front-heavy',
      title: 'FWD — front-heavy balance',
      body:  `Front weight is ${car.frontWeight}% on a FWD car — most of the mass sits over the driven wheels, making understeer the dominant trait. Soften front springs slightly, stiffen the rear ARB to encourage rotation, and reduce front tyre pressure by 1-2 PSI from your baseline to maximise front contact patch.`,
    })
  }

  // ── Rule 5 — High launch + weak braking ──────────────────────────────────
  if (
    !isDrift &&
    !isDrag &&
    avg?.launch  != null &&
    avg?.braking != null &&
    car.statLaunch  != null &&
    car.statBraking != null &&
    car.statLaunch  > avg.launch  + 1.0 &&
    car.statBraking < avg.braking + delta
  ) {
    callouts.push({
      id:    'launch-braking-mismatch',
      title: 'Strong launch, weak brakes',
      body:  `Launch is ${car.statLaunch.toFixed(1)} but braking is only ${car.statBraking.toFixed(1)} — the car accelerates faster than it can stop. This gap is worth noting when choosing races and braking points. Brake significantly earlier than feels natural on first use, prioritise the brake upgrade, and avoid races with tight chicanes immediately after long straights until the brakes are sorted.`,
    })
  }

  // ── Rule 6 — Low offroad (only offroad-relevant divisions) ────────────────
  if (
    OFFROAD_RELEVANT_DIVISIONS.has(car.division) &&
    avg?.offroad != null &&
    car.statOffroad != null &&
    car.statOffroad < avg.offroad + delta
  ) {
    callouts.push({
      id:    'low-offroad',
      title: 'Low offroad capability',
      body:  `Offroad reads as ${car.statOffroad.toFixed(1)} — below the ${car.division} ${car.piClass} average of ${avg.offroad.toFixed(1)}. This car is not well-suited to dirt, gravel, or mixed-surface routes compared to its peers. On cross-country events stick to the smoothest racing line and avoid rough terrain where possible. Consider a dedicated offroad build for those disciplines instead.`,
    })
  }

  // ── Rule 7 — Touge / technical damping reminder ──────────────────────────
  const isTechnical = tags.some((t) => ['tight', 'technical'].includes(t))
  if (isTechnical) {
    callouts.push({
      id:    'touge-damping',
      title: 'Tight / technical roads — damping note',
      body:  'This car is tagged for tight or technical use. On mountain passes and uneven roads, apply the Bump < Rebound rule: set bump damping at 60-70% of your rebound value (rebound must be stiffer than bump). A stiff road tune packs down through consecutive drainage dips and cracked surfaces, progressively losing steering response. Also run springs 20-25% softer than your road racing baseline.',
    })
  }

  // ── Rule 8 — Power exceeds handling ──────────────────────────────────────
  const hpThreshold = HP_THRESHOLD[car.piClass]
  if (
    !isDrag &&
    hpThreshold != null &&        // R class: no entry → suppressed entirely
    avg?.handling != null &&
    car.powerHp      != null &&
    car.statHandling != null &&
    car.powerHp      > hpThreshold &&
    car.statHandling < avg.handling + delta
  ) {
    callouts.push({
      id:    'power-handling-gap',
      title: 'Power exceeds handling',
      body:  `${car.powerHp}hp with a handling stat of ${car.statHandling.toFixed(1)} — the engine is working faster than the chassis can manage. Chassis and tyre upgrades will gain more lap time than further power adds. Tires, suspension, and differential before any engine work.`,
    })
  }

  // ── Rule 9 — Grip vs speed ────────────────────────────────────────────────
  if (
    car.simLateralG60  != null &&
    car.simLateralG120 != null &&
    car.simLateralG60  > 0
  ) {
    const ratio = car.simLateralG120 / car.simLateralG60
    if (ratio >= LATERAL_AERO_GAIN_MIN) {
      callouts.push({
        id:    'comes-alive-at-speed',
        title: 'Comes alive at speed',
        body:  `Lateral grip climbs sharply from ${car.simLateralG60.toFixed(2)}G at 60 mph to ${car.simLateralG120.toFixed(2)}G at 120 mph — this is a downforce-driven chassis. Strong for high-speed road racing and fast sweepers; it can feel inert at low speed, so don't judge it on tight, technical layouts.`,
      })
    } else if (ratio < LATERAL_FLAT_MAX) {
      callouts.push({
        id:    'flat-grip-curve',
        title: 'Low-speed grip car',
        body:  `Lateral grip drops from ${car.simLateralG60.toFixed(2)}G at 60 mph to ${car.simLateralG120.toFixed(2)}G at 120 mph — there's no aero benefit at speed. It's best on tight, technical layouts rather than fast sweepers.`,
      })
    }
  }

  // ── Rule 10 — Acceleration profile (shape, not absolute speed) ───────────
  if (
    simDataLooksConsistent(car) &&
    car.simZeroToSixty   != null &&
    car.simZeroToHundred != null &&
    car.simZeroToSixty   > 0
  ) {
    const accelRatio = car.simZeroToHundred / car.simZeroToSixty
    if (accelRatio <= ACCEL_SUSTAINED_MAX) {
      callouts.push({
        id:    'sustained-acceleration',
        title: 'Pulls all the way up',
        body:  `Keeps pulling past 60 — power doesn't tail off up top (0-60 in ${car.simZeroToSixty.toFixed(1)}s, 0-100 in ${car.simZeroToHundred.toFixed(1)}s). Suits longer circuits and high-speed maps.`,
      })
    } else if (accelRatio >= ACCEL_LAUNCHY_MIN) {
      callouts.push({
        id:    'front-loaded-acceleration',
        title: 'Front-loaded acceleration',
        body:  `Acceleration falls off above 60 (0-60 in ${car.simZeroToSixty.toFixed(1)}s, 0-100 in ${car.simZeroToHundred.toFixed(1)}s) — it makes its time low in the rev range. Best where you're launching from low speed (street starts, short sprints) rather than pulling at the top end.`,
      })
    }
  }

  // ── Rule 11 — Top-speed ceiling for class (road-racing lens; skip offroad) ─
  if (
    !OFFROAD_RELEVANT_DIVISIONS.has(car.division) &&
    !isDivisionWeakFor(car.division, 'topspeed') &&
    simDataLooksConsistent(car)
  ) {
    const floor = TOP_SPEED_FLOOR[car.piClass]
    if (floor != null && car.simTopSpeed != null && car.simTopSpeed < floor) {
      callouts.push({
        id:    'low-top-speed',
        title: 'Limited top speed',
        body:  `Tops out near ${Math.round(car.simTopSpeed)} mph — low for ${car.piClass} class. It will get out-dragged on long straights and high-speed circuits. Favour it on tight, technical events, or raise the final drive to push top speed in the tune.`,
      })
    }
  }

  // ── Rule 12 — Real stopping distance (road-racing lens; skip offroad) ────
  if (!OFFROAD_RELEVANT_DIVISIONS.has(car.division)) {
    const ceiling = BRAKING_100_CEILING[car.piClass]
    if (
      !isDrift &&
      ceiling != null &&
      car.simBraking100 != null &&
      car.simBraking100 > ceiling
    ) {
      callouts.push({
        id:    'long-braking-distance',
        title: 'Long braking distance',
        body:  `Needs ~${Math.round(car.simBraking100)} ft to stop from 100 mph — long for ${car.piClass} class. On technical tracks with hard braking zones you'll need to brake noticeably earlier. Prioritise the brake upgrade and nudge bias forward.`,
      })
    }
  }

  // ── Rule 13 — Drag candidate (tarmac, genuinely quick AWD launchers) ─────
  if (simDataLooksConsistent(car) && !OFFROAD_RELEVANT_DIVISIONS.has(car.division)) {
    const quickEnough = QUICK_ENOUGH_MAX[car.piClass]
    if (
      car.drivetrain === 'AWD' &&
      avg?.launch != null &&
      car.statLaunch != null &&
      car.statLaunch > avg.launch + 1.0 &&
      car.simZeroToSixty != null &&
      quickEnough != null &&
      car.simZeroToSixty <= quickEnough
    ) {
      const floor = TOP_SPEED_FLOOR[car.piClass]
      const limitedTopSpeedNote =
        floor != null && car.simTopSpeed != null && car.simTopSpeed < floor
          ? ` A low top speed means it shines in short drags and roll-starts off the line, but gets run down in longer ones.`
          : ''
      callouts.push({
        id:    'drag-candidate',
        title: 'Strong drag candidate',
        body:  `AWD with a launch stat of ${car.statLaunch.toFixed(1)} and 0-60 in ${car.simZeroToSixty.toFixed(1)}s — it hooks up hard off the line. A good Drag Racing pick. Tune for a quick launch and run minimal aero.${limitedTopSpeedNote}`,
      })
    }
  }

  // ── Rule 14 — Power-to-weight build priority ─────────────────────────────
  if (car.weightLb != null && car.powerHp != null && car.powerHp > 0) {
    const lbsPerHp = car.weightLb / car.powerHp
    if (lbsPerHp >= PWR_TO_WEIGHT_HEAVY) {
      callouts.push({
        id:    'heavy-build-priority',
        title: 'Heavy for its power',
        body:  `${car.weightLb} lb on ${car.powerHp} hp (${lbsPerHp.toFixed(1)} lb/hp) — straight-line pace is the limiter. Spend PI on engine and weight-reduction upgrades before chasing grip; the chassis can already handle what it makes.`,
      })
    } else if (lbsPerHp <= PWR_TO_WEIGHT_LIGHT) {
      callouts.push({
        id:    'grip-build-priority',
        title: 'Power-rich for its weight',
        body:  `${car.weightLb} lb on ${car.powerHp} hp (${lbsPerHp.toFixed(1)} lb/hp) — it already has the power. Spend PI on tyres, suspension, and aero; more engine here mostly adds wheelspin, not lap time.`,
      })
    }
  }

  // ── Rule 15 — Draggy aero ─────────────────────────────────────────────────
  if (car.simAeroEfficiency != null && car.simAeroEfficiency < AERO_EFF_DRAGGY_MAX) {
    callouts.push({
      id:    'draggy-aero',
      title: 'Draggy aero package',
      body:  `Low aero efficiency — adding downforce will cost real top speed here. On high-speed maps, build with the minimum rear wing you can corner with; save heavy downforce for tight, grip-limited circuits.`,
    })
  }

  // ── Rule 16 — Mechanical balance skew ────────────────────────────────────
  // simMechBalance correlates NEGATIVELY with front weight% — a low value is nose-heavy
  // (understeer), a high value is rear-heavy (oversteer). See constants above for evidence.
  if (car.simMechBalance != null) {
    if (car.simMechBalance <= MECH_UNDERSTEER_MAX) {
      callouts.push({
        id:    'mech-understeer',
        title: 'Mechanical balance is front-biased',
        body:  `Mechanical grip leans front (nose-heavy) — expect an understeer tendency at low speed. Soften the front anti-roll bar and/or stiffen the rear to free up rotation before reaching for aero.`,
      })
    } else if (car.simMechBalance >= MECH_OVERSTEER_MIN) {
      callouts.push({
        id:    'mech-oversteer',
        title: 'Mechanical balance is rear-biased',
        body:  `Mechanical grip leans rear — expect a loose, oversteer-prone feel at low speed. Stiffen the front anti-roll bar and/or soften the rear to settle it before reaching for aero.`,
      })
    }
  }

  // ── Rule 17 — Aero balance skew (high-speed lever; rare, least-verified field) ─
  if (
    car.simAeroBalance != null &&
    car.simAeroBalance > AERO_BALANCE_PRESENT &&
    car.simAeroBalance > AERO_FRONT_BIAS_MIN
  ) {
    callouts.push({
      id:    'aero-balance-skew',
      title: 'Aero balance is front-biased',
      body:  `Downforce is biased toward the front, which can trim high-speed understeer or tip into oversteer at the limit. Trim the front wing if it gets unsettled through fast corners — this is the high-speed balance lever, distinct from mechanical balance above. Verify the direction against in-game feel; this is the least-certain sim field.`,
    })
  }

  // ── Rule 18 — Strong top speed for class (raised bar on topspeed-strong divisions) ─
  // Division gate uses statSpeed vs avg.speed — the closest available proxy without a new
  // per-division sim-median table, but Forza's "Speed" bar blends accel + top speed rather
  // than isolating top speed, so it's a looser fit here than the grip/braking proxies below.
  if (simDataLooksConsistent(car)) {
    const min = STRONG_TOP_SPEED_MIN[car.piClass]
    if (
      min != null && car.simTopSpeed != null && car.simTopSpeed >= min &&
      meetsDivisionStrengthBar(car.division, 'topspeed', avg?.speed, car.statSpeed)
    ) {
      callouts.push({
        id:    'strong-top-speed',
        title: 'Top-of-class top speed',
        body:  `Tops out near ${Math.round(car.simTopSpeed)} mph — among the fastest in ${car.piClass} class. Strong on fast circuits and long straights.`,
      })
    }
  }

  // ── Rule 19 — Strong braking for class (raised bar on braking-strong divisions) ─
  if (simDataLooksConsistent(car)) {
    const max = STRONG_BRAKING_MAX[car.piClass]
    if (
      max != null && car.simBraking100 != null && car.simBraking100 <= max &&
      meetsDivisionStrengthBar(car.division, 'braking', avg?.braking, car.statBraking)
    ) {
      callouts.push({
        id:    'strong-braking',
        title: 'Stops short for its class',
        body:  `Needs only ~${Math.round(car.simBraking100)} ft to stop from 100 mph — among the best in ${car.piClass} class. Brake later than feels natural; it'll reward aggressive braking zones.`,
      })
    }
  }

  // ── Rule 20 — Strong cornering grip for class (raised bar on grip-strong divisions) ─
  if (simDataLooksConsistent(car)) {
    const min = STRONG_GRIP_MIN[car.piClass]
    if (
      min != null && car.simLateralG120 != null && car.simLateralG120 >= min &&
      meetsDivisionStrengthBar(car.division, 'grip', avg?.handling, car.statHandling)
    ) {
      callouts.push({
        id:    'strong-cornering-grip',
        title: 'High cornering grip for class',
        body:  `${car.simLateralG120.toFixed(2)}G at 120 mph — among the highest in ${car.piClass} class. Carries corner speed well; strong on technical and road-course layouts.`,
      })
    }
  }

  // ── Rule 21 — Strong acceleration for class ──────────────────────────────
  if (simDataLooksConsistent(car)) {
    const max = STRONG_ACCEL_MAX[car.piClass]
    if (max != null && car.simZeroToSixty != null && car.simZeroToSixty <= max) {
      callouts.push({
        id:    'strong-acceleration',
        title: 'Among the quickest in class',
        body:  `0-60 in ${car.simZeroToSixty.toFixed(1)}s — among the quickest off the line in ${car.piClass} class.`,
      })
    }
  }

  // Rule 22 (corner-exit / point-and-squirt) is retired as of v3: its gate was identical to
  // arch-point-squirt's below, so it would always fire and always be immediately subsumed —
  // dead weight. The archetype now owns this identity outright (see detectArchetype, gate 2).

  // ── Archetype synthesis — leads the list and absorbs the callouts it subsumes ────────────
  const archetype = detectArchetype(car)
  if (archetype) {
    const filtered = callouts.filter((c) => !archetype.subsumes.includes(c.id))
    return [{ id: archetype.id, title: archetype.title, body: archetype.body }, ...filtered]
  }

  return callouts
}
