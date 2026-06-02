// ─────────────────────────────────────────────────────────────────────────────
// Static tuning guidance content keyed by race type + division.
// Sources: forza.guide (May 2026), fh6guide.com, kboosting.com, keengamer.com
// Last updated: May 2026
//
// KEY CHANGES FROM PREVIOUS VERSION (forza.guide alignment):
// - ARB starting point corrected: start both at max, soften toward 0.55–0.65
//   mechanical balance. Previous guides incorrectly said "stiffen front ARB".
// - RWD diff accel corrected: 55% start (50–70% range), not 85%.
// - AWD diff values added: front 85%/0%, rear 55%/15%, center 70–80% rear bias.
// - Tire pressures (v2 corrected, cold): slick/semi-slick 30–33, stock/sport/rally
//   26–28, off-road/XC 24–26 PSI cold. Previous warm values removed.
// - Caster added: 6.5–7.0°, most cars happiest near max (7°).
// - Mechanical Balance target added: 0.55–0.65, sweet spot 0.60.
// - Drag damping pattern documented: inverted from grip (stiff front bump +
//   stiff rear rebound).
// - Drift diff corrected: 100% locked accel (not 95%).
// - Off-road ARB: near minimum both ends, not medium.
// ─────────────────────────────────────────────────────────────────────────────

export interface TuningParameters {
  tirePressurePSI?:  string
  camberFront?:      string
  camberRear?:       string
  caster?:           string
  arbNote?:          string
  mechBalanceTarget?:string
  springs?:          string
  rideHeight?:       string
  damping?:          string
  diffRWD?:          string
  diffFWD?:          string
  diffAWD?:          string
  brakeBalance?:     string
  aeroBalance?:      string
  note?:             string
}

