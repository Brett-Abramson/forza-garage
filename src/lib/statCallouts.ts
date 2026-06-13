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
  if (
    !isDrift &&
    avg?.braking != null &&
    car.statBraking != null &&
    car.statBraking < avg.braking + delta
  ) {
    callouts.push({
      id:    'weak-braking',
      title: 'Weak braking',
      body:  `Braking reads as ${car.statBraking.toFixed(1)} — below the ${car.division} ${car.piClass} average of ${avg.braking.toFixed(1)}. This is likely the car's biggest weakness. Current FH6 meta consistently rewards brake upgrades. Prioritise at least one tier above stock, move brake bias slightly forward (52% front is a safe starting point), and increase brake pressure if the car takes too long to scrub speed.`,
    })
  }

  // ── Rule 2 — Low handling ────────────────────────────────────────────────
  if (
    !isDrift &&
    !isDrag &&
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

  return callouts
}
