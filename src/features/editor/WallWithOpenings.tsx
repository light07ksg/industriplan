import { Fragment, type ReactNode } from 'react'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { Line, Circle } from 'react-konva'
import { computeWallSegments, toWorld, type Point } from '@/lib/geometry'
import { WALL_THICKNESS, type Tool, type WallElement, type WallOpeningElement } from '@/store/canvasStore'
import type { ThemePalette } from '@/lib/theme'
import type { MeasurementUnit } from '@/lib/units'
import { WallDimensions } from './WallDimensions'
import { DoorSymbol } from './DoorSymbol'
import { DoubleDoorSymbol } from './DoubleDoorSymbol'
import { SlidingDoorSymbol } from './SlidingDoorSymbol'
import { WindowSymbol } from './WindowSymbol'

const SELECTED_WALL_THICKNESS = WALL_THICKNESS * 1.3

interface WallWithOpeningsProps {
  wall: WallElement
  openings: WallOpeningElement[]
  colors: ThemePalette
  scale: number
  renderScale: number
  stagePosition: Point
  tool: Tool
  interactive: boolean
  selectedId: string | null
  showMeasurements: boolean
  measurementUnit: MeasurementUnit
  metersPerWorldUnit: number
  registerShapeRef: (id: string, node: Konva.Node | null) => void
  onSelectWall: () => void
  onSelectOpening: (id: string) => void
  onWallDragEnd: (e: KonvaEventObject<DragEvent>) => void
  onOpeningDragStart: () => void
  onOpeningMoved: (opening: WallOpeningElement, t: number) => void
}

