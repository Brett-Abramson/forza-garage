'use client'

import { useState } from 'react'
import { RACE_BUILD_GUIDES, PI_CLASS_GUIDES } from '@/lib/buildGuides'

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
  { step: 'Differential', detail: 'Power delivery and rotation.' },
  { step: 'Aero', detail: 'Balance downforce once everything else is working.' },
  { step: 'Gearing', detail: 'Final step, matched to the specific track or discipline.' },
]

const DAMPING_DIAGNOSE = [
  { symptom: 'Car bounces after a jump or big bump', fix: 'Increase rebound' },
  { symptom: 'Car feels skittish or nervous over small road imperfections', fix: 'Soften bump' },
  { symptom: 'Car feels planted but slow to respond', fix: 'Reduce rebound slightly' },
]

const REGIONS = [
  {
    name: 'Touge / Hakone Mountain Routes',
    icon: '⛰️',
    desc: 'Narrow, technical, low-speed sections dominate. Hairpins are the deciding factor.',
    notes: [
      'Front suspension slightly softer than rear — helps rotation into hairpins',
      'Neutral to mild differential (30–40% accel) — rotation matters more than planted exits',
      'Sport or semi-slick tires — full slick can overwhelm traction on tight mountain sections',
      'Short gear ratios — match the speed range of the hairpins',
      'Maximum braking upgrade — late, hard braking is essential',
    ],
  },
  {
    name: 'Tokyo Street Circuit',
    icon: '🏙️',
    desc: 'Short, tight, technical. Stop-start acceleration profile.',
    notes: [
      'Short gearing — acceleration out of corners beats top speed',
      'Stiffer rear ARB — prevents understeer from weight transfer on tight exits',
      'Semi-slick or slick tires — tarmac surface rewards grip',
      'Brake bias slightly forward (53–55%) — lots of hard braking zones',
      'AWD advantage here — short acceleration zones reward traction over top speed',
    ],
  },
  {
    name: 'Hokkaido Snow / Winter Conditions',
    icon: '❄️',
    desc: 'Loose, low-grip, requires compliance.',
    notes: [
      'AWD essential — snow dramatically reduces individual wheel grip',
      'Soft spring rates — compliance over snow and ice',
      'Rally tires — designed for the mixed grip of snow and loose surfaces',
      'Lower tire pressure (26–28 PSI cold) — more contact patch on slippery surfaces',
      'Soft ARBs — wheels need to work independently, same logic as dirt racing',
    ],
  },
  {
    name: 'Pacific Coast / Open Roads',
    icon: '🌊',
    desc: 'Higher-speed sections, crests, and longer sweeping corners.',
    notes: [
      'Mid-range gearing — balance between acceleration and top speed on longer straights',
      'Slight rake (front ride height lower than rear) — helps stability over crests by keeping the rear planted when the car goes light over the top',
      'Aero if class allows — sweeping corners at speed reward downforce',
      'Firm but balanced spring rates — road is smoother but speeds are higher',
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuildsView() {
  const [tab, setTab] = useState<Tab>('fundamentals')
  const [openRace, setOpenRace] = useState<string | null>(RACE_BUILD_GUIDES[0].id)
  const [openClass, setOpenClass] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-fh-panel-2 rounded-lg p-1 w-fit">
        {(
          [
            { id: 'fundamentals', label: 'Fundamentals' },
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
      {tab === 'fundamentals' && (
        <div className="flex flex-col gap-8 max-w-2xl">

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
              <div className="text-[11px] text-fh-blue uppercase tracking-wide mb-1">Starting point for FH6</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                Rebound: <span className="font-medium text-fh-dark">8–11</span> (your anchor value). Bump:{' '}
                <span className="font-medium text-fh-dark">50–75% of your rebound value</span> — if rebound is 10,
                bump starts at 5–7.
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
        <div className="flex flex-col gap-4 max-w-2xl">
          <p className="text-sm text-fh-muted leading-relaxed">
            FH6 is set in Japan. The map&apos;s distinct regions reward meaningfully different setups — a tune optimised
            for mountain hairpins will be slower on open coastal roads.
          </p>
          {REGIONS.map(({ name, icon, desc, notes }) => (
            <div key={name} className="rounded-xl border border-fh-border bg-fh-panel overflow-hidden">
              <div className="px-5 py-4 border-b border-fh-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{icon}</span>
                  <span className="font-semibold text-fh-dark">{name}</span>
                </div>
                <p className="text-sm text-fh-muted">{desc}</p>
              </div>
              <ul className="px-5 py-4 flex flex-col gap-1.5">
                {notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-fh-dark-2 leading-relaxed">
                    <span className="text-fh-red/50 shrink-0 mt-1">—</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
