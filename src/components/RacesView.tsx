'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RACE_TYPES, getRaceFilterUrl, type RaceType } from '@/lib/races'

const SURFACE_COLORS: Record<string, string> = {
  'Asphalt':            'bg-slate-700 text-slate-200',
  'Asphalt — tight':    'bg-slate-700 text-slate-200',
  'Loose / dirt':       'bg-amber-900/80 text-amber-200',
  'Mixed — rough terrain': 'bg-stone-700 text-stone-200',
}

function surfaceBadge(surface: string) {
  return SURFACE_COLORS[surface] ?? 'bg-gray-700 text-gray-200'
}

export default function RacesView() {
  const [selected, setSelected] = useState<RaceType | null>(null)
  const [open, setOpen] = useState(false)

  function openRace(race: RaceType) {
    setSelected(race)
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  // Keep selected visible during slide-out
  const [displayed, setDisplayed] = useState<RaceType | null>(null)
  useEffect(() => { if (selected) setDisplayed(selected) }, [selected])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RACE_TYPES.map((race) => (
          <button
            key={race.id}
            onClick={() => openRace(race)}
            className="text-left bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-cyan-500/40 hover:bg-[#1c2330] transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{race.icon}</span>
                <div>
                  <h2 className="text-sm font-semibold group-hover:text-cyan-400 transition-colors">
                    {race.name}
                  </h2>
                  <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${surfaceBadge(race.surface)}`}>
                    {race.surface}
                  </span>
                </div>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 16 16" fill="currentColor"
                className="shrink-0 text-gray-600 group-hover:text-cyan-500/60 transition-colors mt-0.5"
              >
                <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{race.description}</p>
            <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-600">
              <span>PI: {race.piSweetSpot}</span>
              <span>·</span>
              <span>{race.recommendedTags.length} tags</span>
            </div>
          </button>
        ))}
      </div>

      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Detail drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[480px] z-50
          bg-[#0d1117] border-l border-[#21262d]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {displayed && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-[#21262d]">
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none">{displayed.icon}</span>
                <div>
                  <h2 className="text-base font-semibold">{displayed.name}</h2>
                  <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${surfaceBadge(displayed.surface)}`}>
                    {displayed.surface}
                  </span>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="shrink-0 mt-0.5 text-gray-500 hover:text-gray-200 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Description */}
              <div className="p-5 border-b border-[#21262d]">
                <p className="text-sm text-gray-400 leading-relaxed">{displayed.description}</p>
              </div>

              {/* Demands + Avoid */}
              <div className="p-5 border-b border-[#21262d] grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3">This race demands</h3>
                  <ul className="space-y-1.5">
                    {displayed.demands.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-cyan-500 mt-0.5 shrink-0">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Works against you</h3>
                  <ul className="space-y-1.5">
                    {displayed.avoid.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-red-500 mt-0.5 shrink-0">✕</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PI + Drivetrain */}
              <div className="p-5 border-b border-[#21262d] grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">PI sweet spot</h3>
                  <p className="text-sm font-semibold text-cyan-400">{displayed.piSweetSpot}</p>
                </div>
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Drivetrain</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{displayed.drivetrainNote}</p>
                </div>
              </div>

              {/* Recommended tags */}
              <div className="p-5 border-b border-[#21262d]">
                <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Garage tags it looks for</h3>
                <div className="flex flex-wrap gap-2">
                  {displayed.recommendedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border border-[#30363d] text-gray-400 bg-[#161b22]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-5">
                <Link
                  href={getRaceFilterUrl(displayed.id)}
                  onClick={close}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1 6l7-4 7 4v8H1z" />
                    <rect x="5" y="9" width="6" height="5" rx="0.5" />
                    <rect x="6.5" y="9" width="1" height="5" />
                  </svg>
                  Find in My Garage
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
