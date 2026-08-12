import { create } from 'zustand'
import { isMobileViewport } from '@/lib/useIsMobile'

interface PendingPlacement {
  symbolId: string
  label: string
}

interface UIState {
  symbolsPanelOpen: boolean
  rightPanelOpen: boolean
  toggleSymbolsPanel: () => void
  toggleRightPanel: () => void
  // Mobile tap-to-place: dragging a symbol out of the library panel proved unreliable on real
  // touchscreens (a continuous drag across the drawer overlay onto a partially-hidden canvas is a
  // fragile gesture). Tapping a symbol arms this instead, then the next tap on the canvas places
  // it — two simple taps, no drag tracking needed.
  pendingPlacement: PendingPlacement | null
  startPlacement: (symbolId: string, label: string) => void
  cancelPlacement: () => void
}

// Both panels default open on desktop, but on a phone they'd cover the entire canvas — so on a
// narrow viewport they start closed and the user opens them on demand via the existing toggles.
const defaultPanelsOpen = !isMobileViewport()

export const useUIStore = create<UIState>((set) => ({
  symbolsPanelOpen: defaultPanelsOpen,
  rightPanelOpen: defaultPanelsOpen,
  toggleSymbolsPanel: () => set((s) => ({ symbolsPanelOpen: !s.symbolsPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  pendingPlacement: null,
  startPlacement: (symbolId, label) => set({ pendingPlacement: { symbolId, label }, symbolsPanelOpen: false }),
  cancelPlacement: () => set({ pendingPlacement: null }),
}))
