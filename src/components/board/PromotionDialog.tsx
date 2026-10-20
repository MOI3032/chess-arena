import React from 'react'
import type { Color, PieceSymbol } from '@/types'

interface PromotionDialogProps {
  color: Color
  onSelect: (piece: PieceSymbol) => void
  onCancel: () => void
}

const PROMOTION_PIECES: { symbol: PieceSymbol; label: string }[] = [
  { symbol: 'q', label: 'Dame' },
  { symbol: 'r', label: 'Tour' },
  { symbol: 'b', label: 'Fou' },
  { symbol: 'n', label: 'Cavalier' },
]

// Unicode chess pieces
const PIECE_UNICODE: Record<string, Record<string, string>> = {
  w: { q: '♕', r: '♖', b: '♗', n: '♘' },
  b: { q: '♛', r: '♜', b: '♝', n: '♞' },
}

export function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-ca-panel rounded-2xl shadow-panel p-6 animate-slide-up">
        <h3 className="text-ca-text-primary font-semibold text-center mb-4">
          Choisir la pièce de promotion
        </h3>
        <div className="flex gap-3">
          {PROMOTION_PIECES.map(piece => (
            <button
              key={piece.symbol}
              onClick={() => onSelect(piece.symbol)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-ca-panel-light hover:bg-ca-green/30 border-2 border-transparent hover:border-ca-green transition-all cursor-pointer group"
            >
              <span className={`text-5xl ${color === 'w' ? 'text-white' : 'text-gray-900'} group-hover:scale-110 transition-transform`}
                style={{ textShadow: color === 'b' ? '0 0 2px rgba(255,255,255,0.5)' : '0 0 2px rgba(0,0,0,0.5)' }}>
                {PIECE_UNICODE[color][piece.symbol]}
              </span>
              <span className="text-ca-text-secondary text-xs font-medium">{piece.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="mt-4 w-full text-ca-text-secondary hover:text-ca-text-primary text-sm transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
