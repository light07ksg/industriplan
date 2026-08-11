import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { AuthScreen } from '@/features/auth/AuthScreen'
import { Dashboard } from '@/features/projects/Dashboard'
import { SharedProjectView } from '@/features/projects/SharedProjectView'
import { AppShell } from './AppShell'

function App() {
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)
  const init = useAuthStore((s) => s.init)
  const currentProjectId = useProjectSessionStore((s) => s.currentProjectId)

  useEffect(() => {
    init()
  }, [init])

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

  if (!user) return <AuthScreen />

  if (!currentProjectId) return <Dashboard />

  return <AppShell />
}

export default App