export function WallWithOpenings({
  wall,
  openings,
  colors,
  scale,
  renderScale,
  stagePosition,
  tool,
  interactive,
  selectedId,
  showMeasurements,
  measurementUnit,
  metersPerWorldUnit,
  registerShapeRef,
  onSelectWall,
  onSelectOpening,
  onWallDragEnd,
  onOpeningDragStart,
  onOpeningMoved,
}: WallWithOpeningsProps) {
  const isWallSelected = wall.id === selectedId
  const segments = computeWallSegments(wall.points)
  const wallColor = isWallSelected ? colors.accent : colors.structure
  const wallStrokeWidth = isWallSelected ? SELECTED_WALL_THICKNESS : WALL_THICKNESS
  // A closed loop (last point back on the first — a rectangle from the Room tool, or a free-hand
  // wall the user snapped closed) has no free-standing ends: every vertex, including the wrap-
  // around one, is a corner joining two segments.
  const isClosed =
    wall.points.length >= 6 &&
    Math.abs(wall.points[0] - wall.points[wall.points.length - 2]) < 0.01 &&
    Math.abs(wall.points[1] - wall.points[wall.points.length - 1]) < 0.01

  const lineElements: ReactNode[] = []
  const openingElements: ReactNode[] = []

  segments.forEach((seg, segIndex) => {
    const segLen = seg.length
    const ux = (seg.end.x - seg.start.x) / segLen
    const uy = (seg.end.y - seg.start.y) / segLen
    const interiorDir = { x: -seg.normal.x, y: -seg.normal.y }
    const pointAt = (dist: number) => ({ x: seg.start.x + ux * dist, y: seg.start.y + uy * dist })
    // Each wall segment renders as one or more separate Line pieces (split around door/window
    // gaps), so Konva's own lineJoin can't miter them together at a corner — every piece is its
    // own independent shape with butt-capped ends, which left a visible notch at every corner.
    // Instead, the end of a piece that lands on a real corner (not a door/window cut) is manually
    // pushed out by half the stroke width along the wall's own direction, so adjacent walls'
    // strokes overlap enough to fill the gap.
    const startIsCorner = isClosed || segIndex > 0
    const endIsCorner = isClosed || segIndex < segments.length - 1
    const pushWallLine = (from: Point, to: Point, extendStart: boolean, extendEnd: boolean, key: string) => {
      const half = wallStrokeWidth / 2
      const p1 = extendStart ? { x: from.x - ux * half, y: from.y - uy * half } : from
      const p2 = extendEnd ? { x: to.x + ux * half, y: to.y + uy * half } : to
      lineElements.push(
        <Line
          key={key}
          points={[p1.x, p1.y, p2.x, p2.y]}
          stroke={wallColor}
          strokeWidth={wallStrokeWidth}
          lineCap="butt"
          lineJoin="miter"
          listening={false}
        />,
      )
    }

    const segOpenings = openings
      .filter((o) => o.segmentIndex === segIndex)
      .map((o) => {
        const centerDist = o.t * segLen
        const halfW = Math.min(o.width / 2, segLen / 2)
        return { opening: o, gapStart: Math.max(0, centerDist - halfW), gapEnd: Math.min(segLen, centerDist + halfW) }
      })
      .sort((a, b) => a.gapStart - b.gapStart)

    let cursor = 0

    for (const { opening, gapStart, gapEnd } of segOpenings) {
      if (gapStart > cursor + 0.01) {
        const p1 = pointAt(cursor)
        const p2 = pointAt(gapStart)
        pushWallLine(p1, p2, cursor === 0 && startIsCorner, false, `${wall.id}-seg${segIndex}-${lineElements.length}`)
      }

      const gapStartPoint = pointAt(gapStart)
      const gapEndPoint = pointAt(gapEnd)
      const hinge = opening.flip ? gapEndPoint : gapStartPoint
      const wallDir = opening.flip ? { x: -ux, y: -uy } : { x: ux, y: uy }
      const openingWidth = gapEnd - gapStart
      const isOpeningSelected = opening.id === selectedId
      const openingColor = isOpeningSelected ? colors.accent : colors.structure
      const center = pointAt((gapStart + gapEnd) / 2)

      // Doors visually swing well past the wall centerline (up to a full opening-width into the
      // interior), so the click/drag target is shifted and enlarged to actually cover the leaf and
      // arc — otherwise clicks there fall through to the wall behind it. Windows stay thin and
      // centered on the wall, so they just get a bigger (not shifted) target.
      const isDoor = opening.openingType === 'door' || opening.openingType === 'doubleDoor'
      const hitCenter = isDoor
        ? { x: center.x + interiorDir.x * openingWidth * 0.4, y: center.y + interiorDir.y * openingWidth * 0.4 }
        : center
      const hitRadius = (isDoor ? Math.max(openingWidth * 0.65, WALL_THICKNESS * 2) : Math.max(openingWidth * 0.6, WALL_THICKNESS * 2)) / scale

      openingElements.push(
        <Fragment key={opening.id}>
          {isOpeningSelected && (
            <Circle
              x={hitCenter.x}
              y={hitCenter.y}
              radius={hitRadius}
              stroke={colors.accent}
              strokeWidth={1.5 / scale}
              dash={[5 / scale, 4 / scale]}
              listening={false}
            />
          )}
          {opening.openingType === 'doubleDoor' ? (
            <DoubleDoorSymbol
              start={gapStartPoint}
              end={gapEndPoint}
              wallDir={{ x: ux, y: uy }}
              interiorDir={interiorDir}
              width={openingWidth}
              color={openingColor}
              strokeWidth={WALL_THICKNESS * 0.4}
            />
          ) : isDoor ? (
            <DoorSymbol
              hinge={hinge}
              wallDir={wallDir}
              interiorDir={interiorDir}
              width={openingWidth}
              color={openingColor}
              strokeWidth={WALL_THICKNESS * 0.4}
            />
          ) : opening.openingType === 'slidingDoor' ? (
            <SlidingDoorSymbol
              start={gapStartPoint}
              end={gapEndPoint}
              interiorDir={interiorDir}
              thickness={WALL_THICKNESS}
              color={openingColor}
              strokeWidth={WALL_THICKNESS * 0.32}
            />
          ) : (
            <WindowSymbol
              start={gapStartPoint}
              end={gapEndPoint}
              interiorDir={interiorDir}
              thickness={WALL_THICKNESS}
              color={openingColor}
              strokeWidth={WALL_THICKNESS * 0.28}
            />
          )}
          <Circle
            ref={(node) => registerShapeRef(opening.id, node)}
            x={hitCenter.x}
            y={hitCenter.y}
            radius={hitRadius}
            fill="rgba(0,0,0,0.001)"
            draggable={interactive && tool === 'select'}
            dragBoundFunc={(pos) => {
              const worldPos = toWorld(pos, scale, stagePosition)
              const dx = worldPos.x - seg.start.x
              const dy = worldPos.y - seg.start.y
              const rawDist = dx * ux + dy * uy
              const halfW = Math.min(opening.width / 2, segLen / 2)
              const dist = Math.min(segLen - halfW, Math.max(halfW, rawDist))
              const projected = pointAt(dist)
              return { x: projected.x * scale + stagePosition.x, y: projected.y * scale + stagePosition.y }
            }}
            onClick={() => interactive && tool === 'select' && onSelectOpening(opening.id)}
            onTap={() => interactive && tool === 'select' && onSelectOpening(opening.id)}
            onDragStart={() => onOpeningDragStart()}
            onDragMove={(e) => {
              const node = e.target
              const dx = node.x() - seg.start.x
              const dy = node.y() - seg.start.y
              const dist = dx * ux + dy * uy
              onOpeningMoved(opening, segLen > 0 ? dist / segLen : 0)
            }}
            onDragEnd={(e) => {
              const node = e.target
              const dx = node.x() - seg.start.x
              const dy = node.y() - seg.start.y
              const dist = dx * ux + dy * uy
              onOpeningMoved(opening, segLen > 0 ? dist / segLen : 0)
            }}
          />
        </Fragment>,
      )

      cursor = gapEnd
    }

    if (cursor < segLen - 0.01) {
      const p1 = pointAt(cursor)
      pushWallLine(p1, seg.end, cursor === 0 && startIsCorner, endIsCorner, `${wall.id}-seg${segIndex}-tail`)
    }
  })

  return (
    <>
      <Line
        ref={(node) => registerShapeRef(wall.id, node)}
        points={wall.points}
        stroke="rgba(0,0,0,0.001)"
        strokeWidth={Math.max(wallStrokeWidth, 16) / scale}
        lineCap="round"
        lineJoin="round"
        draggable={interactive && tool === 'select'}
        onClick={() => interactive && tool === 'select' && onSelectWall()}
        onTap={() => interactive && tool === 'select' && onSelectWall()}
        onDragEnd={onWallDragEnd}
      />
      {lineElements}
      {openingElements}
      {showMeasurements && (
        <WallDimensions
          points={wall.points}
          scale={renderScale}
          unit={measurementUnit}
          metersPerWorldUnit={metersPerWorldUnit}
          color={isWallSelected ? colors.accent : colors.textSecondary}
          idPrefix={wall.id}
        />
      )}
    </>
  )
}
