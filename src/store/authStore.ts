import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface ProfileMetadata {
  displayName?: string
  vocation?: string
  career?: string
  avatarDataUrl?: string
}

interface AuthState {
  user: User | null
  initialized: boolean
  loading: boolean
  error: string | null
  message: string | null
  init: () => void
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearFeedback: () => void
  updateProfile: (data: ProfileMetadata) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,
  message: null,
  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user ?? null, initialized: true })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, initialized: true })
    })
  },
  signUp: async (email, password) => {
    set({ loading: true, error: null, message: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    if (!data.session) {
      set({ loading: false, message: 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.' })
    } else {
      set({ loading: false })
    }
  },
  signIn: async (email, password) => {
    set({ loading: true, error: null, message: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false, error: error?.message ?? null })
  },
  signOut: async () => {
    await supabase.auth.signOut()
  },
  clearFeedback: () => set({ error: null, message: null }),
  updateProfile: async (data) => {
    set({ loading: true, error: null, message: null })
    const { data: res, error } = await supabase.auth.updateUser({ data })
    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ loading: false, user: res.user })
  },
}))
