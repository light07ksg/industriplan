import { Box, Eye, EyeOff, Magnet, Maximize, Redo2, Ruler, Scaling, Undo2, ZoomIn, ZoomOut } from 'lucide-react'
import { useCanvasStore } from '@/store/canvasStore'
import type { MeasurementUnit } from '@/lib/units'

const ZOOM_BUTTON_STEP = 1.2

const UNITS: { id: MeasurementUnit; label: string }[] = [
  { id: 'mm', label: 'mm' },
  { id: 'cm', label: 'cm' },
  { id: 'm', label: 'm' },
]

interface ToolbarProps {
  onOpen3D: () => void
}

export function Toolbar({ onOpen3D }: ToolbarProps) {
  const scale = useCanvasStore((s) => s.scale)
  const snapEnabled = useCanvasStore((s) => s.snapEnabled)
  const measurementUnit = useCanvasStore((s) => s.measurementUnit)
  const showMeasurements = useCanvasStore((s) => s.showMeasurements)
  const metersPerGridCell = useCanvasStore((s) => s.metersPerGridCell)
  const zoomBy = useCanvasStore((s) => s.zoomBy)
  const resetView = useCanvasStore((s) => s.resetView)
  const toggleSnap = useCanvasStore((s) => s.toggleSnap)
  const setMeasurementUnit = useCanvasStore((s) => s.setMeasurementUnit)
  const toggleMeasurements = useCanvasStore((s) => s.toggleMeasurements)
  const setMetersPerGridCell = useCanvasStore((s) => s.setMetersPerGridCell)
  const canUndo = useCanvasStore((s) => s.past.length > 0)
  const canRedo = useCanvasStore((s) => s.future.length > 0)
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)

  return (
    <div className="flex items-center gap-1 rounded-md border border-surface-border bg-surface-alt p-1 glow-accent">
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Deshacer (Ctrl+Z)"
        className="flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
      >
        <Undo2 className="h-4 w-4" />
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rehacer (Ctrl+Shift+Z)"
        className="flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
      >
        <Redo2 className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <button
        onClick={() => zoomBy(1 / ZOOM_BUTTON_STEP)}
        title="Alejar"
        className="flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <span className="w-12 text-center font-mono text-xs tabular-nums text-text-secondary">
        {Math.round(scale * 100)}%
      </span>

      <button
        onClick={() => zoomBy(ZOOM_BUTTON_STEP)}
        title="Acercar"
        className="flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <button
        onClick={resetView}
        title="Restablecer vista"
        className="flex h-7 w-7 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
      >
        <Maximize className="h-4 w-4" />
      </button>

      <button
        onClick={toggleSnap}
        title={snapEnabled ? 'Snapping activado' : 'Snapping desactivado'}
        aria-pressed={snapEnabled}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors duration-150 ${
          snapEnabled
            ? 'bg-accent-soft text-accent'
            : 'text-text-secondary hover:bg-accent-soft hover:text-accent'
        }`}
      >
        <Magnet className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <button
        onClick={toggleMeasurements}
        title={showMeasurements ? 'Ocultar medidas de pared' : 'Mostrar medidas de pared'}
        aria-pressed={showMeasurements}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors duration-150 ${
          showMeasurements
            ? 'bg-accent-soft text-accent'
            : 'text-text-secondary hover:bg-accent-soft hover:text-accent'
        }`}
      >
        {showMeasurements ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      <div className="flex items-center gap-1 pl-0.5" title="Unidad para medidas de pared">
        <Ruler className="h-3.5 w-3.5 text-text-secondary" />
        <div className="flex overflow-hidden rounded border border-surface-border">
          {UNITS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMeasurementUnit(id)}
              aria-pressed={measurementUnit === id}
              className={`h-6 px-1.5 text-[10px] font-medium transition-colors duration-150 ${
                measurementUnit === id
                  ? 'bg-accent text-white'
                  : 'bg-transparent text-text-secondary hover:bg-accent-soft hover:text-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <div className="flex items-center gap-1" title="Escala del plano: metros reales por cada cuadro de la cuadrícula">
        <Scaling className="h-3.5 w-3.5 text-text-secondary" />
        <span className="text-[10px] text-text-secondary">1 cuadro =</span>
        <input
          type="number"
          min="0.01"
          step="0.05"
          value={metersPerGridCell}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!Number.isNaN(v) && v > 0) setMetersPerGridCell(v)
          }}
          className="w-14 rounded border border-surface-border bg-surface px-1 py-0.5 text-xs text-text-primary outline-none focus:border-accent"
        />
        <span className="text-[10px] text-text-secondary">m</span>
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <button
        onClick={onOpen3D}
        title="Vista 3D"
        className="flex h-7 items-center gap-1 rounded px-2 text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
      >
        <Box className="h-4 w-4" />
        <span className="text-xs font-medium">3D</span>
      </button>
    </div>
  )
}
