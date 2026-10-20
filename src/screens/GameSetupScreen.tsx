import React, { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'
import type { GameSetup, TimeControl, BoardTheme } from '@/types'
import { TIME_CONTROLS, BOARD_THEMES } from '@/types'

export function GameSetupScreen() {
  const { navigate, startGame, settings } = useGameStore()

  const currentBoardTheme = BOARD_THEMES.find(t => t.id === settings.boardThemeId) ?? BOARD_THEMES[4]

  const [form, setForm] = useState<GameSetup>({
    playerWhiteName: 'Joueur 1',
    playerBlackName: 'Joueur 2',
    timeControl: TIME_CONTROLS[0],
    boardOrientation: 'w',
    boardTheme: currentBoardTheme,
    pieceTheme: 'cburnett',
  })

  const handleStart = () => {
    startGame(form)
  }

  const selectedTC = form.timeControl

  return (
    <div className="flex flex-col items-center justify-start min-h-full px-6 py-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="w-full mb-8">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-ca-text-secondary hover:text-ca-text-primary transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <h1 className="text-2xl font-bold text-ca-text-primary">Nouvelle partie</h1>
        <p className="text-ca-text-secondary mt-1">Configurez votre partie avant de commencer</p>
      </div>

      <div className="w-full space-y-6">
        {/* Players */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-4 flex items-center gap-2">
            <span>👥</span> Joueurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ca-text-secondary text-xs font-medium mb-2">
                ⬜ Blancs
              </label>
              <input
                type="text"
                value={form.playerWhiteName}
                onChange={e => setForm(f => ({ ...f, playerWhiteName: e.target.value }))}
                maxLength={20}
                placeholder="Joueur 1"
                className="w-full bg-ca-panel-light border border-ca-border rounded-xl px-4 py-2.5 text-ca-text-primary text-sm focus:outline-none focus:border-ca-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-ca-text-secondary text-xs font-medium mb-2">
                ⬛ Noirs
              </label>
              <input
                type="text"
                value={form.playerBlackName}
                onChange={e => setForm(f => ({ ...f, playerBlackName: e.target.value }))}
                maxLength={20}
                placeholder="Joueur 2"
                className="w-full bg-ca-panel-light border border-ca-border rounded-xl px-4 py-2.5 text-ca-text-primary text-sm focus:outline-none focus:border-ca-green transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Time control */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-4 flex items-center gap-2">
            <span>⏱</span> Contrôle du temps
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIME_CONTROLS.map(tc => (
              <button
                key={tc.label}
                onClick={() => setForm(f => ({ ...f, timeControl: tc }))}
                className={`
                  px-3 py-3 rounded-xl text-sm font-medium border transition-all text-left
                  ${form.timeControl.label === tc.label
                    ? 'bg-ca-green/20 border-ca-green text-ca-green'
                    : 'bg-ca-panel-light border-ca-border text-ca-text-secondary hover:text-ca-text-primary hover:border-ca-green/50'
                  }
                `}
              >
                <div className="font-semibold">{tc.label}</div>
                {tc.increment > 0 && (
                  <div className="text-xs opacity-70 mt-0.5">+{tc.increment}s/coup</div>
                )}
                {tc.minutes === 0 && (
                  <div className="text-xs opacity-70 mt-0.5">Pas de limite</div>
                )}
              </button>
            ))}
          </div>

          {selectedTC.minutes > 0 && (
            <div className="mt-4 p-3 bg-ca-panel-light rounded-xl border border-ca-border">
              <p className="text-ca-text-secondary text-xs">
                Cadence sélectionnée :{' '}
                <span className="text-ca-text-primary font-semibold">
                  {selectedTC.minutes} min{selectedTC.increment > 0 ? ` + ${selectedTC.increment}s` : ''}
                </span>
                {' '}par joueur
              </p>
            </div>
          )}
        </section>

        {/* Board settings */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-4 flex items-center gap-2">
            <span>♟</span> Échiquier
          </h2>

          {/* Orientation */}
          <div className="mb-4">
            <label className="block text-ca-text-secondary text-xs font-medium mb-2">
              Orientation initiale
            </label>
            <div className="flex gap-2">
              {[
                { value: 'w', label: '⬜ Blancs en bas' },
                { value: 'b', label: '⬛ Noirs en bas' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, boardOrientation: opt.value as 'w' | 'b' }))}
                  className={`
                    flex-1 px-3 py-2 rounded-xl text-sm border transition-all
                    ${form.boardOrientation === opt.value
                      ? 'bg-ca-green/20 border-ca-green text-ca-green'
                      : 'bg-ca-panel-light border-ca-border text-ca-text-secondary hover:text-ca-text-primary'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Board theme */}
          <div>
            <label className="block text-ca-text-secondary text-xs font-medium mb-2">
              Thème du plateau
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {BOARD_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setForm(f => ({ ...f, boardTheme: theme }))}
                  title={theme.label}
                  className={`
                    flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all
                    ${form.boardTheme.id === theme.id
                      ? 'border-ca-green bg-ca-green/10'
                      : 'border-ca-border hover:border-ca-green/50'
                    }
                  `}
                >
                  {/* Mini board preview */}
                  <div className="grid grid-cols-4 gap-0.5 w-10 h-10">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: (Math.floor(i / 4) + i) % 2 === 0 ? theme.light : theme.dark
                        }}
                        className="rounded-sm"
                      />
                    ))}
                  </div>
                  <span className="text-ca-text-secondary text-xs">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Start button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStart}
          className="text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
          Démarrer la partie
        </Button>
      </div>
    </div>
  )
}
