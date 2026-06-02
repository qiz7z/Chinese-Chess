import type { Board, Move, Position, PieceColor, Piece } from '../types'
import { PIECE_VALUES } from '../types'

// 棋盘评估函数
export function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0
  let myPieces = 0
  let enemyPieces = 0

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board.pieces[y][x]
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type]
        const positionBonus = getPositionBonus(piece, x, y)

        if (piece.color === color) {
          score += pieceValue + positionBonus
          myPieces++
        } else {
          score -= pieceValue + positionBonus
          enemyPieces++
        }
      }
    }
  }

  // 如果对方没有将/帅，给予极高奖励（将死）
  if (enemyPieces === 0) {
    score += 1000000
  }

  // 如果己方没有将/帅，给予极低惩罚（被将死）
  if (myPieces === 0) {
    score -= 1000000
  }

  return score
}

// 棋子位置价值（完整版）
function getPositionBonus(piece: Piece, x: number, y: number): number {
  let bonus = 0

  // 兵/卒位置价值
  if (piece.type === 'soldier') {
    if (piece.color === 'red') {
      // 红兵过河后越靠近对方加分越多
      if (y < 5) {
        bonus = 30 + (5 - y) * 15
      } else {
        bonus = (9 - y) * 5
      }
    } else {
      // 黑卒过河后越靠近对方加分越多
      if (y > 4) {
        bonus = 30 + (y - 4) * 15
      } else {
        bonus = y * 5
      }
    }
  }

  // 车位置价值
  if (piece.type === 'chariot') {
    // 车在中心线加分
    if (x >= 3 && x <= 5) bonus += 20
    // 车在对方半场加分
    if (piece.color === 'red' && y < 5) bonus += 30
    if (piece.color === 'black' && y > 4) bonus += 30
  }

  // 马位置价值
  if (piece.type === 'horse') {
    // 马在对方半场加分
    if (piece.color === 'red' && y < 5) bonus += 25
    if (piece.color === 'black' && y > 4) bonus += 25
    // 马在中心区域加分
    if (x >= 2 && x <= 6) bonus += 10
  }

  // 炮位置价值
  if (piece.type === 'cannon') {
    // 炮在对方半场加分
    if (piece.color === 'red' && y < 5) bonus += 20
    if (piece.color === 'black' && y > 4) bonus += 20
  }

  // 将/帅位置价值（保持在原位）
  if (piece.type === 'general') {
    if (piece.color === 'red' && y === 9 && x === 4) bonus += 10
    if (piece.color === 'black' && y === 0 && x === 4) bonus += 10
  }

  // 士/仕位置价值
  if (piece.type === 'advisor') {
    if (piece.color === 'red' && y >= 7 && y <= 9) bonus += 5
    if (piece.color === 'black' && y >= 0 && y <= 2) bonus += 5
  }

  // 象/相位置价值
  if (piece.type === 'elephant') {
    if (piece.color === 'red' && y >= 5 && y <= 9) bonus += 5
    if (piece.color === 'black' && y >= 0 && y <= 4) bonus += 5
  }

  return bonus
}

// 生成所有合法走法
function generateAllMoves(board: Board, color: PieceColor): Move[] {
  const moves: Move[] = []
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board.pieces[y][x]
      if (piece && piece.color === color) {
        const from = { x, y }
        const pieceMoves = generatePieceMoves(board, piece, from)
        moves.push(...pieceMoves)
      }
    }
  }
  
  return moves
}

// 生成单个棋子的所有走法
function generatePieceMoves(board: Board, piece: Piece, from: Position): Move[] {
  const moves: Move[] = []
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const to = { x, y }
      const target = board.pieces[y][x]
      
      // 不能吃己方棋子
      if (target && target.color === piece.color) continue
      
      if (isValidMove(board, from, to, piece)) {
        moves.push({
          from,
          to,
          piece: { ...piece },
          captured: target ? { ...target } : undefined,
          notation: '',
        })
      }
    }
  }
  
  return moves
}

