export interface ThemePalette {
  accent: string
  accentAlt: string
  accentSoft: string
  warning: string
  warningSoft: string
  danger: string
  dangerSoft: string
  structure: string
  structureSoft: string
  gridLine: string
  gridLineStrong: string
  canvasBg: string
  surfaceBorder: string
  textSecondary: string
}

/** The interface's accent identity — drives selection highlights, active tool text, and a couple
 * of symbol-category colors. Independent of light/dark mode, which controls background/foreground. */
export type AccentTheme = 'azul' | 'negro'

export const ACCENT_THEME_LABELS: Record<AccentTheme, string> = {
  azul: 'Azul',
  negro: 'Negro',
}

type BasePalette = Omit<ThemePalette, 'accent' | 'accentAlt' | 'accentSoft'>
type AccentPalette = Pick<ThemePalette, 'accent' | 'accentAlt' | 'accentSoft'>

const basePalettes: Record<'light' | 'dark', BasePalette> = {
  light: {
    warning: '#b45309',
    warningSoft: 'rgba(180, 83, 9, 0.12)',
    danger: '#dc2626',
    dangerSoft: 'rgba(220, 38, 38, 0.12)',
    structure: '#334155',
    structureSoft: 'rgba(51, 65, 85, 0.1)',
    gridLine: '#c7cedb',
    gridLineStrong: '#aab2c4',
    canvasBg: '#f5f7fb',
    surfaceBorder: '#d7dce6',
    textSecondary: '#5b6577',
  },
  dark: {
    warning: '#fbbf24',
    warningSoft: 'rgba(251, 191, 36, 0.14)',
    danger: '#f87171',
    dangerSoft: 'rgba(248, 113, 113, 0.14)',
    structure: '#cbd5e1',
    structureSoft: 'rgba(203, 213, 225, 0.12)',
    gridLine: '#16202f',
    gridLineStrong: '#223049',
    canvasBg: '#060a12',
    surfaceBorder: '#1c2536',
    textSecondary: '#8b96ac',
  },
}

const accentPalettes: Record<'light' | 'dark', Record<AccentTheme, AccentPalette>> = {
  light: {
    azul: {
      accent: '#0891b2',
      accentAlt: '#7c3aed',
      accentSoft: 'rgba(8, 145, 178, 0.12)',
    },
    negro: {
      accent: '#1e293b',
      accentAlt: '#475569',
      accentSoft: 'rgba(30, 41, 59, 0.10)',
    },
  },
  dark: {
    azul: {
      accent: '#22d3ee',
      accentAlt: '#a855f7',
      accentSoft: 'rgba(34, 211, 238, 0.16)',
    },
    negro: {
      accent: '#e2e8f0',
      accentAlt: '#94a3b8',
      accentSoft: 'rgba(226, 232, 240, 0.14)',
    },
  },
}

export function getThemePalette(mode: 'light' | 'dark', accentTheme: AccentTheme): ThemePalette {
  return { ...basePalettes[mode], ...accentPalettes[mode][accentTheme] }
}
