// Lightweight, on-brand loading spinner. Server-renderable (no client JS) so it
// works inside route-segment loading.tsx boundaries.

interface Props {
  /** Diameter in pixels. */
  size?: number
  /** Optional visible label below the spinner. */
  label?: string
  className?: string
}

export default function Spinner({ size = 32, label, className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center gap-3 ${className ?? ''}`}
    >
      <div
        className="animate-spin rounded-full border-2 border-fh-border border-t-fh-red"
        style={{ width: size, height: size }}
      />
      {label ? <span className="text-sm text-fh-muted">{label}</span> : null}
      <span className="sr-only">{label ?? 'Loading…'}</span>
    </div>
  )
}
