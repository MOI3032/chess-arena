import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { HomeScreen } from '@/screens/HomeScreen'
import { GameSetupScreen } from '@/screens/GameSetupScreen'
import { GameScreen } from '@/screens/GameScreen'
import { HistoryScreen } from '@/screens/HistoryScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'

export default function App() {
  const { currentScreen, settings } = useGameStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.theme])

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':      return <HomeScreen />
      case 'setup':     return <GameSetupScreen />
      case 'game':      return <GameScreen />
      case 'history':   return <HistoryScreen />
      case 'settings':  return <SettingsScreen />
      default:          return <HomeScreen />
    }
  }

  return (
    <div className="flex h-screen bg-ca-bg-dark text-ca-text-primary overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-ca-panel border-b border-ca-border sticky top-0 z-40">
          <div className="w-7 h-7 bg-ca-green rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">♞</span>
          </div>
          <span className="text-ca-text-primary font-bold">Chess Arena</span>
        </div>

        {/* Screen content */}
        <div className="h-full min-h-0">
          {renderScreen()}
        </div>

        {/* Mobile bottom navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-ca-panel border-t border-ca-border z-40">
          <MobileNav />
        </div>
      </main>
    </div>
  )
}

function MobileNav() {
  const { currentScreen, navigate, game, resumeGame } = useGameStore()
  const isInGame = game.status === 'playing' || game.status === 'paused'

  const items = [
    { id: 'home' as const, icon: '🏠', label: 'Accueil' },
    { id: 'setup' as const, icon: '♟', label: 'Jouer' },
    { id: 'game' as const, icon: '▶', label: 'Partie', disabled: !isInGame },
    { id: 'history' as const, icon: '📋', label: 'Historique' },
    { id: 'settings' as const, icon: '⚙', label: 'Options' },
  ]

  return (
    <nav className="flex">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => {
            if (item.disabled) return
            if (item.id === 'game' && !isInGame) {
              resumeGame()
            } else {
              navigate(item.id)
            }
          }}
          disabled={item.disabled}
          className={`
            flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors
            ${currentScreen === item.id ? 'text-ca-green' : item.disabled ? 'text-ca-text-secondary/30' : 'text-ca-text-secondary'}
          `}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
