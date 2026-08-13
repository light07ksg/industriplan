import { create } from 'zustand'

export type ExportFormat = 'png' | 'pdf'
export type ExportColorMode = 'color' | 'bw'

interface ExportState {
  pendingExport: ExportFormat | null
  colorMode: ExportColorMode
  exporting: boolean
  error: string | null
  requestExport: (format: ExportFormat) => void
  setColorMode: (mode: ExportColorMode) => void
  clearExportRequest: () => void
  setExporting: (value: boolean) => void
  setError: (message: string | null) => void
}

export const useExportStore = create<ExportState>((set) => ({
  pendingExport: null,
  colorMode: 'color',
  exporting: false,
  error: null,
  requestExport: (format) => set({ pendingExport: format, error: null }),
  setColorMode: (colorMode) => set({ colorMode }),
  clearExportRequest: () => set({ pendingExport: null }),
  setExporting: (value) => set({ exporting: value }),
  setError: (message) => set({ error: message }),
}))
