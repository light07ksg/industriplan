import { create } from 'zustand'

interface UIState {
  symbolsPanelOpen: boolean
  rightPanelOpen: boolean
  toggleSymbolsPanel: () => void
  toggleRightPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  symbolsPanelOpen: true,
  rightPanelOpen: true,
  toggleSymbolsPanel: () => set((s) => ({ symbolsPanelOpen: !s.symbolsPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
}))
