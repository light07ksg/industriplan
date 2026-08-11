import { useEffect, useState } from 'react'
import { Eye, Factory, Loader2 } from 'lucide-react'
import { useCanvasStore } from '@/store/canvasStore'
import { Canvas } from '@/features/editor/Canvas'
import { getPublicProject, type ProjectRow } from './projectsApi'

interface SharedProjectViewProps {
  projectId: string
}

type Status = 'loading' | 'ready' | 'not-found' | 'error'

/** Public, read-only view for a project someone shared via "Compartir" — reachable without an
 * account. Loads the plan into the same canvasStore Canvas already reads from, then renders it
 * with editing disabled. */
export function SharedProjectView({ projectId }: SharedProjectViewProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [project, setProject] = useState<ProjectRow | null>(null)
  const loadSnapshot = useCanvasStore((s) => s.loadSnapshot)

  useEffect(() => {
    let cancelled = false
    getPublicProject(projectId)
      .then((row) => {
        if (cancelled) return
        if (!row) {
          setStatus('not-found')
          return
        }
        loadSnapshot(row.canvas_data)
        setProject(row)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (status !== 'ready') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-surface p-6 text-center text-text-primary">
        <Factory className="h-8 w-8 text-accent" />
        <h1 className="text-sm font-semibold">Este plano no está disponible</h1>
        <p className="max-w-xs text-xs text-text-secondary">
          {status === 'not-found'
            ? 'El enlace es incorrecto o su dueño dejó de compartirlo.'
            : 'Hubo un problema al cargarlo. Probá de nuevo en un momento.'}
        </p>
        <a href="/" className="mt-2 text-xs font-medium text-accent hover:underline">
          Ir a INDUSTRIPLAN
        </a>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface text-text-primary">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border bg-surface-alt px-4">
        <div className="flex items-center gap-2">
          <Factory className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold tracking-wide">INDUSTRIPLAN</span>
          <span className="text-text-secondary">·</span>
          <span className="text-xs text-text-secondary">{project?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
            <Eye className="h-3 w-3" />
            Solo lectura
          </span>
          <a href="/" className="text-xs font-medium text-accent hover:underline">
            Crear tu propio plano
          </a>
        </div>
      </header>
      <main className="relative flex-1 overflow-hidden">
        <Canvas readOnly />
      </main>
    </div>
  )
}
