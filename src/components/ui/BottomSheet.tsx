'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Shared bottom-sheet chrome — portaled to <body>, tap-triggered, dismissed via
 * backdrop click or Esc. Matches the pattern StatInfoIcon established (handle
 * bar, rounded-t-2xl, same close affordance) so every tap-triggered sheet in the
 * app looks and behaves the same. StatInfoIcon keeps its own inline copy for now
 * (out of scope to touch here) — new sheets should build on this one instead of
 * re-implementing the chrome again.
 */
export default function BottomSheet({ open, onClose, title, children }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-auto w-full sm:max-w-md bg-fh-panel border-t border-fh-border rounded-t-2xl shadow-2xl px-5 pt-3 pb-7">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fh-border" />

        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="text-sm font-semibold text-fh-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-0.5 -mr-1 p-1 text-fh-muted hover:text-fh-dark transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  )
}
