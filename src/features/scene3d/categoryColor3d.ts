import type { SymbolCategory } from '@/features/symbols/iconPrimitives'

// The 2D catalog reuses a handful of theme colors across categories (icon shape does the rest of
// the differentiating there), but in 3D symbols render as plain boxes with no icon — so every
// category needs its own distinct, theme-independent color here or same-colored categories become
// indistinguishable blocks.
export const CATEGORY_COLOR_3D: Record<SymbolCategory, string> = {
  estructura: '#5b6b7f',
  maquinaria: '#4e79a7',
  almacenamiento: '#f28e2b',
  proceso: '#f1ce63',
  seguridad: '#e15759',
  dormitorio: '#d37295',
  sala: '#499894',
  bano: '#b07aa1',
  cocina: '#9c755f',
  oficina: '#59a14f',
  exterior: '#a0cbe8',
  edificio: '#79706e',
}
