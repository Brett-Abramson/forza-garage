// ─────────────────────────────────────────────────────────────────────────────
// Static tuning guidance content keyed by race type + division.
// Based on FH6 community meta as of May 2026.
// Sources: fh6guide.com, gamingpromax.com, games.gg, keengamer.com, ggwtb.com
// Update this file as the meta shifts with patches.
// ─────────────────────────────────────────────────────────────────────────────

export interface TuningGuide {
  raceTypeId:  string    // matches RaceType.id in races.ts
  division:    string    // matches Car.division
  philosophy:  string    // what this car+race combo fundamentally demands
  spectrum:    string    // honest note about variation within the division
  priorities:  string[]  // ordered — most impactful first
  watchOut:    string    // the single most common mistake for this combo
  parameters?: TuningParameters  // reference starting values where known
}

export interface TuningParameters {
  tirePressurePSI?:    string   // e.g. "32–34 PSI warm"
  camberFront?:        string   // e.g. "-1.5°"
  camberRear?:         string   // e.g. "-1.0°"
  caster?:             string
  antiRollBars?:       string   // descriptive e.g. "Stiff front, medium rear"
  springs?:            string   // descriptive e.g. "Medium-stiff"
  rideHeight?:         string
  diffAccel?:          string   // percentage e.g. "60%"
  diffDecel?:          string
  brakeBalance?:       string   // e.g. "52% front"
  aero?:               string
  damping?:            string
  note?:               string   // caveat on the numbers
}

// ─────────────────────────────────────────────────────────────────────────────
// FH6 META NOTES (May 2026)
// - Chassis first, power last. FH6 punishes power builds that skip grip.
// - Tire width now matters — 1-2 notches up front is often worth the PI.
// - Brakes are genuinely valuable in FH6. At least one tier above stock.
// - Tire pressure telemetry matters — 2 PSI change transforms handling.
// - Weight reduction should be maxed before adding power.
// - AWD has an inherent understeer bias — compensate with diff and ARB.
// - Bump < Rebound rule: on mountain/uneven roads set bump at 60-70% of rebound.
// - FH6 Japan rains frequently — AWD has an advantage over FH5 Mexico meta.
// - Class cap: A class tops at 700 PI, S1 starts at 701.
// ─────────────────────────────────────────────────────────────────────────────

