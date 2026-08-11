import { Line } from 'react-konva'
import type { Point } from '@/lib/geometry'

interface DoorSymbolProps {
  /** The hinge point, on the wall centerline. */
  hinge: Point
  /** Unit vector along the wall, pointing from the hinge toward the far edge of the opening. */
  wallDir: Point
  /** Unit vector perpendicular to the wall, pointing into the interior (where the door swings open). */
  interiorDir: Point
  width: number
  color: string
  strokeWidth: number
}

const ARC_STEPS = 16

/**
 * Classic architectural plan-view door: a solid leaf swung open 90° into the interior, plus a
 * dashed quarter-circle arc tracing its sweep back to the wall. Both are parametrized directly in
 * the wall's own (wallDir, interiorDir) basis, so the geometry is correct regardless of the wall's
 * angle on screen.
 */
export function DoorSymbol({ hinge, wallDir, interiorDir, width, color, strokeWidth }: DoorSymbolProps) {
  const leafEnd = { x: hinge.x + interiorDir.x * width, y: hinge.y + interiorDir.y * width }

  const arcPoints: number[] = []
  for (let i = 0; i <= ARC_STEPS; i++) {
    const theta = (i / ARC_STEPS) * (Math.PI / 2)
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    arcPoints.push(hinge.x + width * (wallDir.x * c + interiorDir.x * s))
    arcPoints.push(hinge.y + width * (wallDir.y * c + interiorDir.y * s))
  }

  return (
    <>
      <Line
        points={arcPoints}
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        dash={[strokeWidth * 2, strokeWidth * 1.5]}
        listening={false}
      />
      <Line
        points={[hinge.x, hinge.y, leafEnd.x, leafEnd.y]}
        stroke={color}
        strokeWidth={strokeWidth}
        lineCap="round"
        listening={false}
      />
    </>
  )
}
