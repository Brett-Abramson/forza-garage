'use client'

import { ReactNode, useEffect, useState } from 'react'
import CarCard from '@/components/car/CarCard'
import StatBars from '@/components/car/StatBars'
import { GridIcon, TableIcon } from '@/components/ui/table-ui'
import { RaceIcon } from '@/components/car/RaceIcons'
import { Car, PI_CLASS_COLORS, PI_CLASS_ORDER, getSourceColor } from '@/types/car'
import { AUTO_TAGS, CAR_TAGS } from '@/lib/tags'
import { RACE_TYPES } from '@/lib/races'

/* ════════════════════════════════════════════════════════════════════════════
   Section header — copied verbatim from the pattern in app/page.tsx so the page
   documents itself in its own visual language.
   ════════════════════════════════════════════════════════════════════════════ */
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-4 h-px bg-fh-red shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-fh-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-fh-border" />
    </div>
  )
}

function Block({ label, title, desc, children }: { label: string; title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="pt-14 first:pt-0">
      <SectionHeader label={label} />
      <h2 className="text-2xl font-extrabold tracking-tight mb-1.5">{title}</h2>
      {desc && <p className="text-sm text-fh-muted max-w-2xl mb-6">{desc}</p>}
      {children}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   LIVE COLOR TOKENS — read straight from globals.css via getComputedStyle, and
   re-read whenever the existing ThemeToggle flips data-theme. This is what makes
   the page impossible to drift from source.
   ════════════════════════════════════════════════════════════════════════════ */
const TOKEN_GROUPS: Record<string, string[]> = {
  Brand:    ['--fh-red', '--fh-red-dim', '--fh-red-pale', '--fh-red-border', '--fh-pink', '--fh-pink-pale'],
  Surfaces: ['--fh-bg', '--fh-bg2', '--fh-panel', '--fh-panel2'],
  Text:     ['--fh-dark', '--fh-dark2', '--fh-muted', '--fh-muted2'],
  Lines:    ['--fh-border', '--fh-border2'],
  Utility:  ['--fh-amber', '--fh-amber-pale', '--fh-blue', '--fh-blue-pale', '--fh-purple'],
}

function LiveTokens() {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const next: Record<string, string> = {}
      Object.values(TOKEN_GROUPS).flat().forEach((name) => {
        next[name] = cs.getPropertyValue(name).trim()
      })
      setVals(next)
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const copy = (name: string) => {
    navigator.clipboard?.writeText(name)
    setCopied(name)
    setTimeout(() => setCopied((c) => (c === name ? null : c)), 1200)
  }

  return (
    <div className="flex flex-col gap-7">
      {Object.entries(TOKEN_GROUPS).map(([group, names]) => (
        <div key={group}>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-fh-muted mb-3">{group}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {names.map((name) => (
              <button
                key={name}
                onClick={() => copy(name)}
                className="text-left rounded-lg border border-fh-border bg-fh-panel overflow-hidden hover:-translate-y-0.5 transition-transform"
                title="Click to copy"
              >
                <div className="h-14 relative">
                  {/* checkerboard shows through translucent tokens */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg,rgba(128,128,128,.2) 25%,transparent 25%,transparent 75%,rgba(128,128,128,.2) 75%),linear-gradient(45deg,rgba(128,128,128,.2) 25%,transparent 25%,transparent 75%,rgba(128,128,128,.2) 75%)',
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0,6px 6px',
                    }}
                  />
                  <div className="absolute inset-0" style={{ background: `var(${name})` }} />
                </div>
                <div className="px-2.5 py-2 border-t border-fh-border">
                  <div className="font-mono text-[11px] text-fh-dark">{name}</div>
                  <div className="font-mono text-[10px] text-fh-muted mt-0.5">
                    {copied === name ? 'copied!' : vals[name] || '…'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Sample cars — built from the real Car type so the real CarCard / StatBars
   render exactly as they do in the app.
   ════════════════════════════════════════════════════════════════════════════ */
function sampleCar(o: Partial<Car>): Car {
  return {
    id: 0,
    make: 'Toyota',
    model: 'GR Supra',
    year: 2020,
    division: 'Modern Sports Cars',
    piClass: 'S1',
    piRating: 847,
    country: 'Japan',
    source: 'Autoshow',
    sourceInfo: null,
    drivetrain: 'RWD',
    engineType: 'Inline-6 Twin-Turbo',
    engineCC: 2998,
    cylinders: 6,
    bodyStyle: 'Coupe',
    statSpeed: 8.2,
    statHandling: 7.4,
    statAcceleration: 9.1,
    statLaunch: 8.8,
    statBraking: 7.0,
    statOffroad: 2.3,
    powerHp: 382,
    torqueFtLb: 368,
    weightLb: 3400,
    frontWeight: 50,
    displacementL: 3.0,
    simZeroToSixty: 3.9,
    simZeroToHundred: 8.6,
    simBraking60: 108,
    simBraking100: 301,
    simLateralG60: 1.04,
    simLateralG120: 1.11,
    simTopSpeed: 155,
    simAeroEfficiency: 0.82,
    simMechBalance: 0.49,
    simAeroBalance: 0.43,
    value: 62000,
    rarity: 'Rare',
    owned: false,
    tags: ['asphalt', 'grip'],
    ...o,
  }
}

const DEMO_CARS: Car[] = [
  sampleCar({ id: 1, owned: true, source: 'DLC' }),
  sampleCar({
    id: 2, make: 'Toyota', model: 'GR Yaris', year: 2021, division: 'Hot Hatch',
    piClass: 'B', piRating: 698, drivetrain: 'AWD', bodyStyle: 'Hatchback',
    engineType: 'Inline-3 Turbo', value: 42000, owned: false, tags: ['asphalt', 'tight'],
  }),
  sampleCar({
    id: 3, make: 'Subaru', model: 'Impreza WRX STI', year: 2004, division: 'Retro Rally',
    piClass: 'A', piRating: 760, drivetrain: 'AWD', country: 'Japan', source: 'Seasonal',
    bodyStyle: 'Saloon', engineType: 'Flat-4 Turbo', value: 88000, owned: true,
    tags: ['dirt', 'offroad'],
  }),
]

const noop = () => {}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE BODY
   ════════════════════════════════════════════════════════════════════════════ */
export default function DesignSystem() {
  return (
    <div className="flex flex-col">
      {/* ── Color tokens — LIVE ── */}
      <Block
        label="Color · Live"
        title="Design tokens"
        desc="Read from globals.css at runtime via getComputedStyle. Flip the theme in the nav and these update on the spot. Click any swatch to copy its variable name."
      >
        <LiveTokens />
      </Block>

      {/* ── PI classes — from real PI_CLASS_COLORS ── */}
      <Block
        label="Color · Semantic"
        title="PI class badges"
        desc="Rendered from PI_CLASS_ORDER + PI_CLASS_COLORS in types/car.ts — exactly the badge used across cards and rows."
      >
        <div className="flex flex-wrap gap-3 items-center">
          {PI_CLASS_ORDER.map((c) => (
            <div key={c} className="flex flex-col items-center gap-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${PI_CLASS_COLORS[c]}`}>{c}</span>
            </div>
          ))}
        </div>
      </Block>

      {/* ── Source colors — from real getSourceColor ── */}
      <Block
        label="Color · Semantic"
        title="Acquisition source"
        desc="Colored by getSourceColor() — harder-to-obtain cars stand out."
      >
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {['Autoshow', 'DLC', 'Seasonal', 'Loyalty', 'Collection Journal'].map((s) => (
            <span key={s} className={`text-sm font-medium ${getSourceColor(s)}`}>{s}</span>
          ))}
        </div>
      </Block>

      {/* ── Typography ── */}
      <Block label="Typography" title="Type scale" desc="Inter throughout. Headlines uppercase + tight; labels uppercase + wide; numbers tabular.">
        <div className="rounded-xl border border-fh-border bg-fh-panel divide-y divide-fh-border-2 px-5">
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="text-4xl font-extrabold tracking-tight uppercase leading-none">Tracked<span className="text-fh-red">.</span></div>
            <div className="font-mono text-[11px] text-fh-muted text-right shrink-0">text-5xl · 800 · uppercase</div>
          </div>
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="text-2xl font-extrabold tracking-tight">Modern Supercars</div>
            <div className="font-mono text-[11px] text-fh-muted text-right shrink-0">text-2xl · 800</div>
          </div>
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-fh-muted">Quick Access</div>
            <div className="font-mono text-[11px] text-fh-muted text-right shrink-0">text-[10px] · 700 · 0.18em</div>
          </div>
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="text-sm">Balanced grip across all corner types and braking stability.</div>
            <div className="font-mono text-[11px] text-fh-muted text-right shrink-0">text-sm · 400</div>
          </div>
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="text-lg font-bold tabular-nums">847 PI · 62,000 Cr</div>
            <div className="font-mono text-[11px] text-fh-muted text-right shrink-0">tabular-nums · 700</div>
          </div>
        </div>
      </Block>

      {/* ── Buttons ── */}
      <Block label="Components" title="Buttons" desc="Primary actions are red, uppercase, wide-tracked and clipped (.btn-clip). Secondary uses a panel fill or red-on-hover outline.">
        <div className="flex flex-wrap gap-3 items-center">
          <button className="btn-clip inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-fh-red transition-opacity hover:opacity-80">
            <span>▶</span> My Garage
          </button>
          <button className="btn-clip inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-fh-panel-2 border border-fh-border transition-colors hover:bg-fh-panel">
            Car Database
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-fh-border text-fh-muted transition-colors hover:border-fh-red hover:text-fh-red">
            Add to garage
          </button>
        </div>
      </Block>

      {/* ── Cards — the REAL CarCard ── */}
      <Block
        label="Components"
        title="Car cards"
        desc="The real <CarCard> — division-accented header, owned glow, spec row. The top-border accent is driven by DIVISION_ACCENT in CarCard.tsx (export it if you want it documented as its own legend)."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          {DEMO_CARS.map((car) => (
            <CarCard key={car.id} car={car} onToggleOwned={noop} onCardClick={noop} />
          ))}
        </div>
      </Block>

      {/* ── Stat bars — the REAL StatBars ── */}
      <Block label="Components" title="Stat bars" desc="The real <StatBars> — six stats on a 0–10 scale plus the specs row.">
        <div className="rounded-xl border border-fh-border bg-fh-panel p-5 max-w-md">
          <StatBars car={DEMO_CARS[0]} />
        </div>
      </Block>

      {/* ── Nav control icons — the REAL icons ── */}
      <Block label="Components" title="View controls" desc="The real GridIcon / TableIcon from table-ui.tsx, in their active/inactive states.">
        <div className="flex bg-fh-panel border border-fh-border rounded-lg overflow-hidden w-fit">
          <span className="px-2.5 py-1.5 bg-fh-red-pale text-fh-red"><GridIcon /></span>
          <span className="px-2.5 py-1.5 text-fh-muted"><TableIcon /></span>
        </div>
      </Block>

      {/* ── Tags — from real CAR_TAGS / AUTO_TAGS ── */}
      <Block label="Components" title="Tag vocabulary" desc="Straight from tags.ts. Auto tags (blue) come from division + drivetrain; user tags (pink) are personal labels.">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-fh-muted mb-2.5">Auto</div>
            <div className="flex flex-wrap gap-2">
              {AUTO_TAGS.map((t) => (
                <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full border border-fh-blue bg-fh-blue-pale text-fh-blue">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-fh-muted mb-2.5">User</div>
            <div className="flex flex-wrap gap-2">
              {CAR_TAGS.filter((t) => !(AUTO_TAGS as readonly string[]).includes(t)).map((t) => (
                <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full border border-fh-pink bg-fh-pink-pale text-fh-pink">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Block>

      {/* ── Race types — from real RACE_TYPES, rendered with the new RaceIcon ── */}
      <Block
        label="Iconography"
        title="Race types"
        desc="Every RaceType from races.ts, each shown with <RaceIcon id emoji> — the new SVG icon when one exists, the emoji as fallback. This is the wiring you'll use in RacesView / CarCard."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RACE_TYPES.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-fh-border bg-fh-panel px-4 py-3">
              <span className="text-fh-red shrink-0">
                <RaceIcon id={r.id} emoji={r.icon} size={22} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{r.name}</div>
                <div className="text-xs text-fh-muted truncate">{r.surface}</div>
              </div>
              <span className="ml-auto font-mono text-[10px] text-fh-muted-2 shrink-0">{r.id}</span>
            </div>
          ))}
        </div>
      </Block>

      {/* ── What's live vs not ── */}
      <Block label="Notes" title="What's live, what isn't" desc="">
        <div className="rounded-xl border border-fh-amber bg-fh-amber-pale border-l-[3px] p-5 text-sm leading-relaxed max-w-2xl">
          <p className="mb-2">
            <span className="font-bold text-fh-amber uppercase text-[11px] tracking-wider">Live (auto-synced):</span>{' '}
            color tokens, PI badges, source colors, tags, race types, and the real CarCard / StatBars /
            view-control icons — all imported from source.
          </p>
          <p>
            <span className="font-bold text-fh-amber uppercase text-[11px] tracking-wider">Not yet wired:</span>{' '}
            the division-accent legend reads its map (DIVISION_ACCENT) from inside CarCard.tsx —
            export it to document it as a standalone swatch set. Same for stat-bar hues in StatBars.tsx.
          </p>
        </div>
      </Block>
    </div>
  )
}
