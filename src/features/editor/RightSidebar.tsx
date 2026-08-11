import { LayersPanel } from './LayersPanel'
import { PropertiesPanel } from './PropertiesPanel'

export function RightSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-l border-surface-border bg-surface-alt">
      <LayersPanel />
      <PropertiesPanel />
    </aside>
  )
}
