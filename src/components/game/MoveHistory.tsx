import React, { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { groupMovesByNumber } from '@/utils/gameUtils'

export function MoveHistory() {
  const { game, navigateToMove, navigateFirst, navigatePrev, navigateNext, navigateLast } = useGameStore()
  const { moves, viewingMoveIndex, currentMoveIndex, status } = game
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const pairs = groupMovesByNumber(moves)

  // Auto-scroll to last move during active game
  useEffect(() => {
    if (viewingMoveIndex === currentMoveIndex && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [moves.length, viewingMoveIndex, currentMoveIndex])

  const getMoveIndex = (pairIdx: number, isBlack: boolean): number => {
    return pairIdx * 2 + (isBlack ? 1 : 0)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ca-border">
        <span className="text-ca-text-secondary text-xs font-semibold uppercase tracking-wider">Coups</span>
        <span className="text-ca-text-secondary text-xs">{moves.length} coup{moves.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Move list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 min-h-0">
        {pairs.length === 0 ? (
          <p className="text-ca-text-secondary text-sm text-center py-8">
            La partie n'a pas encore commencé
          </p>
        ) : (
          pairs.map((pair, pairIdx) => (
            <div key={pair.moveNumber} className="flex items-center gap-1">
              {/* Move number */}
              <span className="text-ca-text-secondary text-xs w-7 shrink-0 text-right font-mono">
                {pair.moveNumber}.
              </span>

              {/* White move */}
              {pair.white && (() => {
                const idx = getMoveIndex(pairIdx, false)
                const isViewed = idx === viewingMoveIndex
                return (
                  <button
                    ref={isViewed ? activeRef : undefined}
                    onClick={() => navigateToMove(idx)}
                    className={`
                      flex-1 px-2 py-1 rounded-lg text-sm font-mono text-left transition-all
                      ${isViewed
                        ? 'bg-ca-green/30 text-ca-green font-semibold'
                        : 'text-ca-text-primary hover:bg-white/10'
                      }
                    `}
                  >
                    {pair.white.san}
                  </button>
                )
              })()}
              {!pair.white && <div className="flex-1" />}

              {/* Black move */}
              {pair.black && (() => {
                const idx = getMoveIndex(pairIdx, true)
                const isViewed = idx === viewingMoveIndex
                return (
                  <button
                    ref={isViewed ? activeRef : undefined}
                    onClick={() => navigateToMove(idx)}
                    className={`
                      flex-1 px-2 py-1 rounded-lg text-sm font-mono text-left transition-all
                      ${isViewed
                        ? 'bg-ca-green/30 text-ca-green font-semibold'
                        : 'text-ca-text-primary hover:bg-white/10'
                      }
                    `}
                  >
                    {pair.black.san}
                  </button>
                )
              })()}
              {!pair.black && <div className="flex-1" />}
            </div>
          ))
        )}

        {/* Result annotation */}
        {status !== 'idle' && status !== 'playing' && status !== 'paused' && moves.length > 0 && (
          <div className="text-center text-ca-text-secondary text-xs py-2 font-mono">
            {status === 'checkmate'
              ? (moves[moves.length - 1]?.color === 'w' ? '1-0' : '0-1')
              : status === 'resigned_white' || status === 'timeout_white' ? '0-1'
              : status === 'resigned_black' || status === 'timeout_black' ? '1-0'
              : '½-½'
            }
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-ca-border">
        {[
          { label: '⏮', title: 'Premier coup', action: navigateFirst },
          { label: '◀', title: 'Coup précédent', action: navigatePrev },
          { label: '▶', title: 'Coup suivant', action: navigateNext },
          { label: '⏭', title: 'Dernier coup', action: navigateLast },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            disabled={moves.length === 0}
            className="px-3 py-2 rounded-lg text-ca-text-secondary hover:text-ca-text-primary hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
