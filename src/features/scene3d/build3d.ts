import { computeWallSegments, type Point } from '@/lib/geometry'
import {
  WALL_THICKNESS,
  type CanvasElement,
  type Layer,
  type WallElement,
  type WallOpeningElement,
  type SymbolElement,
  type AreaElement,
} from '@/store/canvasStore'
import { SYMBOL_CATALOG } from '@/features/symbols/catalog'
import { CATEGORY_COLOR_3D } from './categoryColor3d'
import type { SymbolCategory } from '@/features/symbols/iconPrimitives'

// All real-world heights below are estimates for a first-pass 3D view, in meters — there is no
// per-element height data in the 2D model yet, so a category gets one representative height.
export const WALL_HEIGHT_M = 3
const DOOR_HEIGHT_M = 2.1
const SLIDING_DOOR_HEIGHT_M = 2.4
const WINDOW_SILL_M = 0.9
const WINDOW_HEIGHT_M = 1.2

const CATEGORY_HEIGHT_M: Record<SymbolCategory, number> = {
  estructura: 2.4,
  maquinaria: 1.8,
  almacenamiento: 2.2,
  proceso: 1.2,
  seguridad: 1.6,
  dormitorio: 0.75,
  sala: 0.75,
  bano: 0.85,
  cocina: 0.9,
  oficina: 0.75,
  exterior: 1.5,
  edificio: 3,
}

const ID_HEIGHT_OVERRIDES_M: Record<string, number> = {
  column: 2.7,
  'column-square': 2.7,
  'i-beam-column': 2.7,
  beam: 0.3,
  'floor-drain': 0.02,
  door: DOOR_HEIGHT_M,
  'door-double': DOOR_HEIGHT_M,
  'sliding-door': SLIDING_DOOR_HEIGHT_M,
  window: WINDOW_HEIGHT_M,
  'window-double': WINDOW_HEIGHT_M,
}

