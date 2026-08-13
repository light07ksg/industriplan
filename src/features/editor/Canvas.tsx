import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { Stage, Layer, Rect, Line, Circle, Text, Group, Transformer, Arrow } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import {
  useCanvasStore,
  type CanvasElement,
  type WallOpeningElement,
  DEFAULT_LAYER_FOR_TYPE,
  WALL_SNAP_STEP,
  WALL_THICKNESS,
} from '@/store/canvasStore'
import { useExportStore } from '@/store/exportStore'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { useUIStore } from '@/store/uiStore'
import { useThemeColors } from '@/lib/useThemeColors'
import { PRINT_PALETTE } from '@/lib/theme'
import { useIsMobile } from '@/lib/useIsMobile'
import { snapToGrid, snapPoint, toWorld, zoomAtPoint, rectBoundaryPoint, type Point } from '@/lib/geometry'
import { generateId } from '@/lib/id'
import { measureTextWidth } from '@/lib/measureText'
import { SYMBOL_CATALOG } from '@/features/symbols/catalog'
import { categoryColor, categorySoftColor } from '@/features/symbols/categoryColor'
import { SYMBOL_DRAG_MIME } from '@/features/symbols/dragConstants'
import { exportStageToPdf, exportStageToPng } from '@/features/export/exportCanvas'
import { placeSymbolAtScreenPoint, placeSymbolAtWorldPoint, WALL_OPENING_SYMBOLS } from './placeSymbol'
import { Grid } from './Grid'
import { SymbolShape } from './SymbolShape'
import { WallDimensions } from './WallDimensions'
import { WallWithOpenings } from './WallWithOpenings'
import { DoorSymbol } from './DoorSymbol'
import { DoubleDoorSymbol } from './DoubleDoorSymbol'
import { SlidingDoorSymbol } from './SlidingDoorSymbol'
import { WindowSymbol } from './WindowSymbol'

const WHEEL_ZOOM_STEP = 1.05
const MIN_ELEMENT_SIZE = 20
const MIN_AREA_DRAFT = 6
const WALL_JOIN_RADIUS_PX = 14
const WALL_ANGLE_SNAP_DEG = 6

/** Magnetically pulls a new wall segment to horizontal/vertical: if the raw angle from `from` to
 * `to` is within `WALL_ANGLE_SNAP_DEG` of a cardinal direction (0/90/180/270°), the point is
 * projected onto that exact direction at the same distance — same idea as the vertex/grid snaps
 * already in play, just for angle instead of position. Left alone outside the threshold so
 * intentionally diagonal walls still draw freely. */
function snapWallAngle(from: Point, to: Point): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  if (distance === 0) return to
  const angle = Math.atan2(dy, dx)
  const HALF_PI = Math.PI / 2
  const nearest = Math.round(angle / HALF_PI) * HALF_PI
  const diff = Math.atan2(Math.sin(angle - nearest), Math.cos(angle - nearest))
  if (Math.abs(diff) > (WALL_ANGLE_SNAP_DEG * Math.PI) / 180) return to
  return { x: from.x + Math.cos(nearest) * distance, y: from.y + Math.sin(nearest) * distance }
}

/** Finds the closest existing wall vertex (committed or in the current draft) within snapping range, so new walls can connect to it. */
function findNearestWallVertex(
  point: Point,
  elements: CanvasElement[],
  wallDraft: number[] | null,
  scale: number,
): Point | null {
  const threshold = WALL_JOIN_RADIUS_PX / scale
  let best: Point | null = null
  let bestDist = threshold

  const check = (x: number, y: number) => {
    const dist = Math.hypot(x - point.x, y - point.y)
    if (dist < bestDist) {
      bestDist = dist
      best = { x, y }
    }
  }

  for (const el of elements) {
    if (el.type !== 'wall') continue
    for (let i = 0; i < el.points.length; i += 2) {
      check(el.points[i], el.points[i + 1])
    }
  }

  if (wallDraft) {
    for (let i = 0; i < wallDraft.length; i += 2) {
      check(wallDraft[i], wallDraft[i + 1])
    }
  }

  return best
}

/** Midpoint and distance between two touches, in coordinates relative to `rect` (the canvas
 * container's bounding rect) — the same coordinate space `zoomAtPoint` expects. */
function getPinchInfo(touches: TouchList, rect: DOMRect): { mid: Point; distance: number } {
  const t1 = touches[0]
  const t2 = touches[1]
  const p1 = { x: t1.clientX - rect.left, y: t1.clientY - rect.top }
  const p2 = { x: t2.clientX - rect.left, y: t2.clientY - rect.top }
  return { mid: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }, distance: Math.hypot(p2.x - p1.x, p2.y - p1.y) }
}

