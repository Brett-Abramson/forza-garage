// Server-renderable skeleton for the Car Database page.
// Replaces fallback={null} in the Suspense boundary so FCP ≈ TTFB.

function Bone({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`rounded bg-fh-panel-2 animate-pulse ${className}`} style={style} />
}

function TableRowSkeleton({ owned }: { owned?: boolean }) {
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
      <td className="py-2.5 px-3">
        <Bone className={owned ? 'h-7 w-16' : 'h-7 w-14'} />
      </td>
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
      <div className="px-3 pt-3 pb-3 flex flex-col gap-2">
        <Bone className="h-3 w-24" />
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-28 mt-1" />
        <Bone className="h-3 w-20 mt-2" />
      </div>
      <div className="px-3 pb-3">
        <Bone className="h-8 w-full rounded-lg" />
      </div>
    </div>
  )
}

interface Props {
  view?: 'grid' | 'table'
  totalCars?: number
}

export default function CarsSkeleton({ view = 'table', totalCars }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <Bone className="h-8 w-40" />
        <Bone className="h-4 w-64 mt-2" />
      </div>

      {/* Stats bar — h-9 matches the text-2xl font-bold line-height in the real component */}
      <div className="flex items-center gap-6">
        <Bone className="h-9 w-28" />
        <Bone className="h-1.5 flex-1 rounded-full" />
      </div>

      {/* Division group filter */}
      <div className="flex gap-2 flex-wrap">
        {[96, 80, 112, 96, 88, 104, 80].map((w, i) => (
          <Bone key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <Bone className="h-9 w-full max-w-xs rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-24 rounded-lg" />
        <Bone className="h-9 w-24 rounded-lg" />
      </div>

      {/* Source + tag chips */}
      <div className="flex gap-2 flex-wrap">
        {[88, 80, 96, 72, 88, 80, 72, 96, 80].map((w, i) => (
          <Bone key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-fh-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-fh-panel-2 border-b border-fh-border">
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
                <th className="text-left py-2.5 px-3 text-xs text-fh-muted font-medium uppercase tracking-wide">Garage</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }).map((_, i) => (
                <TableRowSkeleton key={i} owned={i < 3} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between pt-2">
        <Bone className="h-4 w-32" />
        <div className="flex gap-2">
          <Bone className="h-8 w-20 rounded-lg" />
          <Bone className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
