import { useState, type CSSProperties } from 'react'
import {
  ArrowRight,
  Bath,
  Bed,
  Briefcase,
  Building,
  Building2,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Cog,
  LayoutGrid,
  MousePointer2,
  Package,
  Route,
  Search,
  ShieldAlert,
  Sofa,
  Square,
  StickyNote,
  ToggleLeft,
  ToggleRight,
  Trees,
  Workflow,
  Wrench,
  X,
} from 'lucide-react'
import { CATEGORY_LABELS, type SymbolCategory, type SymbolTier } from './iconPrimitives'
import { SYMBOL_CATALOG } from './catalog'
import { SymbolPreview } from './SymbolPreview'
import { categoryColor, categorySoftColor } from './categoryColor'
import { SYMBOL_DRAG_MIME, NOTE_DRAG_ID } from './dragConstants'
import { useThemeColors } from '@/lib/useThemeColors'
import { useCanvasStore, type Tool } from '@/store/canvasStore'
import { useUIStore } from '@/store/uiStore'
import { useIsMobile } from '@/lib/useIsMobile'

const CATEGORY_ORDER: SymbolCategory[] = [
  'estructura',
  'maquinaria',
  'almacenamiento',
  'proceso',
  'seguridad',
  'dormitorio',
  'sala',
  'bano',
  'cocina',
  'oficina',
  'exterior',
  'edificio',
]

const CATEGORY_ICONS: Record<SymbolCategory, typeof Building2> = {
  estructura: Building2,
  maquinaria: Cog,
  almacenamiento: Package,
  proceso: Workflow,
  seguridad: ShieldAlert,
  dormitorio: Bed,
  sala: Sofa,
  bano: Bath,
  cocina: ChefHat,
  oficina: Briefcase,
  exterior: Trees,
  edificio: Building,
}

/** Básico is the small, essential set. Avanzado is the full catalog — those same categories plus
 * every furniture/room section — browsable via the search + category-chip filter below. */
const BASICO_CATEGORIES: SymbolCategory[] = ['estructura', 'maquinaria', 'almacenamiento', 'proceso', 'seguridad']
const AVANZADO_CATEGORIES: SymbolCategory[] = CATEGORY_ORDER

const TIER_OPTIONS: { id: SymbolTier; label: string; hint: string }[] = [
  { id: 'basico', label: 'Básico', hint: 'Estructura, maquinaria, almacenamiento, flujo de proceso y seguridad' },
  { id: 'avanzado', label: 'Avanzado', hint: 'Catálogo completo con mobiliario por ambiente' },
]

const TOOLS: { id: Tool; label: string; hint: string; icon: typeof MousePointer2 }[] = [
  { id: 'select', label: 'Seleccionar', hint: 'Seleccionar, mover, rotar y escalar elementos', icon: MousePointer2 },
  { id: 'wall', label: 'Pared', hint: 'Clic para poner puntos, doble clic o Enter para terminar', icon: Route },
  { id: 'area', label: 'Área', hint: 'Clic y arrastra para dibujar un área', icon: Square },
  {
    id: 'connector',
    label: 'Conector',
    hint: 'Clic en un símbolo de origen y luego en el de destino para unirlos con una flecha',
    icon: ArrowRight,
  },
]

