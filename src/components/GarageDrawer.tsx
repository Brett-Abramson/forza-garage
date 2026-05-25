'use client'

import { useEffect, useRef, useState } from 'react'
import type { Car } from '@/types/car'
import { PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'
import { splitTagsBySource } from '@/lib/autotags'
import { getRankedRaceTypes } from '@/lib/raceMatch'
import { getTuningGuide } from '@/lib/tuningGuides'
import { getGroupForDivision } from '@/lib/divisionGroups'
import StatBars from './StatBars'
import { getStatCallouts } from '@/lib/statCallouts'

type TagDetail = { tag: string; source: string }

// ── Stat state shape (all strings so inputs stay controlled; empty = null) ──

interface StatFields {
  statSpeed: string
  statHandling: string
  statAcceleration: string
  statLaunch: string
  statBraking: string
  statOffroad: string
  powerHp: string
  torqueFtLb: string
  weightLb: string
  frontWeight: string
  displacementL: string
  rarity: string
}

function carToStats(car: Car | null): StatFields {
  return {
    statSpeed:        car?.statSpeed        != null ? String(car.statSpeed)        : '',
    statHandling:     car?.statHandling     != null ? String(car.statHandling)     : '',
    statAcceleration: car?.statAcceleration != null ? String(car.statAcceleration) : '',
    statLaunch:       car?.statLaunch       != null ? String(car.statLaunch)       : '',
    statBraking:      car?.statBraking      != null ? String(car.statBraking)      : '',
    statOffroad:      car?.statOffroad      != null ? String(car.statOffroad)      : '',
    powerHp:          car?.powerHp          != null ? String(car.powerHp)          : '',
    torqueFtLb:       car?.torqueFtLb       != null ? String(car.torqueFtLb)       : '',
    weightLb:         car?.weightLb         != null ? String(car.weightLb)         : '',
    frontWeight:      car?.frontWeight      != null ? String(car.frontWeight)      : '',
    displacementL:    car?.displacementL    != null ? String(car.displacementL)    : '',
    rarity:           car?.rarity           ?? '',
  }
}

function statsToPayload(s: StatFields): Record<string, number | string | null> {
  return {
    statSpeed:        s.statSpeed        !== '' ? parseFloat(s.statSpeed)        : null,
    statHandling:     s.statHandling     !== '' ? parseFloat(s.statHandling)     : null,
    statAcceleration: s.statAcceleration !== '' ? parseFloat(s.statAcceleration) : null,
    statLaunch:       s.statLaunch       !== '' ? parseFloat(s.statLaunch)       : null,
    statBraking:      s.statBraking      !== '' ? parseFloat(s.statBraking)      : null,
    statOffroad:      s.statOffroad      !== '' ? parseFloat(s.statOffroad)      : null,
    powerHp:          s.powerHp          !== '' ? parseInt(s.powerHp)            : null,
    torqueFtLb:       s.torqueFtLb       !== '' ? parseInt(s.torqueFtLb)         : null,
    weightLb:         s.weightLb         !== '' ? parseInt(s.weightLb)           : null,
    frontWeight:      s.frontWeight      !== '' ? parseInt(s.frontWeight)        : null,
    displacementL:    s.displacementL    !== '' ? parseFloat(s.displacementL)    : null,
    rarity:           s.rarity           !== '' ? s.rarity                       : null,
  }
}

const PERF_STATS: { key: keyof StatFields; label: string }[] = [
  { key: 'statSpeed',        label: 'Speed'        },
  { key: 'statHandling',     label: 'Handling'     },
  { key: 'statAcceleration', label: 'Acceleration' },
  { key: 'statLaunch',       label: 'Launch'       },
  { key: 'statBraking',      label: 'Braking'      },
  { key: 'statOffroad',      label: 'Offroad'      },
]

const RARITY_OPTIONS = ['Common', 'Rare', 'Legendary', 'Forza Edition']

interface Props {
  car: Car | null
  onClose: () => void
  onTagDetailsChange?: (carId: number, tagDetails: TagDetail[]) => void
  onStatsChange?: (carId: number, partial: Partial<Car>) => void
}

export default function GarageDrawer({ car, onClose, onTagDetailsChange = () => {}, onStatsChange }: Props) {
  // Keep a stale copy so the drawer content doesn't vanish during slide-out
  const [displayCar, setDisplayCar] = useState<Car | null>(car)
  useEffect(() => {
    if (car) setDisplayCar(car)
  }, [car])

  const open = car !== null

  // Derive auto/user split from displayCar's tagDetails
  const { auto: autoTags, user: initUserTags } = splitTagsBySource(displayCar?.tagDetails ?? [])
  const [userTags, setUserTags] = useState<string[]>(initUserTags)
  const [notes, setNotes] = useState<string>(displayCar?.notes ?? '')
  const [notesDirty, setNotesDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Stat entry state
  const [stats, setStats] = useState<StatFields>(() => carToStats(displayCar))
  const [statsDirty, setStatsDirty] = useState(false)
  const [savingStats, setSavingStats] = useState(false)

  const prevId = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (displayCar && displayCar.id !== prevId.current) {
      const { user } = splitTagsBySource(displayCar.tagDetails ?? [])
      setUserTags(user)
      setNotes(displayCar.notes ?? '')
      setNotesDirty(false)
      setStats(carToStats(displayCar))
      setStatsDirty(false)
      prevId.current = displayCar.id
    }
  }, [displayCar])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function patchGarage(body: Record<string, unknown>) {
    if (!displayCar) return
    await fetch(`/api/garage/${displayCar.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async function patchCar(body: Record<string, unknown>) {
    if (!displayCar) return
    await fetch(`/api/cars/${displayCar.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async function addTag(tag: string) {
    const next = [...userTags, tag]
    setUserTags(next)
    const nextDetails: TagDetail[] = [
      ...autoTags.map((t) => ({ tag: t, source: 'auto' })),
      ...next.map((t) => ({ tag: t, source: 'user' })),
    ]
    onTagDetailsChange(displayCar!.id, nextDetails)
    await patchGarage({ tags: next })
  }

  async function removeTag(tag: string) {
    const next = userTags.filter((t) => t !== tag)
    setUserTags(next)
    const nextDetails: TagDetail[] = [
      ...autoTags.map((t) => ({ tag: t, source: 'auto' })),
      ...next.map((t) => ({ tag: t, source: 'user' })),
    ]
    onTagDetailsChange(displayCar!.id, nextDetails)
    await patchGarage({ tags: next })
  }

  async function saveNotes() {
    if (!notesDirty) return
    setSaving(true)
    await patchGarage({ notes })
    setSaving(false)
    setNotesDirty(false)
  }

  async function saveStats() {
    if (!statsDirty || !displayCar) return
    setSavingStats(true)
    const payload = statsToPayload(stats)
    await patchCar(payload)
    onStatsChange?.(displayCar.id, payload as Partial<Car>)
    setSavingStats(false)
    setStatsDirty(false)
  }

  function updateStat(key: keyof StatFields, value: string) {
    setStats((prev) => ({ ...prev, [key]: value }))
    setStatsDirty(true)
  }

  // Only offer tags not already applied (either source)
  const availableTags = CAR_TAGS.filter(
    (t) => !userTags.includes(t) && !autoTags.includes(t)
  )
  const sourceColor = displayCar ? getSourceColor(displayCar.source) : ''
  const classBadge = displayCar ? (PI_CLASS_COLORS[displayCar.piClass] ?? 'bg-gray-600 text-white') : ''

  const divisionGroup = displayCar ? getGroupForDivision(displayCar.division) : null

  // Race type recommendations based on all tags (auto + user)
  const rankedRaces = displayCar
    ? getRankedRaceTypes(
        displayCar.division,
        [...autoTags, ...userTags],
        displayCar.drivetrain ?? undefined
      )
    : []

  // Tuning guide for the best-matching race type
  const tuningGuide =
    displayCar && rankedRaces.length > 0
      ? getTuningGuide(rankedRaces[0].race.id, displayCar.division)
      : null

  const hasAnyStats = Object.values(stats).some((v) => v !== '')

  const statCallouts = displayCar ? getStatCallouts(displayCar) : []

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[420px] z-50
          bg-[#0d1117] border-l border-[#21262d]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {displayCar && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-[#21262d]">
              <div className="min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">
                  {displayCar.year} · {displayCar.make}
                </div>
                <h2 className="text-base font-semibold leading-snug">{displayCar.model}</h2>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 mt-0.5 text-gray-500 hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Car stats */}
              <div className="p-5 border-b border-[#21262d] grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Stat label="Class">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
                    {displayCar.piClass}
                  </span>
                  <span className="text-gray-400 tabular-nums ml-2">{displayCar.piRating}</span>
                </Stat>
                <Stat label="Division">
                  <span className="text-gray-300 text-xs">{displayCar.division}</span>
                  {divisionGroup && (
                    <span className="text-[10px] text-gray-600 ml-1">
                      {divisionGroup.icon} {divisionGroup.name}
                    </span>
                  )}
                </Stat>
                <Stat label="Country">
                  <span className="text-gray-300 text-xs">{displayCar.country}</span>
                </Stat>
                <Stat label="Source">
                  <span className={`text-xs font-medium ${sourceColor}`}>{displayCar.source}</span>
                  {displayCar.sourceInfo && (
                    <span className="text-gray-600 text-xs"> · {displayCar.sourceInfo}</span>
                  )}
                </Stat>
                {displayCar.drivetrain && (
                  <Stat label="Drivetrain">
                    <span className="text-gray-300 text-xs">{displayCar.drivetrain}</span>
                  </Stat>
                )}
                {displayCar.engineType && (
                  <Stat label="Engine">
                    <span className="text-gray-300 text-xs">{displayCar.engineType}</span>
                  </Stat>
                )}
              </div>

              {/* Stat bars */}
              <div className="p-5 border-b border-[#21262d]">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Performance</div>
                <StatBars car={displayCar} />
              </div>

              {/* Current tags — only for owned cars */}
              {displayCar.owned && (
                <div className="p-5 border-b border-[#21262d]">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Tags</div>
                  {autoTags.length === 0 && userTags.length === 0 ? (
                    <p className="text-xs text-gray-600 italic">No tags yet — add some below.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {/* Auto tags — muted, no remove */}
                      {autoTags.map((tag) => (
                        <span
                          key={`auto-${tag}`}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 opacity-60"
                        >
                          {tag}
                        </span>
                      ))}
                      {/* User tags — full color, removable */}
                      {userTags.map((tag) => (
                        <span
                          key={`user-${tag}`}
                          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors leading-none"
                            aria-label={`Remove ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add tags — only for owned cars */}
              {displayCar.owned && availableTags.length > 0 && (
                <div className="p-5 border-b border-[#21262d]">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Add tags</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-[#30363d] text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Race types */}
              {rankedRaces.length > 0 && (
                <div className="p-5 border-b border-[#21262d]">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Race types</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wide w-16 shrink-0">Best for</span>
                      <a
                        href={`/races/${rankedRaces[0].race.id}`}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline text-xs"
                      >
                        <span>{rankedRaces[0].race.icon}</span>
                        <span>{rankedRaces[0].race.name}</span>
                      </a>
                    </div>
                    {rankedRaces.slice(1).map(({ race }) => (
                      <div key={race.id} className="flex items-center gap-1.5 text-sm">
                        <span className="text-[10px] text-gray-600 uppercase tracking-wide w-16 shrink-0">Also suits</span>
                        <a
                          href={`/races/${race.id}`}
                          className="flex items-center gap-1 text-gray-500 hover:text-gray-300 hover:underline text-xs"
                        >
                          <span>{race.icon}</span>
                          <span>{race.name}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stat analysis callouts */}
              {statCallouts.length > 0 && (
                <div className="p-5 border-b border-[#21262d]">
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Stat analysis</div>
                    <div className="text-[10px] text-gray-700 italic">based on available data</div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {statCallouts.map((c) => (
                      <div key={c.id} className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5">
                        <div className="text-[10px] text-blue-400/80 font-medium uppercase tracking-wide mb-1">
                          {c.title}
                        </div>
                        <p className="text-xs text-blue-200/60 leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tuning guide */}
              {rankedRaces.length > 0 && (
                <div className="p-5 border-b border-[#21262d]">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Tuning guide</div>
                  {tuningGuide ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-gray-400 leading-relaxed">{tuningGuide.philosophy}</p>
                      <p className="text-xs text-gray-600 italic leading-relaxed">{tuningGuide.spectrum}</p>
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-2">Priorities</div>
                        <ol className="space-y-1.5">
                          {tuningGuide.priorities.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                              <span className="text-cyan-500/60 font-mono shrink-0 w-4">{i + 1}.</span>
                              {p}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                        <div className="text-[10px] text-amber-500/70 uppercase tracking-wide mb-1">Watch out</div>
                        <p className="text-xs text-amber-200/70 leading-relaxed">{tuningGuide.watchOut}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 italic">
                      Tuning guide coming soon for this combination.
                    </p>
                  )}
                </div>
              )}

              {/* Notes — only for owned cars */}
              {displayCar.owned && <div className="p-5 border-b border-[#21262d]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Notes</div>
                  {saving && <span className="text-xs text-gray-600">Saving…</span>}
                  {!saving && !notesDirty && notes && <span className="text-xs text-gray-600">Saved</span>}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setNotesDirty(true) }}
                  onBlur={saveNotes}
                  placeholder="Tune notes, build ideas, lap times…"
                  rows={5}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none focus:border-cyan-500/60 placeholder:text-gray-600 resize-none"
                />
              </div>}

              {/* Stat entry */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Stats</div>
                  {savingStats && <span className="text-xs text-gray-600">Saving…</span>}
                  {!savingStats && !statsDirty && hasAnyStats && (
                    <span className="text-xs text-gray-600">Saved</span>
                  )}
                </div>

                {/* Performance stats (0–10 from in-game stat screen) */}
                <div className="mb-5">
                  <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-2.5">
                    Performance · 0–10 from in-game stat screen
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {PERF_STATS.map(({ key, label }) => (
                      <StatInput
                        key={key}
                        label={label}
                        value={stats[key]}
                        type="float"
                        min={0}
                        max={10}
                        step={0.1}
                        onChange={(v) => updateStat(key, v)}
                        onBlur={saveStats}
                      />
                    ))}
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-2.5">Specs</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    <StatInput
                      label="Power (hp)"
                      value={stats.powerHp}
                      type="int"
                      onChange={(v) => updateStat('powerHp', v)}
                      onBlur={saveStats}
                    />
                    <StatInput
                      label="Torque (ft-lb)"
                      value={stats.torqueFtLb}
                      type="int"
                      onChange={(v) => updateStat('torqueFtLb', v)}
                      onBlur={saveStats}
                    />
                    <StatInput
                      label="Weight (lb)"
                      value={stats.weightLb}
                      type="int"
                      onChange={(v) => updateStat('weightLb', v)}
                      onBlur={saveStats}
                    />
                    <StatInput
                      label="Front weight (%)"
                      value={stats.frontWeight}
                      type="int"
                      min={0}
                      max={100}
                      onChange={(v) => updateStat('frontWeight', v)}
                      onBlur={saveStats}
                    />
                    <StatInput
                      label="Displacement (L)"
                      value={stats.displacementL}
                      type="float"
                      step={0.1}
                      onChange={(v) => updateStat('displacementL', v)}
                      onBlur={saveStats}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-gray-600 mb-1">Rarity</div>
                      <select
                        value={stats.rarity}
                        onChange={(e) => { updateStat('rarity', e.target.value) }}
                        onBlur={saveStats}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/60"
                      >
                        <option value="">—</option>
                        {RARITY_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-gray-600 text-[10px] uppercase tracking-wide mb-0.5">{label}</div>
      <div className="flex items-center flex-wrap gap-1">{children}</div>
    </div>
  )
}

interface StatInputProps {
  label: string
  value: string
  type: 'float' | 'int'
  min?: number
  max?: number
  step?: number
  onChange: (v: string) => void
  onBlur: () => void
}

function StatInput({ label, value, type, min, max, step, onChange, onBlur }: StatInputProps) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] text-gray-600 mb-1">{label}</div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={type === 'float' ? (step ?? 0.1) : 1}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="—"
        className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/60 placeholder:text-gray-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  )
}
