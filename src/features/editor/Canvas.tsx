import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent } from 'react'
import { Check, X } from 'lucide-react'
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
  DOOR_WIDTH,
  DOUBLE_DOOR_WIDTH,
  WINDOW_WIDTH,
  SLIDING_DOOR_WIDTH,
  DOUBLE_WINDOW_WIDTH,
} from '@/store/canvasStore'
import { useExportStore } from '@/store/exportStore'
import { useProjectSessionStore } from '@/store/projectSessionStore'
import { useThemeColors } from '@/lib/useThemeColors'
import {
  snapToGrid,
  snapPoint,
  toWorld,
  zoomAtPoint,
  rectBoundaryPoint,
  nearestPointOnWall,
  type Point,
} from '@/lib/geometry'
import { measureTextWidth } from '@/lib/measureText'
import { SYMBOL_CATALOG } from '@/features/symbols/catalog'
import { categoryColor, categorySoftColor } from '@/features/symbols/categoryColor'
import { SYMBOL_DRAG_MIME, NOTE_DRAG_ID } from '@/features/symbols/SymbolLibrary'
import { exportStageToPdf, exportStageToPng } from '@/features/export/exportCanvas'
import { Grid } from './Grid'
import { SymbolShape } from './SymbolShape'
import { WallDimensions } from './WallDimensions'
import { WallWithOpenings } from './WallWithOpenings'
import { DoorSymbol } from './DoorSymbol'
import { DoubleDoorSymbol } from './DoubleDoorSymbol'
import { SlidingDoorSymbol } from './SlidingDoorSymbol'
import { WindowSymbol } from './WindowSymbol'

const WALL_OPENING_SNAP_RADIUS_PX = 40

const WALL_OPENING_SYMBOLS = {
  door: { openingType: 'door', width: DOOR_WIDTH },
  'door-double': { openingType: 'doubleDoor', width: DOUBLE_DOOR_WIDTH },
  'sliding-door': { openingType: 'slidingDoor', width: SLIDING_DOOR_WIDTH },
  window: { openingType: 'window', width: WINDOW_WIDTH },
  'window-double': { openingType: 'window', width: DOUBLE_WINDOW_WIDTH },
} as const

const WHEEL_ZOOM_STEP = 1.05
const MIN_ELEMENT_SIZE = 20
const MIN_AREA_DRAFT = 6
const WALL_JOIN_RADIUS_PX = 14

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

