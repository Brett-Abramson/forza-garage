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
        items: ['Race suspension — required to unlock full tuning in FH6 (camber, spring rates, damping, ride height). Never use Rally or Off-road here.'],
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
        items: ['Race diff. RWD: start at 40–60% acceleration lock, 20–40% deceleration lock — adjust in 2–3% increments. AWD: 70–80% rear centre bias. A good diff is more PI-efficient than more power.'],
      },
      {
        label: 'Engine',
        items: ['Moderate upgrades. Air filter, exhaust, and ignition are PI-efficient. Turbo/supercharger adds power but eats PI — balance against handling upgrades. Build chassis first, add power last.'],
      },
    ],
    skip: [
      'AWD conversion on fast RWD/FWD cars unless traction is genuinely a problem',
      'Off-road or Rally suspension',
      'High-power builds that skip chassis work',
    ],
    piTargets: 'S1 (700–799) is the most competitive road racing class. S2 is fast but harder to build well. A class (600–699) suits cars that can\'t be pushed to S1 without losing character.',
    tuningPriorities: [
      'Aero balance — 40–45% front bias',
      'Brake bias — 52–55% front',
      'Tire pressure — 30–33 PSI cold (slick/semi-slick)',
      'Camber front –1.5° to –2.0°, rear –1.0° to –1.5°',
      'Damping: rebound 8–11, bump at 50–75% of rebound value',
    ],
  },
  {
    id: 'street',
    name: 'Street Racing',
    icon: '🏙️',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Race suspension — required for full tuning access. Street circuits are tight but still tarmac. Not Rally.'],
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
      {
        label: 'Differential',
        items: ['RWD: 40–60% acceleration, 20–40% deceleration. Street circuits are tight — err toward the lower end of acceleration lock to avoid push on corner exit. AWD: 70–80% rear centre bias.'],
      },
    ],
    skip: [
      'Aero at lower classes — not worth the PI when straights are short',
      'Off-road or Rally suspension',
    ],
    piTargets: 'A class (600–699) and S1 (700–799) are the most competitive street racing classes. B class also works on some routes.',
    tuningPriorities: [
      'Short final drive gearing — acceleration out of corners beats top speed',
      'Stiff ARBs front and rear for corner stability',
      'Brake bias 52–54% front',
      'Tire pressure — 30–33 PSI cold (semi-slick/slick)',
    ],
  },
  {
    id: 'dirt',
    name: 'Dirt Racing',
    icon: '🌲',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Rally suspension — non-negotiable. Race suspension is too stiff for loose surfaces and causes the car to bounce and lose traction.'],
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
        label: 'Anti-roll bars',
        items: ['Both front and rear ARBs near minimum. On loose surfaces, left and right wheels need to work independently to follow uneven terrain. Stiff ARBs tie the wheels together and cause the car to skip across bumps. Tune balance through the differential and damping instead.'],
      },
      {
        label: 'Differential',
        items: ['Race diff. AWD centre bias: 70–80% rear. Loose surface diffs: 30–50% acceleration, 20–30% deceleration — less aggressive than tarmac.'],
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
      'Race or Sport suspension — wrong type entirely for dirt',
      'Slick or semi-slick tires',
      'High-downforce aero',
    ],
    piTargets: 'B (500–599) and A (600–699) are the core dirt racing classes. Lower classes are often more competitive — the PI budget goes further on suspension and drivetrain than raw power.',
    tuningPriorities: [
      'ARBs near minimum both ends — wheels need to work independently on loose surfaces',
      'Softer springs than a tarmac build',
      'Rally tire pressure — 26–28 PSI cold',
      'Damping softer overall — leave near the soft factory setting',
    ],
  },
  {
    id: 'crosscountry',
    name: 'Cross Country',
    icon: '🏔️',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Off-road suspension — the only correct choice. Cross country terrain includes jumps, rocks, and rough ground that destroys handling on Race suspension.'],
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
        items: ['Both ARBs near minimum — same reasoning as dirt racing. The car needs to articulate over uneven ground. Stiff ARBs cause wheel lift on rough terrain. Tune balance through the diff and damping instead.'],
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
        items: ['Race diff. AWD centre bias 70–80% rear. On rough terrain, too much diff lock can cause handling issues when one wheel is unloaded — 50–70% acceleration, 20–35% deceleration.'],
      },
    ],
    skip: [
      'Race, Sport, or Rally suspension',
      'Slick or semi-slick tires',
      'High-downforce aero — adds PI cost with zero benefit',
      'Extreme weight reduction',
    ],
    piTargets: 'B (500–599) and A (600–699). Building to the top of a class is particularly effective — cross country rewards well-built cars over fast ones.',
    tuningPriorities: [
      'ARBs near minimum both ends — articulation over terrain is critical',
      'Maximum suspension travel, soft springs and dampers',
      'Tire pressure — 24–26 PSI cold for maximum contact and compliance',
      'Slight rake (front ride height lower than rear) — helps stability over crests',
    ],
  },
  {
    id: 'drift',
    name: 'Drift Zones',
    icon: '💨',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Race suspension, tuned soft overall. Required to access alignment settings critical for drift. Some body roll is intentional — the car needs to rotate. Don\'t go so soft that steering response disappears.'],
      },
      {
        label: 'Tires',
        items: ['Drift compound rear at near-minimum pressure (lower pressure makes traction break more predictably), semi-slick or slick front at standard pressure (30–33 PSI cold). This mismatched compound is intentional.'],
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
        items: ['Near 100% locked on both acceleration and deceleration. This is the single biggest factor in a consistent, predictable slide — both wheels spinning together maintains angle without snapping.'],
      },
      {
        label: 'Anti-roll bars',
        items: ['Stiffen the front ARB (maintains steering response through the slide) and soften the rear (allows the back to step out and stay out). Opposite of a grip build.'],
      },
      {
        label: 'Alignment',
        items: ['Front camber –4° to –5° — keeps the front biting at big steering angles. Rear camber –0.5° to –1.0° — usable rear contact patch during the slide. Front toe slightly out (0.1–0.2°) for sharper turn-in. Caster near maximum.'],
      },
      {
        label: 'Brakes',
        items: ['Brake balance forward (55–58%) — lets you brake mid-drift without snapping the rear loose.'],
      },
    ],
    skip: [
      'AWD or FWD drivetrain',
      'Rally or Off-road suspension',
      'Rally or Off-road tires',
    ],
    piTargets: 'A (600–699) and S1 (700–799). Drift zones exist at all PI levels but these are the most competitive classes.',
    tuningPriorities: [
      'Diff: near 100% locked acceleration and deceleration',
      'Stiff front ARB, soft rear ARB',
      'Front camber –4° to –5°, rear camber –0.5° to –1.0°',
      'Front toe slightly out (0.1–0.2°), caster near maximum',
      'Brake bias 55–58% forward',
      'Scoring: angle + speed + proximity to scoring line — sustained angle beats raw speed',
    ],
  },
  {
    id: 'touge',
    name: 'Touge Racing',
    icon: '⛰️',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Race suspension — required for full tuning access. Mountain pass roads are tarmac and precision is everything. Tune front slightly softer than rear to help rotation into hairpins.'],
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
        items: ['Neutral to mild — not locked like a drift build, not fully open. Start at 30–40% acceleration, 20–30% deceleration. Touge rewards rotation into hairpins, not planted exits.'],
      },
    ],
    skip: [
      'Off-road or Rally suspension',
      'Drift tires',
      'Builds that overshoot the class cap',
    ],
    piTargets: 'Route-dependent — one specific PI cap per route, B class up to A class. Check the route before building.',
    tuningPriorities: [
      'Brake bias 53–56% front — late, hard braking is essential',
      'Short gear ratios for the hairpin speed range',
      'Front springs slightly softer than rear — helps rotation into hairpins',
      'Negative camber –1.5° to –2.0° front to maximise corner grip',
      'Tire pressure — 30–33 PSI cold',
    ],
  },
  {
    id: 'drag',
    name: 'Drag Racing',
    icon: '🚦',
    upgradePath: [
      {
        label: 'Suspension',
        items: ['Race suspension — required to unlock ride height adjustment. Lower the car to reduce weight transfer on launch and improve traction.'],
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
        items: ['Rear diff near 100% acceleration lock. AWD centre bias 70–80% rear. Maximum power transfer to the wheels on launch.'],
      },
      {
        label: 'Launch control',
        items: ['Enable it if available. Drag racing on a controller benefits enormously from launch control on first gear — it manages wheel spin and launch RPM automatically.'],
      },
    ],
    skip: [
      'Front aero',
      'Anti-roll bar upgrades — irrelevant for a straight line',
      'Handling-focused suspension tuning',
    ],
    piTargets: 'Any class — drag racing exists at all PI levels. S2 and R class produce the fastest times. B and A class events are also common.',
    tuningPriorities: [
      'Gear tuning — individual ratios + final drive timed to the power band',
      'Launch RPM',
      'Rear tire pressure — 26–28 PSI cold for maximum contact patch',
      'Ride height — low front and rear to reduce weight transfer',
      'Diff: near 100% acceleration lock',
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
    focus: 'Don\'t upgrade the engine. In D class, handling and tires are a better use of PI than raw power. Sport tires get you more lap time than a power upgrade. Race suspension may cost too much PI to justify — accept the limited tuning access and work within it. Skip the diff at D class; the PI is better spent on tires and brakes.',
    whatWorks: 'Lightweight sports cars and hot hatches that are already close to D class naturally. Cars with good stock handling stats.',
    whatDoesnt: 'Muscle cars and heavy GT cars. They can reach D class PI but the weight and chassis fight against you at every corner.',
    tip: 'D class is less meta-optimised in multiplayer. Stock or near-stock builds often compete well here — the field is less tuned, and a stock car with sport tires can be very competitive.',
  },
  {
    id: 'C',
    label: 'C Class',
    range: '400–499',
    color: 'bg-yellow-500',
    textColor: 'text-black',
    focus: 'Balance is everything. Race suspension (unlocks full tuning) plus sport or semi-slick tires plus moderate weight reduction is the template. Don\'t chase top speed — grip wins C class. A Sport diff is achievable at C class and makes a real difference on corner exits — worth the PI over skipping it.',
    whatWorks: 'Hot hatches (Golf GTI, Civic Type R era), compact sports cars, lightweight rally cars. Cars that naturally sit in C class without heavy upgrades.',
    whatDoesnt: 'Forced upgrades from heavier cars. If you\'re spending significant PI on engine just to reach C class, the chassis probably isn\'t suitable for the discipline.',
    tip: 'AWD can be a significant advantage at C class for dirt and cross country. On tarmac, a good RWD car with semi-slick tires often beats AWD for pure handling — save the PI for chassis work instead.',
  },
  {
    id: 'B',
    label: 'B Class',
    range: '500–599',
    color: 'bg-orange-500',
    textColor: 'text-white',
    focus: 'This is where drivetrain upgrades start paying off significantly. An AWD conversion on a capable car can be transformative across multiple disciplines. Semi-slick tires become standard for tarmac. A Race diff is now achievable and worth fitting — AWD centre bias 70–80% rear on loose surfaces.',
    whatWorks: 'Rally cars in their natural habitat (WRX, Evo, Focus RS era), compact sports cars, muscle cars that haven\'t grown into their weight yet.',
    whatDoesnt: 'Supercars pushed down to B class — they tend to lose too much character in the process.',
    tip: 'Build to the ceiling of the class. A car at 598–599 PI is materially more competitive than one at 575. The extra PI room should go into suspension and diff, not engine.',
  },
  {
    id: 'A',
    label: 'A Class',
    range: '600–699',
    color: 'bg-red-600',
    textColor: 'text-white',
    focus: 'Everything matters here. Race suspension (non-negotiable for proper tuning — Sport suspension won\'t unlock camber or spring sliders in FH6), semi-slick tires minimum, upgraded brakes, Race diff. FH6 punishes over-powered A class builds that can\'t corner — chassis before engine. Diff: RWD 40–60% accel, 20–40% decel. AWD: 70–80% rear centre bias.',
    whatWorks: 'Sports cars and GT cars in their natural range, muscle cars with good torque management, hot hatches pushed up, capable rally builds for off-tarmac.',
    whatDoesnt: 'Overly heavy cars. Builds that are fast in a straight line but can\'t handle A class cornering speeds. Over-powered builds without matching chassis work.',
    tip: 'A class is where the meta shifts most with patches. Community tune databases are especially valuable here — a current meta tune will outperform a self-tuned car that hasn\'t been updated since launch.',
  },
  {
    id: 'S1',
    label: 'S1 Class',
    range: '700–799',
    color: 'bg-purple-600',
    textColor: 'text-white',
    focus: 'Aero is now justified — the speeds make downforce measurable. Race suspension standard. Slick or semi-slick. The FH6 balanced suspension philosophy matters especially here — the soft-front/stiff-rear meta from FH4 and FH5 creates inconsistent turn-in under trail-braking at S1 speeds. Balanced spring rates produce more consistent laps. Fine-tune diff in 2–3% increments — small changes have bigger effects at these speeds.',
    whatWorks: 'Sports cars and supercars in their natural range (911, NSX, Supra, McLaren 570S), properly built muscle cars with traction sorted, purpose-built rally and off-road for off-tarmac.',
    whatDoesnt: 'Builds without aero at the top of S1. Cars forced up from A class without addressing high-speed handling. Builds using old FH5-era stiff-front/soft-rear spring tuning.',
    tip: 'Tire pressure matters more at S1 than lower classes. 30–33 PSI cold for slick/semi-slick. Use telemetry to verify after warm-up laps if you have access — pressures rise significantly from cold.',
  },
  {
    id: 'S2',
    label: 'S2 Class',
    range: '800–899',
    color: 'bg-pink-600',
    textColor: 'text-white',
    focus: 'Maximum aero for stability. Full Race suspension with careful tuning. Traction management is critical — even AWD cars can struggle to put down S2 power. Race diff essential. AWD centre bias 80%+ rear at S2 — these cars have the power to overwhelm all four wheels. Chassis stability over more engine. Adding power at S2 rarely helps if the car can\'t use it.',
    whatWorks: 'High-end supercars (Lamborghini, Ferrari, McLaren upper range, Mercedes-AMG ONE), purpose-built track cars.',
    whatDoesnt: 'Cars forced into S2 through heavy engine upgrades without matching chassis work.',
    tip: 'S2 multiplayer can be chaotic. Build to your class ceiling — a 898 PI car is always faster than a mid-800s build on the same platform. Every PI point matters more at this level.',
  },
  {
    id: 'R',
    label: 'R Class',
    range: '900–998',
    color: 'bg-amber-500',
    textColor: 'text-black',
    focus: 'Fine-tuning is everything. At R class you\'re not making upgrade decisions — you\'re tuning. Aero balance, gear ratios, spring rates, diff percentages, and tire pressure all matter more than parts selection. This is a tuner\'s class — community baselines are invaluable as a starting point.',
    whatWorks: 'Purpose-built race cars, Forza Edition cars, Formula Drift cars, track-configured supercars. Cars that were designed to be here.',
    whatDoesnt: 'Road cars forced into R class — they can\'t match the stability or lap times of purpose-built R class machinery.',
    tip: 'R class community tunes from experienced tuners are worth using as a starting point. The difference between a good tune and a great one is measured in tenths — community tuners with thousands of testing laps have a genuine edge here.',
  },
]
