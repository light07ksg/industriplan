import { nearestPointOnWall, snapPoint, toWorld, type Point } from '@/lib/geometry'
import {
  useCanvasStore,
  DEFAULT_LAYER_FOR_TYPE,
  DOOR_WIDTH,
  DOUBLE_DOOR_WIDTH,
  WINDOW_WIDTH,
  SLIDING_DOOR_WIDTH,
  DOUBLE_WINDOW_WIDTH,
  NARROW_DOOR_WIDTH,
  WIDE_DOOR_WIDTH,
  FIRE_DOOR_WIDTH,
  WIDE_DOUBLE_DOOR_WIDTH,
  NARROW_SLIDING_DOOR_WIDTH,
  GARAGE_DOOR_WIDTH,
  SMALL_WINDOW_WIDTH,
  LARGE_WINDOW_WIDTH,
  type CanvasElement,
} from '@/store/canvasStore'
import { SYMBOL_CATALOG } from '@/features/symbols/catalog'
import { NOTE_DRAG_ID } from '@/features/symbols/dragConstants'
import { generateId } from '@/lib/id'

const WALL_OPENING_SNAP_RADIUS_PX = 40

export const WALL_OPENING_SYMBOLS = {
  door: { openingType: 'door', width: DOOR_WIDTH },
  'door-double': { openingType: 'doubleDoor', width: DOUBLE_DOOR_WIDTH },
  'sliding-door': { openingType: 'slidingDoor', width: SLIDING_DOOR_WIDTH },
  window: { openingType: 'window', width: WINDOW_WIDTH },
  'window-double': { openingType: 'window', width: DOUBLE_WINDOW_WIDTH },
  'door-narrow': { openingType: 'door', width: NARROW_DOOR_WIDTH },
  'door-wide': { openingType: 'door', width: WIDE_DOOR_WIDTH },
  'door-fire': { openingType: 'door', width: FIRE_DOOR_WIDTH },
  'door-double-wide': { openingType: 'doubleDoor', width: WIDE_DOUBLE_DOOR_WIDTH },
  'sliding-door-narrow': { openingType: 'slidingDoor', width: NARROW_SLIDING_DOOR_WIDTH },
  'garage-door': { openingType: 'slidingDoor', width: GARAGE_DOOR_WIDTH },
  'window-small': { openingType: 'window', width: SMALL_WINDOW_WIDTH },
  'window-large': { openingType: 'window', width: LARGE_WINDOW_WIDTH },
} as const

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

/** Places a dragged catalog symbol (or the note sentinel) onto the canvas at a screen point,
 * relative to the canvas container element. Used by the desktop HTML5 drag-and-drop path
 * (Canvas.tsx's onDrop) — reads store state directly so it works from outside the Canvas
 * component with no prop drilling. */
export function placeSymbolAtScreenPoint(symbolId: string, screenPoint: Point, containerEl: HTMLElement): void {
  const { scale, position } = useCanvasStore.getState()
  const rect = containerEl.getBoundingClientRect()
  const relativePoint = { x: screenPoint.x - rect.left, y: screenPoint.y - rect.top }
  const world = toWorld(relativePoint, scale, position)
  placeSymbolAtWorldPoint(symbolId, world)
}

/** Same placement logic, taking a world-space point directly — used by the mobile tap-to-place
 * flow, where Canvas.tsx already has the tapped point in world coordinates from its own stage
 * event handling. */
export function placeSymbolAtWorldPoint(symbolId: string, world: Point): void {
  const { snapEnabled, gridSize, elements, scale, addElement } = useCanvasStore.getState()

  if (symbolId === NOTE_DRAG_ID) {
    let { x, y } = world
    if (snapEnabled) {
      const snapped = snapPoint({ x, y }, gridSize)
      x = snapped.x
      y = snapped.y
    }
    addElement({
      id: generateId(),
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
    const hit = findNearestWallForOpening(world, elements, scale)
    if (hit) {
      const { openingType, width } = wallOpeningDef
      addElement({
        id: generateId(),
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
    id: generateId(),
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
