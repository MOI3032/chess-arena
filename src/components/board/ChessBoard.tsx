import React, { useCallback, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from '@/types'
import { useGameStore } from '@/store/gameStore'
import { PromotionDialog } from './PromotionDialog'

export function ChessBoard() {
  const {
    game,
    settings,
    selectSquare,
    makeMove,
    confirmPromotion,
    cancelPromotion,
  } = useGameStore()

  const {
    setup,
    selectedSquare,
    legalMoves,
    lastMove,
    isCheck,
    promotionPending,
    viewingMoveIndex,
    currentMoveIndex,
    moves,
    activeColor,
    status,
    fen,
  } = game

  // The FEN to display (may differ from active fen when browsing history)
  const displayFen = useMemo(() => {
    if (viewingMoveIndex !== currentMoveIndex && viewingMoveIndex >= 0 && moves[viewingMoveIndex]) {
      return moves[viewingMoveIndex].fen
    }
    if (viewingMoveIndex === -1 && currentMoveIndex > -1) {
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    }
    return fen
  }, [viewingMoveIndex, currentMoveIndex, moves, fen])

  const isViewingHistory = viewingMoveIndex !== currentMoveIndex
  const isGameActive = status === 'playing' && !isViewingHistory

  // ── Custom square styles ──────────────────────────────────────────────────

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    // Highlight last move
    if (settings.highlightLastMove && lastMove && !isViewingHistory) {
      styles[lastMove.from] = { backgroundColor: 'rgba(129, 182, 76, 0.4)' }
      styles[lastMove.to] = { backgroundColor: 'rgba(129, 182, 76, 0.5)' }
    }

    // History view: highlight the viewed move
    if (isViewingHistory && viewingMoveIndex >= 0 && moves[viewingMoveIndex]) {
      const viewed = moves[viewingMoveIndex]
      styles[viewed.from] = { backgroundColor: 'rgba(129, 182, 76, 0.35)' }
      styles[viewed.to] = { backgroundColor: 'rgba(129, 182, 76, 0.45)' }
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(246, 212, 76, 0.55)',
        borderRadius: '4px',
      }
    }

    // Legal move dots (using radial gradient)
    if (settings.showLegalMoves) {
      for (const sq of legalMoves) {
        styles[sq] = {
          background: 'radial-gradient(circle, rgba(0,0,0,0.18) 30%, transparent 31%)',
          ...(styles[sq] || {}),
        }
      }
    }

    // Check highlight on king
    if (isCheck && !isViewingHistory) {
      const fenBoard = fen.split(' ')[0]
      const rows = fenBoard.split('/')
      const kingChar = activeColor === 'w' ? 'K' : 'k'
      let rank = 8
      for (const row of rows) {
        let file = 0
        for (const ch of row) {
          if (ch === kingChar) {
            const sq = `${String.fromCharCode(97 + file)}${rank}`
            styles[sq] = {
              background: 'radial-gradient(circle, rgba(224,82,82,0.85) 0%, rgba(224,82,82,0.3) 55%, transparent 72%)',
            }
          }
          if (isNaN(Number(ch))) file++
          else file += Number(ch)
        }
        rank--
      }
    }

    return styles
  }, [selectedSquare, legalMoves, lastMove, isViewingHistory, viewingMoveIndex, moves, settings, fen, isCheck, activeColor])

  // ── Event handlers ────────────────────────────────────────────────────────

  const onSquareClick = useCallback(({ square }: { square: string; piece: { pieceType: string } | null }) => {
    if (!isGameActive) return
    selectSquare(square as Square)
  }, [isGameActive, selectSquare])

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!isGameActive) return false
    if (!targetSquare) return false
    return makeMove(sourceSquare as Square, targetSquare as Square)
  }, [isGameActive, makeMove])

  const boardTheme = setup.boardTheme

  return (
    <div className="relative w-full">
      {/* History overlay indicator */}
      {isViewingHistory && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-ca-panel/90 backdrop-blur-sm text-ca-text-secondary text-xs px-3 py-1 rounded-full border border-ca-border pointer-events-none">
          Mode analyse
        </div>
      )}

      <Chessboard
        options={{
          id: 'chess-arena-board',
          position: displayFen,
          boardOrientation: setup.boardOrientation === 'w' ? 'white' : 'black',
          squareStyles,
          lightSquareStyle: { backgroundColor: boardTheme.light },
          darkSquareStyle: { backgroundColor: boardTheme.dark },
          showNotation: settings.showCoordinates,
          allowDragging: isGameActive,
          showAnimations: settings.animatePieces,
          animationDurationInMs: settings.animatePieces ? 150 : 0,
          boardStyle: {
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          onSquareClick,
          onPieceDrop,
        }}
      />

      {/* Promotion dialog */}
      {promotionPending && (
        <PromotionDialog
          color={activeColor}
          onSelect={confirmPromotion}
          onCancel={cancelPromotion}
        />
      )}
    </div>
  )
}