export function SymbolLibrary() {
  const colors = useThemeColors()
  const isMobile = useIsMobile()
  const tool = useCanvasStore((s) => s.tool)
  const setTool = useCanvasStore((s) => s.setTool)
  const wallSnapMode = useCanvasStore((s) => s.wallSnapMode)
  const toggleWallSnapMode = useCanvasStore((s) => s.toggleWallSnapMode)
  const startPlacement = useUIStore((s) => s.startPlacement)
  const [tier, setTier] = useState<SymbolTier>('basico')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<SymbolCategory | null>(null)
  const [toolsCollapsed, setToolsCollapsed] = useState(false)

  const changeTier = (next: SymbolTier) => {
    setTier(next)
    setSearch('')
    setActiveCategory(null)
  }

  // Native HTML5 drag-and-drop (the `draggable`/`onDragStart` handlers below) has no touch
  // equivalent, and a prior attempt at a custom touch-drag (ghost following the finger, dropped
  // by checking pointer position against the canvas) proved unreliable across real devices —
  // dragging out of an overlay drawer onto a partially covered canvas is a fragile gesture. On
  // mobile, a tap arms this symbol for placement instead; the next tap on the canvas places it —
  // two simple taps, no drag tracking. Desktop keeps using native drag-and-drop as before.
  const handleMobileTap = (symbolId: string, label: string) => {
    if (!isMobile) return
    startPlacement(symbolId, label)
  }

  // Belt-and-suspenders: react to the raw touchend directly (and suppress the click it would
  // otherwise synthesize) rather than trusting onClick alone — the wall-finish button had the
  // same reliability doubt and needed this same fallback to work consistently.
  const handleMobileTouchEnd = (symbolId: string, label: string) => (e: { preventDefault: () => void }) => {
    if (!isMobile) return
    e.preventDefault()
    startPlacement(symbolId, label)
  }

  const tierCategories = tier === 'basico' ? BASICO_CATEGORIES : AVANZADO_CATEGORIES
  const query = search.trim().toLowerCase()
  const visibleCategories = tierCategories.filter((category) => activeCategory === null || category === activeCategory)
  const hasResults = SYMBOL_CATALOG.some(
    (s) =>
      tierCategories.includes(s.category) &&
      (activeCategory === null || s.category === activeCategory) &&
      (query === '' || s.name.toLowerCase().includes(query)),
  )

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-surface-border bg-surface-alt">
      <div className="border-b border-surface-border px-3 py-2.5">
        <button
          onClick={() => setToolsCollapsed((c) => !c)}
          title={toolsCollapsed ? 'Expandir herramientas' : 'Minimizar herramientas'}
          aria-pressed={!toolsCollapsed}
          className="mb-2 flex items-center gap-1.5 text-text-secondary transition-colors duration-150 hover:text-accent"
        >
          {toolsCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <Wrench className="h-3 w-3" />
          <h3 className="text-[11px] font-medium">Muros y herramientas</h3>
        </button>

        {!toolsCollapsed && (
          <>
            <div className="flex flex-col gap-1">
              {TOOLS.map(({ id, label, hint, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTool(id)}
                  title={hint}
                  aria-pressed={tool === id}
                  className={`flex h-8 items-center gap-2 rounded-md border px-2 text-xs font-medium transition-colors duration-150 ${
                    tool === id
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-transparent text-text-secondary hover:border-surface-border hover:bg-surface-inset'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={toggleWallSnapMode}
              title="Alterna cómo se colocan los puntos al dibujar una pared"
              aria-pressed={wallSnapMode === 'grid'}
              className={`mt-1 flex h-8 w-full items-center gap-2 rounded-md border px-2 text-xs font-medium transition-colors duration-150 ${
                wallSnapMode === 'grid'
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-transparent text-text-secondary hover:border-surface-border hover:bg-surface-inset'
              }`}
            >
              {wallSnapMode === 'grid' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {wallSnapMode === 'grid' ? 'Cada 0.25 m' : 'Trazo libre'}
            </button>
          </>
        )}
      </div>

      <div className="shrink-0 border-b border-surface-border px-3 py-2.5">
        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
          <StickyNote className="h-3 w-3" />
          Notas
        </h3>
        <button
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(SYMBOL_DRAG_MIME, NOTE_DRAG_ID)
            e.dataTransfer.effectAllowed = 'copy'
          }}
          onClick={() => handleMobileTap(NOTE_DRAG_ID, 'Nota')}
          onTouchEnd={handleMobileTouchEnd(NOTE_DRAG_ID, 'Nota')}
          title={isMobile ? 'Tocá y luego tocá el plano para colocarla' : 'Arrastra al lienzo para añadir un texto libre'}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-dashed border-surface-border px-2 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:bg-accent-soft hover:text-accent active:cursor-grabbing"
        >
          <StickyNote className="h-4 w-4" />
          Nota de texto
        </button>
      </div>

      <div className="shrink-0 border-b border-surface-border px-3 py-2.5">
        <div className="mb-2 flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Símbolos</h2>
        </div>

        <div className="mb-2 grid grid-cols-2 gap-1 rounded-md bg-surface-inset p-1">
          {TIER_OPTIONS.map(({ id, label, hint }) => (
            <button
              key={id}
              onClick={() => changeTier(id)}
              title={hint}
              aria-pressed={tier === id}
              className={`rounded py-1 text-[11px] font-medium transition-colors duration-150 ${
                tier === id ? 'bg-surface-alt text-accent shadow-sm' : 'text-text-secondary hover:text-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tier === 'avanzado' && (
          <>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar símbolo…"
                className="h-8 w-full rounded-md border border-surface-border bg-surface pr-7 pl-7 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  title="Limpiar búsqueda"
                  className="absolute top-1/2 right-1.5 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-text-secondary hover:text-accent"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveCategory(null)}
                title="Mostrar todas las categorías"
                aria-pressed={activeCategory === null}
                className={`rounded px-2 text-[11px] font-medium transition-colors duration-150 ${
                  activeCategory === null
                    ? 'bg-accent-soft text-accent'
                    : 'text-text-secondary hover:bg-surface-inset hover:text-accent'
                }`}
                style={{ height: 26 }}
              >
                Todos
              </button>
              {AVANZADO_CATEGORIES.map((category) => {
                const CategoryIcon = CATEGORY_ICONS[category]
                const isActive = activeCategory === category
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory((c) => (c === category ? null : category))}
                    title={CATEGORY_LABELS[category]}
                    aria-pressed={isActive}
                    className={`flex h-[26px] w-[26px] items-center justify-center rounded transition-colors duration-150 ${
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'text-text-secondary hover:bg-surface-inset hover:text-accent'
                    }`}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" />
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {visibleCategories.map((category) => {
          const items = SYMBOL_CATALOG.filter(
            (s) => s.category === category && (query === '' || s.name.toLowerCase().includes(query)),
          )
          if (items.length === 0) return null
          const color = categoryColor(category, colors)
          const fillColor = categorySoftColor(category, colors)
          const CategoryIcon = CATEGORY_ICONS[category]

          return (
            <div key={category} className="border-b border-surface-border px-3 py-2.5">
              <h3
                className="sticky top-0 z-[1] -mx-3 mb-2 flex items-center gap-1.5 bg-surface-alt px-3 py-1 text-[11px] font-medium"
                style={{ color }}
              >
                <CategoryIcon className="h-3 w-3" />
                {CATEGORY_LABELS[category]}
                <span className="ml-auto font-mono text-[10px] text-text-secondary">{items.length}</span>
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {items.map((def) => (
                  <button
                    key={def.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(SYMBOL_DRAG_MIME, def.id)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    onClick={() => handleMobileTap(def.id, def.name)}
                    onTouchEnd={handleMobileTouchEnd(def.id, def.name)}
                    title={def.name}
                    style={{ '--hover-bg': fillColor, '--hover-border': color } as CSSProperties}
                    className="flex flex-col items-center gap-1 rounded-md border border-transparent p-1.5 transition-all duration-150 hover:border-[var(--hover-border)] hover:bg-[var(--hover-bg)] hover:shadow-sm active:scale-95 active:cursor-grabbing"
                  >
                    <SymbolPreview definition={def} color={color} fillColor={fillColor} />
                    <span className="w-full truncate text-center text-[10px] leading-tight text-text-secondary">
                      {def.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {!hasResults && (
          <p className="px-3 py-4 text-center text-xs text-text-secondary">Sin resultados para esta búsqueda.</p>
        )}
      </div>
    </aside>
  )
}
