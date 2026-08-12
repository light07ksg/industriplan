import { useEffect, useState } from 'react'
import { Factory, FolderOpen, Loader2, LogOut, Plus, Settings, Trash2, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { ProfilePanel } from '@/components/ProfilePanel'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ThemeToggle } from '@/components/ThemeToggle'
import { deleteProject, listProjects, type ProjectRow } from './projectsApi'

export function Dashboard() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const saving = useProjectSessionStore((s) => s.saving)
  const sessionError = useProjectSessionStore((s) => s.error)
  const openProject = useProjectSessionStore((s) => s.openProject)
  const startNewProject = useProjectSessionStore((s) => s.startNewProject)
  const avatarDataUrl = user?.user_metadata?.avatarDataUrl
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      setProjects(await listProjects())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = () => {
    const name = newName.trim() || 'Proyecto sin título'
    startNewProject(name)
    setNewName('')
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteProject(id)
      await refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-surface text-text-primary">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border bg-surface-alt px-4">
        <div className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold tracking-wide">INDUSTRIPLAN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-text-secondary sm:inline">{user?.email}</span>
          <ThemeToggle />
          <button
            onClick={() => setSettingsOpen(true)}
            title="Configuración"
            aria-pressed={settingsOpen}
            className="flex h-8 w-8 items-center justify-center rounded border border-surface-border bg-surface text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            title="Perfil"
            aria-pressed={profileOpen}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-surface text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="Perfil" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => signOut()}
            title="Cerrar sesión"
            className="flex h-8 w-8 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}

      <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Mis proyectos</h1>
            <p className="text-xs text-text-secondary">
              {projects.length === 0 ? 'Todavía no tienes proyectos' : `${projects.length} proyecto${projects.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-2 rounded-lg border border-dashed border-surface-border bg-surface-alt p-4 sm:flex-row sm:items-center">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Nombre del nuevo proyecto"
            className="flex-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Nuevo proyecto
          </button>
        </div>

        {sessionError && <p className="mb-3 rounded bg-danger-soft px-3 py-2 text-xs text-danger">{sessionError}</p>}
        {error && <p className="mb-3 rounded bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>}

        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando proyectos…
          </div>
        )}

        {!loading && projects.length === 0 && !error && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-surface-border bg-surface-alt py-14 text-center">
            <FolderOpen className="h-8 w-8 text-text-secondary" />
            <p className="text-sm text-text-secondary">Todavía no tienes proyectos. Crea el primero arriba.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-alt p-4 transition-colors duration-150 hover:border-accent hover:shadow-sm"
            >
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                title="Eliminar proyecto"
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded text-text-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-danger-soft hover:text-danger disabled:opacity-100"
              >
                {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => openProject(p)} className="flex flex-col items-start gap-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate pr-6 text-sm font-medium text-text-primary">{p.name}</p>
                  <p className="text-[10px] text-text-secondary">Editado {new Date(p.updated_at).toLocaleString()}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
