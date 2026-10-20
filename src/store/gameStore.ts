import { create } from 'zustand'
import { Chess } from 'chess.js'
import type {
  GameState, GameSetup, GameStatus, MoveRecord,
  Color, Square, PieceSymbol, AppSettings, BoardTheme, TimeControl
} from '@/types'
import { BOARD_THEMES, TIME_CONTROLS } from '@/types'
import {
  generateId, detectChessJsGameOver,
  loadSettings, persistSettings, saveActiveGame,
  loadActiveGame, clearActiveGame, saveGame, loadSavedGames, deleteGame
} from '@/utils/gameUtils'
import type { SavedGame } from '@/types'

// ─── Default settings ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  showCoordinates: true,
  showLegalMoves: true,
  highlightLastMove: true,
  animatePieces: true,
  autoPromoteToQueen: false,
  soundEnabled: true,
  boardThemeId: 'arena',
}

// ─── Default game state ───────────────────────────────────────────────────────

function makeDefaultGameState(): GameState {
  const chess = new Chess()
  return {
    id: generateId(),
    setup: {
      playerWhiteName: 'Blancs',
      playerBlackName: 'Noirs',
      timeControl: TIME_CONTROLS[0],
      boardOrientation: 'w',
      boardTheme: BOARD_THEMES[4],
      pieceTheme: 'cburnett',
    },
    status: 'idle',
    fen: chess.fen(),
    pgn: '',
    moves: [],
    currentMoveIndex: -1,
    white: { name: 'Blancs', color: 'w', timeMs: 0, capturedPieces: [] },
    black: { name: 'Noirs', color: 'b', timeMs: 0, capturedPieces: [] },
    activeColor: 'w',
    isCheck: false,
    lastMove: null,
    selectedSquare: null,
    legalMoves: [],
    promotionPending: null,
    drawOfferedBy: null,
    startedAt: Date.now(),
    endedAt: null,
    lastTickAt: null,
    viewingMoveIndex: -1,
  }
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface GameStore {
  game: GameState
  settings: AppSettings
  savedGames: SavedGame[]
  currentScreen: 'home' | 'setup' | 'game' | 'history' | 'settings' | 'analysis'

  // Navigation
  navigate: (screen: GameStore['currentScreen']) => void

  // Game lifecycle
  startGame: (setup: GameSetup) => void
  resumeGame: () => boolean
  resetGame: () => void
  endGame: (status: GameStatus) => void

  // Moves
  selectSquare: (square: Square) => void
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean
  confirmPromotion: (piece: PieceSymbol) => void
  cancelPromotion: () => void

  // Timer
  tick: () => void

  // Game controls
  offerDraw: (color: Color) => void
  acceptDraw: () => void
  declineDraw: () => void
  resign: (color: Color) => void
  togglePause: () => void
  flipBoard: () => void

  // History navigation
  navigateToMove: (index: number) => void
  navigateFirst: () => void
  navigatePrev: () => void
  navigateNext: () => void
  navigateLast: () => void

  // Settings
  updateSettings: (partial: Partial<AppSettings>) => void

  // Saved games
  loadSavedGamesFromStorage: () => void
  deleteSavedGame: (id: string) => void
}

// ─── Store implementation ─────────────────────────────────────────────────────

// Module-level Chess instance (not stored in Zustand for serialization reasons)
let _chess = new Chess()

export const useGameStore = create<GameStore>((set, get) => ({
  game: makeDefaultGameState(),
  settings: loadSettings(DEFAULT_SETTINGS),
  savedGames: loadSavedGames(),
  currentScreen: 'home',

  // ── Navigation ────────────────────────────────────────────────────────────

  navigate: (screen) => set({ currentScreen: screen }),

  // ── Game lifecycle ────────────────────────────────────────────────────────

  startGame: (setup) => {
    _chess = new Chess()
    const timeMs = setup.timeControl.minutes > 0
      ? setup.timeControl.minutes * 60 * 1000
      : Infinity

    const newGame: GameState = {
      id: generateId(),
      setup,
      status: 'playing',
      fen: _chess.fen(),
      pgn: '',
      moves: [],
      currentMoveIndex: -1,
      white: { name: setup.playerWhiteName, color: 'w', timeMs, capturedPieces: [] },
      black: { name: setup.playerBlackName, color: 'b', timeMs, capturedPieces: [] },
      activeColor: 'w',
      isCheck: false,
      lastMove: null,
      selectedSquare: null,
      legalMoves: [],
      promotionPending: null,
      drawOfferedBy: null,
      startedAt: Date.now(),
      endedAt: null,
      lastTickAt: Date.now(),
      viewingMoveIndex: -1,
    }
    set({ game: newGame, currentScreen: 'game' })
    saveActiveGame(newGame)
  },

  resumeGame: () => {
    const saved = loadActiveGame()
    if (!saved || !saved.status || saved.status === 'idle') return false
    if (saved.status !== 'playing' && saved.status !== 'paused') return false

    // Rebuild chess instance from PGN
    _chess = new Chess()
    if (saved.pgn) {
      try {
        _chess.loadPgn(saved.pgn)
      } catch {
        return false
      }
    }

    const game = { ...makeDefaultGameState(), ...saved, lastTickAt: Date.now() } as GameState
    set({ game, currentScreen: 'game' })
    return true
  },

  resetGame: () => {
    _chess = new Chess()
    clearActiveGame()
    set({ game: makeDefaultGameState(), currentScreen: 'home' })
  },

  endGame: (status) => {
    const { game } = get()
    const endedAt = Date.now()

    const finishedGame: GameState = {
      ...game,
      status,
      endedAt,
      lastTickAt: null,
      selectedSquare: null,
      legalMoves: [],
      promotionPending: null,
      viewingMoveIndex: game.currentMoveIndex,
    }

    // Save to history
    const savedGame: SavedGame = {
      id: game.id,
      setup: game.setup,
      status,
      pgn: _chess.pgn(),
      moves: game.moves,
      white: game.white,
      black: game.black,
      startedAt: game.startedAt,
      endedAt,
      result: getResultFromStatus(status, _chess),
    }
    saveGame(savedGame)
    clearActiveGame()

    set({ game: finishedGame, savedGames: loadSavedGames() })
  },

  // ── Moves ─────────────────────────────────────────────────────────────────

  selectSquare: (square) => {
    const { game, settings } = get()
    if (game.status !== 'playing') return
    if (game.promotionPending) return

    // If viewing history, snap back to current
    if (game.viewingMoveIndex !== game.currentMoveIndex) {
      set({ game: { ...game, viewingMoveIndex: game.currentMoveIndex } })
      return
    }

    const piece = _chess.get(square)

    // If a square is already selected
    if (game.selectedSquare) {
      // Clicking on a legal move target → execute move
      if (game.legalMoves.includes(square)) {
        get().makeMove(game.selectedSquare, square)
        return
      }
      // Clicking on own piece → reselect
      if (piece && piece.color === game.activeColor) {
        const legalMoves = _chess.moves({ square, verbose: true }).map(m => m.to as Square)
        set({ game: { ...game, selectedSquare: square, legalMoves: settings.showLegalMoves ? legalMoves : [] } })
        return
      }
      // Clicking elsewhere → deselect
      set({ game: { ...game, selectedSquare: null, legalMoves: [] } })
      return
    }

    // No selection: select if own piece
    if (piece && piece.color === game.activeColor) {
      const legalMoves = _chess.moves({ square, verbose: true }).map(m => m.to as Square)
      set({ game: { ...game, selectedSquare: square, legalMoves: settings.showLegalMoves ? legalMoves : [] } })
    }
  },

  makeMove: (from, to, promotion) => {
    const { game, settings } = get()
    if (game.status !== 'playing') return false
    if (game.viewingMoveIndex !== game.currentMoveIndex) return false

    // Check if this is a promotion move
    const movingPiece = _chess.get(from)
    const isPawnPromotion =
      movingPiece?.type === 'p' &&
      ((movingPiece.color === 'w' && to[1] === '8') ||
       (movingPiece.color === 'b' && to[1] === '1'))

    if (isPawnPromotion && !promotion) {
      if (settings.autoPromoteToQueen) {
        return get().makeMove(from, to, 'q')
      }
      // Suspend and show promotion dialog
      set({ game: { ...game, promotionPending: { from, to }, selectedSquare: null, legalMoves: [] } })
      return false
    }

    // Try to execute the move
    let result
    try {
      result = _chess.move({ from, to, promotion })
    } catch {
      // Illegal move
      set({ game: { ...game, selectedSquare: null, legalMoves: [] } })
      return false
    }

    if (!result) {
      set({ game: { ...game, selectedSquare: null, legalMoves: [] } })
      return false
    }

    // Build captured pieces lists
    const white = { ...game.white }
    const black = { ...game.black }

    if (result.captured) {
      if (result.color === 'w') {
        white.capturedPieces = [...white.capturedPieces, result.captured]
      } else {
        black.capturedPieces = [...black.capturedPieces, result.captured]
      }
    }

    // Handle timer
    const now = Date.now()
    const elapsed = game.lastTickAt ? now - game.lastTickAt : 0
    const increment = game.setup.timeControl.increment * 1000

    if (game.activeColor === 'w' && white.timeMs !== Infinity) {
      white.timeMs = Math.max(0, white.timeMs - elapsed) + increment
    } else if (game.activeColor === 'b' && black.timeMs !== Infinity) {
      black.timeMs = Math.max(0, black.timeMs - elapsed) + increment
    }

    const moveNumber = Math.ceil(_chess.history().length / 2)
    const moveRecord: MoveRecord = {
      san: result.san,
      from,
      to,
      piece: result.piece,
      color: result.color as Color,
      fen: _chess.fen(),
      moveNumber,
      timestamp: now,
      timeRemainingMs: result.color === 'w' ? white.timeMs : black.timeMs,
    }

    const newMoves = [...game.moves, moveRecord]
    const newIndex = newMoves.length - 1
    const newActiveColor: Color = game.activeColor === 'w' ? 'b' : 'w'

    // Detect game over
    const gameOverStatus = detectChessJsGameOver(_chess)

    const newGame: GameState = {
      ...game,
      fen: _chess.fen(),
      pgn: _chess.pgn(),
      moves: newMoves,
      currentMoveIndex: newIndex,
      viewingMoveIndex: newIndex,
      white,
      black,
      activeColor: newActiveColor,
      isCheck: _chess.inCheck(),
      lastMove: { from, to },
      selectedSquare: null,
      legalMoves: [],
      promotionPending: null,
      drawOfferedBy: null,
      lastTickAt: now,
      status: gameOverStatus ?? 'playing',
    }

    saveActiveGame(newGame)
    set({ game: newGame })

    if (gameOverStatus) {
      get().endGame(gameOverStatus)
    }

    return true
  },

  confirmPromotion: (piece) => {
    const { game } = get()
    if (!game.promotionPending) return
    const { from, to } = game.promotionPending
    set({ game: { ...game, promotionPending: null } })
    get().makeMove(from, to, piece)
  },

  cancelPromotion: () => {
    const { game } = get()
    set({ game: { ...game, promotionPending: null, selectedSquare: null, legalMoves: [] } })
  },

  // ── Timer ─────────────────────────────────────────────────────────────────

  tick: () => {
    const { game } = get()
    if (game.status !== 'playing') return
    if (game.setup.timeControl.minutes === 0) return
    if (!game.lastTickAt) return

    const now = Date.now()
    const elapsed = now - game.lastTickAt

    const white = { ...game.white }
    const black = { ...game.black }

    if (game.activeColor === 'w' && white.timeMs !== Infinity) {
      white.timeMs = Math.max(0, white.timeMs - elapsed)
    } else if (game.activeColor === 'b' && black.timeMs !== Infinity) {
      black.timeMs = Math.max(0, black.timeMs - elapsed)
    }

    // Check timeout
    if (game.activeColor === 'w' && white.timeMs <= 0) {
      set({ game: { ...game, white, black, lastTickAt: now } })
      get().endGame('timeout_white')
      return
    }
    if (game.activeColor === 'b' && black.timeMs <= 0) {
      set({ game: { ...game, white, black, lastTickAt: now } })
      get().endGame('timeout_black')
      return
    }

    set({ game: { ...game, white, black, lastTickAt: now } })
  },

  // ── Game controls ─────────────────────────────────────────────────────────

  offerDraw: (color) => {
    const { game } = get()
    if (game.status !== 'playing') return
    set({ game: { ...game, drawOfferedBy: color } })
  },

  acceptDraw: () => {
    get().endGame('draw_agreement')
  },

  declineDraw: () => {
    const { game } = get()
    set({ game: { ...game, drawOfferedBy: null } })
  },

  resign: (color) => {
    get().endGame(color === 'w' ? 'resigned_white' : 'resigned_black')
  },

  togglePause: () => {
    const { game } = get()
    if (game.status === 'playing') {
      set({ game: { ...game, status: 'paused', lastTickAt: null } })
      saveActiveGame({ ...game, status: 'paused' })
    } else if (game.status === 'paused') {
      set({ game: { ...game, status: 'playing', lastTickAt: Date.now() } })
    }
  },

  flipBoard: () => {
    const { game } = get()
    const newOrientation: Color = game.setup.boardOrientation === 'w' ? 'b' : 'w'
    set({
      game: {
        ...game,
        setup: { ...game.setup, boardOrientation: newOrientation },
      },
    })
  },

  // ── History navigation ────────────────────────────────────────────────────

  navigateToMove: (index) => {
    const { game } = get()
    if (index < -1 || index >= game.moves.length) return

    if (index === game.currentMoveIndex) {
      set({ game: { ...game, viewingMoveIndex: index } })
      return
    }

    // Rebuild chess to that position
    _chess = new Chess()
    for (let i = 0; i <= index; i++) {
      try {
        _chess.move(game.moves[i].san)
      } catch {
        break
      }
    }

    set({ game: { ...game, viewingMoveIndex: index } })
  },

  navigateFirst: () => get().navigateToMove(-1),
  navigatePrev: () => {
    const { game } = get()
    get().navigateToMove(Math.max(-1, game.viewingMoveIndex - 1))
  },
  navigateNext: () => {
    const { game } = get()
    get().navigateToMove(Math.min(game.moves.length - 1, game.viewingMoveIndex + 1))
  },
  navigateLast: () => {
    const { game } = get()
    // Also restore chess to current position
    _chess = new Chess()
    if (game.pgn) {
      try { _chess.loadPgn(game.pgn) } catch {}
    }
    get().navigateToMove(game.currentMoveIndex)
  },

  // ── Settings ──────────────────────────────────────────────────────────────

  updateSettings: (partial) => {
    const { settings } = get()
    const updated = { ...settings, ...partial }
    persistSettings(updated)
    set({ settings: updated })
  },

  // ── Saved games ───────────────────────────────────────────────────────────

  loadSavedGamesFromStorage: () => {
    set({ savedGames: loadSavedGames() })
  },

  deleteSavedGame: (id) => {
    deleteGame(id)
    set({ savedGames: loadSavedGames() })
  },
}))

// ─── Helper used in endGame ───────────────────────────────────────────────────

function getResultFromStatus(status: GameStatus, chess: Chess): string {
  if (status === 'checkmate') return chess.turn() === 'w' ? '0-1' : '1-0'
  if (status === 'resigned_white' || status === 'timeout_white') return '0-1'
  if (status === 'resigned_black' || status === 'timeout_black') return '1-0'
  return '½-½'
}

// ─── Chess instance accessor (for components) ─────────────────────────────────

export function getChessInstance(): Chess {
  return _chess
}
