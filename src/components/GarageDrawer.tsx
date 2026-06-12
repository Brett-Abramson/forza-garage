'use client'

import { useEffect, useRef, useState } from 'react'
import type { Car } from '@/types/car'
import { PI_CLASS_COLORS, getSourceColor } from '@/types/car'
import { RaceIcon } from '@/components/RaceIcons'
import { CAR_TAGS } from '@/lib/tags'
import { splitTagsBySource, getAutoTags } from '@/lib/autotags'
import { getRankedRaceTypes } from '@/lib/raceMatch'
import { getTuningGuide, getDivisionFallback } from '@/lib/tuningGuides'
import { getGroupForDivision } from '@/lib/divisionGroups'
import StatBars from './StatBars'
import { getStatCallouts } from '@/lib/statCallouts'
import { StatFields, carToStats, statsToPayload, RARITY_OPTIONS } from '@/lib/statUtils'

type TagDetail = { tag: string; source: string }

// Performance stat descriptors — drawer-specific labels only
const PERF_STATS: { key: keyof StatFields; label: string }[] = [
  { key: 'statSpeed',        label: 'Speed'        },
  { key: 'statHandling',     label: 'Handling'     },
  { key: 'statAcceleration', label: 'Acceleration' },
  { key: 'statLaunch',       label: 'Launch'       },
  { key: 'statBraking',      label: 'Braking'      },
  { key: 'statOffroad',      label: 'Offroad'      },
]

interface Props {
  car: Car | null
  onClose: () => void
  onTagDetailsChange?: (carId: number, tagDetails: TagDetail[]) => void
  onStatsChange?: (carId: number, partial: Partial<Car>) => void
  onToggleOwned?: (id: number, owned: boolean) => Promise<void> | void
}

