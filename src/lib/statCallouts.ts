import type { Car } from '@/types/car'

export interface StatCallout {
  id: string
  title: string
  body: string
}

/**
 * Generate stat-aware tuning callouts from a car's recorded stats.
 *
 * Rules fire only when the relevant stat fields are present.
 * Thresholds are educated starting points based on observed stat distributions
 * and DO NOT account for PI class context — a 6.5 speed stat means very
 * different things at D 100 vs R 900. Revisit thresholds as more cars get
 * stats entered and patterns emerge.
 */
export function getStatCallouts(car: Car): StatCallout[] {
  const callouts: StatCallout[] = []

  // Rule 1 — Poor braking: prioritise brake upgrade / tuning
  if (car.statBraking != null && car.statBraking < 6.0) {
    callouts.push({
      id: 'weak-braking',
      title: 'Weak braking',
      body: `Braking is ${car.statBraking.toFixed(1)} — trail-braking and late-braking technique will hurt here. Prioritise brake upgrade and increase brake pressure/bias toward the front in tuning.`,
    })
  }

  // Rule 2 — Poor handling: stiffer ARBs + alignment work
  if (car.statHandling != null && car.statHandling < 5.5) {
    callouts.push({
      id: 'low-handling',
      title: 'Low handling',
      body: `Handling is ${car.statHandling.toFixed(1)} — the car will understeer or feel vague. Focus on alignment (more negative camber), stiffer anti-roll bars, and softer springs to keep all four tyres loaded.`,
    })
  }

  // Rule 3 — RWD with strong front weight bias: prone to oversteer
  if (
    car.frontWeight != null &&
    car.drivetrain === 'RWD' &&
    car.frontWeight < 42
  ) {
    callouts.push({
      id: 'rwd-front-light',
      title: 'RWD — front-light balance',
      body: `Front weight is ${car.frontWeight}% on a RWD car. The rear end will snap easily under power. Run softer rear springs, add rear downforce if available, and be conservative with throttle on corner exit.`,
    })
  }

  // Rule 4 — FWD with strong rear weight bias: chronic understeer
  if (
    car.frontWeight != null &&
    car.drivetrain === 'FWD' &&
    car.frontWeight > 58
  ) {
    callouts.push({
      id: 'fwd-rear-heavy',
      title: 'FWD — rear-heavy balance',
      body: `Front weight is ${car.frontWeight}% on a FWD car — most of the mass is over the driven wheels, making understeer the dominant trait. Soften front springs, stiffen rear ARB, and reduce front tyre pressure slightly to maximise grip.`,
    })
  }

  // Rule 5 — High launch + weak braking: fast off the line but hard to scrub speed
  if (
    car.statLaunch != null &&
    car.statBraking != null &&
    car.statLaunch > 7.5 &&
    car.statBraking < 6.0
  ) {
    callouts.push({
      id: 'launch-braking-mismatch',
      title: 'Strong launch, weak brakes',
      body: `Launch is ${car.statLaunch.toFixed(1)} but braking is only ${car.statBraking.toFixed(1)} — the car accelerates faster than it can stop. Brake significantly earlier than feels natural and avoid roads with tight chicanes after long straights.`,
    })
  }

  // Rule 6 — Poor offroad: avoid unpaved surfaces
  if (car.statOffroad != null && car.statOffroad < 5.0) {
    callouts.push({
      id: 'low-offroad',
      title: 'Low offroad capability',
      body: `Offroad is ${car.statOffroad.toFixed(1)} — avoid dirt, gravel, and mixed-surface routes. On cross-country events hit the smooth racing line and let others absorb the rough terrain.`,
    })
  }

  return callouts
}
