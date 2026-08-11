import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

if (import.meta.env.DEV) {
  ;(window as unknown as { __supabase: typeof supabase }).__supabase = supabase
}
