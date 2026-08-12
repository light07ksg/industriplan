import { Suspense, lazy, useState } from 'react'
import { ChevronLeft, ChevronRight, Factory, Loader2, Settings, User as UserIcon } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useIsMobile } from '@/lib/useIsMobile'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ProfilePanel } from '@/components/ProfilePanel'
import { UsageHint } from '@/components/UsageHint'
import { Canvas } from '@/features/editor/Canvas'
import { Toolbar } from '@/features/editor/Toolbar'
import { SymbolLibrary } from '@/features/symbols/SymbolLibrary'
import { RightSidebar } from '@/features/editor/RightSidebar'
import { ProjectBar } from '@/features/projects/ProjectBar'

// Three.js/react-three-fiber are ~600kB gzipped — loaded on demand only when the 3D view is
// actually opened, so the initial editor load doesn't pay for a feature most sessions won't use.
const Scene3D = lazy(() => import('@/features/scene3d/Scene3D').then((m) => ({ default: m.Scene3D })))

export function AppShell() {
  const isMobile = useIsMobile()
  const symbolsPanelOpen = useUIStore((s) => s.symbolsPanelOpen)
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen)
  const toggleSymbolsPanel = useUIStore((s) => s.toggleSymbolsPanel)
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel)
  const avatarDataUrl = useAuthStore((s) => s.user?.user_metadata?.avatarDataUrl)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [view3DOpen, setView3DOpen] = useState(false)

  return (
    // `h-dvh` (dynamic viewport height) instead of `h-screen` (100vh) — on mobile, `100vh`
    // includes space the browser's own address bar/toolbar can be covering, so a fixed-position
    // element sized against it can end up rendered partly underneath that browser chrome.
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-surface text-text-primary">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border bg-surface-alt px-4 py-2 md:h-14 md:flex-nowrap md:py-0">
        <div className="flex min-w-0 items-center gap-2">
          <Factory className="h-5 w-5 shrink-0 text-accent" />
          <span className="hidden text-sm font-semibold tracking-wide sm:inline">INDUSTRIPLAN</span>

          <ProjectBar />
        </div>

        <div className="order-3 w-full min-w-0 overflow-x-auto md:order-none md:w-auto">
          <Toolbar onOpen3D={() => setView3DOpen(true)} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

      <UsageHint />

      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
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
        )}

        <main className="relative flex-1 overflow-hidden">
          <Canvas />
          {view3DOpen && (
            <Suspense
              fallback={
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              }
            >
              <Scene3D onClose={() => setView3DOpen(false)} />
            </Suspense>
          )}
        </main>

        {!isMobile && (
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
        )}

        {isMobile && !symbolsPanelOpen && (
          // Same arrow-tab language as the desktop edge toggles above, just pinned to the actual
          // screen edge instead of a panel that isn't there — familiar and easy to spot.
          <button
            onClick={toggleSymbolsPanel}
            title="Mostrar panel de símbolos"
            className="fixed top-1/2 left-0 z-30 flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-surface-border bg-surface-alt text-text-secondary shadow-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {isMobile && symbolsPanelOpen && (
          <div className="fixed inset-0 z-40 flex">
            <button
              aria-label="Cerrar panel de símbolos"
              onClick={toggleSymbolsPanel}
              className="absolute inset-0 bg-black/40"
            />
            <div className="relative h-full shadow-xl">
              <SymbolLibrary />
              <button
                onClick={toggleSymbolsPanel}
                title="Ocultar panel de símbolos"
                className="absolute top-1/2 -right-7 z-10 flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-surface-border bg-surface-alt text-text-secondary shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {isMobile && !rightPanelOpen && (
          <button
            onClick={toggleRightPanel}
            title="Mostrar capas y propiedades"
            className="fixed top-1/2 right-0 z-30 flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-surface-border bg-surface-alt text-text-secondary shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {isMobile && rightPanelOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <button
              aria-label="Cerrar panel de capas y propiedades"
              onClick={toggleRightPanel}
              className="absolute inset-0 bg-black/40"
            />
            <div className="relative h-full shadow-xl">
              <button
                onClick={toggleRightPanel}
                title="Ocultar capas y propiedades"
                className="absolute top-1/2 -left-7 z-10 flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-surface-border bg-surface-alt text-text-secondary shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <RightSidebar />
            </div>
          </div>
        )}
      </div>

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </div>
  )
}
