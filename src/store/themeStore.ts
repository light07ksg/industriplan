import { create } from 'zustand'
import { ACCENT_THEME_LABELS, type AccentTheme } from '@/lib/theme'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'plano-industrial-theme'
const ACCENT_STORAGE_KEY = 'plano-industrial-accent-theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialAccentTheme(): AccentTheme {
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY)
  return stored && stored in ACCENT_THEME_LABELS ? (stored as AccentTheme) : 'azul'
}

interface ThemeState {
  theme: Theme
  accentTheme: AccentTheme
  toggleTheme: () => void
  setAccentTheme: (accentTheme: AccentTheme) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  accentTheme: getInitialAccentTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    set({ theme: next })
  },
  setAccentTheme: (accentTheme) => {
    localStorage.setItem(ACCENT_STORAGE_KEY, accentTheme)
    set({ accentTheme })
  },
}))