const ID_ZFROM_OVERRIDES_M: Record<string, number> = {
  window: WINDOW_SILL_M,
  'window-double': WINDOW_SILL_M,
  beam: WALL_HEIGHT_M - 0.3,
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Konva rotates clockwise around (x,y) in a Y-down plane; mapping plan Y to three.js Z (no flip)
 * turns that into a rotation of -angle around three's Y-up axis. Used for both walls and symbols. */
function planAngleToThreeY(angleRad: number): number {
  return -angleRad
}

export interface Box3D {
  cx: number
  cy: number
  length: number
  thickness: number
  zFrom: number
  zTo: number
  rotY: number
}

export interface SymbolBox3D {
  id: string
  cx: number
  cy: number
  width: number
  depth: number
  zFrom: number
  zTo: number
  rotY: number
  color: string
  label: string
  category: SymbolCategory
}

export interface AreaFloor3D {
  cx: number
  cy: number
  width: number
  depth: number
  label: string
}

export interface Scene3DData {
  solids: Box3D[]
  glass: Box3D[]
  symbols: SymbolBox3D[]
  areas: AreaFloor3D[]
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
}

function makeBox(
  center: Point,
  lengthWorld: number,
  angleRad: number,
  zFrom: number,
  zTo: number,
  thicknessWorld: number,
  metersPerWorldUnit: number,
): Box3D {
  return {
    cx: center.x * metersPerWorldUnit,
    cy: center.y * metersPerWorldUnit,
    length: lengthWorld * metersPerWorldUnit,
    thickness: thicknessWorld * metersPerWorldUnit,
    zFrom,
    zTo,
    rotY: planAngleToThreeY(angleRad),
  }
}

function buildWalls3D(
  walls: WallElement[],
  openings: WallOpeningElement[],
  metersPerWorldUnit: number,
): { solids: Box3D[]; glass: Box3D[] } {
  const solids: Box3D[] = []
  const glass: Box3D[] = []
  const EPS = 0.01

  for (const wall of walls) {
    const segments = computeWallSegments(wall.points)
    const wallOpenings = openings.filter((o) => o.wallId === wall.id)

    segments.forEach((seg, segIndex) => {
      const segLen = seg.length
      const ux = (seg.end.x - seg.start.x) / segLen
      const uy = (seg.end.y - seg.start.y) / segLen
      const angle = Math.atan2(uy, ux)
      const pointAt = (dist: number): Point => ({ x: seg.start.x + ux * dist, y: seg.start.y + uy * dist })

      const pushSolid = (from: number, to: number, zFrom: number, zTo: number) => {
        if (to <= from + EPS) return
        const center = pointAt((from + to) / 2)
        solids.push(makeBox(center, to - from, angle, zFrom, zTo, WALL_THICKNESS, metersPerWorldUnit))
      }

      const segOpenings = wallOpenings
        .filter((o) => o.segmentIndex === segIndex)
        .map((o) => {
          const centerDist = o.t * segLen
          const halfW = Math.min(o.width / 2, segLen / 2)
          return { opening: o, gapStart: Math.max(0, centerDist - halfW), gapEnd: Math.min(segLen, centerDist + halfW) }
        })
        .sort((a, b) => a.gapStart - b.gapStart)

      let cursor = 0
      for (const { opening, gapStart, gapEnd } of segOpenings) {
        pushSolid(cursor, gapStart, 0, WALL_HEIGHT_M)

        const gapCenter = pointAt((gapStart + gapEnd) / 2)
        const gapLen = gapEnd - gapStart

        if (opening.openingType === 'window') {
          solids.push(makeBox(gapCenter, gapLen, angle, 0, WINDOW_SILL_M, WALL_THICKNESS, metersPerWorldUnit))
          solids.push(
            makeBox(gapCenter, gapLen, angle, WINDOW_SILL_M + WINDOW_HEIGHT_M, WALL_HEIGHT_M, WALL_THICKNESS, metersPerWorldUnit),
          )
          glass.push(
            makeBox(
              gapCenter,
              gapLen,
              angle,
              WINDOW_SILL_M,
              WINDOW_SILL_M + WINDOW_HEIGHT_M,
              WALL_THICKNESS * 0.4,
              metersPerWorldUnit,
            ),
          )
        } else {
          const doorHeight = opening.openingType === 'slidingDoor' ? SLIDING_DOOR_HEIGHT_M : DOOR_HEIGHT_M
          if (doorHeight < WALL_HEIGHT_M) {
            solids.push(makeBox(gapCenter, gapLen, angle, doorHeight, WALL_HEIGHT_M, WALL_THICKNESS, metersPerWorldUnit))
          }
        }

        cursor = gapEnd
      }
      pushSolid(cursor, segLen, 0, WALL_HEIGHT_M)
    })
  }

  return { solids, glass }
}

function buildSymbols3D(symbolElements: SymbolElement[], metersPerWorldUnit: number): SymbolBox3D[] {
  const result: SymbolBox3D[] = []

  for (const el of symbolElements) {
    const def = SYMBOL_CATALOG.find((s) => s.id === el.symbolId)
    if (!def) continue

    const angleRad = degToRad(el.rotation)
    const ox = el.width / 2
    const oy = el.height / 2
    const rotatedOx = ox * Math.cos(angleRad) - oy * Math.sin(angleRad)
    const rotatedOy = ox * Math.sin(angleRad) + oy * Math.cos(angleRad)
    const center: Point = { x: el.x + rotatedOx, y: el.y + rotatedOy }

    const height = ID_HEIGHT_OVERRIDES_M[def.id] ?? CATEGORY_HEIGHT_M[def.category]
    const zFrom = ID_ZFROM_OVERRIDES_M[def.id] ?? 0

    result.push({
      id: el.id,
      cx: center.x * metersPerWorldUnit,
      cy: center.y * metersPerWorldUnit,
      width: el.width * metersPerWorldUnit,
      depth: el.height * metersPerWorldUnit,
      zFrom,
      zTo: zFrom + height,
      rotY: planAngleToThreeY(angleRad),
      color: CATEGORY_COLOR_3D[def.category],
      label: el.label,
      category: def.category,
    })
  }

  return result
}

function buildAreas3D(areaElements: AreaElement[], metersPerWorldUnit: number): AreaFloor3D[] {
  return areaElements.map((el) => ({
    cx: (el.x + el.width / 2) * metersPerWorldUnit,
    cy: (el.y + el.height / 2) * metersPerWorldUnit,
    width: el.width * metersPerWorldUnit,
    depth: el.height * metersPerWorldUnit,
    label: el.label,
  }))
}

export function buildScene3D(elements: CanvasElement[], layers: Layer[], metersPerWorldUnit: number): Scene3DData {
  const hiddenLayerIds = new Set(layers.filter((l) => !l.visible).map((l) => l.id))
  const visible = elements.filter((el) => !hiddenLayerIds.has(el.layerId))

  const walls = visible.filter((el): el is WallElement => el.type === 'wall')
  const openings = visible.filter((el): el is WallOpeningElement => el.type === 'wallOpening')
  const symbolElements = visible.filter((el): el is SymbolElement => el.type === 'symbol')
  const areaElements = visible.filter((el): el is AreaElement => el.type === 'area')

  const { solids, glass } = buildWalls3D(walls, openings, metersPerWorldUnit)
  const symbols = buildSymbols3D(symbolElements, metersPerWorldUnit)
  const areas = buildAreas3D(areaElements, metersPerWorldUnit)

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  const extend = (x: number, y: number) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  for (const wall of walls) {
    for (let i = 0; i + 1 < wall.points.length; i += 2) {
      extend(wall.points[i] * metersPerWorldUnit, wall.points[i + 1] * metersPerWorldUnit)
    }
  }
  for (const s of symbols) {
    extend(s.cx - s.width, s.cy - s.depth)
    extend(s.cx + s.width, s.cy + s.depth)
  }
  for (const a of areas) {
    extend(a.cx - a.width / 2, a.cy - a.depth / 2)
    extend(a.cx + a.width / 2, a.cy + a.depth / 2)
  }

  if (!Number.isFinite(minX)) {
    minX = 0
    maxX = 10
    minY = 0
    maxY = 10
  }

  return { solids, glass, symbols, areas, bounds: { minX, maxX, minY, maxY } }
}
