export type IconPrimitive =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'line'; points: number[] }
  | { kind: 'path'; d: string }
  | { kind: 'polygon'; points: number[] }

export type SymbolCategory =
  | 'estructura'
  | 'maquinaria'
  | 'almacenamiento'
  | 'proceso'
  | 'seguridad'
  | 'dormitorio'
  | 'sala'
  | 'bano'
  | 'cocina'
  | 'oficina'
  | 'exterior'
  | 'edificio'

/** Which tier a category belongs to in the symbol library's Básico/Avanzado toggle. */
export type SymbolTier = 'basico' | 'avanzado'

export interface SymbolDefinition {
  id: string
  category: SymbolCategory
  name: string
  defaultWidth: number
  defaultHeight: number
  /** Primitives are authored in a 100x100 coordinate box. */
  box: number
  primitives: IconPrimitive[]
  filled?: boolean
}

export const CATEGORY_LABELS: Record<SymbolCategory, string> = {
  estructura: 'Estructura',
  maquinaria: 'Maquinaria / Estaciones',
  almacenamiento: 'Almacenamiento',
  proceso: 'Flujo de proceso',
  seguridad: 'Seguridad industrial',
  dormitorio: 'Recámara',
  sala: 'Sala',
  bano: 'Baño',
  cocina: 'Cocina',
  oficina: 'Oficina',
  exterior: 'Exterior',
  edificio: 'Edificio',
}
