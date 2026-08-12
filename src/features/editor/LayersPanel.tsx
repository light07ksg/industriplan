import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff, Layers as LayersIcon, Plus, Trash2 } from 'lucide-react'
import { useCanvasStore } from '@/store/canvasStore'

export function LayersPanel() {
  const layers = useCanvasStore((s) => s.layers)
  const elements = useCanvasStore((s) => s.elements)
  const selectedId = useCanvasStore((s) => s.selectedId)
  const toggleLayerVisibility = useCanvasStore((s) => s.toggleLayerVisibility)
  const renameLayer = useCanvasStore((s) => s.renameLayer)
  const removeLayer = useCanvasStore((s) => s.removeLayer)
  const addLayer = useCanvasStore((s) => s.addLayer)
  const hideAllLabels = useCanvasStore((s) => s.hideAllLabels)
  const toggleHideAllLabels = useCanvasStore((s) => s.toggleHideAllLabels)
  const [collapsed, setCollapsed] = useState(false)

  const activeLayerId = elements.find((el) => el.id === selectedId)?.layerId

  return (
    <div className="border-b border-surface-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir capas' : 'Minimizar capas'}
          aria-pressed={!collapsed}
          className="flex items-center gap-1.5 rounded text-text-secondary transition-colors duration-150 hover:text-accent"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <LayersIcon className="h-3.5 w-3.5 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">Capas</h2>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleHideAllLabels}
            title={hideAllLabels ? 'Mostrar todos los nombres en el plano' : 'Ocultar todos los nombres en el plano'}
            aria-pressed={hideAllLabels}
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors duration-150 ${
              hideAllLabels ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-accent-soft hover:text-accent'
            }`}
          >
            {hideAllLabels ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => addLayer(`Capa ${layers.length + 1}`)}
            title="Nueva capa"
            className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
      <div className="flex flex-col gap-0.5">
        {layers.map((layer) => {
          const count = elements.filter((el) => el.layerId === layer.id).length
          const isActive = layer.id === activeLayerId
          return (
            <div
              key={layer.id}
              title={isActive ? 'Capa del elemento seleccionado' : undefined}
              className={`group flex items-center gap-1 rounded border-l-2 px-1 py-1 transition-colors duration-150 ${
                isActive
                  ? 'border-accent bg-accent-soft'
                  : 'border-transparent hover:bg-surface-inset'
              }`}
            >
              <button
                onClick={() => toggleLayerVisibility(layer.id)}
                title={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:text-accent"
              >
                {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>

              <input
                value={layer.name}
                onChange={(e) => renameLayer(layer.id, e.target.value)}
                className={`min-w-0 flex-1 truncate rounded bg-transparent px-1 text-xs outline-none focus:bg-surface-alt ${
                  isActive ? 'font-semibold text-accent' : layer.visible ? 'text-text-primary' : 'text-text-secondary italic'
                }`}
              />

              <span className="shrink-0 text-[10px] text-text-secondary">{count}</span>

              {!layer.isDefault && (
                <button
                  onClick={() => removeLayer(layer.id)}
                  title="Eliminar capa"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-secondary opacity-50 transition-opacity duration-150 hover:text-danger hover:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
