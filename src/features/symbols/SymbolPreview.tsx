import type { SymbolDefinition } from './iconPrimitives'

interface SymbolPreviewProps {
  definition: SymbolDefinition
  color: string
  fillColor: string
}

export function SymbolPreview({ definition, color, fillColor }: SymbolPreviewProps) {
  const { box, primitives, filled } = definition
  const fill = filled ? fillColor : 'none'

  return (
    <svg viewBox={`0 0 ${box} ${box}`} className="h-8 w-8" stroke={color} strokeWidth={4} fill={fill}>
      {primitives.map((p, i) => {
        switch (p.kind) {
          case 'rect':
            return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} />
          case 'circle':
            return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
          case 'line':
            return <polyline key={i} points={p.points.join(',')} fill="none" />
          case 'path':
            return <path key={i} d={p.d} fill="none" />
          case 'polygon':
            return <polygon key={i} points={p.points.join(',')} />
        }
      })}
    </svg>
  )
}
