'use client'

import { DIVISION_GROUPS } from '@/lib/divisionGroups'

interface Props {
  selectedGroupId: string | null
  selectedDivision: string
  // Divisions present in the current dataset — groups/divisions with no cars are hidden
  availableDivisions: string[]
  onGroupChange: (groupId: string | null) => void
  onDivisionChange: (division: string) => void
}

export default function DivisionGroupFilter({
  selectedGroupId,
  selectedDivision,
  availableDivisions,
  onGroupChange,
  onDivisionChange,
}: Props) {
  const availableSet = new Set(availableDivisions)

  // Only show groups that have at least one division present in the dataset
  const visibleGroups = DIVISION_GROUPS.filter((g) =>
    g.divisions.some((d) => availableSet.has(d))
  )

  const activeGroup = DIVISION_GROUPS.find((g) => g.id === selectedGroupId) ?? null

  // Sub-chips: divisions in the active group that exist in the dataset
  const groupDivisions = activeGroup
    ? activeGroup.divisions.filter((d) => availableSet.has(d))
    : []

  return (
    <div className="flex flex-col gap-2">
      {/* Group chips */}
      <div className="flex flex-wrap gap-2">
        {visibleGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => onGroupChange(selectedGroupId === group.id ? null : group.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedGroupId === group.id
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-[#161b22] text-gray-500 border-[#30363d] hover:border-[#484f58] hover:text-gray-300'
            }`}
          >
            <span>{group.icon}</span>
            {group.name}
          </button>
        ))}
      </div>

      {/* Division chips — slide in when a group is active */}
      {groupDivisions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {groupDivisions.map((division) => (
            <button
              key={division}
              onClick={() => onDivisionChange(selectedDivision === division ? '' : division)}
              className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                selectedDivision === division
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'text-gray-500 border-[#30363d] hover:border-[#484f58] hover:text-gray-300'
              }`}
            >
              {division}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
