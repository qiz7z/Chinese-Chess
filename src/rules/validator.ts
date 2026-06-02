import type { Board, Position, Piece, PieceColor } from '../types'

// 验证走棋合法性
export function isValidMove(board: Board, from: Position, to: Position): boolean {
  const piece = board.pieces[from.y][from.x]
  if (!piece) return false

  const target = board.pieces[to.y][to.x]
  if (target && target.color === piece.color) return false

  switch (piece.type) {
    case 'general':
      return isValidGeneralMove(from, to, piece.color)
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

function isValidGeneralMove(from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  if (to.x < 3 || to.x > 5) return false
  if (color === 'red' && (to.y < 0 || to.y > 2)) return false
  if (color === 'black' && (to.y < 7 || to.y > 9)) return false
  
  return (absDx === 1 && absDy === 0) || (absDx === 0 && absDy === 1)
}

function isValidAdvisorMove(from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  if (to.x < 3 || to.x > 5) return false
  if (color === 'red' && (to.y < 0 || to.y > 2)) return false
  if (color === 'black' && (to.y < 7 || to.y > 9)) return false
  
  return absDx === 1 && absDy === 1
}

function isValidElephantMove(board: Board, from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  if (color === 'red' && to.y > 4) return false
  if (color === 'black' && to.y < 5) return false
  
  if (absDx !== 2 || absDy !== 2) return false
  
  const eyeX = from.x + dx / 2
  const eyeY = from.y + dy / 2
  if (board.pieces[eyeY][eyeX]) return false
  
  return true
}

function isValidHorseMove(board: Board, from: Position, to: Position): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  const isMove = (absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)
  if (!isMove) return false
  
  if (absDx === 2) {
    const legX = from.x + (dx > 0 ? 1 : -1)
    if (board.pieces[from.y][legX]) return false
  } else {
    const legY = from.y + (dy > 0 ? 1 : -1)
    if (board.pieces[legY][from.x]) return false
  }
  
  return true
}

function isValidChariotMove(board: Board, from: Position, to: Position): boolean {
  if (from.x !== to.x && from.y !== to.y) return false
  return countPiecesBetween(board, from, to) === 0
}

function isValidCannonMove(board: Board, from: Position, to: Position, isCapture: boolean): boolean {
  if (from.x !== to.x && from.y !== to.y) return false
  const count = countPiecesBetween(board, from, to)
  return isCapture ? count === 1 : count === 0
}

function isValidSoldierMove(from: Position, to: Position, color: PieceColor): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  if (absDx + absDy !== 1) return false
  if (color === 'red' && dy > 0) return false
  if (color === 'black' && dy < 0) return false
  if (color === 'red' && from.y <= 4 && dx !== 0) return false
  if (color === 'black' && from.y >= 5 && dx !== 0) return false
  
  return true
}

function countPiecesBetween(board: Board, from: Position, to: Position): number {
  let count = 0
  
  if (from.x === to.x) {
    const minY = Math.min(from.y, to.y)
    const maxY = Math.max(from.y, to.y)
    for (let y = minY + 1; y < maxY; y++) {
      if (board.pieces[y][from.x]) count++
    }
  } else {
    const minX = Math.min(from.x, to.x)
    const maxX = Math.max(from.x, to.x)
    for (let x = minX + 1; x < maxX; x++) {
      if (board.pieces[from.y][x]) count++
    }
  }
  
  return count
}

export function generateValidMoves(board: Board, from: Position): Position[] {
  const piece = board.pieces[from.y][from.x]
  if (!piece) return []
  
  const moves: Position[] = []
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const to = { x, y }
      if (isValidMove(board, from, to)) {
        moves.push(to)
      }
    }
  }
  
  return moves
}

export function isCheckState(board: Board, color: PieceColor): boolean {
  let generalPos: Position | null = null
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board.pieces[y][x]
      if (piece && piece.type === 'general' && piece.color === color) {
        generalPos = { x, y }
        break
      }
    }
    if (generalPos) break
  }
  
  if (!generalPos) return false
  
  const enemyColor = color === 'red' ? 'black' : 'red'
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board.pieces[y][x]
      if (piece && piece.color === enemyColor) {
        if (isValidMove(board, { x, y }, generalPos!)) {
          return true
        }
      }
    }
  }
  
  return false
}

export function isCheckmate(board: Board, color: PieceColor): boolean {
  if (!isCheckState(board, color)) return false
  
  let generalPos: Position | null = null
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board.pieces[y][x]
      if (piece && piece.type === 'general' && piece.color === color) {
        generalPos = { x, y }
        break
      }
    }
    if (generalPos) break
  }
  
  if (!generalPos) return true
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const toX = generalPos!.x + dx
      const toY = generalPos!.y + dy
      
      if (toX < 3 || toX > 5) continue
      if (color === 'red' && (toY < 0 || toY > 2)) continue
      if (color === 'black' && (toY < 7 || toY > 9)) continue
      
      const target = board.pieces[toY][toX]
      if (target && target.color === color) continue
      
      const general = board.pieces[generalPos!.y][generalPos!.x]!
      board.pieces[toY][toX] = general
      board.pieces[generalPos!.y][generalPos!.x] = null
      
      const stillCheck = isCheckState(board, color)
      
      board.pieces[generalPos!.y][generalPos!.x] = general
      board.pieces[toY][toX] = target
      
      if (!stillCheck) return false
    }
  }
  
  return true
}

export function generateNotation(piece: Piece, from: Position, to: Position, captured?: Piece): string {
  const pieceNames: Record<string, string> = {
    general: piece.color === 'red' ? '帅' : '将',
    advisor: piece.color === 'red' ? '仕' : '士',
    elephant: piece.color === 'red' ? '相' : '象',
    horse: '马',
    chariot: '车',
    cannon: '炮',
    soldier: piece.color === 'red' ? '兵' : '卒',
  }
  
  const name = pieceNames[piece.type]
  const action = captured ? '吃' : '走'
  return `${name}${action}到 (${to.x},${to.y})`
}
