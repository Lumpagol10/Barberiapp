import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

// Cliente de Navegador (Client Side) único para todo el proyecto
// Optimizado para Next.js 16/SSR
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
