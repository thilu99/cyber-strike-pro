'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import BioluminescentSea from '@/components/BioluminescentSea'

export default function Home() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
  }, [supabase])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { data, error } = authMode === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) setError(error.message)
    else setSession(data.session)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <BioluminescentSea />

      <div className="z-10 text-center w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          {!session ? (
            // --- LOGIN / REGISTER UI ---
            <motion.div 
              key="auth-ui"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-cyan-400 mb-2">
                {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-8">Access Cyber Strike Pro</p>

              <form onSubmit={handleAuth} className="space-y-4">
                <input 
                  type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400 transition-all"
                />
                <input 
                  type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400 transition-all"
                />
                {error && <p className="text-red-500 text-[10px] font-bold uppercase italic">{error}</p>}
                
                <button type="submit" className="w-full py-4 bg-cyan-600 rounded-2xl font-black uppercase italic hover:bg-cyan-500 transition-all shadow-xl">
                  {authMode === 'LOGIN' ? 'Login' : 'Register'}
                </button>
              </form>

              <button 
                onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="mt-6 text-[10px] text-white/30 font-bold uppercase hover:text-white transition-all"
              >
                {authMode === 'LOGIN' ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </motion.div>
          ) : (
            // --- GAME MENU UI ---
            <motion.div 
              key="menu-ui"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  Game Central
                </h1>
                <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
                  Welcome, {session.user.email}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Link href="/games/word">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-cyan-500/10 transition-all group">
                    <h2 className="text-2xl font-black uppercase italic group-hover:text-cyan-400">Zen Word Battle</h2>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Multiplayer Puzzles</p>
                  </div>
                </Link>

                <Link href="/games/bowling">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-purple-500/10 transition-all group">
                    <h2 className="text-2xl font-black uppercase italic group-hover:text-purple-400">Cyber Bowling</h2>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">3D Physics Simulation</p>
                  </div>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="mt-4 text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}