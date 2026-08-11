import { Line } from 'react-konva'
import type { Point } from '@/lib/geometry'

interface WindowSymbolProps {
  /** One edge of the opening, on the wall centerline. */
  start: Point
  /** The other edge of the opening, on the wall centerline. */
  end: Point
  /** Unit vector perpendicular to the wall, pointing into the interior. */
  interiorDir: Point
  /** Wall thickness, used to size the two frame lines that span the wall's width. */
  thickness: number
  color: string
  strokeWidth: number
}

/** Plan-view window: two frame lines at the wall's outer faces plus a thin glass line down the middle. */
export function WindowSymbol({ start, end, interiorDir, thickness, color, strokeWidth }: WindowSymbolProps) {
  const half = thickness / 2
  const outerStart = { x: start.x - interiorDir.x * half, y: start.y - interiorDir.y * half }
  const outerEnd = { x: end.x - interiorDir.x * half, y: end.y - interiorDir.y * half }
  const innerStart = { x: start.x + interiorDir.x * half, y: start.y + interiorDir.y * half }
  const innerEnd = { x: end.x + interiorDir.x * half, y: end.y + interiorDir.y * half }

  return (
    <>
      <Line points={[outerStart.x, outerStart.y, outerEnd.x, outerEnd.y]} stroke={color} strokeWidth={strokeWidth} listening={false} />
      <Line points={[start.x, start.y, end.x, end.y]} stroke={color} strokeWidth={strokeWidth * 0.6} listening={false} />
      <Line points={[innerStart.x, innerStart.y, innerEnd.x, innerEnd.y]} stroke={color} strokeWidth={strokeWidth} listening={false} />
    </>
  )
}
