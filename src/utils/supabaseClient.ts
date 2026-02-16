import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This 'if' check prevents the Vercel build from crashing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Build-time warning: Supabase keys not found. Using placeholders.")
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)