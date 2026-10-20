import React from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'
import { loadActiveGame, loadSavedGames } from '@/utils/gameUtils'

export function HomeScreen() {
  const { navigate, resumeGame } = useGameStore()

  const activeGame = loadActiveGame()
  const hasResumableGame = activeGame?.status === 'playing' || activeGame?.status === 'paused'
  const savedGames = loadSavedGames()

  const handleResume = () => {
    if (resumeGame()) {
      navigate('game')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-ca-green rounded-2xl flex items-center justify-center shadow-panel">
            <span className="text-white text-4xl">♞</span>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-ca-text-primary tracking-tight">Chess Arena</h1>
            <p className="text-ca-text-secondary text-sm">Plateforme d'échecs locale</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-ca-text-secondary max-w-md mx-auto leading-relaxed">
          Jouez aux échecs à deux sur le même appareil.
          <br />
          Toutes les règles officielles, interface professionnelle.
        </p>

        {/* Two players indicator */}
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-ca-panel rounded-xl border border-ca-border">
          <span className="w-5 h-5 bg-white rounded-full border border-gray-300 shrink-0" />
          <span className="text-ca-text-secondary text-sm">vs</span>
          <span className="w-5 h-5 bg-ca-bg-dark rounded-full border border-gray-600 shrink-0" />
          <span className="text-ca-text-secondary text-sm ml-1">2 joueurs sur le même appareil</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('setup')}
          className="text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
          Jouer en local
        </Button>

        {hasResumableGame && (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleResume}
            className="text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reprendre la partie
          </Button>
        )}

        {savedGames.length > 0 && (
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => navigate('history')}
            className="text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Historique des parties
            <span className="ml-auto bg-ca-panel-light text-ca-text-secondary text-xs px-2 py-0.5 rounded-full">
              {savedGames.length}
            </span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => navigate('settings')}
          className="text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Paramètres
        </Button>
      </div>

      {/* Mini board decoration */}
      <div className="mt-16 grid grid-cols-4 gap-0.5 opacity-20 pointer-events-none select-none" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 ${(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-ca-green' : 'bg-ca-panel'} rounded-sm`}
          />
        ))}
      </div>
    </div>
  )
}
