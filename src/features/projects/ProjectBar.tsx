import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, Check, FileJson, FileText, Image, Loader2, Save, Upload } from 'lucide-react'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { useExportStore } from '@/store/exportStore'
import { useCanvasStore } from '@/store/canvasStore'
import { exportProjectToJson, parseProjectJson } from '@/features/export/exportCanvas'

export function ProjectBar() {
  const currentProjectName = useProjectSessionStore((s) => s.currentProjectName)
  const saving = useProjectSessionStore((s) => s.saving)
  const lastSavedAt = useProjectSessionStore((s) => s.lastSavedAt)
  const error = useProjectSessionStore((s) => s.error)
  const renameCurrent = useProjectSessionStore((s) => s.renameCurrent)
  const save = useProjectSessionStore((s) => s.save)
  const closeProject = useProjectSessionStore((s) => s.closeProject)

  const exporting = useExportStore((s) => s.exporting)
  const exportError = useExportStore((s) => s.error)
  const requestExport = useExportStore((s) => s.requestExport)

  const getSnapshot = useCanvasStore((s) => s.getSnapshot)
  const loadSnapshot = useCanvasStore((s) => s.loadSnapshot)
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleExportJson = () => {
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

      <button
        onClick={() => requestExport('png')}
        disabled={exporting}
        title="Exportar como imagen PNG"
        className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Image className="h-3.5 w-3.5" />}
        PNG
      </button>

      <button
        onClick={() => requestExport('pdf')}
        disabled={exporting}
        title="Exportar como PDF"
        className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        PDF
      </button>

      <button
        onClick={handleExportJson}
        title="Exportar como JSON (para seguir editando después o en otra compu)"
        className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
      >
        <FileJson className="h-3.5 w-3.5" />
        JSON
      </button>

      <button
        onClick={() => importInputRef.current?.click()}
        title="Importar un plano desde un archivo JSON"
        className="flex h-7 items-center gap-1.5 rounded-md border border-surface-border px-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
      >
        <Upload className="h-3.5 w-3.5" />
        Importar
      </button>
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportJson} />

      {jsonError ? (
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
