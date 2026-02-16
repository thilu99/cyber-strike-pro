'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export const usePlayerStats = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [stats, setStats] = useState({
    totalWords: 0,
    experience: 0,
    rank: 'Junior Associate'
  })

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('player_progress')
        .select('total_words_found, experience_points')
        .eq('id', user.id)
        .single()

      if (data) {
        // Dynamic rank calculation
        let currentRank = 'DevOps Junior'
        if (data.experience_points > 500) currentRank = 'Cloud Architect'
        if (data.experience_points > 1500) currentRank = 'SRE Master'

        setStats({
          totalWords: data.total_words_found || 0,
          experience: data.experience_points || 0,
          rank: currentRank
        })
      }
    }
  }, [supabase])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, refreshStats: fetchStats }
}