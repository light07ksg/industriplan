import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, Loader2, User as UserIcon, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const AVATAR_SIZE = 128

const VOCATIONS = [
  { id: 'estudiante', label: 'Estudiante' },
  { id: 'docente', label: 'Docente / Maestro' },
  { id: 'ingeniero', label: 'Ingeniero' },
  { id: 'arquitecto', label: 'Arquitecto' },
  { id: 'otro', label: 'Otro' },
] as const

/** Resizes/crops an image file down to a small square JPEG so it stays cheap to store in Supabase's
 * user_metadata (which travels in every auth token) instead of needing a storage bucket. */
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('No se pudo leer la imagen'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = AVATAR_SIZE
        canvas.height = AVATAR_SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'))
          return
        }
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

interface ProfilePanelProps {
  onClose: () => void
}

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const metadata = user?.user_metadata ?? {}
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(metadata.avatarDataUrl)
  const [displayName, setDisplayName] = useState<string>(metadata.displayName ?? '')
  const [vocation, setVocation] = useState<string>(metadata.vocation ?? '')
  const [career, setCareer] = useState<string>(metadata.career ?? '')
  const [imageError, setImageError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setImageError(null)
      const dataUrl = await fileToAvatarDataUrl(file)
      setAvatarDataUrl(dataUrl)
    } catch {
      setImageError('No se pudo cargar esa imagen. Probá con otra.')
    }
  }

  const handleSave = async () => {
    setSaved(false)
    await updateProfile({ displayName, vocation, career, avatarDataUrl })
    setSaved(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Perfil"
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-lg border border-surface-border bg-surface-alt p-4 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Perfil</h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-surface-inset hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-surface">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-text-secondary" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto"
              className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-surface-border bg-surface-alt text-text-secondary shadow-sm transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          {imageError && <p className="text-[10px] text-danger">{imageError}</p>}
          <p className="text-xs text-text-secondary">{user?.email}</p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-text-secondary">Nombre para mostrar</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[10px] text-text-secondary">Vocación</span>
            <div className="grid grid-cols-2 gap-1.5">
              {VOCATIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVocation(v.id)}
                  aria-pressed={vocation === v.id}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors duration-150 ${
                    vocation === v.id
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-surface-border text-text-secondary hover:border-accent hover:text-accent'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-text-secondary">Carrera / área (opcional)</span>
            <input
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              placeholder="Ej. Ingeniería industrial"
              className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-1 flex h-9 items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {saved && !loading ? 'Guardado ✓' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