// 验证走棋合法性（完整版本）
function isValidMove(board: Board, from: Position, to: Position, piece: Piece): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  const target = board.pieces[to.y][to.x]
  
  // 不能吃己方棋子
  if (target && target.color === piece.color) return false
  
  switch (piece.type) {
    case 'general':
      return isValidGeneralMove(board, from, to, piece.color)
    case 'advisor':
      return isValidAdvisorMove(from, to, piece.color)
    case 'elephant':
      return isValidElephantMove(board, from, to, piece.color)
    case 'horse':
      return isValidHorseMove(board, from, to)
    case 'chariot':
      return isValidChariotMove(board, from, to)
    case 'cannon':
      return isValidCannonMove(board, from, to, !!target)
    case 'soldier':
      return isValidSoldierMove(from, to, piece.color)
    default:
      return false
  }
}

// 将/帅走棋规则
function isValidGeneralMove(board: Board, from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // 只能在九宫格内
  if (to.x < 3 || to.x > 5) return false
  // 红方在下方(y=7-9)，黑方在上方(y=0-2)
  if (color === 'red' && (to.y < 7 || to.y > 9)) return false
  if (color === 'black' && (to.y < 0 || to.y > 2)) return false

  // 只能走 1 格
  return (absDx === 1 && absDy === 0) || (absDx === 0 && absDy === 1)
}

// 士/仕走棋规则
function isValidAdvisorMove(from: Position, to: Position, color: PieceColor): boolean {
  const absDx = Math.abs(to.x - from.x)
  const absDy = Math.abs(to.y - from.y)

  // 只能在九宫格内
  if (to.x < 3 || to.x > 5) return false
  // 红方在下方(y=7-9)，黑方在上方(y=0-2)
  if (color === 'red' && (to.y < 7 || to.y > 9)) return false
  if (color === 'black' && (to.y < 0 || to.y > 2)) return false

  // 只能走斜线 1 格
  return absDx === 1 && absDy === 1
}

// 象/相走棋规则
function isValidElephantMove(board: Board, from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // 不能过河：红方在下方(y>=5)，黑方在上方(y<=4)
  if (color === 'red' && to.y < 5) return false
  if (color === 'black' && to.y > 4) return false

  // 走田字
  if (absDx !== 2 || absDy !== 2) return false

  // 塞象眼检测
  const eyeX = from.x + dx / 2
  const eyeY = from.y + dy / 2
  if (board.pieces[eyeY][eyeX]) return false

  return true
}

// 马走棋规则
function isValidHorseMove(board: Board, from: Position, to: Position): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  // 走日字
  const isMove = (absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)
  if (!isMove) return false
  
  // 别马腿检测
  if (absDx === 2) {
    const legX = from.x + (dx > 0 ? 1 : -1)
    if (board.pieces[from.y][legX]) return false
  } else {
    const legY = from.y + (dy > 0 ? 1 : -1)
    if (board.pieces[legY][from.x]) return false
  }
  
  return true
}

// 车走棋规则
function isValidChariotMove(board: Board, from: Position, to: Position): boolean {
  // 必须直线
  if (from.x !== to.x && from.y !== to.y) return false
  
  // 检查路径阻挡
  return countPiecesBetween(board, from, to) === 0
}

// 炮走棋规则
function isValidCannonMove(board: Board, from: Position, to: Position, isCapture: boolean): boolean {
  // 必须直线
  if (from.x !== to.x && from.y !== to.y) return false
  
  const count = countPiecesBetween(board, from, to)
  
  // 移动：无阻挡；吃子：恰好 1 个阻挡
  return isCapture ? count === 1 : count === 0
}

// 兵/卒走棋规则
function isValidSoldierMove(from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // 只能走 1 格
  if (absDx + absDy !== 1) return false

  // 不能后退
  if (color === 'red' && dy > 0) return false
  if (color === 'black' && dy < 0) return false

  // 过河前只能向前走，不能横走
  // 红方在下方(y>=5)，过河前是 y>=5；黑方在上方(y<=4)，过河前是 y<=4
  if (color === 'red' && from.y >= 5 && dx !== 0) return false
  if (color === 'black' && from.y <= 4 && dx !== 0) return false

  return true
}

// 计算两点之间的棋子数
function countPiecesBetween(board: Board, from: Position, to: Position): number {
  let count = 0
  
  if (from.x === to.x) {
    // 纵向
    const minY = Math.min(from.y, to.y)
    const maxY = Math.max(from.y, to.y)
    for (let y = minY + 1; y < maxY; y++) {
      if (board.pieces[y][from.x]) count++
    }
  } else {
    // 横向
    const minX = Math.min(from.x, to.x)
    const maxX = Math.max(from.x, to.x)
    for (let x = minX + 1; x < maxX; x++) {
      if (board.pieces[from.y][x]) count++
    }
  }
  
  return count
}

