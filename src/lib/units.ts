export type MeasurementUnit = 'mm' | 'cm' | 'm'

/** Default: 1 grid cell (40 world units) represents 1 meter. Overridable per-project via the scale setting. */
export const DEFAULT_METERS_PER_GRID_CELL = 1

export const UNIT_LABELS: Record<MeasurementUnit, string> = {
  mm: 'Milímetros',
  cm: 'Centímetros',
  m: 'Metros',
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
