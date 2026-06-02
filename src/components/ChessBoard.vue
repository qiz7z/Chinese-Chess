<template>
  <div class="chess-board-container">
    <canvas
      ref="canvasRef"
      :width="boardWidth"
      :height="boardHeight"
      @click="handleClick"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { Position, Piece } from '../types'

const props = defineProps<{
  boardSize: number
}>()

// 棋盘比例：9 列 x 10 行
const boardWidth = computed(() => props.boardSize)
const boardHeight = computed(() => props.boardSize * (10 / 9))

const emit = defineEmits<{
  (e: 'pieceClick', piece: Piece): void
  (e: 'move', from: Position, to: Position): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const gameStore = useGameStore()

// 棋盘配置 - 棋盘是 9 列 x 10 行
const CELL_SIZE = boardWidth.value / 9
const MARGIN = CELL_SIZE / 2
const PIECE_RADIUS = CELL_SIZE * 0.4

// 绘制棋盘
const drawBoard = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, boardWidth.value, boardHeight.value)
  
  // 背景色
  ctx.fillStyle = '#DEB887'
  ctx.fillRect(0, 0, boardWidth.value, boardHeight.value)
  
  // 绘制网格线
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  
  // 横线 (10 条)
  for (let i = 0; i < 10; i++) {
    ctx.beginPath()
    ctx.moveTo(MARGIN, MARGIN + i * CELL_SIZE)
    ctx.lineTo(boardWidth.value - MARGIN, MARGIN + i * CELL_SIZE)
    ctx.stroke()
  }
  
  // 纵线 (9 条) - 上下两部分，中间是楚河汉界
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.moveTo(MARGIN + i * CELL_SIZE, MARGIN)
    ctx.lineTo(MARGIN + i * CELL_SIZE, MARGIN + 4 * CELL_SIZE) // 上半部分（0-4 行）
    ctx.moveTo(MARGIN + i * CELL_SIZE, MARGIN + 5 * CELL_SIZE) // 下半部分（5-9 行）
    ctx.lineTo(MARGIN + i * CELL_SIZE, MARGIN + 9 * CELL_SIZE)
    ctx.stroke()
  }
  
  // 纵线 (9 条)
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.moveTo(MARGIN + i * CELL_SIZE, MARGIN)
    ctx.lineTo(MARGIN + i * CELL_SIZE, MARGIN + 4 * CELL_SIZE) // 上半部分
    ctx.moveTo(MARGIN + i * CELL_SIZE, MARGIN + 5 * CELL_SIZE) // 下半部分
    ctx.lineTo(MARGIN + i * CELL_SIZE, props.boardSize - MARGIN)
    ctx.stroke()
  }
  
  // 九宫格斜线
  drawPalace(ctx, 3, 0) // 红方
  drawPalace(ctx, 3, 7) // 黑方
  
  // 绘制炮位和兵位标记
  drawMarkers(ctx)
  
  // 绘制楚河汉界
  drawRiver(ctx)
  
  // 绘制棋子
  drawPieces(ctx)
  
  // 绘制选中棋子的高亮
  if (gameStore.selectedPiece) {
    drawSelectedHighlight(ctx)
  }
  
  // 绘制合法走法提示
  if (gameStore.validMoves.length > 0) {
    drawValidMoves(ctx)
  }
  
  // 绘制最后一步的标记
  if (gameStore.lastMove) {
    drawLastMove(ctx)
  }
}

// 绘制九宫格斜线
const drawPalace = (ctx: CanvasRenderingContext2D, startX: number, startY: number) => {
  ctx.beginPath()
  ctx.moveTo(MARGIN + startX * CELL_SIZE, MARGIN + startY * CELL_SIZE)
  ctx.lineTo(MARGIN + (startX + 2) * CELL_SIZE, MARGIN + (startY + 2) * CELL_SIZE)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(MARGIN + (startX + 2) * CELL_SIZE, MARGIN + startY * CELL_SIZE)
  ctx.lineTo(MARGIN + startX * CELL_SIZE, MARGIN + (startY + 2) * CELL_SIZE)
  ctx.stroke()
}

// 绘制炮位和兵位标记
const drawMarkers = (ctx: CanvasRenderingContext2D) => {
  const markers = [
    // 炮位
    { x: 1, y: 2 }, { x: 7, y: 2 }, // 红炮
    { x: 1, y: 7 }, { x: 7, y: 7 }, // 黑炮
    // 兵位
    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, { x: 8, y: 3 }, // 红兵
    { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 6, y: 6 }, { x: 8, y: 6 }, // 黑兵
  ]
  
  markers.forEach(marker => {
    const x = MARGIN + marker.x * CELL_SIZE
    const y = MARGIN + marker.y * CELL_SIZE
    const size = 5
    
    // 绘制直角标记
    if (marker.x > 0) {
      ctx.beginPath()
      ctx.moveTo(x - size, y - size)
      ctx.lineTo(x - size, y + size)
      ctx.stroke()
    }
    if (marker.x < 8) {
      ctx.beginPath()
      ctx.moveTo(x + size, y - size)
      ctx.lineTo(x + size, y + size)
      ctx.stroke()
    }
  })
}

