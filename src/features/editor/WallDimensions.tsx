import { Fragment } from 'react'
import { Line, Text } from 'react-konva'
import { computeWallSegments } from '@/lib/geometry'
import { formatLength, type MeasurementUnit } from '@/lib/units'

interface WallDimensionsProps {
  points: number[]
  scale: number
  unit: MeasurementUnit
  metersPerWorldUnit: number
  color: string
  idPrefix: string
}

const DIM_OFFSET = 18
const TICK_LENGTH = 5
const TEXT_GAP = 14
const TEXT_BOX_WIDTH = 60

export function WallDimensions({ points, scale, unit, metersPerWorldUnit, color, idPrefix }: WallDimensionsProps) {
  const segments = computeWallSegments(points)
  const dimOffset = DIM_OFFSET / scale
  const tick = TICK_LENGTH / scale
  const textOffset = (DIM_OFFSET + TEXT_GAP) / scale

  return (
    <>
      {segments.map((seg, idx) => {
        const dimStart = { x: seg.start.x + seg.normal.x * dimOffset, y: seg.start.y + seg.normal.y * dimOffset }
        const dimEnd = { x: seg.end.x + seg.normal.x * dimOffset, y: seg.end.y + seg.normal.y * dimOffset }
        const textMid = {
          x: (seg.start.x + seg.end.x) / 2 + seg.normal.x * textOffset,
          y: (seg.start.y + seg.end.y) / 2 + seg.normal.y * textOffset,
        }

        return (
          <Fragment key={`${idPrefix}-dim-${idx}`}>
            <Line
              points={[seg.start.x, seg.start.y, dimStart.x, dimStart.y]}
              stroke={color}
              strokeWidth={1 / scale}
              opacity={0.5}
              listening={false}
            />
            <Line
              points={[seg.end.x, seg.end.y, dimEnd.x, dimEnd.y]}
              stroke={color}
              strokeWidth={1 / scale}
              opacity={0.5}
              listening={false}
            />
            <Line
              points={[dimStart.x, dimStart.y, dimEnd.x, dimEnd.y]}
              stroke={color}
              strokeWidth={1 / scale}
              listening={false}
            />
            <Line
              points={[
                dimStart.x - seg.normal.x * tick,
                dimStart.y - seg.normal.y * tick,
                dimStart.x + seg.normal.x * tick,
                dimStart.y + seg.normal.y * tick,
              ]}
              stroke={color}
              strokeWidth={1.5 / scale}
              listening={false}
            />
            <Line
              points={[
                dimEnd.x - seg.normal.x * tick,
                dimEnd.y - seg.normal.y * tick,
                dimEnd.x + seg.normal.x * tick,
                dimEnd.y + seg.normal.y * tick,
              ]}
              stroke={color}
              strokeWidth={1.5 / scale}
              listening={false}
            />
            <Text
              x={textMid.x}
              y={textMid.y}
              offsetX={TEXT_BOX_WIDTH / 2 / scale}
              offsetY={6 / scale}
              width={TEXT_BOX_WIDTH / scale}
              align="center"
              rotation={seg.angleDeg}
              text={formatLength(seg.length, unit, metersPerWorldUnit)}
              fontSize={11 / scale}
              fill={color}
              listening={false}
            />
          </Fragment>
        )
      })}
    </>
  )
}
