import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { useThemeStore } from '@/store/themeStore'
import { ACCENT_CLASS_NAMES, getAccentClassName } from '@/lib/theme'
import { AuthScreen } from '@/features/auth/AuthScreen'
import { LandingScreen } from '@/features/auth/LandingScreen'
import { Dashboard } from '@/features/projects/Dashboard'
import { SharedProjectView } from '@/features/projects/SharedProjectView'
import { AppShell } from './AppShell'

function App() {
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)
  const init = useAuthStore((s) => s.init)
  const currentProjectId = useProjectSessionStore((s) => s.currentProjectId)
  const theme = useThemeStore((s) => s.theme)
  const accentTheme = useThemeStore((s) => s.accentTheme)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    init()
  }, [init])

  // Applied here at the app root (not inside AppShell) so the theme/accent also reach the
  // Dashboard, auth, and landing screens — previously these classes were only toggled once the
  // editor mounted, so anything before login rendered in light/azul regardless of stored prefs.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    ACCENT_CLASS_NAMES.forEach((cls) => root.classList.remove(cls))
    const next = getAccentClassName(accentTheme)
    if (next) root.classList.add(next)
  }, [accentTheme])

  // A shared read-only link works without a session, so it's checked before auth even loads.
  const sharedProjectId = new URLSearchParams(window.location.search).get('share')
  if (sharedProjectId) return <SharedProjectView projectId={sharedProjectId} />

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (!user) {
    if (showLanding) return <LandingScreen onStart={() => setShowLanding(false)} />
    return <AuthScreen />
  }

  if (!currentProjectId) return <Dashboard />

  return <AppShell />
}

export default App
