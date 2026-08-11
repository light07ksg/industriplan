import { useState, type FormEvent } from 'react'
import { Factory, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

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
    <div className="flex h-screen w-screen items-center justify-center bg-surface text-text-primary">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-surface-alt p-6 glow-accent">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Factory className="h-8 w-8 text-accent" />
          <h1 className="text-sm font-semibold tracking-wide">INDUSTRIPLAN</h1>
        </div>

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
  )
}
