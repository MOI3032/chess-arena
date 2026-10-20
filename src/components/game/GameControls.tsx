import React, { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'

export function GameControls() {
  const { game, resign, offerDraw, acceptDraw, declineDraw, togglePause, flipBoard, navigate, resetGame } = useGameStore()
  const { status, activeColor, drawOfferedBy, setup } = game

  const [showResignConfirm, setShowResignConfirm] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showDrawOffer, setShowDrawOffer] = useState(false)

  const isPlaying = status === 'playing'
  const isPaused = status === 'paused'
  const isActive = isPlaying || isPaused
  const isGameOver = !isActive && status !== 'idle'

  // Draw offer from opponent
  const incomingDrawOffer = drawOfferedBy && drawOfferedBy !== activeColor && isPlaying

  const handleResign = () => {
    setShowResignConfirm(false)
    resign(activeColor)
  }

  const handleOfferDraw = () => {
    setShowDrawOffer(false)
    offerDraw(activeColor)
  }

  const handleQuit = () => {
    setShowQuitConfirm(false)
    resetGame()
  }

  return (
    <>
      <div className="flex flex-col gap-2 px-4 py-3">
        {/* Game active controls */}
        {isActive && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePause}
              fullWidth
            >
              <span className="mr-2">{isPaused ? '▶' : '⏸'}</span>
              {isPaused ? 'Reprendre' : 'Pause'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={flipBoard}
              fullWidth
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Retourner l'échiquier
            </Button>

            {isPlaying && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (drawOfferedBy === activeColor) return
                    setShowDrawOffer(true)
                  }}
                  disabled={drawOfferedBy === activeColor}
                  fullWidth
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Proposer nulle
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowResignConfirm(true)}
                  fullWidth
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l1.65-3.8a9 9 0 111.414 1.414L3 21z" />
                  </svg>
                  Abandonner
                </Button>
              </>
            )}
          </>
        )}

        {/* Post-game controls */}
        {(isGameOver || !isActive) && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('setup')}
              fullWidth
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle partie
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('history')}
              fullWidth
            >
              Historique
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuitConfirm(true)}
          fullWidth
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Quitter
        </Button>
      </div>

      {/* Resign confirm */}
      <ConfirmDialog
        isOpen={showResignConfirm}
        title="Abandonner la partie"
        message={`Voulez-vous vraiment abandonner ? ${activeColor === 'w' ? setup.playerBlackName : setup.playerWhiteName} remportera la partie.`}
        confirmLabel="Abandonner"
        variant="danger"
        onConfirm={handleResign}
        onCancel={() => setShowResignConfirm(false)}
      />

      {/* Quit confirm */}
      <ConfirmDialog
        isOpen={showQuitConfirm}
        title="Quitter la partie"
        message="La partie sera sauvegardée. Voulez-vous quitter ?"
        confirmLabel="Quitter"
        variant="danger"
        onConfirm={handleQuit}
        onCancel={() => setShowQuitConfirm(false)}
      />

      {/* Draw offer confirm */}
      <Modal isOpen={showDrawOffer} onClose={() => setShowDrawOffer(false)} title="Proposer la nulle" size="sm">
        <p className="text-ca-text-secondary mb-6">
          Voulez-vous proposer la nulle à votre adversaire ?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDrawOffer(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleOfferDraw}>Proposer</Button>
        </div>
      </Modal>

      {/* Incoming draw offer */}
      {incomingDrawOffer && (
        <div className="mx-4 mb-3 p-3 bg-ca-accent/20 border border-ca-accent/40 rounded-xl">
          <p className="text-ca-text-primary text-sm font-medium mb-3">
            {drawOfferedBy === 'w' ? setup.playerWhiteName : setup.playerBlackName} propose la nulle
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={acceptDraw} fullWidth>Accepter</Button>
            <Button variant="ghost" size="sm" onClick={declineDraw} fullWidth>Refuser</Button>
          </div>
        </div>
      )}

      {/* Draw offered indicator */}
      {drawOfferedBy === activeColor && (
        <div className="mx-4 mb-3 p-3 bg-ca-panel-light rounded-xl">
          <p className="text-ca-text-secondary text-xs text-center">Nulle proposée — en attente de réponse</p>
        </div>
      )}
    </>
  )
}
