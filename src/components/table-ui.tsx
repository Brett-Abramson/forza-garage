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
  model: 160,
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

// Every sortable column in standard table mode, in header order. Used by the
// mobile SortSelect so columns that get dropped at narrow widths stay sortable.
export const STANDARD_SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'piClass',    label: 'Class'    },
  { key: 'piRating',   label: 'PI'       },
  { key: 'year',       label: 'Year'     },
  { key: 'make',       label: 'Make'     },
  { key: 'model',      label: 'Model'    },
  { key: 'division',   label: 'Division' },
  { key: 'drivetrain', label: 'Drive'    },
  { key: 'country',    label: 'Country'  },
  { key: 'source',     label: 'Source'   },
  { key: 'value',      label: 'Value'    },
  { key: 'owned',      label: 'Garage'   },
]

/**
 * Compact sort control for narrow screens: a column picker plus a direction
 * toggle. Lets users sort by columns that are hidden when the table drops them
 * at small widths, since their clickable headers aren't on screen.
 */
export function SortSelect({
  columns,
  sort,
  onSelect,
  onToggleDir,
}: {
  columns: { key: SortKey; label: string }[]
  sort: SortState
  onSelect: (key: SortKey | '') => void
  onToggleDir: () => void
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-xs text-fh-muted">Sort</span>
      <select
        value={sort.key ?? ''}
        onChange={(e) => onSelect(e.target.value as SortKey | '')}
        aria-label="Sort column"
        className="bg-fh-panel border border-fh-border rounded-lg text-xs font-medium text-fh-dark-2 px-2 py-1.5 focus:outline-none focus:border-fh-red"
      >
        <option value="">Default</option>
        {columns.map((c) => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>
      <button
        onClick={onToggleDir}
        disabled={!sort.key}
        aria-label={sort.dir === 'asc' ? 'Sort ascending' : 'Sort descending'}
        title={sort.dir === 'asc' ? 'Ascending' : 'Descending'}
        className="bg-fh-panel border border-fh-border rounded-lg text-xs px-2 py-1.5 text-fh-muted hover:text-fh-dark-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {sort.dir === 'asc' ? '▲' : '▼'}
      </button>
    </div>
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
