'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Leaderboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from('leaderboard').select('*')
      if (data) setEntries(data)
    }
    fetchLeaderboard()
  }, [supabase])

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-yellow-400">Global Rankings</h3>
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-white/20 w-4">{i + 1}</span>
              <span className="font-bold text-sm truncate max-w-[120px]">{entry.username || 'Anonymous'}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-blue-400">{entry.total_score} PTS</p>
              <p className="text-[10px] uppercase text-white/30">Lvl {entry.current_level}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}