/** Finds the wall closest to `point` (within a screen-space radius), for snapping a dropped door/window onto it. */
function findNearestWallForOpening(
  point: Point,
  elements: CanvasElement[],
  scale: number,
): { wallId: string; segmentIndex: number; t: number } | null {
  const threshold = WALL_OPENING_SNAP_RADIUS_PX / scale
  let best: { wallId: string; segmentIndex: number; t: number; distance: number } | null = null

  for (const el of elements) {
    if (el.type !== 'wall') continue
    const hit = nearestPointOnWall(point, el.points)
    if (hit && hit.distance <= threshold && (!best || hit.distance < best.distance)) {
      best = { wallId: el.id, segmentIndex: hit.segmentIndex, t: hit.t, distance: hit.distance }
    }
  }

  return best
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
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const shapeRefs = useRef<Record<string, Konva.Node | null>>({})

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [wallDraft, setWallDraft] = useState<number[] | null>(null)
  const [wallPreview, setWallPreview] = useState<Point | null>(null)
  const [areaDraft, setAreaDraft] = useState<{ start: Point; current: Point } | null>(null)
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
  const clearExportRequest = useExportStore((s) => s.clearExportRequest)
  const setExportingState = useExportStore((s) => s.setExporting)
  const setExportError = useExportStore((s) => s.setError)
  const currentProjectName = useProjectSessionStore((s) => s.currentProjectName)

  const colors = useThemeColors()
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
        id: crypto.randomUUID(),
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
    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    const rawWorld = toWorld(pointer, scale, position)
    const world = snapEnabled ? snapPoint(rawWorld, gridSize) : rawWorld

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
      const wallSnapped = wallSnapMode === 'grid' ? snapPoint(rawWorld, WALL_SNAP_STEP) : rawWorld
      const point = vertex ?? wallSnapped
      setWallDraft((prev) => (prev ? [...prev, point.x, point.y] : [point.x, point.y]))
      setWallPreview(point)
      setSnapVertex(vertex)
      return
    }

    if (tool === 'area') {
      setAreaDraft({ start: world, current: world })
    }
  }

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    const rawWorld = toWorld(pointer, scale, position)
    const world = snapEnabled ? snapPoint(rawWorld, gridSize) : rawWorld

    if (tool === 'wall') {
      const vertex = findNearestWallVertex(rawWorld, visibleElements, wallDraft, scale)
      setSnapVertex(vertex)
      if (wallDraft) {
        const wallSnapped = wallSnapMode === 'grid' ? snapPoint(rawWorld, WALL_SNAP_STEP) : rawWorld
        setWallPreview(vertex ?? wallSnapped)
      }
    } else if (tool === 'area' && areaDraft) {
      setAreaDraft((prev) => (prev ? { ...prev, current: world } : prev))
    } else if (tool === 'connector' && connectorFromId) {
      setConnectorPreview(rawWorld)
    }
  }

  const handleStageMouseUp = () => {
    if (tool === 'area' && areaDraft) {
      const x = Math.min(areaDraft.start.x, areaDraft.current.x)
      const y = Math.min(areaDraft.start.y, areaDraft.current.y)
      const width = Math.abs(areaDraft.current.x - areaDraft.start.x)
      const height = Math.abs(areaDraft.current.y - areaDraft.start.y)
      if (width >= MIN_AREA_DRAFT && height >= MIN_AREA_DRAFT) {
        addElement({
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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

  const handleOpeningMoved = (opening: WallOpeningElement, t: number) => {
    pushHistory()
    updateElement(opening.id, { t: Math.min(1, Math.max(0, t)) })
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
    const rect = containerRef.current.getBoundingClientRect()
    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const world = toWorld(screenPoint, scale, position)

    if (symbolId === NOTE_DRAG_ID) {
      let { x, y } = world
      if (snapEnabled) {
        const snapped = snapPoint({ x, y }, gridSize)
        x = snapped.x
        y = snapped.y
      }
      addElement({
        id: crypto.randomUUID(),
        type: 'note',
        text: 'Nota',
        x,
        y,
        fontSize: 16,
        fontFamily: 'system-ui',
        bold: false,
        italic: false,
        underline: false,
        rotation: 0,
        layerId: DEFAULT_LAYER_FOR_TYPE.note,
      })
      return
    }

    const def = SYMBOL_CATALOG.find((s) => s.id === symbolId)
    if (!def) return

    const wallOpeningDef = WALL_OPENING_SYMBOLS[symbolId as keyof typeof WALL_OPENING_SYMBOLS]
    if (wallOpeningDef) {
      const hit = findNearestWallForOpening(world, visibleElements, scale)
      if (hit) {
        const { openingType, width } = wallOpeningDef
        addElement({
          id: crypto.randomUUID(),
          type: 'wallOpening',
          openingType,
          wallId: hit.wallId,
          segmentIndex: hit.segmentIndex,
          t: hit.t,
          width,
          flip: false,
          label: def.name,
          rotation: 0,
          layerId: DEFAULT_LAYER_FOR_TYPE.wallOpening,
        })
        return
      }
    }

    let x = world.x - def.defaultWidth / 2
    let y = world.y - def.defaultHeight / 2
    if (snapEnabled) {
      const snapped = snapPoint({ x, y }, gridSize)
      x = snapped.x
      y = snapped.y
    }
    addElement({
      id: crypto.randomUUID(),
      type: 'symbol',
      symbolId: def.id,
      label: def.name,
      x,
      y,
      width: def.defaultWidth,
      height: def.defaultHeight,
      rotation: 0,
      layerId: DEFAULT_LAYER_FOR_TYPE.symbol,
    })
  }

  const cursorClass = tool === 'select' ? '' : 'cursor-crosshair'

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${cursorClass}`}
      style={{ background: colors.canvasBg }}
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
          onMouseUp={handleStageMouseUp}
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
                    {(() => {
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
              const isLooseOpening = def.id in WALL_OPENING_SYMBOLS
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
                    {isLooseOpening ? (
                      def.id === 'door' ? (
                        <DoorSymbol
                          hinge={{ x: 0, y: 0 }}
                          wallDir={{ x: 1, y: 0 }}
                          interiorDir={{ x: 0, y: 1 }}
                          width={el.width}
                          color={color}
                          strokeWidth={WALL_THICKNESS * 0.4}
                        />
                      ) : def.id === 'door-double' ? (
                        <DoubleDoorSymbol
                          start={{ x: 0, y: 0 }}
                          end={{ x: el.width, y: 0 }}
                          wallDir={{ x: 1, y: 0 }}
                          interiorDir={{ x: 0, y: 1 }}
                          width={el.width}
                          color={color}
                          strokeWidth={WALL_THICKNESS * 0.4}
                        />
                      ) : def.id === 'sliding-door' ? (
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
                  {(() => {
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
              anchorSize={8}
              keepRatio={false}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < MIN_ELEMENT_SIZE || newBox.height < MIN_ELEMENT_SIZE ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      )}

      {tool === 'wall' && wallDraft && (() => {
        const lastX = wallDraft[wallDraft.length - 2]
        const lastY = wallDraft[wallDraft.length - 1]
        const screenX = lastX * scale + position.x
        const screenY = lastY * scale + position.y
        const left = Math.min(Math.max(screenX + 14, 8), size.width - 84)
        const top = Math.min(Math.max(screenY - 42, 8), size.height - 40)

        return (
          <div
            className="absolute z-10 flex items-center gap-1 rounded-full border border-surface-border bg-surface-alt p-1 shadow-lg"
            style={{ left, top }}
          >
            <button
              onClick={() => commitWall(wallDraft)}
              title="Terminar pared (Enter)"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white transition-transform duration-100 hover:scale-105"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={cancelWallDraft}
              title="Cancelar (Esc)"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-soft text-danger transition-transform duration-100 hover:scale-105"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })()}
    </div>
  )
}
