// ─────────────────────────────────────────────────────────────────────────────
// Static reference content for every number the app shows on a car — the single
// source of truth behind both the /guide page and the drawer's info-icon tooltips.
//
// Each entry has a `short` (drawer bottom-sheet gloss) and `long` (page body), plus
// a stable `id` used as BOTH the page anchor (`/guide#{id}`) and the info icon's
// deep-link target. Never author this copy in two places — the drawer and the page
// both read from here.
//
// Numbers are dataset-derived (~580 cars with scraped sim data). Treat the ranges
// like a tier list: re-derive if the catalog grows materially, verify against live
// sources. Same convention as DIVISION_PROFILES in statCallouts.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type StatGuideCategory = 'identity' | 'bar' | 'spec' | 'sim'

export interface StatGuideEntry {
  /** Stable slug — the page anchor (`/guide#{id}`) AND the drawer info-icon's deep-link target. */
  id: string
  /** Heading on the page card / title in the drawer bottom sheet. */
  label: string
  /** Which page section this renders under (also drives section grouping/order). */
  category: StatGuideCategory
  /** Field name + unit/direction hint, e.g. 'simLateralG60 · simLateralG120 — g, higher is better'. */
  field?: string
  /** One-line "why you care" hook, in §5's voice (e.g. "Weight → everything") — shown bold before the definition. Bar/spec/sim entries only; identity entries lead with the definition instead. */
  hook?: string
  /** Drawer bottom-sheet gloss — 1–2 sentences. THE tooltip copy. */
  short: string
  /** Page body: definition → how to read it → what it's good for, as paragraphs. */
  long: string[]
  /** Page body: threshold bands. `label` is the plain-English lead, `detail` is the demoted numeric threshold. */
  bullets?: { label: string; detail?: string; text: string }[]
  /** Cross-reference to another stat/bar — pairings, "precise counterpart", correlations. */
  relatedStat?: string
  /** Caveat or accuracy note — kept separate from relatedStat so a scanning eye can tell "here's a link" from "here's a warning" without reading the sentence. */
  note?: string
  /** Jump target into the Appendix's matching per-class table (see StatsGuideView's APPENDIX_TABLES ids). */
  appendixRef?: string
}

