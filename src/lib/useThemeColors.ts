import { useThemeStore } from '@/store/themeStore'
import { getThemePalette, type ThemePalette } from '@/lib/theme'

export function useThemeColors(): ThemePalette {
  const theme = useThemeStore((s) => s.theme)
  const accentTheme = useThemeStore((s) => s.accentTheme)
  return getThemePalette(theme, accentTheme)
}
