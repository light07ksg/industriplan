import { useEffect, useState } from 'react'
import { Factory, FolderOpen, Loader2, LogOut, Plus, Trash2, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { ProfilePanel } from '@/components/ProfilePanel'
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">{user?.email}</span>
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

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-6">
        <h1 className="mb-4 text-sm font-semibold tracking-wide text-text-secondary uppercase">Mis proyectos</h1>

        <div className="mb-6 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Nombre del nuevo proyecto"
            className="flex-1 rounded-md border border-surface-border bg-surface-alt px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Nuevo proyecto
          </button>
        </div>

        {sessionError && <p className="mb-3 rounded bg-danger-soft px-3 py-2 text-xs text-danger">{sessionError}</p>}
        {error && <p className="mb-3 rounded bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>}
        {loading && <p className="text-sm text-text-secondary">Cargando proyectos…</p>}

        {!loading && projects.length === 0 && !error && (
          <p className="text-sm text-text-secondary">Todavía no tienes proyectos. Crea el primero arriba.</p>
        )}

        <div className="flex flex-col gap-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border border-surface-border bg-surface-alt p-3 transition-colors duration-150 hover:border-accent"
            >
              <button onClick={() => openProject(p)} className="flex flex-1 items-center gap-3 text-left">
                <FolderOpen className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[10px] text-text-secondary">Editado {new Date(p.updated_at).toLocaleString()}</p>
                </div>
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                title="Eliminar proyecto"
                className="flex h-8 w-8 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
              >
                {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
