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
export type AccentTheme = 'azul' | 'negro' | 'verde' | 'violeta' | 'naranja' | 'rosa' | 'amarillo' | 'indigo' | 'gris' | 'lima'

export const ACCENT_THEME_LABELS: Record<AccentTheme, string> = {
  azul: 'Azul',
  negro: 'Negro',
  verde: 'Verde',
  violeta: 'Violeta',
  naranja: 'Naranja',
  rosa: 'Rosa',
  amarillo: 'Amarillo',
  indigo: 'Índigo',
  gris: 'Gris',
  lima: 'Lima',
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
    verde: {
      accent: '#059669',
      accentAlt: '#0d9488',
      accentSoft: 'rgba(5, 150, 105, 0.12)',
    },
    violeta: {
      accent: '#7c3aed',
      accentAlt: '#c026d3',
      accentSoft: 'rgba(124, 58, 237, 0.12)',
    },
    naranja: {
      accent: '#ea580c',
      accentAlt: '#d97706',
      accentSoft: 'rgba(234, 88, 12, 0.12)',
    },
    rosa: {
      accent: '#db2777',
      accentAlt: '#e11d48',
      accentSoft: 'rgba(219, 39, 119, 0.12)',
    },
    amarillo: {
      accent: '#ca8a04',
      accentAlt: '#a16207',
      accentSoft: 'rgba(202, 138, 4, 0.12)',
    },
    indigo: {
      accent: '#4f46e5',
      accentAlt: '#4338ca',
      accentSoft: 'rgba(79, 70, 229, 0.12)',
    },
    gris: {
      accent: '#52525b',
      accentAlt: '#71717a',
      accentSoft: 'rgba(82, 82, 91, 0.12)',
    },
    lima: {
      accent: '#65a30d',
      accentAlt: '#4d7c0f',
      accentSoft: 'rgba(101, 163, 13, 0.12)',
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
    verde: {
      accent: '#34d399',
      accentAlt: '#2dd4bf',
      accentSoft: 'rgba(52, 211, 153, 0.16)',
    },
    violeta: {
      accent: '#a78bfa',
      accentAlt: '#e879f9',
      accentSoft: 'rgba(167, 139, 250, 0.16)',
    },
    naranja: {
      accent: '#fb923c',
      accentAlt: '#fbbf24',
      accentSoft: 'rgba(251, 146, 60, 0.16)',
    },
    rosa: {
      accent: '#f472b6',
      accentAlt: '#fb7185',
      accentSoft: 'rgba(244, 114, 182, 0.16)',
    },
    amarillo: {
      accent: '#facc15',
      accentAlt: '#eab308',
      accentSoft: 'rgba(250, 204, 21, 0.16)',
    },
    indigo: {
      accent: '#818cf8',
      accentAlt: '#6366f1',
      accentSoft: 'rgba(129, 140, 248, 0.16)',
    },
    gris: {
      accent: '#a1a1aa',
      accentAlt: '#d4d4d8',
      accentSoft: 'rgba(161, 161, 170, 0.16)',
    },
    lima: {
      accent: '#a3e635',
      accentAlt: '#bef264',
      accentSoft: 'rgba(163, 230, 53, 0.16)',
    },
  },
}

export function getThemePalette(mode: 'light' | 'dark', accentTheme: AccentTheme): ThemePalette {
  return { ...basePalettes[mode], ...accentPalettes[mode][accentTheme] }
}

/** CSS class names for every non-default accent theme (see the `.accent-*` rules in index.css).
 * 'azul' is the default palette baked into `:root`/`.dark`, so it has no override class. */
export const ACCENT_CLASS_NAMES = (Object.keys(ACCENT_THEME_LABELS) as AccentTheme[])
  .filter((t) => t !== 'azul')
  .map((t) => `accent-${t}`)

export function getAccentClassName(accentTheme: AccentTheme): string | null {
  return accentTheme === 'azul' ? null : `accent-${accentTheme}`
}
