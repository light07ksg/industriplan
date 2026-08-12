import { create } from 'zustand'
import { zoomAtPoint, type Point } from '@/lib/geometry'
import { DEFAULT_METERS_PER_GRID_CELL, type MeasurementUnit } from '@/lib/units'
import { generateId } from '@/lib/id'

export type Tool = 'select' | 'wall' | 'area' | 'connector'
export type WallSnapMode = 'free' | 'grid'

/** 10 world units = 0.25m, so wall points land on quarter-meter increments in "grid" mode. */
export const WALL_SNAP_STEP = 10

/** True-to-scale wall thickness, in world units (0.25m at the default 40 units/m). Rendered without
 * the "constant screen size" trick used for dimension text, so it scales naturally with zoom. */
export const WALL_THICKNESS = 10
export const DOOR_WIDTH = 36 // 0.9m at default scale
export const DOUBLE_DOOR_WIDTH = 72 // 1.8m at default scale (two 0.9m leaves)
export const WINDOW_WIDTH = 48 // 1.2m at default scale
export const SLIDING_DOOR_WIDTH = 120 // 3m at default scale — sized for warehouse/loading openings
export const DOUBLE_WINDOW_WIDTH = 80 // 2m at default scale
export const NARROW_DOOR_WIDTH = 28 // 0.7m at default scale — closets, bathrooms
export const WIDE_DOOR_WIDTH = 48 // 1.2m at default scale — accessible-width swing door
export const FIRE_DOOR_WIDTH = 40 // 1.0m at default scale
export const WIDE_DOUBLE_DOOR_WIDTH = 96 // 2.4m at default scale
export const NARROW_SLIDING_DOOR_WIDTH = 60 // 1.5m at default scale
export const GARAGE_DOOR_WIDTH = 160 // 4m at default scale — industrial roll-up/sectional door
export const SMALL_WINDOW_WIDTH = 24 // 0.6m at default scale
export const LARGE_WINDOW_WIDTH = 96 // 2.4m at default scale — picture window

interface ElementBase {
  id: string
  rotation: number
  layerId: string
  label?: string
  /** Whether this element's name is drawn on the plan (area/symbol only — other element types
   * don't render a label at all). Defaults to visible when unset, for old saved projects. */
  showLabel?: boolean
}

export interface WallElement extends ElementBase {
  type: 'wall'
  points: number[]
}

export interface AreaElement extends ElementBase {
  type: 'area'
  x: number
  y: number
  width: number
  height: number
  label: string
}

export interface SymbolElement extends ElementBase {
  type: 'symbol'
  x: number
  y: number
  width: number
  height: number
  symbolId: string
  label: string
  /** Mirrors the symbol's artwork in place — useful for machinery/vehicles/doors whose plan-view
   * icon isn't symmetric, without needing a whole "mirrored" catalog entry. */
  flipX?: boolean
  flipY?: boolean
}

export interface ConnectorElement extends ElementBase {
  type: 'connector'
  fromId: string
  toId: string
}