export interface TuningGuide {
  raceTypeId:   string
  division:     string
  philosophy:   string
  spectrum:     string
  priorities:   string[]
  watchOut:     string
  parameters?:  TuningParameters
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL TUNING PRINCIPLES (forza.guide, May 2026)
//
// Tuning order: tires → gearing → alignment → ARBs → springs → damping →
//               aero → brakes → differential
//
// ARB method: max both, soften toward mechanical balance 0.55–0.65 (sweet
//             spot 0.60). Fix the END with the problem — soften weak end,
//             don't stiffen the strong one.
//
// Diff starting points:
//   RWD:  55% accel / 15% decel (aggressive exit up to ~90% accel)
//   FWD:  85% accel / 0% decel
//   AWD front: 85% accel / 0% decel
//   AWD rear:  55% accel / 15% decel
//   AWD center: 70–80% rear bias
//
// Tire pressure by compound (cold):
//   Slick/semi-slick/drift: 30–33 PSI  |  Stock/sport/rally: 26–28 PSI
//   Cross country/off-road: 24–26 PSI  |  Drag rear: 26–28 PSI
//
// Caster: 6.5–7.0° for most road cars, near max (7°). Off-road: ~2.0°.
//
// Camber: start 0° to −1.0° front/rear. Add negative in 0.3° steps.
//         Over −2.0° front → raise caster instead.
//
// Springs: ⅓ to ½ up the slider range. Heavier end slightly higher.
//          Rally/off-road: near soft end.
//
// Damping: bump ÷ 0.4 = rebound. Min front bump: road/sports 4.4–5.0,
//          utility/race truck 5.0–5.2, rally/off-road 1.0.
//
// Aero balance: target 0.40–0.45. RWD slight rear bias; FWD/AWD slight front.
//
// Brake bias stability-first: 52–56% forward.
//         rotation-first (trail braking): 53–54% rear bias.
// ─────────────────────────────────────────────────────────────────────────────

export const TUNING_GUIDES: TuningGuide[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // ROAD RACING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'road',
    division:   'Hot Hatch',
    philosophy:
      "Hot hatches punch above their weight on road circuits because of low mass and nimble handling. The goal is maximizing that natural advantage — not chasing power the chassis can't use. FH6 rewards cars that brake late and rotate cleanly; hot hatches do both naturally when set up right.",
    spectrum:
      "FWD hot hatches need to manage understeer through fast corners — their ARB balance should favor a softer front to help rotation. AWD hot hatches have more traction but the inherent AWD understeer bias needs diff and ARB compensation. Know which end your car sits on before touching anything.",
    priorities: [
      "Tire compound and front tire width — biggest single grip gain at this class",
      "Brake upgrade — at least one tier above stock; FH6 rewards late braking",
      "Weight reduction — more impactful than power here",
      "ARBs — start both at max, soften front for FWD understeer or rear for AWD push",
      "Final drive — keep gears short; you rarely use top speed on road circuits",
    ],
    watchOut:
      "Adding power before grip. A hot hatch with 50 extra horsepower and stock tires is slower than one with race tires and stock power. Chassis upgrades always first.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold. Street/stock: 26–28 PSI cold",
      camberFront:       "−0.5° to −1.5° — add negative if turn-in is lazy",
      camberRear:        "0° to −1.0°",
      caster:            "6.5–7.0° (near max for most cars)",
      arbNote:           "Start both at max. Soften front for FWD understeer, soften rear for AWD push. Target mechanical balance 0.55–0.65",
      mechBalanceTarget: "0.55–0.65, sweet spot 0.60",
      springs:           "⅓ to ½ up the slider range. Keep front and rear close together",
      diffRWD:           "55% accel / 15% decel starting point",
      diffFWD:           "85% accel / 0% decel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward for stability. Trail-brakers: try 53% rear bias",
      aeroBalance:       "Target 0.40–0.45. AWD: slight front bias. RWD: slight rear",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Super Hot Hatch',
    philosophy:
      "More power and PI than a standard hot hatch but the philosophy is the same — the chassis is the weapon. At this PI level aero starts to pay off. Fix balance first, add aero second, only then consider power.",
    spectrum:
      "The top end of this division approaches proper sports car territory. Lighter cars tune like standard hot hatches. Heavier, more powerful ones need earlier brake investment and more careful diff work.",
    priorities: [
      "Race tires front and rear — non-negotiable at this PI",
      "ARBs — max both, soften toward mechanical balance 0.55–0.65",
      "Aero — even modest downforce pays off on faster road layouts",
      "Brake bias 52–54% forward — stability under heavy braking",
      "Weight reduction before any power adds",
    ],
    watchOut:
      "Over-tuning aero for tight sections. Max downforce hurts straight-line speed and isn't needed unless the layout has sustained high-speed corners. Set aero balance to 0.40–0.45 first, then judge overall level by feel.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold",
      camberFront:       "−0.5° to −1.5°",
      camberRear:        "0° to −1.0°",
      caster:            "6.5–7.0°",
      arbNote:           "Start max both. Soften toward 0.55–0.65 mechanical balance",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel",
      diffFWD:           "85% accel / 0% decel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
      aeroBalance:       "0.40–0.45 balance stat. Add to both ends together if you need more overall grip",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Modern Sports Cars',
    philosophy:
      "The most varied division for road racing. The common thread is that these cars are built for this discipline — balanced, grippy, capable of sustained pace. Work with the car's natural balance rather than fighting it. Most players lose more time to braking mistakes and hesitation than to raw speed.",
    spectrum:
      "Lightweight naturally-aspirated RWD coupes (GR86, BRZ) tune very differently from heavy turbocharged machines (Supra, Z4) or AWD all-rounders (TT RS). If your car feels planted and predictable, tune conservatively. If it understeers, start with ARBs. If it oversteers, start with diff decel.",
    priorities: [
      "Diagnose first — is the car understeering or oversteering, and at which corner phase",
      "ARBs — max both, soften the problem end toward mechanical balance 0.55–0.65",
      "Tire compound — semi-slick minimum at A/S1",
      "Differential — RWD start 55% accel / 15% decel; AWD see parameters",
      "Aero balance at 0.40–0.45 if PI allows",
    ],
    watchOut:
      "AWD conversion without checking PI cost. On many cars the AWD swap eats PI better spent on tires and brakes. RWD is faster on dry tarmac in skilled hands — lighter weight and better rotation equals better lap times at equal PI.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold. Race slick: 30–33 PSI cold",
      camberFront:       "−0.5° to −1.5° (more for RWD). Over −2.0° → raise caster instead",
      camberRear:        "0° to −1.0°",
      caster:            "6.5–7.0° — near max for most cars",
      arbNote:           "Max both. Soften front for understeer, soften rear for oversteer. Target 0.55–0.65 mechanical balance",
      mechBalanceTarget: "0.55–0.65, sweet spot 0.60",
      springs:           "⅓ to ½ up the slider. Heavier end slightly higher. Balanced setups with mildly soft overall stiffness outperform front-soft/rear-stiff in FH6",
      diffRWD:           "55% accel / 15% decel. Aggressive builds up to ~90% accel but requires throttle discipline",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward (stability). Trail-braking: 53% rear bias",
      aeroBalance:       "0.40–0.45. RWD: slight rear bias. AWD: slight front bias",
    },
  },

  {
    raceTypeId: 'road',
    division:   'GT Cars',
    philosophy:
      "GT cars are heavier and more powerful than sports cars. Braking stability and corner entry are where you win or lose. They're not nimble — don't tune them like they are. Manage the weight first and the power takes care of itself.",
    spectrum:
      "Most GT cars are RWD or AWD grand tourers. RWD GTs need careful diff decel tuning to avoid snapping on corner entry. AWD GTs understeer until ARBs and center diff are properly set — soften the front ARB first and bias the center diff toward rear.",
    priorities: [
      "Brake upgrade — heavier cars need more stopping power",
      "ARBs — max both, soften front for AWD understeer or rear for RWD snap",
      "Differential — RWD 55%/15% start; AWD see parameters",
      "Springs — ⅓ to ½ up the slider, heavier end slightly higher",
      "Tire width — GT cars can use the contact patch",
    ],
    watchOut:
      "Ignoring brake balance. GT cars that lock up under heavy braking lose more time than almost any other tuning mistake. Start at 52–54% forward and adjust from there.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold",
      camberFront:       "−0.5° to −1.5°",
      camberRear:        "0° to −1.0°",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften front for AWD push; soften rear for RWD snap on entry",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
      aeroBalance:       "0.40–0.45",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Super GT',
    philosophy:
      "Super GTs at higher PI classes are where aero becomes a real tool — these cars are fast enough that downforce actually generates grip. Build the chassis first, add aero second, fill remaining PI with power last.",
    spectrum:
      "Super GTs range from elegant long-distance cruisers to borderline track cars. The heavier end needs aggressive weight reduction to feel responsive. The lighter end can lean into aero earlier.",
    priorities: [
      "Weight reduction — more impactful than power at this division",
      "ARBs — max both, soften toward 0.55–0.65 mechanical balance",
      "Aero at 0.40–0.45 balance — tune both ends together, not independently",
      "Brake upgrade — two tiers above stock minimum",
      "Differential — get the center diff balance right before touching power",
    ],
    watchOut:
      "Setting rear aero to max without adjusting front. An aero imbalance creates unpredictable handling at speed. Target the 0.40–0.45 aero balance stat first, then raise overall level by feel.",
    parameters: {
      tirePressurePSI:   "Slick/semi-slick: 30–33 PSI cold",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften toward 0.55–0.65 mechanical balance",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
      aeroBalance:       "Set aero balance stat to 0.40–0.45 first. Then add to both ends equally for more overall grip",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Modern Supercars',
    philosophy:
      "Modern supercars have the power, grip, and aero to be competitive everywhere — the tune is about balance and stability, not chasing any single metric. Over-tuning power is the most common mistake at this level.",
    spectrum:
      "Mid-engine RWD supercars (McLaren, Ferrari, Lamborghini) need careful rear management and diff work. Front-engine AWD machines (GT-R, NSX) understeer until ARBs and center diff are set. The in-game handling stat is your best pre-drive signal for which camp your car sits in.",
    priorities: [
      "ARBs — max both, soften toward 0.55–0.65 mechanical balance",
      "Aero balance at 0.40–0.45 first, then overall level by feel",
      "Differential — most important single setting at supercar PI",
      "Camber — add negative front in 0.3° steps until cornering improves",
      "Tire compound — race slick at S1/S2, semi-slick at A",
    ],
    watchOut:
      "Adding more power at S1/S2. You almost certainly have enough. Adding power without grip upgrades makes the car harder to drive and slower in corners. Weight reduction gains more lap time than engine work at this level.",
    parameters: {
      tirePressurePSI:   "Slick/semi-slick: 30–33 PSI cold",
      camberFront:       "−0.5° to −1.5°. Add in 0.3° steps; over −2.0° raise caster instead",
      camberRear:        "0° to −1.0°",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften end with the problem toward 0.55–0.65 mechanical balance. High-power RWD often needs softer rear to prevent snap oversteer",
      mechBalanceTarget: "0.55–0.65, sweet spot 0.60",
      springs:           "⅓ to ½ up the slider. RWD: nudge rear slightly higher for rotation (optional, test first)",
      diffRWD:           "55% accel / 15% decel start. Aggressive builds up to ~90% accel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
      aeroBalance:       "0.40–0.45 balance stat. RWD slight rear; AWD slight front",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Hypercars',
    philosophy:
      "Hypercars are already at the limit of what road racing allows. The tune is almost entirely about stability and control — managing the power, planting the rear, keeping the car from destroying its tires. Restraint wins here.",
    spectrum:
      "AWD hypercars (Chiron, Rimac, Gemera) are more forgiving. Violent mid-engine RWD cars (Jesko, Regera) demand precise diff and ARB work. Know your car — the wrong approach on a hypercar makes it nearly undriveable.",
    priorities: [
      "ARBs — max both, soften carefully toward 0.55–0.65 mechanical balance",
      "Aero at 0.40–0.45 balance — hypercars need downforce to use their power",
      "Differential — the most critical setting; wrong diff on a hypercar is unrecoverable",
      "Race slick tires — no compromise",
      "Damping — rebound tuning to manage weight transfer on fast direction changes",
    ],
    watchOut:
      "Treating a hypercar like a sports car. They need more precise ARB, aero, and diff tuning than anything below them. A hypercar with wrong diff values is not just slow — it's dangerous.",
    parameters: {
      tirePressurePSI:   "Slick: 30–33 PSI cold",
      camberFront:       "−0.5° to −1.5°",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften toward 0.55–0.65 mechanical balance. High-power RWD hypercars often need significantly softer rear ARB",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel start. Aggressive builds up to ~90% accel with strict throttle discipline",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
      aeroBalance:       "0.40–0.45. Add to both ends together — don't sacrifice balance for more rear",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Retro Supercars',
    philosophy:
      "Retro supercars are underpowered by modern standards but often have excellent chassis balance. Tune to their strengths — light weight and mechanical grip. Softer suspension generates more contact patch than aero at these speeds.",
    spectrum:
      "Earlier retro supercars (pre-1985) have narrow tires and limited aero options — tune conservatively with softer suspension. Later ones (late 80s/early 90s) start to have real downforce options and can be tuned more aggressively.",
    priorities: [
      "Tire width — older cars often have room to go wider",
      "Softer springs than you'd use on a modern car — mechanical grip over aero",
      "ARBs — max both, soften toward 0.55–0.65 mechanical balance",
      "Brake balance — older cars often have rear-heavy bias from the factory",
      "Keep power moderate — the chassis has a ceiling",
    ],
    watchOut:
      "High-power engine swaps on narrow old chassis. Fun but rarely fast. The chassis limit is the chassis limit regardless of what's under the hood.",
    parameters: {
      tirePressurePSI:   "Stock/street: 26–28 PSI cold. Semi-slick: 30–33 PSI cold",
      camberFront:       "−0.5° to −1.0° — conservative; these cars don't like aggressive alignment",
      caster:            "6.0–7.0°",
      arbNote:           "Max both. Soften more than a modern car — older chassis needs compliance",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel — lower accel than modern cars to manage torque",
      brakeBalance:      "52–56% forward — older rear brakes are weak",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Classic Sports Cars',
    philosophy:
      "Classic sports cars have limited upgrade options but often have pure, communicative chassis that reward smooth driving. Tune for mechanical grip and feel — you're not out-powering anything in this class.",
    spectrum:
      "British lightweights (Lotus, early MX-5, AE86) thrive on smooth circuits and tune up beautifully. American classics have more power but less chassis finesse. Italian classics sit between the two.",
    priorities: [
      "Springs near the soft end — maximize tire contact on uneven classic-era circuits",
      "ARBs — max both, soften toward 0.55–0.65 mechanical balance",
      "Mild negative camber front — these cars understeer badly without it",
      "Brake bias forward — older rear drum brakes are weak",
      "Don't overpower — stay close to stock output",
    ],
    watchOut:
      "Engine swapping without considering the chassis. A classic sports car with a 500hp V8 is usually just a spinning mess. The chassis limit is real.",
  },

  {
    raceTypeId: 'road',
    division:   'Extreme Track Toys',
    philosophy:
      "Purpose-built for grip and lap times. They're already engineered for road racing — your job is refinement, not reinvention. Test first and only change what's actually wrong.",
    spectrum:
      "Some extreme track toys are essentially race cars with number plates needing almost no tuning. Others are road-legal sports cars with race upgrades that benefit from full chassis treatment.",
    priorities: [
      "Aero balance — target 0.40–0.45; find the level by feel on your specific layout",
      "Tire pressure — use the compound table: slick 28–32.5, semi-slick 27–29.5 PSI",
      "ARBs — max both, soften carefully toward 0.55–0.65 mechanical balance",
      "Differential — track toys respond strongly to diff tuning",
      "Brake bias — often needs small forward adjustment; start at 52–54%",
    ],
    watchOut:
      "Over-tuning a car that's already optimized. These cars often feel best close to their default tune. Test on the actual race route before touching anything.",
    parameters: {
      tirePressurePSI:   "Slick/semi-slick: 30–33 PSI cold",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften carefully — track toys are sensitive to ARB changes",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel. Aggressive builds up to ~90% accel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
      aeroBalance:       "0.40–0.45 balance stat first, then overall level by feel",
    },
  },

  {
    raceTypeId: 'road',
    division:   'Track Toys',
    philosophy:
      "Serious performance machines that reward commitment in corners. They have the downforce and mechanical grip to carry real speed — tune to take advantage of that.",
    spectrum:
      "Similar to extreme track toys but more variety in weight and power. Lighter cars are incredibly rewarding when set up right. Heavier ones need brake investment to keep up.",
    priorities: [
      "Race tires minimum — semi-slick or slick if available",
      "ARBs — max both, soften toward 0.55–0.65 mechanical balance",
      "Aero balance at 0.40–0.45 — tune front and rear together",
      "Differential tuning — these cars respond strongly to diff changes",
      "Brake upgrade — worth the PI cost",
    ],
    watchOut:
      "Ignoring tire pressure. On high-grip cars with sticky tires, 2 PSI change transforms handling. Use the compound ranges: slick 28–32.5, semi-slick 27–29.5 PSI warm.",
  },

  {
    raceTypeId: 'road',
    division:   'Modern Super Saloons',
    philosophy:
      "Super saloons have real-world practicality baked into their DNA — compromised chassis compared to dedicated sports cars. The tune compensates for those compromises: body roll, understeer, and power delivery are the three problems to solve.",
    spectrum:
      "AWD super saloons (RS models, M cars with xDrive) and RWD ones (M3, M4, C63) tune quite differently. AWD needs center diff and front ARB work to manage understeer. RWD needs diff decel and rear ARB to stay planted under power.",
    priorities: [
      "ARBs — max both, soften front for AWD understeer or rear for RWD snap",
      "Brake upgrade and bias — saloons brake later than sports cars by nature",
      "Differential — most impactful single setting for super saloon road racing",
      "Tire width — these cars can use the contact patch",
      "Springs — ⅓ to ½ up the slider to control the extra weight",
    ],
    watchOut:
      "Expecting sports car behavior. A tuned super saloon is fast but it's not a GR86. Tune it for what it is — stable, powerful, heavy — rather than trying to make it feel lighter.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften front for AWD understeer; soften rear for RWD exit snap",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "55% accel / 15% decel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STREET RACING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'street',
    division:   'Hot Hatch',
    philosophy:
      "Street racing is where hot hatches genuinely belong. Tight layouts, short straights, quick direction changes. The tune maximizes that natural advantage. Consistency beats raw pace — a stable, predictable tune wins more street races than an aggressive nervous one.",
    spectrum:
      "FWD hot hatches need front grip and controlled understeer. AWD ones need diff tuning to rotate without pushing wide. A stock FWD hot hatch on race tires often beats a poorly tuned AWD one.",
    priorities: [
      "Front tire width — critical for FWD traction out of slow corners",
      "ARBs — max both, soften front (FWD) or rear (AWD) toward 0.55–0.65",
      "Short gearing — you won't hit top speed on most street layouts",
      "Race or semi-slick tires — traction is everything on tight layouts",
      "Brake balance 52–54% forward — quick stops into tight sections",
    ],
    watchOut:
      "Tuning for top speed. Street racing rarely has sections long enough to need it. Short gearing and grip beats high top speed every time.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold. Street: 26–28 PSI cold",
      arbNote:           "Max both. FWD: soften front for rotation. AWD: soften rear for rotation without push",
      mechBalanceTarget: "0.55–0.65",
      diffFWD:           "85% accel / 0% decel",
      diffRWD:           "55% accel / 15% decel",
      diffAWD:           "Front: 85%/0% · Rear: 55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
    },
  },

  {
    raceTypeId: 'street',
    division:   'Modern Sports Cars',
    philosophy:
      "Modern sports cars on street layouts need to be nimble and traction-focused. The challenge is getting power down cleanly out of tight exits — every wheelspin compounds across a short lap.",
    spectrum:
      "Lightweight RWD sports cars (GR86, BRZ) are naturally suited and tune quickly. Heavier turbocharged options need careful diff work. AWD options are more forgiving but need understeer management.",
    priorities: [
      "Differential accel — most important setting for clean corner exit traction",
      "ARBs — max both, soften toward 0.55–0.65 mechanical balance",
      "Race or semi-slick tires",
      "Short final drive ratio",
      "Brake balance 52–54% forward",
    ],
    watchOut:
      "Wheelspin out of slow corners. On street racing it compounds across an entire lap. If you're spinning on exit, reduce diff accel first (try 45–50%) before touching anything else.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold",
      arbNote:           "Max both. Soften rear if oversteering on exit; soften front if understeering on entry",
      mechBalanceTarget: "0.55–0.65",
      diffRWD:           "50–55% accel / 15% decel — lower accel than road racing for cleaner exit",
      diffAWD:           "Front: 85%/0% · Rear: 50–55%/15% · Center: 70–80% rear bias",
      brakeBalance:      "52–54% forward",
    },
  },

  {
    raceTypeId: 'street',
    division:   'Modern Muscle',
    philosophy:
      "Muscle cars on street layouts is a challenging combination. The power is there but the weight and chassis aren't optimized for tight technical driving. The tune is mostly damage limitation — manage the power, improve the brakes, reduce the weight.",
    spectrum:
      "Genuinely capable track machines (Z06, GT500) tune up reasonably well. Heavy cruisers struggle on tight sections and are better suited to street layouts with longer sections.",
    priorities: [
      "Weight reduction — most important upgrade for muscle on street layouts",
      "Brake upgrade — these cars stop poorly from stock",
      "ARBs — max both, soften rear heavily to manage weight in tight sections",
      "Short gearing — most muscle cars have long stock gearing suited to highway racing",
      "Differential decel — prevents rear stepping out under braking into corners",
    ],
    watchOut:
      "Adding more power. Modern muscle almost always has too much power for street racing already. Weight reduction and chassis work gains more time than any engine upgrade.",
    parameters: {
      tirePressurePSI:   "Semi-slick: 30–33 PSI cold",
      arbNote:           "Max both. Soften rear significantly — muscle cars need compliance in tight sections",
      mechBalanceTarget: "0.55–0.60 — lean slightly toward front grip to manage the power",
      diffRWD:           "45–55% accel / 15–20% decel — lower accel than normal to manage torque",
      brakeBalance:      "52–56% forward",
    },
  },

  {
    raceTypeId: 'street',
    division:   'Retro Hot Hatch',
    philosophy:
      "Retro hot hatches on street layouts have limited power but excellent chassis feel. Tune for mechanical grip and predictability — you'll outbrake heavier cars and find time in the technical sections.",
    spectrum:
      "Classic FWD retro hot hatches (Golf GTI, Peugeot 205) are naturally nimble. AWD era cars (Escort Cosworth) have more traction but slightly less agility.",
    priorities: [
      "Tire compound upgrade — biggest gain on older platforms",
      "ARBs — max both, soften front to help FWD rotation",
      "Brake balance forward — older hot hatches often have poor rear brake bias",
      "Keep power modest — the chassis has limits",
      "Short gearing suited to tight layouts",
    ],
    watchOut:
      "Overtuning these cars. A retro hot hatch on race tires with mild upgrades often beats one with a big engine swap that overwhelms the chassis.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIRT RACING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'dirt',
    division:   'Rally Monsters',
    philosophy:
      "Rally monsters were built for exactly this. The tune is about dialing in the balance — these cars want to rotate on loose surfaces. Off-road ARBs near minimum both ends so each wheel follows the surface independently.",
    spectrum:
      "Classic Group B cars (Quattro S1, 205 T16) and modern rally monsters tune similarly — softer than you'd think, with diff biased toward rotation. The loose surface demands compliance, not stiffness.",
    priorities: [
      "Rally suspension — essential",
      "ARBs near minimum both ends — soft lets each wheel follow uneven ground independently",
      "Springs near the soft end of the slider range",
      "Ride height raised — ground clearance matters on rough sections",
      "Rally tires — compound matters more than width here",
    ],
    watchOut:
      "Tuning for grip like it's a tarmac car. Dirt rewards controlled slides. A car that fights the slide is slower than one that works with it. Stiff ARBs tie the wheels together and make the car skip across bumps.",
    parameters: {
      tirePressurePSI:   "Rally: 26–28 PSI cold",
      camberFront:       "−0.5° to −1.0° — less aggressive than tarmac",
      camberRear:        "0° to −0.5°",
      caster:            "6.5–7.0°",
      arbNote:           "Near minimum both ends. Do NOT use the max-then-soften approach here — off-road starts soft",
      springs:           "Near the soft end of the slider range. Rally suspension comes in soft by design — leave it there",
      rideHeight:        "Near maximum",
      damping:           "Min front bump (1.0). Derive rebound by feel — firm, front-biased. Don't use the bump÷0.4 rule here",
      diffAWD:           "Front: 80–95%/0–10% · Rear: ~90%/10–15% · Center: 50–70% rear bias (oversteer-biased for dirt)",
      brakeBalance:      "48% forward (rally starting point per forza.guide)",
    },
  },

  {
    raceTypeId: 'dirt',
    division:   'Classic Rally',
    philosophy:
      "Classic rally cars have less power and narrower tires than modern ones but excellent balance. Tune conservatively — these cars reward smooth driving over aggression.",
    spectrum:
      "Older rally cars (Lancia Stratos, Fulvia, early Escort) are pure and communicative. Tune to feel rather than chasing numbers.",
    priorities: [
      "Rally suspension — mandatory",
      "ARBs near minimum both ends",
      "Springs near the soft end",
      "Mild differential tuning — these cars rotate naturally, don't over-lock",
      "Don't over-power — the chassis was built for a specific power range",
    ],
    watchOut:
      "Engine swaps that push power far beyond the original spec. A 600hp engine in a Lancia Stratos chassis is a spinning nightmare on dirt.",
    parameters: {
      tirePressurePSI:   "Rally: 26–28 PSI cold",
      arbNote:           "Near minimum both ends",
      diffAWD:           "Front: 80–90%/0–5% · Rear: 80–90%/10% · Center: 50–65% rear bias",
      brakeBalance:      "48% forward",
    },
  },

  {
    raceTypeId: 'dirt',
    division:   'Retro Rally',
    philosophy:
      "Retro rally cars bridge the gap between classics and modern monsters. More technology than classics, less than modern. Tune with softer suspension, rally tires, and differential biased toward rotation.",
    spectrum:
      "The Escort Cosworth, Impreza WRX, and Lancer Evo are among the best dirt racers at their PI class. AWD cars from this era tune well — softer than tarmac, diff rear-biased.",
    priorities: [
      "Rally suspension and raised ride height",
      "ARBs near minimum both ends",
      "Springs near the soft end",
      "AWD differential — rear bias and higher accel for rotation",
      "Rally tires — compound over width",
    ],
    watchOut:
      "Road tires on dirt. Even sport compound tires are significantly worse than rally tires on loose surfaces. Always swap compound first.",
    parameters: {
      tirePressurePSI:   "Rally: 26–28 PSI cold",
      arbNote:           "Near minimum both ends",
      diffAWD:           "Front: 80–90%/0–5% · Rear: ~90%/10–15% · Center: 50–65% rear bias",
      brakeBalance:      "48% forward",
    },
  },

  {
    raceTypeId: 'dirt',
    division:   "Pickups & 4x4's",
    philosophy:
      "Pickups and 4x4s on dirt have natural traction and ground clearance advantages but weight is their biggest enemy. Soft suspension keeps tires planted. Moderate power delivery prevents wheelspin.",
    spectrum:
      "Stock pickups are slow but stable. Performance pickups (Raptor, TRD Pro) are genuinely competitive when tuned. Pure off-road 4x4s are slower through corners than rally cars but more durable.",
    priorities: [
      "Off-road or rally suspension — essential",
      "ARBs near minimum both ends",
      "Ride height raised",
      "Weight reduction — more impactful here than anywhere else",
      "Off-road tires",
    ],
    watchOut:
      "Expecting rally car performance. Pickups on dirt circuits are slower through corners than rally cars. Find time in traction zones, not cornering speed.",
    parameters: {
      tirePressurePSI:   "Off-road: 24–26 PSI cold",
      arbNote:           "Near minimum both ends",
      rideHeight:        "Near maximum",
      diffAWD:           "Front: 80–90%/0–5% · Rear: 80–90%/10% · Center: 50–65% rear bias",
      brakeBalance:      "48–50% forward",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS COUNTRY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'crosscountry',
    division:   'Unlimited Offroad',
    philosophy:
      "Unlimited offroad vehicles are built for cross country. Tune for stability and traction over everything else. Landing recovery is a major pace factor — don't sacrifice suspension compliance for any other setting.",
    spectrum:
      "Trophy trucks are fast with big jumps and long rough sections. Unlimited buggies are more agile but less stable at speed. Class 1 buggies split the difference.",
    priorities: [
      "ARBs near minimum both ends — wheels must move independently over jumps",
      "Springs near the soft end — absorbs landings without bouncing offline",
      "Ride height near maximum — ground clearance is non-negotiable",
      "Soft bump damping — soaks up impacts. Fast rebound to keep tires on ground",
      "Off-road tires — compound matters, width less so",
    ],
    watchOut:
      "Lowering ride height for any reason. Cross country terrain will beach a car with insufficient clearance. Prioritize clearance over everything including lap time.",
    parameters: {
      tirePressurePSI:   "Off-road: 24–26 PSI cold",
      arbNote:           "Near minimum both ends — do NOT use the max-then-soften approach here",
      springs:           "Near the soft end. Off-road rule: start high, lower only if clearly not bottoming out",
      rideHeight:        "Near maximum. Off-road inverts the normal rule — start high",
      damping:           "Min bump (1.0). Soft rebound — fast rebound keeps tires on ground after jumps",
      diffAWD:           "Front: 80–90%/0–5% · Rear: 80–90%/10% · Center: 50–65% rear bias",
      brakeBalance:      "46–50% forward (off-road buggy range)",
    },
  },

  {
    raceTypeId: 'crosscountry',
    division:   'Sports Utility Heroes',
    philosophy:
      "SUVs for cross country are a compromise — some off-road capability but not purpose-built for it. The tune compensates for weight and high center of gravity with softer suspension and conservative power delivery.",
    spectrum:
      "Performance SUVs (Bentayga, Cayenne Turbo, DBX) are actually competitive in cross country at A class and below when tuned properly — treat them like heavy AWD saloons with extra ride height.",
    priorities: [
      "Off-road suspension or rally suspension minimum",
      "ARBs near minimum — soft both ends",
      "Ride height raised significantly",
      "Springs near the soft end",
      "Off-road tires — mandatory",
    ],
    watchOut:
      "Treating an SUV like a road car. Even on cross country sections that look like roads, the terrain is rough enough that road-spec suspension bottoms out and loses traction.",
    parameters: {
      tirePressurePSI:   "Off-road: 24–26 PSI cold",
      arbNote:           "Near minimum both ends",
      rideHeight:        "Raised — near maximum",
      diffAWD:           "Front: 80–90%/0–5% · Rear: 80–90%/10% · Center: 50–65% rear bias",
      brakeBalance:      "48–50% forward",
    },
  },

  {
    raceTypeId: 'crosscountry',
    division:   "Pickups & 4x4's",
    philosophy:
      "Pickups and 4x4s are in their element in cross country. Ground clearance, suspension travel, and AWD traction are exactly what the discipline rewards. A well-tuned pickup is genuinely competitive here.",
    spectrum:
      "Stock work trucks are slow but nearly indestructible. Performance trucks (Raptor R, TRD Pro) are properly quick with the right tune. Classic 4x4s have less power but excellent chassis feel.",
    priorities: [
      "ARBs near minimum both ends",
      "Ride height near maximum",
      "Springs near the soft end",
      "Off-road tires — non-negotiable",
      "Weight reduction where possible",
    ],
    watchOut:
      "Insufficient ground clearance over crests. Cross country can beach a vehicle. If in doubt, go higher.",
    parameters: {
      tirePressurePSI:   "Off-road: 24–26 PSI cold",
      arbNote:           "Near minimum both ends",
      rideHeight:        "Near maximum",
      diffAWD:           "Front: 80–90%/0–5% · Rear: 80–90%/10% · Center: 50–65% rear bias",
      brakeBalance:      "48–52% forward",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DRIFT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'drift',
    division:   'Drift Cars',
    philosophy:
      "These cars were built for one thing. The tune isn't about making them drift — they already do that. It's about making the drift controllable, sustained, and scored well. Angle, speed, and smoothness win points. Predictability scores more than drama.",
    spectrum:
      "Classic JDM platforms (S13, S14, AE86) are more forgiving and easier to control. Modern big-power builds score more when controlled but punish mistakes harder. Longer wheelbase means smoother sustained drifts. Shorter wheelbase means faster transitions.",
    priorities: [
      "Differential — 100% accel locked, ~10% decel (low) — locked both rear wheels is the single biggest factor",
      "Rear tire pressure low — toward minimum for less rear grip and easier initiation",
      "Front camber maxed (−5°), rear minimal (−1°) — front bites, rear slides",
      "Soft everything — ARBs ~8, springs mid, bump and rebound ~4 front and rear",
      "Brake balance forward (~70%) — lets you brake mid-drift without snapping",
    ],
    watchOut:
      "Too much power without control. A sustained controlled slide at moderate angle scores far better than a violent snap at high angle. Build confidence first, add power later.",
    parameters: {
      tirePressurePSI:   "Rear: toward minimum for less grip. Front: stock-ish",
      camberFront:       "−5.0° (full negative — keeps front biting through big steering angles)",
      camberRear:        "−1.0° (keeps usable rear contact patch)",
      caster:            "Maximum (~7°) — best self-centering for transitions",
      arbNote:           "Soft but not fully soft (~8 both ends). Not the max-then-soften road approach — drift starts soft",
      springs:           "Mid range (~400 lb/in), match front and rear for consistency",
      damping:           "Soft both ends (~4 bump and rebound front and rear)",
      diffRWD:           "100% accel locked / ~10% decel (low)",
      brakeBalance:      "~70% forward — essential for mid-drift braking without snap",
      aeroBalance:       "Minimal or removed — downforce fights oversteer",
      note:              "RWD mandatory. AWD can drift but never feels natural and doesn't score well",
    },
  },

  {
    raceTypeId: 'drift',
    division:   'Modern Sports Cars',
    philosophy:
      "RWD modern sports cars make excellent drift builds. The tune unlocks the natural oversteer tendency in a controlled way. Keep stock drivetrain — AWD conversion kills the drift potential.",
    spectrum:
      "GR86, BRZ, and Z are natural drift platforms. Heavier RWD sports cars (Supra) need more power to initiate but hold angle better once sliding.",
    priorities: [
      "Keep RWD — no AWD conversion",
      "Differential — 100% accel locked / ~10% decel",
      "Rear ARB soft, front ARB slightly stiffer (~8 both, lean front stiffer)",
      "Rear springs softer than front",
      "Power before aero — drift doesn't need downforce",
    ],
    watchOut:
      "Fitting aero for drift builds. Downforce fights oversteer — skip it and spend the PI on power and suspension.",
    parameters: {
      tirePressurePSI:   "Rear: toward minimum. Front: stock-ish",
      camberFront:       "−4.0° to −5.0°",
      camberRear:        "−1.0°",
      caster:            "Maximum",
      arbNote:           "Soft both ends. Front slightly stiffer than rear",
      diffRWD:           "100% accel locked / ~10% decel",
      brakeBalance:      "~70% forward",
    },
  },

  {
    raceTypeId: 'drift',
    division:   'Classic Muscle',
    philosophy:
      "Classic muscle cars are natural drift candidates — RWD, torquey, and often loose from the factory. The tune tames the worst tendencies while preserving the character.",
    spectrum:
      "Big-block classics have brutal torque that initiates violently. Small-block classics are more controllable. Tune big blocks with lower diff accel to smooth out the delivery.",
    priorities: [
      "Differential — lower accel than modern drift cars (~65–80%) to manage torque delivery",
      "Rear ARB very soft — classic muscle chassis needs compliance",
      "Brake balance slightly toward rear for initiation",
      "Softer rear springs",
      "Keep power in a controllable range",
    ],
    watchOut:
      "Maximum power builds on classic muscle. Heavy chassis and old suspension geometry mean too much power creates unpredictable rather than fast drifts.",
    parameters: {
      tirePressurePSI:   "Rear: toward minimum. Front: stock-ish",
      camberFront:       "−4.0° to −5.0°",
      camberRear:        "−1.0°",
      arbNote:           "Very soft both ends — classics need chassis compliance",
      diffRWD:           "65–80% accel / ~10% decel — lower than modern drift cars to manage torque",
      brakeBalance:      "55–65% forward — slightly less forward than modern drift cars",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUGE RACING
  // Key principles: Bump < Rebound rule. Springs 20–25% softer than road
  // baseline. AWD rain meta (Japan rains frequently). Short gearing.
  // Brake balance 50–52% forward (neutral for downhill trail braking).
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'touge',
    division:   'Classic Sports Cars',
    philosophy:
      "Classic sports cars are the soul of touge racing. Lightweight, communicative, naturally suited to narrow mountain passes where precision beats power. The AE86 and early MX-5 belong here. Tune to feel — these cars tell you everything if you let them.",
    spectrum:
      "The lightest classics (AE86, early MX-5, Lotus Elan) are the best touge cars at their PI class. They rotate naturally, brake short, and recover quickly from mistakes.",
    priorities: [
      "Race brakes — the most important single upgrade for touge",
      "Brake balance 50–52% forward — neutral for downhill trail braking",
      "Race or semi-slick tires — compound is critical on mountain passes",
      "Springs 20–25% softer than your road racing baseline — mountain roads are uneven",
      "Short final drive — straights are too short to need top speed",
    ],
    watchOut:
      "Using your road racing tune without changes. A stiff circuit setup bounces off-line on mountain drainage dips and cracked surfaces — the Bump < Rebound rule matters here.",
    parameters: {
      tirePressurePSI:   "30–33 PSI cold",
      camberFront:       "−1.5° to −2.0° (more aggressive than road for hairpin turn-in)",
      camberRear:        "−1.0° to −1.5°",
      caster:            "6.5–7.0° (strong self-centering helps on downhill)",
      arbNote:           "Max both. Soften toward 0.55–0.65 mechanical balance. Use softer overall than your road setup",
      springs:           "20–25% softer than road racing baseline. A stiff road tune bounces off every drainage dip",
      damping:           "Bump at 60–70% of rebound value (the Bump < Rebound rule). If bump is 5.0, rebound should be ~7.0–8.0",
      diffRWD:           "55% accel / 25% decel — higher decel than road racing for downhill stability",
      diffAWD:           "Front: 85%/0% · Rear: 55%/25% (higher decel) · Center: 70–80% rear bias",
      brakeBalance:      "50–52% forward — neutral for trail braking into downhill hairpins",
      note:              "AWD recommended in wet conditions. Japan rains frequently — RWD loses rear grip on wet downhill sections",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Modern Sports Cars',
    philosophy:
      "Modern sports cars on touge routes have more power than classics but still reward precision over aggression. The goal is making a faster car feel as confidence-inspiring as a lighter one — that means brakes, tires, and suspension before anything else.",
    spectrum:
      "GR86, BRZ, and Z are natural touge picks — RWD, balanced, light enough to rotate cleanly. Heavier turbocharged options (Supra, Z4) carry more risk on tight hairpins. Keep RWD — AWD conversions add understeer that hurts on narrow mountain roads.",
    priorities: [
      "Race brakes — non-negotiable on downhill touge sections",
      "Brake balance 50–52% forward",
      "Race tires — grip is the limiting factor, not power",
      "Springs 20–25% softer than road baseline",
      "Apply Bump < Rebound damping rule",
    ],
    watchOut:
      "Using a road racing tune without softening the springs. A stiff circuit setup packs down progressively through consecutive mountain corners, losing steering response by the time you reach the worst hairpins.",
    parameters: {
      tirePressurePSI:   "30–33 PSI cold",
      camberFront:       "−1.5° to −2.0°",
      camberRear:        "−1.0° to −1.5°",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Soften toward 0.55–0.65. Overall softer than road setup",
      springs:           "20–25% softer than road racing baseline",
      damping:           "Rebound 1.4–1.7× stiffer than bump. If bump = 5.0, rebound = 7.0–8.5",
      diffRWD:           "55% accel / 25% decel (higher decel for downhill stability)",
      brakeBalance:      "50–52% forward",
      note:              "AWD recommended in wet/rain. FWD viable at lower classes using trail braking technique",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Retro Sports Cars',
    philosophy:
      "Retro sports cars from the 80s and 90s sit in a sweet spot for touge — more power and technology than classics but still light and communicative. The RX-7, Silvia, and MR2 are all competitive here.",
    spectrum:
      "Mid-engine cars (MR2, AW11) have naturally planted rear ends but can snap on downhill hairpins if pushed past the limit. FR cars (Silvia, RX-7) are more forgiving and easier to rotate. The S13 Silvia's long wheelbase gives it predictable downhill control.",
    priorities: [
      "Race brakes — critical for consistent downhill hairpin braking",
      "Brake balance 50–52% forward",
      "Tire compound — bigger gain than almost anything else",
      "Springs 20–25% softer than road baseline",
      "Bump < Rebound damping rule",
    ],
    watchOut:
      "Big engine swaps on mid-engine cars. The MR2 is balanced around its stock power range. A 500hp swap makes it difficult to control at the hairpin limits.",
    parameters: {
      tirePressurePSI:   "30–33 PSI cold",
      camberFront:       "−1.5° to −2.0°",
      caster:            "6.5–7.0°",
      arbNote:           "Max both. Softer than road setup",
      springs:           "20–25% softer than road baseline",
      damping:           "Rebound stiffer than bump — prevents packing down through consecutive corners",
      diffRWD:           "55% accel / 25% decel",
      brakeBalance:      "50–52% forward",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Hot Hatch',
    philosophy:
      "Hot hatches are underrated for touge at lower PI classes. Light weight and short wheelbase help them rotate through hairpins faster than larger cars. FWD models need trail braking technique to rotate — without it they understeer every time.",
    spectrum:
      "FWD hot hatches (Polo GTI, Fiesta ST, 208 GTi) rotate with trail braking and are competitive at B class. AWD hot hatches (Golf R, Focus RS) are more consistent in wet and benefit from the Japan rain meta.",
    priorities: [
      "Race brakes and 50–52% forward bias",
      "Race or semi-slick tires",
      "ARBs — softer front than rear to help FWD rotation",
      "Springs 20–25% softer than road baseline",
      "Short gearing",
    ],
    watchOut:
      "Expecting grip-car behavior on downhill FWD hairpins without trail braking. Trail braking is mandatory technique for FWD touge — if you're not using it, the car will understeer every time regardless of tune.",
    parameters: {
      tirePressurePSI:   "30–33 PSI cold",
      camberFront:       "−1.5° to −2.0°",
      arbNote:           "Max both. Soften front more than rear — helps FWD rotation",
      springs:           "20–25% softer than road baseline",
      damping:           "Rebound stiffer than bump",
      diffFWD:           "80–85% accel / 0% decel",
      brakeBalance:      "50–52% forward",
    },
  },

  {
    raceTypeId: 'touge',
    division:   'Drift Cars',
    philosophy:
      "Drift cars on touge is a high-skill approach that works. Dial back the drift tune significantly — the rotation that scores in drift zones will put you off the road on downhill hairpins.",
    spectrum:
      "Purpose-built drift cars with moderated diff settings make excellent touge machines for experienced drivers. The rotation is there naturally; the task is keeping it on the narrow road.",
    priorities: [
      "Dial back differential accel to 65–70% — much lower than your drift tune",
      "Increase differential decel to 25–30% for downhill stability",
      "Race brakes — more important here than in drift zones",
      "Apply Bump < Rebound damping rule — critical on mountain roads",
      "Springs 20–25% softer than any road setup",
    ],
    watchOut:
      "Running a pure drift tune on touge. Reduce diff accel from 100% to 65–70% before the first run. The rest follows from there.",
    parameters: {
      diffRWD:       "65–70% accel / 25–30% decel — significantly lower than drift tune",
      brakeBalance:  "50–55% forward — more forward than drift setup",
      damping:       "Rebound stiffer than bump (Bump < Rebound rule)",
      springs:       "20–25% softer than any road setup",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAG RACING
  // Note: Almost everything here inverts the grip/circuit advice.
  // Do not mix and match drag and circuit tunes.
  // Drag damping pattern: stiff front bump + stiff rear rebound (opposite of grip).
  // ═══════════════════════════════════════════════════════════════════════════

  {
    raceTypeId: 'drag',
    division:   'Modern Muscle',
    philosophy:
      "Modern muscle cars are natural drag builds — high torque, RWD or AWD, straight-line focused. Tune is simple: maximize launch traction, gear for the powerband, remove anything that adds drag without adding power. Most drag races are won or lost in the first two seconds.",
    spectrum:
      "AWD muscle (Cadillac CT5-V Blackwing) has the traction advantage. RWD muscle (ZL1, GT500, ZR1) needs more skill to launch cleanly. AWD is generally quicker — pick based on whether you want pace or character.",
    priorities: [
      "Drag compound tires, widest rear available, skinniest front",
      "AWD conversion if RWD stock — traction wins drag races consistently",
      "Tune 1st gear for the launch — small changes only (5 ticks can flip a clean launch to wheelspin)",
      "Final drive — adjust so you're at or near the top of 3rd gear at the finish line",
      "Remove all aero — downforce is drag on a straight",
    ],
    watchOut:
      "Poor final drive ratio. If you're leading then getting caught, lengthen the final drive. If you're hitting the rev limiter before the finish, shorten it. Tune 1st gear for launch before touching the final drive.",
    parameters: {
      tirePressurePSI:   "Front: maximum. Rear: minimum — maximum sidewall flex for launch bite",
      camberFront:       "Slight negative",
      camberRear:        "Slight positive",
      caster:            "Maximum",
      arbNote:           "Stiff both ends — no cornering loads in drag",
      springs:           "Soft both ends — rear squats on launch for weight transfer",
      rideHeight:        "Maximum both ends",
      damping:           "Stiff front bump + stiff rear rebound. Soft rear bump + soft front rebound. This is the OPPOSITE of the grip damper setup",
      diffRWD:           "~85% accel / doesn't matter for decel",
      diffAWD:           "~85% accel / doesn't matter for decel",
      brakeBalance:      "Leave at default — irrelevant for drag",
      aeroBalance:       "Remove all aero or set to minimum",
      note:              "Build starts in the upgrade shop, not the tuning menu. Engine swap, AWD conversion, max power, drag tires, lightest wheels, weight reduction — these are the build. Tuning is final polish.",
    },
  },

  {
    raceTypeId: 'drag',
    division:   'Classic Muscle',
    philosophy:
      "Classic muscle has massive torque and RWD which makes it exciting but inconsistent on drag strips. The tune is about controlling the launch — getting power to the ground without spinning through the first two gears.",
    spectrum:
      "Big-block classics (Chevelle SS 454, Charger R/T, Mustang Mach 1) have brutal torque that spins violently without careful tuning. Small-block classics are more manageable. AWD conversions are worth considering for competitive big-block builds.",
    priorities: [
      "Drag tires — essential for managing the torque",
      "Tune 1st gear for the launch — goal is hard launch with controllable wheelspin",
      "Final drive — most classic muscle is geared too long from stock for a quarter mile",
      "Soft suspension — weight transfer to rear helps launch traction",
      "Weight reduction — classic muscle is heavy from the factory",
    ],
    watchOut:
      "Wheelspin through the first two gears. This is the number one drag killer on classic muscle. Run drag tires first. If still spinning, lengthen 1st gear in small increments.",
    parameters: {
      tirePressurePSI:   "Rear: minimum. Front: maximum",
      arbNote:           "Stiff both ends",
      springs:           "Soft both ends — rear squat for launch",
      rideHeight:        "Maximum",
      damping:           "Stiff front bump + stiff rear rebound (drag pattern — opposite of grip)",
      diffRWD:           "~85% accel",
      aeroBalance:       "Remove all aero",
    },
  },

  {
    raceTypeId: 'drag',
    division:   'Modern Supercars',
    philosophy:
      "Modern supercars at high PI are extremely competitive in drag — they have the power, AWD traction, and launch systems to post elite times. The tune is mostly gearing optimization and weight reduction.",
    spectrum:
      "AWD supercars (Huracán, GT-R, 911 Turbo S) are the safest drag builds. Mid-engine RWD supercars can be very quick with precise launches but are riskier. At this level, gearing is the differentiator — the power is already there.",
    priorities: [
      "Drag tires — widest rear, skinniest front",
      "Final drive and individual gear ratios — tune for your specific strip length",
      "Maximum weight reduction",
      "Remove all aero",
      "Launch control settings — critical at supercar power levels",
    ],
    watchOut:
      "Ignoring individual gear ratios. At supercar PI the powerband is narrow. Stock gearing rarely matches it for a drag strip. Race transmission with ratio tuning is worth the PI cost.",
    parameters: {
      tirePressurePSI:   "Rear: minimum. Front: maximum",
      arbNote:           "Stiff both ends",
      springs:           "Soft both ends",
      rideHeight:        "Maximum",
      damping:           "Stiff front bump + stiff rear rebound (drag pattern)",
      diffAWD:           "~85% accel front and rear",
      aeroBalance:       "Remove all aero",
    },
  },

  {
    raceTypeId: 'drag',
    division:   'Hypercars',
    philosophy:
      "Hypercars are the top tier of drag racing. Electric and hybrid hypercars (Rimac Nevera) dominate because of instant torque from zero RPM. For combustion builds, gearing and launch are the deciding factors.",
    spectrum:
      "AWD hypercars (Chiron, Rimac Nevera, Gemera) launch more consistently. RWD hypercars (Jesko) have higher top-end speed but riskier launches. The Jesko is a top-speed machine — better on longer strips.",
    priorities: [
      "Gearing tuned specifically for your strip length and powerband",
      "Maximum weight reduction — non-negotiable",
      "Drag tires — widest rear, skinniest front",
      "Remove all aero",
      "Launch control — the difference between winning and losing at hypercar PI",
    ],
    watchOut:
      "Assuming the fastest car wins. A Jesko with wrong gearing loses to a Chiron with perfect gearing. Tune the gears for your specific strip length before anything else.",
    parameters: {
      tirePressurePSI:   "Rear: minimum. Front: maximum",
      arbNote:           "Stiff both ends",
      springs:           "Soft both ends",
      rideHeight:        "Maximum",
      damping:           "Stiff front bump + stiff rear rebound (drag pattern)",
      diffAWD:           "~85% accel front and rear",
      aeroBalance:       "Remove all aero",
    },
  },

  {
    raceTypeId: 'drag',
    division:   'Retro Muscle',
    philosophy:
      "Retro muscle is a mid-range drag option — less power than modern muscle but more character. The tune is straightforward: control the torque, gear correctly, remove weight and drag.",
    spectrum:
      "The Buick GNX, Fox-body Mustang, and early Camaro Z28 are the best retro drag picks. The GNX is an excellent B class build — turbocharged, relatively lightweight, surprisingly grippy with drag tires.",
    priorities: [
      "Drag tires",
      "Final drive — most retro muscle is geared too long from stock",
      "Tune 1st gear for launch before touching anything else",
      "Weight reduction",
      "AWD conversion for consistent launches if PI allows",
    ],
    watchOut:
      "Running stock gearing on retro muscle. These cars were geared for highway cruising. The final drive almost always needs shortening for quarter-mile distances.",
    parameters: {
      tirePressurePSI:   "Rear: minimum. Front: maximum",
      springs:           "Soft both ends",
      rideHeight:        "Maximum",
      damping:           "Stiff front bump + stiff rear rebound (drag pattern)",
      diffRWD:           "~85% accel",
      aeroBalance:       "Remove all aero",
    },
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
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

export function getGuidesByRaceType(raceTypeId: string): TuningGuide[] {
  return TUNING_GUIDES.filter((g) => g.raceTypeId === raceTypeId)
}

export function getGuidesByDivision(division: string): TuningGuide[] {
  return TUNING_GUIDES.filter((g) => g.division === division)
}

// ─────────────────────────────────────────────────────────────────────────────
// Division fallback guides
// Shown when no race-type-specific guide exists for a car's division.
// Content source: Forza Garage Build & Upgrade Guide (Jun 2026).
// ─────────────────────────────────────────────────────────────────────────────

export interface DivisionGuide {
  /** One or more division strings this guide applies to */
  divisions: string[]
  philosophy: string
  priorities: string[]
  watchOut: string
}

export const DIVISION_GUIDES: DivisionGuide[] = [
  {
    divisions: ['Modern Supercars', 'Hypercars', 'Retro Supercars'],
    philosophy: 'Supercars are already engineered near the edge of what\'s possible. Your job is refinement, not transformation. The stock chassis is already stiff — start close to stock and adjust by feel.',
    priorities: [
      'Race suspension to unlock full tuning — don\'t change spring rates drastically from stock; balanced front/rear rates suit most supercars',
      'Slick or semi-slick tires — at S1 and S2, full slick is standard',
      'Always fit aero — these cars are fast enough that downforce makes a measurable difference',
      'Race diff — RWD: 40–55% acceleration / 20–35% deceleration. AWD: 70–80% rear centre bias. These cars produce enormous power and the diff manages where it goes',
      'Damping: rebound 9–11, bump 5–7 as a starting point — stiffer than sports cars to control the extra mass at speed',
      'Weight reduction before engine upgrades — chassis work first',
    ],
    watchOut: 'Many supercars are naturally tail-happy. A slightly stiffer rear ARB helps stability, but test the car first — some of that oversteer character is intentional.',
  },
  {
    divisions: ['Modern Sports Cars', 'Classic Sports Cars', 'Retro Sports Cars'],
    philosophy: 'Sports cars are the most versatile cars in the game. They can compete across multiple disciplines if built correctly for each one. Road racing is balanced around them.',
    priorities: [
      'Race suspension, semi-slick tires, light weight reduction, race diff for road and street — Race diff over Sport diff at A class and above',
      'Race diff tuning: RWD 40–55% acceleration / 20–35% deceleration — lower end for technical circuits, higher for flowing layouts',
      'Rally suspension, rally tires, AWD (if convertible) for dirt — competitive at B and A class',
      'Most sports cars sit naturally at A class — don\'t push to S1 without tuning the chassis to match',
      'Prioritise chassis upgrades over engine power when PI is tight',
    ],
    watchOut: 'A well-tuned A class sports car is often faster than a poorly tuned S1 version of the same car. Build within the class before pushing up.',
  },
  {
    divisions: ['Hot Hatch', 'Super Hot Hatch', 'Retro Hot Hatch'],
    philosophy: 'Hot hatches are deceptively competitive at B and A class. They\'re light, nimble, and often have strong stock handling. Don\'t ruin that by over-upgrading.',
    priorities: [
      'Race suspension at A class and above for full tuning access. At B class, Sport suspension is acceptable if Race costs too much PI — but it limits tuning sliders',
      'Semi-slick at A class — sport tires at B class are often more PI-efficient',
      'FWD hot hatches: fit a race diff and tune to 20–30% acceleration lock — this directly reduces understeer on exit without the PI cost of AWD conversion',
      'Stiff rear ARB and brake bias slightly forward (55–60%) compensates well for remaining FWD understeer',
      'Prioritise chassis upgrades over power — these cars win on handling and braking',
    ],
    watchOut: 'Most hot hatches peak naturally at A class. Pushing to S1 usually requires power upgrades that change the car\'s character significantly.',
  },
  {
    divisions: ['Modern Muscle', 'Classic Muscle', 'Retro Muscle'],
    philosophy: 'Muscle cars are built around torque and straight-line power. They\'re heavier and less nimble than sports cars — tuning should compensate for their weaknesses, not amplify them.',
    priorities: [
      'Race suspension — manages weight and torque under hard acceleration',
      'Wide rear tires, slick or semi-slick at A class and above — traction is always the limit',
      'Race diff: RWD 55–70% acceleration / 20–35% deceleration — higher acceleration lock than sports cars puts the torque to the ground',
      'Damping: rebound 10–12, bump 6–8 — muscle cars carry more weight and need firmer control over body movement',
      'RWD is the natural state — manage it with diff tuning and throttle discipline rather than converting to AWD',
      'Use their straight-line speed advantage in road racing — don\'t ask them to corner like a sports car',
    ],
    watchOut: 'Soft springs let the rear squat on launch and waste power. Stiffer rear springs than you\'d expect are often the right call.',
  },
  {
    divisions: ['GT Cars', 'Super GT', 'Modern Super Saloons', 'Retro Super Saloons'],
    philosophy: 'GT cars and saloons are about stability and consistency. They\'re heavier than sports cars but carry speed through corners better than you\'d expect. Build for their strengths.',
    priorities: [
      'Race suspension for full tuning access — required for camber, spring rates, and damping sliders',
      'Balanced spring rates front and rear — GT cars don\'t need front-soft/rear-stiff; balanced rates suit their weight distribution better',
      'Slick tires at S1 and above; semi-slick at A — GT cars put high loads through tires',
      'Fit aero early — it\'s one of the most PI-efficient upgrades for this division',
      'Race diff: RWD 40–55% acceleration / 20–35% deceleration — consistent corner exits matter more than peak power with a heavy car',
      'Weight reduction and chassis work are usually more PI-efficient than further engine upgrades',
    ],
    watchOut: 'GT cars are competitive at S1 and R class road racing. At lower PI classes they often can\'t match the lap times of purpose-built sports cars of the same rating.',
  },
  {
    divisions: ['Track Toys', 'Extreme Track Toys'],
    philosophy: 'Track cars are purpose-built and require minimal upgrade philosophy — they\'re already configured for one discipline. Tune them, don\'t upgrade them.',
    priorities: [
      'Forza Edition and purpose-built track cars are often near-maxed — adjust settings, not parts',
      'Aero balance first — target 40–45% front. These cars generate significant downforce and the balance is critical',
      'Race diff: 40–55% acceleration / 20–35% deceleration — track cars need precise diff tuning to match their extreme grip levels',
      'Extreme Track Toys are road race spec — don\'t use them off-tarmac',
      'Tire pressure and aero balance will give you more lap time than any part upgrade',
    ],
    watchOut: 'Formula Drift cars in Track Toys are built exclusively for drift zones. Don\'t try to road race them — the setup is completely wrong for grip driving.',
  },
  {
    divisions: ['Rally Monsters', 'Classic Rally', 'Retro Rally', 'Modern Rally'],
    philosophy: 'Rally cars are bred for loose surfaces. Their value is in off-tarmac disciplines. Don\'t waste PI trying to make them road race competitive.',
    priorities: [
      'Rally or off-road suspension — if not already fitted, that\'s the first upgrade',
      'Rally tires for dirt; off-road for cross country — never slick or semi-slick',
      'AWD is the strongest choice — centre diff bias 70–80% rear for loose surfaces. FWD can be competitive at lower classes',
      'Loose surface diff: 30–50% acceleration / 20–30% deceleration — softer than road racing to prevent wheelspin on dirt',
      'Moderate engine upgrades — traction limits output on loose surfaces before power does',
      'A well-built rally car can compete in both dirt racing and cross country — best budget off-road option',
    ],
    watchOut: 'Rally cars are slow on tarmac compared to purpose-built road cars of the same PI. Keep them off asphalt.',
  },
  {
    divisions: ['Unlimited Offroad', 'Offroad', 'Buggies', 'Unlimited Buggies', 'UTVs', "Pickups & 4x4s", 'Sports Utility Heroes', 'Utility Heroes'],
    philosophy: 'Off-road cars are built for cross country dominance. They have the suspension travel and durability that other categories don\'t — build around that strength.',
    priorities: [
      'Off-road suspension already standard — tune for maximum travel and compliance',
      'ARBs near minimum (front and rear 1–3) — the car needs to articulate freely over uneven ground; stiff ARBs cause wheel lift and unpredictable handling',
      'Off-road compound tires only',
      'AWD is standard — centre diff bias 70–80% rear. These cars are designed around it',
      'Diff: 50–70% acceleration / 20–35% deceleration — more aggressive than road racing to drive through loose terrain',
      'More engine PI is justified here — cross country routes have long fast sections where power matters',
    ],
    watchOut: 'Off-road cars can compete in dirt racing but Rally cars are often faster — Rally suspension is better optimised for racing on loose roads than pure off-road suspension.',
  },
  {
    divisions: ['Drift Cars'],
    philosophy: 'Drift cars are single-purpose. A great drift build is useless in road racing and vice versa. Don\'t try to hybrid them.',
    priorities: [
      'RWD — non-negotiable for a proper drift build',
      'Drift compound rear, semi-slick or slick front — the mismatch is intentional',
      'Locked rear diff — near 100% both acceleration and deceleration. Consistent, predictable oversteer requires a fully locked rear',
      'Alignment: front camber –4° to –5°, rear camber –0.5° to –1°, toe 0.1–0.2° out front for turn-in, caster at or near maximum',
      'Brake bias 55–58% rear — helps initiate slides on entry without destabilising the front',
      'High torque sustains slide angle — don\'t under-power a drift build',
      'Front aero for steering grip; rear wing for stability at high drift speeds',
    ],
    watchOut: 'Drift zone scoring is based on angle, speed, and proximity to the line. A car set up for maximum angle beats one set up for maximum speed.',
  },
]

/**
 * Returns a division-level fallback guide when no race-type-specific guide exists.
 * Matches on any of the guide's listed divisions.
 */
export function getDivisionFallback(division: string): DivisionGuide | null {
  return DIVISION_GUIDES.find((g) => g.divisions.includes(division)) ?? null
}