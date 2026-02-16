import { createClient } from '@supabase/supabase-js'

// We add these '||' fallbacks so the build doesn't crash.
// Vercel will swap these for your REAL keys once the site is live.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)