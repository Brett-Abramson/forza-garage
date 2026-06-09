import React from 'react'

// Server-renderable skeleton for the My Garage page.
// Replaces fallback={null} in the Suspense boundary so FCP ≈ TTFB.

function Bone({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`rounded bg-fh-panel-2 animate-pulse ${className}`} style={style} />
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-fh-border">
      <td className="py-2.5 px-3"><Bone className="h-5 w-8" /></td>
      <td className="py-2.5 px-3"><Bone className="h-4 w-10" /></td>
      <td className="py-2.5 px-3"><Bone className="h-4 w-10" /></td>
      <td className="py-2.5 px-3"><Bone className="h-4 w-20" /></td>
      <td className="py-2.5 px-3"><Bone className="h-4 w-28" /></td>
      <td className="py-2.5 px-3 hidden md:table-cell"><Bone className="h-4 w-32" /></td>
      <td className="py-2.5 px-3 hidden lg:table-cell"><Bone className="h-4 w-10" /></td>
      <td className="py-2.5 px-3 hidden lg:table-cell"><Bone className="h-4 w-16" /></td>
      <td className="py-2.5 px-3 hidden xl:table-cell"><Bone className="h-4 w-20" /></td>
      <td className="py-2.5 px-3 hidden xl:table-cell"><Bone className="h-4 w-24" /></td>
      <td className="py-2.5 px-3 hidden xl:table-cell"><Bone className="h-4 w-16" /></td>
    </tr>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-fh-border bg-fh-panel overflow-hidden">
      <div className="bg-fh-panel-2 px-3 pb-2 pt-3 flex items-center gap-2">
        <Bone className="h-5 w-8" />
        <Bone className="h-4 w-8" />
      </div>
      <div className="px-3 pt-3 pb-4 flex flex-col gap-2">
        <Bone className="h-3 w-24" />
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-28 mt-1" />
        <Bone className="h-3 w-20 mt-2" />
      </div>
    </div>
  )
}

interface Props {
  view?: 'grid' | 'table'
}

export default function GarageSkeleton({ view = 'table' }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header — mirrors the two-line stat layout in GarageShowcase */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <Bone className="h-8 w-36" />
          {/* Two-line stat block: 10px label + 14px value — matches GarageShowcase header */}
          <div className="flex flex-col gap-0.5">
            <Bone className="h-2.5 w-6" />
            <Bone className="h-4 w-10" />
          </div>
          <div className="hidden sm:flex flex-col gap-0.5">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-4 w-24" />
          </div>
        </div>
        <Bone className="h-7 w-28 hidden sm:block" />
      </div>

      {/* Class chips */}
      <div className="flex flex-wrap gap-2">
        {[80, 72, 80, 64, 72, 64, 72].map((w, i) => (
          <Bone key={i} className={`h-14 rounded-lg`} style={{ width: w }} />
        ))}
      </div>

      {/* Division group filter */}
      <div className="flex gap-2 flex-wrap">
        {[96, 80, 112, 96, 88, 104].map((w, i) => (
          <Bone key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <Bone className="h-9 w-full max-w-xs rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-24 rounded-lg" />
      </div>

      {/* Source + tag chips */}
      <div className="flex gap-2 flex-wrap">
        {[88, 80, 96, 72, 88, 80].map((w, i) => (
          <Bone key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-fh-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-fh-panel border-b border-fh-border">
                {['Class','PI','Year','Make','Model'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">
                    {h}
                  </th>
                ))}
                <th className="hidden md:table-cell text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Division</th>
                <th className="hidden lg:table-cell text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Drive</th>
                <th className="hidden lg:table-cell text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Country</th>
                <th className="hidden xl:table-cell text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Source</th>
                <th className="hidden xl:table-cell text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Value</th>
                <th className="hidden xl:table-cell text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 14 }).map((_, i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}
    </div>
  )
}
