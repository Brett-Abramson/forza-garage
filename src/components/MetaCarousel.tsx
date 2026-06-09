'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { PI_CLASS_COLORS } from '@/types/car'

export interface MetaCarEntry {
  id: number
  carId: number
  make: string
  model: string
  year: number
  piClass: string
  piRating: number
  raceType: string
  rank: number | null
  label: string
  notes: string | null
  source: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MetaCarousel({ entries }: { entries: MetaCarEntry[] }) {
  // Start with original order so server HTML and client hydration match exactly.
  // Shuffle is deferred to useEffect (runs only after hydration) to avoid CLS
  // from a server/client render mismatch.
  const [items, setItems] = useState<MetaCarEntry[]>(entries)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Shuffle once on mount — runs client-side only, after hydration is done.
  useEffect(() => {
    setItems(shuffle(entries))
    setIndex(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = items.length

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % total)
  }, [total])

  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(advance, 25000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, advance])

  const entry = items[index]

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-4 h-px bg-fh-red shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-fh-muted whitespace-nowrap">
          Featured Car
        </span>
        <div className="flex-1 h-px bg-fh-border" />
      </div>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <MetaCard
          entry={entry}
          onPrev={prev}
          onNext={next}
          total={total}
          index={index}
          onDotClick={setIndex}
        />
      </div>

      {/* Footnote */}
      <p className="text-[10px] text-fh-muted-2 text-center mt-3">
        meta as of June 2026 ·{' '}
        <a
          href="https://forza.guide/meta"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-fh-muted transition-colors"
        >
          forza.guide/meta
        </a>
      </p>
    </section>
  )
}

function MetaCard({
  entry,
  onPrev,
  onNext,
  total,
  index,
  onDotClick,
}: {
  entry: MetaCarEntry
  onPrev: () => void
  onNext: () => void
  total: number
  index: number
  onDotClick: (i: number) => void
}) {
  const viewUrl = `/cars?q=${encodeURIComponent(`${entry.year} ${entry.make} ${entry.model}`)}&open=${entry.carId}`

  return (
    <div className="rounded-xl border border-fh-red-border bg-fh-panel overflow-hidden [border-left-width:3px] [border-left-color:var(--fh-red)]">
      {/* Header bar */}
      <div className="bg-fh-red px-5 py-2.5 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
          {entry.label}
        </span>
        {entry.rank != null && (
          <span className="text-[10px] font-bold text-white/70 shrink-0">#{entry.rank}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-5">
        {/* Car identity */}
        <div>
          <div className="text-2xl font-extrabold leading-tight uppercase tracking-tight">
            {entry.model}
          </div>
          <div className="text-sm text-fh-muted mt-1">
            {entry.year} · {entry.make}
          </div>
        </div>

        {/* PI class + race type */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${PI_CLASS_COLORS[entry.piClass] ?? 'bg-gray-600 text-white'}`}>
            {entry.piClass}
          </span>
          <span className="text-lg font-bold tabular-nums text-fh-dark">{entry.piRating}</span>
          <span className="text-xs text-fh-muted">·</span>
          <span className="text-xs text-fh-muted">{entry.raceType}</span>
        </div>

        {/* Description */}
        {entry.notes && (
          <p className="text-sm text-fh-dark-2 leading-relaxed">{entry.notes}</p>
        )}

        <div className="border-t border-fh-border" />

        {/* View button */}
        <Link
          href={viewUrl}
          className="btn-clip flex items-center justify-center py-3 text-xs font-bold uppercase tracking-widest text-white bg-fh-red transition-opacity hover:opacity-80"
        >
          View in Database
        </Link>

        {/* Prev / next + dots */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onPrev}
            aria-label="Previous car"
            className="w-8 h-8 rounded-full border border-fh-border bg-fh-panel-2 flex items-center justify-center text-fh-muted hover:text-fh-dark hover:border-fh-red transition-colors text-base leading-none"
          >
            ‹
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => onDotClick(i)}
                aria-label={`Go to car ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === index
                    ? 'w-4 h-1.5 bg-fh-red'
                    : 'w-1.5 h-1.5 bg-fh-border hover:bg-fh-muted'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            aria-label="Next car"
            className="w-8 h-8 rounded-full border border-fh-border bg-fh-panel-2 flex items-center justify-center text-fh-muted hover:text-fh-dark hover:border-fh-red transition-colors text-base leading-none"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
