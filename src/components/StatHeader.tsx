/**
 * Column/field header that keeps the field name stable (POWER, TORQUE,
 * WEIGHT) and shows the active unit as small subtext beneath it. Prevents
 * the label itself from being swapped for the unit abbreviation.
 *
 * Usage (table header cell via SortTh's unit prop):
 *   <SortTh label="Power" unit={labels.power} ... />
 *
 * Usage (drawer spec tile label):
 *   <StatHeader label="Power" unit={labels.power} />
 */

interface Props {
  label:    string
  unit:     string
  /** Drawer spec tiles put the small text first; table headers put it second. */
  reverse?: boolean
  className?: string
}

export function StatHeader({ label, unit, reverse = false, className = '' }: Props) {
  const labelEl = (
    <span className="uppercase tracking-wide">{label}</span>
  )
  const unitEl = (
    <span className="text-[10px] font-normal normal-case text-fh-muted">{unit}</span>
  )

  return (
    <span className={`flex flex-col leading-tight gap-0.5 ${className}`}>
      {reverse ? <>{unitEl}{labelEl}</> : <>{labelEl}{unitEl}</>}
    </span>
  )
}
