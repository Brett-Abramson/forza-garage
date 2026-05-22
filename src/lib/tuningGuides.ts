// ─────────────────────────────────────────────────────────────────────────────
// Static tuning guidance content keyed by race type + division.
// Based on FH6 community meta as of May 2026.
// Update this file as the meta shifts with patches.
// ─────────────────────────────────────────────────────────────────────────────

export interface TuningGuide {
  raceTypeId: string   // matches RaceType.id in races.ts
  division:   string   // matches Car.division
  philosophy: string   // what this car+race combo fundamentally demands
  spectrum:   string   // honest note about variation within the division
  priorities: string[] // ordered — most impactful first
  watchOut:   string   // the single most common mistake for this combo
}

// ─────────────────────────────────────────────────────────────────────────────
// FH6 META NOTES (May 2026)
// - Chassis first, power last. FH6 punishes power builds that skip grip.
// - Tire width now matters — 1-2 notches up front is often worth the PI.
// - Brakes are actually valuable in FH6. At least one tier above stock.
// - Weight reduction should be maxed before adding power.
// - AWD has an inherent understeer bias — compensate with diff and ARB.
// - Class cap: A class tops at 700 PI, S1 starts at 701.
// ─────────────────────────────────────────────────────────────────────────────

export const TUNING_GUIDES: TuningGuide[] = [

  // ─── ROAD RACING ──────────────────────────────────────────────────────────

  {
    raceTypeId: 'road',
    division:   'Hot Hatch',
    philosophy:
      "Hot hatches punch above their weight on road circuits because of low mass and nimble handling. The goal is maximizing that natural advantage — not chasing power that the chassis can't use cleanly.",
    spectrum:
      "This division ranges from featherweight front-drivers to the heavier all-wheel-drive hot hatches. FWD cars need to manage understeer through fast corners. AWD cars have more traction but need diff tuning to avoid pushing wide. Know which end your car sits on.",
    priorities: [
      "Tire compound and front tire width — biggest single grip gain",
      "Brake upgrade — at least one tier above stock, FH6 rewards late braking",
      "Weight reduction — more impactful than power in this class",
      "Front ARB slightly stiffer for flatter cornering",
      "Final drive ratio — keep gears tight for this layout",
    ],
    watchOut:
      "Adding power before upgrading grip. A hot hatch with 50 extra horsepower and stock tires is slower than one with race tires and stock power.",
  },

  {
    raceTypeId: 'road',
    division:   'Super Hot Hatch',
    philosophy:
      "Higher PI and more power than a standard hot hatch but the philosophy is the same — the chassis is the weapon. At this PI level aero starts to matter and is worth investing in for faster road layouts.",
    spectrum:
      "At the top end of this division you're approaching proper sports car territory in terms of power. Lighter cars in this division tune like hot hatches. Heavier, more powerful ones need brake upgrades earlier and more careful diff tuning.",
    priorities: [
      "Race tires front and rear — non-negotiable at this PI",
      "Aero — front and rear downforce pays off on faster sections",
      "Brake bias slightly forward — most super hot hatches oversteer under braking",
      "Rear ARB softer than front to help rotation",
      "Weight reduction before power adds",
    ],
    watchOut:
      "Overtuning aero for tight sections. Max downforce hurts straight-line speed and isn't needed unless the layout has sustained high-speed corners.",
  },

  {
    raceTypeId: 'road',
    division:   'Modern Sports Cars',
    philosophy:
      "Modern sports cars are the most varied division for road racing. The common thread is that they're built for this discipline — balanced, grippy, and capable of sustained pace. Work with the car's natural balance rather than fighting it.",
    spectrum:
      "This division contains lightweight naturally-aspirated coupes (GR86, BRZ), heavy turbocharged machines (Supra, Z4), and AWD all-rounders (Audi TT RS). A lightweight RWD in this division tunes very differently from a heavy AWD. If your car feels planted and predictable, tune conservatively. If it feels nervous or understeers, start with ARB before anything else.",
    priorities: [
      "Identify your car's weak point first — understeer or oversteer",
      "Race suspension — standard for road racing",
      "Tire compound — race or semi-slick depending on PI budget",
      "Differential tuning — accel 25-40%, decel 15-25% as a starting point for RWD",
      "Aero if PI allows — even small amounts of rear downforce stabilize corner exit",
    ],
    watchOut:
      "Swapping to AWD without checking PI cost. On many cars in this division the AWD conversion eats PI that's better spent on tires and brakes.",
  },

  {
    raceTypeId: 'road',
    division:   'GT Cars',
    philosophy:
      "GT cars are heavier and more powerful than sports cars, which means braking stability and corner entry are where you win or lose. They're not nimble — don't tune them like they are. Manage the weight and the power will follow.",
    spectrum:
      "Most GT cars in FH6 are RWD or AWD grand tourers. RWD GTs need careful rear diff tuning to avoid snapping on corner exit. AWD GTs tend to understeer — soften the front ARB and open up the center diff balance toward rear.",
    priorities: [
      "Brake upgrade — heavier cars need more stopping power",
      "Brake bias — start neutral, move forward if locking rear under braking",
      "Race differential — critical for managing power on exit",
      "Spring rates — slightly stiffer than default to control body roll",
      "Tire width — these cars can use the grip",
    ],
    watchOut:
      "Ignoring brake balance. GT cars that lock up under heavy braking lose more time than almost any other tuning mistake.",
  },

  {
    raceTypeId: 'road',
    division:   'Super GT',
    philosophy:
      "Super GTs at higher PI classes are where aero becomes a real tool rather than a nice-to-have. These cars are fast enough that downforce actually generates grip. Build the chassis, add aero, then fill remaining PI with power.",
    spectrum:
      "Super GTs range from elegant long-distance cruisers to borderline track cars. The heavier end of this division needs aggressive weight reduction to feel responsive. The lighter end can lean into power and aero earlier.",
    priorities: [
      "Weight reduction first — more important than power at this division",
      "Full aero package — front and rear, tune for balance not max numbers",
      "Race differential with rear bias for AWD, careful decel tuning for RWD",
      "Brake upgrade — two tiers above stock minimum",
      "Race suspension with slightly lowered ride height",
    ],
    watchOut:
      "Setting max rear aero without adjusting front. An aero imbalance creates unpredictable handling at high speed — tune front and rear together.",
  },

  {
    raceTypeId: 'road',
    division:   'Modern Supercars',
    philosophy:
      "Modern supercars have the power, grip, and aero to be competitive everywhere on a road circuit — the tune is about balance and stability, not chasing any single metric. These cars can win on feel if you get the basics right.",
    spectrum:
      "Some modern supercars are mid-engine RWD monsters that need careful rear management. Others are front-engine AWD machines that understeer until properly tuned. The in-game handling stat is your best signal for which camp your car sits in before you drive it.",
    priorities: [
      "Aero balance — start 50/50 front/rear and adjust based on behavior",
      "Race differential — most important single tuning category for supercars",
      "Camber — negative camber front and rear improves sustained cornering",
      "Suspension — stiffer than default but not track-car stiff",
      "Tire compound — semi-slick or race depending on build",
    ],
    watchOut:
      "Over-tuning power. At this PI level you almost certainly have enough power. Adding more without grip upgrades makes the car harder to drive and slower in corners.",
  },

  {
    raceTypeId: 'road',
    division:   'Hypercars',
    philosophy:
      "Hypercars are already at the limit of what road racing allows. The tune is almost entirely about stability and control — managing the power, planting the rear, and keeping the car from destroying its own tires. Restraint wins here.",
    spectrum:
      "Hypercars are genuinely different from each other despite sharing a division. Some are AWD all-weather machines. Others are violent mid-engine RWD cars. Know your car before tuning — the wrong approach can make a hypercar nearly undriveable.",
    priorities: [
      "Full aero — these cars need downforce to use their power",
      "Differential — the single most critical setting for hypercar road racing",
      "Tire compound — race tires, no compromise",
      "Ride height — as low as possible without scraping",
      "Damping — rebound tuning to manage weight transfer on fast direction changes",
    ],
    watchOut:
      "Treating a hypercar like a sports car. They need more aggressive aero, stiffer suspension, and more precise differential tuning than anything below them.",
  },

  {
    raceTypeId: 'road',
    division:   'Retro Supercars',
    philosophy:
      "Retro supercars are underpowered by modern standards but often have excellent chassis balance for their era. Tune them to their strengths — light weight, mechanical grip, and sometimes surprisingly good handling.",
    spectrum:
      "Earlier retro supercars have narrow tires and limited aero options — tune conservatively and use softer suspension to maximize mechanical grip. Later ones (late 80s/early 90s) start to have real downforce options and can be tuned more aggressively.",
    priorities: [
      "Tire width — older cars often have room to go wider",
      "Softer suspension than you'd use on a modern car — mechanical grip over aero",
      "Brake balance — older cars often have rear-heavy bias from the factory",
      "Keep power moderate — the chassis has limits",
      "Weight reduction is always worth it on older platforms",
    ],
    watchOut:
      "Fitting modern turbo engines to cars that can't handle the power delivery. High-power swaps on narrow old chassis are fun but rarely fast.",
  },

  {
    raceTypeId: 'road',
    division:   'Classic Sports Cars',
    philosophy:
      "Classic sports cars have limited upgrade options but often have pure, communicative chassis that reward smooth driving. Tune for feel and mechanical grip — you're not going to out-power anything in this class.",
    spectrum:
      "Wide range of eras and origins here. British classics (Lotus, Jaguar) are featherweights that thrive on smooth circuits. American classics have more power but less finesse. Italian classics sit somewhere in between.",
    priorities: [
      "Softest appropriate spring rate — maximize tire contact",
      "Mild negative camber front — these cars understeer without it",
      "Brake bias forward — older rear drum brakes are weak",
      "Don't overpower — stay close to stock engine output",
      "Ride height as low as clearance allows",
    ],
    watchOut:
      "Engine swapping without considering the chassis. A classic sports car with a 500hp V8 is usually just a spinning mess.",
  },

  {
    raceTypeId: 'road',
    division:   'Extreme Track Toys',
    philosophy:
      "Track toys are the most specialized cars for road racing — purpose-built for grip and lap times. They're already tuned from the factory for this. Your job is refinement, not reinvention.",
    spectrum:
      "Some extreme track toys are essentially race cars with number plates. Others are road-legal sports cars with race upgrades. The former need very little tuning. The latter benefit from full chassis treatment.",
    priorities: [
      "Aero — most track toys have adjustable downforce; find the balance point",
      "Tire pressure — critical on slick or semi-slick tires",
      "Differential — these cars reward precise diff tuning more than most",
      "Leave suspension close to default — it was engineered for this",
      "Brake bias — often needs small forward adjustment in FH6",
    ],
    watchOut:
      "Over-tuning a car that's already optimized. Track toys often feel best close to their default tune. Test first, change second.",
  },

  {
    raceTypeId: 'road',
    division:   'Track Toys',
    philosophy:
      "Track toys at this level are serious performance machines that reward commitment in corners. They have the downforce and mechanical grip to carry real speed — tune to take advantage of that.",
    spectrum:
      "Similar to extreme track toys but with more variety in weight and power. Lighter cars here are incredibly rewarding when tuned well. Heavier ones need brake investment to shine.",
    priorities: [
      "Race tires minimum — semi-slick or slick if available",
      "Aero balance — tune front and rear together",
      "Race differential tuning — these cars respond strongly to diff changes",
      "Brake upgrade — worth the PI",
      "Weight reduction over power adds",
    ],
    watchOut:
      "Ignoring tire pressure. On high-grip cars with sticky tires, pressure has more effect than many other settings.",
  },

  {
    raceTypeId: 'road',
    division:   'Modern Super Saloons',
    philosophy:
      "Super saloons have real-world practicality baked into their DNA which means compromised chassis compared to dedicated sports cars. The tune compensates for those compromises — mostly body roll, brake bias, and power delivery.",
    spectrum:
      "AWD super saloons (RS models, M cars with xDrive) tune differently from RWD ones (M3, M4). AWD cars need diff tuning to manage understeer. RWD cars need rear ARB and diff decel to stay planted under power.",
    priorities: [
      "Anti-roll bars — stiffen front to reduce body roll",
      "Brake upgrade and bias — saloons are heavier and brake later than sports cars",
      "Differential — most impactful setting for super saloon road racing",
      "Tire width — these cars have room to go wider front and rear",
      "Spring rate — slightly above default to control the extra weight",
    ],
    watchOut:
      "Expecting sports car behavior. A tuned super saloon is fast but it's not a GR86. Tune it for what it is — stable, powerful, and heavy — rather than trying to make it feel lighter than it is.",
  },

  // ─── STREET RACING ────────────────────────────────────────────────────────

  {
    raceTypeId: 'street',
    division:   'Hot Hatch',
    philosophy:
      "Street racing is where hot hatches genuinely belong. Tight layouts, short straights, quick direction changes — these cars were built for exactly this. The tune should maximize that natural advantage.",
    spectrum:
      "FWD hot hatches need front grip and controlled understeer for street racing. AWD ones need diff tuning to rotate without pushing wide through tight corners. A stock FWD hot hatch on race tires will often beat a poorly tuned AWD one.",
    priorities: [
      "Front tire width — critical for FWD traction out of slow corners",
      "Rear ARB softer than front — helps the car rotate in tight hairpins",
      "Short gearing — you won't hit top speed on most street layouts",
      "Sport or race tires — traction is everything on tight technical layouts",
      "Brake balance slightly forward — quick stops into tight sections",
    ],
    watchOut:
      "Tuning for top speed. Street racing rarely has sections long enough to need it. Tight gearing and grip beats high top speed every time.",
  },

  {
    raceTypeId: 'street',
    division:   'Modern Sports Cars',
    philosophy:
      "Modern sports cars on street layouts need to be nimble and traction-focused. The challenge is getting power down cleanly out of tight exits — every wheelspin costs time on short straights.",
    spectrum:
      "Lightweight RWD sports cars (GR86, BRZ) are naturally suited to street racing and tune up quickly. Heavier turbocharged options need more careful diff tuning to avoid torque steer or wheelspin. AWD options are more forgiving but need understeer management.",
    priorities: [
      "Differential accel — most important setting for clean corner exit",
      "Rear ARB — softer helps rotation in tight sections",
      "Race tires — non-negotiable at street racing speeds",
      "Short final drive ratio",
      "Brake bias slightly forward",
    ],
    watchOut:
      "Wheelspin out of slow corners. On street racing it compounds across an entire lap. If you're spinning on exit, increase diff accel before anything else.",
  },

  {
    raceTypeId: 'street',
    division:   'Modern Muscle',
    philosophy:
      "Muscle cars on street layouts is a challenging combination. The power is there but the weight and chassis aren't optimized for tight technical driving. The tune is mostly damage limitation — manage the power, improve the brakes, reduce the weight.",
    spectrum:
      "American modern muscle ranges from genuinely capable track machines (Z06, GT500) to heavy cruisers that struggle in tight sections. Know which end your car sits on. The capable ones tune up reasonably well. The heavy cruisers are better suited to street racing's straighter sections.",
    priorities: [
      "Weight reduction — most important upgrade for muscle cars on street layouts",
      "Brake upgrade — these cars stop badly from stock",
      "Differential decel — prevents rear stepping out under braking into corners",
      "Short gearing — most muscle cars have long stock gearing suited to highway racing",
      "Softer rear ARB — reduces tendency to oversteer on bumpy street surfaces",
    ],
    watchOut:
      "Adding more power. Modern muscle cars almost always have too much power for street racing already. Weight reduction and chassis work will gain more time than any engine upgrade.",
  },

  {
    raceTypeId: 'street',
    division:   'Retro Hot Hatch',
    philosophy:
      "Retro hot hatches on street layouts have limited power but excellent chassis feel. Tune for mechanical grip and predictability — you'll outbrake heavier cars and find time in the technical sections.",
    spectrum:
      "Classic FWD retro hot hatches (Golf GTI, Peugeot 205, Escort Cosworth) have very different characters. The lightweight FWD ones are naturally nimble. The AWD Escort and Golf R32-era cars have more traction but slightly less agility.",
    priorities: [
      "Tire compound — biggest performance gain on older platforms",
      "Front ARB slightly stiffer for sharper turn-in",
      "Brake balance — older hot hatches often have poor rear brake bias",
      "Keep power modest — the chassis has limits",
      "Short gearing suited to tight layouts",
    ],
    watchOut:
      "Overtuning these cars. A retro hot hatch on race tires with mild upgrades is often more competitive than one with a big engine swap that overwhelms the chassis.",
  },

  // ─── DIRT RACING ──────────────────────────────────────────────────────────

  {
    raceTypeId: 'dirt',
    division:   'Rally Monsters',
    philosophy:
      "Rally monsters were built for exactly this. They have the AWD, suspension travel, and power delivery that dirt racing demands. The tune is about dialing in the balance — these cars want to rotate on loose surfaces, not grip.",
    spectrum:
      "Classic Group B rally monsters (Quattro S1, Peugeot 205 T16) have legendary pedigree for a reason. Modern rally monsters have more power and better electronics. Both tune similarly — softer than you'd think, with diff biased toward rotation.",
    priorities: [
      "Rally suspension — essential, not optional",
      "Softer spring rates than road builds — maintain contact on loose surface",
      "Differential accel bias — helps rotation and exit traction on loose",
      "Ride height slightly raised — ground clearance matters on rough sections",
      "Off-road or rally tires — compound matters more than width here",
    ],
    watchOut:
      "Tuning for grip like it's a road car. Dirt racing rewards controlled slides. A car that fights the slide is slower than one that works with it.",
  },

  {
    raceTypeId: 'dirt',
    division:   'Classic Rally',
    philosophy:
      "Classic rally cars have less power and narrower tires than modern ones but excellent balance for loose surfaces. Tune conservatively — these cars reward smooth driving over aggressive ones.",
    spectrum:
      "Older rally cars (Lancia Stratos, Fulvia, early Escort) are pure and communicative. Tune them to feel good rather than chasing numbers. They'll reward the driver who works with the car.",
    priorities: [
      "Rally suspension — mandatory",
      "Soft spring rates front and rear",
      "Mild differential tuning — these cars rotate naturally",
      "Rally tires — narrower is often fine for older platforms",
      "Don't over-power — the chassis was built for a specific power range",
    ],
    watchOut:
      "Engine swaps that push power far beyond the original spec. A 600hp engine in a Lancia Stratos chassis is a spinning nightmare on dirt.",
  },

  {
    raceTypeId: 'dirt',
    division:   'Retro Rally',
    philosophy:
      "Retro rally cars bridge the gap between classics and modern monsters. They have more technology than classics but less than the modern cars. They tune well and are genuinely competitive on dirt with the right approach.",
    spectrum:
      "The Escort Cosworth, Impreza WRX, and Lancer Evo sit in this era. AWD cars from this period are among the best dirt racers in the game at their PI class. Tune with softer suspension, rally tires, and differential biased toward rear.",
    priorities: [
      "Rally suspension and raised ride height",
      "AWD differential — rear bias helps rotation",
      "Softer spring rates than you'd use on tarmac",
      "Rally tires — compound over width",
      "Moderate power — traction wins over top speed on dirt",
    ],
    watchOut:
      "Using road tires on dirt. Even sport compound tires are significantly worse than rally tires on loose surfaces. Always swap compound first.",
  },

  {
    raceTypeId: 'dirt',
    division:   "Pickups & 4x4's",
    philosophy:
      "Pickups and 4x4s on dirt have natural advantages in traction and ground clearance but their weight is their biggest enemy. Tune to manage the weight — softer suspension to keep tires planted, moderate power delivery.",
    spectrum:
      "Stock pickups are slow but stable. Performance pickups (Raptor, TRD Pro) are actually competitive when tuned. Pure off-road 4x4s are slower on dirt circuits than purpose-built rally cars but more durable over rough sections.",
    priorities: [
      "Off-road or rally suspension — essential",
      "Raised ride height",
      "Weight reduction — more impactful here than anywhere else",
      "Softest spring rates — these vehicles need suspension travel",
      "Differential tuning for traction on exit",
    ],
    watchOut:
      "Expecting rally car performance. Pickups and 4x4s on dirt circuits are slower through corners than purpose-built rally cars. Find time in traction zones, not cornering speed.",
  },

  // ─── CROSS COUNTRY ────────────────────────────────────────────────────────

  {
    raceTypeId: 'crosscountry',
    division:   'Unlimited Offroad',
    philosophy:
      "Unlimited offroad vehicles are built for cross country in the same way rally monsters are built for dirt racing. They have the suspension travel, ground clearance, and AWD to handle whatever the terrain throws at them. Tune for stability and traction over everything else.",
    spectrum:
      "Trophy trucks sit at the fast end — high speed, big jumps, long rough sections. Unlimited buggies are more agile but less stable at high speed. Class 1 buggies split the difference. Know which your vehicle favors.",
    priorities: [
      "Off-road suspension — maximum travel",
      "Highest possible ride height within PI budget",
      "Softest spring rates in the game",
      "Differential tuning for exit traction on rough terrain",
      "Off-road tires — compound matters, width less so",
    ],
    watchOut:
      "Lowering ride height for any reason. Cross country terrain will destroy a low-clearance car. Prioritize clearance over everything including lap time.",
  },

  {
    raceTypeId: 'crosscountry',
    division:   'Sports Utility Heroes',
    philosophy:
      "SUVs for cross country are a compromise — they have some off-road capability but they're not purpose built for it. The tune compensates for their weight and center of gravity with softer suspension and conservative power delivery.",
    spectrum:
      "Performance SUVs (Bentayga, Cayenne Turbo, DBX) can actually be competitive in cross country at A class and below. Stock SUVs are mostly just durable. The performance ones tune up surprisingly well — treat them like heavy AWD saloons with extra ride height.",
    priorities: [
      "Off-road suspension or at minimum rally suspension",
      "Raise ride height significantly",
      "Softer spring rates than you'd use on road",
      "Weight reduction — every kg counts with a heavy chassis",
      "Off-road tires — mandatory",
    ],
    watchOut:
      "Treating an SUV like a road car. Even on cross country sections that look like roads, the terrain is rough enough that road-spec suspension will bottom out and lose traction.",
  },

  {
    raceTypeId: 'crosscountry',
    division:   "Pickups & 4x4's",
    philosophy:
      "Pickups and 4x4s are actually in their element in cross country. Ground clearance, suspension travel, and AWD traction are exactly what the discipline rewards. A well-tuned pickup is genuinely competitive here.",
    spectrum:
      "Stock work trucks are slow but nearly indestructible. Performance trucks (Raptor R, TRD Pro variants) are properly quick in cross country with the right tune. Classic 4x4s have less power but excellent chassis feel.",
    priorities: [
      "Maximum ride height",
      "Off-road suspension with maximum travel",
      "Softest spring rates available",
      "Off-road tires — non-negotiable",
      "Weight reduction where possible without sacrificing durability",
    ],
    watchOut:
      "Not enough ground clearance over crests. Cross country routes have terrain that can beach a vehicle. If in doubt, go higher.",
  },

  // ─── DRIFT ────────────────────────────────────────────────────────────────

  {
    raceTypeId: 'drift',
    division:   'Drift Cars',
    philosophy:
      "These cars were built for one thing. The tune isn't about making them drift — they already do that. It's about making the drift controllable, sustained, and scored well. Angle, speed, and smoothness win points.",
    spectrum:
      "Purpose-built drift cars in FH6 range from classic JDM (S13, S14, AE86) to modern big-power machines (R35, Supra builds). The classics are more forgiving and easier to control. The high-power builds score more when controlled but punish mistakes harder.",
    priorities: [
      "Drift differential — high accel, low decel",
      "Rear tire compound softer than front — helps maintain slide",
      "Soft rear springs — keeps rear planted during sustained slides",
      "Rear ARB softer than front — initiates drift more easily",
      "Brake bias slightly rear — helps initiate with trail braking",
    ],
    watchOut:
      "Too much power without control. A drift that snaps and recovers scores poorly. A sustained controlled slide at moderate angle scores much better than a violent snap at high angle.",
  },

  {
    raceTypeId: 'drift',
    division:   'Modern Sports Cars',
    philosophy:
      "RWD modern sports cars make excellent drift builds because they have good power-to-weight and natural oversteer tendencies. The tune unlocks that tendency in a controlled way.",
    spectrum:
      "The GR86, BRZ, and Z are natural drift platforms. Heavier RWD sports cars (Supra, GT86 variants) need more power to initiate but hold angle better once sliding. Keep stock drivetrain — AWD conversion kills the drift potential.",
    priorities: [
      "Keep RWD — no AWD conversion",
      "Drift or race differential — high accel percentage",
      "Rear ARB softer, front ARB stiffer",
      "Rear spring rate softer than front",
      "Power upgrade before aero — drift doesn't need downforce",
    ],
    watchOut:
      "Installing aero for drift builds. Downforce fights oversteer which is exactly what you're trying to create. Skip the aero and spend that PI on power and suspension.",
  },

  {
    raceTypeId: 'drift',
    division:   'Classic Muscle',
    philosophy:
      "Classic muscle cars are natural drift candidates — RWD, torquey, and often loose from the factory. The tune tames the worst tendencies while preserving the character.",
    spectrum:
      "Big-block classics (Chevelle, Charger, Mustang Mach 1) have massive torque that initiates drifts violently. Small-block classics are more controllable. Tune the big blocks with lower diff accel to smooth out the power delivery.",
    priorities: [
      "Differential accel — lower than you'd think to manage torque",
      "Rear ARB very soft — classic muscle chassis flex is part of the character",
      "Brake bias slightly rear for initiation",
      "Softer rear springs",
      "Keep power in a controllable range — maximum power is rarely fastest for drift",
    ],
    watchOut:
      "Maximum power builds on classic muscle. These cars have heavy chassis and old suspension geometry. Too much power makes them unpredictable rather than fast.",
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helper — returns the tuning guide for a car+race combo if it exists.
// Returns null if no specific guide has been written for this combination yet.
// ─────────────────────────────────────────────────────────────────────────────

export function getTuningGuide(
  raceTypeId: string,
  division: string
): TuningGuide | null {
  return (
    TUNING_GUIDES.find(
      (g) => g.raceTypeId === raceTypeId && g.division === division
    ) ?? null
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns all guides written for a given race type — used on the races detail
// drawer to surface division-specific advice in one place.
// ─────────────────────────────────────────────────────────────────────────────

export function getGuidesByRaceType(raceTypeId: string): TuningGuide[] {
  return TUNING_GUIDES.filter((g) => g.raceTypeId === raceTypeId)
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns all guides written for a given division across all race types.
// Useful for showing tuning notes on the car detail view.
// ─────────────────────────────────────────────────────────────────────────────

export function getGuidesByDivision(division: string): TuningGuide[] {
  return TUNING_GUIDES.filter((g) => g.division === division)
}
