import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameState, Piece, Move, Position, Board, GameMode } from '../types'
import { PIECE_VALUES, INITIAL_POSITIONS } from '../types'
import { isValidMove, generateValidMoves, isCheckState, isCheckmate, generateNotation } from '../rules/validator'
import { makeAIMove } from '../ai/engine'

function createInitialBoard(): Board {
  const pieces: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null))

  // 初始化红方棋子
  INITIAL_POSITIONS.red.forEach(({ type, position }, index) => {
    pieces[position.y][position.x] = {
      id: `red-${type}-${index}`,
      type,
      color: 'red',
      position: { ...position },
    }
  })

  // 初始化黑方棋子
  INITIAL_POSITIONS.black.forEach(({ type, position }, index) => {
    pieces[position.y][position.x] = {
      id: `black-${type}-${index}`,
      type,
      color: 'black',
      position: { ...position },
    }
  })

  return { pieces }
}

export const useGameStore = defineStore('game', () => {
  const board = ref<Board>(createInitialBoard())
  const currentTurn = ref<PieceColor>('red')
  const selectedPiece = ref<Piece | null>(null)
  const moveHistory = ref<Move[]>([])
  const isGameOver = ref(false)
  const winner = ref<PieceColor | null>(null)
  const gameMode = ref<GameMode>('pvp')
  const isCheck = ref(false)
  const lastMove = ref<Move | null>(null)
  const validMoves = ref<Position[]>([])

  // 获取指定位置的棋子
  const getPieceAt = (position: Position): Piece | null => {
    return board.value.pieces[position.y][position.x]
  }

  // 选择棋子
  const selectPiece = (piece: Piece | null) => {
    // 游戏已结束，不允许选棋
    if (isGameOver.value) return

    selectedPiece.value = piece
    if (piece && piece.color === currentTurn.value) {
      validMoves.value = generateValidMoves(board.value, piece.position)
    } else {
      validMoves.value = []
    }
  }

  // 设置游戏模式
  const setGameMode = (mode: GameMode) => {
    gameMode.value = mode
    resetGame()
  }

  // 重置游戏
  const resetGame = () => {
    board.value = createInitialBoard()
    currentTurn.value = 'red'
    selectedPiece.value = null
    moveHistory.value = []
    isGameOver.value = false
    winner.value = null
    isCheck.value = false
    lastMove.value = null
    validMoves.value = []
  }

  // 检查是否还有将/帅
  const hasGeneral = (color: PieceColor): boolean => {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board.value.pieces[y][x]
        if (piece && piece.type === 'general' && piece.color === color) {
          return true
        }
      }
    }
    return false
  }

  // 走棋
  const makeMove = (from: Position, to: Position): boolean => {
    // 游戏已结束，不允许走棋
    if (isGameOver.value) return false

    const piece = getPieceAt(from)
    if (!piece || piece.color !== currentTurn.value) {
      return false
    }

    // 验证走棋合法性
    if (!isValidMove(board.value, from, to)) {
      return false
    }

    const captured = getPieceAt(to)

    // 移动棋子
    board.value.pieces[to.y][to.x] = piece
    board.value.pieces[from.y][from.x] = null
    piece.position = { ...to }

    // 记录走棋历史
    const move: Move = {
      from,
      to,
      piece: { ...piece },
      captured: captured ? { ...captured } : undefined,
      notation: generateNotation(piece, from, to, captured),
    }
    moveHistory.value.push(move)
    lastMove.value = move

    // 切换回合
    currentTurn.value = currentTurn.value === 'red' ? 'black' : 'red'

    // 检查是否将军（比将死检测快）
    isCheck.value = isCheckState(board.value, currentTurn.value)

    // 清除选择
    selectedPiece.value = null
    validMoves.value = []

    // 检查是否吃掉了对方的将/帅
    if (captured && captured.type === 'general') {
      isGameOver.value = true
      winner.value = captured.color === 'red' ? 'black' : 'red'
      return true
    }

    // 检查游戏是否结束（将死）
    if (isCheckmate(board.value, currentTurn.value)) {
      isGameOver.value = true
      winner.value = currentTurn.value === 'red' ? 'black' : 'red'
      return true
    }

    // 人机模式下，AI 自动走棋
    if (gameMode.value !== 'pvp' && currentTurn.value === 'black') {
      setTimeout(() => {
        makeComputerMove()
      }, 500) // 延迟 500ms 让玩家看到自己的走法
    }

    return true
  }

  // AI 走棋
  const makeComputerMove = () => {
    if (isGameOver.value || currentTurn.value !== 'black') return

    // AI 深度：简单 AI 为 1，强力 AI 为 3
    const depth = gameMode.value === 'ai-hard' ? 3 : 1
    const aiMove = makeAIMove(board.value, depth, 'black')

    if (!aiMove) {
      // AI 无棋可走，玩家获胜
      isGameOver.value = true
      winner.value = 'red'
      return
    }

    // 执行 AI 走棋
    const from = aiMove.from
    const to = aiMove.to
    const piece = getPieceAt(from)
    if (!piece) return

    const captured = getPieceAt(to)

    // 移动棋子
    board.value.pieces[to.y][to.x] = piece
    board.value.pieces[from.y][from.x] = null
    piece.position = { ...to }

    // 记录走棋历史
    const move: Move = {
      from,
      to,
      piece: { ...piece },
      captured: captured ? { ...captured } : undefined,
      notation: generateNotation(piece, from, to, captured),
    }
    moveHistory.value.push(move)
    lastMove.value = move

    // 切换回合
    currentTurn.value = 'red'

    // 检查是否将军
    isCheck.value = isCheckState(board.value, currentTurn.value)

    // 检查是否吃掉了对方的将/帅
    if (captured && captured.type === 'general') {
      isGameOver.value = true
      winner.value = 'black'
      return
    }

    // 检查游戏是否结束（将死）
    if (isCheckmate(board.value, 'red')) {
      isGameOver.value = true
      winner.value = 'black'
    }
  }

  // 悔棋
  const undoMove = (): boolean => {
    if (moveHistory.value.length === 0) {
      return false
    }

    const lastMoveData = moveHistory.value.pop()
    if (!lastMoveData) {
      return false
    }

    // 恢复棋子位置
    const piece = getPieceAt(lastMoveData.to)
    if (piece) {
      board.value.pieces[lastMoveData.from.y][lastMoveData.from.x] = piece
      piece.position = { ...lastMoveData.from }
    }
    board.value.pieces[lastMoveData.to.y][lastMoveData.to.x] = null

    // 恢复被吃掉的棋子
    if (lastMoveData.captured) {
      board.value.pieces[lastMoveData.to.y][lastMoveData.to.x] = lastMoveData.captured
      lastMoveData.captured.position = { ...lastMoveData.to }
    }

    // 恢复走棋权
    currentTurn.value = lastMoveData.piece.color
    lastMove.value = moveHistory.value.length > 0 ? moveHistory.value[moveHistory.value.length - 1] : null
    isGameOver.value = false
    winner.value = null
    isCheck.value = moveHistory.value.length > 0 ? isCheckState(board.value, currentTurn.value) : false
    selectedPiece.value = null
    validMoves.value = []

    return true
  }

  return {
    // State
    board,
    currentTurn,
    selectedPiece,
    moveHistory,
    isGameOver,
    winner,
    gameMode,
    isCheck,
    lastMove,
    validMoves,
    
    // Actions
    selectPiece,
    setGameMode,
    resetGame,
    makeMove,
    undoMove,
  }
})
