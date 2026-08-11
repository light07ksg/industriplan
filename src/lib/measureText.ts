let measureCanvas: HTMLCanvasElement | null = null

/** Matches Konva's default Text font (Arial) so measured widths line up with what actually renders. */
export function measureTextWidth(text: string, fontSize: number, fontFamily = 'Arial'): number {
  if (!measureCanvas) measureCanvas = document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return text.length * fontSize * 0.6
  ctx.font = `${fontSize}px ${fontFamily}`
  return ctx.measureText(text).width
}
