import type { Car } from '@/types/car'

export const CSV_HEADERS = [
  // Identity
  'Year', 'Make', 'Model', 'Division', 'Class', 'PI', 'Country',
  // Attributes
  'Rarity', 'Source', 'Source Info', 'Drive', 'Engine Type', 'Engine CC', 'Cylinders', 'Body Style',
  // Bar stats
  'Speed', 'Handling', 'Accel', 'Launch', 'Braking', 'Offroad',
  // Raw specs
  'HP', 'Torque (ft-lb)', 'Weight (lb)', 'Front Weight (%)', 'Displacement (L)',
  // Per-user stat overrides
  'Speed Override', 'Handling Override', 'Accel Override', 'Launch Override',
  'Braking Override', 'Offroad Override', 'HP Override', 'Torque Override',
  'Weight Override', 'Front Weight Override', 'Displacement Override', 'Rarity Override',
  // Garage metadata
  'Value (Cr)', 'Pinned', 'Added At', 'Notes', 'Tags',
] as const

export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  const sanitised = /^[=+\-@]/.test(str) ? `'${str}` : str
  return /[,"\n]/.test(sanitised) ? `"${sanitised.replace(/"/g, '""')}"` : sanitised
}

export function buildCsvString(cars: Car[]): string {
  const headerRow = CSV_HEADERS.join(',')
  const dataRows = cars.map((c) =>
    [
      // Identity
      csvCell(c.year),
      csvCell(c.make),
      csvCell(c.model),
      csvCell(c.division),
      csvCell(c.piClass),
      csvCell(c.piRating),
      csvCell(c.country),
      // Attributes
      csvCell(c.rarity),
      csvCell(c.source),
      csvCell(c.sourceInfo),
      csvCell(c.drivetrain),
      csvCell(c.engineType),
      csvCell(c.engineCC),
      csvCell(c.cylinders),
      csvCell(c.bodyStyle),
      // Bar stats
      csvCell(c.statSpeed),
      csvCell(c.statHandling),
      csvCell(c.statAcceleration),
      csvCell(c.statLaunch),
      csvCell(c.statBraking),
      csvCell(c.statOffroad),
      // Raw specs
      csvCell(c.powerHp),
      csvCell(c.torqueFtLb),
      csvCell(c.weightLb),
      csvCell(c.frontWeight),
      csvCell(c.displacementL),
      // Stat overrides
      csvCell(c.statSpeedOverride ?? ''),
      csvCell(c.statHandlingOverride ?? ''),
      csvCell(c.statAccelerationOverride ?? ''),
      csvCell(c.statLaunchOverride ?? ''),
      csvCell(c.statBrakingOverride ?? ''),
      csvCell(c.statOffroadOverride ?? ''),
      csvCell(c.powerHpOverride ?? ''),
      csvCell(c.torqueFtLbOverride ?? ''),
      csvCell(c.weightLbOverride ?? ''),
      csvCell(c.frontWeightOverride ?? ''),
      csvCell(c.displacementLOverride ?? ''),
      csvCell(c.rarityOverride ?? ''),
      // Garage metadata
      csvCell(c.value),
      csvCell(c.pinned != null ? String(c.pinned) : ''),
      csvCell(c.addedAt ?? ''),
      csvCell(c.notes ?? ''),
      csvCell(c.tags?.join('; ') ?? ''),
    ].join(',')
  )
  return [headerRow, ...dataRows].join('\r\n')
}

export function csvFilename(date: Date = new Date()): string {
  return `forza-garage-${date.toISOString().slice(0, 10)}.csv`
}
