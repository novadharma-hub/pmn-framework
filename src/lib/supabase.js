import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function getSupabaseConfigStatus() {
  if (!supabaseUrl && !supabaseAnonKey) {
    return 'missing_url_and_key'
  }
  if (!supabaseUrl) return 'missing_url'
  if (!supabaseAnonKey) return 'missing_anon_key'
  return 'ready'
}
