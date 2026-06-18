'use client'

import { useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  text: string
  className?: string
  /** Clamp to N lines (1 = single-line ellipsis, the default). */
  lines?: number
}

/**
 * Truncates text to one or more lines and — only when the text is actually cut
 * off — shows a custom tooltip with the full value pinned to the top-left of the
 * cursor. Renders the tooltip in a portal so the table's overflow:hidden never
 * clips it, and follows the cursor while hovering.
 */
export default function TruncatedText({ text, className = '', lines = 1 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const isOverflowing = () => {
    const el = ref.current
    if (!el) return false
    return lines > 1
      ? el.scrollHeight > el.clientHeight + 1
      : el.scrollWidth > el.clientWidth + 1
  }

  const multiline = lines > 1
  const clampStyle: CSSProperties = multiline
    ? { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal' }
    : {}

  return (
    <>
      <span
        ref={ref}
        className={`${multiline ? '' : 'block truncate'} ${className}`}
        style={clampStyle}
        onMouseEnter={(e) => { if (isOverflowing()) setPos({ x: e.clientX, y: e.clientY }) }}
        onMouseMove={(e) => setPos((p) => (p ? { x: e.clientX, y: e.clientY } : p))}
        onMouseLeave={() => setPos(null)}
      >
        {text}
      </span>
      {pos && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[60] pointer-events-none max-w-xs rounded-md bg-fh-dark px-2 py-1 text-xs text-fh-bg shadow-lg"
          // Pin the tooltip's bottom-right corner 10px above-left of the cursor.
          style={{ left: pos.x - 10, top: pos.y - 10, transform: 'translate(-100%, -100%)' }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  )
}
