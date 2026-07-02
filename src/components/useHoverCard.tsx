'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import type { CarBadge } from '@/types/car'

export interface HoverCardContent {
  description: string
  comparisonLine?: string | null
  contextLine?: string | null
  /** Tailwind text-color class for contextLine, e.g. 'text-green-400'. Defaults to gray. */
  contextColorClass?: string
}

interface PositionedContent extends HoverCardContent {
  top: number
  left: number
}

/**
 * Shared "hover a row/tile, see a small dark tooltip" behavior — description +
 * optional comparison/context lines, portaled to <body> and positioned from the
 * hovered element's measured rect.
 *
 * Portaling matters: this is used inside scrollable containers (the garage
 * drawer's overflow-y-auto body) where an in-flow absolutely-positioned tooltip
 * gets clipped by the ancestor's overflow bounds. Positioning via a measured
 * rect + `fixed` sidesteps that entirely.
 *
 * Usage: spread `hoverHandlers(content)` onto the hoverable element, and render
 * `tooltip` once anywhere in the tree (it's a portal, so placement doesn't
 * matter). A 200ms show delay avoids flicker when the pointer just passes over;
 * hiding is immediate.
 */
export function useHoverCard() {
  const [tip, setTip] = useState<PositionedContent | null>(null)
  const [mounted, setMounted] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function hoverHandlers(content: HoverCardContent) {
    return {
      onMouseEnter: (e: MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const top = rect.top
        const left = rect.left + rect.width / 2
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setTip({ ...content, top, left }), 200)
      },
      onMouseLeave: () => {
        if (timer.current) clearTimeout(timer.current)
        setTip(null)
      },
    }
  }

  const tooltip = mounted && tip
    ? createPortal(
        <div
          className="fh-fade-in pointer-events-none fixed z-[70] w-56 rounded-md bg-gray-900 border border-gray-700 px-3 py-2 shadow-lg"
          style={{ top: tip.top - 8, left: tip.left, transform: 'translate(-50%, -100%)' }}
        >
          <p className="text-[10px] text-gray-300 leading-snug">{tip.description}</p>
          {tip.comparisonLine && (
            <p className="text-[10px] text-white font-medium mt-1 tabular-nums">{tip.comparisonLine}</p>
          )}
          {tip.contextLine && (
            <p className={`text-[10px] mt-0.5 ${tip.contextColorClass ?? 'text-gray-400'}`}>{tip.contextLine}</p>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
        </div>,
        document.body,
      )
    : null

  return { hoverHandlers, tooltip }
}

/** Maps a CarBadge tier to the hover-card context-line color — mirrors StatBars'
 * green/amber/orange/red scheme so badged tiles read the same way badged bars do. */
export function badgeTierColorClass(tier: CarBadge['tier']): string {
  switch (tier) {
    case 'top-strong':
    case 'top-soft':
      return 'text-green-400'
    case 'bottom-soft':
      return 'text-orange-400'
    case 'bottom-strong':
      return 'text-red-400'
    case 'neutral':
    default:
      return 'text-amber-400'
  }
}
