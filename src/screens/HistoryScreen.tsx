import React, { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { loadSavedGames, deleteGame } from '@/utils/gameUtils'
import type { SavedGame } from '@/types'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDuration(start: number, end: number | null): string {
  if (!end) return '—'
  const ms = end - start
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}min ${s}s`
}

function getStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    checkmate: { label: 'Échec et mat', color: 'text-ca-green' },
    stalemate: { label: 'Pat', color: 'text-ca-accent' },
    draw_insufficient: { label: 'Matériel insuf.', color: 'text-ca-accent' },
    draw_repetition: { label: 'Répétition', color: 'text-ca-accent' },
    draw_fifty_moves: { label: '50 coups', color: 'text-ca-accent' },
    draw_agreement: { label: 'Accord mutuel', color: 'text-ca-accent' },
    resigned_white: { label: 'Blancs abandonnent', color: 'text-ca-red' },
    resigned_black: { label: 'Noirs abandonnent', color: 'text-ca-red' },
    timeout_white: { label: 'Blancs hors temps', color: 'text-ca-red' },
    timeout_black: { label: 'Noirs hors temps', color: 'text-ca-red' },
  }
  return map[status] ?? { label: status, color: 'text-ca-text-secondary' }
}

export function HistoryScreen() {
  const { navigate } = useGameStore()
  const [games, setGames] = useState<SavedGame[]>(loadSavedGames)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [clearAll, setClearAll] = useState(false)

  const handleDelete = (id: string) => {
    deleteGame(id)
    setGames(loadSavedGames())
    setDeleteTarget(null)
  }

  const handleClearAll = () => {
    games.forEach(g => deleteGame(g.id))
    setGames([])
    setClearAll(false)
  }

  return (
    <div className="flex flex-col min-h-full px-4 py-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-ca-text-secondary hover:text-ca-text-primary transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl font-bold text-ca-text-primary">Historique</h1>
          <p className="text-ca-text-secondary text-sm mt-1">
            {games.length} partie{games.length !== 1 ? 's' : ''} enregistrée{games.length !== 1 ? 's' : ''}
          </p>
        </div>
        {games.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setClearAll(true)}>
            Tout effacer
          </Button>
        )}
      </div>

      {/* Empty state */}
      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <div className="text-6xl mb-4 opacity-30">♟</div>
          <p className="text-ca-text-secondary text-lg font-medium">Aucune partie enregistrée</p>
          <p className="text-ca-text-secondary text-sm mt-2">Jouez votre première partie !</p>
          <Button variant="primary" className="mt-6" onClick={() => navigate('setup')}>
            Commencer
          </Button>
        </div>
      )}

      {/* Game list */}
      <div className="space-y-3">
        {games.map(game => {
          const { label, color } = getStatusLabel(game.status)
          const isDraw = game.result === '½-½'
          const whiteWon = game.result === '1-0'
          const blackWon = game.result === '0-1'

          return (
            <div
              key={game.id}
              className="bg-ca-panel border border-ca-border rounded-xl p-4 hover:border-ca-green/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Players & result */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* White */}
                    <div className={`flex items-center gap-2 ${whiteWon ? 'text-ca-text-primary font-semibold' : 'text-ca-text-secondary'}`}>
                      <span className="w-4 h-4 rounded-full bg-white border border-gray-300 shrink-0" />
                      <span className="truncate">{game.setup.playerWhiteName}</span>
                    </div>

                    {/* Score */}
                    <div className="text-ca-text-secondary font-mono text-sm shrink-0 bg-ca-panel-light px-2 py-0.5 rounded-lg">
                      {game.result}
                    </div>

                    {/* Black */}
                    <div className={`flex items-center gap-2 ${blackWon ? 'text-ca-text-primary font-semibold' : 'text-ca-text-secondary'}`}>
                      <span className="w-4 h-4 rounded-full bg-ca-bg-dark border border-gray-600 shrink-0" />
                      <span className="truncate">{game.setup.playerBlackName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-ca-text-secondary">
                    <span className={color}>{label}</span>
                    <span>•</span>
                    <span>{game.moves.length} coups</span>
                    <span>•</span>
                    <span>{game.setup.timeControl.label}</span>
                    <span>•</span>
                    <span>{getDuration(game.startedAt, game.endedAt)}</span>
                  </div>
                  <div className="text-xs text-ca-text-secondary mt-1">
                    {formatDate(game.startedAt)}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setDeleteTarget(game.id)}
                  className="text-ca-text-secondary hover:text-ca-red transition-colors p-1.5 rounded-lg hover:bg-ca-red/10 shrink-0"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirm delete single */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Supprimer la partie"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm clear all */}
      <ConfirmDialog
        isOpen={clearAll}
        title="Effacer tout l'historique"
        message="Toutes les parties enregistrées seront définitivement supprimées."
        confirmLabel="Tout effacer"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setClearAll(false)}
      />
    </div>
  )
}
