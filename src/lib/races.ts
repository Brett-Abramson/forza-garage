import { CAR_TAGS } from "./tags"

export type CarTag = typeof CAR_TAGS[number]

export interface RaceType {
  id: string
  name: string
  icon: string                  // emoji fallback until you add proper icons
  surface: string               // short surface label for the card
  description: string           // 2-3 sentence summary shown on the card
  demands: string[]             // bullet points shown in the detail view
  avoid: string[]               // what works against you in this race type
  recommendedTags: CarTag[]     // maps to your CAR_TAGS — drives garage filter
  piSweetSpot: string           // rough competitive PI range
  drivetrainNote: string        // AWD / RWD / FWD guidance
}

export const RACE_TYPES: RaceType[] = [
  {
    id: "road",
    name: "Road Racing",
    icon: "🏁",
    surface: "Asphalt",
    description:
      "The most balanced race type in FH6. Routes mix fast open sections with tighter corners, so the car needs to do everything well — accelerate, brake hard, hold a line, and stay stable when the layout shifts. Raw top speed alone won't win here.",
    demands: [
      "Balanced grip across all corner types",
      "Strong braking stability",
      "Clean corner exit traction",
      "Aero helps at higher PI classes",
    ],
    avoid: [
      "Cars tuned purely for straight-line speed",
      "Heavy off-road builds with soft suspension",
      "Excessive oversteer setups",
    ],
    recommendedTags: ["asphalt", "grip", "long straights", "technical", "tuned"],
    piSweetSpot: "700–900 (S1 / S2)",
    drivetrainNote:
      "RWD is rewarding when tuned well. AWD is more forgiving. FWD struggles on faster layouts.",
  },
  {
    id: "street",
    name: "Street Racing",
    icon: "🏙️",
    surface: "Asphalt — tight",
    description:
      "Street routes are shorter, tighter, and less forgiving than road circuits. Poor exits and messy braking compound quickly. Cars that launch hard, recover fast, and feel confident through sharp corners win here more consistently than pure top-speed machines.",
    demands: [
      "Strong off-the-line traction",
      "Quick weight transfer through tight corners",
      "Confident braking at lower speeds",
      "Composure after kerbs and compressions",
    ],
    avoid: [
      "High-downforce builds that feel sluggish below 80mph",
      "Cars that need long straights to build momentum",
      "Loose rear-end setups that punish tight exits",
    ],
    recommendedTags: ["asphalt", "grip", "tight", "technical", "tuned"],
    piSweetSpot: "600–800 (A / S1)",
    drivetrainNote:
      "AWD dominates street racing for traction consistency. RWD can work with a very clean tune.",
  },
  {
    id: "dirt",
    name: "Dirt Racing",
    icon: "🌲",
    surface: "Loose / dirt",
    description:
      "Dirt racing still behaves like racing — just on loose roads. The car needs to slide enough to point toward the exit without bleeding all its speed. Rally-bred cars are at home here because they're built around mixed grip and quick weight transfer.",
    demands: [
      "Traction on loose and mixed surfaces",
      "Controlled rotation — slide to point, not to spin",
      "Suspension that absorbs small bumps without losing line",
      "Quick throttle response out of slow corners",
    ],
    avoid: [
      "Low-clearance road cars",
      "Stiff suspension setups built for asphalt",
      "RWD cars without a rally-specific tune",
    ],
    recommendedTags: ["dirt", "offroad", "tuned"],
    piSweetSpot: "500–700 (B / A / S1)",
    drivetrainNote:
      "AWD is strongly preferred. The classic rally picks (Impreza WRX STI, Lancer Evo) are AWD for a reason.",
  },
  {
    id: "crosscountry",
    name: "Cross Country",
    icon: "🏔️",
    surface: "Mixed — rough terrain",
    description:
      "Cross country is not dirt racing. Routes go over rough terrain, uneven landings, open paths and sections where a car that can't survive the ground wins over a car that can corner. Suspension travel, stability, and durability matter more than clean cornering.",
    demands: [
      "High suspension travel for rough landings",
      "Stability over crests and jumps",
      "Off-road traction across multiple surfaces",
      "Enough power to recover from slow sections",
    ],
    avoid: [
      "Road cars of any kind",
      "Low-clearance sports cars",
      "Anything with stiff asphalt-focused suspension",
    ],
    recommendedTags: ["mixed", "offroad", "dirt", "tuned"],
    piSweetSpot: "500–700 (B / A)",
    drivetrainNote:
      "AWD is essential. Proper off-road vehicles (trucks, SUVs, buggies) have a genuine advantage over converted road cars.",
  },
  {
    id: "drift",
    name: "Drift Zones",
    icon: "💨",
    surface: "Asphalt",
    description:
      "Drift zones are scored on angle, speed, and style — not lap time. A car that can hold a long controlled slide at the right angle scores more than one that snaps sideways and recovers. This is the one discipline where grip tuning actively works against you.",
    demands: [
      "Controlled and sustained oversteer",
      "Enough power to maintain angle through long zones",
      "Predictable throttle response mid-slide",
      "Low grip rear setup to initiate easily",
    ],
    avoid: [
      "AWD builds — they fight oversteer",
      "High-grip tire setups",
      "Cars with too little power to maintain angle",
    ],
    recommendedTags: ["asphalt", "drift", "tuned"],
    piSweetSpot: "600–800 (A / S1)",
    drivetrainNote:
      "RWD only. AWD conversions work against you here. FWD is not viable for drift zones.",
  },
]

// Helper — given a race type id, returns the recommended tags as a query string
// Usage: /garage?tags=asphalt,grip,tight
export function getRaceFilterUrl(raceId: string): string {
  const race = RACE_TYPES.find((r) => r.id === raceId)
  if (!race) return "/garage"
  const tags = race.recommendedTags.join(",")
  return `/garage?tags=${tags}`
}
