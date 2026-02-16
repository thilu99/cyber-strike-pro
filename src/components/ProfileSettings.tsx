'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'

export default function ProfileSettings({ onClose }: { onClose: () => void }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS'>('IDLE')

  const handleSave = async () => {
    if (!username.trim()) return
    setStatus('SAVING')
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id)

      if (!error) {
        setStatus('SUCCESS')
        setTimeout(onClose, 1000)
      } else {
        alert("Username might be taken or invalid!")
        setStatus('IDLE')
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
    >
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-black italic uppercase text-white mb-6">Profile Settings</h2>
        
        <input 
          type="text" 
          placeholder="New Username"
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold uppercase text-white/40">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={status === 'SAVING'}
            className="flex-1 py-3 bg-blue-600 rounded-xl text-sm font-black uppercase italic tracking-tighter"
          >
            {status === 'SAVING' ? 'Saving...' : status === 'SUCCESS' ? 'Saved!' : 'Save Name'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}