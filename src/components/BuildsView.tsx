'use client'

import { useState } from 'react'
import { RACE_BUILD_GUIDES, PI_CLASS_GUIDES } from '@/lib/buildGuides'

type Tab = 'race' | 'class'

export default function BuildsView() {
  const [tab, setTab] = useState<Tab>('race')
  const [openRace, setOpenRace] = useState<string | null>(RACE_BUILD_GUIDES[0].id)
  const [openClass, setOpenClass] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-fh-panel-2 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('race')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'race' ? 'bg-fh-panel text-fh-dark shadow-sm' : 'text-fh-muted hover:text-fh-dark-2'
          }`}
        >
          By Race Type
        </button>
        <button
          onClick={() => setTab('class')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'class' ? 'bg-fh-panel text-fh-dark shadow-sm' : 'text-fh-muted hover:text-fh-dark-2'
          }`}
        >
          By PI Class
        </button>
      </div>

      {/* Race type guides */}
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

      {/* PI class guides */}
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
    </div>
  )
}
