<template>
  <div class="game-page">
    <!-- Game Board Area -->
    <main class="game-board-area">
      <ChessBoard
        :board-size="Math.min(windowWidth * 0.95, 700)"
        @piece-click="handlePieceClick"
        @move="handleMove"
      />
    </main>

    <!-- Game Controls -->
    <aside class="game-controls-panel">
      <!-- 游戏图标 -->
      <div class="game-logo">
        <svg viewBox="0 0 200 200" class="logo-icon">
          <defs>
            <radialGradient id="gameRed" cx="50%" cy="40%" r="50%">
              <stop offset="0%" style="stop-color:#FCEBEB"/>
              <stop offset="100%" style="stop-color:#E24B4A"/>
            </radialGradient>
            <radialGradient id="gameBlack" cx="50%" cy="40%" r="50%">
              <stop offset="0%" style="stop-color:#F1EFE8"/>
              <stop offset="100%" style="stop-color:#5F5E5A"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="95" fill="#FCEBEB" stroke="#E24B4A" stroke-width="2"/>
          <circle cx="65" cy="75" r="28" fill="url(#gameRed)" stroke="#A32D2D" stroke-width="1.5"/>
          <circle cx="65" cy="75" r="22" fill="none" stroke="#A32D2D" stroke-width="0.8" opacity="0.4"/>
          <text x="65" y="80" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="22" font-weight="bold" fill="#791F1F">帅</text>
          <circle cx="135" cy="75" r="28" fill="url(#gameBlack)" stroke="#2C2C2A" stroke-width="1.5"/>
          <circle cx="135" cy="75" r="22" fill="none" stroke="#2C2C2A" stroke-width="0.8" opacity="0.4"/>
          <text x="135" y="80" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="22" font-weight="bold" fill="#18191C">将</text>
          <line x1="40" y1="115" x2="160" y2="115" stroke="#E24B4A" stroke-width="2" opacity="0.6"/>
          <circle cx="65" cy="140" r="16" fill="url(#gameRed)" stroke="#A32D2D" stroke-width="1"/>
          <text x="65" y="144" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="12" font-weight="bold" fill="#791F1F">車</text>
          <circle cx="135" cy="140" r="16" fill="url(#gameBlack)" stroke="#2C2C2A" stroke-width="1"/>
          <text x="135" y="144" text-anchor="middle" font-family="KaiTi, STKaiti, serif" font-size="12" font-weight="bold" fill="#18191C">車</text>
        </svg>
        <div class="logo-text">
          <span class="logo-title">{{ t('gameTitle') }}</span>
          <span class="logo-subtitle">{{ t('gameSubtitle') }}</span>
        </div>
      </div>

      <div class="control-section">
        <div class="control-header">
          <button @click="goHome" class="back-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{{ t('backToHome') }}</span>
          </button>
          
          <div class="turn-indicator" :class="gameStore.currentTurn">
            <span class="turn-icon">{{ gameStore.currentTurn === 'red' ? '🔴' : '⚫' }}</span>
            <span class="turn-text">{{ gameStore.currentTurn === 'red' ? t('redTurn') : t('blackTurn') }}</span>
          </div>
        </div>
        
        <div v-if="gameStore.isCheck" class="check-alert">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ t('check') }}</span>
        </div>

        <div v-if="gameStore.isGameOver" class="game-over-alert">
          <span v-if="gameStore.winner">
            🎉 {{ gameStore.winner === 'red' ? t('redWin') : t('blackWin') }}
          </span>
          <span v-else>🤝 {{ t('draw') }}</span>
        </div>
      </div>

      <div class="control-section">
        <h3 class="control-title">{{ t('gameSettings') }}</h3>

        <div class="mode-selector">
          <label class="mode-label">
            <input
              type="radio"
              v-model="selectedMode"
              value="pvp"
              @change="handleModeChange"
            />
            <span>{{ t('pvpMode') }}</span>
          </label>
          <label class="mode-label">
            <input
              type="radio"
              v-model="selectedMode"
              value="ai-easy"
              @change="handleModeChange"
            />
            <span>{{ t('aiEasyMode') }}</span>
          </label>
          <label class="mode-label">
            <input
              type="radio"
              v-model="selectedMode"
              value="ai-hard"
              @change="handleModeChange"
            />
            <span>{{ t('aiHardMode') }}</span>
          </label>
        </div>
      </div>

      <div class="control-section">
        <h3 class="control-title">{{ t('gameActions') }}</h3>

        <div class="action-buttons">
          <button @click="handleNewGame" class="action-btn new-game">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ t('newGame') }}
          </button>

          <button
            @click="handleUndo"
            class="action-btn undo"
            :disabled="gameStore.moveHistory.length === 0"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {{ t('undo') }}
          </button>

          <button
            @click="handleHint"
            class="action-btn hint"
            :disabled="!gameStore.selectedPiece"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {{ t('hint') }}
          </button>
        </div>
      </div>

      <div class="control-section">
        <h3 class="control-title">{{ t('moveHistory') }}</h3>

        <div class="move-history">
          <div
            v-for="(move, index) in gameStore.moveHistory"
            :key="index"
            class="move-item"
            :class="{ last: index === gameStore.moveHistory.length - 1 }"
          >
            <span class="move-number">{{ index + 1 }}.</span>
            <span class="move-text">{{ move.notation }}</span>
          </div>

          <div v-if="gameStore.moveHistory.length === 0" class="no-moves">
            {{ t('noMoves') }}
          </div>
        </div>
      </div>
    </aside>

    <!-- Popup Menu -->
    <div v-if="showMenu" class="popup-overlay" @click="toggleMenu">
      <div class="popup-menu" @click.stop>
        <button @click="handleNewGame" class="menu-item">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ t('newGame') }}
        </button>
        <button @click="handleUndo" class="menu-item" :disabled="gameStore.moveHistory.length === 0">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          {{ t('undo') }}
        </button>
        <button @click="goHome" class="menu-item">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ t('backToHome') }}
        </button>
        <button @click="toggleMenu" class="menu-item close">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { t } from '../i18n'
