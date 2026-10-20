import React from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'
import { getGameOverMessage, isGameOver } from '@/utils/gameUtils'
import { getChessInstance } from '@/store/gameStore'

export function GameResultModal() {
  const { game, navigate, navigate: nav, resetGame, startGame } = useGameStore()
  const { status, setup, moves } = game

  if (!isGameOver(status)) return null

  const chess = getChessInstance()
  let { title, subtitle, winner } = getGameOverMessage(status, setup.playerWhiteName, setup.playerBlackName)

  // For checkmate: determine who checkmated whom
  if (status === 'checkmate') {
    const loserColor = chess.turn()
    const winnerColor = loserColor === 'w' ? 'b' : 'w'
    const winnerName = winnerColor === 'w' ? setup.playerWhiteName : setup.playerBlackName
    title = `${winnerName} gagne !`
    subtitle = 'Échec et mat'
    winner = winnerColor
  }

  const handleRematch = () => {
    startGame({
      ...setup,
      playerWhiteName: setup.playerBlackName,
      playerBlackName: setup.playerWhiteName,
      boardOrientation: setup.boardOrientation === 'w' ? 'b' : 'w',
    })
  }

  const winnerEmoji = winner === 'draw' ? '🤝' : winner === 'w' ? '⬜' : '⬛'
  const resultColor = winner === 'draw' ? 'text-ca-accent' : winner ? 'text-ca-green' : 'text-ca-text-primary'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" />
      <div className="relative z-10 w-full max-w-sm bg-ca-panel rounded-2xl shadow-panel animate-slide-up overflow-hidden">

        {/* Header band */}
        <div className={`
          px-6 py-8 text-center
          ${winner === 'draw' ? 'bg-ca-accent/10' : winner ? 'bg-ca-green/10' : 'bg-ca-red/10'}
        `}>
          <div className="text-5xl mb-3">{winnerEmoji}</div>
          <h2 className={`text-2xl font-bold ${resultColor}`}>{title}</h2>
          <p className="text-ca-text-secondary mt-1">{subtitle}</p>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 border-t border-ca-border">
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="text-ca-text-secondary text-xs mb-1">Coups joués</div>
              <div className="text-ca-text-primary font-semibold">{moves.length}</div>
            </div>
            <div className="text-center">
              <div className="text-ca-text-secondary text-xs mb-1">Blancs</div>
              <div className="text-ca-text-primary font-semibold">{setup.playerWhiteName}</div>
            </div>
            <div className="text-center">
              <div className="text-ca-text-secondary text-xs mb-1">Noirs</div>
              <div className="text-ca-text-primary font-semibold">{setup.playerBlackName}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => navigate('setup')}>
            Nouvelle partie
          </Button>
          <Button variant="secondary" fullWidth onClick={handleRematch}>
            Revanche
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('history')}>
            Voir l'historique
          </Button>
        </div>
      </div>
    </div>
  )
}
