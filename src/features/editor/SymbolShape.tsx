import { Circle, Line, Path, Rect } from 'react-konva'
import type { SymbolDefinition } from '@/features/symbols/iconPrimitives'

interface SymbolShapeProps {
  definition: SymbolDefinition
  width: number
  height: number
  color: string
  fillColor: string
  strokeWidth: number
}

export function SymbolShape({ definition, width, height, color, fillColor, strokeWidth }: SymbolShapeProps) {
  const { box, primitives, filled } = definition
  const sx = width / box
  const sy = height / box
  const fill = filled ? fillColor : undefined

  return (
    <>
      {primitives.map((p, i) => {
        switch (p.kind) {
          case 'rect':
            return (
              <Rect
                key={i}
                x={p.x * sx}
                y={p.y * sy}
                width={p.w * sx}
                height={p.h * sy}
                cornerRadius={p.rx ? p.rx * Math.min(sx, sy) : 0}
                stroke={color}
                fill={fill}
                strokeWidth={strokeWidth}
              />
            )
          case 'circle':
            return (
              <Circle
                key={i}
                x={p.cx * sx}
                y={p.cy * sy}
                radius={p.r * Math.min(sx, sy)}
                stroke={color}
                fill={fill}
                strokeWidth={strokeWidth}
              />
            )
          case 'line':
            return (
              <Line
                key={i}
                points={p.points.map((v, idx) => (idx % 2 === 0 ? v * sx : v * sy))}
                stroke={color}
                strokeWidth={strokeWidth}
                lineCap="round"
              />
            )
          case 'polygon':
            return (
              <Line
                key={i}
                points={p.points.map((v, idx) => (idx % 2 === 0 ? v * sx : v * sy))}
                stroke={color}
                fill={fill}
                closed
                strokeWidth={strokeWidth}
              />
            )
          case 'path':
            return (
              <Path
                key={i}
                data={p.d}
                scaleX={sx}
                scaleY={sy}
                stroke={color}
                strokeWidth={strokeWidth / Math.min(sx, sy)}
              />
            )
        }
      })}
    </>
  )
}
