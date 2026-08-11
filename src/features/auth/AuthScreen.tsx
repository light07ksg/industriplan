import { useState, type FormEvent } from 'react'
import { Factory, FileDown, LayoutGrid, Loader2, Ruler } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { BlueprintHero } from './BlueprintHero'

const FEATURES = [
  { icon: Ruler, text: 'Escala real configurable, en mm, cm o m' },
  { icon: LayoutGrid, text: 'Más de 180 símbolos: industria, mobiliario y señalización' },
  { icon: FileDown, text: 'Exporta a PNG, PDF o JSON en un clic' },
]

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const message = useAuthStore((s) => s.message)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const clearFeedback = useAuthStore((s) => s.clearFeedback)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'signin') {
      signIn(email, password)
    } else {
      signUp(email, password)
    }
  }

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next)
    clearFeedback()
  }

  return (
    <div className="flex min-h-screen w-screen bg-surface text-text-primary">
      <div className="relative hidden overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 md:flex md:w-1/2 md:flex-col md:justify-between md:p-10 lg:w-3/5 lg:p-14">
        <div className="flex items-center gap-2 text-white">
          <Factory className="h-6 w-6 text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide">INDUSTRIPLAN</span>
        </div>

        <div className="flex flex-col items-center gap-6">
          <BlueprintHero />
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">Planos industriales, a escala real.</h2>
            <p className="mt-2 text-sm text-slate-400">
              Dibujá muros, colocá símbolos y exportá planos profesionales — todo desde el navegador.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-slate-300">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800/60 text-cyan-400">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 md:w-1/2 lg:w-2/5">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center gap-2 md:hidden">
            <Factory className="h-8 w-8 text-accent" />
            <h1 className="text-sm font-semibold tracking-wide">INDUSTRIPLAN</h1>
          </div>

          <h2 className="mb-1 text-lg font-semibold text-text-primary">
            {mode === 'signin' ? 'Bienvenido de nuevo' : 'Creá tu cuenta'}
          </h2>
          <p className="mb-6 text-xs text-text-secondary">
            {mode === 'signin' ? 'Iniciá sesión para seguir con tus planos.' : 'Es gratis y toma menos de un minuto.'}
          </p>

          <div className="mb-4 flex overflow-hidden rounded-md border border-surface-border">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-xs font-medium transition-colors duration-150 ${
                mode === 'signin' ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-surface-inset'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-xs font-medium transition-colors duration-150 ${
                mode === 'signup' ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-surface-inset'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-text-secondary">Correo</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                placeholder="tucorreo@ejemplo.com"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-text-secondary">Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                placeholder="Mínimo 6 caracteres"
              />
            </label>

            {error && <p className="rounded bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>}
            {message && <p className="rounded bg-accent-soft px-3 py-2 text-xs text-accent">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
