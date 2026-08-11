import { Group, Line } from 'react-konva'
import type { ThemePalette } from '@/lib/theme'

interface GridProps {
  width: number
  height: number
  scale: number
  position: { x: number; y: number }
  gridSize: number
  colors: ThemePalette
}

const STRONG_EVERY = 5
const MAX_LINES = 400

export function Grid({ width, height, scale, position, gridSize, colors }: GridProps) {
  if (width === 0 || height === 0) return null

  const startX = Math.floor((-position.x / scale) / gridSize) * gridSize
  const endX = Math.ceil(((width - position.x) / scale) / gridSize) * gridSize
  const startY = Math.floor((-position.y / scale) / gridSize) * gridSize
  const endY = Math.ceil(((height - position.y) / scale) / gridSize) * gridSize

  const lines: React.ReactNode[] = []
  let count = 0

  for (let x = startX; x <= endX; x += gridSize) {
    if (count++ > MAX_LINES) break
    const isStrong = Math.round(x / gridSize) % STRONG_EVERY === 0
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={isStrong ? colors.gridLineStrong : colors.gridLine}
        strokeWidth={(isStrong ? 1.5 : 1) / scale}
      />,
    )
  }

  for (let y = startY; y <= endY; y += gridSize) {
    if (count++ > MAX_LINES) break
    const isStrong = Math.round(y / gridSize) % STRONG_EVERY === 0
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={isStrong ? colors.gridLineStrong : colors.gridLine}
        strokeWidth={(isStrong ? 1.5 : 1) / scale}
      />,
    )
  }

  return <Group listening={false}>{lines}</Group>
}
