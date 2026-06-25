// lib/featuredCars.ts
// ─────────────────────────────────────────────────────────────────────────────
// Curated list of featured cars for the landing-page meta carousel.
// One car is picked randomly on each page load from this list.
//
// Sources (Rivals-derived only):
//   • forza.guide/meta — pick-rate, 6/23/2026 (post drag-tire nerf)
//   • "FH6 Rival Races" sheet — pro-filtered top 100–200, 6/9–6/12/2026
//   • Forza Support patch notes Update 375.327 (6/15/2026)
//
// CONFIDENCE: road + dirt entries are cross-checked across both sources.
// UNVERIFIED: drag / drift / touge / street have NO Rivals leaderboard coverage in
//   either source — those entries are editorial placeholders. Verify against live
//   community sources before treating as meta.
// COVERAGE GAP: dirt & cross-country data only spans S1/A/B. A-class cross-country
//   has no valid pick (its sheet #1 was the X-Class, which is not in FH6).
//
// IMPORTANT: make + model + year must match the Car database exactly so the
// "Add to Garage" lookup works. piRating values marked below are estimates.
// ─────────────────────────────────────────────────────────────────────────────

export interface FeaturedCar {
  make:        string
  model:       string
  year:        number
  piClass:     string
  piRating:    number
  reason:      string   // one sentence — why this car is featured
  badge:       string   // short label shown on the card e.g. "Best in S1"
  raceType?:   string   // optional — links to a race type id in races.ts
}

