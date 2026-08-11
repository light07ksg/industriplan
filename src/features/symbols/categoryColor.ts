import type { ThemePalette } from '@/lib/theme'
import type { SymbolCategory } from './iconPrimitives'

export function categoryColor(category: SymbolCategory, colors: ThemePalette): string {
  switch (category) {
    case 'estructura':
      return colors.structure
    case 'maquinaria':
      return colors.accent
    case 'almacenamiento':
      return colors.accentAlt
    case 'proceso':
      return colors.warning
    case 'seguridad':
      return colors.danger
    case 'dormitorio':
      return colors.accent
    case 'sala':
      return colors.accentAlt
    case 'bano':
      return colors.warning
    case 'cocina':
      return colors.danger
    case 'oficina':
      return colors.structure
    case 'exterior':
      return colors.accent
    case 'edificio':
      return colors.accentAlt
  }
}

export function categorySoftColor(category: SymbolCategory, colors: ThemePalette): string {
  switch (category) {
    case 'estructura':
      return colors.structureSoft
    case 'maquinaria':
      return colors.accentSoft
    case 'almacenamiento':
      return colors.accentSoft
    case 'proceso':
      return colors.warningSoft
    case 'seguridad':
      return colors.dangerSoft
    case 'dormitorio':
      return colors.accentSoft
    case 'sala':
      return colors.accentSoft
    case 'bano':
      return colors.warningSoft
    case 'cocina':
      return colors.dangerSoft
    case 'oficina':
      return colors.structureSoft
    case 'exterior':
      return colors.accentSoft
    case 'edificio':
      return colors.accentSoft
  }
}