export interface NoteElement extends ElementBase {
  type: 'note'
  x: number
  y: number
  text: string
  fontSize: number
  fontFamily: string
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface WallOpeningElement extends ElementBase {
  type: 'wallOpening'
  openingType: 'door' | 'doubleDoor' | 'window' | 'slidingDoor'
  wallId: string
  segmentIndex: number
  /** 0..1 position of the opening's center along that segment. */
  t: number
  width: number
  /** Mirrors which side of the opening the door hinge (and swing) is on. */
  flip: boolean
}

export type CanvasElement =
  | WallElement
  | AreaElement
  | SymbolElement
  | ConnectorElement
  | WallOpeningElement
  | NoteElement

export interface Layer {
  id: string
  name: string
  visible: boolean
  isDefault: boolean
}

export const LAYER_ESTRUCTURA = 'layer-estructura'
export const LAYER_EQUIPAMIENTO = 'layer-equipamiento'
export const LAYER_ANOTACIONES = 'layer-anotaciones'

export const DEFAULT_LAYER_FOR_TYPE: Record<CanvasElement['type'], string> = {
  wall: LAYER_ESTRUCTURA,
  area: LAYER_ESTRUCTURA,
  symbol: LAYER_EQUIPAMIENTO,
  connector: LAYER_ANOTACIONES,
  wallOpening: LAYER_ESTRUCTURA,
  note: LAYER_ANOTACIONES,
}

const DEFAULT_LAYERS: Layer[] = [
  { id: LAYER_ESTRUCTURA, name: 'Estructura', visible: true, isDefault: true },
  { id: LAYER_EQUIPAMIENTO, name: 'Equipamiento', visible: true, isDefault: true },
  { id: LAYER_ANOTACIONES, name: 'Anotaciones', visible: true, isDefault: true },
]

interface Size {
  width: number
  height: number
}

export interface CanvasSnapshot {
  elements: CanvasElement[]
  layers: Layer[]
  measurementUnit: MeasurementUnit
  metersPerGridCell: number
}

interface HistoryEntry {
  elements: CanvasElement[]
  layers: Layer[]
}

const MAX_HISTORY = 50

interface CanvasState {
  scale: number
  position: Point
  stageSize: Size
  gridSize: number
  snapEnabled: boolean
  tool: Tool
  wallSnapMode: WallSnapMode
  measurementUnit: MeasurementUnit
  showMeasurements: boolean
  hideAllLabels: boolean
  metersPerGridCell: number
  elements: CanvasElement[]
  layers: Layer[]
  selectedId: string | null
  past: HistoryEntry[]
  future: HistoryEntry[]
  pushHistory: () => void
  undo: () => void
  redo: () => void
  setScale: (scale: number) => void
  setPosition: (position: Point) => void
  setStageSize: (size: Size) => void
  setTool: (tool: Tool) => void
  toggleWallSnapMode: () => void
  setMeasurementUnit: (unit: MeasurementUnit) => void
  toggleMeasurements: () => void
  toggleHideAllLabels: () => void
  setMetersPerGridCell: (value: number) => void
  setSelectedId: (id: string | null) => void
  addElement: (element: CanvasElement) => void
  updateElement: (
    id: string,
    changes:
      | Partial<WallElement>
      | Partial<AreaElement>
      | Partial<SymbolElement>
      | Partial<ConnectorElement>
      | Partial<WallOpeningElement>
      | Partial<NoteElement>,
  ) => void
  removeElement: (id: string) => void
  toggleSnap: () => void
  zoomBy: (factor: number, focalPoint?: Point) => void
  resetView: () => void
  addLayer: (name: string) => void
  renameLayer: (id: string, name: string) => void
  toggleLayerVisibility: (id: string) => void
  removeLayer: (id: string) => void
  getSnapshot: () => CanvasSnapshot
  loadSnapshot: (snapshot: Partial<CanvasSnapshot>) => void
  resetCanvas: () => void
}

const initialElements: CanvasElement[] = []

export const useCanvasStore = create<CanvasState>((set, get) => ({
  scale: 1,
  position: { x: 0, y: 0 },
  stageSize: { width: 0, height: 0 },
  gridSize: 40,
  snapEnabled: true,
  tool: 'select',
  wallSnapMode: 'free',
  measurementUnit: 'm',
  showMeasurements: true,
  hideAllLabels: false,
  metersPerGridCell: DEFAULT_METERS_PER_GRID_CELL,
  elements: initialElements,
  layers: DEFAULT_LAYERS,
  selectedId: null,
  past: [],
  future: [],
  pushHistory: () =>
    set((state) => {
      const entry: HistoryEntry = { elements: state.elements, layers: state.layers }
      const past = state.past.length >= MAX_HISTORY ? [...state.past.slice(1), entry] : [...state.past, entry]
      return { past, future: [] }
    }),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        elements: previous.elements,
        layers: previous.layers,
        past: state.past.slice(0, -1),
        future: [{ elements: state.elements, layers: state.layers }, ...state.future],
        selectedId: null,
      }
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const [next, ...restFuture] = state.future
      return {
        elements: next.elements,
        layers: next.layers,
        future: restFuture,
        past: [...state.past, { elements: state.elements, layers: state.layers }],
        selectedId: null,
      }
    }),
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setStageSize: (stageSize) => set({ stageSize }),
  setTool: (tool) => set({ tool, selectedId: null }),
  toggleWallSnapMode: () => set((state) => ({ wallSnapMode: state.wallSnapMode === 'free' ? 'grid' : 'free' })),
  setMeasurementUnit: (measurementUnit) => set({ measurementUnit }),
  toggleMeasurements: () => set((state) => ({ showMeasurements: !state.showMeasurements })),
  toggleHideAllLabels: () => set((state) => ({ hideAllLabels: !state.hideAllLabels })),
  setMetersPerGridCell: (value) => set({ metersPerGridCell: value > 0 ? value : DEFAULT_METERS_PER_GRID_CELL }),
  setSelectedId: (id) => set({ selectedId: id }),
  addElement: (element) => {
    get().pushHistory()
    set((state) => ({ elements: [...state.elements, element], selectedId: element.id }))
  },
  updateElement: (id, changes) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? ({ ...el, ...changes } as CanvasElement) : el)),
    })),
  removeElement: (id) => {
    get().pushHistory()
    set((state) => ({
      elements: state.elements.filter(
        (el) =>
          el.id !== id &&
          !(el.type === 'connector' && (el.fromId === id || el.toId === id)) &&
          !(el.type === 'wallOpening' && el.wallId === id),
      ),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }))
  },
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  zoomBy: (factor, focalPoint) => {
    const { scale, position, stageSize } = get()
    const point = focalPoint ?? { x: stageSize.width / 2, y: stageSize.height / 2 }
    const next = zoomAtPoint({ scale, position }, point, factor)
    set(next)
  },
  resetView: () => set({ scale: 1, position: { x: 0, y: 0 } }),
  addLayer: (name) => {
    get().pushHistory()
    set((state) => ({
      layers: [...state.layers, { id: generateId(), name, visible: true, isDefault: false }],
    }))
  },
  renameLayer: (id, name) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    })),
  toggleLayerVisibility: (id) => {
    get().pushHistory()
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }))
  },
  removeLayer: (id) => {
    const layer = get().layers.find((l) => l.id === id)
    if (!layer || layer.isDefault) return
    get().pushHistory()
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      elements: state.elements.map((el) => (el.layerId === id ? { ...el, layerId: LAYER_EQUIPAMIENTO } : el)),
    }))
  },
  getSnapshot: () => {
    const { elements, layers, measurementUnit, metersPerGridCell } = get()
    return { elements, layers, measurementUnit, metersPerGridCell }
  },
  loadSnapshot: (snapshot) =>
    set({
      elements: snapshot.elements ?? [],
      layers: snapshot.layers && snapshot.layers.length > 0 ? snapshot.layers : DEFAULT_LAYERS,
      measurementUnit: snapshot.measurementUnit ?? 'm',
      metersPerGridCell: snapshot.metersPerGridCell ?? DEFAULT_METERS_PER_GRID_CELL,
      selectedId: null,
      tool: 'select',
      scale: 1,
      position: { x: 0, y: 0 },
      past: [],
      future: [],
    }),
  resetCanvas: () =>
    set({
      elements: [],
      layers: DEFAULT_LAYERS,
      measurementUnit: 'm',
      metersPerGridCell: DEFAULT_METERS_PER_GRID_CELL,
      selectedId: null,
      tool: 'select',
      scale: 1,
      position: { x: 0, y: 0 },
      past: [],
      future: [],
    }),
}))

if (import.meta.env.DEV) {
  ;(window as unknown as { __canvasStore: typeof useCanvasStore }).__canvasStore = useCanvasStore
}