export const FEATURED_CARS: FeaturedCar[] = [

  // ── Best in class (road) — dual-source validated ───────────────────────────

  {
    make:     'Mazda',
    model:    '787B',
    year:     1991,
    piClass:  'R',
    piRating: 998,   // estimate
    reason:   'R-class road #1 in both sources — the most-picked R car across road tracks.',
    badge:    'Best in R',
    raceType: 'road',
  },
  {
    make:     'Mazda',
    model:    'Furai',
    year:     2008,
    piClass:  'S2',
    piRating: 950,   // estimate
    reason:   'Top S2 road pick on the Rivals leaderboard — the S2 all-rounder.',
    badge:    'Best in S2',
    raceType: 'road',
  },
  {
    make:     'Acura',
    model:    'NSX',
    year:     2022,
    piClass:  'S1',
    piRating: 800,   // estimate
    reason:   'Post-nerf #1 S1 road pick — genuine-grip car unaffected by the drag-tire change. (Cross-source-safe alt: Dodge Viper 2008.)',
    badge:    'Best in S1',
    raceType: 'road',
  },
  {
    make:     'Ford',
    model:    'GT',
    year:     2005,
    piClass:  'A',
    piRating: 700,   // estimate
    reason:   'A-class road #1 in both sources — wins 13 of 22 sheet road events outright.',
    badge:    'Best in A',
    raceType: 'road',
  },
  {
    make:     'Honda',
    model:    'Beat',
    year:     1991,
    piClass:  'B',
    piRating: 600,   // estimate
    reason:   'B-class road #1 in both sources (14 of 22 events) and dominant cross-class — the defining car of the season.',
    badge:    'Best in B',
    raceType: 'road',
  },
  {
    make:     'Acura',
    model:    'Integra Type R',
    year:     2001,
    piClass:  'C',
    piRating: 499,   // estimate; DB stock 471
    reason:   'C-class road #1 on forza.guide pick-rate — the recognizable C benchmark.',
    badge:    'Best in C',
    raceType: 'road',
  },

  // ── Race-type specialists ──────────────────────────────────────────────────

  {
    make:     'Porsche',
    model:    '911 GT3 RS',
    year:     2023,
    piClass:  'S1',
    piRating: 800,
    reason:   'Purpose-built S1 chassis with exceptional cornering — a real-grip road racer that survived the nerf.',
    badge:    'Road Racer',
    raceType: 'road',
  },
  {
    make:     'Shelby',
    model:    'Cobra Daytona Coupe',
    year:     1965,
    piClass:  'A',
    piRating: 700,   // estimate; DB stock B/515
    reason:   'A-class dirt leader — #1 in the Rival sheet and #2 on forza.guide; both sources agree on it.',
    badge:    'Dirt Meta A',
    raceType: 'dirt',
  },
  {
    make:     'Subaru',
    model:    'Impreza WRX STI',
    year:     2005,
    piClass:  'B',
    piRating: 565,
    reason:   'Trusted, recognizable AWD rally build for B-class dirt.',
    badge:    'Rally Hero',
    raceType: 'dirt',
  },
  {
    make:     'Subaru',
    model:    'BRZ Forza Edition',
    year:     2022,
    piClass:  'S1',
    piRating: 798,   // estimate; DB stock A/700
    reason:   'Most accessible top S1 cross-country pick — the sheet\'s consistent S1 choice behind the VIP-only Viper FE.',
    badge:    'Cross Country S1',
    raceType: 'crosscountry',
  },
  {
    make:     'Ford',
    model:    'Super Duty F-450 DRW PLATINUM Forza Edition',
    year:     2020,
    piClass:  'B',
    piRating: 580,   // estimate; DB stock A/700
    reason:   'B-class cross-country #1 in the Rival sheet — dominant across CC tracks.',
    badge:    'Cross Country B',
    raceType: 'crosscountry',
  },

  // ── UNVERIFIED disciplines (no Rivals data in sources) — editorial picks ────

  {
    make:     'Toyota',
    model:    'Sprinter Trueno GT Apex',
    year:     1985,
    piClass:  'D',
    piRating: 380,
    reason:   'The AE86 — lightweight, balanced, the definitive touge car (also forza.guide D-road #2).',
    badge:    'Touge Legend',
    raceType: 'touge',
  },
  {
    make:     'Mazda',
    model:    'RX-7 Type R',
    year:     1992,
    piClass:  'B',
    piRating: 580,
    reason:   'Rotary-powered, light, RWD — a natural touge and drift machine.',
    badge:    'Touge Icon',
    raceType: 'touge',
  },
  {
    make:     'Nissan',
    model:    'Silvia Spec-R',
    year:     2002,
    piClass:  'C',
    piRating: 480,
    reason:   'The S15 — a JDM drift platform with a long wheelbase and predictable oversteer.',
    badge:    'Drift King',
    raceType: 'drift',
  },
  {
    make:     'Lamborghini',
    model:    'Huracán EVO',
    year:     2020,
    piClass:  'S1',
    piRating: 800,
    reason:   'AWD with near-perfect launch stats — a strong S1 drag-strip build.',
    badge:    'Drag Weapon',
    raceType: 'drag',
  },
  {
    make:     'Chevrolet',
    model:    'Camaro ZL1',
    year:     2017,
    piClass:  'S1',
    piRating: 727,
    reason:   'American muscle for S1 drag — massive torque and a strong launch.',
    badge:    'Drag Icon',
    raceType: 'drag',
  },
  {
    make:     'Honda',
    model:    'Civic Type R',
    year:     2018,
    piClass:  'B',
    piRating: 570,
    reason:   'The FK8 — tight, technical, and competitive for B-class street racing.',
    badge:    'Street Fighter',
    raceType: 'street',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Returns a single random featured car on each call.
// Call server-side so the selection is stable per page render.
// ─────────────────────────────────────────────────────────────────────────────

export function getRandomFeaturedCar(): FeaturedCar {
  return FEATURED_CARS[Math.floor(Math.random() * FEATURED_CARS.length)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns a featured car for a specific race type if one exists,
// otherwise falls back to a random pick.
// ─────────────────────────────────────────────────────────────────────────────

export function getFeaturedCarForRace(raceTypeId: string): FeaturedCar {
  const matches = FEATURED_CARS.filter((c) => c.raceType === raceTypeId)
  if (matches.length === 0) return getRandomFeaturedCar()
  return matches[Math.floor(Math.random() * matches.length)]
}
