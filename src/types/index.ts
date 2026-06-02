// 棋子类型
export type PieceType = 'general' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier'

// 棋子颜色
export type PieceColor = 'red' | 'black'

// 棋盘位置
export interface Position {
  x: number // 0-8 (纵线)
  y: number // 0-9 (横线)
}

// 棋子
export interface Piece {
  id: string
  type: PieceType
  color: PieceColor
  position: Position
}

// 走棋
export interface Move {
  from: Position
  to: Position
  piece: Piece
  captured?: Piece
  notation: string // 象棋记谱
}

// 棋盘
export interface Board {
  pieces: (Piece | null)[][] // 9x10 二维数组
}

// 游戏模式
export type GameMode = 'pvp' | 'ai-easy' | 'ai-hard'

// 游戏状态
export interface GameState {
  board: Board
  currentTurn: PieceColor
  selectedPiece: Piece | null
  moveHistory: Move[]
  isGameOver: boolean
  winner: PieceColor | null
  gameMode: GameMode
  isCheck: boolean
  lastMove: Move | null
}

// 棋子价值
export const PIECE_VALUES: Record<PieceType, number> = {
  general: 10000,
  chariot: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  soldier: 100
}

// 棋子初始位置（红方在下方，黑方在上方）
export const INITIAL_POSITIONS = {
  red: [
    { type: 'chariot', position: { x: 0, y: 9 } },
    { type: 'horse', position: { x: 1, y: 9 } },
    { type: 'elephant', position: { x: 2, y: 9 } },
    { type: 'advisor', position: { x: 3, y: 9 } },
    { type: 'general', position: { x: 4, y: 9 } },
    { type: 'advisor', position: { x: 5, y: 9 } },
    { type: 'elephant', position: { x: 6, y: 9 } },
    { type: 'horse', position: { x: 7, y: 9 } },
    { type: 'chariot', position: { x: 8, y: 9 } },
    { type: 'cannon', position: { x: 1, y: 7 } },
    { type: 'cannon', position: { x: 7, y: 7 } },
    { type: 'soldier', position: { x: 0, y: 6 } },
    { type: 'soldier', position: { x: 2, y: 6 } },
    { type: 'soldier', position: { x: 4, y: 6 } },
    { type: 'soldier', position: { x: 6, y: 6 } },
    { type: 'soldier', position: { x: 8, y: 6 } },
  ],
  black: [
    { type: 'chariot', position: { x: 0, y: 0 } },
    { type: 'horse', position: { x: 1, y: 0 } },
    { type: 'elephant', position: { x: 2, y: 0 } },
    { type: 'advisor', position: { x: 3, y: 0 } },
    { type: 'general', position: { x: 4, y: 0 } },
    { type: 'advisor', position: { x: 5, y: 0 } },
    { type: 'elephant', position: { x: 6, y: 0 } },
    { type: 'horse', position: { x: 7, y: 0 } },
    { type: 'chariot', position: { x: 8, y: 0 } },
    { type: 'cannon', position: { x: 1, y: 2 } },
    { type: 'cannon', position: { x: 7, y: 2 } },
    { type: 'soldier', position: { x: 0, y: 3 } },
    { type: 'soldier', position: { x: 2, y: 3 } },
    { type: 'soldier', position: { x: 4, y: 3 } },
    { type: 'soldier', position: { x: 6, y: 3 } },
    { type: 'soldier', position: { x: 8, y: 3 } },
  ],
}
