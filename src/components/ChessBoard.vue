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
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
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

// 动画状态
interface AnimationState {
  piece: Piece
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
  isAnimating: boolean
}

const animation = ref<AnimationState>({
  piece: null as any,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0,
  progress: 0,
  isAnimating: false,
})

let animationFrame: number | null = null

// 缓动函数 - 先加速后减速
const easeInOutCubic = (t: number): number => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// 开始移动动画
const startMoveAnimation = (piece: Piece, from: Position, to: Position) => {
  animation.value = {
    piece: { ...piece },
    fromX: MARGIN + from.x * CELL_SIZE,
    fromY: MARGIN + from.y * CELL_SIZE,
    toX: MARGIN + to.x * CELL_SIZE,
    toY: MARGIN + to.y * CELL_SIZE,
    progress: 0,
    isAnimating: true,
  }

  const duration = 200 // 动画时长 200ms
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const rawProgress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    animation.value.progress = easeInOutCubic(rawProgress)

    // 重绘画布
    drawBoard()

    if (rawProgress < 1) {
      animationFrame = requestAnimationFrame(animate)
    } else {
      // 动画结束
      animation.value.isAnimating = false
      drawBoard()
    }
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(animate)
}

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

  // 九宫格斜线
  drawPalace(ctx, 3, 7) // 红方（下方）
  drawPalace(ctx, 3, 0) // 黑方（上方）

  // 绘制炮位和兵位标记
  drawMarkers(ctx)

  // 绘制楚河汉界
  drawRiver(ctx)

  // 绘制棋子（排除正在动画的棋子）
  drawPieces(ctx)

  // 绘制动画中的棋子
  if (animation.value.isAnimating) {
    drawAnimatingPiece(ctx)
  }

  // 绘制选中棋子的高亮
  if (gameStore.selectedPiece && !animation.value.isAnimating) {
    drawSelectedHighlight(ctx)
  }

  // 绘制合法走法提示
  if (gameStore.validMoves.length > 0 && !animation.value.isAnimating) {
    drawValidMoves(ctx)
  }

  // 绘制最后一步的标记
  if (gameStore.lastMove && !animation.value.isAnimating) {
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
    { x: 1, y: 7 }, { x: 7, y: 7 }, // 红炮（下方）
    { x: 1, y: 2 }, { x: 7, y: 2 }, // 黑炮（上方）
    // 兵位
    { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 6, y: 6 }, { x: 8, y: 6 }, // 红兵（下方）
    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, { x: 8, y: 3 }, // 黑兵（上方）
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
        // 跳过正在动画的棋子
        if (animation.value.isAnimating &&
            animation.value.piece.id === piece.id) {
          return
        }
        drawPiece(ctx, piece, x, y)
      }
    })
  })
}

// 绘制单个棋子
const drawPiece = (ctx: CanvasRenderingContext2D, piece: Piece, x: number, y: number) => {
  const centerX = MARGIN + x * CELL_SIZE
  const centerY = MARGIN + y * CELL_SIZE
  drawPieceAt(ctx, piece, centerX, centerY)
}

