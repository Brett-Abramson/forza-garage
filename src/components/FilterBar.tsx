'use client'

import { FilterState, PI_CLASS_ORDER } from '@/types/car'

interface Props {
  filters: FilterState
  options: {
    divisions: string[]
    makes: string[]
    countries: string[]
  }
  onChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
  hideOwned?: boolean
  hideDivision?: boolean
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-cyan-500/60 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterBar({ filters, options, onChange, totalCount, filteredCount, hideOwned = false, hideDivision = false }: Props) {
  const set = (key: keyof FilterState) => (value: string) =>
    onChange({ ...filters, [key]: value })

  const hasActiveFilters =
    filters.piClass !== '' ||
    (!hideDivision && filters.division !== '') ||
    filters.make !== '' ||
    filters.drivetrain !== '' ||
    filters.country !== '' ||
    (!hideOwned && filters.owned !== 'all')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="PI Class"
          value={filters.piClass}
          options={[
            { value: '', label: 'All Classes' },
            ...PI_CLASS_ORDER.map((c) => ({ value: c, label: `Class ${c}` })),
          ]}
          onChange={set('piClass')}
        />
        {!hideDivision && (
          <Select
            label="Division"
            value={filters.division}
            options={[
              { value: '', label: 'All Divisions' },
              ...options.divisions.map((d) => ({ value: d, label: d })),
            ]}
            onChange={set('division')}
          />
        )}
        <Select
          label="Make"
          value={filters.make}
          options={[
            { value: '', label: 'All Makes' },
            ...options.makes.map((m) => ({ value: m, label: m })),
          ]}
          onChange={set('make')}
        />
        <Select
          label="Drivetrain"
          value={filters.drivetrain}
          options={[
            { value: '', label: 'All' },
            { value: 'AWD', label: 'AWD' },
            { value: 'RWD', label: 'RWD' },
            { value: 'FWD', label: 'FWD' },
          ]}
          onChange={set('drivetrain')}
        />
        <Select
          label="Country"
          value={filters.country}
          options={[
            { value: '', label: 'All Countries' },
            ...options.countries.map((c) => ({ value: c, label: c })),
          ]}
          onChange={set('country')}
        />
        {!hideOwned && (
          <Select
            label="Garage"
            value={filters.owned}
            options={[
              { value: 'all', label: 'All Cars' },
              { value: 'owned', label: 'Owned' },
              { value: 'not-owned', label: 'Not Owned' },
            ]}
            onChange={set('owned')}
          />
        )}

        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({ search: filters.search, piClass: '', division: '', make: '', drivetrain: '', country: '', owned: 'all' })
            }
            className="text-xs text-gray-500 hover:text-gray-300 underline pb-1.5 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Showing{' '}
        <span className="text-[#e6edf3] font-medium">{filteredCount}</span>
        {filteredCount !== totalCount && (
          <> of {totalCount}</>
        )}{' '}
        cars
      </div>
    </div>
  )
}
