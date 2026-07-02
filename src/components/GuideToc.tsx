'use client'

import { useEffect, useRef, useState } from 'react'
import BottomSheet from './BottomSheet'

export interface GuideTocSection {
  id: string
  label: string
}

interface Props {
  sections: GuideTocSection[]
}

/**
 * Persistent table of contents for the /guide page. Desktop renders a sticky
 * side rail; mobile renders a sticky collapsed bar (current section + chevron)
 * that opens a bottom sheet with the full list. Both read the same scroll-spy
 * state, computed once via a single IntersectionObserver watching every
 * section's DOM node (not a scroll-position calculation).
 *
 * Links are real <a href="#id"> anchors everywhere, including inside the sheet —
 * never intercepted with scrollIntoView(), so the browser's native history
 * (back/forward restoring scroll position) keeps working.
 */
export default function GuideToc({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')
  const [sheetOpen, setSheetOpen] = useState(false)
  const intersecting = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          intersecting.current[entry.target.id] = entry.isIntersecting
        })
        const current = sections.find((s) => intersecting.current[s.id])
        if (current) setActiveId(current.id)
      },
      // Shrink the observed viewport to a band just under the sticky header(s)
      // (Nav 48px, plus the mobile ToC bar when it's pinned too) — the first
      // section whose top has crossed into that band is "current".
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 },
    )

    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)
    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [sections])

  const activeLabel = sections.find((s) => s.id === activeId)?.label ?? sections[0]?.label ?? ''

  return (
    <>
      {/* Desktop — sticky side rail. top-12 matches FilterSidebar's own sticky
          column offset (Nav is h-12 = 48px), the app's existing convention for
          "stick right under the nav bar". */}
      <nav aria-label="Guide sections" className="hidden md:block sticky top-12 self-start shrink-0 w-[210px] pt-1">
        <ul className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const active = s.id === activeId
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={`block pl-3 pr-2 py-1.5 text-sm border-l-2 rounded-r transition-colors ${
                    active
                      ? 'border-fh-red text-fh-red bg-fh-red-pale font-medium'
                      : 'border-transparent text-fh-muted hover:text-fh-dark hover:bg-fh-panel-2'
                  }`}
                >
                  {s.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile — sticky collapsed bar, current section + chevron, opens the sheet */}
      <div className="md:hidden sticky top-12 z-20 bg-fh-panel border-b border-fh-border py-2">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <span className="truncate text-sm">
            <span className="text-fh-muted-2 mr-1.5">Section</span>
            <span className="font-medium text-fh-dark">{activeLabel}</span>
          </span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="shrink-0 text-fh-muted">
            <path d="M4.22 5.22a.75.75 0 0 1 1.06 0L8 7.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 6.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Jump to section">
        <ul className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const active = s.id === activeId
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setSheetOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'text-fh-red bg-fh-red-pale font-medium' : 'text-fh-dark-2 hover:bg-fh-panel-2'
                  }`}
                >
                  {s.label}
                </a>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}
