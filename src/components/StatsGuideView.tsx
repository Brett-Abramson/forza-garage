import { entriesFor, type StatGuideEntry } from '@/lib/statsGuideContent'

// ─── Page-only content (not per-metric, so no `short`/tooltip versions) ───────

// §5 — how clusters of numbers add up to an identity.
const ARCHETYPES: { name: string; cars?: string; text: string }[] = [
  {
    name: 'Point-and-squirt / launch car',
    cars: 'RS e-tron GT',
    text: "Low lateral G + strong accel/launch (often low top speed too). Can't carry corner speed; rockets on exit. → street, touge, short drag.",
  },
  {
    name: 'Fast-sweeper / downforce car',
    text: "Rising lateral-G curve (ratio ≥ 1.12) with high absolute grip. → high-speed road racing, flowing circuits.",
  },
  {
    name: 'Top-end cruiser',
    text: "High top speed + a sustained accel shape (ratio ≤ 2.1). → long straights and high-speed maps; often weak in slow technical sections.",
  },
  {
    name: 'Cross-country weapon',
    cars: 'Peugeot 207 Super 2000',
    text: "High offroad + high grip/braking for class, top speed irrelevant. → dirt, cross-country. Don't judge it on tarmac metrics.",
  },
  {
    name: 'Heavy GT / saloon',
    text: "High HP + heavy + ~50–59% front. Stable, strong top speed and braking, moderate grip. → road/street; build for consistency, not peak grip.",
  },
]

// §5 — bar stat ↔ precise sim metric pairs.
const BAR_SIM_PAIRS: { bar: string; sim: string }[] = [
  { bar: 'Speed',        sim: 'simTopSpeed' },
  { bar: 'Acceleration', sim: 'simZeroToSixty, simZeroToHundred (+ shape)' },
  { bar: 'Launch',       sim: 'first slice of simZeroToSixty' },
  { bar: 'Braking',      sim: 'simBraking60, simBraking100' },
  { bar: 'Handling',     sim: 'simLateralG60/120 + mech/aero balance' },
  { bar: 'Offroad',      sim: '(no sim twin)' },
]

// §6 — reading a car in 30 seconds.
const THIRTY_SECONDS: string[] = [
  "Class + division — sets the yardstick and which weaknesses matter.",
  "lb/hp — the build-priority dial (grip vs power vs weight).",
  "Front weight % — balance feel before you even tune.",
  "Lateral-G pair — how much grip, and whether it needs speed to show it.",
  "Top speed + braking vs class — straight-line and stopping, weighted by the division (skip top speed for dirt cars).",
  "Acceleration shape — where it makes its time.",
]

// Appendix — per-class reference tables (from ~580 cars). See provenance note below.
const APPENDIX_TABLES: { title: string; note: string; columns: string[]; rows: (string | number)[][] }[] = [
  {
    title: 'Top speed (mph)',
    note: 'higher is better',
    columns: ['Class', 'mean', 'p90 (strong)'],
    rows: [
      ['D', 109, 141], ['C', 146, 159], ['B', 162, 184], ['A', 185, 208],
      ['S1', 202, 225], ['S2', 226, 274], ['R', 219, 252],
    ],
  },
  {
    title: '100–0 braking (ft)',
    note: 'lower is better',
    columns: ['Class', 'mean', 'p10 (strong)'],
    rows: [
      ['D', 413, 386], ['C', 380, 352], ['B', 340, 313], ['A', 293, 250],
      ['S1', 238, 198], ['S2', 188, 153], ['R', 157, 139],
    ],
  },
  {
    title: 'Lateral G @ 120 (g)',
    note: 'higher is better',
    columns: ['Class', 'mean', 'p90 (strong)', 'p25 (low)'],
    rows: [
      ['D', 0.8, 0.92, 0.77], ['C', 0.9, 0.95, 0.81], ['B', 1.0, 1.04, 0.91],
      ['A', 1.0, 1.19, 0.97], ['S1', 1.3, 1.47, 1.15], ['S2', 1.7, 2.22, 1.39], ['R', 2.3, 2.78, 2.10],
    ],
  },
  {
    title: '0–60 (s)',
    note: 'lower is better',
    columns: ['Class', 'mean', 'p10 (strong)', 'p25 (quick)'],
    rows: [
      ['D', 11.9, 7.0, 8.0], ['C', 6.4, 5.3, 5.9], ['B', 5.1, 4.2, 4.5], ['A', 3.9, 3.0, 3.4],
      ['S1', 3.3, 2.6, 2.8], ['S2', 3.1, 2.2, 2.5], ['R', 2.8, 2.0, 2.4],
    ],
  },
]