import ChessBoard from '../components/ChessBoard.vue'
import type { Piece, Position, GameMode } from '../types'

const router = useRouter()
const gameStore = useGameStore()

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const showMenu = ref(false)
const selectedMode = ref<GameMode>(gameStore.gameMode)

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const goHome = () => {
  router.push('/')
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handlePieceClick = (piece: Piece) => {
  if (piece.color !== gameStore.currentTurn) return
  gameStore.selectPiece(piece)
}

const handleMove = (from: Position, to: Position) => {
  gameStore.makeMove(from, to)
}

const handleModeChange = () => {
  gameStore.setGameMode(selectedMode.value)
}

const handleNewGame = () => {
  if (confirm(t('confirmNewGame'))) {
    gameStore.resetGame()
    toggleMenu()
  }
}

const handleUndo = () => {
  if (gameStore.moveHistory.length === 0) return
  
  // 如果是对战 AI，悔两步
  if (gameStore.gameMode !== 'pvp') {
    gameStore.undoMove()
    gameStore.undoMove()
  } else {
    gameStore.undoMove()
  }
  
  toggleMenu()
}

const handleHint = () => {
  if (!gameStore.selectedPiece) return
  
  // 简单随机提示
  const validMoves = gameStore.validMoves
  if (validMoves.length > 0) {
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    console.log('推荐走法:', randomMove)
    // 可以在这里添加视觉提示
  }
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  max-height: 100vh;
  display: grid;
  grid-template-columns: 300px 1fr;
  background: linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%);
  overflow: hidden;
}

/* Game Board Area */
.game-board-area {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%);
}

/* Game Logo */
.game-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(220, 38, 38, 0.2);
}

.logo-icon {
  width: 60px;
  height: 60px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Noto Serif TC', serif;
  color: #7F1D1D;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: #991B1B;
  font-family: 'Noto Sans TC', sans-serif;
}

/* Game Header */
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #7F1D1D;
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: #DC2626;
}

.back-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(220, 38, 38, 0.2);
  flex-wrap: wrap;
}

.turn-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #FEF2F2;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Noto Sans TC', sans-serif;
}

.turn-indicator.red {
  color: #DC2626;
}

.turn-indicator.black {
  color: #1F2937;
}

.check-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid #DC2626;
  border-radius: 0.5rem;
  color: #DC2626;
  font-weight: 600;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.check-alert svg {
  width: 1.25rem;
  height: 1.25rem;
}

.game-over-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.menu-btn {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: #DC2626;
}

.menu-btn svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #7F1D1D;
}

/* Game Board Area */
.game-board-area {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%);
}

/* Game Controls Panel */
.game-controls-panel {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  background: white;
  padding: 1.5rem 1rem;
  border-right: 1px solid rgba(220, 38, 38, 0.1);
  overflow-y: auto;
  max-height: 100vh;
}

.game-controls-panel::-webkit-scrollbar {
  width: 6px;
}

.game-controls-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.game-controls-panel::-webkit-scrollbar-thumb {
  background: #DC2626;
  border-radius: 3px;
}

.control-section {
  margin-bottom: 2rem;
}

.control-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: 'Noto Serif TC', serif;
  color: #7F1D1D;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(220, 38, 38, 0.2);
}

.mode-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mode-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #FEF2F2;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #991B1B;
}

.mode-label:hover {
  background: rgba(220, 38, 38, 0.1);
}

.mode-label input[type="radio"] {
  accent-color: #DC2626;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.action-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.action-btn.new-game {
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  color: white;
}

.action-btn.new-game:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
}

.action-btn.undo {
  background: #FEF2F2;
  color: #7F1D1D;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.action-btn.undo:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  border-color: #DC2626;
}

.action-btn.hint {
  background: #FEF2F2;
  color: #7F1D1D;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.action-btn.hint:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  border-color: #DC2626;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.move-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.move-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #FEF2F2;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.move-item.last {
  background: rgba(220, 38, 38, 0.1);
  font-weight: 600;
}

.move-number {
  color: #DC2626;
  font-weight: 600;
}

.move-text {
  color: #991B1B;
}

.no-moves {
  text-align: center;
  color: #9CA3AF;
  font-size: 0.875rem;
  padding: 1rem;
}

/* Popup Menu */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.popup-menu {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  min-width: 250px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #7F1D1D;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.menu-item:hover {
  background: #FEF2F2;
}

.menu-item svg {
  width: 1.25rem;
  height: 1.25rem;
}

.menu-item.close {
  color: #6B7280;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(220, 38, 38, 0.1);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .game-board-area {
    grid-column: 1 / -1;
    grid-row: 1 / 2;
    padding: 1rem;
  }

  .game-controls-panel {
    grid-column: 1 / -1;
    grid-row: 2 / 3;
    border-right: none;
    border-top: 1px solid rgba(220, 38, 38, 0.1);
    max-height: 40vh;
  }
}

@media (max-width: 768px) {
  .control-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .turn-indicator {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
  }

  .check-alert, .game-over-alert {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }

  .back-btn span {
    display: none;
  }

  .game-controls-panel {
    padding: 1rem;
  }

  .control-title {
    font-size: 1rem;
  }
}
</style>
