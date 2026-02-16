import { createClient } from '@supabase/supabase-js'

// We use these placeholders so the build doesn't crash. 
// Vercel will inject your real keys once the site is live.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)