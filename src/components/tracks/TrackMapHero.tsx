'use client'

import { useCallback, useEffect, useState } from 'react'
import { TrackImage } from '@/components/tracks/TrackImage'

/**
 * The single-race page's track-map hero — zoomable/lightbox-able, the one
 * "power" affordance on an otherwise static page (presentation only, zero
 * derivation risk). Click or the zoom hint opens a full-viewport overlay;
 * close on backdrop click or Escape.
 */
export function TrackMapHero({
  src,
  raceName,
  filename,
}: {
  src: string | null
  raceName: string
  filename: string
}) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close])

  return (
    <>
      <button
        type="button"
        onClick={() => src && setOpen(true)}
        disabled={!src}
        className={`relative block w-full border border-fh-border rounded-2xl overflow-hidden text-left ${src ? 'cursor-zoom-in' : ''}`}
        aria-label={`View full size: ${raceName} track map`}
      >
        <TrackImage src={src} alt={`${raceName} track map`} filename={filename} className="aspect-[16/10] w-full" priority fit="contain" />
        {src && (
          <span className="absolute right-[10px] bottom-[10px] z-[2] inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-fh-dark bg-fh-panel border border-fh-border rounded-full px-[10px] py-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.14)]">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14M7 5v4M5 7h4" strokeLinecap="round" />
            </svg>
            Click to zoom
          </span>
        )}
      </button>

      {open && src && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-zoom-out p-10"
          onClick={close}
        >
          <div className="w-[92vw] h-[82vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${raceName} track map`}
              className="w-full h-full object-contain rounded-md shadow-2xl"
            />
          </div>
          <div className="absolute bottom-[26px] left-0 right-0 text-center text-white font-mono text-[12.5px] pointer-events-none">
            {raceName} · track map
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-[22px] right-[26px] w-9 h-9 rounded-lg border border-white/30 bg-black/30 text-white text-lg flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