// 绘制楚河汉界
const drawRiver = (ctx: CanvasRenderingContext2D) => {
  const riverY = MARGIN + 4.5 * CELL_SIZE
  
  ctx.fillStyle = '#000'
  ctx.font = '24px KaiTi, STKaiti, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  ctx.save()
  ctx.translate(MARGIN + 2 * CELL_SIZE, riverY)
  ctx.fillText('楚河', 0, 0)
  ctx.restore()
  
  ctx.save()
  ctx.translate(MARGIN + 6 * CELL_SIZE, riverY)
  ctx.rotate(Math.PI)
  ctx.fillText('汉界', 0, 0)
  ctx.restore()
}

// 绘制棋子
const drawPieces = (ctx: CanvasRenderingContext2D) => {
  gameStore.board.pieces.forEach((row, y) => {
    row.forEach((piece, x) => {
      if (piece) {
        drawPiece(ctx, piece, x, y)
      }
    })
  })
}

// 绘制单个棋子
const drawPiece = (ctx: CanvasRenderingContext2D, piece: Piece, x: number, y: number) => {
  const centerX = MARGIN + x * CELL_SIZE
  const centerY = MARGIN + y * CELL_SIZE
  
  // 棋子背景
  ctx.beginPath()
  ctx.arc(centerX, centerY, PIECE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = '#F5DEB3'
  ctx.fill()
  
  // 棋子边框
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // 棋子文字
  ctx.fillStyle = piece.color === 'red' ? '#C00' : '#000'
  ctx.font = 'bold 20px KaiTi, STKaiti, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const pieceNames: Record<string, string> = {
    general: piece.color === 'red' ? '帅' : '将',
    advisor: piece.color === 'red' ? '仕' : '士',
    elephant: piece.color === 'red' ? '相' : '象',
    horse: piece.color === 'red' ? '马' : '马',
    chariot: piece.color === 'red' ? '车' : '车',
    cannon: piece.color === 'red' ? '炮' : '炮',
    soldier: piece.color === 'red' ? '兵' : '卒',
  }
  
  ctx.fillText(pieceNames[piece.type], centerX, centerY)
}

// 绘制选中棋子的高亮
const drawSelectedHighlight = (ctx: CanvasRenderingContext2D) => {
  const piece = gameStore.selectedPiece
  if (!piece) return
  
  const x = MARGIN + piece.position.x * CELL_SIZE
  const y = MARGIN + piece.position.y * CELL_SIZE
  
  ctx.beginPath()
  ctx.arc(x, y, PIECE_RADIUS + 3, 0, Math.PI * 2)
  ctx.strokeStyle = '#00FF00'
  ctx.lineWidth = 3
  ctx.stroke()
}

// 绘制合法走法提示
const drawValidMoves = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
  
  gameStore.validMoves.forEach(pos => {
    const x = MARGIN + pos.x * CELL_SIZE
    const y = MARGIN + pos.y * CELL_SIZE
    
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
  })
}

// 绘制最后一步的标记
const drawLastMove = (ctx: CanvasRenderingContext2D) => {
  const lastMove = gameStore.lastMove
  if (!lastMove) return
  
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.7)'
  ctx.lineWidth = 2
  
  // 起点
  const fromX = MARGIN + lastMove.from.x * CELL_SIZE
  const fromY = MARGIN + lastMove.from.y * CELL_SIZE
  
  // 终点
  const toX = MARGIN + lastMove.to.x * CELL_SIZE
  const toY = MARGIN + lastMove.to.y * CELL_SIZE
  
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
}

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 计算点击的网格位置
  const gridX = Math.round((x - MARGIN) / CELL_SIZE)
  const gridY = Math.round((y - MARGIN) / CELL_SIZE)
  
  // 检查是否在棋盘范围内
  if (gridX < 0 || gridX > 8 || gridY < 0 || gridY > 9) return
  
  const clickedPosition = { x: gridX, y: gridY }
  const clickedPiece = gameStore.board.pieces[gridY][gridX]
  
  // 如果已选择棋子，尝试移动
  if (gameStore.selectedPiece) {
    const isValidMove = gameStore.validMoves.some(
      move => move.x === gridX && move.y === gridY
    )
    
    if (isValidMove) {
      emit('move', gameStore.selectedPiece.position, clickedPosition)
      return
    }
  }
  
  // 点击己方棋子，选中它
  if (clickedPiece && clickedPiece.color === gameStore.currentTurn) {
    emit('pieceClick', clickedPiece)
  }
}

// 监听状态变化并重绘 - 使用浅层观察避免重复触发
watch([() => gameStore.board.pieces, () => gameStore.selectedPiece?.id, () => gameStore.validMoves.length, () => gameStore.lastMove?.from], () => {
  drawBoard()
}, { deep: false })

onMounted(() => {
  drawBoard()
})
</script>

<style scoped>
.chess-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
}

canvas {
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
