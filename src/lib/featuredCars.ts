// lib/featuredCars.ts
// ─────────────────────────────────────────────────────────────────────────────
// Curated list of featured cars for the landing page showcase.
// One car is picked randomly on each page load from this list.
//
// Sources: fandomwire.com, gamingpromax.com, grindout.com, skycoach.gg
// Meta as of May 2026 — update as patches shift the competitive landscape.
//
// IMPORTANT: make and model must exactly match values in the Car database
// so the "Add to Garage" button can look up the car by make + model + year.
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

  // ── Best in class ──────────────────────────────────────────────────────────

  {
    make:     'Aston Martin',
    model:    'Valhalla Concept Car',
    year:     2019,
    piClass:  'R',
    piRating: 960,
    reason:   'Widely regarded as the R class champion at launch — exceptional balance of speed, handling, and downforce.',
    badge:    'Best in R',
  },
  {
    make:     'Porsche',
    model:    '911 Turbo S',
    year:     2023,
    piClass:  'S1',
    piRating: 774,
    reason:   'Fastest S1 at stock with a 9.3 acceleration and perfect 10 launch stat. Accessible and tuneable.',
    badge:    'Best in S1',
  },
  {
    make:     'BMW',
    model:    'M8 Competition Coupé',
    year:     2020,
    piClass:  'A',
    piRating: 684,
    reason:   'The standout A class pick — near-S1 stats in a class-legal car. Fast and actually driveable.',
    badge:    'Best in A',
  },
  {
    make:     'Toyota',
    model:    'GR86',
    year:     2022,
    piClass:  'B',
    piRating: 556,
    reason:   'Lightweight, balanced, and responsive — the community\'s top B class road and street pick.',
    badge:    'Best in B',
  },
  {
    make:     'Honda',
    model:    'Civic Type R',
    year:     2023,
    piClass:  'C',
    piRating: 499,
    reason:   'The best front-wheel-drive C class car — exceptional handling and consistent lap times.',
    badge:    'Best in C',
  },
  {
    make:     'Toyota',
    model:    'Land Cruiser',
    year:     2025,
    piClass:  'C',
    piRating: 456,
    reason:   'Best all-rounder at C class for off-road racing — strong offroad stat and surprisingly capable.',
    badge:    'Best Offroad C',
    raceType: 'crosscountry',
  },
  {
    make:     'Mercedes-Benz',
    model:    'G 63 AMG 6x6',
    year:     2014,
    piClass:  'C',
    piRating: 471,
    reason:   'Best offroad rating in C class — a legitimate cross country threat in a six-wheeled truck.',
    badge:    'Offroad Beast',
    raceType: 'crosscountry',
  },

  // ── Best for specific race types ───────────────────────────────────────────

  {
    make:     'Toyota',
    model:    'Sprinter Trueno GT Apex',
    year:     1985,
    piClass:  'D',
    piRating: 380,
    reason:   'The AE86 — lightweight, perfectly balanced, the definitive touge car. It belongs on a mountain pass.',
    badge:    'Touge Legend',
    raceType: 'touge',
  },
  {
    make:     'Mazda',
    model:    'RX-7 Type R',
    year:     1992,
    piClass:  'B',
    piRating: 580,
    reason:   'The rotary-powered RX-7 is a natural touge and drift machine — light, rear-wheel drive, communicative.',
    badge:    'Touge Icon',
    raceType: 'touge',
  },
  {
    make:     'Nissan',
    model:    'Silvia Spec-R',
    year:     2002,
    piClass:  'C',
    piRating: 480,
    reason:   'The S15 Silvia — the definitive JDM drift platform, long wheelbase, predictable oversteer.',
    badge:    'Drift King',
    raceType: 'drift',
  },
  {
    make:     'Subaru',
    model:    'Impreza WRX STI',
    year:     2005,
    piClass:  'B',
    piRating: 565,
    reason:   'AWD rally pedigree makes the STI one of the most trusted dirt and cross country builds in the game.',
    badge:    'Rally Hero',
    raceType: 'dirt',
  },
  {
    make:     'Mitsubishi',
    model:    'Lancer Evolution IX MR',
    year:     2006,
    piClass:  'B',
    piRating: 566,
    reason:   'The Evo IX\'s AWD system and tuneable chassis make it a class-leading dirt racer at B class.',
    badge:    'Dirt King',
    raceType: 'dirt',
  },
  {
    make:     'Lamborghini',
    model:    'Huracán EVO',
    year:     2020,
    piClass:  'S1',
    piRating: 800,
    reason:   'AWD with near-perfect launch stats — the Huracán EVO is one of FH6\'s best drag strip builds.',
    badge:    'Drag Weapon',
    raceType: 'drag',
  },
  {
    make:     'Chevrolet',
    model:    'Camaro ZL1',
    year:     2017,
    piClass:  'S1',
    piRating: 727,
    reason:   'American muscle at its best for drag — massive torque, strong launch, and accessible at S1.',
    badge:    'Drag Icon',
    raceType: 'drag',
  },
  {
    make:     'Porsche',
    model:    '911 GT3 RS',
    year:     2023,
    piClass:  'S1',
    piRating: 800,
    reason:   'The GT3 RS at S1 is the benchmark road racing car — purpose-built chassis, exceptional cornering.',
    badge:    'Road Racer',
    raceType: 'road',
  },
  {
    make:     'Honda',
    model:    'Civic Type R',
    year:     2018,
    piClass:  'B',
    piRating: 570,
    reason:   'The FK8 Type R is one of the most competitive street racing cars at B class — tight, technical, fast.',
    badge:    'Street Fighter',
    raceType: 'street',
  },
  {
    make:     'Ford',
    model:    'F-150 Raptor R',
    year:     2023,
    piClass:  'A',
    piRating: 640,
    reason:   'The Raptor R is a class-legal cross country monster — suspension travel, AWD, and enough power to win.',
    badge:    'Cross Country',
    raceType: 'crosscountry',
  },
  {
    make:     'Nissan',
    model:    'GT-R Black Edition (R35)',
    year:     2012,
    piClass:  'S2',
    piRating: 850,
    reason:   'The Nissan GT-R Forza Edition is one of the most complete S2 cars — fast, AWD, and tuneable for anything.',
    badge:    'All-Rounder S2',
  },
  {
    make:     'Toyota',
    model:    'GR Supra',
    year:     2020,
    piClass:  'A',
    piRating: 700,
    reason:   'The GR Supra sits at the top of A class — rear-wheel drive balance and BMW-derived straight-six power.',
    badge:    'A Class Star',
    raceType: 'road',
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