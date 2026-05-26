import type { Car } from '@/types/car'

export interface StatCallout {
  id:    string
  title: string
  body:  string
}

/**
 * Generate stat-aware tuning callouts from a car's recorded stats and tags.
 *
 * These callouts are based on general Forza tuning knowledge, community
 * meta as of May 2026, and educated inference from the stat scale.
 * They are labelled "Stat Analysis" in the UI and may be refined over time
 * as more cars get stats entered and patterns emerge.
 *
 * Important limitations:
 * - Thresholds do NOT account for PI class context. A 6.5 handling stat
 *   means different things at D 100 vs S1 800. Revisit as data grows.
 * - Rules only fire when the relevant stat fields are present on the car.
 * - Tag-based rules require the car's garage tags to be passed in.
 */
export function getStatCallouts(
  car: Car,
  garageTags?: string[]
): StatCallout[] {
  const callouts: StatCallout[] = []
  const tags = garageTags ?? []

  // ── Rule 1 — Poor braking ────────────────────────────────────────────────
  // Brakes are consistently undervalued in FH6. Low braking stat almost
  // always means upgrade brakes before any other chassis work.
  if (car.statBraking != null && car.statBraking < 6.0) {
    callouts.push({
      id:    'weak-braking',
      title: 'Weak braking',
      body:  `Braking reads as ${car.statBraking.toFixed(1)} — this is likely the car's biggest weakness. Current FH6 meta consistently rewards brake upgrades. Prioritise at least one tier above stock, move brake bias slightly forward (52% front is a safe starting point), and increase brake pressure if the car takes too long to scrub speed.`,
    })
  }

  // ── Rule 2 — Poor handling ───────────────────────────────────────────────
  if (car.statHandling != null && car.statHandling < 5.5) {
    callouts.push({
      id:    'low-handling',
      title: 'Low handling',
      body:  `Handling reads as ${car.statHandling.toFixed(1)} — the car will likely understeer or feel vague through corners. Focus on alignment (more negative front camber, around -1.5° to -2.0°), stiffer front anti-roll bars, and softer springs to keep all four tyres loaded through direction changes.`,
    })
  }

  // ── Rule 3 — RWD rear-heavy ──────────────────────────────────────────────
  // frontWeight < 42 means 58%+ rear — significant rear-heavy bias on RWD.
  // Diff decel is the primary tuning lever here.
  if (
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
  // frontWeight > 58 means most mass over driven wheels — chronic understeer.
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
  // Common pairing on powerful RWD cars. Fast in but slow to stop.
  if (
    car.statLaunch   != null &&
    car.statBraking  != null &&
    car.statLaunch   >  7.5  &&
    car.statBraking  <  6.0
  ) {
    callouts.push({
      id:    'launch-braking-mismatch',
      title: 'Strong launch, weak brakes',
      body:  `Launch is ${car.statLaunch.toFixed(1)} but braking is only ${car.statBraking.toFixed(1)} — the car accelerates faster than it can stop. This gap is worth noting when choosing races and braking points. Brake significantly earlier than feels natural on first use, prioritise the brake upgrade, and avoid races with tight chicanes immediately after long straights until the brakes are sorted.`,
    })
  }

  // ── Rule 6 — Poor offroad ────────────────────────────────────────────────
  if (car.statOffroad != null && car.statOffroad < 5.0) {
    callouts.push({
      id:    'low-offroad',
      title: 'Low offroad capability',
      body:  `Offroad reads as ${car.statOffroad.toFixed(1)} — this car is not suited to dirt, gravel, or mixed-surface routes regardless of other tags. On cross-country events stick to the smoothest racing line and avoid the rough terrain where possible. Consider a dedicated offroad build for those disciplines instead.`,
    })
  }

  // ── Rule 7 — Touge / technical damping reminder ──────────────────────────
  // Fires when the car is tagged for tight or technical use.
  // The Bump < Rebound rule is FH6-specific and meaningful enough to surface.
  const isTechnical = tags.some((t) => ['tight', 'technical'].includes(t))
  if (isTechnical) {
    callouts.push({
      id:    'touge-damping',
      title: 'Tight / technical roads — damping note',
      body:  'This car is tagged for tight or technical use. On mountain passes and uneven roads, apply the Bump < Rebound rule: set bump damping at 60-70% of your rebound value (rebound must be stiffer than bump). A stiff road tune packs down through consecutive drainage dips and cracked surfaces, progressively losing steering response. Also run springs 20-25% softer than your road racing baseline.',
    })
  }

  // ── Rule 8 — High power, low handling ────────────────────────────────────
  // Power-to-handling imbalance — car is faster than it can steer.
  if (
    car.powerHp      != null &&
    car.statHandling != null &&
    car.powerHp      >  450  &&
    car.statHandling <  6.0
  ) {
    callouts.push({
      id:    'power-handling-gap',
      title: 'Power exceeds handling',
      body:  `${car.powerHp}hp with a handling stat of ${car.statHandling.toFixed(1)} — the engine is working faster than the chassis can manage. Chassis and tyre upgrades will gain more lap time than further power adds. Tires, suspension, and differential before any engine work.`,
    })
  }

  return callouts
}