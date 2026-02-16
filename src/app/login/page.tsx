'use client'

import { useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'
import GlassCard from '../../components/GlassCard'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // If successful, send them to the player setup
      router.push('/setup')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard>
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Welcome Back</h2>
        <div className="space-y-4 w-80">
          <input 
            placeholder="Email Address" 
            type="email"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            placeholder="Password" 
            type="password" 
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <Button onClick={handleLogin}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account? <span className="text-blue-400 cursor-pointer" onClick={() => router.push('/register')}>Register</span>
          </p>
        </div>
      </GlassCard>
    </main>
  )
}