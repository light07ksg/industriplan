import { useState } from 'react'
import { Bold, ChevronDown, ChevronRight, Italic, SlidersHorizontal, Trash2, Underline } from 'lucide-react'
import { useCanvasStore } from '@/store/canvasStore'
import { computeWallSegments } from '@/lib/geometry'
import { formatArea, formatLength } from '@/lib/units'

const FONT_OPTIONS = ['system-ui', 'Arial', 'Georgia', 'Courier New', 'Comic Sans MS', 'Trebuchet MS'] as const

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
}

function NumberField({ label, value, onChange }: NumberFieldProps) {
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] text-text-secondary">{label}</span>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onFocus={() => pushHistory()}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!Number.isNaN(v)) onChange(v)
        }}
        className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
      />
    </label>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono text-text-primary">{value}</span>
    </div>
  )
}

const TYPE_LABELS = {
  wall: 'Pared',
  area: 'Área',
  symbol: 'Símbolo',
  connector: 'Conector',
  wallOpening: 'Puerta/Ventana',
  note: 'Nota',
} as const

const WALL_OPENING_LABELS = {
  door: 'Puerta',
  doubleDoor: 'Puerta doble',
  slidingDoor: 'Puerta corrediza',
  window: 'Ventana',
} as const

export function PropertiesPanel() {
  const selectedId = useCanvasStore((s) => s.selectedId)
  const elements = useCanvasStore((s) => s.elements)
  const layers = useCanvasStore((s) => s.layers)
  const measurementUnit = useCanvasStore((s) => s.measurementUnit)
  const metersPerGridCell = useCanvasStore((s) => s.metersPerGridCell)
  const gridSize = useCanvasStore((s) => s.gridSize)
  const updateElement = useCanvasStore((s) => s.updateElement)
  const removeElement = useCanvasStore((s) => s.removeElement)
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  const [collapsed, setCollapsed] = useState(false)

  const metersPerWorldUnit = metersPerGridCell / gridSize
  const el = elements.find((e) => e.id === selectedId)

  if (!el) {
    return (
      <div className="flex-1 p-3">
        <div className="mb-2 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Propiedades</h2>
        </div>
        <p className="text-xs text-text-secondary">Selecciona un elemento del lienzo para ver y editar sus propiedades.</p>
      </div>
    )
  }

  const typeLabel = el.type === 'wallOpening' ? WALL_OPENING_LABELS[el.openingType] : TYPE_LABELS[el.type]

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir propiedades' : 'Minimizar propiedades'}
          aria-pressed={!collapsed}
          className="flex items-center gap-1.5 rounded text-text-secondary transition-colors duration-150 hover:text-accent"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">Propiedades</h2>
        </button>
        <button
          onClick={() => removeElement(el.id)}
          title="Eliminar elemento"
          className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="mb-3 inline-block rounded bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
        {typeLabel}
      </span>

      {!collapsed && (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-text-secondary">Nombre</span>
          <input
            value={el.label ?? ''}
            onFocus={() => pushHistory()}
            onChange={(e) => updateElement(el.id, { label: e.target.value })}
            placeholder={typeLabel}
            className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-text-secondary">Capa</span>
          <select
            value={el.layerId}
            onChange={(e) => {
              pushHistory()
              updateElement(el.id, { layerId: e.target.value })
            }}
            className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
          >
            {layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        {el.type === 'wall' &&
          (() => {
            const segments = computeWallSegments(el.points)
            const totalLength = segments.reduce((sum, s) => sum + s.length, 0)
            const xs = el.points.filter((_, i) => i % 2 === 0)
            const ys = el.points.filter((_, i) => i % 2 === 1)
            const bboxWidth = xs.length ? Math.max(...xs) - Math.min(...xs) : 0
            const bboxHeight = ys.length ? Math.max(...ys) - Math.min(...ys) : 0
            const area = bboxWidth * bboxHeight

            return (
              <div className="flex flex-col gap-2 rounded border border-surface-border bg-surface p-2">
                <StatRow label="Longitud total" value={formatLength(totalLength, measurementUnit, metersPerWorldUnit)} />
                <StatRow label="Ancho" value={formatLength(bboxWidth, measurementUnit, metersPerWorldUnit)} />
                <StatRow label="Largo" value={formatLength(bboxHeight, measurementUnit, metersPerWorldUnit)} />
                <StatRow label="Área" value={formatArea(area, measurementUnit, metersPerWorldUnit)} />
                <p className="mt-1 text-[10px] text-text-secondary">
                  {segments.length + 1} puntos · arrastra la pared en el lienzo para moverla.
                </p>
              </div>
            )
          })()}

        {el.type === 'connector' &&
          (() => {
            const fromEl = elements.find((e) => e.id === el.fromId)
            const toEl = elements.find((e) => e.id === el.toId)
            return (
              <div className="rounded border border-surface-border bg-surface p-2">
                <p className="text-xs text-text-primary">
                  {fromEl?.label ?? '(elemento eliminado)'}
                  <span className="mx-1 text-text-secondary">→</span>
                  {toEl?.label ?? '(elemento eliminado)'}
                </p>
              </div>
            )
          })()}

        {el.type === 'wallOpening' &&
          (() => {
            const wall = elements.find((e) => e.id === el.wallId)
            return (
              <div className="flex flex-col gap-2 rounded border border-surface-border bg-surface p-2">
                <StatRow label="Pared" value={wall?.label ?? '(pared eliminada)'} />
                <StatRow label="Ancho de vano" value={formatLength(el.width, measurementUnit, metersPerWorldUnit)} />
                <button
                  onClick={() => {
                    pushHistory()
                    updateElement(el.id, { flip: !el.flip })
                  }}
                  className="mt-1 rounded border border-surface-border px-2 py-1 text-xs text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
                >
                  Voltear apertura
                </button>
                <p className="text-[10px] text-text-secondary">Arrastra sobre la pared para reposicionarla.</p>
              </div>
            )
          })()}

        {el.type === 'note' && (
          <div className="flex flex-col gap-3 rounded border border-surface-border bg-surface p-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-text-secondary">Texto</span>
              <textarea
                value={el.text}
                onFocus={() => pushHistory()}
                onChange={(e) => updateElement(el.id, { text: e.target.value })}
                rows={3}
                className="w-full resize-none rounded border border-surface-border bg-surface-alt px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Tamaño de letra"
                value={el.fontSize}
                onChange={(v) => updateElement(el.id, { fontSize: Math.max(6, v) })}
              />
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-text-secondary">Fuente</span>
                <select
                  value={el.fontFamily}
                  onChange={(e) => {
                    pushHistory()
                    updateElement(el.id, { fontFamily: e.target.value })
                  }}
                  className="w-full rounded border border-surface-border bg-surface-alt px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  pushHistory()
                  updateElement(el.id, { bold: !el.bold })
                }}
                aria-pressed={el.bold}
                title="Negrita"
                className={`flex h-8 items-center justify-center rounded border transition-colors duration-150 ${
                  el.bold ? 'border-accent bg-accent-soft text-accent' : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
                }`}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  pushHistory()
                  updateElement(el.id, { italic: !el.italic })
                }}
                aria-pressed={el.italic}
                title="Cursiva"
                className={`flex h-8 items-center justify-center rounded border transition-colors duration-150 ${
                  el.italic ? 'border-accent bg-accent-soft text-accent' : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
                }`}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  pushHistory()
                  updateElement(el.id, { underline: !el.underline })
                }}
                aria-pressed={el.underline}
                title="Subrayado"
                className={`flex h-8 items-center justify-center rounded border transition-colors duration-150 ${
                  el.underline ? 'border-accent bg-accent-soft text-accent' : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
                }`}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {(el.type === 'area' || el.type === 'symbol') && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="X" value={el.x} onChange={(v) => updateElement(el.id, { x: v })} />
              <NumberField label="Y" value={el.y} onChange={(v) => updateElement(el.id, { y: v })} />
              <NumberField
                label="Ancho"
                value={el.width}
                onChange={(v) => updateElement(el.id, { width: Math.max(1, v) })}
              />
              <NumberField
                label="Alto"
                value={el.height}
                onChange={(v) => updateElement(el.id, { height: Math.max(1, v) })}
              />
            </div>
            <NumberField label="Rotación (°)" value={el.rotation} onChange={(v) => updateElement(el.id, { rotation: v })} />
            {el.type === 'area' && (
              <div className="rounded border border-surface-border bg-surface p-2">
                <StatRow label="Área" value={formatArea(el.width * el.height, measurementUnit, metersPerWorldUnit)} />
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
  )
}
