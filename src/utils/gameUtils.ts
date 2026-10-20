import { Chess } from 'chess.js'
import type { Color, GameStatus, SavedGame, GameState, MoveRecord } from '@/types'

// ─── Status helpers ───────────────────────────────────────────────────────────

export function getGameOverMessage(status: GameStatus, whiteName: string, blackName: string): {
  title: string
  subtitle: string
  winner: Color | 'draw' | null
} {
  switch (status) {
    case 'checkmate':
      // Will be determined by caller with chess.turn()
      return { title: 'Échec et mat', subtitle: '', winner: null }
    case 'stalemate':
      return { title: 'Pat', subtitle: 'La partie est nulle — aucun coup légal disponible', winner: 'draw' }
    case 'draw_insufficient':
      return { title: 'Partie nulle', subtitle: 'Matériel insuffisant pour donner mat', winner: 'draw' }
    case 'draw_repetition':
      return { title: 'Partie nulle', subtitle: 'Triple répétition de position', winner: 'draw' }
    case 'draw_fifty_moves':
      return { title: 'Partie nulle', subtitle: 'Règle des cinquante coups', winner: 'draw' }
    case 'draw_agreement':
      return { title: 'Partie nulle', subtitle: 'Nulle par accord mutuel', winner: 'draw' }
    case 'resigned_white':
      return { title: `${blackName} gagne`, subtitle: `${whiteName} a abandonné`, winner: 'b' }
    case 'resigned_black':
      return { title: `${whiteName} gagne`, subtitle: `${blackName} a abandonné`, winner: 'w' }
    case 'timeout_white':
      return { title: `${blackName} gagne`, subtitle: `${whiteName} a dépassé le temps`, winner: 'b' }
    case 'timeout_black':
      return { title: `${whiteName} gagne`, subtitle: `${blackName} a dépassé le temps`, winner: 'w' }
    default:
      return { title: 'Partie terminée', subtitle: '', winner: null }
  }
}

export function getResultString(status: GameStatus, chess: Chess): string {
  if (status === 'checkmate') {
    return chess.turn() === 'w' ? '0-1' : '1-0'
  }
  if (status === 'resigned_white' || status === 'timeout_white') return '0-1'
  if (status === 'resigned_black' || status === 'timeout_black') return '1-0'
  if (
    status === 'stalemate' ||
    status === 'draw_insufficient' ||
    status === 'draw_repetition' ||
    status === 'draw_fifty_moves' ||
    status === 'draw_agreement'
  ) return '½-½'
  return '*'
}

// ─── Time formatting ──────────────────────────────────────────────────────────

export function formatTime(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatTimePrecise(ms: number): string {
  if (ms <= 0) return '0:00.0'
  const totalTenths = Math.ceil(ms / 100)
  const minutes = Math.floor(totalTenths / 600)
  const seconds = Math.floor((totalTenths % 600) / 10)
  const tenths = totalTenths % 10
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${tenths}`
}

// ─── Piece helpers ────────────────────────────────────────────────────────────

export function getPieceMaterialValue(piece: string): number {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
  return values[piece.toLowerCase()] ?? 0
}

export function getMaterialAdvantage(whiteCaptured: string[], blackCaptured: string[]): number {
  const whiteVal = whiteCaptured.reduce((acc, p) => acc + getPieceMaterialValue(p), 0)
  const blackVal = blackCaptured.reduce((acc, p) => acc + getPieceMaterialValue(p), 0)
  return whiteVal - blackVal
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const SAVED_GAMES_KEY = 'chess-arena-saved-games'
const ACTIVE_GAME_KEY = 'chess-arena-active-game'
const SETTINGS_KEY = 'chess-arena-settings'

export function loadSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(SAVED_GAMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGame(game: SavedGame): void {
  const games = loadSavedGames()
  const idx = games.findIndex(g => g.id === game.id)
  if (idx >= 0) {
    games[idx] = game
  } else {
    games.unshift(game)
  }
  // Keep last 50 games
  localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(games.slice(0, 50)))
}

export function deleteGame(id: string): void {
  const games = loadSavedGames().filter(g => g.id !== id)
  localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(games))
}

export function saveActiveGame(state: Partial<GameState>): void {
  try {
    localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable
  }
}

export function loadActiveGame(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearActiveGame(): void {
  localStorage.removeItem(ACTIVE_GAME_KEY)
}

export function loadSettings<T>(defaults: T): T {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

export function persistSettings<T>(settings: T): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {}
}

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Move notation helpers ────────────────────────────────────────────────────

export function groupMovesByNumber(moves: MoveRecord[]): Array<{
  moveNumber: number
  white: MoveRecord | null
  black: MoveRecord | null
}> {
  const pairs: Array<{ moveNumber: number; white: MoveRecord | null; black: MoveRecord | null }> = []
  for (const move of moves) {
    if (move.color === 'w') {
      pairs.push({ moveNumber: move.moveNumber, white: move, black: null })
    } else {
      const last = pairs[pairs.length - 1]
      if (last && last.black === null && last.moveNumber === move.moveNumber) {
        last.black = move
      } else {
        pairs.push({ moveNumber: move.moveNumber, white: null, black: move })
      }
    }
  }
  return pairs
}

// ─── Piece captured display ───────────────────────────────────────────────────

const PIECE_UNICODE: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕',
}

export function getPieceUnicode(piece: string): string {
  return PIECE_UNICODE[piece] ?? piece
}

// ─── Check if game has ended ──────────────────────────────────────────────────

export function isGameOver(status: GameStatus): boolean {
  return status !== 'idle' && status !== 'playing' && status !== 'paused'
}

// ─── Detect game over from chess.js ──────────────────────────────────────────

export function detectChessJsGameOver(chess: Chess): GameStatus | null {
  if (chess.isCheckmate()) return 'checkmate'
  if (chess.isStalemate()) return 'stalemate'
  if (chess.isInsufficientMaterial()) return 'draw_insufficient'
  if (chess.isThreefoldRepetition()) return 'draw_repetition'
  if (chess.isDraw()) return 'draw_fifty_moves'
  return null
}