/** Center and half-extents of a symbol/area element, used to anchor connector arrows. Walls, connectors and wall openings have no such bounds. */
function getElementBounds(el: CanvasElement): { cx: number; cy: number; hw: number; hh: number } | null {
  if (el.type === 'wall' || el.type === 'connector' || el.type === 'wallOpening' || el.type === 'note') return null
  return { cx: el.x + el.width / 2, cy: el.y + el.height / 2, hw: el.width / 2, hh: el.height / 2 }
}

interface CanvasProps {
  /** Renders the plan for viewing only: panning/zooming still work, but nothing can be selected,
   * dragged, resized, or drawn. Used by the public share view, which has no toolbar/panels to
   * change tools with anyway. */
  readOnly?: boolean
}

export function Canvas({ readOnly = false }: CanvasProps = {}) {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const shapeRefs = useRef<Record<string, Konva.Node | null>>({})
  /** Tracks the previous two-finger touch distance/midpoint between pinch-zoom frames — a ref
   * rather than state since it updates on every touchmove and never needs to trigger a render. */
  const pinchRef = useRef<{ mid: Point; distance: number } | null>(null)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [wallDraft, setWallDraft] = useState<number[] | null>(null)
  const [wallPreview, setWallPreview] = useState<Point | null>(null)
  const [areaDraft, setAreaDraft] = useState<{ start: Point; current: Point } | null>(null)
  const [roomDraft, setRoomDraft] = useState<{ start: Point; current: Point } | null>(null)
  const [snapVertex, setSnapVertex] = useState<Point | null>(null)
  const [connectorFromId, setConnectorFromId] = useState<string | null>(null)
  const [connectorPreview, setConnectorPreview] = useState<Point | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const scale = useCanvasStore((s) => s.scale)
  const position = useCanvasStore((s) => s.position)
  const gridSize = useCanvasStore((s) => s.gridSize)
  const snapEnabled = useCanvasStore((s) => s.snapEnabled)
  const rawTool = useCanvasStore((s) => s.tool)
  const tool = readOnly ? 'select' : rawTool
  /** Distinct from `tool === 'select'`: gates whether elements can be dragged/selected/edited at
   * all, separately from which drawing tool happens to be active. */
  const interactive = !readOnly
  const wallSnapMode = useCanvasStore((s) => s.wallSnapMode)
  const measurementUnit = useCanvasStore((s) => s.measurementUnit)
  const showMeasurements = useCanvasStore((s) => s.showMeasurements)
  const hideAllLabels = useCanvasStore((s) => s.hideAllLabels)
  const metersPerGridCell = useCanvasStore((s) => s.metersPerGridCell)
  const elements = useCanvasStore((s) => s.elements)
  const layers = useCanvasStore((s) => s.layers)
  const selectedId = useCanvasStore((s) => s.selectedId)
  const setScale = useCanvasStore((s) => s.setScale)
  const setPosition = useCanvasStore((s) => s.setPosition)
  const setStageSize = useCanvasStore((s) => s.setStageSize)
  const setSelectedId = useCanvasStore((s) => s.setSelectedId)
  const updateElement = useCanvasStore((s) => s.updateElement)
  const addElement = useCanvasStore((s) => s.addElement)
  const removeElement = useCanvasStore((s) => s.removeElement)
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)

  const pendingExport = useExportStore((s) => s.pendingExport)
  const exportColorMode = useExportStore((s) => s.colorMode)
  const clearExportRequest = useExportStore((s) => s.clearExportRequest)
  const setExportingState = useExportStore((s) => s.setExporting)
  const setExportError = useExportStore((s) => s.setError)
  const currentProjectName = useProjectSessionStore((s) => s.currentProjectName)
  const pendingPlacement = useUIStore((s) => s.pendingPlacement)
  const cancelPlacement = useUIStore((s) => s.cancelPlacement)

  const themeColors = useThemeColors()
  // A dedicated grayscale palette swapped in only for the rasterized capture, so a PNG/PDF export
  // reads as a standard black-on-white technical drawing regardless of the accent color/light-dark
  // mode being edited in — every wall/symbol/label color in this file flows from `colors`, so this
  // one substitution is enough to recolor the whole export.
  const colors = isExporting && exportColorMode === 'bw' ? PRINT_PALETTE : themeColors
  const metersPerWorldUnit = metersPerGridCell / gridSize
  // Exports rasterize the stage at a 1:1 scale regardless of the current zoom, so stroke widths
  // and font sizes (all sized relative to "scale" to stay a constant screen size) must switch to
  // that same 1:1 basis while exporting, or text/lines end up wildly over- or under-sized.
  const renderScale = isExporting ? 1 : scale

  const visibleElements = useMemo(() => {
    const hiddenLayerIds = new Set(layers.filter((l) => !l.visible).map((l) => l.id))
    return elements.filter((el) => !hiddenLayerIds.has(el.layerId))
  }, [elements, layers])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const next = { width: rect.width, height: rect.height }
      setSize(next)
      setStageSize(next)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [setStageSize])

  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const el = visibleElements.find((e) => e.id === selectedId)
    const node =
      !readOnly && selectedId && el && el.type !== 'wall' && el.type !== 'connector' && el.type !== 'wallOpening' && el.type !== 'note'
        ? shapeRefs.current[selectedId]
        : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [readOnly, selectedId, visibleElements])

  useEffect(() => {
    setWallDraft(null)
    setWallPreview(null)
    setAreaDraft(null)
    setSnapVertex(null)
    setConnectorFromId(null)
    setConnectorPreview(null)
  }, [tool])

  const commitWall = (points: number[] | null) => {
    if (points && points.length >= 4) {
      addElement({
        id: generateId(),
        type: 'wall',
        points,
        rotation: 0,
        layerId: DEFAULT_LAYER_FOR_TYPE.wall,
      })
    }
    setWallDraft(null)
    setWallPreview(null)
    setSnapVertex(null)
  }

  const cancelWallDraft = () => {
    setWallDraft(null)
    setWallPreview(null)
    setSnapVertex(null)
  }

  useEffect(() => {
    if (tool !== 'wall') return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelWallDraft()
      } else if (e.key === 'Enter') {
        commitWall(wallDraft)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, wallDraft])

  useEffect(() => {
    if (tool !== 'connector') return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectorFromId(null)
        setConnectorPreview(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [tool])

  useEffect(() => {
    if (readOnly) return
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping = !!target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (isTyping) return

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeElement(selectedId)
        return
      }

      const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z'
      const isRedo =
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      if (isUndo) {
        e.preventDefault()
        undo()
      } else if (isRedo) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [readOnly, selectedId, removeElement, undo, redo])

  useEffect(() => {
    if (!pendingExport) return
    const stage = stageRef.current
    if (!stage) {
      clearExportRequest()
      return
    }

    let cancelled = false
    setIsExporting(true)
    setExportingState(true)

    const run = async () => {
      // Let React commit the grid/selection-handle-free render before we rasterize the stage.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      if (cancelled) return
      try {
        const ok =
          pendingExport === 'png'
            ? await exportStageToPng(stage, visibleElements, currentProjectName)
            : await exportStageToPdf(stage, visibleElements, currentProjectName)
        if (!ok) setExportError('El plano está vacío, no hay nada que exportar.')
      } catch (err) {
        setExportError(err instanceof Error ? err.message : 'No se pudo exportar el plano.')
      } finally {
        if (!cancelled) {
          setIsExporting(false)
          setExportingState(false)
          clearExportRequest()
        }
      }
    }
    run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingExport])

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    const factor = e.evt.deltaY > 0 ? 1 / WHEEL_ZOOM_STEP : WHEEL_ZOOM_STEP
    const next = zoomAtPoint({ scale, position }, pointer, factor)
    setScale(next.scale)
    setPosition(next.position)
  }

  const handleStageDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return
    setPosition({ x: e.target.x(), y: e.target.y() })
  }

  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage()

    // A second finger landing starts a pinch-zoom gesture — hand off to handleStageMouseMove
    // entirely (it does the actual zoom math) rather than treating this as a normal tap, and
    // cancel any pan-drag Konva's Stage may have already started from the first finger.
    if ('touches' in e.evt && e.evt.touches.length >= 2) {
      e.evt.preventDefault()
      stage?.stopDrag()
      return
    }

    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    const rawWorld = toWorld(pointer, scale, position)
    const world = snapEnabled ? snapPoint(rawWorld, gridSize) : rawWorld

    if (pendingPlacement) {
      placeSymbolAtWorldPoint(pendingPlacement.symbolId, rawWorld)
      cancelPlacement()
      return
    }

    if (tool === 'select') {
      if (e.target === stage) setSelectedId(null)
      return
    }

    if (tool === 'connector') {
      if (e.target === stage) {
        setConnectorFromId(null)
        setConnectorPreview(null)
      }
      return
    }

    if (tool === 'wall') {
      const mouseEvt = e.evt as MouseEvent
      if (mouseEvt.detail && mouseEvt.detail >= 2) {
        commitWall(wallDraft)
        return
      }
      const vertex = findNearestWallVertex(rawWorld, visibleElements, wallDraft, scale)
      const lastPoint = wallDraft ? { x: wallDraft[wallDraft.length - 2], y: wallDraft[wallDraft.length - 1] } : null
      const wallSnapped =
        wallSnapMode === 'grid' ? snapPoint(rawWorld, WALL_SNAP_STEP) : lastPoint ? snapWallAngle(lastPoint, rawWorld) : rawWorld
      const point = vertex ?? wallSnapped
      setWallDraft((prev) => (prev ? [...prev, point.x, point.y] : [point.x, point.y]))
      setWallPreview(point)
      setSnapVertex(vertex)
      return
    }

    if (tool === 'area') {
      setAreaDraft({ start: world, current: world })
    }

    if (tool === 'room') {
      setRoomDraft({ start: world, current: world })
    }
  }

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage()

    if ('touches' in e.evt && e.evt.touches.length >= 2) {
      e.evt.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const next = getPinchInfo(e.evt.touches, rect)
        if (pinchRef.current) {
          const factor = next.distance / pinchRef.current.distance
          const zoomed = zoomAtPoint({ scale, position }, next.mid, factor)
          setScale(zoomed.scale)
          setPosition(zoomed.position)
        }
        pinchRef.current = next
      }
      return
    }
    pinchRef.current = null

    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    const rawWorld = toWorld(pointer, scale, position)
    const world = snapEnabled ? snapPoint(rawWorld, gridSize) : rawWorld

    if (tool === 'wall') {
      const vertex = findNearestWallVertex(rawWorld, visibleElements, wallDraft, scale)
      setSnapVertex(vertex)
      if (wallDraft) {
        const lastPoint = { x: wallDraft[wallDraft.length - 2], y: wallDraft[wallDraft.length - 1] }
        const wallSnapped =
          wallSnapMode === 'grid' ? snapPoint(rawWorld, WALL_SNAP_STEP) : snapWallAngle(lastPoint, rawWorld)
        setWallPreview(vertex ?? wallSnapped)
      }
    } else if (tool === 'area' && areaDraft) {
      setAreaDraft((prev) => (prev ? { ...prev, current: world } : prev))
    } else if (tool === 'room' && roomDraft) {
      setRoomDraft((prev) => (prev ? { ...prev, current: world } : prev))
    } else if (tool === 'connector' && connectorFromId) {
      setConnectorPreview(rawWorld)
    }
  }

  const handleStageMouseUp = () => {
    pinchRef.current = null
    if (tool === 'area' && areaDraft) {
      const x = Math.min(areaDraft.start.x, areaDraft.current.x)
      const y = Math.min(areaDraft.start.y, areaDraft.current.y)
      const width = Math.abs(areaDraft.current.x - areaDraft.start.x)
      const height = Math.abs(areaDraft.current.y - areaDraft.start.y)
      if (width >= MIN_AREA_DRAFT && height >= MIN_AREA_DRAFT) {
        addElement({
          id: generateId(),
          type: 'area',
          x,
          y,
          width,
          height,
          rotation: 0,
          label: 'Área',
          layerId: DEFAULT_LAYER_FOR_TYPE.area,
        })
      }
      setAreaDraft(null)
    }

    if (tool === 'room' && roomDraft) {
      const x = Math.min(roomDraft.start.x, roomDraft.current.x)
      const y = Math.min(roomDraft.start.y, roomDraft.current.y)
      const width = Math.abs(roomDraft.current.x - roomDraft.start.x)
      const height = Math.abs(roomDraft.current.y - roomDraft.start.y)
      if (width >= MIN_AREA_DRAFT && height >= MIN_AREA_DRAFT) {
        // A closed 5-point loop (back to the start corner) — same WallElement shape the free-hand
        // wall tool produces when you manually click back to your first point.
        commitWall([x, y, x + width, y, x + width, y + height, x, y + height, x, y])
      }
      setRoomDraft(null)
    }
  }

  const handleElementClick = (id: string) => {
    if (readOnly) return
    if (tool === 'select') {
      setSelectedId(id)
    } else if (tool === 'connector') {
      if (!connectorFromId) {
        setConnectorFromId(id)
      } else if (connectorFromId !== id) {
        addElement({
          id: generateId(),
          type: 'connector',
          fromId: connectorFromId,
          toId: id,
          rotation: 0,
          layerId: DEFAULT_LAYER_FOR_TYPE.connector,
        })
        setConnectorFromId(null)
        setConnectorPreview(null)
      }
    }
  }

  const handleElementDragEnd = (id: string, e: KonvaEventObject<DragEvent>) => {
    let { x, y } = e.target.position()
    if (snapEnabled) {
      x = snapToGrid(x, gridSize)
      y = snapToGrid(y, gridSize)
      e.target.position({ x, y })
    }
    pushHistory()
    updateElement(id, { x, y })
  }

  const handleWallDragEnd = (id: string, el: Extract<CanvasElement, { type: 'wall' }>, e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    let dx = node.x()
    let dy = node.y()
    if (snapEnabled) {
      dx = snapToGrid(dx, gridSize)
      dy = snapToGrid(dy, gridSize)
    }
    node.position({ x: 0, y: 0 })
    const newPoints = el.points.map((v, idx) => (idx % 2 === 0 ? v + dx : v + dy))
    pushHistory()
    updateElement(id, { points: newPoints })
  }

  // History is pushed once at onDragStart (see handleOpeningDragStart) rather than here, since
  // this fires continuously on onDragMove to keep the door/window symbol tracking the cursor live
  // — pushing an undo snapshot on every frame would both spam the history stack and, worse, keep
  // capturing the already-dragged position instead of the pre-drag one.
  const handleOpeningMoved = (opening: WallOpeningElement, t: number) => {
    updateElement(opening.id, { t: Math.min(1, Math.max(0, t)) })
  }

  const handleOpeningDragStart = () => {
    pushHistory()
  }

  const handleTransformEnd = (id: string) => {
    const node = shapeRefs.current[id]
    const el = visibleElements.find((e) => e.id === id)
    if (!node || !el || el.type === 'wall' || el.type === 'connector' || el.type === 'wallOpening' || el.type === 'note')
      return
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)
    pushHistory()
    updateElement(id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(MIN_ELEMENT_SIZE, el.width * scaleX),
      height: Math.max(MIN_ELEMENT_SIZE, el.height * scaleY),
    })
  }

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes(SYMBOL_DRAG_MIME)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    if (readOnly) return
    const symbolId = e.dataTransfer.getData(SYMBOL_DRAG_MIME)
    if (!symbolId || !containerRef.current) return
    e.preventDefault()
    placeSymbolAtScreenPoint(symbolId, { x: e.clientX, y: e.clientY }, containerRef.current)
  }

  const cursorClass = tool === 'select' ? '' : 'cursor-crosshair'
  // While a drawing tool is active, taps place points/draw shapes rather than pan — the stage
  // isn't draggable in that mode anyway, so there's no native scroll/zoom gesture worth letting
  // through, and letting the browser try to interpret those taps as one is what makes drawing
  // feel unresponsive on a touchscreen.
  const touchAction = tool === 'select' ? 'auto' : 'none'

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${cursorClass}`}
      style={{ background: colors.canvasBg, touchAction }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {size.width > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={tool === 'select'}
          onWheel={handleWheel}
          onDragEnd={handleStageDragEnd}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onTouchMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onTouchEnd={handleStageMouseUp}
        >
          <Layer>
            {!isExporting && (
              <Grid
                width={size.width}
                height={size.height}
                scale={scale}
                position={position}
                gridSize={gridSize}
                colors={colors}
              />
            )}
          </Layer>

          <Layer>
            {visibleElements.map((el) => {
              if (el.type === 'connector' || el.type === 'wallOpening') return null

              if (el.type === 'note') {
                const isSelected = el.id === selectedId
                const fontStyle = [el.bold ? 'bold' : '', el.italic ? 'italic' : ''].filter(Boolean).join(' ') || 'normal'
                return (
                  <Text
                    key={el.id}
                    ref={(node) => {
                      shapeRefs.current[el.id] = node
                    }}
                    x={el.x}
                    y={el.y}
                    text={el.text}
                    fontSize={el.fontSize}
                    fontFamily={el.fontFamily}
                    fontStyle={fontStyle}
                    textDecoration={el.underline ? 'underline' : ''}
                    fill={isSelected ? colors.accent : colors.structure}
                    draggable={interactive && tool === 'select'}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) => handleElementDragEnd(el.id, e)}
                  />
                )
              }

              if (el.type === 'wall') {
                const openings = visibleElements.filter(
                  (e): e is Extract<CanvasElement, { type: 'wallOpening' }> =>
                    e.type === 'wallOpening' && e.wallId === el.id,
                )
                return (
                  <WallWithOpenings
                    key={el.id}
                    wall={el}
                    openings={openings}
                    colors={colors}
                    scale={scale}
                    renderScale={renderScale}
                    stagePosition={position}
                    tool={tool}
                    interactive={interactive}
                    selectedId={selectedId}
                    showMeasurements={showMeasurements}
                    measurementUnit={measurementUnit}
                    metersPerWorldUnit={metersPerWorldUnit}
                    registerShapeRef={(id, node) => {
                      shapeRefs.current[id] = node
                    }}
                    onSelectWall={() => setSelectedId(el.id)}
                    onSelectOpening={(id) => setSelectedId(id)}
                    onWallDragEnd={(e) => handleWallDragEnd(el.id, el, e)}
                    onOpeningDragStart={handleOpeningDragStart}
                    onOpeningMoved={handleOpeningMoved}
                  />
                )
              }

              if (el.type === 'area') {
                const isSelected = el.id === selectedId
                return (
                  <Group key={el.id}>
                    <Rect
                      ref={(node) => {
                        shapeRefs.current[el.id] = node
                      }}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rotation={el.rotation}
                      stroke={isSelected ? colors.accent : colors.structure}
                      strokeWidth={2 / renderScale}
                      dash={[10 / renderScale, 6 / renderScale]}
                      fill={colors.structureSoft}
                      draggable={interactive && tool === 'select'}
                      onClick={() => handleElementClick(el.id)}
                      onTap={() => handleElementClick(el.id)}
                      onDragEnd={(e) => handleElementDragEnd(el.id, e)}
                      onTransformEnd={() => handleTransformEnd(el.id)}
                    />
                    {!hideAllLabels &&
                      el.showLabel !== false &&
                      (() => {
                        const labelFontSize = 12 / renderScale
                        const labelWidth = Math.max(el.width, measureTextWidth(el.label, labelFontSize) + 16 / renderScale)
                        return (
                          <Text
                            text={el.label}
                            x={el.x + el.width / 2 - labelWidth / 2}
                            y={el.y + 4 / renderScale}
                            width={labelWidth}
                            align="center"
                            wrap="none"
                            fontSize={labelFontSize}
                            fill={colors.textSecondary}
                            listening={false}
                          />
                        )
                      })()}
                  </Group>
                )
              }

              const def = SYMBOL_CATALOG.find((s) => s.id === el.symbolId)
              if (!def) return null
              const color = categoryColor(def.category, colors)
              const fillColor = categorySoftColor(def.category, colors)
              const looseOpeningDef = WALL_OPENING_SYMBOLS[def.id as keyof typeof WALL_OPENING_SYMBOLS]
              const isLooseOpening = looseOpeningDef !== undefined
              // A loose door/window uses the exact same leaf/arc or frame-line drawing as one
              // attached to a wall, so it never looks squished or different depending on where
              // you dropped it.
              const looseVisualHeight = isLooseOpening ? Math.max(el.height, el.width * 0.6) : el.height

              return (
                <Group
                  key={el.id}
                  ref={(node) => {
                    shapeRefs.current[el.id] = node
                  }}
                  x={el.x}
                  y={el.y}
                  rotation={el.rotation}
                  draggable={interactive && tool === 'select'}
                  onClick={() => handleElementClick(el.id)}
                  onTap={() => handleElementClick(el.id)}
                  onDragEnd={(e) => handleElementDragEnd(el.id, e)}
                  onTransformEnd={() => handleTransformEnd(el.id)}
                >
                  <Rect width={el.width} height={looseVisualHeight} fill="rgba(0,0,0,0.01)" />
                  <Group
                    scaleX={el.flipX ? -1 : 1}
                    scaleY={el.flipY ? -1 : 1}
                    x={el.flipX ? el.width : 0}
                    y={el.flipY ? looseVisualHeight : 0}
                    listening={false}
                  >
                    {looseOpeningDef ? (
                      looseOpeningDef.openingType === 'door' ? (
                        <DoorSymbol
                          hinge={{ x: 0, y: 0 }}
                          wallDir={{ x: 1, y: 0 }}
                          interiorDir={{ x: 0, y: 1 }}
                          width={el.width}
                          color={color}
                          strokeWidth={WALL_THICKNESS * 0.4}
                        />
                      ) : looseOpeningDef.openingType === 'doubleDoor' ? (
                        <DoubleDoorSymbol
                          start={{ x: 0, y: 0 }}
                          end={{ x: el.width, y: 0 }}
                          wallDir={{ x: 1, y: 0 }}
                          interiorDir={{ x: 0, y: 1 }}
                          width={el.width}
                          color={color}
                          strokeWidth={WALL_THICKNESS * 0.4}
                        />
                      ) : looseOpeningDef.openingType === 'slidingDoor' ? (
                        <SlidingDoorSymbol
                          start={{ x: 0, y: 0 }}
                          end={{ x: el.width, y: 0 }}
                          interiorDir={{ x: 0, y: 1 }}
                          thickness={WALL_THICKNESS}
                          color={color}
                          strokeWidth={WALL_THICKNESS * 0.32}
                        />
                      ) : (
                        <WindowSymbol
                          start={{ x: 0, y: 0 }}
                          end={{ x: el.width, y: 0 }}
                          interiorDir={{ x: 0, y: 1 }}
                          thickness={WALL_THICKNESS}
                          color={color}
                          strokeWidth={WALL_THICKNESS * 0.28}
                        />
                      )
                    ) : (
                      <SymbolShape
                        definition={def}
                        width={el.width}
                        height={el.height}
                        color={color}
                        fillColor={fillColor}
                        strokeWidth={2.5 / renderScale}
                      />
                    )}
                  </Group>
                  {!hideAllLabels &&
                    el.showLabel !== false &&
                    (() => {
                      const labelFontSize = 12 / renderScale
                      const labelWidth = Math.max(el.width, measureTextWidth(el.label, labelFontSize) + 16 / renderScale)
                      return (
                        <Text
                          text={el.label}
                          x={el.width / 2 - labelWidth / 2}
                          y={looseVisualHeight + 4 / renderScale}
                          width={labelWidth}
                          align="center"
                          wrap="none"
                          fontSize={labelFontSize}
                          fill={colors.textSecondary}
                          listening={false}
                        />
                      )
                    })()}
                </Group>
              )
            })}

            {!isExporting && wallDraft && (
              <Line
                points={wallPreview ? [...wallDraft, wallPreview.x, wallPreview.y] : wallDraft}
                stroke={colors.accent}
                strokeWidth={5 / scale}
                dash={[10 / scale, 6 / scale]}
                lineCap="round"
                listening={false}
              />
            )}

            {!isExporting && showMeasurements && wallDraft && wallPreview && (
              <WallDimensions
                points={[...wallDraft, wallPreview.x, wallPreview.y]}
                scale={scale}
                unit={measurementUnit}
                metersPerWorldUnit={metersPerWorldUnit}
                color={colors.accent}
                idPrefix="draft"
              />
            )}

            {!isExporting && areaDraft && (
              <Rect
                x={Math.min(areaDraft.start.x, areaDraft.current.x)}
                y={Math.min(areaDraft.start.y, areaDraft.current.y)}
                width={Math.abs(areaDraft.current.x - areaDraft.start.x)}
                height={Math.abs(areaDraft.current.y - areaDraft.start.y)}
                stroke={colors.accent}
                strokeWidth={2 / scale}
                dash={[10 / scale, 6 / scale]}
                fill={colors.accentSoft}
                listening={false}
              />
            )}

            {!isExporting && roomDraft && (
              <Rect
                x={Math.min(roomDraft.start.x, roomDraft.current.x)}
                y={Math.min(roomDraft.start.y, roomDraft.current.y)}
                width={Math.abs(roomDraft.current.x - roomDraft.start.x)}
                height={Math.abs(roomDraft.current.y - roomDraft.start.y)}
                stroke={colors.accent}
                strokeWidth={5 / scale}
                dash={[10 / scale, 6 / scale]}
                listening={false}
              />
            )}

            {!isExporting && showMeasurements && roomDraft && (
              <WallDimensions
                points={(() => {
                  const x = Math.min(roomDraft.start.x, roomDraft.current.x)
                  const y = Math.min(roomDraft.start.y, roomDraft.current.y)
                  const width = Math.abs(roomDraft.current.x - roomDraft.start.x)
                  const height = Math.abs(roomDraft.current.y - roomDraft.start.y)
                  return [x, y, x + width, y, x + width, y + height, x, y + height, x, y]
                })()}
                scale={scale}
                unit={measurementUnit}
                metersPerWorldUnit={metersPerWorldUnit}
                color={colors.accent}
                idPrefix="room-draft"
              />
            )}

            {!isExporting && tool === 'wall' &&
              visibleElements
                .filter((el): el is Extract<CanvasElement, { type: 'wall' }> => el.type === 'wall')
                .flatMap((el) => {
                  const dots = []
                  for (let i = 0; i < el.points.length; i += 2) {
                    dots.push(
                      <Circle
                        key={`${el.id}-v${i}`}
                        x={el.points[i]}
                        y={el.points[i + 1]}
                        radius={4 / scale}
                        fill={colors.accent}
                        opacity={0.55}
                        listening={false}
                      />,
                    )
                  }
                  return dots
                })}

            {!isExporting && tool === 'wall' && snapVertex && (
              <Circle
                x={snapVertex.x}
                y={snapVertex.y}
                radius={8 / scale}
                stroke={colors.accent}
                strokeWidth={2.5 / scale}
                fill={colors.canvasBg}
                listening={false}
              />
            )}

            {visibleElements
              .filter((el): el is Extract<CanvasElement, { type: 'connector' }> => el.type === 'connector')
              .map((el) => {
                const fromEl = visibleElements.find((e) => e.id === el.fromId)
                const toEl = visibleElements.find((e) => e.id === el.toId)
                const fromBounds = fromEl ? getElementBounds(fromEl) : null
                const toBounds = toEl ? getElementBounds(toEl) : null
                if (!fromBounds || !toBounds) return null
                const fromCenter = { x: fromBounds.cx, y: fromBounds.cy }
                const toCenter = { x: toBounds.cx, y: toBounds.cy }
                const start = rectBoundaryPoint(fromCenter, toCenter, fromBounds.hw, fromBounds.hh)
                const end = rectBoundaryPoint(toCenter, fromCenter, toBounds.hw, toBounds.hh)
                const isSelected = el.id === selectedId
                const strokeColor = isSelected ? colors.accent : colors.textSecondary

                return (
                  <Arrow
                    key={el.id}
                    points={[start.x, start.y, end.x, end.y]}
                    stroke={strokeColor}
                    fill={strokeColor}
                    strokeWidth={(isSelected ? 2.5 : 2) / renderScale}
                    pointerLength={10 / renderScale}
                    pointerWidth={8 / renderScale}
                    hitStrokeWidth={14 / scale}
                    onClick={() => tool === 'select' && setSelectedId(el.id)}
                    onTap={() => tool === 'select' && setSelectedId(el.id)}
                  />
                )
              })}

            {!isExporting &&
              tool === 'connector' &&
              connectorFromId &&
              (() => {
                const fromEl = visibleElements.find((e) => e.id === connectorFromId)
                const bounds = fromEl ? getElementBounds(fromEl) : null
                if (!bounds) return null
                return (
                  <>
                    <Rect
                      x={bounds.cx - bounds.hw - 4 / scale}
                      y={bounds.cy - bounds.hh - 4 / scale}
                      width={bounds.hw * 2 + 8 / scale}
                      height={bounds.hh * 2 + 8 / scale}
                      stroke={colors.accent}
                      strokeWidth={2 / scale}
                      dash={[6 / scale, 4 / scale]}
                      listening={false}
                    />
                    {connectorPreview &&
                      (() => {
                        const start = rectBoundaryPoint(
                          { x: bounds.cx, y: bounds.cy },
                          connectorPreview,
                          bounds.hw,
                          bounds.hh,
                        )
                        return (
                          <Arrow
                            points={[start.x, start.y, connectorPreview.x, connectorPreview.y]}
                            stroke={colors.accent}
                            fill={colors.accent}
                            strokeWidth={2 / scale}
                            dash={[8 / scale, 5 / scale]}
                            pointerLength={10 / scale}
                            pointerWidth={8 / scale}
                            listening={false}
                          />
                        )
                      })()}
                  </>
                )
              })()}

            <Transformer
              ref={trRef}
              visible={!isExporting}
              rotateEnabled
              flipEnabled={false}
              anchorStroke={colors.accent}
              anchorFill={colors.canvasBg}
              borderStroke={colors.accent}
              anchorSize={14}
              anchorCornerRadius={3}
              keepRatio={false}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < MIN_ELEMENT_SIZE || newBox.height < MIN_ELEMENT_SIZE ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      )}

      {isMobile && !readOnly && tool === 'select' && selectedId && (
        // On desktop, deleting is Delete/Backspace or the trash icon in Properties — both easy to
        // find with a keyboard and a mouse. On mobile neither is obvious (no Delete key, and the
        // properties panel is a drawer you have to think to open), which is exactly what caused a
        // tester to get stuck not knowing how to remove something they'd placed.
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <button
            onClick={() => removeElement(selectedId)}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              removeElement(selectedId)
            }}
            title="Eliminar elemento"
            style={{ touchAction: 'manipulation' }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-surface-alt text-danger shadow-lg transition-transform duration-100 hover:scale-105"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      {pendingPlacement && (
        <div className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-surface-border bg-surface-alt py-1.5 pr-1.5 pl-3 shadow-lg">
          <span className="text-xs font-medium text-text-primary">Tocá el plano para colocar "{pendingPlacement.label}"</span>
          <button
            onClick={cancelPlacement}
            onTouchEnd={(e) => {
              // preventDefault, not just stopPropagation: this button is about to unmount (the
              // banner disappears once cancelled), and without it the browser still synthesizes
              // a click/mousedown at this same screen point once the button is gone — which lands
              // on the canvas underneath and is misread as a tap to draw/place something there.
              e.preventDefault()
              e.stopPropagation()
              cancelPlacement()
            }}
            title="Cancelar"
            style={{ touchAction: 'manipulation' }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-soft text-danger transition-transform duration-100 hover:scale-105"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {tool === 'wall' && wallDraft && (
        // Fixed at the bottom of the canvas rather than anchored to the last point placed — a
        // toolbar that follows your last tap sits right where you'd naturally tap next to
        // continue the wall, making it easy to hit by accident (adding an unwanted point) instead
        // of the button you meant to hit, and easy to miss for the opposite reason.
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-surface-border bg-surface-alt p-1.5 shadow-lg">
          <button
            onClick={() => commitWall(wallDraft)}
            onTouchEnd={(e) => {
              // See the pendingPlacement cancel button's comment above: preventDefault stops the
              // browser from synthesizing a click on the canvas underneath once this button is
              // gone, which would otherwise add an unwanted extra wall point right on commit/cancel.
              e.preventDefault()
              e.stopPropagation()
              commitWall(wallDraft)
            }}
            title="Terminar pared (Enter)"
            style={{ touchAction: 'manipulation' }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition-transform duration-100 hover:scale-105"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={cancelWallDraft}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              cancelWallDraft()
            }}
            title="Cancelar (Esc)"
            style={{ touchAction: 'manipulation' }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger transition-transform duration-100 hover:scale-105"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