// AI 获取最佳走法（简单版本 - 贪心算法）
function getBestMoveSimple(board: Board, color: PieceColor): Move | null {
  const allMoves = generateAllMoves(board, color)
  
  if (allMoves.length === 0) return null
  
  let bestMove: Move | null = null
  let bestScore = -Infinity
  
  for (const move of allMoves) {
    const score = evaluateMove(board, move, color)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  
  return bestMove
}

// 评估走棋价值
function evaluateMove(board: Board, move: Move, color: PieceColor): number {
  let score = 0

  // 吃子价值（高权重）
  if (move.captured) {
    score += PIECE_VALUES[move.captured.type] * 10
  }

  // 位置价值
  const piece = move.piece
  const oldBonus = getPositionBonus(piece, move.from.x, move.from.y)
  const newBonus = getPositionBonus(piece, move.to.x, move.to.y)
  score += (newBonus - oldBonus)

  // 保护己方棋子（如果移动后能保护其他棋子）
  // 简化：如果移动后位置更好，给额外奖励
  if (newBonus > oldBonus) {
    score += 20
  }

  // 将军奖励
  const target = board.pieces[move.to.y][move.to.x]
  if (target && target.type === 'general') {
    score += 100000 // 将死对方帅/将
  }

  // 随机性，避免每次都走一样的（小幅度）
  score += Math.random() * 5

  return score
}

// Minimax 算法 + Alpha-Beta 剪枝
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  color: PieceColor
): number {
  if (depth === 0) {
    return evaluateBoard(board, color)
  }
  
  const currentColor = maximizingPlayer ? color : (color === 'red' ? 'black' : 'red')
  const allMoves = generateAllMoves(board, currentColor)
  
  if (allMoves.length === 0) {
    return evaluateBoard(board, color)
  }
  
  // 模拟走棋
  const makeSimulationMove = (move: Move) => {
    const captured = board.pieces[move.to.y][move.to.x]
    const piece = board.pieces[move.from.y][move.from.x]
    
    board.pieces[move.to.y][move.to.x] = piece
    board.pieces[move.from.y][move.from.x] = null
    piece!.position = { ...move.to }
    
    return captured
  }
  
  const undoSimulationMove = (move: Move, captured: Piece | null) => {
    const piece = board.pieces[move.to.y][move.to.x]
    
    board.pieces[move.from.y][move.from.x] = piece
    board.pieces[move.to.y][move.to.x] = captured
    piece!.position = { ...move.from }
  }
  
  if (maximizingPlayer) {
    let maxEval = -Infinity
    for (const move of allMoves) {
      const captured = makeSimulationMove(move)
      const evalScore = minimax(board, depth - 1, alpha, beta, false, color)
      undoSimulationMove(move, captured)
      
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of allMoves) {
      const captured = makeSimulationMove(move)
      const evalScore = minimax(board, depth - 1, alpha, beta, true, color)
      undoSimulationMove(move, captured)
      
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

// 使用 Minimax 获取最佳走法
function getBestMoveMinimax(board: Board, depth: number, color: PieceColor): Move | null {
  const allMoves = generateAllMoves(board, color)
  
  if (allMoves.length === 0) return null
  
  let bestMove: Move | null = null
  let bestScore = -Infinity
  let alpha = -Infinity
  let beta = Infinity
  
  for (const move of allMoves) {
    const captured = board.pieces[move.to.y][move.to.x]
    const piece = board.pieces[move.from.y][move.from.x]
    
    // 模拟走棋
    board.pieces[move.to.y][move.to.x] = piece
    board.pieces[move.from.y][move.from.x] = null
    piece!.position = { ...move.to }
    
    const score = minimax(board, depth - 1, alpha, beta, false, color)
    
    // 撤销走棋
    board.pieces[move.from.y][move.from.x] = piece
    board.pieces[move.to.y][move.to.x] = captured
    piece!.position = { ...move.from }
    
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
    
    alpha = Math.max(alpha, bestScore)
  }
  
  return bestMove
}

// AI 主函数
export function makeAIMove(board: Board, depth: number, color: PieceColor): Move | null {
  if (depth <= 1) {
    return getBestMoveSimple(board, color)
  } else {
    return getBestMoveMinimax(board, depth, color)
  }
}
