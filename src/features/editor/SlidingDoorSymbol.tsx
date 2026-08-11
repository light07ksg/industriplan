import { Line } from 'react-konva'
import type { Point } from '@/lib/geometry'

interface SlidingDoorSymbolProps {
  /** One edge of the opening, on the wall centerline. */
  start: Point
  /** The other edge of the opening, on the wall centerline. */
  end: Point
  /** Unit vector perpendicular to the wall, pointing into the interior. */
  interiorDir: Point
  /** Wall thickness, used to size the two panel lines that span the wall's width. */
  thickness: number
  color: string
  strokeWidth: number
}

/**
 * Plan-view sliding door: two panel lines flush with the wall faces (it slides in the wall's own
 * plane, unlike a hinged door, so there's no swing arc) plus a short double-headed arrow along the
 * wall marking it as operable rather than a fixed window.
 */
export function SlidingDoorSymbol({ start, end, interiorDir, thickness, color, strokeWidth }: SlidingDoorSymbolProps) {
  const half = thickness / 2
  const outerStart = { x: start.x - interiorDir.x * half, y: start.y - interiorDir.y * half }
  const outerEnd = { x: end.x - interiorDir.x * half, y: end.y - interiorDir.y * half }
  const innerStart = { x: start.x + interiorDir.x * half, y: start.y + interiorDir.y * half }
  const innerEnd = { x: end.x + interiorDir.x * half, y: end.y + interiorDir.y * half }

  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const perpX = -uy
  const perpY = ux
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  const armLen = Math.min(len * 0.28, thickness * 2.5)
  const headSize = thickness * 0.45

  const tipA = { x: midX - ux * armLen, y: midY - uy * armLen }
  const tipB = { x: midX + ux * armLen, y: midY + uy * armLen }

  return (
    <>
      <Line points={[outerStart.x, outerStart.y, outerEnd.x, outerEnd.y]} stroke={color} strokeWidth={strokeWidth} listening={false} />
      <Line points={[innerStart.x, innerStart.y, innerEnd.x, innerEnd.y]} stroke={color} strokeWidth={strokeWidth} listening={false} />
      <Line points={[tipA.x, tipA.y, tipB.x, tipB.y]} stroke={color} strokeWidth={strokeWidth * 0.6} listening={false} />
      <Line
        points={[
          tipA.x + ux * headSize + perpX * headSize * 0.6,
          tipA.y + uy * headSize + perpY * headSize * 0.6,
          tipA.x,
          tipA.y,
          tipA.x + ux * headSize - perpX * headSize * 0.6,
          tipA.y + uy * headSize - perpY * headSize * 0.6,
        ]}
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        listening={false}
      />
      <Line
        points={[
          tipB.x - ux * headSize + perpX * headSize * 0.6,
          tipB.y - uy * headSize + perpY * headSize * 0.6,
          tipB.x,
          tipB.y,
          tipB.x - ux * headSize - perpX * headSize * 0.6,
          tipB.y - uy * headSize - perpY * headSize * 0.6,
        ]}
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        listening={false}
      />
    </>
  )
}
