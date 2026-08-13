import { FolderOpen } from 'lucide-react'
import type { AreaElement, CanvasSnapshot, SymbolElement, WallElement } from '@/store/canvasStore'
import { useThemeColors } from '@/lib/useThemeColors'

interface ProjectThumbnailProps {
  /** Projects start with `canvas_data: {}` before their first save, so this is a partial snapshot
   * (or entirely absent for a row that hasn't loaded yet). */
  snapshot: Partial<CanvasSnapshot> | null | undefined
  className?: string
}

const PADDING_FRACTION = 0.1

/** Cheap plan preview for a project card: walls and area/symbol footprints traced straight from
 * the saved snapshot as flat SVG shapes. Deliberately not a mini Konva stage — mounting one per
 * card would be needless weight for a picture that never needs interaction, and plain SVG already
 * scales responsively (mobile card grid down to a single column, desktop up to three) for free. */
export function ProjectThumbnail({ snapshot, className = '' }: ProjectThumbnailProps) {
  const colors = useThemeColors()
  const elements = snapshot?.elements ?? []
  const layers = snapshot?.layers ?? []
  const hiddenLayerIds = new Set(layers.filter((l) => !l.visible).map((l) => l.id))
  const visible = elements.filter((el) => !hiddenLayerIds.has(el.layerId))

  const walls = visible.filter((el): el is WallElement => el.type === 'wall')
  const boxes = visible.filter(
    (el): el is AreaElement | SymbolElement => el.type === 'area' || el.type === 'symbol',
  )

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const extend = (x: number, y: number) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  for (const wall of walls) {
    for (let i = 0; i + 1 < wall.points.length; i += 2) extend(wall.points[i], wall.points[i + 1])
  }
  for (const b of boxes) {
    const cx = b.x + b.width / 2
    const cy = b.y + b.height / 2
    const theta = ((b.rotation ?? 0) * Math.PI) / 180
    const cos = Math.cos(theta)
    const sin = Math.sin(theta)
    // Exact rotated-rect corners rather than a circle-of-radius bound — the latter overshoots the
    // bbox for the (overwhelmingly common) unrotated case, padding the thumbnail with dead space.
    for (const [lx, ly] of [
      [-b.width / 2, -b.height / 2],
      [b.width / 2, -b.height / 2],
      [b.width / 2, b.height / 2],
      [-b.width / 2, b.height / 2],
    ]) {
      extend(cx + lx * cos - ly * sin, cy + lx * sin + ly * cos)
    }
  }

  if (!Number.isFinite(minX)) {
    return (
      <div className={`flex items-center justify-center bg-surface ${className}`}>
        <FolderOpen className="h-6 w-6 text-text-secondary" />
      </div>
    )
  }

  const w = Math.max(maxX - minX, 1)
  const h = Math.max(maxY - minY, 1)
  const pad = Math.max(w, h) * PADDING_FRACTION
  const strokeWidth = Math.max(w, h) * 0.015

  return (
    <svg
      viewBox={`${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <rect x={minX - pad} y={minY - pad} width={w + pad * 2} height={h + pad * 2} fill={colors.canvasBg} />
      {boxes.map((b) => (
        <rect
          key={b.id}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          rx={Math.max(w, h) * 0.006}
          fill={colors.accentSoft}
          stroke={colors.structureSoft}
          strokeWidth={strokeWidth * 0.6}
          transform={b.rotation ? `rotate(${b.rotation} ${b.x + b.width / 2} ${b.y + b.height / 2})` : undefined}
        />
      ))}
      {walls.map((wall) => (
        <polyline
          key={wall.id}
          points={wall.points.reduce<string[]>((acc, v, i) => {
            if (i % 2 === 0) acc.push(`${v},${wall.points[i + 1]}`)
            return acc
          }, []).join(' ')}
          fill="none"
          stroke={colors.structure}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
