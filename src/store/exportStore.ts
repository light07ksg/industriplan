import { create } from 'zustand'

export type ExportFormat = 'png' | 'pdf'

interface ExportState {
  pendingExport: ExportFormat | null
  exporting: boolean
  error: string | null
  requestExport: (format: ExportFormat) => void
  clearExportRequest: () => void
  setExporting: (value: boolean) => void
  setError: (message: string | null) => void
}

export const useExportStore = create<ExportState>((set) => ({
  pendingExport: null,
  exporting: false,
  error: null,
  requestExport: (format) => set({ pendingExport: format, error: null }),
  clearExportRequest: () => set({ pendingExport: null }),
  setExporting: (value) => set({ exporting: value }),
  setError: (message) => set({ error: message }),
}))
