'use client'

import { useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import Button from '../../components/Button'
import GlassCard from '../../components/GlassCard'

// "export default" is the most important part here!
export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      alert('Check your email for a confirmation link!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <GlassCard>
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Join the Fleet</h2>
        <div className="space-y-4 w-80">
          <input 
            placeholder="Email Address" 
            type="email"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            placeholder="Create Password" 
            type="password" 
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <Button onClick={handleRegister}>
            {loading ? 'Processing...' : 'Register'}
          </Button>
        </div>
      </GlassCard>
    </main>
  )
}