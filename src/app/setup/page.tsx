'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'

export default function Setup() {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const router = useRouter()

  const start = () => {
    // Store names in the browser's session so the games can read them
    sessionStorage.setItem('p1', p1)
    sessionStorage.setItem('p2', p2)
    router.push('/games')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-3xl w-96 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-white text-center">Player Setup</h2>

        <input
          className="w-full p-3 mb-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500"
          placeholder="Player 1 Name"
          onChange={(e) => setP1(e.target.value)}
        />

        <input
          className="w-full p-3 mb-6 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500"
          placeholder="Player 2 Name"
          onChange={(e) => setP2(e.target.value)}
        />

        <Button onClick={start}>Start Adventure</Button>
      </div>
    </main>
  )
}