'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { getStatGuideEntry } from '@/lib/statsGuideContent'

interface Props {
  /** Guide entry id — see statsGuideContent.ts. Resolves the tooltip copy + `/guide#{id}` link. */
  id: string
  /** Glyph size in px (default 14). Tiles pass a smaller value to fit the header row. */
  size?: number
  className?: string
}

/**
 * Tap-triggered info icon (mobile + desktop, same trigger) that opens a bottom
 * sheet with the stat's `short` gloss and a deep link into the /guide page.
 *
 * The sheet is portaled to <body> on purpose: the drawer panel it lives inside
 * uses `transform: translateX(...)`, which would otherwise trap a `fixed`-
 * positioned child inside the drawer instead of covering the viewport.
 */
export default function StatInfoIcon({ id, size = 14, className }: Props) {
  const entry = getStatGuideEntry(id)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Portals need a DOM target — only available after the client mounts.
  useEffect(() => setMounted(true), [])

  // Esc closes the sheet, matching the drawer's own dismiss affordances.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  if (!entry) return null

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        aria-label={`About ${entry.label}`}
        title={`About ${entry.label}`}
        className={`shrink-0 inline-flex items-center justify-center rounded-full text-fh-muted-2 hover:text-fh-red transition-colors ${className ?? ''}`}
      >
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 6.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75ZM8 3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[60] flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={entry.label}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

          {/* Sheet — anchored to the viewport bottom, width-capped for narrow screens */}
          <div className="relative mx-auto w-full sm:max-w-md bg-fh-panel border-t border-fh-border rounded-t-2xl shadow-2xl px-5 pt-3 pb-7">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fh-border" />

            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h3 className="text-sm font-semibold text-fh-dark">{entry.label}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mt-0.5 -mr-1 p-1 text-fh-muted hover:text-fh-dark transition-colors shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>

            {entry.field && (
              <div className="text-[11px] text-fh-muted-2 font-mono mb-2.5">{entry.field}</div>
            )}

            <p className="text-sm text-fh-dark-2 leading-relaxed mb-4">{entry.short}</p>

            <Link
              href={`/guide#${entry.id}`}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-sm font-medium text-fh-red hover:opacity-75 transition-opacity"
            >
              Learn more →
            </Link>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
