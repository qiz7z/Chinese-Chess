import { ref } from 'vue'

// 全局语言状态（使用 localStorage 持久化）
const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('chess-lang') : null
export const currentLang = ref<'zh' | 'en'>((savedLang as 'zh' | 'en') || 'zh')

// 切换语言
export const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('chess-lang', currentLang.value)
  }
}

// 翻译函数
export const t = (key: string): string => {
  return (messages[currentLang.value] as any)[key] || key
}

// 多语言配置
export const messages = {
  zh: {
    // 首页
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
    footer: '中国象棋游戏。传承经典，智享未来',

    // 游戏页
    gameTitle: '中国象棋',
    gameSubtitle: 'Chinese Chess',
    backToHome: '返回首页',
    redTurn: '红方走棋',
    blackTurn: '黑方走棋',
    check: '将军!',
    redWin: '红方获胜！',
    blackWin: '黑方获胜！',
    draw: '和棋！',
    gameSettings: '游戏设置',
    pvpMode: '双人对战',
    aiEasyMode: '人机对战 (简单)',
    aiHardMode: '人机对战 (强力)',
    gameActions: '游戏操作',
    newGame: '新游戏',
    undo: '悔棋',
    hint: '提示',
    moveHistory: '走棋历史',
    noMoves: '暂无走棋记录',
    confirmNewGame: '确定要开始新游戏吗？',
    close: '关闭',
  },
  en: {
    // Homepage
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
    footer: 'Chinese Chess Game. Preserving tradition, enjoying wisdom',

    // Game page
    gameTitle: 'Chinese Chess',
    gameSubtitle: '中国象棋',
    backToHome: 'Back to Home',
    redTurn: "Red's Turn",
    blackTurn: "Black's Turn",
    check: 'Check!',
    redWin: 'Red wins!',
    blackWin: 'Black wins!',
    draw: 'Draw!',
    gameSettings: 'Game Settings',
    pvpMode: 'Two Player',
    aiEasyMode: 'vs AI (Easy)',
    aiHardMode: 'vs AI (Hard)',
    gameActions: 'Actions',
    newGame: 'New Game',
    undo: 'Undo',
    hint: 'Hint',
    moveHistory: 'Move History',
    noMoves: 'No moves yet',
    confirmNewGame: 'Start a new game?',
    close: 'Close',
  }
}

export type Language = 'zh' | 'en'