// 在指定位置绘制棋子（实木质感效果）
const drawPieceAt = (ctx: CanvasRenderingContext2D, piece: Piece, centerX: number, centerY: number) => {
  const isRed = piece.color === 'red'

  // 红方：红木色调，黑方：黄杨木色调
  const textColor = isRed ? '#5A1A1A' : '#3D2A1A'
  const borderColor = isRed ? '#6B3A3A' : '#5A4A3A'
  const woodLine = isRed ? '#8B5A5A' : '#7A6A5A'

  // 1. 阴影（立体感）
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.beginPath()
  ctx.ellipse(centerX, centerY + PIECE_RADIUS * 0.9, PIECE_RADIUS * 0.8, PIECE_RADIUS * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 2. 底层（模拟厚度）
  ctx.save()
  ctx.fillStyle = isRed ? '#C08070' : '#9A8A7A'
  ctx.beginPath()
  ctx.arc(centerX, centerY + 3, PIECE_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 3. 主体（实木径向渐变）
  ctx.save()
  const gradient = ctx.createRadialGradient(
    centerX - PIECE_RADIUS * 0.3, centerY - PIECE_RADIUS * 0.3, 0,
    centerX, centerY, PIECE_RADIUS
  )
  if (isRed) {
    gradient.addColorStop(0, '#F5D5C5')
    gradient.addColorStop(0.3, '#E8B8A5')
    gradient.addColorStop(0.6, '#D49888')
    gradient.addColorStop(1, '#C08070')
  } else {
    gradient.addColorStop(0, '#F5E8D5')
    gradient.addColorStop(0.3, '#E8D8C0')
    gradient.addColorStop(0.6, '#D4C8B0')
    gradient.addColorStop(1, '#B8A898')
  }
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, PIECE_RADIUS, 0, Math.PI * 2)
  ctx.fill()

  // 边框
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // 4. 木纹纹理（多层线条）
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, centerY, PIECE_RADIUS - 1, 0, Math.PI * 2)
  ctx.clip()

  ctx.strokeStyle = woodLine
  ctx.globalAlpha = 0.2

  // 绘制弧形木纹
  for (let i = 0; i < 8; i++) {
    ctx.lineWidth = 0.3 + Math.random() * 0.4
    ctx.beginPath()
    const offset = (i - 4) * 6
    ctx.ellipse(centerX + offset * 0.5, centerY, PIECE_RADIUS * 1.2, PIECE_RADIUS * 0.8, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()

  // 5. 内圈装饰线（双线）
  ctx.save()
  ctx.strokeStyle = borderColor
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(centerX, centerY, PIECE_RADIUS * 0.82, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(centerX, centerY, PIECE_RADIUS * 0.78, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // 6. 高光（左上角）
  ctx.save()
  const highlightGrad = ctx.createRadialGradient(
    centerX - PIECE_RADIUS * 0.3, centerY - PIECE_RADIUS * 0.3, 0,
    centerX - PIECE_RADIUS * 0.3, centerY - PIECE_RADIUS * 0.3, PIECE_RADIUS * 0.4
  )
  highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
  highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = highlightGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, PIECE_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 7. 棋子文字
  ctx.fillStyle = textColor
  ctx.font = `bold ${PIECE_RADIUS * 0.7}px KaiTi, STKaiti, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const pieceNames: Record<string, string> = {
    general: isRed ? '帅' : '将',
    advisor: isRed ? '仕' : '士',
    elephant: isRed ? '相' : '象',
    horse: '馬',
    chariot: '車',
    cannon: isRed ? '炮' : '砲',
    soldier: isRed ? '兵' : '卒',
  }

  ctx.fillText(pieceNames[piece.type], centerX, centerY + 1)
}

// 绘制动画中的棋子
const drawAnimatingPiece = (ctx: CanvasRenderingContext2D) => {
  const anim = animation.value
  if (!anim.isAnimating) return

  // 计算当前位置
  const currentX = anim.fromX + (anim.toX - anim.fromX) * anim.progress
  const currentY = anim.fromY + (anim.toY - anim.fromY) * anim.progress

  // 绘制阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  drawPieceAt(ctx, anim.piece, currentX, currentY)

  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

// 绘制选中棋子的高亮
const drawSelectedHighlight = (ctx: CanvasRenderingContext2D) => {
  const piece = gameStore.selectedPiece
  if (!piece) return

  const x = MARGIN + piece.position.x * CELL_SIZE
  const y = MARGIN + piece.position.y * CELL_SIZE

  // 脉冲动画效果
  const time = Date.now() / 500
  const pulse = Math.sin(time * Math.PI) * 0.2 + 1

  ctx.beginPath()
  ctx.arc(x, y, PIECE_RADIUS + 3 * pulse, 0, Math.PI * 2)
  ctx.strokeStyle = '#00FF00'
  ctx.lineWidth = 3
  ctx.stroke()
}

// 绘制合法走法提示
const drawValidMoves = (ctx: CanvasRenderingContext2D) => {
  gameStore.validMoves.forEach(pos => {
    const x = MARGIN + pos.x * CELL_SIZE
    const y = MARGIN + pos.y * CELL_SIZE

    // 检查目标位置是否有棋子
    const targetPiece = gameStore.board.pieces[pos.y][pos.x]
    if (targetPiece) {
      // 有棋子：绘制红色圆圈表示可以吃子
      ctx.beginPath()
      ctx.arc(x, y, PIECE_RADIUS + 2, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'
      ctx.lineWidth = 3
      ctx.stroke()
    } else {
      // 无棋子：绘制绿色小圆点
      ctx.fillStyle = 'rgba(0, 180, 0, 0.6)'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

// 绘制最后一步的标记
const drawLastMove = (ctx: CanvasRenderingContext2D) => {
  const lastMove = gameStore.lastMove
  if (!lastMove) return

  // 起点高亮
  const fromX = MARGIN + lastMove.from.x * CELL_SIZE
  const fromY = MARGIN + lastMove.from.y * CELL_SIZE
  ctx.beginPath()
  ctx.arc(fromX, fromY, PIECE_RADIUS + 2, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)'
  ctx.lineWidth = 3
  ctx.stroke()

  // 终点高亮
  const toX = MARGIN + lastMove.to.x * CELL_SIZE
  const toY = MARGIN + lastMove.to.y * CELL_SIZE
  ctx.beginPath()
  ctx.arc(toX, toY, PIECE_RADIUS + 2, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)'
  ctx.lineWidth = 3
  ctx.stroke()
}

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 游戏已结束或正在动画，不响应点击
  if (gameStore.isGameOver || animation.value.isAnimating) return

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
      // 启动移动动画
      startMoveAnimation(
        gameStore.selectedPiece,
        gameStore.selectedPiece.position,
        clickedPosition
      )
      // 动画开始后立即执行移动逻辑
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
  if (!animation.value.isAnimating) {
    drawBoard()
  }
}, { deep: false })

// 选中高亮的脉冲动画
let pulseFrame: number | null = null
const startPulseAnimation = () => {
  const pulseLoop = () => {
    if (gameStore.selectedPiece && !animation.value.isAnimating) {
      drawBoard()
    }
    pulseFrame = requestAnimationFrame(pulseLoop)
  }
  pulseFrame = requestAnimationFrame(pulseLoop)
}

onMounted(() => {
  drawBoard()
  startPulseAnimation()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (pulseFrame) {
    cancelAnimationFrame(pulseFrame)
  }
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
