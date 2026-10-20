import React from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-ca-text-primary text-sm font-medium">{label}</div>
        {description && <div className="text-ca-text-secondary text-xs mt-0.5">{description}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ca-green focus:ring-offset-2 focus:ring-offset-ca-panel
          ${checked ? 'bg-ca-green' : 'bg-ca-panel-light'}
        `}
      >
        <span className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </button>
    </div>
  )
}

export function SettingsScreen() {
  const { navigate, settings, updateSettings } = useGameStore()

  return (
    <div className="flex flex-col min-h-full px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-ca-text-secondary hover:text-ca-text-primary transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <h1 className="text-2xl font-bold text-ca-text-primary">Paramètres</h1>
        <p className="text-ca-text-secondary text-sm mt-1">Personnalisez votre expérience de jeu</p>
      </div>

      <div className="space-y-4">

        {/* Appearance */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-1">Apparence</h2>
          <p className="text-ca-text-secondary text-xs mb-4">Thème et affichage</p>
          <div className="divide-y divide-ca-border">
            <div className="py-3">
              <div className="text-ca-text-primary text-sm font-medium mb-2">Thème</div>
              <div className="flex gap-2">
                {([
                  { value: 'dark', label: '🌙 Sombre' },
                  { value: 'light', label: '☀️ Clair' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ theme: opt.value })}
                    className={`
                      px-4 py-2 rounded-xl text-sm border transition-all
                      ${settings.theme === opt.value
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
          </div>
        </section>

        {/* Board */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-1">Échiquier</h2>
          <p className="text-ca-text-secondary text-xs mb-4">Options d'affichage du plateau</p>
          <div className="divide-y divide-ca-border">
            <Toggle
              checked={settings.showCoordinates}
              onChange={v => updateSettings({ showCoordinates: v })}
              label="Coordonnées"
              description="Afficher les lettres et chiffres autour du plateau"
            />
            <Toggle
              checked={settings.showLegalMoves}
              onChange={v => updateSettings({ showLegalMoves: v })}
              label="Mouvements légaux"
              description="Afficher les cases accessibles après sélection d'une pièce"
            />
            <Toggle
              checked={settings.highlightLastMove}
              onChange={v => updateSettings({ highlightLastMove: v })}
              label="Dernier coup"
              description="Surbrillance des cases du dernier mouvement joué"
            />
            <Toggle
              checked={settings.animatePieces}
              onChange={v => updateSettings({ animatePieces: v })}
              label="Animations"
              description="Animer le déplacement des pièces"
            />
          </div>
        </section>

        {/* Gameplay */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-1">Jeu</h2>
          <p className="text-ca-text-secondary text-xs mb-4">Comportement pendant la partie</p>
          <div className="divide-y divide-ca-border">
            <Toggle
              checked={settings.autoPromoteToQueen}
              onChange={v => updateSettings({ autoPromoteToQueen: v })}
              label="Promotion automatique en dame"
              description="Ne pas afficher la sélection de pièce lors d'une promotion"
            />
          </div>
        </section>

        {/* About */}
        <section className="bg-ca-panel rounded-xl p-5 border border-ca-border">
          <h2 className="text-ca-text-primary font-semibold mb-3">À propos</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ca-text-secondary">Application</span>
              <span className="text-ca-text-primary font-medium">Chess Arena</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ca-text-secondary">Version</span>
              <span className="text-ca-text-primary">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ca-text-secondary">Moteur</span>
              <span className="text-ca-text-primary">chess.js</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ca-text-secondary">Mode</span>
              <span className="text-ca-text-primary">Local — 2 joueurs</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
