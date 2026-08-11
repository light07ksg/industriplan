export type MeasurementUnit = 'mm' | 'cm' | 'm'

/** Default: 1 grid cell (40 world units) represents 1 meter. Overridable per-project via the scale setting. */
export const DEFAULT_METERS_PER_GRID_CELL = 1

export const UNIT_LABELS: Record<MeasurementUnit, string> = {
  mm: 'Milímetros',
  cm: 'Centímetros',
  m: 'Metros',
}

const UNIT_METERS_FACTOR: Record<MeasurementUnit, number> = { mm: 1000, cm: 100, m: 1 }
const UNIT_DECIMALS: Record<MeasurementUnit, number> = { mm: 0, cm: 1, m: 2 }

/** World units -> a plain number in the current display unit, for editable fields (X/Y/width/height). */
export function toDisplayLength(worldUnits: number, unit: MeasurementUnit, metersPerWorldUnit: number): number {
  const meters = worldUnits * metersPerWorldUnit
  return Number((meters * UNIT_METERS_FACTOR[unit]).toFixed(UNIT_DECIMALS[unit]))
}

/** Inverse of toDisplayLength — a value typed in the current display unit back to world units. */
export function fromDisplayLength(displayValue: number, unit: MeasurementUnit, metersPerWorldUnit: number): number {
  if (metersPerWorldUnit === 0) return 0
  return displayValue / UNIT_METERS_FACTOR[unit] / metersPerWorldUnit
}

export function formatLength(worldUnits: number, unit: MeasurementUnit, metersPerWorldUnit: number): string {
  const meters = Math.abs(worldUnits) * metersPerWorldUnit
  switch (unit) {
    case 'mm':
      return `${Math.round(meters * 1000)} mm`
    case 'cm':
      return `${(meters * 100).toFixed(1)} cm`
    case 'm':
      return `${meters.toFixed(2)} m`
  }
}

export function formatArea(worldUnitsSquared: number, unit: MeasurementUnit, metersPerWorldUnit: number): string {
  const metersSq = Math.abs(worldUnitsSquared) * metersPerWorldUnit * metersPerWorldUnit
  switch (unit) {
    case 'mm':
      return `${Math.round(metersSq * 1_000_000)} mm²`
    case 'cm':
      return `${(metersSq * 10_000).toFixed(1)} cm²`
    case 'm':
      return `${metersSq.toFixed(2)} m²`
  }
}
