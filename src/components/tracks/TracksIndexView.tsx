'use client'

import { useMemo, useState } from 'react'
import { TrackCard } from '@/components/tracks/TrackCard'
import { TrackTypeIcon } from '@/components/car/RaceIcons'
import { typeSlug, typePluralLabel, type TrackListItem } from '@/lib/tracks'

interface TrackGroup {
  type: string
  tracks: TrackListItem[]
}

export function TracksIndexView({ groups, total }: { groups: TrackGroup[]; total: number }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const filteredGroups = useMemo(() => {
    if (!q) return groups.map((g) => ({ ...g, visible: g.tracks }))
    return groups.map((g) => ({
      ...g,
      visible: g.tracks.filter((t) => t.raceName.toLowerCase().includes(q)),
    }))
  }, [groups, q])

  const visibleTotal = filteredGroups.reduce((sum, g) => sum + g.visible.length, 0)
  const noResults = q.length > 0 && visibleTotal === 0

  return (
    <div className="max-w-screen-2xl mx-auto px-[28px] py-6 pb-[34px]">
      {/* Header row */}
      <div>
        <h1 className="text-[26px] font-extrabold uppercase tracking-[-0.02em] leading-none text-fh-dark">
          All Tracks
        </h1>
        <p className="text-[12.5px] text-fh-muted mt-1.5">
          Every race in Forza Horizon 6, grouped by type.{' '}
          <span className="tabular-nums text-fh-dark font-semibold">{total}</span> total.
        </p>
      </div>

      {/* Jump-to TOC — hidden while searching */}
      {!q && (
        <div className="mt-4 px-4 py-[14px] border border-fh-border rounded-xl bg-fh-panel">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-fh-muted mb-[11px]">
            Jump to
          </div>
          <div className="flex flex-wrap gap-[7px]">
            {groups.map((g) => (
              <a
                key={g.type}
                href={`#${typeSlug(g.type)}`}
                className="fh-hover-red-fg inline-flex items-center gap-[7px] text-[11.5px] font-semibold text-fh-dark-2 no-underline border border-fh-border rounded-full bg-fh-panel px-[11px] py-[6px] hover:border-fh-red"
              >
                {typePluralLabel(g.type)}
                <span className="font-mono text-[10px] font-semibold text-fh-muted bg-fh-panel-2 rounded px-[6px] py-[1px]">
                  {g.tracks.length}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="mt-[14px] relative">
        <svg
          width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
          className="absolute left-[13px] top-1/2 -translate-y-1/2 text-fh-muted" aria-hidden
        >
          <circle cx="7" cy="7" r="4.6" />
          <path d="M10.6 10.6L14 14" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          placeholder="Search races by name…"
          aria-label="Search races by name"
          className="w-full text-[13px] text-fh-dark bg-fh-panel border border-fh-border rounded-[10px] px-[38px] py-[11px] outline-none focus:border-fh-red"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-[9px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-md border-0 bg-fh-panel-2 text-fh-muted text-[13px] leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* No-results state */}
      {noResults && (
        <div className="py-10 px-4 text-center text-fh-muted">
          <div className="text-sm font-semibold text-fh-dark">No races match &ldquo;{query}&rdquo;</div>
          <div className="text-xs mt-[5px]">
            Try a different name, or{' '}
            <button
              type="button"
              onClick={() => setQuery('')}
              className="border-0 bg-transparent font-semibold underline underline-offset-2 p-0"
              style={{ color: 'var(--fh-red-fg)' }}
            >
              clear the search
            </button>
            .
          </div>
        </div>
      )}

      {/* Type groups */}
      {filteredGroups.map((g) => {
        if (g.visible.length === 0) return null
        return (
          <section key={g.type} id={typeSlug(g.type)} className="scroll-mt-24">
            <div className="flex items-center gap-[11px] my-[26px] mb-[14px]">
              <div className="w-4 h-px bg-fh-red shrink-0" />
              <span style={{ color: 'var(--fh-red-fg)' }} className="shrink-0">
                <TrackTypeIcon raceType={g.type} size={15} />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-fh-dark whitespace-nowrap">
                {typePluralLabel(g.type)}
              </span>
              <span className="font-mono text-[11px] text-fh-muted">{g.visible.length}</span>
              <div className="flex-1 h-px bg-fh-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[14px]">
              {g.visible.map((track) => (
                <TrackCard key={track.raceName} track={track} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
