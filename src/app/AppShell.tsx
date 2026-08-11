import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Factory, Settings, User as UserIcon } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ProfilePanel } from '@/components/ProfilePanel'
import { Canvas } from '@/features/editor/Canvas'
import { Toolbar } from '@/features/editor/Toolbar'
import { SymbolLibrary } from '@/features/symbols/SymbolLibrary'
import { RightSidebar } from '@/features/editor/RightSidebar'
import { ProjectBar } from '@/features/projects/ProjectBar'

export function AppShell() {
  const theme = useThemeStore((s) => s.theme)
  const accentTheme = useThemeStore((s) => s.accentTheme)
  const symbolsPanelOpen = useUIStore((s) => s.symbolsPanelOpen)
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen)
  const toggleSymbolsPanel = useUIStore((s) => s.toggleSymbolsPanel)
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel)
  const avatarDataUrl = useAuthStore((s) => s.user?.user_metadata?.avatarDataUrl)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('accent-negro', accentTheme === 'negro')
  }, [accentTheme])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border bg-surface-alt px-4">
        <div className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold tracking-wide">INDUSTRIPLAN</span>

          <ProjectBar />
        </div>

        <Toolbar />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={() => setSettingsOpen(true)}
            title="Configuración"
            aria-pressed={settingsOpen}
            className="flex h-8 w-8 items-center justify-center rounded border border-surface-border bg-surface-alt text-text-secondary transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            onClick={() => setProfileOpen(true)}
            title="Perfil"
            aria-pressed={profileOpen}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-surface-alt text-text-secondary transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="Perfil" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex h-full shrink-0">
          {symbolsPanelOpen && <SymbolLibrary />}
          <button
            onClick={toggleSymbolsPanel}
            title={symbolsPanelOpen ? 'Ocultar panel de símbolos' : 'Mostrar panel de símbolos'}
            aria-pressed={symbolsPanelOpen}
            className="absolute top-1/2 -right-3 z-10 flex h-9 w-6 -translate-y-1/2 items-center justify-center rounded border border-surface-border bg-surface-alt text-text-secondary shadow-sm transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            {symbolsPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <main className="relative flex-1 overflow-hidden">
          <Canvas />
        </main>

        <div className="relative flex h-full shrink-0">
          <button
            onClick={toggleRightPanel}
            title={rightPanelOpen ? 'Ocultar capas y propiedades' : 'Mostrar capas y propiedades'}
            aria-pressed={rightPanelOpen}
            className="absolute top-1/2 -left-3 z-10 flex h-9 w-6 -translate-y-1/2 items-center justify-center rounded border border-surface-border bg-surface-alt text-text-secondary shadow-sm transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {rightPanelOpen && <RightSidebar />}
        </div>
      </div>

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </div>
  )
}
