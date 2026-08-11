import { useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { X, RotateCcw } from 'lucide-react'
import { useCanvasStore, type CanvasSnapshot } from '@/store/canvasStore'
import { useThemeStore } from '@/store/themeStore'
import { CATEGORY_LABELS, type SymbolCategory } from '@/features/symbols/iconPrimitives'
import { buildScene3D, WALL_HEIGHT_M, type Scene3DData } from './build3d'

interface Scene3DProps {
  onClose: () => void
}

const WALL_COLOR = '#c2c8d2'
const FLOOR_COLOR = '#eef1f6'
const GLASS_COLOR = '#7dd3fc'

function WallMeshes({ data }: { data: Scene3DData }) {
  return (
    <>
      {data.solids.map((b, i) => (
        <mesh key={`s${i}`} position={[b.cx, (b.zFrom + b.zTo) / 2, b.cy]} rotation={[0, b.rotY, 0]} castShadow receiveShadow>
          <boxGeometry args={[b.length, b.zTo - b.zFrom, b.thickness]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
      ))}
      {data.glass.map((b, i) => (
        <mesh key={`g${i}`} position={[b.cx, (b.zFrom + b.zTo) / 2, b.cy]} rotation={[0, b.rotY, 0]}>
          <boxGeometry args={[b.length, b.zTo - b.zFrom, b.thickness]} />
          <meshStandardMaterial color={GLASS_COLOR} transparent opacity={0.35} />
        </mesh>
      ))}
    </>
  )
}

function SymbolMeshes({ data }: { data: Scene3DData }) {
  return (
    <>
      {data.symbols.map((s) => (
        <mesh key={s.id} position={[s.cx, (s.zFrom + s.zTo) / 2, s.cy]} rotation={[0, s.rotY, 0]} castShadow receiveShadow>
          <boxGeometry args={[s.width, s.zTo - s.zFrom, s.depth]} />
          <meshStandardMaterial color={s.color} />
        </mesh>
      ))}
    </>
  )
}

function AreaMeshes({ data }: { data: Scene3DData }) {
  return (
    <>
      {data.areas.map((a, i) => (
        <mesh key={i} position={[a.cx, 0.005, a.cy]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[a.width, a.depth]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.25} />
        </mesh>
      ))}
    </>
  )
}

function Legend({ data }: { data: Scene3DData }) {
  const present = useMemo(() => {
    const map = new Map<SymbolCategory, string>()
    for (const s of data.symbols) if (!map.has(s.category)) map.set(s.category, s.color)
    return Array.from(map.entries())
  }, [data.symbols])

  if (present.length === 0) return null

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex max-w-xs flex-col gap-1 rounded-md border border-surface-border bg-surface-alt/90 p-2 text-xs text-text-secondary shadow-sm backdrop-blur-sm">
      {present.map(([category, color]) => (
        <div key={category} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
          <span>{CATEGORY_LABELS[category]}</span>
        </div>
      ))}
    </div>
  )
}

export function Scene3D({ onClose }: Scene3DProps) {
  const getSnapshot = useCanvasStore((s) => s.getSnapshot)
  const theme = useThemeStore((s) => s.theme)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  // Snapshotted once on open rather than subscribed live — the 3D view is a point-in-time
  // preview, and re-triangulating the whole scene on every canvas edit would be wasteful since
  // editing only happens in the 2D view (which is hidden while this is open).
  const snapshot = useRef<CanvasSnapshot>(getSnapshot()).current

  const data = useMemo(() => {
    const metersPerWorldUnit = snapshot.metersPerGridCell / 40
    return buildScene3D(snapshot.elements, snapshot.layers, metersPerWorldUnit)
  }, [snapshot])

  const { bounds } = data
  const width = Math.max(bounds.maxX - bounds.minX, 4)
  const depth = Math.max(bounds.maxY - bounds.minY, 4)
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2
  const diag = Math.max(Math.hypot(width, depth), 6)

  const resetCamera = () => controlsRef.current?.reset()

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-surface">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border bg-surface-alt px-4">
        <span className="text-sm font-semibold text-text-primary">Vista 3D</span>
        <div className="flex items-center gap-2">
          <button
            onClick={resetCamera}
            title="Restablecer cámara"
            className="flex h-8 w-8 items-center justify-center rounded border border-surface-border bg-surface text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            title="Volver al plano 2D"
            className="flex h-8 items-center gap-1.5 rounded border border-surface-border bg-surface px-3 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" />
            Volver al plano 2D
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <Canvas
          shadows
          camera={{ position: [centerX + diag * 0.7, diag * 0.65, centerZ + diag * 0.7], fov: 50, near: 0.1, far: diag * 20 }}
        >
          <color attach="background" args={[theme === 'dark' ? '#0b1220' : '#dbe4f0']} />
          <hemisphereLight args={['#ffffff', '#3a4252', 0.6]} />
          <directionalLight
            position={[centerX + diag * 0.5, diag, centerZ + diag * 0.3]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <mesh position={[centerX, -0.01, centerZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[width + 6, depth + 6]} />
            <meshStandardMaterial color={FLOOR_COLOR} />
          </mesh>
          <Grid
            position={[centerX, 0, centerZ]}
            args={[width + 6, depth + 6]}
            cellSize={1}
            cellColor="#b7c0d1"
            sectionSize={5}
            sectionColor="#8b96ac"
            fadeDistance={diag * 3}
            infiniteGrid={false}
          />

          <AreaMeshes data={data} />
          <WallMeshes data={data} />
          <SymbolMeshes data={data} />

          <OrbitControls
            ref={controlsRef}
            target={[centerX, WALL_HEIGHT_M / 3, centerZ]}
            maxPolarAngle={Math.PI / 2 - 0.02}
            minDistance={1}
            maxDistance={diag * 6}
            enableDamping
          />
        </Canvas>

        <Legend data={data} />
      </div>
    </div>
  )
}
