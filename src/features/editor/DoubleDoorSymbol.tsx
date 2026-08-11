import type { Point } from '@/lib/geometry'
import { DoorSymbol } from './DoorSymbol'

interface DoubleDoorSymbolProps {
  /** One edge of the opening, on the wall centerline — hinge of the first leaf. */
  start: Point
  /** The other edge of the opening, on the wall centerline — hinge of the second leaf. */
  end: Point
  /** Unit vector along the wall, pointing from start toward end. */
  wallDir: Point
  /** Unit vector perpendicular to the wall, pointing into the interior (where both leaves swing open). */
  interiorDir: Point
  width: number
  color: string
  strokeWidth: number
}

/**
 * Two mirrored door leaves, each spanning half the opening and hinged at its own edge, swinging
 * open into the interior to meet in the middle — the standard plan-view symbol for a double door.
 * Built from two DoorSymbol instances since each leaf is just a single door parametrized in its
 * own (wallDir, interiorDir) basis.
 */
export function DoubleDoorSymbol({ start, end, wallDir, interiorDir, width, color, strokeWidth }: DoubleDoorSymbolProps) {
  const halfWidth = width / 2
  const reverseWallDir = { x: -wallDir.x, y: -wallDir.y }

  return (
    <>
      <DoorSymbol hinge={start} wallDir={wallDir} interiorDir={interiorDir} width={halfWidth} color={color} strokeWidth={strokeWidth} />
      <DoorSymbol hinge={end} wallDir={reverseWallDir} interiorDir={interiorDir} width={halfWidth} color={color} strokeWidth={strokeWidth} />
    </>
  )
}
