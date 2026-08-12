import { ArrowRight } from 'lucide-react'

interface LandingScreenProps {
  onStart: () => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="relative flex min-h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#7dd3fc26 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* The cover image already carries the logo, tagline and feature highlights — the rest of
       * this screen only adds what it can't: the entry point into the app. */}
      <div className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl shadow-black/40 sm:max-w-lg">
        <img src="/portada-hero.jpg" alt="INDUSTRIPLAN — Planos industriales" className="block h-auto w-full" />
      </div>

      <div className="animate-fade-up relative mt-8 flex flex-col items-center gap-3" style={{ animationDelay: '200ms' }}>
        <button
          onClick={onStart}
          className="group flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-transform duration-150 hover:scale-[1.03] hover:opacity-90"
        >
          Empecemos
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
        <p className="text-xs text-slate-400">Es gratis y toma menos de un minuto.</p>
      </div>
    </div>
  )
}