export default function GarageDrawer({ car, onClose, onTagDetailsChange = () => {}, onStatsChange, onToggleOwned }: Props) {
  // Keep a stale copy so the drawer content doesn't vanish during slide-out
  const [displayCar, setDisplayCar] = useState<Car | null>(car)
  useEffect(() => {
    if (car) setDisplayCar(car)
  }, [car])

  const open = car !== null

  // Derive auto/user split from displayCar's tagDetails
  const { auto: initAutoTags, user: initUserTags } = splitTagsBySource(displayCar?.tagDetails ?? [])
  const [autoTags, setAutoTags] = useState<string[]>(initAutoTags)
  const [userTags, setUserTags] = useState<string[]>(initUserTags)
  const [notes, setNotes] = useState<string>(displayCar?.notes ?? '')
  const [notesDirty, setNotesDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmResetTags, setConfirmResetTags] = useState(false)

  // Stat entry state
  const [stats, setStats] = useState<StatFields>(() => carToStats(displayCar))
  const [statsDirty, setStatsDirty] = useState(false)
  const [savingStats, setSavingStats] = useState(false)

  const prevId = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (displayCar && displayCar.id !== prevId.current) {
      const { auto, user } = splitTagsBySource(displayCar.tagDetails ?? [])
      setAutoTags(auto)
      setUserTags(user)
      setNotes(displayCar.notes ?? '')
      setNotesDirty(false)
      setStats(carToStats(displayCar))
      setStatsDirty(false)
      setConfirmRemove(false)
      setConfirmResetTags(false)
      prevId.current = displayCar.id
    }
  }, [displayCar])

  // Fetch full car specs when the drawer opens — the list projection omits spec fields
  useEffect(() => {
    if (!car) return
    let cancelled = false
    fetch(`/api/cars/${car.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((full) => {
        if (cancelled || !full) return
        setDisplayCar((prev) => (prev ? { ...prev, ...full } : prev))
        setStats((prev) => ({
          ...prev,
          powerHp:      full.powerHp      != null ? String(full.powerHp)      : prev.powerHp,
          torqueFtLb:   full.torqueFtLb   != null ? String(full.torqueFtLb)   : prev.torqueFtLb,
          weightLb:     full.weightLb     != null ? String(full.weightLb)     : prev.weightLb,
          frontWeight:  full.frontWeight  != null ? String(full.frontWeight)  : prev.frontWeight,
          displacementL: full.displacementL != null ? String(full.displacementL) : prev.displacementL,
          rarity: full.rarity ?? prev.rarity,
        }))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [car?.id])

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

  async function patchTags(nextAuto: string[], nextUser: string[]) {
    setAutoTags(nextAuto)
    setUserTags(nextUser)
    const nextDetails: TagDetail[] = [
      ...nextAuto.map((t) => ({ tag: t, source: 'auto' })),
      ...nextUser.map((t) => ({ tag: t, source: 'user' })),
    ]
    onTagDetailsChange(displayCar!.id, nextDetails)
    await patchGarage({ tags: { auto: nextAuto, user: nextUser } })
  }

  async function addTag(tag: string) {
    await patchTags(autoTags, [...userTags, tag])
  }

  async function removeAutoTag(tag: string) {
    await patchTags(autoTags.filter((t) => t !== tag), userTags)
  }

  async function removeUserTag(tag: string) {
    await patchTags(autoTags, userTags.filter((t) => t !== tag))
  }

  async function resetTagsToDefault() {
    if (!displayCar) return
    const fresh = getAutoTags(displayCar.division, displayCar.drivetrain ?? undefined)
    await patchTags(fresh, [])
    setConfirmResetTags(false)
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

  // Tuning guide for the best-matching race type, with division fallback
  const tuningGuide =
    displayCar && rankedRaces.length > 0
      ? getTuningGuide(rankedRaces[0].race.id, displayCar.division)
      : null
  const divisionFallback = displayCar && !tuningGuide ? getDivisionFallback(displayCar.division) : null

  const hasAnyStats = Object.values(stats).some((v) => v !== '')
  const [toggling, setToggling] = useState(false)
  const [showStatEntry, setShowStatEntry] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const statCallouts = displayCar ? getStatCallouts(displayCar, [...autoTags, ...userTags]) : []

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
          bg-fh-panel border-l border-fh-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {displayCar && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-fh-border">
              <div className="min-w-0">
                <div className="text-xs text-fh-muted mb-0.5">
                  {displayCar.year} · {displayCar.make}
                </div>
                <h2 className="text-base font-semibold leading-snug">{displayCar.model}</h2>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 mt-0.5 text-fh-muted hover:text-fh-dark transition-colors"
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
              <div className="p-5 border-b border-fh-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Stat label="Class">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${classBadge}`}>
                    {displayCar.piClass}
                  </span>
                  <span className="text-fh-dark-2 tabular-nums ml-2">{displayCar.piRating}</span>
                </Stat>
                <Stat label="Division">
                  <span className="text-fh-dark-2 text-xs">{displayCar.division}</span>
                  {divisionGroup && (
                    <span className="text-[10px] text-fh-muted ml-1">
                      {divisionGroup.icon} {divisionGroup.name}
                    </span>
                  )}
                </Stat>
                <Stat label="Country">
                  <span className="text-fh-dark-2 text-xs">{displayCar.country}</span>
                </Stat>
                <Stat label="Source">
                  <span className={`text-xs font-medium ${sourceColor}`}>{displayCar.source}</span>
                  {displayCar.sourceInfo && (
                    <span className="text-fh-muted text-xs"> · {displayCar.sourceInfo}</span>
                  )}
                </Stat>
                {displayCar.drivetrain && (
                  <Stat label="Drivetrain">
                    <span className="text-fh-dark-2 text-xs">{displayCar.drivetrain}</span>
                  </Stat>
                )}
                {displayCar.engineType && (
                  <Stat label="Engine">
                    <span className="text-fh-dark-2 text-xs">{displayCar.engineType}</span>
                  </Stat>
                )}
              </div>

              {/* Add to garage — only for non-owned cars */}
              {onToggleOwned && !displayCar.owned && (
                <div className="px-5 py-3 border-b border-fh-border">
                  <button
                    disabled={toggling}
                    onClick={async () => {
                      setToggling(true)
                      await onToggleOwned(displayCar.id, true)
                      setToggling(false)
                    }}
                    className="w-full py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-fh-red text-white border border-fh-red hover:opacity-90"
                  >
                    {toggling ? '…' : 'Add to garage'}
                  </button>
                </div>
              )}

              {/* Stat bars */}
              <div className="p-5 border-b border-fh-border">
                <div className="text-xs text-fh-muted uppercase tracking-wide mb-3">Performance</div>
                <StatBars car={displayCar} />
              </div>

              {/* Current tags — only for owned cars */}
              {displayCar.owned && (
                <div className="p-5 border-b border-fh-border">
                  <div className="text-xs text-fh-muted uppercase tracking-wide mb-3">Tags</div>
                  {autoTags.length === 0 && userTags.length === 0 ? (
                    <p className="text-xs text-fh-muted italic">No tags yet — add some below.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {/* Auto tags — muted by default, removable */}
                      {autoTags.map((tag) => (
                        <span
                          key={`auto-${tag}`}
                          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-fh-red-pale text-fh-red border border-fh-red opacity-60 hover:opacity-100 transition-opacity"
                        >
                          {tag}
                          <button
                            onClick={() => removeAutoTag(tag)}
                            className="hover:opacity-60 transition-opacity leading-none"
                            aria-label={`Remove ${tag}`}
                            title="Default tag from division — click to remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {/* User tags — full opacity, removable */}
                      {userTags.map((tag) => (
                        <span
                          key={`user-${tag}`}
                          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-fh-red-pale text-fh-red border border-fh-red"
                        >
                          {tag}
                          <button
                            onClick={() => removeUserTag(tag)}
                            className="hover:opacity-60 transition-opacity leading-none"
                            aria-label={`Remove ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reset to defaults — subtle, below tag chips */}
                  {confirmResetTags ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-fh-muted">
                      <span>Remove custom tags and restore defaults?</span>
                      <button
                        onClick={resetTagsToDefault}
                        className="text-fh-red font-medium hover:opacity-75 transition-opacity"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setConfirmResetTags(false)}
                        className="hover:text-fh-dark transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmResetTags(true)}
                      className="mt-3 text-[11px] text-fh-muted-2 hover:text-fh-muted transition-colors"
                    >
                      Reset tags to defaults
                    </button>
                  )}
                </div>
              )}

              {/* Add tags — only for owned cars */}
              {displayCar.owned && availableTags.length > 0 && (
                <div className="p-5 border-b border-fh-border">
                  <div className="text-xs text-fh-muted uppercase tracking-wide mb-3">Add tags</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-fh-border text-fh-muted hover:border-fh-red hover:text-fh-red hover:bg-fh-red-pale transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Race types */}
              {rankedRaces.length > 0 && (
                <div className="p-5 border-b border-fh-border">
                  <div className="text-xs text-fh-muted uppercase tracking-wide mb-3">Race types</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-[10px] text-fh-muted uppercase tracking-wide w-16 shrink-0">Best for</span>
                      <a
                        href={`/races/${rankedRaces[0].race.id}`}
                        className="flex items-center gap-1 text-fh-red hover:opacity-75 hover:underline text-xs"
                      >
                        <RaceIcon id={rankedRaces[0].race.id} emoji={rankedRaces[0].race.icon} />
                        <span>{rankedRaces[0].race.name}</span>
                      </a>
                    </div>
                    {rankedRaces.slice(1).map(({ race }) => (
                      <div key={race.id} className="flex items-center gap-1.5 text-sm">
                        <span className="text-[10px] text-fh-muted uppercase tracking-wide w-16 shrink-0">Also suits</span>
                        <a
                          href={`/races/${race.id}`}
                          className="flex items-center gap-1 text-fh-muted hover:text-fh-dark hover:underline text-xs"
                        >
                          <RaceIcon id={race.id} emoji={race.icon} />
                          <span>{race.name}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stat analysis callouts */}
              {statCallouts.length > 0 && (
                <div className="p-5 border-b border-fh-border">
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="text-xs text-fh-muted uppercase tracking-wide">Stat analysis</div>
                    <div className="text-[10px] text-fh-muted-2 italic">based on available data</div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {statCallouts.map((c) => (
                      <div key={c.id} className="rounded-lg border border-fh-red bg-fh-red-pale px-3 py-2.5">
                        <div className="text-[10px] text-fh-red font-medium uppercase tracking-wide mb-1">
                          {c.title}
                        </div>
                        <p className="text-xs text-fh-dark-2 leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tuning guide */}
              {rankedRaces.length > 0 && (
                <div className="p-5 border-b border-fh-border">
                  <div className="text-xs text-fh-muted uppercase tracking-wide mb-3">Tuning guide</div>
                  {tuningGuide ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-fh-dark leading-relaxed">{tuningGuide.philosophy}</p>
                      <p className="text-xs text-fh-dark-2 italic leading-relaxed">{tuningGuide.spectrum}</p>
                      <div>
                        <div className="text-[10px] text-fh-muted uppercase tracking-wide mb-2">Priorities</div>
                        <ol className="space-y-1.5">
                          {tuningGuide.priorities.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-fh-dark">
                              <span className="text-fh-red opacity-60 font-mono shrink-0 w-4">{i + 1}.</span>
                              {p}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="rounded-lg border border-fh-amber/20 bg-fh-amber-pale px-3 py-2.5">
                        <div className="text-[10px] text-fh-amber uppercase tracking-wide mb-1">Watch out</div>
                        <p className="text-xs text-fh-dark-2 leading-relaxed">{tuningGuide.watchOut}</p>
                      </div>
                    </div>
                  ) : divisionFallback ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-fh-dark leading-relaxed">{divisionFallback.philosophy}</p>
                      <div>
                        <div className="text-[10px] text-fh-muted uppercase tracking-wide mb-2">Priorities</div>
                        <ol className="space-y-1.5">
                          {divisionFallback.priorities.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-fh-dark">
                              <span className="text-fh-red opacity-60 font-mono shrink-0 w-4">{i + 1}.</span>
                              {p}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="rounded-lg border border-fh-amber/20 bg-fh-amber-pale px-3 py-2.5">
                        <div className="text-[10px] text-fh-amber uppercase tracking-wide mb-1">Watch out</div>
                        <p className="text-xs text-fh-dark-2 leading-relaxed">{divisionFallback.watchOut}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-fh-muted italic">
                      Tuning guide coming soon for this combination.
                    </p>
                  )}
                </div>
              )}

              {/* Notes — only for owned cars */}
              {displayCar.owned && <div className="p-5 border-b border-fh-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-fh-muted uppercase tracking-wide">Notes</div>
                  {saving && <span className="text-xs text-fh-muted-2">Saving…</span>}
                  {!saving && !notesDirty && notes && <span className="text-xs text-fh-muted-2">Saved</span>}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setNotesDirty(true) }}
                  onBlur={saveNotes}
                  placeholder="Tune notes, build ideas, lap times…"
                  rows={5}
                  className="w-full bg-fh-bg border border-fh-border rounded-lg px-3 py-2 text-sm text-fh-dark focus:outline-none focus:border-fh-red placeholder:text-fh-muted-2 resize-none"
                />
              </div>}

              {/* Stat entry — collapsed by default */}
              <div className="border-t border-fh-border">
                {/* Toggle button */}
                <button
                  onClick={() => setShowStatEntry((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-3 text-xs text-fh-muted hover:text-fh-dark transition-colors group"
                >
                  <span>
                    {showStatEntry
                      ? 'Hide stat entry'
                      : hasAnyStats
                      ? 'Edit stats manually'
                      : '+ Enter stats manually'}
                  </span>
                  <svg
                    width="12" height="12" viewBox="0 0 16 16" fill="currentColor"
                    className={`transition-transform duration-200 ${showStatEntry ? 'rotate-180' : ''}`}
                  >
                    <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </button>

                {/* Collapsible content */}
                <div className={`grid transition-all duration-200 ease-in-out ${showStatEntry ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-[10px] text-fh-muted uppercase tracking-wide">Performance · 0–10</div>
                        {savingStats && <span className="text-xs text-fh-muted-2">Saving…</span>}
                        {!savingStats && !statsDirty && hasAnyStats && (
                          <span className="text-xs text-fh-muted-2">Saved</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5">
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

                      <div className="text-[10px] text-fh-muted uppercase tracking-wide mb-2.5">Specs</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <StatInput label="Power (hp)" value={stats.powerHp} type="int" onChange={(v) => updateStat('powerHp', v)} onBlur={saveStats} />
                        <StatInput label="Torque (ft-lb)" value={stats.torqueFtLb} type="int" onChange={(v) => updateStat('torqueFtLb', v)} onBlur={saveStats} />
                        <StatInput label="Weight (lb)" value={stats.weightLb} type="int" onChange={(v) => updateStat('weightLb', v)} onBlur={saveStats} />
                        <StatInput label="Front weight (%)" value={stats.frontWeight} type="int" min={0} max={100} onChange={(v) => updateStat('frontWeight', v)} onBlur={saveStats} />
                        <StatInput label="Displacement (L)" value={stats.displacementL} type="float" step={0.1} onChange={(v) => updateStat('displacementL', v)} onBlur={saveStats} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-fh-muted mb-1">Rarity</div>
                          <select
                            value={stats.rarity}
                            onChange={(e) => { updateStat('rarity', e.target.value) }}
                            onBlur={saveStats}
                            className="w-full bg-fh-bg border border-fh-border rounded px-2 py-1 text-xs text-fh-dark focus:outline-none focus:border-fh-red"
                          >
                            <option value="">—</option>
                            {RARITY_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remove from garage — destructive, secondary, two-step confirm */}
            {onToggleOwned && displayCar.owned && (
              <div className="px-5 py-4 border-t border-fh-border flex justify-end">
                {!confirmRemove ? (
                  <button
                    onClick={() => setConfirmRemove(true)}
                    className="flex items-center gap-1.5 text-xs text-fh-red bg-fh-red-pale border border-fh-red/30 hover:border-fh-red px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.748 1.748 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149Z" />
                    </svg>
                    Remove from garage
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-fh-red-pale border border-fh-red/30 px-3 py-1.5 rounded-lg">
                    <span className="text-xs text-fh-red">Remove this car?</span>
                    <button
                      onClick={() => setConfirmRemove(false)}
                      className="text-xs text-fh-muted hover:text-fh-dark transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={toggling}
                      onClick={async () => {
                        setToggling(true)
                        await onToggleOwned(displayCar.id, false)
                        setToggling(false)
                        setConfirmRemove(false)
                      }}
                      className="text-xs text-fh-red hover:opacity-70 font-semibold transition-colors disabled:opacity-50"
                    >
                      {toggling ? '…' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>
            )}
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
      <div className="text-fh-muted text-[10px] uppercase tracking-wide mb-0.5">{label}</div>
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
  function handleBlur() {
    // Clamp to [min, max] when both bounds are defined
    if (value !== '' && min != null && max != null) {
      const num = type === 'float' ? parseFloat(value) : parseInt(value)
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, min), max)
        if (clamped !== num) onChange(String(clamped))
      }
    }
    onBlur()
  }

  return (
    <div className="min-w-0">
      <div className="text-[10px] text-fh-muted mb-1">{label}</div>
      <input
        type="number"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={type === 'float' ? (step ?? 0.1) : 1}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="—"
        className="w-full bg-fh-bg border border-fh-border rounded px-2 py-1 text-xs text-fh-dark focus:outline-none focus:border-fh-red placeholder:text-fh-muted-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  )
}
