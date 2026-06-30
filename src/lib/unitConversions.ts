/**
 * unitConversions.ts — Pure display-layer unit conversion utilities.
 *
 * All DB values are stored in English units (lb, hp, ft-lb, mph, ft).
 * These functions convert them for display only — the DB is never written
 * with converted values.
 *
 */

export type UnitSystem  = 'English' | 'Metric'
export type PowerUnit   = 'hp' | 'PS' | 'kW'

export interface UnitPreferences {
  units:      UnitSystem
  powerUnits: PowerUnit
}

export const DEFAULT_PREFS: UnitPreferences = {
  units:      'English',
  powerUnits: 'hp',
}

// ── Weight (lb → kg) ──────────────────────────────────────────────────────────

export function convertWeight(
  lb: number | null,
  units: UnitSystem,
): { value: number | null; label: string } {
  const label = units === 'Metric' ? 'KG' : 'LB'
  if (lb === null) return { value: null, label }
  return units === 'Metric'
    ? { value: Math.round(lb * 0.453592), label }
    : { value: lb, label }
}

// ── Power (hp → PS | kW) ──────────────────────────────────────────────────────

export function convertPower(
  hp: number | null,
  powerUnit: PowerUnit,
): { value: number | null; label: string } {
  if (hp === null) return { value: null, label: powerUnit.toUpperCase() }
  switch (powerUnit) {
    case 'PS': return { value: Math.round(hp * 1.01387), label: 'PS' }
    case 'kW': return { value: Math.round(hp * 0.74570), label: 'KW' }
    default:   return { value: hp, label: 'HP' }
  }
}

// ── Torque (ft-lb → Nm) ───────────────────────────────────────────────────────

export function convertTorque(
  ftLb: number | null,
  units: UnitSystem,
): { value: number | null; label: string } {
  const label = units === 'Metric' ? 'NM' : 'FT-LB'
  if (ftLb === null) return { value: null, label }
  return units === 'Metric'
    ? { value: Math.round(ftLb * 1.35582), label }
    : { value: ftLb, label }
}

// ── Speed (mph → km/h) ────────────────────────────────────────────────────────

export function convertSpeed(
  mph: number | null,
  units: UnitSystem,
): { value: number | null; label: string } {
  const label = units === 'Metric' ? 'KM/H' : 'MPH'
  if (mph === null) return { value: null, label }
  return units === 'Metric'
    ? { value: Math.round(mph * 1.60934), label }
    : { value: mph, label }
}

// ── Braking distance (ft → m) ─────────────────────────────────────────────────

export function convertBraking(
  ft: number | null,
  units: UnitSystem,
): { value: number | null; label: string } {
  const label = units === 'Metric' ? 'M' : 'FT'
  if (ft === null) return { value: null, label }
  return units === 'Metric'
    ? { value: Math.round(ft * 0.3048), label }
    : { value: ft, label }
}

// ── Accel labels — seconds don't change, but the speed reference does ─────────

/**
 * Returns the display label for a sim 0-N time column.
 *
 * 0-60 MPH  → "0-60 MPH"  (English) | "0-97 KM/H"  (Metric)
 * 0-100 MPH → "0-100 MPH" (English) | "0-161 KM/H" (Metric)
 *
 * The seconds value itself is stored for the given MPH threshold and is
 * unchanged — only the label shifts to the nearest km/h equivalent.
 */
export function accelLabel(mph: 60 | 100, units: UnitSystem): string {
  if (units === 'English') return `0-${mph} MPH`
  const kmh = Math.round(mph * 1.60934)
  return `0-${kmh} KM/H`
}

// ── Centralized header labels ─────────────────────────────────────────────────

/**
 * Single source of truth for the small unit-abbreviation subtext shown under
 * a column/field label (e.g. "POWER" / "hp"). Build any future unit label from
 * this rather than by hand — that's how the P:W "hp/lb" hardcoding happened.
 */
export function getUnitLabels(prefs: UnitPreferences) {
  const power   = prefs.powerUnits                                  // "hp" | "PS" | "kW"
  const torque  = prefs.units === 'Metric' ? 'Nm'   : 'ft-lb'
  const weight  = prefs.units === 'Metric' ? 'kg'   : 'lb'
  const speed   = prefs.units === 'Metric' ? 'km/h' : 'mph'
  const braking = prefs.units === 'Metric' ? 'm'    : 'ft'
  const ratio   = `${power}/${weight}`                              // e.g. "hp/lb", "kW/kg"

  return { power, torque, weight, speed, braking, ratio }
}

