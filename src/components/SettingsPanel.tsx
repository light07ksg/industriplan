import { Check, Moon, Sun, X } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { ACCENT_THEME_LABELS, type AccentTheme } from '@/lib/theme'

const ACCENT_THEMES: AccentTheme[] = ['azul', 'negro']

const ACCENT_SWATCH: Record<AccentTheme, { light: string; dark: string }> = {
  azul: { light: '#0891b2', dark: '#22d3ee' },
  negro: { light: '#1e293b', dark: '#e2e8f0' },
}

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const accentTheme = useThemeStore((s) => s.accentTheme)
  const setAccentTheme = useThemeStore((s) => s.setAccentTheme)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configuración"
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg border border-surface-border bg-surface-alt p-4 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Configuración</h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-surface-inset hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-[11px] font-medium tracking-wide text-text-secondary uppercase">
            Modo de interfaz
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              aria-pressed={theme === 'light'}
              className={`flex h-9 items-center justify-center gap-2 rounded-md border text-xs font-medium transition-colors duration-150 ${
                theme === 'light'
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              <Sun className="h-4 w-4" />
              Claro
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              aria-pressed={theme === 'dark'}
              className={`flex h-9 items-center justify-center gap-2 rounded-md border text-xs font-medium transition-colors duration-150 ${
                theme === 'dark'
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-[11px] font-medium tracking-wide text-text-secondary uppercase">
            Color de acento
          </h3>
          <p className="mb-2 text-[10px] text-text-secondary">
            Afecta la cuadrícula resaltada, las selecciones y el texto de las opciones activas.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ACCENT_THEMES.map((option) => {
              const isSelected = accentTheme === option
              const swatchColor = theme === 'dark' ? ACCENT_SWATCH[option].dark : ACCENT_SWATCH[option].light
              return (
                <button
                  key={option}
                  onClick={() => setAccentTheme(option)}
                  aria-pressed={isSelected}
                  className={`flex h-9 items-center justify-center gap-2 rounded-md border text-xs font-medium transition-colors duration-150 ${
                    isSelected
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-surface-border"
                    style={{ background: swatchColor }}
                  />
                  {ACCENT_THEME_LABELS[option]}
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
