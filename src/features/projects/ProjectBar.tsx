import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileJson,
  FileText,
  Globe,
  Image,
  Loader2,
  Save,
  Share2,
  Upload,
  X,
} from 'lucide-react'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { useExportStore } from '@/store/exportStore'
import { useCanvasStore } from '@/store/canvasStore'
import { exportProjectToJson, parseProjectJson } from '@/features/export/exportCanvas'

export function ProjectBar() {
  const currentProjectId = useProjectSessionStore((s) => s.currentProjectId)
  const currentProjectName = useProjectSessionStore((s) => s.currentProjectName)
  const currentProjectIsPublic = useProjectSessionStore((s) => s.currentProjectIsPublic)
  const saving = useProjectSessionStore((s) => s.saving)
  const lastSavedAt = useProjectSessionStore((s) => s.lastSavedAt)
  const error = useProjectSessionStore((s) => s.error)
  const renameCurrent = useProjectSessionStore((s) => s.renameCurrent)
  const save = useProjectSessionStore((s) => s.save)
  const closeProject = useProjectSessionStore((s) => s.closeProject)
  const setPublic = useProjectSessionStore((s) => s.setPublic)

  const exporting = useExportStore((s) => s.exporting)
  const exportError = useExportStore((s) => s.error)
  const requestExport = useExportStore((s) => s.requestExport)

  const getSnapshot = useCanvasStore((s) => s.getSnapshot)
  const loadSnapshot = useCanvasStore((s) => s.loadSnapshot)
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  const importInputRef = useRef<HTMLInputElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (!exportMenuOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setExportMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [exportMenuOpen])

  const handleExportJson = () => {
    setExportMenuOpen(false)
    setJsonError(null)
    const ok = exportProjectToJson(getSnapshot(), currentProjectName)
    if (!ok) setJsonError('El plano está vacío, no hay nada que exportar.')
  }

  const handleImportJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const snapshot = parseProjectJson(text)
      pushHistory()
      loadSnapshot(snapshot)
      setJsonError(null)
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'No se pudo importar ese archivo.')
    }
  }

  const flashShareFeedback = (text: string) => {
    setShareFeedback(text)
    setTimeout(() => setShareFeedback(null), 2500)
  }

  const handleShare = async () => {
    if (!currentProjectId) {
      flashShareFeedback('Guardá el proyecto antes de compartirlo.')
      return
    }
    setSharing(true)
    try {
      if (!currentProjectIsPublic) {
        await setPublic(true)
      }
      const shareUrl = `${window.location.origin}/?share=${currentProjectId}`
      const shareData = {
        title: `${currentProjectName} — INDUSTRIPLAN`,
        text: `Mirá el plano "${currentProjectName}" en INDUSTRIPLAN.`,
        url: shareUrl,
      }
      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch {
          // El usuario canceló el diálogo de compartir; no es un error.
        }
      } else {
        await navigator.clipboard.writeText(shareUrl)
        flashShareFeedback('¡Enlace copiado! Cualquiera con este link puede ver el plano (solo lectura).')
      }
    } catch (err) {
      flashShareFeedback(err instanceof Error ? err.message : 'No se pudo compartir el proyecto.')
    } finally {
      setSharing(false)
    }
  }

  const handleUnshare = async () => {
    setSharing(true)
    try {
      await setPublic(false)
      flashShareFeedback('El plano ya no es público.')
    } catch (err) {
      flashShareFeedback(err instanceof Error ? err.message : 'No se pudo actualizar.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 border-l border-surface-border pl-3">
      <button
        onClick={closeProject}
        title="Volver a mis proyectos"
        className="flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <input
        value={currentProjectName}
        onChange={(e) => renameCurrent(e.target.value)}
        className="w-36 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm font-medium text-text-primary outline-none hover:border-surface-border focus:border-accent focus:bg-surface"
      />

      <button
        onClick={() => save()}
        disabled={saving}
        title="Guardar proyecto"
        className="flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Guardar
      </button>

      <div className="mx-0.5 h-5 w-px bg-surface-border" />

      <div ref={exportMenuRef} className="relative">
        <button
          onClick={() => setExportMenuOpen((o) => !o)}
          disabled={exporting}
          title="Exportar el plano"
          aria-pressed={exportMenuOpen}
          className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Exportar
          <ChevronDown className="h-3 w-3" />
        </button>

        {exportMenuOpen && (
          <div className="absolute top-full left-0 z-20 mt-1 w-40 rounded-md border border-surface-border bg-surface-alt py-1 shadow-lg">
            <button
              onClick={() => {
                setExportMenuOpen(false)
                requestExport('png')
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
            >
              <Image className="h-3.5 w-3.5" />
              Imagen PNG
            </button>
            <button
              onClick={() => {
                setExportMenuOpen(false)
                requestExport('pdf')
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
            >
              <FileText className="h-3.5 w-3.5" />
              Documento PDF
            </button>
            <button
              onClick={handleExportJson}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
            >
              <FileJson className="h-3.5 w-3.5" />
              Datos JSON
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => importInputRef.current?.click()}
        title="Importar un plano desde un archivo JSON"
        className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
      >
        <Upload className="h-3.5 w-3.5" />
        Importar
      </button>
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportJson} />

      <button
        onClick={handleShare}
        disabled={sharing}
        title="Compartir un enlace de solo lectura a este proyecto"
        className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {sharing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
        Compartir
      </button>

      {currentProjectIsPublic && (
        <button
          onClick={handleUnshare}
          disabled={sharing}
          title="Dejar de compartir: el enlace dejará de funcionar"
          className="flex h-7 items-center gap-1 rounded-md bg-accent-soft px-2 text-[10px] font-medium text-accent transition-colors duration-150 hover:bg-danger-soft hover:text-danger disabled:opacity-60"
        >
          <Globe className="h-3 w-3" />
          Público
          <X className="h-3 w-3" />
        </button>
      )}

      {shareFeedback ? (
        <span className="text-[10px] text-accent">{shareFeedback}</span>
      ) : jsonError ? (
        <span className="text-[10px] text-danger">{jsonError}</span>
      ) : exportError ? (
        <span className="text-[10px] text-danger">{exportError}</span>
      ) : error ? (
        <span className="text-[10px] text-danger">{error}</span>
      ) : lastSavedAt ? (
        <span className="flex items-center gap-1 text-[10px] text-text-secondary">
          <Check className="h-3 w-3" />
          Guardado {new Date(lastSavedAt).toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  )
}