const DATASET_FACTS: string[] = [
  'Acceleration shape (0–100 ÷ 0–60): p25 2.11 · median 2.36 · p75 2.59.',
  'Lateral-G curve (120 ÷ 60): median 1.03; ~17% of cars dip below 1.0; ~22% reach ≥ 1.10.',
  'Power-to-weight (lb/hp): p25 5.4 · median 8.7 · p75 12.3.',
  'Aero efficiency: median 0.84 (range 0.07–0.93); ≲ 0.70 = draggy.',
  'Mech balance: median 0.50 (p10 0.43 / p90 0.61); r(front-weight %) = −0.61.',
  'Aero balance: median 0.38; 135 cars read 0; r(front-weight %) = +0.11.',
]

// ─── Building blocks ──────────────────────────────────────────────────────────

function GuideEntryCard({ entry }: { entry: StatGuideEntry }) {
  return (
    <section id={entry.id} className="scroll-mt-20 rounded-lg border border-fh-border bg-fh-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
        <h3 className="text-sm font-semibold text-fh-dark">{entry.label}</h3>
        {entry.field && <span className="text-[11px] text-fh-muted-2 font-mono">{entry.field}</span>}
      </div>

      <div className="flex flex-col gap-2">
        {entry.long.map((p, i) => (
          <p key={i} className="text-sm text-fh-dark-2 leading-relaxed">{p}</p>
        ))}
      </div>

      {entry.bullets && (
        <div className="mt-3 flex flex-col gap-1.5">
          {entry.bullets.map((b, i) => (
            <div key={i} className="rounded-md bg-fh-panel-2 px-3 py-2">
              {b.label && <div className="text-xs font-semibold text-fh-dark mb-0.5">{b.label}</div>}
              <div className="text-sm text-fh-dark-2 leading-relaxed">{b.text}</div>
            </div>
          ))}
        </div>
      )}

      {entry.seeAlso && (
        <p className="mt-3 pt-3 border-t border-fh-border text-xs text-fh-muted leading-relaxed">
          <span className="uppercase tracking-wide text-fh-muted-2 mr-1.5">See also</span>
          {entry.seeAlso}
        </p>
      )}
    </section>
  )
}

function SectionHeader({ n, title, blurb }: { n: string; title: string; blurb: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold tracking-tight text-fh-dark">
        <span className="text-fh-red mr-2 tabular-nums">{n}</span>{title}
      </h2>
      <p className="text-sm text-fh-muted mt-1 leading-relaxed">{blurb}</p>
    </div>
  )
}

// ─── View ─────────────────────────────────────────────────────────────────────

