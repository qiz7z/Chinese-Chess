<template>
  <div class="home-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo">
          <span class="logo-icon">♟</span>
          <span class="logo-text">{{ t('logo') }}</span>
        </div>
        <div class="nav-right">
          <button @click="toggleLanguage" class="lang-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>{{ currentLang === 'zh' ? 'EN' : '中' }}</span>
          </button>
          <button @click="goToGame" class="play-btn">
            {{ t('startGame') }}
            <svg class="arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">{{ t('heroTitle1') }}</span>
          <span class="title-line highlight">{{ t('heroTitle2') }}</span>
        </h1>
        <p class="hero-subtitle">{{ t('heroSubtitle') }}</p>

        <div class="hero-cta">
          <button @click="goToGame" class="cta-button primary">
            {{ t('playNow') }}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <button @click="scrollToFeatures" class="cta-button secondary">
            {{ t('learnMore') }}
          </button>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">1000+</span>
            <span class="stat-label">{{ t('yearsHistory') }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">32</span>
            <span class="stat-label">{{ t('pieces') }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">AI</span>
            <span class="stat-label">{{ t('aiBattle') }}</span>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="board-preview">
          <div class="preview-grid"></div>

          <!-- 装饰性棋子 -->
          <div class="preview-pieces">
            <div class="preview-piece red-chariot" style="--piece-x: 1; --piece-y: 1;">車</div>
            <div class="preview-piece red-horse" style="--piece-x: 3; --piece-y: 2;">馬</div>
            <div class="preview-piece red-cannon" style="--piece-x: 7; --piece-y: 3;">炮</div>
            <div class="preview-piece black-chariot" style="--piece-x: 2; --piece-y: 6;">車</div>
            <div class="preview-piece black-horse" style="--piece-x: 5; --piece-y: 7;">馬</div>
            <div class="preview-piece black-cannon" style="--piece-x: 8; --piece-y: 8;">砲</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="section-header">
        <h2 class="section-title">{{ t('featuresTitle') }}</h2>
        <p class="section-subtitle">{{ t('featuresSubtitle') }}</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="feature-title">{{ t('feature1Title') }}</h3>
          <p class="feature-desc">{{ t('feature1Desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="feature-title">{{ t('feature2Title') }}</h3>
          <p class="feature-desc">{{ t('feature2Desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="feature-title">{{ t('feature3Title') }}</h3>
          <p class="feature-desc">{{ t('feature3Desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="feature-title">{{ t('feature4Title') }}</h3>
          <p class="feature-desc">{{ t('feature4Desc') }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">{{ t('ctaTitle') }}</h2>
        <p class="cta-desc">{{ t('ctaDesc') }}</p>
        <button @click="goToGame" class="cta-button large">
          {{ t('startGame') }}
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2026 {{ t('footer') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 语言状态
const currentLang = ref<'zh' | 'en'>('zh')

// 多语言配置
const messages = {
  zh: {
    logo: '中国象棋',
    startGame: '开始游戏',
    heroTitle1: '千年智慧',
    heroTitle2: '楚河汉界',
    heroSubtitle: '体验中国传统棋艺的魅力',
    playNow: '立即对战',
    learnMore: '了解更多',
    yearsHistory: '年历史',
    pieces: '枚棋子',
    aiBattle: '智能对战',
    featuresTitle: '游戏特色',
    featuresSubtitle: '经典规则，现代体验',
    feature1Title: '双人对战',
    feature1Desc: '与朋友同屏对弈，享受面对面博弈的乐趣',
    feature2Title: '人机对战',
    feature2Desc: '两种 AI 难度，从新手到大师都能找到对手',
    feature3Title: '完整规则',
    feature3Desc: '标准中国象棋规则，自动验证合法走法',
    feature4Title: '智能提示',
    feature4Desc: '将军检测、悔棋功能、走法提示',
    ctaTitle: '准备好开始了吗？',
    ctaDesc: '立即体验中国最经典的策略游戏',
    footer: '中国象棋游戏。传承经典，智享未来'
  },
  en: {
    logo: 'Chinese Chess',
    startGame: 'Play Now',
    heroTitle1: 'Ancient Wisdom',
    heroTitle2: 'Riverside Battle',
    heroSubtitle: 'Experience the charm of traditional Chinese chess',
    playNow: 'Start Game',
    learnMore: 'Learn More',
    yearsHistory: 'Years of History',
    pieces: 'Chess Pieces',
    aiBattle: 'AI Battle',
    featuresTitle: 'Features',
    featuresSubtitle: 'Classic rules, modern experience',
    feature1Title: 'Two Player',
    feature1Desc: 'Play against friends on the same screen for face-to-face fun',
    feature2Title: 'vs AI',
    feature2Desc: 'Two AI difficulty levels, from beginner to master',
    feature3Title: 'Full Rules',
    feature3Desc: 'Standard Chinese chess rules with automatic move validation',
    feature4Title: 'Smart Hints',
    feature4Desc: 'Check detection, undo moves, move suggestions',
    ctaTitle: 'Ready to Play?',
    ctaDesc: "Experience China's most classic strategy game now",
    footer: 'Chinese Chess Game. Preserving tradition, enjoying wisdom'
  }
}

// 翻译函数
const t = (key: string): string => {
  return (messages[currentLang.value] as any)[key] || key
}

// 切换语言
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}

const goToGame = () => {
  router.push('/game')
}

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEF2F8 50%, #FFF5F5 100%);
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(220, 38, 38, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Noto Serif TC', serif;
}

.logo-icon {
  font-size: 2rem;
  color: #DC2626;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7F1D1D;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: #7F1D1D;
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  border-color: #DC2626;
}

.lang-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover {
  background: #B91C1C;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: 'Noto Serif TC', serif;
  font-weight: 900;
  line-height: 1.1;
}

.title-line {
  font-size: clamp(3rem, 8vw, 6rem);
  color: #7F1D1D;
}

.title-line.highlight {
  color: #DC2626;
  letter-spacing: -0.05em;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #991B1B;
  font-family: 'Noto Sans TC', sans-serif;
  font-weight: 300;
}

.hero-cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 9999px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-button.primary {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.cta-button.secondary {
  background: transparent;
  color: #7F1D1D;
  border: 2px solid #DC2626;
}

.cta-button.secondary:hover {
  background: rgba(220, 38, 38, 0.1);
}

.cta-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(220, 38, 38, 0.2);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #DC2626;
  font-family: 'Noto Serif TC', serif;
}

.stat-label {
  font-size: 0.875rem;
  color: #991B1B;
  font-family: 'Noto Sans TC', sans-serif;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.board-preview {
  position: relative;
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #DEB887 0%, #D2A679 100%);
  border-radius: 1rem;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.2),
    0 0 0 10px rgba(220, 38, 38, 0.1);
  overflow: hidden;
}

.preview-grid {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  background-image:
    linear-gradient(#8B4513 1px, transparent 1px),
    linear-gradient(90deg, #8B4513 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

.preview-pieces {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.preview-piece {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%);
  border: 3px solid #8B4513;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Noto Serif TC', serif;
  font-size: 1.75rem;
  font-weight: 700;
  left: calc(10% + var(--piece-x) * 10%);
  top: calc(10% + var(--piece-y) * 9%);
  transform: translate(-50%, -50%);
  transition: all 0.3s;
}

.preview-piece:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.2);
}

.preview-piece[class*="red-"] {
  color: #C00;
}

.preview-piece[class*="black-"] {
  color: #000;
}

.preview-piece.red-chariot { left: calc(10% + 0 * 10%); top: calc(10% + 0 * 9%); }
.preview-piece.red-horse { left: calc(10% + 2 * 10%); top: calc(10% + 1 * 9%); }
.preview-piece.red-cannon { left: calc(10% + 7 * 10%); top: calc(10% + 2 * 9%); }
.preview-piece.black-chariot { left: calc(10% + 1 * 10%); top: calc(10% + 7 * 9%); }
.preview-piece.black-horse { left: calc(10% + 5 * 10%); top: calc(10% + 8 * 9%); }
.preview-piece.black-cannon { left: calc(10% + 8 * 10%); top: calc(10% + 9 * 9%); }

/* Features Section */
.features {
  padding: 6rem 2rem;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 700;
  font-family: 'Noto Serif TC', serif;
  color: #7F1D1D;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #991B1B;
  font-family: 'Noto Sans TC', sans-serif;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.feature-card {
  padding: 1.5rem 1rem;
  background: #FEF2F2;
  border-radius: 0.75rem;
  border: 1px solid rgba(220, 38, 38, 0.1);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(220, 38, 38, 0.15);
  border-color: #DC2626;
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #DC2626;
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: 'Noto Serif TC', serif;
  color: #7F1D1D;
  margin-bottom: 0.5rem;
}

.feature-desc {
  font-size: 0.875rem;
  color: #991B1B;
  font-family: 'Noto Sans TC', sans-serif;
  line-height: 1.5;
}

/* CTA Section */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
}

.cta-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Noto Serif TC', serif;
  color: white;
  margin-bottom: 1rem;
}

.cta-desc {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Noto Sans TC', sans-serif;
  margin-bottom: 2rem;
}

.cta-button.large {
  background: white;
  color: #DC2626;
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
}

.cta-button.large:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Footer */
.footer {
  padding: 2rem;
  background: #7F1D1D;
}

.footer-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    order: -1;
  }

  .board-preview {
    width: 400px;
    height: 400px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .play-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .hero {
    padding: 6rem 1rem 3rem;
  }

  .title-line {
    font-size: clamp(2.5rem, 10vw, 4rem);
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .board-preview {
    width: 300px;
    height: 300px;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-title {
    font-size: 2rem;
  }
}
</style>