export const TUNING_GUIDES: TuningGuide[] = [

  // ─── ROAD RACING ──────────────────────────────────────────────────────────

  {
    raceTypeId: 'road',
    division:   'Hot Hatch',
    philosophy:
      "Hot hatches punch above their weight on road circuits because of low mass and nimble handling. The goal is maximizing that natural advantage — not chasing power that the chassis can't use cleanly. Most road pace comes from confidence under braking and clean corner exits, not top speed.",
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
    parameters: {
      tirePressurePSI: "32–34 PSI warm",
      camberFront:     "-1.5°",
      camberRear:      "-1.0°",
      caster:          "5.5°–6.0°",
      antiRollBars:    "Stiff front, medium rear",
      diffAccel:       "60%",
      diffDecel:       "30%",
      brakeBalance:    "52% front",
      note:            "Starting values — adjust based on your specific car's behavior.",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Super Hot Hatch',
    philosophy:
      "Higher PI and more power than a standard hot hatch but the philosophy is the same — the chassis is the weapon. At this PI level aero starts to matter and is worth investing in for faster road layouts. Fix braking confidence before chasing any other metric.",
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
    parameters: {
      tirePressurePSI: "32–34 PSI warm",
      camberFront:     "-1.5°",
      camberRear:      "-1.0°",
      antiRollBars:    "Stiff front, medium rear",
      diffAccel:       "60%",
      diffDecel:       "30%",
      brakeBalance:    "52% front",
      note:            "Starting values only.",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Modern Sports Cars',
    philosophy:
      "Modern sports cars are the most varied division for road racing. The common thread is that they're built for this discipline — balanced, grippy, and capable of sustained pace. Work with the car's natural balance rather than fighting it. Most players lose more time to hesitation and braking mistakes than to raw speed.",
    spectrum:
      "This division contains lightweight naturally-aspirated coupes (GR86, BRZ), heavy turbocharged machines (Supra, Z4), and AWD all-rounders (Audi TT RS). A lightweight RWD in this division tunes very differently from a heavy AWD. If your car feels planted and predictable, tune conservatively. If it feels nervous or understeers, start with ARB before anything else.",
    priorities: [
      "Identify your car's weak point first — understeer or oversteer",
      "Race suspension — standard for road racing",
      "Tire compound — race or semi-slick depending on PI budget",
      "Differential tuning — accel 60%, decel 30% as a starting point for RWD",
      "Aero if PI allows — even small amounts of rear downforce stabilize corner exit",
    ],
    watchOut:
      "Swapping to AWD without checking PI cost. On many cars in this division the AWD conversion eats PI that's better spent on tires and brakes. RWD is faster on dry tarmac in skilled hands — lighter weight and better rotation equals faster lap times.",
    parameters: {
      tirePressurePSI: "32–34 PSI warm (RWD: 32.0F / 30.0R for more rear contact)",
      camberFront:     "-1.5° to -3.0° (more for RWD)",
      camberRear:      "-1.0° to -1.5°",
      caster:          "5.5°–6.0°",
      antiRollBars:    "RWD: stiffer rear. AWD: stiffer front",
      diffAccel:       "RWD: 85% / AWD: 75%",
      diffDecel:       "RWD: 15% / AWD: 20%",
      brakeBalance:    "RWD: 55% front / AWD: 52% front",
      note:            "RWD and AWD tune meaningfully differently in this division.",
    },
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
    parameters: {
      tirePressurePSI: "32–34 PSI warm",
      antiRollBars:    "Stiff front, medium rear",
      diffAccel:       "60%",
      diffDecel:       "30%",
      brakeBalance:    "52% front",
      note:            "Starting values — heavier GTs may need stiffer springs.",
    },
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
      "Modern supercars have the power, grip, and aero to be competitive everywhere on a road circuit — the tune is about balance and stability, not chasing any single metric. These cars can win on feel if you get the basics right. Over-tuning power is the most common mistake.",
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
    parameters: {
      tirePressurePSI: "32–34 PSI warm",
      camberFront:     "-1.5°",
      camberRear:      "-1.0°",
      caster:          "5.5°–6.0°",
      antiRollBars:    "Stiff front, medium rear",
      diffAccel:       "60%",
      diffDecel:       "30%",
      brakeBalance:    "52% front",
      aero:            "Balanced front and rear — avoid max rear without matching front",
      note:            "Starting values — adjust aero balance first for this class.",
    },
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
      "Tire pressure — critical on slick or semi-slick tires, telemetry is your friend",
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
      "Ignoring tire pressure. On high-grip cars with sticky tires, pressure has more effect than many other settings. Use telemetry and target 32–34 PSI warm.",
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
      "Street racing is where hot hatches genuinely belong. Tight layouts, short straights, quick direction changes — these cars were built for exactly this. The tune should maximize that natural advantage. A stable beginner tune wins more than an aggressive nervous one.",
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
    parameters: {
      tirePressurePSI: "26–28 PSI",
      camberFront:     "-1.0°",
      camberRear:      "-0.5°",
      antiRollBars:    "Soft front and rear",
      diffAccel:       "50%",
      diffDecel:       "20%",
      rideHeight:      "Raised — near maximum",
      note:            "Loose surfaces need flat contact patches, not aggressive camber.",
    },
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
    parameters: {
      tirePressurePSI: "26–28 PSI",
      camberFront:     "-1.0°",
      camberRear:      "-0.5°",
      antiRollBars:    "Soft front and rear — lets wheels move independently over bumps",
      springs:         "Soft — absorbs jumps without bouncing offline",
      rideHeight:      "Maximum or near-maximum",
      diffAccel:       "50%",
      diffDecel:       "20%",
      damping:         "Soft rebound, medium bump — fast rebound keeps tires on ground",
      note:            "Landing recovery is a major pace factor — don't sacrifice it for any other setting.",
    },
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
      "These cars were built for one thing. The tune isn't about making them drift — they already do that. It's about making the drift controllable, sustained, and scored well. Angle, speed, and smoothness win points. Beginners should not chase huge angle or maximum power first — predictability scores more than drama.",
    spectrum:
      "Purpose-built drift cars in FH6 range from classic JDM (S13, S14, AE86) to modern big-power machines (R35, Supra builds). The classics are more forgiving and easier to control. The high-power builds score more when controlled but punish mistakes harder. Longer wheelbase means smoother drifts. Shorter wheelbase means faster transitions.",
    priorities: [
      "Differential — 95% accel, 0% decel (locked on power, open on lift-off for transitions)",
      "Rear tire compound softer than front — helps maintain slide",
      "Soft rear springs — weight transfer to rear helps maintain drift angle",
      "Rear ARB softer than front — front grips, rear slides",
      "Disable TCS and STM — driver aids kill drift angle instantly",
    ],
    watchOut:
      "Too much power without control. A drift that snaps and recovers scores poorly. A sustained controlled slide at moderate angle scores much better than a violent snap at high angle.",
    parameters: {
      tirePressurePSI: "28–30 PSI rear (lower = more contact patch for smoother drift)",
      camberFront:     "-5.0°",
      camberRear:      "-1.0°",
      caster:          "7.0° (maximum — best self-steer for transitions)",
      antiRollBars:    "Stiff front, soft rear",
      springs:         "Medium front, soft rear",
      diffAccel:       "95%",
      diffDecel:       "0%",
      aero:            "Minimal or removed — downforce fights drift angle",
      note:            "RWD mandatory for competitive drift. AWD can drift but never feels natural.",
    },
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
      "Drift or race differential — high accel percentage (95%), near zero decel",
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
      "Differential accel — lower than you'd think to manage torque (start around 65%)",
      "Rear ARB very soft — classic muscle chassis flex is part of the character",
      "Brake bias slightly rear for initiation",
      "Softer rear springs",
      "Keep power in a controllable range — maximum power is rarely fastest for drift",
    ],
    watchOut:
      "Maximum power builds on classic muscle. These cars have heavy chassis and old suspension geometry. Too much power makes them unpredictable rather than fast.",
  },

  // ─── TOUGE RACING ─────────────────────────────────────────────────────────
  // Key FH6 touge principles:
  // - Bump < Rebound rule: set bump at 60-70% of rebound value (rebound must be stiffer)
  // - Springs 20-25% softer than road racing baseline
  // - AWD is the rain meta — FH6 Japan rains frequently, RWD loses rear grip on wet downhill
  // - Short gearing — mountain passes have no long straights
  // - Brake balance 50-52% front for downhill trail braking
  // ─────────────────────────────────────────────────────────────────────────

  {
    raceTypeId: 'touge',
    division:   'Classic Sports Cars',
    philosophy:
      "Classic sports cars are the soul of touge racing in FH6. Lightweight, communicative, and naturally suited to narrow mountain passes where precision beats power. The AE86 and early MX-5 belong here. Tune to feel — these cars tell you everything through the wheel if you let them.",
    spectrum:
      "The lightest classics (AE86, early MX-5, Lotus Elan) are the best touge cars in the game at their PI class. They rotate naturally, brake shorter than heavier cars, and recover quickly from mistakes. Heavier classics in this division work but need more conservative setup.",
    priorities: [
      "Race brakes — the most important single upgrade for touge",
      "Brake bias forward — hairpin braking is where touge is won",
      "Sport or race tires — compound matters hugely on mountain passes",
      "Short final drive gearing — straights are too short to need top speed",
      "Springs 20-25% softer than road baseline — mountain roads are uneven",
    ],
    watchOut:
      "Overtuning for power. The AE86 at 200hp on race tires beats a 400hp swap on street tires every time on touge. The roads are too narrow for power to matter as much as control.",
    parameters: {
      tirePressurePSI: "30–32 PSI warm (lower than road for cold mountain surfaces)",
      camberFront:     "-2.0° (more aggressive than road for tight hairpin turn-in)",
      camberRear:      "-1.5°",
      caster:          "5.5°–6.5° (strong self-centering helps on downhill sections)",
      antiRollBars:    "Soft front, medium rear",
      springs:         "20-25% softer than road racing baseline",
      rideHeight:      "Medium — not slammed (drainage dips drop inside wheel)",
      diffAccel:       "70% (higher than road — uphill exits need more drive grip)",
      diffDecel:       "25% (lower than road — lets car rotate freely on downhill entry)",
      brakeBalance:    "50–52% front (neutral for downhill trail braking)",
      damping:         "Bump at 60-70% of rebound value — the Bump < Rebound rule",
      note:            "A stiff road tune bounces off-line on every drainage dip and cracked surface. Touge needs its own baseline.",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Modern Sports Cars',
    philosophy:
      "Modern sports cars on touge routes have more power than the lightweight classics but still reward precision over aggression. The goal is making a faster car feel as confidence-inspiring as a lighter one — that means brakes, tires, and suspension before anything else.",
    spectrum:
      "The GR86, BRZ, and Z are natural touge picks — RWD, balanced, and lightweight enough to rotate cleanly. Heavier turbocharged modern sports cars (Supra, Z4) need more careful brake tuning and carry more risk on tight hairpins. Keep RWD — AWD conversions add understeer that hurts on narrow mountain roads. However, in wet conditions AWD cars (R34 GT-R, Celica GT-Four) are significantly safer.",
    priorities: [
      "Race brakes — non-negotiable on downhill touge sections",
      "Brake bias 50-52% front — neutral for downhill trail braking",
      "Race tires — grip is the limiting factor not power",
      "Short gearing — tight final drive ratio",
      "Springs softer than road baseline — apply Bump < Rebound damping rule",
    ],
    watchOut:
      "Using your road racing tune without changes. A stiff circuit setup bounces off-line on mountain drainage dips and cracked asphalt. Touge needs softer springs and stiffer rebound than road racing.",
    parameters: {
      tirePressurePSI: "30–32 PSI warm",
      camberFront:     "-2.0°",
      camberRear:      "-1.5°",
      caster:          "5.5°–6.5°",
      antiRollBars:    "Soft front, medium rear",
      diffAccel:       "70%",
      diffDecel:       "25%",
      brakeBalance:    "50–52% front",
      damping:         "Rebound 1.4–1.7× stiffer than bump (if bump is 4.0, rebound should be 6.0–7.0)",
      note:            "AWD recommended if rain is expected. RWD is faster in dry conditions.",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Retro Sports Cars',
    philosophy:
      "Retro sports cars from the 80s and 90s sit in a sweet spot for touge — more power and technology than classics but still light and communicative. The RX-7, Silvia, and MR2 are all competitive here. Tune for the hairpins and the downhill sections will take care of themselves.",
    spectrum:
      "Mid-engine retro sports cars (MR2, AW11) have naturally planted rear ends but can snap if pushed past the limit on downhill hairpins. FR cars (Silvia, RX-7) are more forgiving and easier to rotate. Both tune well for touge. The Silvia S13 in particular has the long wheelbase stability that helps on predictable downhill control.",
    priorities: [
      "Race brakes — critical for consistent downhill hairpin braking",
      "Tire compound upgrade first — bigger than any other gain",
      "Brake balance 50-52% front for downhill stability",
      "Springs 20-25% softer than road baseline",
      "Apply Bump < Rebound damping rule",
    ],
    watchOut:
      "Big engine swaps on mid-engine cars. The MR2 and AW11 are balanced specifically around their stock power range. A 500hp swap makes them difficult to control at the hairpin limits.",
    parameters: {
      tirePressurePSI: "30–32 PSI warm",
      camberFront:     "-2.0°",
      camberRear:      "-1.5°",
      diffAccel:       "70%",
      diffDecel:       "25%",
      brakeBalance:    "50–52% front",
      damping:         "Rebound stiffer than bump — prevents packing down through consecutive corners",
      note:            "Test on a full downhill run, not just flat corners. If steering response degrades mid-corner sequence, increase rebound.",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Hot Hatch',
    philosophy:
      "Hot hatches are underrated for touge at lower PI classes. Their light weight and short wheelbase help them rotate through tight hairpins faster than larger cars. FWD models need trail braking technique to rotate but are very competitive at B class.",
    spectrum:
      "FWD hot hatches (Polo GTI, Fiesta ST, 208 GTi) use trail braking to generate rotation where they'd otherwise understeer. AWD hot hatches (Golf R, Focus RS) are more consistent and benefit from the rain meta — Japan's mountain roads are frequently wet. Both work well tuned.",
    priorities: [
      "Race tires — biggest single gain",
      "Brake upgrade and forward bias (50-52%)",
      "Rear ARB slightly softer — helps FWD cars rotate",
      "Short gearing",
      "Springs softer than road baseline — apply Bump < Rebound rule",
    ],
    watchOut:
      "Expecting grip-car behavior from FWD builds on downhill hairpins. You need to trail brake to rotate a FWD hot hatch through a tight touge hairpin. If you're not using that technique the car will understeer every time.",
  },

  {
    raceTypeId: 'touge',
    division:   'Drift Cars',
    philosophy:
      "Drift cars tuned for touge rather than drift zones is an unusual setup but genuinely effective. The controlled oversteer tendencies that score points in drift zones help carry speed through touge hairpins — if you can keep it tidy. This is a high-skill approach.",
    spectrum:
      "Purpose-built drift cars dialed back slightly — less diff accel, more decel, slightly stiffer rear ARB — make excellent touge machines for experienced drivers. The rotation is there naturally, the task is controlling it on narrow mountain roads where the consequences of getting it wrong are bigger.",
    priorities: [
      "Dial back differential accel from drift setup — start around 65% not 95%",
      "Increase differential decel to 25-30% for stability under braking",
      "Race brakes — more important here than in drift zones",
      "Slightly stiffer rear ARB than your drift tune",
      "Apply Bump < Rebound damping rule — mountain roads punish packed suspension",
    ],
    watchOut:
      "Using a pure drift tune on touge. The aggressive rotation that scores in drift zones will put you off the road on downhill hairpins. Tune it back toward balance while keeping the natural rotation.",
  },

  // ─── DRAG RACING ──────────────────────────────────────────────────────────

  {
    raceTypeId: 'drag',
    division:   'Modern Muscle',
    philosophy:
      "Modern muscle cars are natural drag builds — high torque, rear or all-wheel drive, and chassis tuned for straight-line stability. The tune is simple: maximize launch, gear for the powerband, remove anything that adds drag without adding power. Most drag builds lose more time in the first seconds and between gears than at maximum speed.",
    spectrum:
      "The Camaro ZL1, Mustang GT500, Corvette ZR1, and Dodge Hellcat variants are the top drag performers in this division. AWD muscle (Cadillac CT5-V Blackwing) has the traction advantage off the line. RWD muscle has more top-end but needs more skill to launch cleanly.",
    priorities: [
      "Drag slicks rear — mandatory for launch traction",
      "AWD conversion if RWD stock — AWD consistently beats RWD off the line",
      "Final drive tuning — gear the car to hit the finish line before running out of revs",
      "Weight reduction — every kg costs time",
      "Remove all aero — downforce adds drag on a straight",
    ],
    watchOut:
      "Poor final drive ratio. Most muscle cars have gearing that's too long or too short for their powerband at drag strip length. If you're pulling ahead then getting caught late, lengthen the final drive. If you're hitting the limiter before the finish, shorten it.",
    parameters: {
      tirePressurePSI: "18–22 PSI rear (maximum sidewall flex for launch bite)",
      camberFront:     "0.0°",
      camberRear:      "0.0° (maximum straight-line contact patch)",
      antiRollBars:    "Softest everywhere — no cornering loads in drag",
      springs:         "Softest rear, medium front — rear squats on launch for weight transfer",
      diffAccel:       "95%",
      diffDecel:       "0%",
      aero:            "Remove all — downforce is drag",
      note:            "Launch RPM too high causes wheelspin which loses more time than a slow launch. AWD meta for drag in FH6.",
    },
  },

  {
    raceTypeId: 'drag',
    division:   'Classic Muscle',
    philosophy:
      "Classic muscle cars have massive torque and RWD which makes them exciting but inconsistent drag builds. The tune is about controlling the launch — getting power to the ground without spinning the tires through the first two gears.",
    spectrum:
      "Big-block classics (Chevelle SS 454, Charger R/T, Mustang Mach 1) have brutal torque that spins tires violently off the line without careful tuning. Small-block classics are more manageable but less quick at the top end. AWD conversions are worth considering for the big-block cars at competitive PI.",
    priorities: [
      "Drag tires — essential for managing the torque",
      "Launch control settings — critical for big-block classics",
      "Shorter first and second gear ratios — get into the powerband faster",
      "Soft suspension — weight transfer to rear helps launch traction",
      "Weight reduction — classic muscle is heavy from the factory",
    ],
    watchOut:
      "Wheelspin through the first two gears. Classic muscle lost more drag races to wheelspin than any other issue. If you're spinning, run drag tires before any other change. Stock gearing is almost always too long for quarter-mile distances.",
  },

  {
    raceTypeId: 'drag',
    division:   'Modern Supercars',
    philosophy:
      "Modern supercars at high PI classes are extremely competitive in drag racing — they have the power, AWD traction, and sophisticated launch systems to post elite times. The tune is mostly gearing and weight optimization.",
    spectrum:
      "AWD supercars (Lamborghini Huracan, McLaren GT4, Porsche 911 Turbo S) are the safest drag builds in this division. Mid-engine RWD supercars can be very quick with precise launches but are riskier. The key differentiator at this level is gearing — the power is already there.",
    priorities: [
      "Drag tires or semi-slick — depends on class",
      "Final drive and individual gear ratios — the most important tuning for supercar drag",
      "Weight reduction maximized",
      "Remove all aero",
      "Tune acceleration and launch stats to maximum in upgrade screen",
    ],
    watchOut:
      "Ignoring individual gear ratios. At supercar PI the engine powerband is narrow and precise. Stock gearing rarely matches it perfectly for a drag strip. Race transmission and ratio tuning is worth the PI cost here.",
  },

  {
    raceTypeId: 'drag',
    division:   'Hypercars',
    philosophy:
      "Hypercars are the top tier of drag racing in FH6. Electric and hybrid hypercars (Rimac Nevera) dominate because of instant torque from zero RPM. For combustion builds, gearing and launch control are the deciding factors.",
    spectrum:
      "AWD hypercars (Bugatti Chiron, Rimac Nevera, Koenigsegg Gemera) launch more consistently. RWD hypercars (Koenigsegg Jesko) have higher top-end speed but riskier launches. The Jesko is a top-speed machine rather than a 0-60 king — better on longer drag strips.",
    priorities: [
      "Gearing tuned specifically for the drag strip length",
      "Maximum weight reduction — non-negotiable at this level",
      "Drag tires",
      "No aero whatsoever",
      "Launch control — the difference between winning and losing at hypercar level",
    ],
    watchOut:
      "Assuming the fastest car wins. At hypercar PI a Jesko with wrong gearing loses to a Chiron with perfect gearing. Tune the gears for your specific strip length and powerband before anything else.",
  },

  {
    raceTypeId: 'drag',
    division:   'Retro Muscle',
    philosophy:
      "Retro muscle in drag racing is a mid-range option — less power than modern muscle but more characterful. The tune is straightforward: control the torque, gear correctly, remove weight and drag.",
    spectrum:
      "The Buick GNX, Fox-body Mustang, and early Camaro Z28 are the best retro drag picks. The GNX in particular is an excellent drag build at B class — turbocharged, relatively lightweight, and surprisingly grippy with the right tires.",
    priorities: [
      "Drag tires",
      "Final drive ratio — most retro muscle is geared too long from stock",
      "Engine upgrade — spend remaining PI budget here after tires and weight",
      "Weight reduction",
      "AWD conversion for consistent launches if PI allows",
    ],
    watchOut:
      "Running stock gearing on retro muscle. These cars were geared for highway cruising, not quarter miles. The final drive almost always needs shortening for drag strip distances.",
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helper — returns the tuning guide for a car+race combo if it exists.
// Returns null if no specific guide has been written for this combination yet.
// ─────────────────────────────────────────────────────────────────────────────

export function getTuningGuide(
  raceTypeId: string,
  division:   string
): TuningGuide | null {
  return (
    TUNING_GUIDES.find(
      (g) => g.raceTypeId === raceTypeId && g.division === division
    ) ?? null
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns all guides written for a given race type — used on the races detail
// page to surface division-specific advice in one place.
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