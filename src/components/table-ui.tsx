'use client'

import type { CSSProperties } from 'react'
import type { SortKey, SortDir } from '@/lib/sort'

// Pixel widths for the identity columns in stats mode.
// Shared between header (view files) and body (CarRow) so sticky left offsets align.
export const STICKY_COL = {
  star:  40,
  class: 64,
  pi:    52,
  year:  56,
  make:  100,
  model: 120,
} as const

// Tighter widths used only in Stats mode to maximise visible stat columns.
export const STICKY_COL_STATS = {
  star:  40,
  class: 40,   // dot only, no class text
  pi:    44,
  year:  52,
  make:  80,
  model: 120,
} as const

export type TableMode = 'standard' | 'stats'

interface SortState {
  key: SortKey | null
  dir: SortDir
}

export function SortTh({
  label,
  sortKey,
  sort,
  onSort,
  className = '',
  width,
  style,
}: {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
  className?: string
  width?: string
  style?: CSSProperties
}) {
  const active = sort.key === sortKey
  return (
    <th
      className={`text-left py-2.5 px-3 cursor-pointer group ${className}`}
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      style={{ ...(width ? { width } : {}), ...style }}
    >
      <span
        className={`flex items-center gap-1 transition-colors ${
          active ? 'text-fh-red' : 'text-fh-muted hover:text-fh-dark'
        }`}
      >
        {label}
        <span className="text-[10px] leading-none">
          {active ? (sort.dir === 'asc' ? '▲' : '▼') : <span className="opacity-0 group-hover:opacity-40">▲</span>}
        </span>
      </span>
    </th>
  )
}

export function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

export function TableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="14" height="2" rx="1" />
      <rect x="1" y="7" width="14" height="2" rx="1" />
      <rect x="1" y="12" width="14" height="2" rx="1" />
    </svg>
  )
}

export function TableModeToggle({ mode, setMode }: { mode: TableMode; setMode: (m: TableMode) => void }) {
  return (
    <div className="flex bg-fh-panel border border-fh-border rounded-lg overflow-hidden shrink-0 text-xs font-medium">
      <button
        onClick={() => setMode('standard')}
        className={`px-3 py-1.5 transition-colors ${mode === 'standard' ? 'bg-fh-red-pale text-fh-red' : 'text-fh-muted hover:text-fh-dark-2'}`}
      >
        Standard
      </button>
      <button
        onClick={() => setMode('stats')}
        className={`px-3 py-1.5 transition-colors ${mode === 'stats' ? 'bg-fh-red-pale text-fh-red' : 'text-fh-muted hover:text-fh-dark-2'}`}
      >
        Stats
      </button>
    </div>
  )
}
