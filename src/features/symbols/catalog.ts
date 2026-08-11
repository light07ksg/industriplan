import type { SymbolDefinition } from './iconPrimitives'
import {
  DOOR_WIDTH,
  DOUBLE_DOOR_WIDTH,
  WINDOW_WIDTH,
  SLIDING_DOOR_WIDTH,
  DOUBLE_WINDOW_WIDTH,
  WALL_THICKNESS,
} from '@/store/canvasStore'

// Sizes below are real-world dimensions converted to world units at the default scale
// (40 units = 1m), so every symbol reads at a consistent, true-to-scale size next to the
// others — important now for layout accuracy, and later for a 3D view built from the same data.
// Door/window pull their width straight from the same constants used when they're attached to a
// wall, so a symbol never changes size depending on whether it's on a wall or placed loose.
// Signage (exit/extinguisher/first-aid/hazard) and ASME flow-process marks aren't physical
// footprints — like in floorplanner/cedreo/draw.io, they stay at a fixed legible icon size
// instead of their (illegibly tiny) true dimensions.

export const SYMBOL_CATALOG: SymbolDefinition[] = [
  // Estructura
  {
    id: 'door',
    category: 'estructura',
    name: 'Puerta',
    defaultWidth: DOOR_WIDTH, // 0.9m, matches the wall-attached opening width
    defaultHeight: WALL_THICKNESS,
    box: 100,
    primitives: [
      { kind: 'line', points: [15, 10, 15, 90] },
      { kind: 'line', points: [15, 90, 80, 90] },
      { kind: 'path', d: 'M15,10 A80,80 0 0 1 80,90' },
    ],
  },
  {
    id: 'door-double',
    category: 'estructura',
    name: 'Puerta doble',
    defaultWidth: DOUBLE_DOOR_WIDTH, // 1.8m, matches the wall-attached opening width
    defaultHeight: WALL_THICKNESS,
    box: 100,
    primitives: [
      { kind: 'line', points: [8, 10, 8, 90] },
      { kind: 'line', points: [8, 90, 47, 90] },
      { kind: 'path', d: 'M8,10 A80,80 0 0 1 47,90' },
      { kind: 'line', points: [92, 10, 92, 90] },
      { kind: 'line', points: [92, 90, 53, 90] },
      { kind: 'path', d: 'M92,10 A80,80 0 0 0 53,90' },
    ],
  },
  {
    id: 'sliding-door',
    category: 'estructura',
    name: 'Puerta corrediza',
    defaultWidth: SLIDING_DOOR_WIDTH, // 3m, matches the wall-attached opening width — sized for warehouse doors
    defaultHeight: WALL_THICKNESS,
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 20, w: 60, h: 20 },
      { kind: 'rect', x: 36, y: 60, w: 60, h: 20 },
      { kind: 'line', points: [10, 50, 30, 50] },
      { kind: 'line', points: [70, 50, 90, 50] },
    ],
  },
  {
    id: 'window',
    category: 'estructura',
    name: 'Ventana',
    defaultWidth: WINDOW_WIDTH, // 1.2m, matches the wall-attached opening width
    defaultHeight: WALL_THICKNESS,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 30, w: 84, h: 40 },
      { kind: 'line', points: [8, 50, 92, 50] },
    ],
  },
  {
    id: 'column',
    category: 'estructura',
    name: 'Columna',
    defaultWidth: 16, // 0.4m
    defaultHeight: 16,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 32 }],
    filled: true,
  },
  {
    id: 'column-square',
    category: 'estructura',
    name: 'Columna cuadrada',
    defaultWidth: 16, // 0.4m
    defaultHeight: 16,
    box: 100,
    primitives: [{ kind: 'rect', x: 15, y: 15, w: 70, h: 70 }],
    filled: true,
  },
  {
    id: 'beam',
    category: 'estructura',
    name: 'Viga',
    defaultWidth: 12, // 0.3m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 20, y: 2, w: 60, h: 96 },
      { kind: 'line', points: [20, 12, 80, 32] },
      { kind: 'line', points: [20, 32, 80, 52] },
      { kind: 'line', points: [20, 52, 80, 72] },
      { kind: 'line', points: [20, 72, 80, 92] },
    ],
  },
  {
    id: 'window-double',
    category: 'estructura',
    name: 'Ventana doble',
    defaultWidth: DOUBLE_WINDOW_WIDTH, // 2m, matches the wall-attached opening width
    defaultHeight: WALL_THICKNESS,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 30, w: 84, h: 40 },
      { kind: 'line', points: [8, 50, 92, 50] },
      { kind: 'line', points: [50, 30, 50, 70] },
    ],
  },
  {
    id: 'floor-drain',
    category: 'estructura',
    name: 'Coladera de piso',
    defaultWidth: 12, // 0.3m
    defaultHeight: 12,
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 10, w: 80, h: 80, rx: 6 },
      { kind: 'circle', cx: 50, cy: 50, r: 6 },
      { kind: 'line', points: [50, 20, 50, 34] },
      { kind: 'line', points: [50, 66, 50, 80] },
      { kind: 'line', points: [20, 50, 34, 50] },
      { kind: 'line', points: [66, 50, 80, 50] },
    ],
  },
  {
    id: 'i-beam-column',
    category: 'estructura',
    name: 'Columna en I',
    defaultWidth: 16, // 0.4m
    defaultHeight: 16,
    box: 100,
    primitives: [
      { kind: 'rect', x: 15, y: 15, w: 70, h: 12 },
      { kind: 'rect', x: 15, y: 73, w: 70, h: 12 },
      { kind: 'rect', x: 42, y: 27, w: 16, h: 46 },
    ],
    filled: true,
  },
  {
    id: 'vent-grille',
    category: 'estructura',
    name: 'Rejilla de ventilación',
    defaultWidth: 24, // 0.6m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [4, 24, 96, 24] },
      { kind: 'line', points: [4, 44, 96, 44] },
      { kind: 'line', points: [4, 64, 96, 64] },
      { kind: 'line', points: [4, 84, 96, 84] },
    ],
  },
  {
    id: 'expansion-joint',
    category: 'estructura',
    name: 'Junta de dilatación',
    defaultWidth: 8, // 0.2m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'line', points: [30, 2, 30, 98] },
      { kind: 'line', points: [70, 2, 70, 98] },
      { kind: 'line', points: [30, 10, 70, 20] },
      { kind: 'line', points: [30, 30, 70, 40] },
      { kind: 'line', points: [30, 50, 70, 60] },
      { kind: 'line', points: [30, 70, 70, 80] },
      { kind: 'line', points: [30, 90, 70, 98] },
    ],
  },

  // Maquinaria / estaciones
  {
    id: 'machine-generic',
    category: 'maquinaria',
    name: 'Máquina genérica',
    defaultWidth: 80, // 2m
    defaultHeight: 60, // 1.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 12, y: 12, w: 76, h: 76, rx: 4 },
      { kind: 'circle', cx: 30, cy: 30, r: 7 },
    ],
  },
  {
    id: 'workstation',
    category: 'maquinaria',
    name: 'Estación de trabajo',
    defaultWidth: 60, // 1.5m
    defaultHeight: 40, // 1m
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 22, w: 84, h: 60, rx: 4 },
      { kind: 'line', points: [8, 40, 92, 40] },
    ],
  },
  {
    id: 'conveyor',
    category: 'maquinaria',
    name: 'Banda transportadora',
    defaultWidth: 120, // 3m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 32, w: 92, h: 30 },
      { kind: 'circle', cx: 18, cy: 47, r: 6 },
      { kind: 'circle', cx: 40, cy: 47, r: 6 },
      { kind: 'circle', cx: 62, cy: 47, r: 6 },
      { kind: 'circle', cx: 84, cy: 47, r: 6 },
    ],
  },
  {
    id: 'robotic-arm',
    category: 'maquinaria',
    name: 'Brazo robótico',
    defaultWidth: 40, // 1m base footprint
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 22, cy: 80, r: 12 },
      { kind: 'line', points: [22, 80, 62, 48, 88, 18] },
      { kind: 'circle', cx: 88, cy: 18, r: 6 },
    ],
  },
  {
    id: 'tank',
    category: 'maquinaria',
    name: 'Tanque',
    defaultWidth: 60, // 1.5m diámetro
    defaultHeight: 60,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 34 },
    ],
  },
  {
    id: 'pump',
    category: 'maquinaria',
    name: 'Bomba',
    defaultWidth: 20, // 0.5m
    defaultHeight: 20,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 40 },
      { kind: 'polygon', points: [34, 32, 34, 68, 70, 50] },
    ],
  },
  {
    id: 'control-panel',
    category: 'maquinaria',
    name: 'Panel de control',
    defaultWidth: 24, // 0.6m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'rect', x: 14, y: 14, w: 42, h: 34, rx: 3 },
      { kind: 'circle', cx: 76, cy: 24, r: 6 },
      { kind: 'circle', cx: 76, cy: 44, r: 6 },
      { kind: 'line', points: [14, 66, 86, 66] },
      { kind: 'line', points: [14, 80, 86, 80] },
    ],
  },
  {
    id: 'compressor',
    category: 'maquinaria',
    name: 'Compresor',
    defaultWidth: 40, // 1m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 22, w: 58, h: 56, rx: 8 },
      { kind: 'circle', cx: 76, cy: 50, r: 22 },
    ],
  },
  {
    id: 'extractor-fan',
    category: 'maquinaria',
    name: 'Extractor industrial',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 8 },
      { kind: 'line', points: [50, 50, 74, 26] },
      { kind: 'line', points: [50, 50, 74, 74] },
      { kind: 'line', points: [50, 50, 26, 74] },
      { kind: 'line', points: [50, 50, 26, 26] },
    ],
  },
  {
    id: 'generator',
    category: 'maquinaria',
    name: 'Generador eléctrico',
    defaultWidth: 40, // 1m
    defaultHeight: 28, // 0.7m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 10, w: 92, h: 80, rx: 6 },
      { kind: 'line', points: [4, 50, 96, 50] },
      { kind: 'circle', cx: 24, cy: 30, r: 8 },
      { kind: 'circle', cx: 76, cy: 30, r: 8 },
    ],
  },
  {
    id: 'boiler',
    category: 'maquinaria',
    name: 'Caldera',
    defaultWidth: 40, // 1m
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'rect', x: 42, y: 4, w: 16, h: 20 },
    ],
  },
  {
    id: 'mixer',
    category: 'maquinaria',
    name: 'Mezcladora industrial',
    defaultWidth: 36, // 0.9m
    defaultHeight: 36,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'line', points: [50, 12, 50, 88] },
      { kind: 'line', points: [22, 30, 78, 70] },
      { kind: 'line', points: [22, 70, 78, 30] },
    ],
  },
  {
    id: 'cnc-machine',
    category: 'maquinaria',
    name: 'Máquina CNC',
    defaultWidth: 70, // 1.75m
    defaultHeight: 60, // 1.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'rect', x: 20, y: 20, w: 60, h: 60 },
      { kind: 'circle', cx: 50, cy: 50, r: 10 },
    ],
  },
  {
    id: 'hydraulic-press',
    category: 'maquinaria',
    name: 'Prensa hidráulica',
    defaultWidth: 44, // 1.1m
    defaultHeight: 60, // 1.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 4, w: 80, h: 20, rx: 4 },
      { kind: 'rect', x: 30, y: 24, w: 40, h: 50 },
      { kind: 'rect', x: 10, y: 76, w: 80, h: 20, rx: 4 },
    ],
  },

  // Almacenamiento
  {
    id: 'rack',
    category: 'almacenamiento',
    name: 'Rack / estantería',
    defaultWidth: 48, // 1.2m, viewed from above: wide and shallow
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 12, y: 6, w: 76, h: 88 },
      { kind: 'line', points: [12, 32, 88, 32] },
      { kind: 'line', points: [12, 58, 88, 58] },
      { kind: 'line', points: [12, 84, 88, 84] },
    ],
  },
  {
    id: 'pallet',
    category: 'almacenamiento',
    name: 'Pallet',
    defaultWidth: 48, // 1.2m (standard pallet)
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 55, w: 92, h: 22 },
      { kind: 'line', points: [16, 55, 16, 90] },
      { kind: 'line', points: [40, 55, 40, 90] },
      { kind: 'line', points: [60, 55, 60, 90] },
      { kind: 'line', points: [84, 55, 84, 90] },
    ],
  },
  {
    id: 'storage-area',
    category: 'almacenamiento',
    name: 'Área de almacenamiento',
    defaultWidth: 120, // 3m — a starting size; drag the handles to resize to the real zone
    defaultHeight: 100, // 2.5m
    box: 100,
    primitives: [{ kind: 'rect', x: 6, y: 6, w: 88, h: 88 }],
  },
  {
    id: 'shipping-container',
    category: 'almacenamiento',
    name: 'Contenedor',
    defaultWidth: 240, // 6m
    defaultHeight: 96, // 2.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 2, y: 8, w: 96, h: 84 },
      { kind: 'line', points: [16, 8, 16, 92] },
      { kind: 'line', points: [30, 8, 30, 92] },
      { kind: 'line', points: [44, 8, 44, 92] },
      { kind: 'line', points: [58, 8, 58, 92] },
      { kind: 'line', points: [72, 8, 72, 92] },
      { kind: 'line', points: [86, 8, 86, 92] },
    ],
  },
  {
    id: 'forklift',
    category: 'almacenamiento',
    name: 'Montacargas',
    defaultWidth: 40, // 1m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 15, y: 30, w: 70, h: 55, rx: 8 },
      { kind: 'circle', cx: 30, cy: 88, r: 8 },
      { kind: 'circle', cx: 70, cy: 88, r: 8 },
      { kind: 'line', points: [30, 30, 30, 2] },
      { kind: 'line', points: [70, 30, 70, 2] },
    ],
  },
  {
    id: 'shelf-tall',
    category: 'almacenamiento',
    name: 'Estantería alta',
    defaultWidth: 96, // 2.4m
    defaultHeight: 40, // 1m
    box: 100,
    primitives: [
      { kind: 'rect', x: 2, y: 8, w: 96, h: 84 },
      { kind: 'line', points: [2, 24, 98, 24] },
      { kind: 'line', points: [2, 40, 98, 40] },
      { kind: 'line', points: [2, 56, 98, 56] },
      { kind: 'line', points: [2, 72, 98, 72] },
    ],
  },
  {
    id: 'hand-truck',
    category: 'almacenamiento',
    name: 'Carretilla de mano',
    defaultWidth: 20, // 0.5m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 20, y: 50, w: 60, h: 30, rx: 4 },
      { kind: 'circle', cx: 30, cy: 88, r: 10 },
      { kind: 'circle', cx: 70, cy: 88, r: 10 },
      { kind: 'line', points: [50, 50, 50, 6] },
    ],
  },
  {
    id: 'pallet-jack',
    category: 'almacenamiento',
    name: 'Transpaleta',
    defaultWidth: 24, // 0.6m
    defaultHeight: 48, // 1.2m
    box: 100,
    primitives: [
      { kind: 'line', points: [30, 4, 30, 40] },
      { kind: 'line', points: [70, 4, 70, 40] },
      { kind: 'rect', x: 20, y: 40, w: 60, h: 56, rx: 6 },
      { kind: 'circle', cx: 50, cy: 12, r: 10 },
    ],
  },
  {
    id: 'cage-pallet',
    category: 'almacenamiento',
    name: 'Jaula de almacenamiento',
    defaultWidth: 48, // 1.2m
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [4, 4, 96, 96] },
      { kind: 'line', points: [96, 4, 4, 96] },
    ],
  },
  {
    id: 'bin-shelf',
    category: 'almacenamiento',
    name: 'Estantería de contenedores',
    defaultWidth: 48, // 1.2m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [4, 36, 96, 36] },
      { kind: 'line', points: [4, 68, 96, 68] },
      { kind: 'line', points: [26, 4, 26, 96] },
      { kind: 'line', points: [50, 4, 50, 96] },
      { kind: 'line', points: [74, 4, 74, 96] },
    ],
  },
  {
    id: 'loading-cart',
    category: 'almacenamiento',
    name: 'Carro de carga',
    defaultWidth: 40, // 1m
    defaultHeight: 56, // 1.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 8, w: 84, h: 84 },
      { kind: 'circle', cx: 24, cy: 90, r: 8 },
      { kind: 'circle', cx: 76, cy: 90, r: 8 },
      { kind: 'line', points: [8, 20, 30, 8] },
    ],
  },
  {
    id: 'drum-barrel',
    category: 'almacenamiento',
    name: 'Tambor / Bidón',
    defaultWidth: 24, // 0.6m diámetro
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 36 },
    ],
    filled: true,
  },

  // Flujo de proceso (símbolos ASME — notación de diagrama, no objetos físicos)
  {
    id: 'flow-operation',
    category: 'proceso',
    name: 'Operación',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 36 }],
  },
  {
    id: 'flow-inspection',
    category: 'proceso',
    name: 'Inspección',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [{ kind: 'rect', x: 15, y: 15, w: 70, h: 70 }],
  },
  {
    id: 'flow-transport',
    category: 'proceso',
    name: 'Transporte',
    defaultWidth: 50,
    defaultHeight: 32,
    box: 100,
    primitives: [{ kind: 'path', d: 'M8,50 L80,50 M62,32 L84,50 L62,68' }],
  },
  {
    id: 'flow-delay',
    category: 'proceso',
    name: 'Demora',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [{ kind: 'path', d: 'M15,15 L50,15 A35,35 0 0 1 50,85 L15,85 Z' }],
  },
  {
    id: 'flow-storage',
    category: 'proceso',
    name: 'Almacenamiento (flujo)',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [{ kind: 'polygon', points: [15, 20, 85, 20, 50, 85] }],
  },
  {
    id: 'flow-document',
    category: 'proceso',
    name: 'Documento',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'path', d: 'M15,15 L85,15 L85,70 Q67,82 50,72 Q33,62 15,74 Z' },
    ],
  },
  {
    id: 'flow-op-inspection',
    category: 'proceso',
    name: 'Operación-inspección',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'rect', x: 15, y: 15, w: 70, h: 70 },
      { kind: 'circle', cx: 50, cy: 50, r: 35 },
    ],
  },
  {
    id: 'flow-decision',
    category: 'proceso',
    name: 'Decisión',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [{ kind: 'polygon', points: [50, 6, 94, 50, 50, 94, 6, 50] }],
  },
  {
    id: 'flow-start-end',
    category: 'proceso',
    name: 'Inicio/Fin',
    defaultWidth: 44,
    defaultHeight: 30,
    box: 100,
    primitives: [{ kind: 'rect', x: 6, y: 15, w: 88, h: 70, rx: 35 }],
  },
  {
    id: 'flow-data',
    category: 'proceso',
    name: 'Datos',
    defaultWidth: 44,
    defaultHeight: 34,
    box: 100,
    primitives: [{ kind: 'polygon', points: [25, 15, 94, 15, 75, 85, 6, 85] }],
  },
  {
    id: 'flow-connector',
    category: 'proceso',
    name: 'Conector',
    defaultWidth: 26,
    defaultHeight: 26,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 40 }],
  },
  {
    id: 'flow-manual-input',
    category: 'proceso',
    name: 'Entrada manual',
    defaultWidth: 44,
    defaultHeight: 32,
    box: 100,
    primitives: [{ kind: 'polygon', points: [6, 30, 94, 15, 94, 85, 6, 85] }],
  },

  // Seguridad industrial (señalización — tamaño de ícono legible, no a escala real)
  {
    id: 'exit',
    category: 'seguridad',
    name: 'Salida de emergencia',
    defaultWidth: 50,
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 18, w: 60, h: 64 },
      { kind: 'path', d: 'M40,50 L92,50 M76,34 L92,50 L76,66' },
    ],
  },
  {
    id: 'extinguisher',
    category: 'seguridad',
    name: 'Extintor',
    defaultWidth: 28,
    defaultHeight: 44,
    box: 100,
    primitives: [
      { kind: 'rect', x: 32, y: 28, w: 36, h: 58, rx: 10 },
      { kind: 'circle', cx: 50, cy: 16, r: 9 },
    ],
  },
  {
    id: 'first-aid',
    category: 'seguridad',
    name: 'Botiquín',
    defaultWidth: 36,
    defaultHeight: 36,
    box: 100,
    primitives: [
      { kind: 'rect', x: 12, y: 12, w: 76, h: 76, rx: 6 },
      { kind: 'line', points: [50, 28, 50, 72] },
      { kind: 'line', points: [28, 50, 72, 50] },
    ],
  },
  {
    id: 'hazard',
    category: 'seguridad',
    name: 'Zona de riesgo',
    defaultWidth: 42,
    defaultHeight: 38,
    box: 100,
    primitives: [
      { kind: 'polygon', points: [50, 8, 92, 88, 8, 88] },
      { kind: 'line', points: [50, 38, 50, 65] },
      { kind: 'circle', cx: 50, cy: 76, r: 3.5 },
    ],
    filled: true,
  },
  {
    id: 'emergency-shower',
    category: 'seguridad',
    name: 'Ducha de emergencia',
    defaultWidth: 30,
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 8, w: 84, h: 84, rx: 8 },
      { kind: 'circle', cx: 50, cy: 26, r: 10 },
      { kind: 'line', points: [36, 44, 32, 58] },
      { kind: 'line', points: [50, 44, 50, 62] },
      { kind: 'line', points: [64, 44, 68, 58] },
    ],
  },
  {
    id: 'eyewash',
    category: 'seguridad',
    name: 'Lavaojos',
    defaultWidth: 30,
    defaultHeight: 30,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 8, w: 84, h: 84, rx: 8 },
      { kind: 'circle', cx: 36, cy: 50, r: 12 },
      { kind: 'circle', cx: 64, cy: 50, r: 12 },
      { kind: 'circle', cx: 36, cy: 50, r: 3 },
      { kind: 'circle', cx: 64, cy: 50, r: 3 },
    ],
  },
  {
    id: 'assembly-point',
    category: 'seguridad',
    name: 'Punto de reunión',
    defaultWidth: 40,
    defaultHeight: 40,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 8 },
      { kind: 'circle', cx: 50, cy: 34, r: 10 },
      { kind: 'polygon', points: [36, 82, 64, 82, 58, 50, 42, 50] },
      { kind: 'line', points: [12, 12, 26, 26] },
      { kind: 'line', points: [88, 12, 74, 26] },
      { kind: 'line', points: [12, 88, 26, 74] },
      { kind: 'line', points: [88, 88, 74, 74] },
    ],
  },
  {
    id: 'emergency-stop',
    category: 'seguridad',
    name: 'Paro de emergencia',
    defaultWidth: 28,
    defaultHeight: 28,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 8, w: 84, h: 84, rx: 10 },
      { kind: 'circle', cx: 50, cy: 50, r: 30 },
    ],
    filled: true,
  },
  {
    id: 'fire-alarm',
    category: 'seguridad',
    name: 'Alarma contra incendio',
    defaultWidth: 26,
    defaultHeight: 26,
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 10, w: 80, h: 80, rx: 8 },
      { kind: 'polygon', points: [50, 25, 65, 60, 35, 60] },
    ],
  },
  {
    id: 'ppe-required',
    category: 'seguridad',
    name: 'Uso obligatorio de EPP',
    defaultWidth: 26,
    defaultHeight: 26,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 44 },
      { kind: 'circle', cx: 50, cy: 38, r: 16 },
      { kind: 'polygon', points: [26, 82, 74, 82, 66, 56, 34, 56] },
    ],
    filled: true,
  },
  {
    id: 'no-smoking',
    category: 'seguridad',
    name: 'Prohibido fumar',
    defaultWidth: 26,
    defaultHeight: 26,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 44 },
      { kind: 'line', points: [16, 16, 84, 84] },
      { kind: 'line', points: [30, 55, 65, 55] },
    ],
  },
  {
    id: 'stretcher',
    category: 'seguridad',
    name: 'Camilla',
    defaultWidth: 30,
    defaultHeight: 46,
    box: 100,
    primitives: [
      { kind: 'rect', x: 12, y: 4, w: 76, h: 92, rx: 30 },
      { kind: 'line', points: [12, 30, 88, 30] },
      { kind: 'line', points: [12, 70, 88, 70] },
    ],
  },
  {
    id: 'gas-detector',
    category: 'seguridad',
    name: 'Detector de gas',
    defaultWidth: 20,
    defaultHeight: 20,
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 10, w: 80, h: 80, rx: 10 },
      { kind: 'circle', cx: 50, cy: 50, r: 22 },
    ],
  },

  // Avanzado: mobiliario a escala real, agrupado como en floorplanner/cedreo — un punto de
  // partida por ambiente, no un catálogo exhaustivo.

  // Recámara
  {
    id: 'bed-single',
    category: 'dormitorio',
    name: 'Cama individual',
    defaultWidth: 36, // 0.9m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 4, w: 88, h: 92, rx: 6 },
      { kind: 'rect', x: 14, y: 10, w: 72, h: 18, rx: 4 },
    ],
  },
  {
    id: 'bed-double',
    category: 'dormitorio',
    name: 'Cama matrimonial',
    defaultWidth: 60, // 1.5m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 6 },
      { kind: 'rect', x: 10, y: 10, w: 36, h: 18, rx: 4 },
      { kind: 'rect', x: 54, y: 10, w: 36, h: 18, rx: 4 },
    ],
  },
  {
    id: 'nightstand',
    category: 'dormitorio',
    name: 'Mesita de noche',
    defaultWidth: 16, // 0.4m
    defaultHeight: 16,
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 10, w: 80, h: 80, rx: 6 },
      { kind: 'line', points: [30, 50, 70, 50] },
    ],
  },
  {
    id: 'bed-king',
    category: 'dormitorio',
    name: 'Cama king',
    defaultWidth: 72, // 1.8m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 6 },
      { kind: 'rect', x: 8, y: 10, w: 40, h: 18, rx: 4 },
      { kind: 'rect', x: 52, y: 10, w: 40, h: 18, rx: 4 },
    ],
  },
  {
    id: 'bunk-bed',
    category: 'dormitorio',
    name: 'Litera',
    defaultWidth: 36, // 0.9m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 4, w: 88, h: 92, rx: 6 },
      { kind: 'rect', x: 14, y: 10, w: 72, h: 18, rx: 4 },
      { kind: 'rect', x: 14, y: 34, w: 72, h: 4 },
    ],
  },
  {
    id: 'wardrobe',
    category: 'dormitorio',
    name: 'Armario',
    defaultWidth: 48, // 1.2m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 6, w: 92, h: 88 },
      { kind: 'line', points: [4, 6, 96, 94] },
    ],
  },
  {
    id: 'dresser',
    category: 'dormitorio',
    name: 'Cómoda',
    defaultWidth: 40, // 1m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [4, 34, 96, 34] },
      { kind: 'line', points: [4, 64, 96, 64] },
    ],
  },
  {
    id: 'crib',
    category: 'dormitorio',
    name: 'Cuna',
    defaultWidth: 24, // 0.6m
    defaultHeight: 48, // 1.2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 4, w: 88, h: 92, rx: 8 },
      { kind: 'line', points: [22, 4, 22, 96] },
      { kind: 'line', points: [38, 4, 38, 96] },
      { kind: 'line', points: [54, 4, 54, 96] },
      { kind: 'line', points: [70, 4, 70, 96] },
    ],
  },
  {
    id: 'sofa-bed',
    category: 'dormitorio',
    name: 'Sofá cama',
    defaultWidth: 64, // 1.6m
    defaultHeight: 36, // 0.9m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 10, w: 92, h: 16, rx: 4 },
      { kind: 'rect', x: 4, y: 26, w: 92, h: 66, rx: 6 },
      { kind: 'line', points: [50, 26, 50, 92] },
    ],
  },
  {
    id: 'vanity',
    category: 'dormitorio',
    name: 'Tocador',
    defaultWidth: 40, // 1m
    defaultHeight: 18, // 0.45m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 30, w: 92, h: 64, rx: 4 },
      { kind: 'circle', cx: 50, cy: 15, r: 12 },
    ],
  },
  {
    id: 'bed-bench',
    category: 'dormitorio',
    name: 'Banco de cama',
    defaultWidth: 48, // 1.2m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [{ kind: 'rect', x: 6, y: 15, w: 88, h: 70, rx: 10 }],
  },
  {
    id: 'wardrobe-corner',
    category: 'dormitorio',
    name: 'Armario esquinero',
    defaultWidth: 36, // 0.9m
    defaultHeight: 36,
    box: 100,
    primitives: [
      { kind: 'polygon', points: [6, 6, 94, 6, 6, 94] },
      { kind: 'line', points: [20, 20, 45, 45] },
    ],
  },
  {
    id: 'study-desk',
    category: 'dormitorio',
    name: 'Mesa de estudio',
    defaultWidth: 40, // 1m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 10, w: 92, h: 80, rx: 4 },
      { kind: 'rect', x: 66, y: 10, w: 26, h: 80 },
    ],
  },
  {
    id: 'daybed',
    category: 'dormitorio',
    name: 'Diván cama',
    defaultWidth: 76, // 1.9m
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 20, w: 92, h: 76, rx: 6 },
      { kind: 'rect', x: 4, y: 4, w: 16, h: 92, rx: 6 },
      { kind: 'rect', x: 22, y: 26, w: 34, h: 20, rx: 4 },
    ],
  },
  {
    id: 'walk-in-closet',
    category: 'dormitorio',
    name: 'Vestidor',
    defaultWidth: 80, // 2m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [4, 20, 40, 20] },
      { kind: 'line', points: [4, 40, 40, 40] },
      { kind: 'line', points: [60, 20, 96, 20] },
      { kind: 'line', points: [60, 40, 96, 40] },
    ],
  },
  {
    id: 'chest',
    category: 'dormitorio',
    name: 'Baúl',
    defaultWidth: 40, // 1m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 12, w: 92, h: 80, rx: 10 },
      { kind: 'line', points: [4, 30, 96, 30] },
    ],
  },
  {
    id: 'bunk-bed-triple',
    category: 'dormitorio',
    name: 'Litera triple',
    defaultWidth: 36, // 0.9m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 4, w: 88, h: 92, rx: 6 },
      { kind: 'rect', x: 14, y: 10, w: 72, h: 14, rx: 4 },
      { kind: 'line', points: [14, 30, 86, 30] },
      { kind: 'line', points: [14, 56, 86, 56] },
    ],
  },
  {
    id: 'changing-table',
    category: 'dormitorio',
    name: 'Cambiador',
    defaultWidth: 32, // 0.8m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 8 },
      { kind: 'rect', x: 14, y: 14, w: 72, h: 72, rx: 6 },
    ],
  },

  // Sala
  {
    id: 'sofa',
    category: 'sala',
    name: 'Sofá',
    defaultWidth: 80, // 2m
    defaultHeight: 36, // 0.9m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 6, w: 92, h: 20, rx: 4 },
      { kind: 'rect', x: 4, y: 22, w: 92, h: 70, rx: 6 },
      { kind: 'line', points: [34, 24, 34, 90] },
      { kind: 'line', points: [66, 24, 66, 90] },
    ],
  },
  {
    id: 'loveseat',
    category: 'sala',
    name: 'Sofá 2 plazas',
    defaultWidth: 60, // 1.5m
    defaultHeight: 36, // 0.9m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 6, w: 92, h: 20, rx: 4 },
      { kind: 'rect', x: 4, y: 22, w: 92, h: 70, rx: 6 },
      { kind: 'line', points: [50, 24, 50, 90] },
    ],
  },
  {
    id: 'armchair',
    category: 'sala',
    name: 'Sillón',
    defaultWidth: 34, // 0.85m
    defaultHeight: 34,
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 22, rx: 4 },
      { kind: 'rect', x: 4, y: 22, w: 92, h: 74, rx: 8 },
    ],
  },
  {
    id: 'recliner',
    category: 'sala',
    name: 'Sillón reclinable',
    defaultWidth: 36, // 0.9m
    defaultHeight: 38, // 0.95m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 20, rx: 4 },
      { kind: 'rect', x: 4, y: 22, w: 92, h: 54, rx: 8 },
      { kind: 'rect', x: 4, y: 78, w: 92, h: 18, rx: 6 },
    ],
  },
  {
    id: 'coffee-table',
    category: 'sala',
    name: 'Mesa de centro',
    defaultWidth: 44, // 1.1m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [{ kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 10 }],
  },
  {
    id: 'coffee-table-round',
    category: 'sala',
    name: 'Mesa de centro redonda',
    defaultWidth: 36, // 0.9m diámetro
    defaultHeight: 36,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 46 }],
  },
  {
    id: 'tv-stand',
    category: 'sala',
    name: 'Mueble TV',
    defaultWidth: 48, // 1.2m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 15, w: 92, h: 70, rx: 4 },
      { kind: 'line', points: [4, 40, 96, 40] },
    ],
  },
  {
    id: 'bookshelf',
    category: 'sala',
    name: 'Librero',
    defaultWidth: 40, // 1m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [26, 4, 26, 96] },
      { kind: 'line', points: [50, 4, 50, 96] },
      { kind: 'line', points: [74, 4, 74, 96] },
    ],
  },
  {
    id: 'ottoman',
    category: 'sala',
    name: 'Puf',
    defaultWidth: 20, // 0.5m
    defaultHeight: 20,
    box: 100,
    primitives: [{ kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 30 }],
  },
  {
    id: 'rug',
    category: 'sala',
    name: 'Alfombra',
    defaultWidth: 80, // 2m
    defaultHeight: 56, // 1.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'rect', x: 14, y: 14, w: 72, h: 72 },
    ],
  },
  {
    id: 'sectional-sofa',
    category: 'sala',
    name: 'Sofá seccional',
    defaultWidth: 96, // 2.4m
    defaultHeight: 96, // 2.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 34, rx: 6 },
      { kind: 'rect', x: 4, y: 4, w: 34, h: 92, rx: 6 },
    ],
  },
  {
    id: 'chaise-lounge',
    category: 'sala',
    name: 'Diván',
    defaultWidth: 64, // 1.6m
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 10, w: 60, h: 80, rx: 10 },
      { kind: 'rect', x: 60, y: 4, w: 32, h: 92, rx: 14 },
    ],
  },
  {
    id: 'side-table',
    category: 'sala',
    name: 'Mesa auxiliar',
    defaultWidth: 18, // 0.45m
    defaultHeight: 18,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 44 }],
  },
  {
    id: 'floor-lamp',
    category: 'sala',
    name: 'Lámpara de pie',
    defaultWidth: 12, // 0.3m
    defaultHeight: 12,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 40 },
      { kind: 'circle', cx: 50, cy: 50, r: 10 },
    ],
    filled: true,
  },
  {
    id: 'fireplace',
    category: 'sala',
    name: 'Chimenea',
    defaultWidth: 48, // 1.2m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'rect', x: 20, y: 20, w: 60, h: 72 },
    ],
  },
  {
    id: 'console-table',
    category: 'sala',
    name: 'Consola',
    defaultWidth: 48, // 1.2m
    defaultHeight: 14, // 0.35m
    box: 100,
    primitives: [{ kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 }],
  },
  {
    id: 'media-cabinet',
    category: 'sala',
    name: 'Mueble multimedia',
    defaultWidth: 64, // 1.6m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 15, w: 92, h: 70, rx: 4 },
      { kind: 'line', points: [34, 15, 34, 85] },
      { kind: 'line', points: [66, 15, 66, 85] },
    ],
  },
  {
    id: 'accent-chair',
    category: 'sala',
    name: 'Silla decorativa',
    defaultWidth: 28, // 0.7m
    defaultHeight: 28,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 55, r: 40 },
      { kind: 'rect', x: 30, y: 4, w: 40, h: 18, rx: 8 },
    ],
  },
  {
    id: 'bar-cart',
    category: 'sala',
    name: 'Carrito de bar',
    defaultWidth: 24, // 0.6m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 30 },
      { kind: 'circle', cx: 50, cy: 50, r: 10 },
    ],
  },
  {
    id: 'piano',
    category: 'sala',
    name: 'Piano vertical',
    defaultWidth: 56, // 1.4m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'rect', x: 10, y: 60, w: 80, h: 14 },
    ],
  },

  // Baño
  {
    id: 'toilet',
    category: 'bano',
    name: 'Inodoro',
    defaultWidth: 16, // 0.4m
    defaultHeight: 26, // 0.65m
    box: 100,
    primitives: [
      { kind: 'rect', x: 22, y: 4, w: 56, h: 26, rx: 6 },
      { kind: 'circle', cx: 50, cy: 66, r: 32 },
    ],
  },
  {
    id: 'bathroom-sink',
    category: 'bano',
    name: 'Lavabo',
    defaultWidth: 20, // 0.5m
    defaultHeight: 18, // 0.45m
    box: 100,
    primitives: [
      { kind: 'rect', x: 5, y: 5, w: 90, h: 70, rx: 10 },
      { kind: 'circle', cx: 50, cy: 42, r: 24 },
    ],
  },
  {
    id: 'bathroom-sink-double',
    category: 'bano',
    name: 'Lavabo doble',
    defaultWidth: 40, // 1m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 3, y: 5, w: 94, h: 70, rx: 8 },
      { kind: 'circle', cx: 28, cy: 42, r: 18 },
      { kind: 'circle', cx: 72, cy: 42, r: 18 },
    ],
  },
  {
    id: 'shower',
    category: 'bano',
    name: 'Ducha',
    defaultWidth: 36, // 0.9m
    defaultHeight: 36,
    box: 100,
    primitives: [
      { kind: 'rect', x: 5, y: 5, w: 90, h: 90 },
      { kind: 'line', points: [8, 8, 50, 50] },
      { kind: 'line', points: [92, 8, 50, 50] },
      { kind: 'circle', cx: 50, cy: 50, r: 6 },
    ],
  },
  {
    id: 'shower-corner',
    category: 'bano',
    name: 'Ducha esquinera',
    defaultWidth: 36, // 0.9m
    defaultHeight: 36,
    box: 100,
    primitives: [
      { kind: 'polygon', points: [4, 4, 96, 4, 4, 96] },
      { kind: 'line', points: [10, 10, 30, 30] },
      { kind: 'circle', cx: 24, cy: 24, r: 5 },
    ],
  },
  {
    id: 'bathtub',
    category: 'bano',
    name: 'Tina',
    defaultWidth: 68, // 1.7m
    defaultHeight: 30, // 0.75m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 8, w: 92, h: 84, rx: 30 },
      { kind: 'rect', x: 14, y: 18, w: 72, h: 64, rx: 24 },
    ],
  },
  {
    id: 'bidet',
    category: 'bano',
    name: 'Bidé',
    defaultWidth: 16, // 0.4m
    defaultHeight: 22, // 0.55m
    box: 100,
    primitives: [
      { kind: 'rect', x: 28, y: 4, w: 44, h: 14, rx: 4 },
      { kind: 'circle', cx: 50, cy: 60, r: 30 },
    ],
  },
  {
    id: 'washer',
    category: 'bano',
    name: 'Lavadora',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 6 },
      { kind: 'rect', x: 20, y: 14, w: 60, h: 10 },
      { kind: 'circle', cx: 50, cy: 56, r: 30 },
    ],
  },
  {
    id: 'dryer',
    category: 'bano',
    name: 'Secadora',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 6 },
      { kind: 'circle', cx: 20, cy: 16, r: 5 },
      { kind: 'circle', cx: 50, cy: 56, r: 30 },
    ],
  },
  {
    id: 'towel-rack',
    category: 'bano',
    name: 'Toallero',
    defaultWidth: 24, // 0.6m
    defaultHeight: 4, // 0.1m
    box: 100,
    primitives: [
      { kind: 'line', points: [4, 50, 96, 50] },
      { kind: 'line', points: [4, 30, 4, 70] },
      { kind: 'line', points: [96, 30, 96, 70] },
    ],
  },
  {
    id: 'linen-cabinet',
    category: 'bano',
    name: 'Mueble de baño',
    defaultWidth: 24, // 0.6m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [50, 4, 50, 96] },
    ],
  },
  {
    id: 'jacuzzi',
    category: 'bano',
    name: 'Jacuzzi',
    defaultWidth: 72, // 1.8m
    defaultHeight: 72,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 34 },
      { kind: 'circle', cx: 50, cy: 16, r: 4 },
      { kind: 'circle', cx: 84, cy: 50, r: 4 },
      { kind: 'circle', cx: 50, cy: 84, r: 4 },
      { kind: 'circle', cx: 16, cy: 50, r: 4 },
    ],
  },
  {
    id: 'shower-glass',
    category: 'bano',
    name: 'Ducha con panel de vidrio',
    defaultWidth: 40, // 1m
    defaultHeight: 36, // 0.9m
    box: 100,
    primitives: [
      { kind: 'rect', x: 5, y: 5, w: 90, h: 90 },
      { kind: 'line', points: [5, 5, 5, 95] },
      { kind: 'circle', cx: 50, cy: 50, r: 6 },
    ],
  },
  {
    id: 'pedestal-sink',
    category: 'bano',
    name: 'Lavabo de pedestal',
    defaultWidth: 18, // 0.45m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 40, r: 36 },
      { kind: 'rect', x: 40, y: 70, w: 20, h: 26 },
    ],
  },
  {
    id: 'urinal',
    category: 'bano',
    name: 'Mingitorio',
    defaultWidth: 14, // 0.35m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [{ kind: 'rect', x: 25, y: 4, w: 50, h: 92, rx: 20 }],
  },
  {
    id: 'laundry-hamper',
    category: 'bano',
    name: 'Cesto de ropa',
    defaultWidth: 16, // 0.4m
    defaultHeight: 16,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 44 }],
  },
  {
    id: 'towel-stand',
    category: 'bano',
    name: 'Toallero de pie',
    defaultWidth: 12, // 0.3m
    defaultHeight: 12,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 10 },
      { kind: 'line', points: [30, 30, 70, 30] },
      { kind: 'line', points: [30, 60, 70, 60] },
    ],
  },

  // Cocina
  {
    id: 'stove',
    category: 'cocina',
    name: 'Estufa',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 4 },
      { kind: 'circle', cx: 30, cy: 30, r: 12 },
      { kind: 'circle', cx: 70, cy: 30, r: 12 },
      { kind: 'circle', cx: 30, cy: 70, r: 12 },
      { kind: 'circle', cx: 70, cy: 70, r: 12 },
    ],
  },
  {
    id: 'stove-compact',
    category: 'cocina',
    name: 'Estufa 2 quemadores',
    defaultWidth: 20, // 0.5m
    defaultHeight: 20,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 4 },
      { kind: 'circle', cx: 32, cy: 50, r: 16 },
      { kind: 'circle', cx: 68, cy: 50, r: 16 },
    ],
  },
  {
    id: 'fridge',
    category: 'cocina',
    name: 'Refrigerador',
    defaultWidth: 28, // 0.7m
    defaultHeight: 28,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 4, w: 84, h: 92, rx: 4 },
      { kind: 'line', points: [8, 34, 92, 34] },
    ],
  },
  {
    id: 'fridge-double-door',
    category: 'cocina',
    name: 'Refrigerador doble puerta',
    defaultWidth: 36, // 0.9m
    defaultHeight: 28, // 0.7m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [50, 4, 50, 96] },
    ],
  },
  {
    id: 'kitchen-sink',
    category: 'cocina',
    name: 'Fregadero',
    defaultWidth: 24, // 0.6m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 8, w: 92, h: 84, rx: 6 },
      { kind: 'rect', x: 12, y: 20, w: 32, h: 60, rx: 4 },
      { kind: 'rect', x: 56, y: 20, w: 32, h: 60, rx: 4 },
    ],
  },
  {
    id: 'kitchen-island',
    category: 'cocina',
    name: 'Isla de cocina',
    defaultWidth: 48, // 1.2m
    defaultHeight: 28, // 0.7m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [50, 4, 50, 96] },
    ],
  },
  {
    id: 'wall-oven',
    category: 'cocina',
    name: 'Horno empotrado',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 6 },
      { kind: 'rect', x: 18, y: 14, w: 64, h: 10 },
      { kind: 'circle', cx: 50, cy: 58, r: 26 },
    ],
  },
  {
    id: 'dishwasher',
    category: 'cocina',
    name: 'Lavavajillas',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 4 },
      { kind: 'rect', x: 16, y: 16, w: 68, h: 68 },
      { kind: 'line', points: [16, 20, 40, 20] },
    ],
  },
  {
    id: 'microwave',
    category: 'cocina',
    name: 'Microondas',
    defaultWidth: 20, // 0.5m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'rect', x: 14, y: 14, w: 50, h: 72 },
      { kind: 'circle', cx: 80, cy: 50, r: 8 },
    ],
  },
  {
    id: 'pantry',
    category: 'cocina',
    name: 'Despensa',
    defaultWidth: 24, // 0.6m
    defaultHeight: 24,
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [50, 4, 50, 96] },
    ],
  },
  {
    id: 'breakfast-bar',
    category: 'cocina',
    name: 'Barra desayunador',
    defaultWidth: 60, // 1.5m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 30, w: 92, h: 40, rx: 4 },
      { kind: 'circle', cx: 20, cy: 85, r: 9 },
      { kind: 'circle', cx: 50, cy: 85, r: 9 },
      { kind: 'circle', cx: 80, cy: 85, r: 9 },
    ],
  },
  {
    id: 'range-hood',
    category: 'cocina',
    name: 'Campana extractora',
    defaultWidth: 24, // 0.6m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 10, w: 80, h: 80, rx: 6 },
      { kind: 'rect', x: 22, y: 22, w: 56, h: 56 },
    ],
  },
  {
    id: 'kitchen-cart',
    category: 'cocina',
    name: 'Carrito de cocina',
    defaultWidth: 24, // 0.6m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 4 },
      { kind: 'line', points: [6, 50, 94, 50] },
    ],
  },
  {
    id: 'wine-fridge',
    category: 'cocina',
    name: 'Vinoteca',
    defaultWidth: 20, // 0.5m
    defaultHeight: 20,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 4 },
      { kind: 'line', points: [6, 30, 94, 30] },
      { kind: 'line', points: [6, 55, 94, 55] },
      { kind: 'line', points: [6, 80, 94, 80] },
    ],
  },
  {
    id: 'upper-cabinet',
    category: 'cocina',
    name: 'Alacena',
    defaultWidth: 32, // 0.8m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 4 },
      { kind: 'line', points: [50, 4, 50, 96] },
    ],
  },
  {
    id: 'trash-bin',
    category: 'cocina',
    name: 'Bote de basura',
    defaultWidth: 14, // 0.35m
    defaultHeight: 14,
    box: 100,
    primitives: [{ kind: 'circle', cx: 50, cy: 50, r: 42 }],
  },
  {
    id: 'coffee-station',
    category: 'cocina',
    name: 'Estación de café',
    defaultWidth: 20, // 0.5m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88, rx: 4 },
      { kind: 'circle', cx: 50, cy: 55, r: 20 },
    ],
  },

  // Oficina
  {
    id: 'desk',
    category: 'oficina',
    name: 'Escritorio',
    defaultWidth: 48, // 1.2m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 10, w: 92, h: 80, rx: 4 },
      { kind: 'rect', x: 70, y: 10, w: 22, h: 80 },
    ],
  },
  {
    id: 'desk-l-shaped',
    category: 'oficina',
    name: 'Escritorio en L',
    defaultWidth: 56, // 1.4m
    defaultHeight: 56, // 1.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 34, rx: 4 },
      { kind: 'rect', x: 4, y: 4, w: 34, h: 92, rx: 4 },
    ],
  },
  {
    id: 'office-chair',
    category: 'oficina',
    name: 'Silla de oficina',
    defaultWidth: 20, // 0.5m
    defaultHeight: 20,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 55, r: 38 },
      { kind: 'rect', x: 30, y: 4, w: 40, h: 16, rx: 6 },
    ],
  },
  {
    id: 'filing-cabinet',
    category: 'oficina',
    name: 'Archivador',
    defaultWidth: 16, // 0.4m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 4, w: 84, h: 92, rx: 4 },
      { kind: 'line', points: [8, 36, 92, 36] },
      { kind: 'line', points: [8, 66, 92, 66] },
    ],
  },
  {
    id: 'guest-chair',
    category: 'oficina',
    name: 'Silla de visita',
    defaultWidth: 20, // 0.5m
    defaultHeight: 20,
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 8, w: 84, h: 20, rx: 4 },
      { kind: 'rect', x: 8, y: 28, w: 84, h: 64, rx: 8 },
    ],
  },
  {
    id: 'conference-table',
    category: 'oficina',
    name: 'Mesa de juntas',
    defaultWidth: 96, // 2.4m
    defaultHeight: 44, // 1.1m
    box: 100,
    primitives: [{ kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 40 }],
  },
  {
    id: 'bookcase-office',
    category: 'oficina',
    name: 'Estante de oficina',
    defaultWidth: 40, // 1m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [26, 4, 26, 96] },
      { kind: 'line', points: [50, 4, 50, 96] },
      { kind: 'line', points: [74, 4, 74, 96] },
    ],
  },
  {
    id: 'whiteboard',
    category: 'oficina',
    name: 'Pizarra',
    defaultWidth: 48, // 1.2m
    defaultHeight: 4, // 0.1m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 30, w: 92, h: 40 },
      { kind: 'rect', x: 12, y: 38, w: 76, h: 24 },
    ],
  },
  {
    id: 'printer-station',
    category: 'oficina',
    name: 'Estación de impresión',
    defaultWidth: 24, // 0.6m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 10, w: 88, h: 70, rx: 4 },
      { kind: 'rect', x: 16, y: 76, w: 68, h: 14 },
    ],
  },
  {
    id: 'reception-desk',
    category: 'oficina',
    name: 'Recepción',
    defaultWidth: 72, // 1.8m
    defaultHeight: 48, // 1.2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 20 },
      { kind: 'line', points: [4, 40, 96, 40] },
    ],
  },
  {
    id: 'cubicle',
    category: 'oficina',
    name: 'Cubículo',
    defaultWidth: 60, // 1.5m
    defaultHeight: 60, // 1.5m
    box: 100,
    primitives: [
      { kind: 'line', points: [4, 96, 4, 4, 96, 4] },
      { kind: 'line', points: [96, 4, 96, 50] },
    ],
  },
  {
    id: 'standing-desk',
    category: 'oficina',
    name: 'Escritorio de pie',
    defaultWidth: 48, // 1.2m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 10, w: 92, h: 80, rx: 4 },
      { kind: 'circle', cx: 12, cy: 3, r: 3 },
      { kind: 'circle', cx: 88, cy: 3, r: 3 },
    ],
  },
  {
    id: 'office-sofa',
    category: 'oficina',
    name: 'Sofá de recepción',
    defaultWidth: 64, // 1.6m
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 6, w: 92, h: 18, rx: 4 },
      { kind: 'rect', x: 4, y: 22, w: 92, h: 70, rx: 6 },
      { kind: 'line', points: [34, 22, 34, 92] },
      { kind: 'line', points: [66, 22, 66, 92] },
    ],
  },
  {
    id: 'server-rack',
    category: 'oficina',
    name: 'Rack de servidores',
    defaultWidth: 24, // 0.6m
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 4, w: 88, h: 92 },
      { kind: 'line', points: [6, 24, 94, 24] },
      { kind: 'line', points: [6, 44, 94, 44] },
      { kind: 'line', points: [6, 64, 94, 64] },
      { kind: 'line', points: [6, 84, 94, 84] },
    ],
  },
  {
    id: 'locker',
    category: 'oficina',
    name: 'Casillero',
    defaultWidth: 16, // 0.4m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 8, y: 4, w: 84, h: 92 },
      { kind: 'line', points: [50, 4, 50, 96] },
      { kind: 'line', points: [8, 34, 92, 34] },
      { kind: 'line', points: [8, 64, 92, 64] },
    ],
  },
  {
    id: 'meeting-pod',
    category: 'oficina',
    name: 'Cabina de reuniones',
    defaultWidth: 60, // 1.5m
    defaultHeight: 60, // 1.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92, rx: 10 },
      { kind: 'circle', cx: 50, cy: 50, r: 24 },
    ],
  },

  // Exterior
  {
    id: 'tree',
    category: 'exterior',
    name: 'Árbol',
    defaultWidth: 100, // 2.5m de copa
    defaultHeight: 100,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 5 },
    ],
    filled: true,
  },
  {
    id: 'tree-small',
    category: 'exterior',
    name: 'Árbol pequeño',
    defaultWidth: 60, // 1.5m de copa
    defaultHeight: 60,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 5 },
    ],
    filled: true,
  },
  {
    id: 'car',
    category: 'exterior',
    name: 'Automóvil',
    defaultWidth: 180, // 4.5m
    defaultHeight: 72, // 1.8m
    box: 100,
    primitives: [
      { kind: 'rect', x: 3, y: 8, w: 94, h: 84, rx: 18 },
      { kind: 'line', points: [26, 8, 26, 92] },
      { kind: 'line', points: [74, 8, 74, 92] },
    ],
  },
  {
    id: 'motorcycle',
    category: 'exterior',
    name: 'Motocicleta',
    defaultWidth: 88, // 2.2m
    defaultHeight: 32, // 0.8m
    box: 100,
    primitives: [
      { kind: 'line', points: [8, 50, 92, 50] },
      { kind: 'circle', cx: 16, cy: 50, r: 14 },
      { kind: 'circle', cx: 84, cy: 50, r: 14 },
      { kind: 'rect', x: 38, y: 34, w: 24, h: 32, rx: 4 },
    ],
  },
  {
    id: 'bench',
    category: 'exterior',
    name: 'Banca',
    defaultWidth: 60, // 1.5m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 30, w: 92, h: 24 },
      { kind: 'line', points: [10, 30, 10, 80] },
      { kind: 'line', points: [90, 30, 90, 80] },
    ],
  },
  {
    id: 'bicycle',
    category: 'exterior',
    name: 'Bicicleta',
    defaultWidth: 72, // 1.8m
    defaultHeight: 20, // 0.5m
    box: 100,
    primitives: [
      { kind: 'circle', cx: 18, cy: 50, r: 16 },
      { kind: 'circle', cx: 82, cy: 50, r: 16 },
      { kind: 'line', points: [18, 50, 46, 30, 82, 50] },
      { kind: 'line', points: [46, 30, 46, 50] },
      { kind: 'line', points: [18, 50, 60, 20] },
    ],
  },
  {
    id: 'patio-umbrella',
    category: 'exterior',
    name: 'Sombrilla',
    defaultWidth: 80, // 2m diámetro
    defaultHeight: 80,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 4 },
      { kind: 'line', points: [50, 4, 50, 96] },
      { kind: 'line', points: [4, 50, 96, 50] },
    ],
    filled: true,
  },
  {
    id: 'pool',
    category: 'exterior',
    name: 'Alberca',
    defaultWidth: 160, // 4m
    defaultHeight: 100, // 2.5m
    box: 100,
    primitives: [
      { kind: 'rect', x: 2, y: 2, w: 96, h: 96, rx: 14 },
      { kind: 'rect', x: 10, y: 10, w: 80, h: 80, rx: 10 },
    ],
    filled: true,
  },
  {
    id: 'bbq-grill',
    category: 'exterior',
    name: 'Parrilla',
    defaultWidth: 32, // 0.8m
    defaultHeight: 24, // 0.6m
    box: 100,
    primitives: [
      { kind: 'rect', x: 10, y: 20, w: 80, h: 60, rx: 8 },
      { kind: 'circle', cx: 50, cy: 50, r: 20 },
    ],
  },
  {
    id: 'planter',
    category: 'exterior',
    name: 'Jardinera',
    defaultWidth: 40, // 1m
    defaultHeight: 12, // 0.3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'circle', cx: 25, cy: 50, r: 10 },
      { kind: 'circle', cx: 50, cy: 50, r: 10 },
      { kind: 'circle', cx: 75, cy: 50, r: 10 },
    ],
    filled: true,
  },
  {
    id: 'shed',
    category: 'exterior',
    name: 'Cobertizo',
    defaultWidth: 80, // 2m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [38, 4, 62, 4] },
    ],
  },
  {
    id: 'fence-section',
    category: 'exterior',
    name: 'Sección de cerca',
    defaultWidth: 80, // 2m
    defaultHeight: 4, // 0.1m
    box: 100,
    primitives: [
      { kind: 'line', points: [4, 50, 96, 50] },
      { kind: 'line', points: [10, 30, 10, 70] },
      { kind: 'line', points: [25, 30, 25, 70] },
      { kind: 'line', points: [40, 30, 40, 70] },
      { kind: 'line', points: [55, 30, 55, 70] },
      { kind: 'line', points: [70, 30, 70, 70] },
      { kind: 'line', points: [85, 30, 85, 70] },
    ],
  },
  {
    id: 'hedge',
    category: 'exterior',
    name: 'Seto',
    defaultWidth: 100, // 2.5m
    defaultHeight: 16, // 0.4m
    box: 100,
    primitives: [
      { kind: 'rect', x: 2, y: 20, w: 96, h: 60, rx: 20 },
      { kind: 'circle', cx: 18, cy: 50, r: 8 },
      { kind: 'circle', cx: 38, cy: 50, r: 8 },
      { kind: 'circle', cx: 58, cy: 50, r: 8 },
      { kind: 'circle', cx: 78, cy: 50, r: 8 },
    ],
    filled: true,
  },
  {
    id: 'pergola',
    category: 'exterior',
    name: 'Pérgola',
    defaultWidth: 120, // 3m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [4, 24, 96, 24] },
      { kind: 'line', points: [4, 44, 96, 44] },
      { kind: 'line', points: [4, 64, 96, 64] },
      { kind: 'line', points: [4, 84, 96, 84] },
    ],
  },
  {
    id: 'gate',
    category: 'exterior',
    name: 'Portón',
    defaultWidth: 48, // 1.2m
    defaultHeight: 8, // 0.2m
    box: 100,
    primitives: [
      { kind: 'line', points: [4, 50, 96, 50] },
      { kind: 'line', points: [4, 20, 4, 80] },
      { kind: 'line', points: [96, 20, 96, 80] },
      { kind: 'line', points: [30, 30, 30, 70] },
      { kind: 'line', points: [70, 30, 70, 70] },
    ],
  },
  {
    id: 'trampoline',
    category: 'exterior',
    name: 'Trampolín',
    defaultWidth: 96, // 2.4m diámetro
    defaultHeight: 96,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 34 },
    ],
  },
  {
    id: 'parking-space',
    category: 'exterior',
    name: 'Cajón de estacionamiento',
    defaultWidth: 100, // 2.5m
    defaultHeight: 200, // 5m
    box: 100,
    primitives: [
      { kind: 'line', points: [4, 4, 4, 96] },
      { kind: 'line', points: [96, 4, 96, 96] },
      { kind: 'line', points: [4, 4, 20, 4] },
      { kind: 'line', points: [80, 4, 96, 4] },
    ],
  },

  // Edificio
  {
    id: 'stairs',
    category: 'edificio',
    name: 'Escalera',
    defaultWidth: 48, // 1.2m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 2, w: 92, h: 96 },
      { kind: 'line', points: [4, 14, 96, 14] },
      { kind: 'line', points: [4, 26, 96, 26] },
      { kind: 'line', points: [4, 38, 96, 38] },
      { kind: 'line', points: [4, 50, 96, 50] },
      { kind: 'line', points: [4, 62, 96, 62] },
      { kind: 'line', points: [4, 74, 96, 74] },
      { kind: 'line', points: [4, 86, 96, 86] },
      { kind: 'path', d: 'M50,90 L50,20 M38,32 L50,20 L62,32' },
    ],
  },
  {
    id: 'spiral-stairs',
    category: 'edificio',
    name: 'Escalera de caracol',
    defaultWidth: 56, // 1.4m diámetro
    defaultHeight: 56,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'circle', cx: 50, cy: 50, r: 6 },
      { kind: 'path', d: 'M50,50 L50,6 A44,44 0 0 1 90,32 A44,44 0 0 1 78,80 A44,44 0 0 1 26,88' },
    ],
  },
  {
    id: 'elevator',
    category: 'edificio',
    name: 'Ascensor',
    defaultWidth: 64, // 1.6m
    defaultHeight: 64,
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [4, 4, 96, 96] },
      { kind: 'line', points: [96, 4, 4, 96] },
    ],
  },
  {
    id: 'ramp',
    category: 'edificio',
    name: 'Rampa',
    defaultWidth: 48, // 1.2m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 2, w: 92, h: 96 },
      { kind: 'line', points: [10, 90, 90, 14] },
      { kind: 'path', d: 'M50,90 L50,20 M38,32 L50,20 L62,32' },
    ],
  },
  {
    id: 'fire-door',
    category: 'edificio',
    name: 'Puerta cortafuego',
    defaultWidth: 36, // 0.9m
    defaultHeight: 10, // grosor de muro
    box: 100,
    primitives: [
      { kind: 'line', points: [15, 10, 15, 90] },
      { kind: 'line', points: [15, 90, 80, 90] },
      { kind: 'path', d: 'M15,10 A80,80 0 0 1 80,90' },
      { kind: 'rect', x: 4, y: 4, w: 14, h: 14 },
    ],
    filled: true,
  },
  {
    id: 'escalator',
    category: 'edificio',
    name: 'Escalera eléctrica',
    defaultWidth: 64, // 1.6m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 2, w: 92, h: 96 },
      { kind: 'line', points: [4, 22, 96, 22] },
      { kind: 'line', points: [4, 42, 96, 42] },
      { kind: 'line', points: [4, 62, 96, 62] },
      { kind: 'line', points: [4, 82, 96, 82] },
      { kind: 'path', d: 'M50,90 L50,10 M38,22 L50,10 L62,22' },
    ],
  },
  {
    id: 'loading-dock',
    category: 'edificio',
    name: 'Andén de carga',
    defaultWidth: 120, // 3m
    defaultHeight: 80, // 2m
    box: 100,
    primitives: [
      { kind: 'rect', x: 2, y: 2, w: 96, h: 96 },
      { kind: 'line', points: [10, 90, 90, 10] },
      { kind: 'line', points: [10, 70, 70, 10] },
      { kind: 'line', points: [10, 50, 50, 10] },
      { kind: 'line', points: [10, 30, 30, 10] },
      { kind: 'line', points: [30, 90, 90, 30] },
      { kind: 'line', points: [50, 90, 90, 50] },
      { kind: 'line', points: [70, 90, 90, 70] },
    ],
  },
  {
    id: 'freight-elevator',
    category: 'edificio',
    name: 'Montacargas de edificio',
    defaultWidth: 80, // 2m
    defaultHeight: 80,
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'rect', x: 16, y: 16, w: 68, h: 68 },
      { kind: 'line', points: [50, 16, 50, 84] },
    ],
  },
  {
    id: 'handrail',
    category: 'edificio',
    name: 'Baranda',
    defaultWidth: 80, // 2m
    defaultHeight: 4, // 0.1m
    box: 100,
    primitives: [
      { kind: 'line', points: [4, 50, 96, 50] },
      { kind: 'line', points: [10, 30, 10, 70] },
      { kind: 'line', points: [30, 30, 30, 70] },
      { kind: 'line', points: [50, 30, 50, 70] },
      { kind: 'line', points: [70, 30, 70, 70] },
      { kind: 'line', points: [90, 30, 90, 70] },
    ],
  },
  {
    id: 'skylight',
    category: 'edificio',
    name: 'Tragaluz',
    defaultWidth: 48, // 1.2m
    defaultHeight: 48,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88 },
      { kind: 'line', points: [6, 35, 94, 35] },
      { kind: 'line', points: [6, 65, 94, 65] },
      { kind: 'line', points: [35, 6, 35, 94] },
      { kind: 'line', points: [65, 6, 65, 94] },
    ],
  },
  {
    id: 'revolving-door',
    category: 'edificio',
    name: 'Puerta giratoria',
    defaultWidth: 56, // 1.4m diámetro
    defaultHeight: 56,
    box: 100,
    primitives: [
      { kind: 'circle', cx: 50, cy: 50, r: 46 },
      { kind: 'line', points: [50, 50, 50, 6] },
      { kind: 'line', points: [50, 50, 94, 50] },
      { kind: 'line', points: [50, 50, 50, 94] },
      { kind: 'line', points: [50, 50, 6, 50] },
    ],
  },
  {
    id: 'security-gate',
    category: 'edificio',
    name: 'Control de acceso',
    defaultWidth: 12, // 0.3m
    defaultHeight: 40, // 1m
    box: 100,
    primitives: [
      { kind: 'rect', x: 20, y: 4, w: 60, h: 92, rx: 6 },
      { kind: 'line', points: [50, 20, 50, 80] },
    ],
  },
  {
    id: 'emergency-exit-stairs',
    category: 'edificio',
    name: 'Escalera de emergencia',
    defaultWidth: 48, // 1.2m
    defaultHeight: 120, // 3m
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 2, w: 92, h: 96 },
      { kind: 'line', points: [4, 16, 96, 16] },
      { kind: 'line', points: [4, 32, 96, 32] },
      { kind: 'line', points: [4, 48, 96, 48] },
      { kind: 'line', points: [4, 64, 96, 64] },
      { kind: 'line', points: [4, 80, 96, 80] },
      { kind: 'line', points: [0, 2, 0, 98] },
    ],
  },
  {
    id: 'elevator-shaft',
    category: 'edificio',
    name: 'Cubo de ascensor',
    defaultWidth: 64, // 1.6m
    defaultHeight: 64,
    box: 100,
    primitives: [
      { kind: 'rect', x: 4, y: 4, w: 92, h: 92 },
      { kind: 'line', points: [4, 20, 96, 20] },
      { kind: 'line', points: [4, 36, 96, 36] },
      { kind: 'line', points: [4, 52, 96, 52] },
      { kind: 'line', points: [4, 68, 96, 68] },
      { kind: 'line', points: [4, 84, 96, 84] },
    ],
  },
  {
    id: 'floor-hatch',
    category: 'edificio',
    name: 'Trampilla de piso',
    defaultWidth: 32, // 0.8m
    defaultHeight: 32,
    box: 100,
    primitives: [
      { kind: 'rect', x: 6, y: 6, w: 88, h: 88 },
      { kind: 'line', points: [6, 6, 94, 94] },
      { kind: 'line', points: [94, 6, 6, 94] },
      { kind: 'rect', x: 30, y: 30, w: 40, h: 40 },
    ],
  },
]
