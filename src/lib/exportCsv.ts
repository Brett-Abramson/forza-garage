import type { Car } from '@/types/car'

export const CSV_HEADERS = [
  'Year', 'Make', 'Model', 'Division', 'Class', 'PI', 'Country', 'Value (Cr)',
] as const

/**
 * Formats a single CSV cell value:
 * - null / undefined → empty string
 * - Values starting with = + - @ are prefixed with ' to prevent spreadsheet
 *   formula injection (RFC 4180 + OWASP CSV injection guidance)
 * - Values containing commas, double-quotes, or newlines are wrapped in
 *   double-quotes with internal quotes doubled per RFC 4180
 */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  const sanitised = /^[=+\-@]/.test(str) ? `'${str}` : str
  return /[,"\n]/.test(sanitised) ? `"${sanitised.replace(/"/g, '""')}"` : sanitised
}

/**
 * Builds the full CSV string for a garage export.
 * Returns header row + one row per car, joined with \r\n (RFC 4180).
 * An empty cars array returns headers only.
 */
export function buildCsvString(cars: Car[]): string {
  const headerRow = CSV_HEADERS.join(',')
  const dataRows = cars.map((c) =>
    [
      csvCell(c.year),
      csvCell(c.make),
      csvCell(c.model),
      csvCell(c.division),
      csvCell(c.piClass),
      csvCell(c.piRating),
      csvCell(c.country),
      csvCell(c.value ?? ''),
    ].join(',')
  )
  return [headerRow, ...dataRows].join('\r\n')
}

/**
 * Returns the export filename for a given date.
 * Defaults to today. Format: forza-garage-YYYY-MM-DD.csv
 */
export function csvFilename(date: Date = new Date()): string {
  return `forza-garage-${date.toISOString().slice(0, 10)}.csv`
}
