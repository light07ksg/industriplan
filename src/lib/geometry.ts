export const MIN_SCALE = 0.1
export const MAX_SCALE = 5

export interface Point {
  x: number
  y: number
}

export interface ZoomState {
  scale: number
  position: Point
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export function snapPoint(point: Point, gridSize: number): Point {
  return { x: snapToGrid(point.x, gridSize), y: snapToGrid(point.y, gridSize) }
}

/** Converts a point in stage/screen coordinates to world coordinates. */
export function toWorld(point: Point, scale: number, position: Point): Point {
  return { x: (point.x - position.x) / scale, y: (point.y - position.y) / scale }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Finds where a ray from `center` towards `towards` exits an axis-aligned rectangle
 * centered on `center`. Used to stop connector arrows at the edge of the shapes they
 * link instead of overlapping them.
 */
export function rectBoundaryPoint(center: Point, towards: Point, halfWidth: number, halfHeight: number): Point {
  const dx = towards.x - center.x
  const dy = towards.y - center.y
  if (dx === 0 && dy === 0) return center
  const scaleX = dx !== 0 ? halfWidth / Math.abs(dx) : Infinity
  const scaleY = dy !== 0 ? halfHeight / Math.abs(dy) : Infinity
  const scale = Math.min(scaleX, scaleY)
  return { x: center.x + dx * scale, y: center.y + dy * scale }
}

/** Zooms so that `point` (in stage/screen coordinates) stays under the cursor. */
export function zoomAtPoint(current: ZoomState, point: Point, factor: number): ZoomState {
  const oldScale = current.scale
  const worldPoint = {
    x: (point.x - current.position.x) / oldScale,
    y: (point.y - current.position.y) / oldScale,
  }
  const newScale = clamp(oldScale * factor, MIN_SCALE, MAX_SCALE)
  return {
    scale: newScale,
    position: {
      x: point.x - worldPoint.x * newScale,
      y: point.y - worldPoint.y * newScale,
    },
  }
}

export interface WallSegment {
  start: Point
  end: Point
  /** Unit vector pointing to the "outside" of the wall chain, used to place dimension labels. */
  normal: Point
  /** Segment angle in degrees, normalized to [-90, 90] so labels never render upside down. */
  angleDeg: number
  length: number
}

/**
 * Splits a wall polyline into segments and picks a consistent "exterior" side to place
 * dimension labels on. For a bent chain (e.g. an L-shaped wall), the side is chosen from the
 * chain's overall turning direction so the label sits outside the enclosed corner. A straight
 * wall has no inherent inside/outside, so it defaults to whichever side reads more naturally
 * (the one that isn't "upward" on screen).
 */
export function computeWallSegments(points: number[]): WallSegment[] {
  const verts: Point[] = []
  for (let i = 0; i + 1 < points.length; i += 2) {
    verts.push({ x: points[i], y: points[i + 1] })
  }
  if (verts.length < 2) return []

  let turnSum = 0
  for (let i = 1; i < verts.length - 1; i++) {
    const prev = { x: verts[i].x - verts[i - 1].x, y: verts[i].y - verts[i - 1].y }
    const next = { x: verts[i + 1].x - verts[i].x, y: verts[i + 1].y - verts[i].y }
    turnSum += prev.x * next.y - prev.y * next.x
  }
  const turnSign = turnSum > 0 ? 1 : turnSum < 0 ? -1 : 0

  const segments: WallSegment[] = []
  for (let i = 0; i < verts.length - 1; i++) {
    const start = verts[i]
    const end = verts[i + 1]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    if (length === 0) continue

    const ux = dx / length
    const uy = dy / length
    const n1 = { x: -uy, y: ux }
    const n2 = { x: uy, y: -ux }
    const normal = turnSign === 0 ? (n1.y <= n2.y ? n1 : n2) : turnSign > 0 ? n2 : n1

    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI
    if (angleDeg > 90) angleDeg -= 180
    else if (angleDeg < -90) angleDeg += 180

    segments.push({ start, end, normal, angleDeg, length })
  }
  return segments
}

export interface WallHit {
  segmentIndex: number
  /** 0..1 position along that segment. */
  t: number
  point: Point
  distance: number
}

/** Closest point on any segment of a wall polyline to `point`, used to snap doors/windows onto a wall. */
export function nearestPointOnWall(point: Point, wallPoints: number[]): WallHit | null {
  let best: WallHit | null = null
  let segmentIndex = 0

  for (let i = 0; i + 3 < wallPoints.length; i += 2) {
    const ax = wallPoints[i]
    const ay = wallPoints[i + 1]
    const bx = wallPoints[i + 2]
    const by = wallPoints[i + 3]
    const dx = bx - ax
    const dy = by - ay
    const lenSq = dx * dx + dy * dy

    if (lenSq > 0) {
      let t = ((point.x - ax) * dx + (point.y - ay) * dy) / lenSq
      t = clamp(t, 0, 1)
      const px = ax + dx * t
      const py = ay + dy * t
      const distance = Math.hypot(point.x - px, point.y - py)
      if (!best || distance < best.distance) {
        best = { segmentIndex, t, point: { x: px, y: py }, distance }
      }
    }
    segmentIndex++
  }

  return best
}

/** Projects `point` onto the segment's line, clamped so it stays `minDist`..`maxDist` from `start`. */
export function projectOntoSegmentClamped(point: Point, start: Point, unit: Point, minDist: number, maxDist: number): number {
  const dx = point.x - start.x
  const dy = point.y - start.y
  const dist = dx * unit.x + dy * unit.y
  return clamp(dist, minDist, maxDist)
}