export default function StatsGuideView() {
  return (
    <div className="flex flex-col gap-12 max-w-3xl">

      {/* Intro */}
      <div className="rounded-xl border border-fh-blue/20 bg-fh-blue-pale px-5 py-4">
        <p className="text-sm text-fh-dark-2 leading-relaxed">
          A raw value means little on its own — always read it <span className="font-semibold text-fh-dark">against its PI class</span>.
          A 150 mph top speed is poor for an A-class circuit car and excellent for a D-class hatchback. The per-class
          tables in the <a href="#appendix" className="text-fh-red hover:underline">Appendix</a> are the baseline every judgement compares against.
        </p>
      </div>

      {/* 1 — Identity layer */}
      <div>
        <SectionHeader n="1" title="The identity layer" blurb="These don't describe performance directly — they frame everything else." />
        <div className="flex flex-col gap-3">
          {entriesFor('identity').map((e) => <GuideEntryCard key={e.id} entry={e} />)}
        </div>
      </div>

      {/* 2 — Bar stats */}
      <div>
        <SectionHeader n="2" title="The six bar stats (0–10)" blurb="The in-game star bars — a quick read. The sim metrics below are the precise version of the same qualities." />
        <div className="flex flex-col gap-3">
          {entriesFor('bar').map((e) => <GuideEntryCard key={e.id} entry={e} />)}
        </div>
      </div>

      {/* 3 — Raw specs */}
      <div>
        <SectionHeader n="3" title="Raw specs" blurb="The underlying numbers the bars are built from — plus the one derived figure worth computing yourself." />
        <div className="flex flex-col gap-3">
          {entriesFor('spec').map((e) => <GuideEntryCard key={e.id} entry={e} />)}
        </div>
      </div>

      {/* 4 — Sim metrics */}
      <div>
        <SectionHeader n="4" title="Simulation metrics" blurb="The precise, physics-model versions. Units are implied by the field name; always read against class." />
        <div className="flex flex-col gap-3">
          {entriesFor('sim').map((e) => <GuideEntryCard key={e.id} entry={e} />)}
        </div>
      </div>

      {/* 5 — How the numbers relate */}
      <div>
        <SectionHeader n="5" title="How the numbers relate" blurb="The part that makes the rest click — how the quick bars, the precise sims, and weight all wire together." />

        <div className="flex flex-col gap-4">
          {/* Bar ↔ sim pairs */}
          <div className="rounded-lg border border-fh-border bg-fh-panel p-4">
            <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-3">Each quick bar has a precise sim twin — trust the sim when they disagree</div>
            <div className="flex flex-col divide-y divide-fh-border">
              {BAR_SIM_PAIRS.map(({ bar, sim }) => (
                <div key={bar} className="flex items-baseline gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium text-fh-dark w-28 shrink-0">{bar}</span>
                  <span className="text-sm text-fh-dark-2 font-mono leading-relaxed">{sim}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relationship notes */}
          <div className="rounded-lg border border-fh-border bg-fh-panel p-4 flex flex-col gap-3">
            <div>
              <div className="text-sm font-semibold text-fh-dark mb-1">Acceleration shape = 0–100 ÷ 0–60</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                Same 0–60 can hide very different cars. ≤ ~2.1 keeps pulling up top (long circuits, high-speed maps);
                ≥ ~2.6 is front-loaded and fades after 60 (street starts, short sprints). It's a shape, not a speed —
                pair it with the absolute 0–60 vs class before calling anything “quick.”
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-fh-dark mb-1">Weight → everything</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                Heavier = slower accel, longer braking, less grip, lazier direction change. Weight also pushes front
                weight %, which sets the mech-balance number (nose-heavy → low mech balance → understeer). One
                “4,400 lb, 59% front” line predicts long braking, understeer, and PI better spent on weight/grip than power.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-fh-dark mb-1">Grip is two questions, not one</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                How much (absolute lateral G vs class p90) and how it behaves with speed (the 120/60 ratio, set by
                aero). High absolute + flat curve = a strong but low-speed grip car; moderate absolute + rising curve =
                a car that needs speed and downforce to shine.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-fh-dark mb-1">Low-speed vs high-speed balance are different levers</div>
              <p className="text-sm text-fh-dark-2 leading-relaxed">
                Mech balance (springs, ARBs) governs slow corners; aero balance (wings) governs fast ones. A car can
                understeer slow and oversteer fast — tune them separately.
              </p>
            </div>
          </div>

          {/* Archetypes */}
          <div>
            <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">The common archetypes</div>
            <div className="flex flex-col gap-2">
              {ARCHETYPES.map((a) => (
                <div key={a.name} className="rounded-lg border border-fh-border bg-fh-panel px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-fh-dark">{a.name}</span>
                    {a.cars && <span className="text-xs text-fh-muted italic">{a.cars}</span>}
                  </div>
                  <p className="text-sm text-fh-dark-2 leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 — Reading a car in 30 seconds */}
      <div>
        <SectionHeader n="6" title="Reading a car in 30 seconds" blurb="Run these six in order and a car's race fit and build path usually fall out on their own." />
        <ol className="flex flex-col gap-2">
          {THIRTY_SECONDS.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-fh-dark-2 leading-relaxed">
              <span className="text-fh-red font-mono shrink-0 w-5">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Appendix */}
      <div id="appendix" className="scroll-mt-20">
        <SectionHeader n="—" title="Appendix — per-class reference ranges" blurb="From ~580 cars. p90 / p10 mark the strong-for-class tails; these are the baselines every callout compares against." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {APPENDIX_TABLES.map((t) => (
            <div key={t.title} className="rounded-lg border border-fh-border bg-fh-panel p-4">
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-fh-dark">{t.title}</h3>
                <span className="text-[11px] text-fh-muted-2 italic">{t.note}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="text-fh-muted">
                      {t.columns.map((c, i) => (
                        <th key={c} className={`font-medium text-[11px] uppercase tracking-wide pb-2 ${i === 0 ? 'text-left' : 'text-right'}`}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fh-border">
                    {t.rows.map((row) => (
                      <tr key={String(row[0])}>
                        {row.map((cell, i) => (
                          <td key={i} className={`py-1.5 ${i === 0 ? 'text-left font-medium text-fh-dark' : 'text-right text-fh-dark-2'}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Whole-dataset facts */}
        <div className="mt-4 rounded-lg border border-fh-border bg-fh-panel p-4">
          <div className="text-[11px] text-fh-muted uppercase tracking-wide mb-2">Ratios / whole-dataset facts</div>
          <ul className="flex flex-col gap-1.5">
            {DATASET_FACTS.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-fh-dark-2 leading-relaxed">
                <span className="text-fh-red/50 shrink-0 mt-1">—</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Provenance / caution — same convention as DIVISION_PROFILES */}
        <p className="mt-4 text-xs text-fh-muted italic leading-relaxed border-l-2 border-fh-border pl-3">
          These are dataset-derived snapshots from ~580 cars — regenerate from the live DB if the catalog grows
          materially, and re-confirm the aero-balance direction against in-game feel before leaning on it.
        </p>
      </div>

    </div>
  )
}
