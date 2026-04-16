import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// El cliente solo se inicializa si existen las keys
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
