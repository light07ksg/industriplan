import type Konva from 'konva'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import type { CanvasElement } from '@/store/canvasStore'

const EXPORT_PADDING = 60
const MAX_EXPORT_PIXEL_RATIO = 2
const MIN_EXPORT_PIXEL_RATIO = 1
/** Cap on the longest raster side, in pixels. Keeps huge plans from freezing the tab or blowing past canvas size limits. */
const MAX_EXPORT_DIMENSION = 4000

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/** World-space bounding box of everything that will show up in the export (walls, areas, symbols). */
function computeContentBounds(elements: CanvasElement[]): Bounds | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of elements) {
    if (el.type === 'wall') {
      for (let i = 0; i + 1 < el.points.length; i += 2) {
        minX = Math.min(minX, el.points[i])
        maxX = Math.max(maxX, el.points[i])
        minY = Math.min(minY, el.points[i + 1])
        maxY = Math.max(maxY, el.points[i + 1])
      }
    } else if (el.type === 'area' || el.type === 'symbol') {
      minX = Math.min(minX, el.x)
      maxX = Math.max(maxX, el.x + el.width)
      minY = Math.min(minY, el.y)
      maxY = Math.max(maxY, el.y + el.height)
    } else if (el.type === 'note') {
      minX = Math.min(minX, el.x)
      maxX = Math.max(maxX, el.x + el.text.length * el.fontSize * 0.6)
      minY = Math.min(minY, el.y)
      maxY = Math.max(maxY, el.y + el.fontSize * 1.4)
    }
  }

  if (minX === Infinity) return null
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = /data:(.*);base64/.exec(header)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}

/** Draws a raw (possibly transparent) PNG onto a white background, so exports print/paste cleanly. */
function compositeOnWhite(rawDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo preparar el lienzo de exportación.'))
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('No se pudo procesar la imagen exportada.'))
    img.src = rawDataUrl
  })
}

/**
 * Temporarily resizes the live Stage to frame all content 1:1, rasterizes it, then restores the
 * original view. Runs synchronously apart from the final white-background composite, so the
 * on-screen editor never visibly flickers.
 */
async function captureStage(
  stage: Konva.Stage,
  elements: CanvasElement[],
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  const bounds = computeContentBounds(elements)
  if (!bounds) return null

  const prevWidth = stage.width()
  const prevHeight = stage.height()
  const prevScaleX = stage.scaleX()
  const prevScaleY = stage.scaleY()
  const prevX = stage.x()
  const prevY = stage.y()

  const width = bounds.width + EXPORT_PADDING * 2
  const height = bounds.height + EXPORT_PADDING * 2
  const longestSide = Math.max(width, height)
  const pixelRatio = Math.min(MAX_EXPORT_PIXEL_RATIO, Math.max(MIN_EXPORT_PIXEL_RATIO, MAX_EXPORT_DIMENSION / longestSide))

  stage.width(width)
  stage.height(height)
  stage.scale({ x: 1, y: 1 })
  stage.position({ x: -bounds.x + EXPORT_PADDING, y: -bounds.y + EXPORT_PADDING })
  stage.batchDraw()

  const rawDataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' })

  stage.width(prevWidth)
  stage.height(prevHeight)
  stage.scale({ x: prevScaleX, y: prevScaleY })
  stage.position({ x: prevX, y: prevY })
  stage.batchDraw()

  const dataUrl = await compositeOnWhite(rawDataUrl)
  return { dataUrl, width, height }
}

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-z0-9\-_ ]/gi, '').trim()
  return cleaned.length > 0 ? cleaned : 'plano'
}

export async function exportStageToPng(
  stage: Konva.Stage,
  elements: CanvasElement[],
  projectName: string,
): Promise<boolean> {
  const result = await captureStage(stage, elements)
  if (!result) return false
  saveAs(dataUrlToBlob(result.dataUrl), `${sanitizeFileName(projectName)}.png`)
  return true
}

export async function exportStageToPdf(
  stage: Konva.Stage,
  elements: CanvasElement[],
  projectName: string,
): Promise<boolean> {
  const result = await captureStage(stage, elements)
  if (!result) return false
  const { dataUrl, width, height } = result

  const orientation = width >= height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'letter' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const maxW = pageWidth - margin * 2
  const maxH = pageHeight - margin * 2
  const scaleFactor = Math.min(maxW / width, maxH / height)
  const imgWidth = width * scaleFactor
  const imgHeight = height * scaleFactor
  const offsetX = (pageWidth - imgWidth) / 2
  const offsetY = (pageHeight - imgHeight) / 2

  pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, imgWidth, imgHeight)
  pdf.save(`${sanitizeFileName(projectName)}.pdf`)
  return true
}