export const STAT_GUIDE_ENTRIES: StatGuideEntry[] = [

  // ─── Identity layer ────────────────────────────────────────────────────────
  {
    id: 'pi-class',
    label: 'PI class',
    category: 'identity',
    field: 'D → C → B → A → S1 → S2 → R',
    short: "The performance bracket. Races cap by class, so a car's stats only matter relative to its class — “good for class” is the only meaningful judgement.",
    long: [
      "The performance bracket a car sits in, from D up through C, B, A, S1, S2 to R. Every race caps entries by class, which is why every other number on this page has to be read against it.",
    ],
  },
  {
    id: 'pi-rating',
    label: 'PI rating',
    category: 'identity',
    field: '0–999 — position within the class',
    short: "Fine-grained position within the class. A 698 A-class car sits near the S1 cutoff; a 501 B-class car has just cleared C.",
    long: [
      "A 0–999 score that pinpoints where a car sits inside its class.",
      "Use it to gauge headroom: a high rating means the car is near the top of its bracket (and close to bumping up a class); a low rating means it only just cleared the class below.",
    ],
  },
  {
    id: 'division',
    label: 'Division',
    category: 'identity',
    field: 'e.g. Modern Super Saloons, Rally Monsters',
    short: "The car's family. Drives auto-tags, expected race types, and which weaknesses actually matter for it.",
    long: [
      "The car's family — Modern Super Saloons, Rally Monsters, and so on. It powers the app's auto-tags and race-type suggestions.",
      "The division decides which weaknesses count: a rally car's low top speed is a non-issue, a GT car's isn't. Read every other number through the division's lens.",
    ],
  },
  {
    id: 'drivetrain',
    label: 'Drivetrain',
    category: 'identity',
    field: 'FWD / RWD / AWD',
    short: "FWD, RWD, or AWD — determines launch behaviour and balance tendencies. AWD launches hardest and is the safe off-road default; RWD rotates and drifts; FWD understeers and is light/cheap.",
    long: [
      "Which wheels get power — front, rear, or all four. It sets launch behaviour and the car's natural balance tendency.",
      "AWD launches hardest and is the safe default off-road; RWD rotates and drifts; FWD tends to understeer but is light and cheap on PI.",
    ],
  },
  {
    id: 'value-rarity',
    label: 'Value & rarity',
    category: 'identity',
    field: 'acquisition, not performance',
    short: "How you get the car and how hard it is to find — an acquisition detail, not a performance one. Ignore it for race fit.",
    long: [
      "Credit value and how hard the car is to obtain.",
      "These describe acquisition, not performance — they have no bearing on how the car races. Ignore them when judging race fit.",
    ],
  },

  // ─── The six bar stats (0–10) ──────────────────────────────────────────────
  {
    id: 'speed',
    label: 'Speed',
    category: 'bar',
    field: 'statSpeed — 0–10 bar',
    hook: "The quick read on top-end pace.",
    short: "In-game rating of straight-line speed potential. High speed means strong on straights and fast circuits.",
    long: [
      "The in-game star rating of straight-line speed potential.",
      "High speed = strong on long straights and fast circuits. It's a quick read; the sim top-speed figure is the precise version of the same quality.",
    ],
    relatedStat: "Precise counterpart: Top speed (simTopSpeed). Trust the sim number when they disagree.",
  },
  {
    id: 'handling',
    label: 'Handling',
    category: 'bar',
    field: 'statHandling — 0–10 bar',
    hook: "How willingly the car turns — the headline cornering number.",
    short: "In-game rating of cornering ability. High handling means it holds a line and changes direction willingly.",
    long: [
      "The in-game rating of cornering ability.",
      "High handling = holds a line and changes direction willingly. Pair it with the lateral-G curve to read its character: a high bar with a flat lateral curve is a low-speed corner car; with a rising curve it's a fast-sweeper.",
    ],
    relatedStat: "Precise counterpart: Lateral G (simLateralG60/120), plus mech/aero balance for how that grip is distributed.",
  },
  {
    id: 'acceleration',
    label: 'Acceleration',
    category: 'bar',
    field: 'statAcceleration — 0–10 bar',
    hook: "How hard it pulls once it's already moving.",
    short: "How hard the car pulls once moving. High accel means strong corner exits and roll-on passes.",
    long: [
      "How hard the car pulls once it's already rolling.",
      "High accel = strong corner exits and roll-on overtakes. The shape of the two sim times (0–60 vs 0–100) tells you whether that pull is low-end or sustained.",
    ],
    relatedStat: "Precise counterpart: 0–60 and 0–100 (simZeroToSixty / simZeroToHundred), read together for acceleration shape.",
  },
  {
    id: 'launch',
    label: 'Launch',
    category: 'bar',
    field: 'statLaunch — 0–10 bar',
    hook: "The standing-start number — how well power turns into motion off the line.",
    short: "How well the car converts power to motion from a standstill. High launch means strong standing starts; driven heavily by drivetrain (AWD ≫ RWD/FWD) and weight.",
    long: [
      "How well the car converts power to motion from a dead stop.",
      "High launch = strong standing starts (drag, traffic-light street). It's driven heavily by drivetrain — AWD launches far harder than RWD or FWD — and by weight.",
    ],
    relatedStat: "Precise counterpart: the first slice of 0–60 (simZeroToSixty).",
  },
  {
    id: 'braking',
    label: 'Braking',
    category: 'bar',
    field: 'statBraking — 0–10 bar',
    hook: "How late you can leave the pedal.",
    short: "How hard the car can decelerate. High braking means brake later into hard zones — a cheap, worthwhile upgrade, though grip still separates the competitive field more.",
    long: [
      "How hard the car can slow down.",
      "High braking = brake later and carry confidence into hard braking zones. It's a real secondary signal and a cheap fix once you're tuning — but grip separates the competitive field more than braking does, so weigh it after tyres and suspension, not before.",
    ],
    relatedStat: "Precise counterpart: 60–0 / 100–0 braking distance (simBraking60 / simBraking100) — feet to stop, lower is better.",
  },
  {
    id: 'offroad',
    label: 'Offroad',
    category: 'bar',
    field: 'statOffroad — 0–10 bar',
    hook: "The dirt-and-gravel stat — irrelevant until it isn't.",
    short: "Composure on loose or rough surfaces — suspension travel and durability. Matters for dirt and cross-country, largely irrelevant on tarmac.",
    long: [
      "Composure on loose, rough, or uneven surfaces — a mix of suspension travel and durability.",
      "High offroad = at home on dirt, gravel, and cross-country. It's largely irrelevant for tarmac disciplines.",
    ],
    relatedStat: "No sim counterpart — this quality only lives as a bar stat.",
  },

  // ─── Raw specs ─────────────────────────────────────────────────────────────
  {
    id: 'power',
    label: 'Power',
    category: 'spec',
    field: 'powerHp — peak horsepower',
    hook: "The straight-line ceiling — but only with weight to match.",
    short: "Peak horsepower. Sets the straight-line ceiling, but only together with weight — high HP with weak handling is the classic “too much engine for the chassis” trap.",
    long: [
      "Peak horsepower.",
      "It sets the straight-line ceiling, but only in concert with weight (see power-to-weight). High HP with low handling is the classic “too much engine for the chassis” trap — spend PI on grip first.",
    ],
    relatedStat: "Read alongside Weight via Power-to-weight — the single most useful build-priority number.",
  },
  {
    id: 'torque',
    label: 'Torque',
    category: 'spec',
    field: 'torqueFtLb — rotational pulling force',
    hook: "The push out of corners — and the wheelspin that comes with it.",
    short: "Rotational pulling force. High torque gives strong low-end punch and corner exit, but on RWD/low-grip cars it also means wheelspin to tune out.",
    long: [
      "Rotational pulling force.",
      "High torque = strong low-end punch and corner exit. On RWD or low-grip cars it's double-edged: it also brings wheelspin, which is a tuning problem, not just a strength.",
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    category: 'spec',
    field: 'weightLb — mass',
    hook: "The hidden tax on every other number on this page.",
    short: "The car's mass — the hidden tax on acceleration, braking, grip, and direction change. Two equal-HP cars feel worlds apart if one is 800 lb lighter.",
    long: [
      "The car's mass — the hidden tax on almost everything: acceleration, braking distance, grip, and direction change.",
      "Two cars with equal HP perform very differently if one is 800 lb lighter. Weight reduction is often the most PI-efficient upgrade you can buy.",
    ],
    relatedStat: "Feeds Front weight, which in turn sets the Mechanical balance number — one weight figure predicts braking, balance, and where to spend PI.",
  },
  {
    id: 'front-weight',
    label: 'Front weight',
    category: 'spec',
    field: 'frontWeight — % of static weight on the front axle',
    hook: "Balance feel before you touch a single tuning slider.",
    short: "The share of the car's weight over the front axle (e.g. 58 = 58% front). The single best predictor of how balanced the car feels before you tune it.",
    long: [
      "Static weight distribution — how the car's mass splits front-to-rear at rest. It frames balance feel before you touch a single setting.",
      "Read it against 50%: nose-heavy cars lean on the front tyres and resist rotation; tail-heavy cars rotate eagerly and can get twitchy off-throttle.",
    ],
    bullets: [
      { label: 'Nose-heavy', detail: '> 55% front', text: "Understeer tendency, FWD-like — stronger front braking grip but lazy rotation." },
      { label: 'Tail-heavy', detail: '< 45% front', text: "Oversteer / rotation-happy (rear- and mid-engine cars); twitchy on lift-off." },
      { label: 'Neutral',    detail: '~ 50% front', text: "The tuner's friend — a balanced starting point." },
    ],
    relatedStat: "Inversely correlated with Mechanical balance (r = −0.61): a nose-heavy car reads a low mech-balance number.",
  },
  {
    id: 'displacement',
    label: 'Displacement',
    category: 'spec',
    field: 'displacementL — engine size in litres',
    hook: "Flavour, not a lever — mostly tells you the era and character.",
    short: "Engine size in litres. Mostly era/character flavour: big NA displacement is torquey low-end; small displacement with high HP is peaky and turbocharged.",
    long: [
      "Engine size in litres.",
      "Mostly descriptive rather than a performance lever: big naturally-aspirated displacement means a torquey low end; small displacement with high HP means a peaky, turbocharged unit that needs revs.",
    ],
  },
  {
    id: 'power-to-weight',
    label: 'Power-to-weight',
    category: 'spec',
    field: 'lb/hp = weightLb ÷ powerHp — lower is stronger',
    hook: "One number, one build decision: grip, power, or weight first.",
    short: "Weight divided by power — the most useful single number for build priority. Under ~6 lb/hp is power-rich (spend PI on grip); 13+ is heavy for its power (spend on power/weight).",
    long: [
      "Pounds per horsepower (weight ÷ power) — the most useful single number for deciding what to upgrade.",
      "Read it as a build-priority dial. Dataset spread: p25 ≈ 5.4, median ≈ 8.7, p75 ≈ 12.3.",
    ],
    bullets: [
      { label: 'Power-rich',  detail: '≤ 6 lb/hp',   text: "Spend PI on grip — tyres, suspension, aero." },
      { label: 'Balanced',    detail: '8–12 lb/hp',  text: "Build to the race type." },
      { label: 'Power-light', detail: '≥ 13 lb/hp',  text: "Straight-line pace is the limiter — spend PI on power or weight first." },
    ],
  },

  // ─── Simulation metrics ────────────────────────────────────────────────────
  {
    id: 'zero-to-sixty',
    label: '0–60 mph',
    category: 'sim',
    field: 'simZeroToSixty — seconds, lower is better',
    hook: "The precise version of Launch and Acceleration — read against class.",
    short: "Standing-start quickness, dominated by launch, low-end power, grip, and drivetrain. A slow 0–60 in A/S1 points to a top-end or off-road car, not a sprinter.",
    long: [
      "Standing-start quickness — time to reach 60 mph from rest.",
      "Dominated by launch, low-end power, grip, and drivetrain. A high (slow) value is normal in a low class; a slow 0–60 up in A or S1 flags a top-end or off-road car rather than a sprinter. Always read against class.",
    ],
    relatedStat: "Precise counterpart to the Launch and Acceleration bars.",
    appendixRef: 'appendix-zero-to-sixty',
  },
  {
    id: 'zero-to-hundred',
    label: '0–100 mph',
    category: 'sim',
    field: 'simZeroToHundred — seconds, lower is better',
    hook: "On its own just a number — paired with 0–60 it reveals where the car makes its time.",
    short: "Adds the 60→100 band on top of 0–60. Compared against 0–60 it reveals where the car makes its time — the “acceleration shape.”",
    long: [
      "Time from rest to 100 mph — 0–60 plus the 60→100 band.",
      "Its real value is comparative: divide it by 0–60 to get acceleration shape, which tells you whether the car keeps pulling up top or fades after 60.",
    ],
    bullets: [
      { label: 'Sustained', detail: 'ratio ≤ ~2.1', text: "Keeps pulling up top — suits long circuits and high-speed maps." },
      { label: 'Front-loaded', detail: 'ratio ≥ ~2.6', text: "Fades after 60 — suits street starts and short sprints." },
    ],
    relatedStat: "Acceleration shape = 0–100 ÷ 0–60.",
  },
  {
    id: 'top-speed',
    label: 'Top speed',
    category: 'sim',
    field: 'simTopSpeed — mph, higher is better',
    hook: "Matters on long straights, forgettable everywhere else.",
    short: "Terminal velocity. Matters most on long straights and high-speed circuits; little on technical, street, or dirt. EVs and short-geared cars cap low even when quick off the line.",
    long: [
      "Terminal velocity — the car's ceiling on a long enough road.",
      "It matters most on long straights and high-speed circuits and little on technical, street, or dirt layouts. EVs and short-geared cars cap low even when explosive to 60 (the RS e-tron GT tops out around 172 mph).",
    ],
    relatedStat: "Precise counterpart to the Speed bar. Trust this figure when the bar disagrees.",
    appendixRef: 'appendix-top-speed',
  },
  {
    id: 'braking-distance',
    label: 'Braking distance',
    category: 'sim',
    field: 'simBraking60 / simBraking100 — feet to stop, lower is better',
    hook: "Feet, not stars — the real stopping distance behind the Braking bar.",
    short: "Real stopping distance from 60 and 100 mph — the precise version of the Braking bar. The 100–0 figure separates cars on hard-braking technical tracks, and it's heavily weight-driven.",
    long: [
      "Actual stopping distance in feet, measured from 60 mph and from 100 mph — the precise version of the Braking bar.",
      "The 100–0 figure is the one that separates cars on hard-braking technical tracks. Both are heavily weight-driven, so lighter cars stop shorter.",
    ],
    relatedStat: "Precise counterpart to the Braking bar.",
    appendixRef: 'appendix-braking',
  },
  {
    id: 'lateral-g',
    label: 'Lateral G',
    category: 'sim',
    field: 'simLateralG60 · simLateralG120 — g, higher is better',
    hook: "How much grip, and whether it needs speed to show up.",
    short: "Mid-corner grip measured at 60 and 120 mph. The pair matters more than either alone — the 120/60 ratio tells you whether the car needs speed to grip.",
    long: [
      "The precise, physics-model version of the Handling bar: how much cornering grip the car holds, sampled at two speeds.",
      "Read two things at once — the absolute level (vs class p90 for “elite”) and how grip changes with speed (the 120/60 ratio, driven by downforce).",
    ],
    bullets: [
      { label: 'Comes alive at speed', detail: 'ratio ≥ ~1.12, roughly the top 20% of cars', text: "Downforce-driven — strong in fast sweepers, can feel inert when slow." },
      { label: 'Point-and-squirt',     detail: 'ratio ≤ ~1.0',                                text: "Little aero benefit — a low-speed chassis, better on tight layouts." },
    ],
    relatedStat: "Precise counterpart to the Handling bar (with mech/aero balance).",
    note: "Grip rising with speed is normal here (median ratio ≈ 1.03) — a falling ratio essentially never happens.",
    appendixRef: 'appendix-lateral-g',
  },
  {
    id: 'aero-efficiency',
    label: 'Aero efficiency',
    category: 'sim',
    field: 'simAeroEfficiency — ratio, higher is better',
    hook: "How much downforce you get for the drag it costs.",
    short: "Downforce-per-drag quality (most cars 0.80–0.86). A low value (≲ 0.70) means draggy — adding downforce costs real top speed, so run minimum wing on fast maps.",
    long: [
      "How much downforce the car makes per unit of drag — the quality of its aero (range ~0.07–0.93, most cars 0.80–0.86, median ~0.84).",
      "A low value (≲ 0.70) means draggy: adding downforce costs real top speed. On fast maps run the minimum wing you can, and save heavy downforce for grip-limited tracks.",
    ],
  },
  {
    id: 'mech-balance',
    label: 'Mechanical balance',
    category: 'sim',
    field: 'simMechBalance — ratio, ~0.50 is neutral',
    hook: "The low-speed tell for understeer or oversteer, before you've turned a wheel.",
    short: "Front/rear low-speed (mechanical) grip split. Below ~0.43 is front-biased and understeers at low speed; above ~0.61 is rear-biased and oversteers. Tracks weight inversely.",
    long: [
      "The front/rear split of mechanical (low-speed) grip — the low-speed balance lever you set with springs and ARBs.",
      "Confirmed to track weight inversely (r = −0.61 with front-weight %), which is why a nose-heavy car reads a low number. Median 0.50 (p10 0.43 / p90 0.61).",
    ],
    bullets: [
      { label: 'Understeers slow', detail: '≤ ~0.43', text: "Front-grip-biased — soften the front ARB or stiffen the rear." },
      { label: 'Neutral',           detail: '~0.50',   text: "Balanced front/rear grip at low speed." },
      { label: 'Oversteers slow',  detail: '≥ ~0.61', text: "Rear-grip-biased — stiffen the front ARB or soften the rear." },
    ],
    relatedStat: "The low-speed partner to Aero balance (the high-speed lever). Inversely tied to Front weight.",
  },
  {
    id: 'aero-balance',
    label: 'Aero balance',
    category: 'sim',
    field: 'simAeroBalance — ratio (0 = no meaningful aero)',
    hook: "The high-speed twin to mech balance — set by the wing, not the springs.",
    short: "Front/rear high-speed downforce split, set by the wing/splitter — the high-speed balance lever. 135 cars read 0; treat 0 as “n/a,” not “balanced.” Higher = more front downforce.",
    long: [
      "The front/rear split of aerodynamic (high-speed) downforce — the high-speed balance lever, distinct from mechanical balance and set by front/rear wing.",
      "Only weakly tied to weight (r = +0.11), so it's genuinely about the wing/splitter setup. 135 cars read 0 — treat 0 as “n/a,” not “balanced.” Median of the non-zero cars ≈ 0.38.",
      "Higher = more front downforce = more front grip at speed, which trims high-speed understeer and can bring on high-speed oversteer.",
    ],
    note: "The direction here is the least battle-tested field — sanity-check against in-game feel before leaning on it.",
  },
]

// Lookup by id — powers both the page anchors and the drawer info-icon tooltip.
const BY_ID = new Map(STAT_GUIDE_ENTRIES.map((e) => [e.id, e]))

/** Fetch a single entry by its stable id; undefined if the id is unknown. */
export function getStatGuideEntry(id: string): StatGuideEntry | undefined {
  return BY_ID.get(id)
}

/** All entries in a section, in authored order — used to render the page sections. */
export function entriesFor(category: StatGuideCategory): StatGuideEntry[] {
  return STAT_GUIDE_ENTRIES.filter((e) => e.category === category)
}

// Bar-stat field key (as used by StatBars / the Car model) → guide entry id.
// Lets the drawer's bar rows resolve their info icon without duplicating the map.
export const BAR_GUIDE_ID: Record<string, string> = {
  statSpeed:        'speed',
  statHandling:     'handling',
  statAcceleration: 'acceleration',
  statLaunch:       'launch',
  statBraking:      'braking',
  statOffroad:      'offroad',
}
