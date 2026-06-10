'use client'

import type { SortKey, SortDir } from '@/lib/sort'

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
}: {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
  className?: string
  width?: string
}) {
  const active = sort.key === sortKey
  return (
    <th
      className={`text-left py-2.5 px-3 cursor-pointer group ${className}`}
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      style={width ? { width } : undefined}
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
