// ─────────────────────────────────────────────────────────────────────────────
// Build & Upgrade Guide content
// Source: Forza Garage Build & Upgrade Guide (Jun 2026)
// Part 1: Race Type build guides | Part 2: PI Class focus
// ─────────────────────────────────────────────────────────────────────────────

export interface UpgradeSection {
  label: string
  items: string[]
}

export interface RaceBuildGuide {
  id: string
  name: string
  icon: string
  upgradePath: UpgradeSection[]
  skip: string[]
  piTargets: string
  tuningPriorities: string[]
}

export interface PIClassGuide {
  id: string
  label: string        // e.g. "D Class"
  range: string        // e.g. "100–399"
  color: string        // Tailwind bg class for the badge
  textColor: string    // Tailwind text class for the badge
  focus: string
  whatWorks: string
  whatDoesnt: string
  tip: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 1 — Race Type build guides
// ─────────────────────────────────────────────────────────────────────────────

export const RACE_BUILD_GUIDES: RaceBuildGuide[] = [
  {
    id: 'road',
    name: 'Road Racing',
    icon: '🏁',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Sport or Race suspension — unlocks full tuning and keeps the car planted on tarmac. Never use Rally or Off-road here.'],
      },
      {
        label: 'Tires',
        items: ['Semi-slick or slick depending on PI budget. Semi-slick is often more PI-efficient at A and S1. Slick compound is standard at S2 and R.'],
      },
      {
        label: 'Brakes',
        items: ['Sport or Race brakes — road racing demands hard, repeated braking that stock brakes can\'t handle.'],
      },
      {
        label: 'Drivetrain',
        items: ['AWD helps lower classes launch cleanly. RWD is often faster at S1+ if you can manage it. Don\'t convert to AWD at the cost of performance budget.'],
      },
      {
        label: 'Aero',
        items: ['Front and rear aero at S1 and above. At high speed, downforce wins corners.'],
      },
      {
        label: 'Weight',
        items: ['Always worth the PI. Street/Sport weight reduction is cost-effective. Full race cage adds stiffness but raises PI fast.'],
      },
      {
        label: 'Differential',
        items: ['Race or Sport diff — road racing cars need to put power down cleanly out of corners.'],
      },
      {
        label: 'Engine',
        items: ['Moderate upgrades. Air filter, exhaust, and ignition are PI-efficient. Turbo/supercharger adds power but eats PI — balance against handling upgrades.'],
      },
    ],
    skip: [
      'AWD conversion on fast RWD/FWD cars unless traction is genuinely a problem',
      'Off-road or Rally suspension',
    ],
    piTargets: 'S1 (700–799) is the most competitive road racing class. S2 is fast but harder to build well. A class (600–699) suits cars that can\'t be pushed to S1 without losing character.',
    tuningPriorities: [
      'Aero balance — 40–45% front bias is a starting point',
      'Brake bias',
      'Tire pressure — target 32–34 PSI warm',
      'Negative camber front — –1.0 to –1.5°',
    ],
  },
  {
    id: 'street',
    name: 'Street Racing',
    icon: '🏙️',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Sport or Race suspension. Street circuits are tight but still tarmac — stiff, controlled handling. Not Rally.'],
      },
      {
        label: 'Tires',
        items: ['Semi-slick is the sweet spot at A and S1. Sport tires often give better PI value at lower classes. Avoid slicks if they push you out of class.'],
      },
      {
        label: 'Brakes',
        items: ['Upgrade brakes — heavy braking into tight corners is standard. Stock brakes aren\'t enough at A class and above.'],
      },
      {
        label: 'Drivetrain',
        items: ['AWD helps at A class for tight corner exits. RWD is faster at S1 with a capable car but harder. FWD struggles due to understeer on exit.'],
      },
      {
        label: 'Transmission',
        items: ['Sport or Race transmission. Short, snappy gear changes and precise ratio tuning win here. Set final drive for short acceleration, not top speed.'],
      },
      {
        label: 'Engine',
        items: ['Prioritise low-end torque and acceleration over top speed. A flywheel upgrade helps throttle response. Don\'t over-build for top speed you won\'t reach.'],
      },
      {
        label: 'Weight',
        items: ['High priority. Less weight means faster exits and better braking.'],
      },
    ],
    skip: [
      'Aero at lower classes — not worth the PI when straights are short',
      'Off-road or Rally suspension',
    ],
    piTargets: 'A class (600–699) and S1 (700–799) are the most competitive street racing classes. B class also works on some routes.',
    tuningPriorities: [
      'Short final drive gearing',
      'Stiff ARBs for corner stability',
      'Brake bias slightly forward — 52–54%',
    ],
  },
  {
    id: 'dirt',
    name: 'Dirt Racing',
    icon: '🌲',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Rally suspension — non-negotiable. Race or Sport suspension is too stiff for loose surfaces and causes the car to bounce and lose traction.'],
      },
      {
        label: 'Tires',
        items: ['Rally tires. Slick or semi-slick compounds have no grip on loose surfaces.'],
      },
      {
        label: 'Drivetrain',
        items: ['AWD is the strongest choice. If your car is RWD, an AWD conversion is one of the most PI-efficient upgrades for this discipline.'],
      },
      {
        label: 'Differential',
        items: ['Race diff on AWD — helps manage power delivery on loose, changing surfaces.'],
      },
      {
        label: 'Anti-roll bars',
        items: ['Softer than a tarmac build. Loose surfaces require the car to roll and shift weight more freely.'],
      },
      {
        label: 'Engine',
        items: ['Moderate. Traction limits you before power does on loose surfaces. Build for mid-range torque over peak horsepower.'],
      },
      {
        label: 'Brakes',
        items: ['Sport or Race — dirt racing has real braking zones.'],
      },
    ],
    skip: [
      'Sport or Race suspension — wrong type entirely',
      'Slick or semi-slick tires',
      'High-downforce aero',
    ],
    piTargets: 'B (500–599) and A (600–699) are the core dirt racing classes. Lower classes are often more competitive — the PI budget goes further on suspension and drivetrain than raw power.',
    tuningPriorities: [
      'Softer springs than a tarmac build',
      'Longer suspension travel',
      'Rally tire pressure — around 25–28 PSI cold',
      'Softer dampers',
    ],
  },
  {
    id: 'crosscountry',
    name: 'Cross Country',
    icon: '🏔️',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Off-road suspension — the only correct choice. Cross country terrain includes jumps, rocks, and rough ground that destroys cars on Sport or Race suspension.'],
      },
      {
        label: 'Tires',
        items: ['Off-road compound. Rally tires are a secondary option if PI is tight. Slick and semi-slick compounds have no place here.'],
      },
      {
        label: 'Drivetrain',
        items: ['AWD is essentially mandatory — cross country includes sections where individual wheel traction becomes critical.'],
      },
      {
        label: 'Anti-roll bars',
        items: ['Softer than any tarmac build. The car needs to articulate over uneven ground. Stiff ARBs cause wheel lift.'],
      },
      {
        label: 'Engine',
        items: ['Unlike road racing, raw power is useful here — straight-line sections can be long and a faster car carries speed through rough terrain.'],
      },
      {
        label: 'Weight',
        items: ['Be careful. Heavier cars can actually be more stable over rough terrain. Don\'t strip weight aggressively.'],
      },
      {
        label: 'Differential',
        items: ['Sport or Race diff — helps traction across rough, variable surfaces.'],
      },
    ],
    skip: [
      'Sport, Race, or Rally suspension',
      'Slick or semi-slick tires',
      'High-downforce aero — adds PI cost with zero benefit',
      'Extreme weight reduction',
    ],
    piTargets: 'B (500–599) and A (600–699). Building to the top of a class is particularly effective — cross country rewards well-built cars over fast ones.',
    tuningPriorities: [
      'Maximum suspension travel',
      'Soft springs and dampers',
      'Low tire pressure — around 24–27 PSI cold',
      'Very soft front and rear ARBs',
    ],
  },
  {
    id: 'drift',
    name: 'Drift Zones',
    icon: '💨',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Sport or Race suspension, tuned soft. Drift requires the car to rotate freely — some body roll is intentional. But you still need responsive steering, so don\'t go too soft.'],
      },
      {
        label: 'Tires',
        items: ['Drift compound rear, semi-slick or slick front — run mismatched compounds intentionally. Stock or sport rear can work at lower classes.'],
      },
      {
        label: 'Drivetrain',
        items: ['RWD. AWD cars can be drifted but initiating and sustaining is significantly harder. A RWD conversion is worth considering for a dedicated drift build.'],
      },
      {
        label: 'Engine',
        items: ['High power — you need to sustain wheelspin through long drift sections. More torque means easier angle maintenance.'],
      },
      {
        label: 'Flywheel',
        items: ['Lightweight flywheel improves throttle response, which is critical for drift angle control.'],
      },
      {
        label: 'Differential',
        items: ['Tune the rear diff toward locked — high acceleration and deceleration lock %. A locked rear diff promotes oversteer and makes slide angle easier to maintain.'],
      },
      {
        label: 'Anti-roll bars',
        items: ['Stiffen the front ARB (more steering response) and soften the rear (easier to slide). This is the opposite of a grip build.'],
      },
    ],
    skip: [
      'AWD conversion',
      'Rally or Off-road suspension',
      'Rally or Off-road tires',
    ],
    piTargets: 'A (600–699) and S1 (700–799). Drift zones exist at all PI levels but these are the most competitive classes.',
    tuningPriorities: [
      'Rear diff lock high',
      'Stiff front ARB, soft rear ARB',
      'Slightly negative front camber',
      'Rear camber near zero or slightly positive — improves slide surface contact',
    ],
  },
  {
    id: 'touge',
    name: 'Touge Racing',
    icon: '⛰️',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Sport or Race suspension. Mountain pass roads are tarmac — stiff, controlled handling. Every corner must be precise.'],
      },
      {
        label: 'Tires',
        items: ['Semi-slick or slick depending on PI class cap. Max grip within the class limit is the priority.'],
      },
      {
        label: 'Brakes',
        items: ['Full Race brakes. Touge braking is very late and very hard — stock brakes cannot cope.'],
      },
      {
        label: 'Transmission',
        items: ['Race transmission with tuned ratios. Match gears to the corners, not top speed.'],
      },
      {
        label: 'Drivetrain',
        items: ['RWD cars have a natural advantage — the oversteer character suits mountain pass racing and class caps keep power manageable. AWD helps if traction is an issue.'],
      },
      {
        label: 'Weight',
        items: ['Strip it aggressively. Less weight means faster direction changes in tight hairpins.'],
      },
      {
        label: 'Differential',
        items: ['Sport or Race diff — puts power down cleanly out of hairpins.'],
      },
    ],
    skip: [
      'Off-road or Rally suspension',
      'Drift tires',
      'High-power builds that push you over the class cap',
    ],
    piTargets: 'Route-dependent. Each Touge route has its own class restriction from B class up to A class. Check the specific route before building.',
    tuningPriorities: [
      'Brake bias forward — 53–56%',
      'Short gear ratios for the hairpins',
      'Stiff springs',
      'Negative camber — –1.5° to –2.0° front to maximise corner grip',
    ],
  },
  {
    id: 'drag',
    name: 'Drag Racing',
    icon: '🚦',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Sport suspension minimum — Race suspension unlocks launch tuning options. Lower the car to reduce weight transfer on launch.'],
      },
      {
        label: 'Tires',
        items: ['Drag compound if available. Otherwise the widest, stickiest compound possible on the rear. Traction is everything.'],
      },
      {
        label: 'Drivetrain',
        items: ['AWD for most builds — puts power to all four wheels and eliminates wheelspin on launch. Some dedicated drag cars work best RWD with a tuned diff.'],
      },
      {
        label: 'Transmission',
        items: ['Race transmission — gear tuning is critical. Each gear should be timed to hit the power band perfectly. A properly tuned race gearbox is worth multiple tenths on its own.'],
      },
      {
        label: 'Engine',
        items: ['Max it out within your class limit. Drag racing rewards power more directly than any other discipline. Turbo, supercharger, engine swaps, displacement — all valuable.'],
      },
      {
        label: 'Weight',
        items: ['Strip it hard. Every pound costs time in a straight line.'],
      },
      {
        label: 'Differential',
        items: ['Near fully locked on acceleration — you want maximum power transfer to the wheels.'],
      },
    ],
    skip: [
      'Front aero',
      'Anti-roll bar upgrades — irrelevant',
      'Handling-focused suspension tuning',
    ],
    piTargets: 'Any class — drag racing exists at all PI levels. S2 and R class produce the fastest times. B and A class events are also common.',
    tuningPriorities: [
      'Gear tuning — final drive and individual ratios',
      'Launch RPM',
      'Tire pressure — lower rear pressure for more contact patch, 26–28 PSI cold',
      'Ride height — low front and rear',
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Part 2 — PI Class build focus
// ─────────────────────────────────────────────────────────────────────────────

export const PI_CLASS_GUIDES: PIClassGuide[] = [
  {
    id: 'D',
    label: 'D Class',
    range: '100–399',
    color: 'bg-blue-600',
    textColor: 'text-white',
    focus: 'Don\'t upgrade the engine. In D class, handling and tires are a better use of PI than raw power. Sport suspension, sport tires, and weight reduction get you more lap time than a power upgrade.',
    whatWorks: 'Lightweight sports cars and hot hatches that are already close to D class naturally. Cars with good stock handling stats.',
    whatDoesnt: 'Muscle cars and heavy GT cars. They can reach D class PI but the weight and chassis fight against you.',
    tip: 'D class is often ignored in multiplayer, but specific races and Touge routes use it. Stock or near-stock builds often compete well here — the field is less tuned.',
  },
  {
    id: 'C',
    label: 'C Class',
    range: '400–499',
    color: 'bg-yellow-500',
    textColor: 'text-black',
    focus: 'Balance is everything. Sport suspension plus sport or semi-slick tires plus moderate weight reduction is the template. Don\'t chase top speed — grip wins C class races.',
    whatWorks: 'Hot hatches (Golf GTI, Civic Type R era), compact sports cars, lightweight rally cars. Cars that naturally sit in C class without heavy upgrades tend to be the best.',
    whatDoesnt: 'Forced upgrades from heavier cars. If you\'re spending significant PI on engine just to reach C class, the chassis probably isn\'t suitable.',
    tip: 'AWD can be a significant advantage at C class for dirt and cross country. On tarmac, a good RWD car with semi-slick tires often beats AWD for pure handling.',
  },
  {
    id: 'B',
    label: 'B Class',
    range: '500–599',
    color: 'bg-orange-500',
    textColor: 'text-white',
    focus: 'This is where drivetrain upgrades start paying off significantly. An AWD conversion on a capable car can transform its competitiveness across multiple disciplines. Semi-slick tires become standard for tarmac.',
    whatWorks: 'Rally cars in their natural habitat (Subaru WRX, Mitsubishi Evo, Ford Focus RS era), compact sports cars, muscle cars that haven\'t grown into their weight yet.',
    whatDoesnt: 'Supercars pushed down to B class — they tend to lose too much character in the process.',
    tip: 'The difference between a B class car at 580 PI and one at 599 PI can be significant. Build to the top of the class for the most competitive version.',
  },
  {
    id: 'A',
    label: 'A Class',
    range: '600–699',
    color: 'bg-red-600',
    textColor: 'text-white',
    focus: 'Everything matters here. Full sport or race suspension, semi-slick tires minimum, upgraded brakes, proper diff tuning. AWD conversions are common and competitive. This is where tuning knowledge separates good builds from great ones.',
    whatWorks: 'Sports cars and GT cars in their natural range, muscle cars with good torque management, hot hatches pushed up, capable rally builds.',
    whatDoesnt: 'Overly heavy luxury cars. Builds that are fast in a straight line but can\'t corner at A class speeds.',
    tip: 'A class is where the meta is most active. Community tune databases are especially valuable here — a well-tuned A class car from a current meta source will outperform a self-tuned car that hasn\'t been touched since launch.',
  },
  {
    id: 'S1',
    label: 'S1 Class',
    range: '700–799',
    color: 'bg-purple-600',
    textColor: 'text-white',
    focus: 'Aero becomes important at S1 — the speeds justify it. Race suspension is standard. Slick or semi-slick tires. Detailed tuning of camber, caster, and differential becomes more meaningful at S1 speeds.',
    whatWorks: 'Sports cars and supercars in their natural range (911, NSX, Supra, McLaren 570S etc.), properly built muscle cars with traction sorted, purpose-built rally and off-road cars for off-tarmac disciplines.',
    whatDoesnt: 'Builds without aero at the top of S1. Cars forced up from A class without addressing handling at the higher speeds.',
    tip: 'Tire pressure matters more at S1 than lower classes. Target 32–34 PSI warm. Check telemetry after a few warm-up laps if you have access.',
  },
  {
    id: 'S2',
    label: 'S2 Class',
    range: '800–899',
    color: 'bg-pink-600',
    textColor: 'text-white',
    focus: 'Maximum aero for stability. Full race suspension with careful tuning. Traction management is critical — even AWD cars can struggle to put down S2 power. Race diff, race tires, and careful brake and spring tuning are non-negotiable.',
    whatWorks: 'High-end supercars (Lamborghini, Ferrari, McLaren upper range, Mercedes-AMG ONE), purpose-built track cars.',
    whatDoesnt: 'Cars forced into S2 through heavy engine upgrades without chassis work to match.',
    tip: 'S2 multiplayer can be chaotic due to speed differences between builds. If you\'re competitive at the bottom of S2 (800–830), you\'ll often face cars at 898 PI. Build to your class ceiling where possible.',
  },
  {
    id: 'R',
    label: 'R Class',
    range: '900–998',
    color: 'bg-amber-500',
    textColor: 'text-black',
    focus: 'Fine-tuning is everything. At R class you\'re probably not making upgrade decisions — you\'re tuning. Aero balance, gear ratios, spring rates, diff settings, and tire pressure all matter more than the specific parts.',
    whatWorks: 'Purpose-built race cars (Formula Drift cars, Forza Edition cars, track-built supercars). Cars that were designed to be here.',
    whatDoesnt: 'Road cars forced into R class — they typically can\'t match the stability and lap times of purpose-built R class machinery.',
    tip: 'R class tunes from the community are worth using as a baseline. At this level, the differences between a good tune and a great one are measured in tenths — and community tuners with thousands of laps have an edge.',
  },
]
