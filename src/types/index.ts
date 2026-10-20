import type { Chess, Square, PieceSymbol, Color } from 'chess.js'

// ─── Game configuration ───────────────────────────────────────────────────────

export type TimeControl = {
  label: string
  minutes: number
  increment: number // seconds added after each move
}

export const TIME_CONTROLS: TimeControl[] = [
  { label: 'Sans limite', minutes: 0, increment: 0 },
  { label: '1 min', minutes: 1, increment: 0 },
  { label: '3 min', minutes: 3, increment: 0 },
  { label: '3+2 (Blitz)', minutes: 3, increment: 2 },
  { label: '5 min', minutes: 5, increment: 0 },
  { label: '5+3 (Blitz)', minutes: 5, increment: 3 },
  { label: '10 min (Rapide)', minutes: 10, increment: 0 },
  { label: '15+10 (Rapide)', minutes: 15, increment: 10 },
  { label: '30 min (Classique)', minutes: 30, increment: 0 },
]

export type BoardTheme = {
  id: string
  label: string
  light: string
  dark: string
}

export const BOARD_THEMES: BoardTheme[] = [
  { id: 'green', label: 'Vert classique', light: '#EEEED2', dark: '#769656' },
  { id: 'wood', label: 'Bois', light: '#F0D9B5', dark: '#B58863' },
  { id: 'blue', label: 'Bleu ardoise', light: '#DEE3E6', dark: '#8CA2AD' },
  { id: 'dark', label: 'Sombre', light: '#706677', dark: '#3C3042' },
  { id: 'arena', label: 'Arena (défaut)', light: '#E8E3D9', dark: '#81B64C' },
]

export type PieceTheme = 'cburnett' | 'merida' | 'alpha'

// ─── Game setup ───────────────────────────────────────────────────────────────

export interface GameSetup {
  playerWhiteName: string
  playerBlackName: string
  timeControl: TimeControl
  boardOrientation: Color
  boardTheme: BoardTheme
  pieceTheme: PieceTheme
}

// ─── Game state ───────────────────────────────────────────────────────────────

export type GameStatus =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'checkmate'
  | 'stalemate'
  | 'draw_insufficient'
  | 'draw_repetition'
  | 'draw_fifty_moves'
  | 'draw_agreement'
  | 'resigned_white'
  | 'resigned_black'
  | 'timeout_white'
  | 'timeout_black'

export interface PlayerState {
  name: string
  color: Color
  timeMs: number        // remaining milliseconds
  capturedPieces: PieceSymbol[]
}

export interface MoveRecord {
  san: string           // standard algebraic notation
  from: Square
  to: Square
  piece: PieceSymbol
  color: Color
  fen: string           // position after this move
  moveNumber: number
  timestamp: number     // ms since epoch
  timeRemainingMs: number // time left for the player who moved
}

export interface GameState {
  id: string
  setup: GameSetup
  status: GameStatus
  fen: string
  pgn: string
  moves: MoveRecord[]
  currentMoveIndex: number  // for history navigation
  white: PlayerState
  black: PlayerState
  activeColor: Color
  isCheck: boolean
  lastMove: { from: Square; to: Square } | null
  selectedSquare: Square | null
  legalMoves: Square[]
  promotionPending: { from: Square; to: Square } | null
  drawOfferedBy: Color | null
  startedAt: number         // ms since epoch
  endedAt: number | null
  lastTickAt: number | null // for robust timer calculation
  viewingMoveIndex: number  // separate from currentMoveIndex for analysis view
}

// ─── Saved game ───────────────────────────────────────────────────────────────

export interface SavedGame {
  id: string
  setup: GameSetup
  status: GameStatus
  pgn: string
  moves: MoveRecord[]
  white: PlayerState
  black: PlayerState
  startedAt: number
  endedAt: number | null
  result: string
}

// ─── App settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark' | 'light'
  showCoordinates: boolean
  showLegalMoves: boolean
  highlightLastMove: boolean
  animatePieces: boolean
  autoPromoteToQueen: boolean
  soundEnabled: boolean
  boardThemeId: string
}

// ─── Re-export chess.js types we use ─────────────────────────────────────────

export type { Chess, Square, PieceSymbol, Color }
