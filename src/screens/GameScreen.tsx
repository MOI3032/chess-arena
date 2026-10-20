import React, { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ChessBoard } from '@/components/board/ChessBoard'
import { PlayerPanel } from '@/components/game/PlayerPanel'
import { MoveHistory } from '@/components/game/MoveHistory'
import { GameControls } from '@/components/game/GameControls'
import { GameResultModal } from '@/components/game/GameResultModal'
import { useTimer } from '@/hooks/useTimer'
import { isGameOver, getMaterialAdvantage } from '@/utils/gameUtils'

export function GameScreen() {
  const { game, navigate } = useGameStore()
  const { white, black, setup, status, activeColor, isCheck, moves } = game

  // Start timer
  useTimer()

  // If no game, redirect to home
  useEffect(() => {
    if (status === 'idle') {
      navigate('home')
    }
  }, [status, navigate])

  if (status === 'idle') return null

  // Determine display order based on orientation
  const isWhiteBottom = setup.boardOrientation === 'w'
  const topPlayer = isWhiteBottom ? black : white
  const bottomPlayer = isWhiteBottom ? white : black

  const whiteMaterialDiff = getMaterialAdvantage(white.capturedPieces, black.capturedPieces)

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 overflow-hidden">

      {/* ── Mobile: top player ── */}
      <div className="lg:hidden">
        <PlayerPanel
          player={topPlayer}
          isActive={activeColor === topPlayer.color}
          isTop
          timeControlMinutes={setup.timeControl.minutes}
          capturedByOpponent={topPlayer.color === 'w' ? black.capturedPieces : white.capturedPieces}
          materialDiff={topPlayer.color === 'w' ? whiteMaterialDiff : -whiteMaterialDiff}
        />
      </div>

      {/* ── Board area ── */}
      <div className="flex flex-col justify-center items-center flex-1 min-w-0">
        {/* Desktop: top player */}
        <div className="hidden lg:block w-full max-w-2xl mb-3">
          <PlayerPanel
            player={topPlayer}
            isActive={activeColor === topPlayer.color}
            isTop
            timeControlMinutes={setup.timeControl.minutes}
            capturedByOpponent={topPlayer.color === 'w' ? black.capturedPieces : white.capturedPieces}
            materialDiff={topPlayer.color === 'w' ? whiteMaterialDiff : -whiteMaterialDiff}
          />
        </div>

        {/* Check indicator */}
        {isCheck && !isGameOver(status) && (
          <div className="mb-2 px-4 py-1.5 bg-ca-red/20 border border-ca-red/40 rounded-full flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-ca-red animate-pulse" />
            <span className="text-ca-red text-sm font-medium">Échec !</span>
          </div>
        )}

        {/* Pause overlay */}
        {status === 'paused' && (
          <div className="mb-2 px-4 py-1.5 bg-ca-accent/20 border border-ca-accent/40 rounded-full">
            <span className="text-ca-accent text-sm font-medium">⏸ Partie en pause</span>
          </div>
        )}

        {/* The board */}
        <div className="w-full max-w-2xl">
          <ChessBoard />
        </div>

        {/* Desktop: bottom player */}
        <div className="hidden lg:block w-full max-w-2xl mt-3">
          <PlayerPanel
            player={bottomPlayer}
            isActive={activeColor === bottomPlayer.color}
            timeControlMinutes={setup.timeControl.minutes}
            capturedByOpponent={bottomPlayer.color === 'w' ? black.capturedPieces : white.capturedPieces}
            materialDiff={bottomPlayer.color === 'w' ? whiteMaterialDiff : -whiteMaterialDiff}
          />
        </div>
      </div>

      {/* ── Mobile: bottom player ── */}
      <div className="lg:hidden">
        <PlayerPanel
          player={bottomPlayer}
          isActive={activeColor === bottomPlayer.color}
          timeControlMinutes={setup.timeControl.minutes}
          capturedByOpponent={bottomPlayer.color === 'w' ? black.capturedPieces : white.capturedPieces}
          materialDiff={bottomPlayer.color === 'w' ? whiteMaterialDiff : -whiteMaterialDiff}
        />
      </div>

      {/* ── Right panel (desktop) / Bottom panel (mobile) ── */}
      <div className="flex flex-col lg:w-72 xl:w-80 shrink-0 bg-ca-panel rounded-xl border border-ca-border overflow-hidden">
        {/* Game info header */}
        <div className="px-4 py-3 border-b border-ca-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ca-green animate-pulse" style={{ display: status === 'playing' ? undefined : 'none' }} />
            <span className="text-ca-text-secondary text-xs font-semibold uppercase tracking-wider">
              {status === 'playing' ? 'Partie en cours' :
               status === 'paused' ? 'En pause' :
               isGameOver(status) ? 'Partie terminée' : 'En attente'}
            </span>
          </div>
          <span className="text-ca-text-secondary text-xs">
            {setup.timeControl.minutes > 0 ? setup.timeControl.label : 'Sans limite'}
          </span>
        </div>

        {/* Move history */}
        <div className="flex-1 min-h-0">
          <MoveHistory />
        </div>

        {/* Divider */}
        <div className="border-t border-ca-border" />

        {/* Controls */}
        <GameControls />
      </div>

      {/* Game over modal */}
      <GameResultModal />
    </div>
  )
}
