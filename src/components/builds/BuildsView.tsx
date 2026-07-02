'use client'

import { useState } from 'react'
import { RACE_BUILD_GUIDES, PI_CLASS_GUIDES } from '@/lib/buildGuides'

// ─── Feature flags ────────────────────────────────────────────────────────────
const SHOW_FUNDAMENTALS = false

type Tab = 'fundamentals' | 'race' | 'class' | 'regions'

// ─── Static content ───────────────────────────────────────────────────────────

const SUSPENSION_TIERS = [
  {
    tier: 'Stock',
    desc: 'No tuning sliders unlocked. Acceptable at D class where PI cost matters more than tuning access.',
  },
  {
    tier: 'Street',
    desc: 'Usually unlocks tire pressure only. Limited benefit beyond stock.',
  },
  {
    tier: 'Sport',
    desc: 'In most cars, keeps alignment, spring rate, damping, and ride height locked. Saves PI vs Race but significantly limits what you can tune. Only worth it if PI is extremely tight.',
  },
  {
    tier: 'Race',
    desc: 'Unlocks the full tuning suite: camber, toe, caster, spring rate, ride height, bump and rebound damping. This is what you need to properly tune a car.',
    highlight: true,
  },
]

const TUNING_ORDER = [
  { step: 'Tires', detail: 'Compound and pressure first. Everything else builds on grip.' },
  { step: 'Springs & ride height', detail: 'Establish the car\'s weight transfer behaviour.' },
  { step: 'Camber, toe, caster', detail: 'Alignment tuning only makes sense once springs are set.' },
  { step: 'Anti-roll bars', detail: 'Balance mechanical grip front-to-rear.' },
  { step: 'Damping', detail: 'Control how fast the springs move, not how stiff they are.' },
  { step: 'Brakes', detail: 'Bias and pressure.' },
  { step: 'Differential', detail: 'Power delivery and rotation. AWD centre bias controls the front/rear power split — found in the differential tuning menu. 70–80% rear means more power goes to the rear wheels.' },
  { step: 'Aero', detail: 'Balance downforce once everything else is working.' },
  { step: 'Gearing', detail: 'Final step, matched to the specific track or discipline.' },
]

const DAMPING_DIAGNOSE = [
  { symptom: 'Car bounces after a jump or big bump', fix: 'Increase rebound' },
  { symptom: 'Car feels skittish or nervous over small road imperfections', fix: 'Soften bump' },
  { symptom: 'Car feels planted but slow to respond', fix: 'Reduce rebound slightly' },
]

const CORNER_PHASES = [
  {
    phase: 'Braking',
    sub: 'straight-line approach',
    settings: 'Brake bias, brake pressure, front bump damping, front weight',
    problems: 'Instability under braking, nose-diving, locking wheels',
  },
  {
    phase: 'Turn-in',
    sub: 'first steering input',
    settings: 'Camber, caster, front rebound damping, deceleration diff lock, front ARB',
    problems: 'Car won\'t rotate, turn-in feels dead or too sharp',
  },
  {
    phase: 'Mid-corner',
    sub: 'steady cornering load',
    settings: 'ARBs (both), spring rates, ride height, aero downforce balance',
    problems: 'Car drifts wide through the corner, inconsistent balance',
  },
  {
    phase: 'Exit',
    sub: 'power applied',
    settings: 'Acceleration diff lock, rear springs/ARB, rear damping, rear toe',
    problems: 'Rear steps out under throttle, car won\'t put power down cleanly',
  },
]

