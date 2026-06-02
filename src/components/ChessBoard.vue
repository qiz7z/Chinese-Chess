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

// 棋盘配置 — 每次 drawBoard 时根据最新 boardWidth 重新计算
let CELL_SIZE = boardWidth.value / 9
let MARGIN = CELL_SIZE / 2
let PIECE_RADIUS = CELL_SIZE * 0.4

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

  // 每次绘制时重新计算棋盘尺寸（响应窗口缩放）
  CELL_SIZE = boardWidth.value / 9
  MARGIN = CELL_SIZE / 2
  PIECE_RADIUS = CELL_SIZE * 0.4

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
  gameStore.board.pieces.forEach((row: (Piece | null)[], y: number) => {
    row.forEach((piece: Piece | null, x: number) => {
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

// 在指定位置绘制棋子（古典实木风格 - 紫檀红 vs 黄杨金）
const drawPieceAt = (ctx: CanvasRenderingContext2D, piece: Piece, centerX: number, centerY: number) => {
  const isRed = piece.color === 'red'
  const r = PIECE_RADIUS

  // === 古典配色 ===
  // 红方 - 紫檀木：深沉红褐，沉稳厚重
  // 黑方 - 黄杨木：暖金象牙，温润雅致
  const woodCenter = isRed ? '#8B4545' : '#C8A870'
  const woodMid = isRed ? '#5C2020' : '#9B7B45'
  const woodEdge = isRed ? '#3D1515' : '#6B4E20'
  const rimHighlight = isRed ? '#A06050' : '#D4B896'
  const textColor = isRed ? '#1A0808' : '#1A0A02'
  const bevelLight = isRed ? '#B87070' : '#DDC8A8'

  // === 1. 地面阴影 - 厚重立体感 ===
  ctx.save()
  const shadowGrad = ctx.createRadialGradient(centerX, centerY + r * 0.85, r * 0.3, centerX, centerY + r * 0.85, r * 1.1)
  shadowGrad.addColorStop(0, 'rgba(30, 15, 5, 0.35)')
  shadowGrad.addColorStop(0.6, 'rgba(20, 10, 5, 0.15)')
  shadowGrad.addColorStop(1, 'rgba(20, 10, 5, 0)')
  ctx.fillStyle = shadowGrad
  ctx.beginPath()
  ctx.ellipse(centerX, centerY + r * 0.85, r * 0.85, r * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // === 2. 底层厚度 - 模拟木块厚度 ===
  ctx.save()
  ctx.fillStyle = isRed ? '#3A1515' : '#5A3E1A'
  ctx.beginPath()
  ctx.arc(centerX, centerY + 3, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // === 3. 棋子主体 - 深色径向渐变 ===
  ctx.save()
  const bodyGrad = ctx.createRadialGradient(
    centerX - r * 0.25, centerY - r * 0.25, 0,
    centerX, centerY, r * 1.05
  )
  bodyGrad.addColorStop(0, woodCenter)
  bodyGrad.addColorStop(0.35, woodCenter)
  bodyGrad.addColorStop(0.7, woodMid)
  bodyGrad.addColorStop(1, woodEdge)

  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // === 4. 倒角斜边 - 古典棋子边缘斜面 ===
  // 外圈较亮的倒角环
  ctx.save()
  const bevelGrad = ctx.createRadialGradient(
    centerX, centerY, r * 0.82,
    centerX, centerY, r * 0.97
  )
  bevelGrad.addColorStop(0, 'rgba(0,0,0,0)')
  bevelGrad.addColorStop(0.4, `rgba(${isRed ? '180,110,100' : '220,200,170'}, 0.15)`)
  bevelGrad.addColorStop(0.75, bevelLight)
  bevelGrad.addColorStop(1, rimHighlight)
  ctx.fillStyle = bevelGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // === 5. 外缘深色包边 - 古典棋子特征 ===
  ctx.save()
  ctx.strokeStyle = woodEdge
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(centerX, centerY, r - 1.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // === 6. 内圈装饰环 - 双环纹 ===
  // 外环
  ctx.save()
  ctx.strokeStyle = woodEdge
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.arc(centerX, centerY, r * 0.72, 0, Math.PI * 2)
  ctx.stroke()
  // 内环
  ctx.globalAlpha = 0.25
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.arc(centerX, centerY, r * 0.67, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // === 7. 木纹纹理 - 更自然的弧形纹理 ===
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, centerY, r - 2, 0, Math.PI * 2)
  ctx.clip()

  ctx.globalAlpha = 0.12
  for (let i = 0; i < 6; i++) {
    const offset = (i - 3) * r * 0.08
    const w = 0.4 + (i % 3) * 0.3
    ctx.strokeStyle = woodEdge
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.ellipse(centerX + offset * 0.6, centerY + offset * 0.3, r * 1.05, r * 0.7, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()

  // === 8. 表面温润高光 - 非纯白，暖色调 ===
  ctx.save()
  const highlightGrad = ctx.createRadialGradient(
    centerX - r * 0.35, centerY - r * 0.35, 0,
    centerX - r * 0.15, centerY - r * 0.2, r * 0.55
  )
  highlightGrad.addColorStop(0, `rgba(${isRed ? '255,230,210' : '255,245,225'}, 0.18)`)
  highlightGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = highlightGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // === 9. 棋子文字 - 雕刻内凹效果 ===
  const pieceNames: Record<string, string> = {
    general: isRed ? '帅' : '将',
    advisor: isRed ? '仕' : '士',
    elephant: isRed ? '相' : '象',
    horse: '馬',
    chariot: '車',
    cannon: isRed ? '炮' : '砲',
    soldier: isRed ? '兵' : '卒',
  }

  const charToDraw = pieceNames[piece.type]
  const fontSize = r * 0.92

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fontStr = `900 ${fontSize}px "STXingkai", "华文行楷", "STKaiti", "KaiTi", serif`
  ctx.font = fontStr

  // 雕刻凹槽底层 - 模拟光线射入凹槽底部的亮面
  ctx.save()
  ctx.fillStyle = `rgba(${isRed ? '255,220,200' : '255,240,215'}, 0.12)`
  ctx.fillText(charToDraw, centerX + r * 0.02, centerY + 1 + r * 0.02)
  ctx.restore()

  // 雕刻阴影侧 - 凹槽上沿投影
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillText(charToDraw, centerX - r * 0.015, centerY + 1 - r * 0.02)
  ctx.restore()

  // 主体文字
  ctx.save()
  ctx.fillStyle = textColor
  ctx.fillText(charToDraw, centerX, centerY + 1)

  // 轻描边让字更清晰
  ctx.strokeStyle = textColor
  ctx.lineWidth = r * 0.025
  ctx.lineJoin = 'round'
  ctx.strokeText(charToDraw, centerX, centerY + 1)
  ctx.restore()
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
  gameStore.validMoves.forEach((pos: Position) => {
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
      (move: Position) => move.x === gridX && move.y === gridY
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
