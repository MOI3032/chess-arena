import React from 'react'
import type { Color, PlayerState } from '@/types'
import { formatTime, formatTimePrecise } from '@/utils/gameUtils'

interface PlayerPanelProps {
  player: PlayerState
  isActive: boolean
  isTop?: boolean
  timeControlMinutes: number
  capturedByOpponent: string[] // pieces taken from this player
  materialDiff: number // positive = this player is ahead
}

const PIECE_ORDER = ['q', 'r', 'b', 'n', 'p']
const PIECE_UNICODE: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
}

function groupPieces(pieces: string[]): Record<string, number> {
  return pieces.reduce((acc, p) => {
    acc[p.toLowerCase()] = (acc[p.toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function PlayerPanel({ player, isActive, isTop = false, timeControlMinutes, capturedByOpponent, materialDiff }: PlayerPanelProps) {
  const isTimedGame = timeControlMinutes > 0
  const isLowTime = isTimedGame && player.timeMs < 30000 && player.timeMs !== Infinity
  const isCriticalTime = isTimedGame && player.timeMs < 10000 && player.timeMs !== Infinity

  const timeDisplay = isTimedGame
    ? (player.timeMs < 10000 ? formatTimePrecise(player.timeMs) : formatTime(player.timeMs))
    : null

  const capturedGroups = groupPieces(capturedByOpponent)

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${isActive
        ? 'bg-ca-panel-light border border-ca-green/40'
        : 'bg-ca-panel border border-transparent'
      }
    `}>
      {/* Color indicator */}
      <div className={`
        w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center
        ${player.color === 'w'
          ? 'bg-white border-gray-300'
          : 'bg-ca-bg-dark border-gray-600'
        }
      `}>
        {isActive && (
          <div className="w-2.5 h-2.5 rounded-full bg-ca-green animate-pulse" />
        )}
      </div>

      {/* Name + captured pieces */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-ca-text-primary font-semibold text-sm truncate">
            {player.name}
          </span>
          {materialDiff > 0 && (
            <span className="text-ca-text-secondary text-xs">+{materialDiff}</span>
          )}
        </div>
        {capturedByOpponent.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {PIECE_ORDER.map(p => {
              const count = capturedGroups[p] || 0
              if (!count) return null
              return Array.from({ length: count }).map((_, i) => (
                <span key={`${p}-${i}`} className="text-sm text-ca-text-secondary leading-none">
                  {PIECE_UNICODE[p]}
                </span>
              ))
            })}
          </div>
        )}
      </div>

      {/* Timer */}
      {isTimedGame && (
        <div className={`
          px-3 py-1.5 rounded-lg font-mono font-bold text-lg tabular-nums shrink-0 min-w-[80px] text-center
          transition-all duration-150
          ${isActive
            ? isCriticalTime
              ? 'bg-ca-red text-white animate-pulse-check'
              : isLowTime
                ? 'bg-ca-red/20 text-ca-red'
                : 'bg-ca-green/20 text-ca-green'
            : 'bg-ca-bg-dark text-ca-text-secondary'
          }
        `}>
          {timeDisplay}
        </div>
      )}
    </div>
  )
}
