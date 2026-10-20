import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

/**
 * Robust timer hook using requestAnimationFrame + visibility API.
 * Prevents drift caused by browser throttling in background tabs.
 */
export function useTimer() {
  const { game, tick } = useGameStore()
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (game.status !== 'playing' || game.setup.timeControl.minutes === 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const loop = (timestamp: number) => {
      // Throttle to ~100ms intervals for display accuracy
      if (timestamp - lastTimeRef.current >= 100) {
        tick()
        lastTimeRef.current = timestamp
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [game.status, game.setup.timeControl.minutes, tick])

  // Handle visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && game.status === 'playing') {
        // Force a tick to catch up on elapsed time
        tick()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [game.status, tick])
}
