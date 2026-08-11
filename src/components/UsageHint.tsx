import { useState } from 'react'
import { Info, X } from 'lucide-react'

const DISMISS_KEY = 'industriplan-usage-hint-dismissed'

export function UsageHint() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  if (dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-surface-border bg-accent-soft px-4 py-1.5 text-xs text-text-secondary">
      <Info className="h-3.5 w-3.5 shrink-0 text-accent" />
      <p className="flex-1">
        <span className="font-medium text-text-primary">Cómo empezar:</span> herramienta{' '}
        <span className="font-medium text-text-primary">Pared</span> para trazar muros (clic para cada punto, doble
        clic o Enter para terminar) · arrastrá símbolos desde el panel izquierdo al lienzo · hacé clic en un
        elemento para editarlo en Propiedades, a la derecha · <span className="font-medium text-text-primary">Supr</span>{' '}
        elimina lo seleccionado, <span className="font-medium text-text-primary">Ctrl+Z</span> deshace.
      </p>
      <button
        onClick={dismiss}
        title="Ocultar esta ayuda"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-surface-alt hover:text-text-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
