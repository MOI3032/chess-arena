import React, { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { loadActiveGame } from '@/utils/gameUtils'

type Screen = 'home' | 'setup' | 'game' | 'history' | 'settings' | 'analysis'

interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
  disabled?: boolean
  badge?: string
}

function ChessKnightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M19 22H5v-2h14v2M13 2V2C11 2 10 3 10 5H7a2 2 0 00-2 2c0 1.17.55 2.2 1.41 2.85L8 16h8l1.59-6.15A3 3 0 0019 7a2 2 0 00-2-2h-3c0-1.7-1.34-3-3-3z"/>
    </svg>
  )
}

const icons = {
  home: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  play: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
    </svg>
  ),
  resume: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { currentScreen, navigate, game } = useGameStore()
  const hasActiveGame = loadActiveGame()?.status === 'playing' || loadActiveGame()?.status === 'paused'
  const isInGame = game.status === 'playing' || game.status === 'paused'

  const navItems: NavItem[] = [
    { id: 'home', label: 'Accueil', icon: icons.home },
    { id: 'setup', label: 'Nouvelle partie', icon: icons.play },
    {
      id: 'game',
      label: 'Reprendre',
      icon: icons.resume,
      disabled: !isInGame && !hasActiveGame,
    },
    { id: 'history', label: 'Historique', icon: icons.history },
    { id: 'settings', label: 'Paramètres', icon: icons.settings },
  ]

  const handleNav = (item: NavItem) => {
    if (item.disabled) return
    if (item.id === 'game' && !isInGame) {
      // Try to resume
      const { resumeGame } = useGameStore.getState()
      resumeGame()
    } else {
      navigate(item.id)
    }
  }

  return (
    <aside className={`
      flex flex-col bg-ca-panel border-r border-ca-border
      transition-all duration-300
      ${collapsed ? 'w-16' : 'w-56'}
      h-full shrink-0
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-ca-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-ca-green rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-lg">♞</span>
        </div>
        {!collapsed && (
          <span className="text-ca-text-primary font-bold text-lg tracking-tight">Chess Arena</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            disabled={item.disabled}
            title={collapsed ? item.label : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150
              ${currentScreen === item.id
                ? 'bg-ca-green/20 text-ca-green'
                : item.disabled
                  ? 'text-ca-text-secondary/40 cursor-not-allowed'
                  : 'text-ca-text-secondary hover:text-ca-text-primary hover:bg-white/5'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-ca-green text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle button */}
      <div className="p-2 border-t border-ca-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-ca-text-secondary hover:text-ca-text-primary hover:bg-white/5 transition-all"
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