const REGIONS: {
  name: string
  icon: string
  desc: string
  tuning: string[]
  piRange: string
  cars: string
  districts?: { name: string; char: string }[]
  span2?: boolean
}[] = [
  {
    name: 'Tokyo City',
    icon: '🏙️',
    span2: true,
    desc: 'The largest urban environment in any Horizon game. Split into four distinct districts, each with different racing characteristics.',
    districts: [
      { name: 'Downtown Core / C1 Loop', char: 'Tight, fast, punishing. Hard braking, narrow lanes, right-angle intersections.' },
      { name: 'Waterfront / Industrial Island', char: 'Wider sweeping curves and port roads. More forgiving, suits higher-speed builds.' },
      { name: 'Commercial Districts', char: 'Neon-lit multi-level interchanges. Multi-layered elevation changes.' },
      { name: 'Residential Outskirts', char: 'Where Tokyo meets countryside. Wider roads, gentler.' },
    ],
    tuning: [
      'Short gearing — Tokyo never gets fast enough to need top-end speed, corner exits win',
      'Stiff rear ARB — prevents understeer through the C1\'s tight exits',
      'Upgrade brakes — Tokyo demands late, hard braking consistently',
      'Semi-slick or slick compound — tarmac everywhere, grip is rewarded',
      'AWD advantage in the city — short acceleration zones reward traction over top speed',
      'Brake bias forward (53–55%)',
    ],
    piRange: 'A (600–699) and S1 (700–799) for street racing. B class (500–599) for tighter city events.',
    cars: 'Compact sports cars, hot hatches, JDM street cars. Long-wheelbase hypercars and supercars struggle with the city\'s narrow geometry.',
  },
  {
    name: 'Ohtani — Starting Zone',
    icon: '🏠',
    desc: 'Your home base. Mixed terrain transitioning from flat plains into low hills and forested roads. The most varied region for race types.',
    tuning: [
      'A balanced road build works here more than any other region — no extreme adaptations needed',
      'Semi-slick tires cover most events',
      'AWD is broadly useful given the surface variety',
      'Medium spring rates — neither the stiffest tarmac setup nor the softest rally setup',
    ],
    piRange: 'All classes — Ohtani has events at every level as the starting region.',
    cars: 'Versatile all-rounders. This is where you learn what your car can and can\'t do before specialising.',
  },
  {
    name: 'Minamino — Southern Plains',
    icon: '🌾',
    desc: 'The flattest region. Wide-open fields, agricultural land, and the longest uninterrupted straight roads on the map. Speed zone and drag racing territory.',
    tuning: [
      'Long final drive gearing — maximize top speed on the straights',
      'Minimize aero drag if competing in speed zones — downforce costs top speed',
      'AWD for drag events — launch traction is the limiting factor',
      'Race transmission with ratios tuned for maximum acceleration through gears',
      'Weight reduction — every kilogram costs time in a straight line',
    ],
    piRange: 'Any class for drag events. S2 and R produce the fastest speed zone times.',
    cars: 'Muscle cars, high-power AWD builds, drag-spec cars. Anything optimised for straight-line performance.',
  },
  {
    name: 'Nangan — Far South (Coastal)',
    icon: '🏖️',
    desc: 'The southernmost region, bordering the coast. Open terrain with good visibility and wide beaches. Fewer tight sections than most regions.',
    tuning: [
      'Mid-range gearing — balance between acceleration and top speed',
      'Semi-slick on the coastal tarmac sections',
      'Rally or off-road compound for beach and open cross-country sections',
      'Moderate spring rates — the terrain is varied but not extreme',
    ],
    piRange: 'B (500–599) and A (600–699). Open terrain rewards well-rounded builds over specialists.',
    cars: 'Versatile sports cars and rally cars that can handle both tarmac and light off-road sections without specialised builds.',
  },
  {
    name: 'Ito — Coastal Mid-Band',
    icon: '🌊',
    desc: 'The middle section between the southern plains and northern highlands. Mixed terrain — seawall roads, wooded hills, and crossroad junctions.',
    tuning: [
      'Semi-slick tires for the tarmac majority',
      'AWD helps on the mixed-surface transitions',
      'Medium-stiff suspension — the roads vary enough that extremes don\'t suit',
      'Brake bias neutral to slightly forward',
    ],
    piRange: 'B (500–599) and A (600–699).',
    cars: 'Sports cars and compact GTs that can carry pace through varied conditions without needing a rebuild between events.',
  },
  {
    name: 'Hokubu — Northern Circuit',
    icon: '🏁',
    desc: 'The northern region wrapping around the approach to the Alps. The roads become technical — tighter turns, steeper gradients, occasional gravel mixed into paved routes.',
    tuning: [
      'Race suspension, properly tuned — gradient changes put real load through the chassis',
      'Brakes upgraded — the downhill sections require confident late braking',
      'Semi-slick or slick compound depending on PI class',
      'Front camber –1.5° to –2.0° for tarmac grip through the technical sections',
      'Differential tuned for rotation — Hokubu\'s corners reward rotation over planted exits',
    ],
    piRange: 'A (600–699) and S1 (700–799). Circuit events here suit the upper half of each class.',
    cars: 'GT cars, sports cars with proper suspension tuning. Cars with good braking stability are especially valuable on the descents.',
  },
  {
    name: 'Takashiro — Highland Passes',
    icon: '⛰️',
    desc: 'Mountain territory. Narrow roads carved into hillsides with blind corners, elevation drops, and guardrails as the only safety net. Pure touge.',
    tuning: [
      'Race suspension, front slightly softer than rear — rotation into hairpins is essential',
      'Short gear ratios — the speed range never gets high',
      'Full race brakes — late, hard braking into hairpins is the core skill',
      'Brake bias forward (54–57%) — Takashiro demands confident trail braking',
      'Neutral to mild differential (30–40% accel) — rotation matters more than planted exits',
      'Semi-slick over slick on the tightest passes — full slick grip can cause understeer through very tight hairpins at low speed',
      'Strip weight aggressively — faster direction changes through the hairpin sequences',
      'Negative front camber –1.5° to –2.0° for corner grip',
    ],
    piRange: 'B (500–599) up to A (600–699). Class caps vary per route — check the specific event before building.',
    cars: 'Lightweight sports cars, JDM sports cars (RX-7, Supra, NSX, WRX), compact RWD cars with good rotation. Avoid long-wheelbase supercars — they physically struggle with Takashiro\'s narrow geometry.',
  },
  {
    name: 'Shimanoyama — Alpine Zone',
    icon: '❄️',
    desc: 'The highest elevation region. Snow-capped peaks, alpine forests, and winding roads that test car control in low-grip conditions. Snow is common.',
    tuning: [
      'AWD — individual wheel grip is dramatically reduced in snow and ice conditions',
      'Rally tires for snow/mixed conditions — designed for the grip range',
      'Soft spring rates — compliance over snow and uneven alpine surfaces',
      'Lower tire pressure (26–28 PSI cold) — more contact patch on slippery surfaces',
      'Soft ARBs — wheels need to work independently on the uneven alpine terrain',
      'Moderate power — traction limits output in low-grip conditions, raw power is wasted',
    ],
    piRange: 'B (500–599) and A (600–699). High-PI builds can\'t use their power advantage in low-grip conditions.',
    cars: 'AWD rally cars (WRX, Evo), all-wheel-drive sports cars, purpose-built snow/rally builds. RWD cars are at a significant disadvantage.',
  },
  {
    name: 'Sotoyama — Mountain Lodge',
    icon: '🏔️',
    desc: 'Home of the Hakusan Mountain Lodge (+10% credit house). Snow is common. Longer, more flowing mountain roads than Shimanoyama.',
    tuning: [
      'AWD recommended — snow conditions are common even outside winter season events',
      'Rally compound tires — the mixed surface between snow and tarmac suits rally compound',
      'Medium-soft suspension — more compliance than a tarmac build, less extreme than full off-road',
      'Soft ARBs — surface articulation matters',
      'Mid-range gearing — Sotoyama\'s roads are longer than Shimanoyama\'s tight passes',
    ],
    piRange: 'A (600–699). Sotoyama suits capable all-rounders over specialists.',
    cars: 'AWD sports cars and modern rally cars that can handle mixed conditions without a dedicated off-road build. The WRX, Evo, and GR Yaris are particularly well-suited.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuildsView() {
  // Default to 'race' while SHOW_FUNDAMENTALS is false — avoids an empty
  // initial render that makes the content area collapse and causes CLS.
  const [tab, setTab] = useState<Tab>(SHOW_FUNDAMENTALS ? 'fundamentals' : 'race')
  const [openRace, setOpenRace] = useState<string | null>(null)
  const [openClass, setOpenClass] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6 min-h-screen">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-fh-panel-2 rounded-lg p-1 w-fit">
        {(
          [
            ...(SHOW_FUNDAMENTALS ? [{ id: 'fundamentals' as Tab, label: 'Fundamentals' }] : []),
            { id: 'race',         label: 'By Race Type' },
            { id: 'class',        label: 'By PI Class'  },
            { id: 'regions',      label: 'Regions'      },
          ] as { id: Tab; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-fh-panel text-fh-dark shadow-sm'
                : 'text-fh-muted hover:text-fh-dark-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Fundamentals ─────────────────────────────────────────────────── */}
      {SHOW_FUNDAMENTALS && tab === 'fundamentals' && (
        <div className="flex flex-col gap-8 max-w-2xl">

          {/* Go Deeper — resource callout */}
          <div className="rounded-xl border border-fh-border bg-fh-panel px-5 py-4">
            <div className="text-[11px] text-fh-muted uppercase tracking-wide font-semibold mb-2">Go Deeper</div>
            <p className="text-sm text-fh-dark-2 leading-relaxed mb-3">
              This section covers the concepts behind the build guides. For full in-depth breakdowns with specific values:
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-fh-red/50 shrink-0 mt-1">—</span>
                <p className="text-fh-dark-2 leading-relaxed">
                  <a href="https://forza.guide" target="_blank" rel="noopener noreferrer" className="font-medium text-fh-dark underline underline-offset-2 hover:text-fh-red transition-colors">forza.guide</a>
                  {' '}— the most practical FH6 tuning reference. Covers every slider with specific values, diagnostic rules,
                  and a balance-first approach. First stop for any setting you want to go deeper on.
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-fh-red/50 shrink-0 mt-1">—</span>
                <p className="text-fh-dark-2 leading-relaxed">
                  <a href="https://forzatune.com/guide/the-fully-updated-forza-tuning-guide/" target="_blank" rel="noopener noreferrer" className="font-medium text-fh-dark underline underline-offset-2 hover:text-fh-red transition-colors">ForzaTune Tuning Guide</a>
                  {' '}— thorough walkthrough of every tuning category with telemetry-based methods for setting tire
                  pressure and camber correctly.
                </p>
              </div>
            </div>
          </div>

          {/* FH6 Meta Note */}
          <div className="rounded-xl border border-fh-amber/30 bg-fh-amber-pale px-5 py-4">
            <div className="text-[11px] text-fh-amber uppercase tracking-wide font-semibold mb-2">FH6 Meta Note</div>
            <p className="text-sm text-fh-dark-2 leading-relaxed">
              FH6&apos;s handling model rewards balanced, slightly compliant setups over the old Forza approach of stiff
              front / soft rear. Community testing has found that the soft-front / stiff-rear pattern — common in FH4
              and FH5 meta builds — creates inconsistent turn-in under trail-braking in FH6. Balanced spring rates with
              mild overall softness produce more consistent lap times, especially on FH6&apos;s rougher road surfaces.
              If a tune from a previous Forza game feels wrong, this is often why.
            </p>
          </div>

          {/* Mechanical Balance */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Mechanical Balance</h2>
            <p className="text-sm text-fh-muted mb-4">
              FH6 shows a Mechanical Balance reading in the tuning menu. It&apos;s one of the most useful tools the game
              gives you and most new players ignore it.
            </p>
            <p className="text-sm text-fh-dark-2 leading-relaxed mb-4">
              The number represents how grip is distributed between the front and rear of the car. Too high means the
              rear has relatively more grip (oversteer tendency). Too low means the front has more grip (understeer tendency).
            </p>
            <div className="rounded-lg border border-fh-blue/20 bg-fh-blue-pale px-4 py-3 mb-4">
              <div className="text-[11px] text-fh-blue uppercase tracking-wide mb-1">Target range</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                <span className="font-medium text-fh-dark">0.55–0.65.</span> Sweet spot: around <span className="font-medium text-fh-dark">0.60</span>.
              </p>
            </div>
            <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">How to use it</div>
            <div className="flex flex-col gap-1.5">
              {[
                'If your car understeers → front has less grip than the rear → soften the front ARB, reduce front spring stiffness, or add front aero',
                'If your car oversteers → rear has less grip → soften the rear ARB, reduce rear spring stiffness, or add rear aero',
                'Always fix the weak end — don\'t stiffen the strong end to compensate',
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-fh-red/50 shrink-0 mt-1">—</span>
                  <p className="text-fh-dark-2 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-fh-muted mt-3 leading-relaxed">
              The Mechanical Balance number updates in real time as you adjust ARBs and springs. Use it as your guide
              while making adjustments, not after.
            </p>
          </div>

          {/* Fix the Weak End */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Fix the Weak End</h2>
            <p className="text-sm text-fh-muted mb-4">
              Almost every handling problem comes down to one end of the car having less grip than the other.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="rounded-lg border border-fh-border bg-fh-panel px-4 py-3 flex gap-3">
                <span className="text-sm font-medium text-fh-dark shrink-0 w-24 pt-0.5">Understeer</span>
                <p className="text-sm text-fh-dark-2 leading-relaxed">Car won&apos;t turn, pushes wide → front has less grip → soften the front</p>
              </div>
              <div className="rounded-lg border border-fh-border bg-fh-panel px-4 py-3 flex gap-3">
                <span className="text-sm font-medium text-fh-dark shrink-0 w-24 pt-0.5">Oversteer</span>
                <p className="text-sm text-fh-dark-2 leading-relaxed">Rear steps out, car rotates too much → rear has less grip → soften the rear</p>
              </div>
            </div>
            <p className="text-sm text-fh-dark-2 leading-relaxed">
              The instinct is to stiffen the other end to compensate. This works temporarily but makes the car less
              predictable and harder to drive at the limit. Adding grip to the weak end is more consistent and easier
              to build on. This rule applies to ARBs, springs, and tire compound choices.
            </p>
          </div>

          {/* Suspension Tiers */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Suspension Tiers Explained</h2>
            <p className="text-sm text-fh-muted mb-4">
              Not all suspension tiers unlock the same tuning options. This matters more in FH6 than previous titles.
            </p>
            <div className="flex flex-col gap-2">
              {SUSPENSION_TIERS.map(({ tier, desc, highlight }) => (
                <div
                  key={tier}
                  className={`rounded-lg border px-4 py-3 flex gap-3 ${
                    highlight
                      ? 'border-fh-red/30 bg-fh-red/5'
                      : 'border-fh-border bg-fh-panel'
                  }`}
                >
                  <span className={`text-sm font-semibold w-16 shrink-0 pt-0.5 ${highlight ? 'text-fh-red' : 'text-fh-muted'}`}>
                    {tier}
                  </span>
                  <p className="text-sm text-fh-dark-2 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-fh-muted mt-3 leading-relaxed">
              <span className="font-medium text-fh-dark-2">Practical rule:</span> If the guide says &ldquo;tune your
              camber&rdquo; or &ldquo;adjust spring rates,&rdquo; you need Race suspension installed. Sport suspension
              will not give you those sliders in most cars.
            </p>
          </div>

          {/* Tuning Order */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Tuning Order</h2>
            <p className="text-sm text-fh-muted mb-4">
              Each setting affects the ones after it — changing order creates confusion about what&apos;s actually working.
            </p>
            <ol className="flex flex-col gap-2">
              {TUNING_ORDER.map(({ step, detail }, i) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="text-fh-red/60 font-mono shrink-0 w-5 pt-0.5">{i + 1}.</span>
                  <div>
                    <span className="font-medium text-fh-dark">{step}</span>
                    <span className="text-fh-muted"> — {detail}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-fh-muted mt-3 leading-relaxed">
              One change at a time. Run a lap between adjustments. Changing multiple settings simultaneously makes it
              impossible to know what worked.
            </p>
          </div>

          {/* Four Phases of a Corner */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Diagnosing Corner Problems</h2>
            <p className="text-sm text-fh-muted mb-4">
              A corner isn&apos;t one event — it&apos;s four. Different settings dominate each phase. When something
              feels wrong, identify which phase the problem happens in first. That tells you exactly which settings to adjust.
            </p>
            <div className="flex flex-col gap-2">
              {CORNER_PHASES.map(({ phase, sub, settings, problems }, i) => (
                <div key={phase} className="rounded-lg border border-fh-border bg-fh-panel px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-fh-red/60 font-mono text-xs shrink-0">{i + 1}.</span>
                    <span className="text-sm font-semibold text-fh-dark">{phase}</span>
                    <span className="text-xs text-fh-muted">{sub}</span>
                  </div>
                  <p className="text-xs text-fh-muted leading-relaxed mb-0.5">
                    <span className="text-fh-dark-2">Settings:</span> {settings}
                  </p>
                  <p className="text-xs text-fh-muted leading-relaxed">
                    <span className="text-fh-dark-2">Problems:</span> {problems}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-fh-muted mt-3 leading-relaxed">
              Most tuning guides give you values. This framework tells you where to look when those values don&apos;t
              feel right on your specific car.
            </p>
          </div>

          {/* Damping Basics */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Damping Basics</h2>
            <p className="text-sm text-fh-muted mb-4">
              Damping controls how fast your springs compress and extend — not how stiff they are. One of the
              highest-impact settings in FH6 and one of the least understood.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <div className="rounded-lg border border-fh-border bg-fh-panel px-4 py-3">
                <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-1">Bump damping</div>
                <p className="text-sm text-fh-dark-2 leading-relaxed">
                  Controls how fast the spring compresses when hitting a bump. Too high and the tire skips over
                  imperfections instead of following them. Too low and the car wallows.
                </p>
              </div>
              <div className="rounded-lg border border-fh-border bg-fh-panel px-4 py-3">
                <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-1">Rebound damping</div>
                <p className="text-sm text-fh-dark-2 leading-relaxed">
                  Controls how fast the spring extends after compression. Too high and the car stays planted but
                  doesn&apos;t recover quickly. Too low and the car bounces after jumps or kerbs.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-fh-blue/20 bg-fh-blue-pale px-4 py-3 mb-4">
              <div className="text-[11px] text-fh-blue uppercase tracking-wide mb-1">Starting point — mid-weight tarmac car (FH6 slider range 1–20)</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                Rebound: <span className="font-medium text-fh-dark">13–16</span> (your anchor value). Bump:{' '}
                <span className="font-medium text-fh-dark">40–55% of your rebound value</span> — if rebound is 14,
                bump starts at 5–8. Heavier cars (muscle, GT) typically need higher rebound; off-road builds stay near
                the soft end.
              </p>
            </div>
            <div>
              <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">Diagnosing problems</div>
              <div className="flex flex-col gap-1.5">
                {DAMPING_DIAGNOSE.map(({ symptom, fix }) => (
                  <div key={symptom} className="flex gap-3 text-sm">
                    <span className="text-fh-muted shrink-0 mt-0.5">→</span>
                    <p className="text-fh-dark-2 leading-relaxed">
                      <span className="italic">{symptom}</span>
                      <span className="text-fh-muted"> — {fix}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-fh-muted mt-3 leading-relaxed">
              <span className="font-medium text-fh-dark-2">Off-road exception:</span> Rally and off-road suspension
              comes deliberately soft from factory — leave damping near the soft end and use the diff and ARBs to tune
              balance instead.
            </p>
          </div>

          {/* Caster */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">Caster</h2>
            <p className="text-sm text-fh-muted mb-4">
              The angle of the steering axis viewed from the side of the car. Higher caster increases steering
              self-centering and generates more dynamic camber under cornering load — the wheel leans further into the
              corner, adding grip.
            </p>
            <p className="text-sm text-fh-dark-2 leading-relaxed mb-4">
              It&apos;s one of the most overlooked alignment settings because it&apos;s less intuitive than camber, but
              it has a meaningful effect on how the car feels through high-speed corners.
            </p>
            <div className="rounded-lg border border-fh-blue/20 bg-fh-blue-pale px-4 py-3 mb-3">
              <div className="text-[11px] text-fh-blue uppercase tracking-wide mb-1">Starting point — road race builds</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                <span className="font-medium text-fh-dark">5.5° to 6.5°.</span> Higher caster (toward 7°) suits cars with lighter
                steering feel that need more self-centering. Lower caster suits heavier cars or builds where steering weight is
                already high.
              </p>
            </div>
            <p className="text-xs text-fh-muted leading-relaxed">
              In most cases, set caster once based on the car&apos;s weight class and leave it. It rarely needs adjustment
              between builds on the same car.
            </p>
          </div>

          {/* FWD Brake Bias */}
          <div>
            <h2 className="text-base font-semibold text-fh-dark mb-1">FWD Brake Bias</h2>
            <p className="text-sm text-fh-muted mb-4">
              FWD cars need significantly more front brake bias than RWD or AWD. The default 50% balance leaves real
              stopping performance unused on front-wheel drive.
            </p>
            <div className="rounded-lg border border-fh-blue/20 bg-fh-blue-pale px-4 py-3 mb-3">
              <div className="text-[11px] text-fh-blue uppercase tracking-wide mb-1">Starting point for FWD</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                <span className="font-medium text-fh-dark">55–62% front bias.</span>
              </p>
            </div>
            <p className="text-xs text-fh-muted leading-relaxed">
              One of the most commonly missed adjustments on hot hatches and compact FWD sports cars. If a FWD car feels
              like it can&apos;t brake hard enough, or slides under braking rather than stopping cleanly, check the brake
              bias first.
            </p>
          </div>

        </div>
      )}

      {/* ── Race type guides ──────────────────────────────────────────────── */}
      {tab === 'race' && (
        <div className="flex flex-col gap-2">
          {RACE_BUILD_GUIDES.map((guide) => {
            const isOpen = openRace === guide.id
            return (
              <div key={guide.id} className="rounded-xl border border-fh-border bg-fh-panel overflow-hidden">
                <button
                  onClick={() => setOpenRace(isOpen ? null : guide.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-fh-panel-2 transition-colors"
                >
                  <span className="text-xl">{guide.icon}</span>
                  <span className="font-semibold text-fh-dark flex-1">{guide.name}</span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-fh-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 5l5 5 5-5" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-5 border-t border-fh-border">
                    {/* Upgrade path */}
                    <div className="pt-4">
                      <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-3">Upgrade path</div>
                      <div className="flex flex-col gap-2.5">
                        {guide.upgradePath.map((section) => (
                          <div key={section.label} className="flex gap-3 text-sm">
                            <span className="text-fh-red font-medium shrink-0 w-28 pt-0.5">{section.label}</span>
                            <div className="flex flex-col gap-1">
                              {section.items.map((item, i) => (
                                <p key={i} className="text-fh-dark-2 leading-relaxed">{item}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skip */}
                    <div>
                      <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">Skip</div>
                      <ul className="flex flex-col gap-1">
                        {guide.skip.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-fh-dark-2">
                            <span className="text-fh-muted mt-1 shrink-0">✕</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* PI targets */}
                    <div className="rounded-lg border border-fh-border bg-fh-panel-2 px-4 py-3">
                      <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-1">PI targets</div>
                      <p className="text-sm text-fh-dark-2 leading-relaxed">{guide.piTargets}</p>
                    </div>

                    {/* Tuning priorities */}
                    <div>
                      <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">Key tuning priorities once built</div>
                      <ol className="flex flex-col gap-1">
                        {guide.tuningPriorities.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-fh-dark-2">
                            <span className="text-fh-red/60 font-mono shrink-0 w-4">{i + 1}.</span>
                            {p}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── PI class guides ───────────────────────────────────────────────── */}
      {tab === 'class' && (
        <div className="flex flex-col gap-2">
          {PI_CLASS_GUIDES.map((guide) => {
            const isOpen = openClass === guide.id
            return (
              <div key={guide.id} className="rounded-xl border border-fh-border bg-fh-panel overflow-hidden">
                <button
                  onClick={() => setOpenClass(isOpen ? null : guide.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-fh-panel-2 transition-colors"
                >
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${guide.color} ${guide.textColor} tabular-nums shrink-0`}>
                    {guide.label}
                  </span>
                  <span className="text-sm text-fh-muted tabular-nums">{guide.range}</span>
                  <span className="flex-1" />
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-fh-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 5l5 5 5-5" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-4 border-t border-fh-border pt-4">
                    <div>
                      <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-1">Build focus</div>
                      <p className="text-sm text-fh-dark-2 leading-relaxed">{guide.focus}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-1">What works</div>
                        <p className="text-sm text-fh-dark-2 leading-relaxed">{guide.whatWorks}</p>
                      </div>
                      <div>
                        <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-1">What doesn&apos;t</div>
                        <p className="text-sm text-fh-dark-2 leading-relaxed">{guide.whatDoesnt}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-fh-blue/20 bg-fh-blue-pale px-4 py-3">
                      <div className="text-[11px] text-fh-blue uppercase tracking-wide mb-1">Tip</div>
                      <p className="text-sm text-fh-dark-2 leading-relaxed">{guide.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Region notes ──────────────────────────────────────────────────── */}
      {tab === 'regions' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-fh-muted leading-relaxed">
            FH6 is set in Japan. The map&apos;s nine distinct regions reward meaningfully different setups — a tune
            optimised for mountain hairpins will be slower on open coastal roads.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {REGIONS.map(({ name, icon, desc, tuning, piRange, cars, districts, span2 }) => (
              <div
                key={name}
                className={`rounded-xl border border-fh-border bg-fh-panel overflow-hidden flex flex-col${span2 ? ' sm:col-span-2' : ''}`}
              >
                {/* Card header */}
                <div className="px-5 py-4 border-b border-fh-border shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{icon}</span>
                    <span className="font-semibold text-fh-dark">{name}</span>
                  </div>
                  <p className="text-sm text-fh-muted leading-relaxed">{desc}</p>
                </div>

                {/* Districts (Tokyo only) */}
                {districts && (
                  <div className="px-5 pt-4 pb-0 shrink-0">
                    <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">Districts</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {districts.map(({ name: dname, char }) => (
                        <div key={dname} className="rounded-lg border border-fh-border bg-fh-panel-2 px-3 py-2">
                          <div className="text-xs font-medium text-fh-dark mb-0.5">{dname}</div>
                          <div className="text-xs text-fh-muted leading-relaxed">{char}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tuning priorities */}
                <div className="px-5 pt-4 shrink-0">
                  <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">Tuning priorities</div>
                  <ul className="flex flex-col gap-1.5 mb-4">
                    {tuning.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-fh-dark-2 leading-relaxed">
                        <span className="text-fh-red/50 shrink-0 mt-1">—</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* PI range + Cars footer */}
                <div className="mt-auto border-t border-fh-border px-5 py-3 flex flex-col gap-1.5 shrink-0 bg-fh-panel-2">
                  <p className="text-xs text-fh-dark-2 leading-relaxed">
                    <span className="font-medium text-fh-muted uppercase tracking-wide text-[10px] mr-1.5">PI</span>
                    {piRange}
                  </p>
                  <p className="text-xs text-fh-dark-2 leading-relaxed">
                    <span className="font-medium text-fh-muted uppercase tracking-wide text-[10px] mr-1.5">Cars</span>
                    {cars}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
