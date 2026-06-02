<div align="center">

# ♟ 中国象棋

### Chinese Chess

**传承千年智慧，智享楚河汉界**

[![Vue 3](https://img.shields.io/badge/Vue-3-42B883?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 游戏预览

<div align="center">

```
┌─────────────────────────────────────────┐
│  ♟ 中国象棋      [EN] [开始游戏]        │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  車  馬  相  士  将  士  相  馬  車 │   │
│   │                                 │   │
│   │        砲            砲         │   │
│   │                                 │   │
│   │  卒     卒     卒     卒     卒 │   │
│   │                                 │   │
│   │    楚          河          汉    │   │
│   │              界                │   │
│   │                                 │   │
│   │  兵     兵     兵     兵     兵 │   │
│   │                                 │   │
│   │        炮            炮         │   │
│   │                                 │   │
│   │  車  馬  相  仕  帅  仕  相  馬  車 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

</div>

## 功能特性

| 功能 | 说明 |
|------|------|
| 🎮 **双人对战** | 在同一屏幕上轮流下棋，享受面对面博弈的乐趣 |
| 🤖 **人机对战** | 两种 AI 难度，从新手到大师都能找到对手 |
| ♟️ **完整规则** | 实现所有中国象棋走棋规则，自动验证合法性 |
| 💡 **智能提示** | 将军检测、合法走法提示、悔棋功能 |
| 🎨 **精美界面** | 木质纹理棋子、流畅移动动画 |
| 🌍 **多语言** | 支持中文/英文切换 |
| 📱 **响应式** | 完美适配桌面和移动设备 |

## 技术栈

| 技术 | 用途 |
|------|------|
| **Vue 3** | 前端框架，Composition API |
| **TypeScript** | 类型安全 |
| **Vite** | 构建工具 |
| **Pinia** | 状态管理 |
| **HTML5 Canvas** | 棋盘渲染 |
| **Minimax + Alpha-Beta** | AI 算法 |

## 快速开始

### 环境要求

- Node.js >= 16.0
- npm >= 7.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 开始游戏。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 游戏规则

### 棋子走法

| 棋子 | 走法 | 限制 |
|------|------|------|
| **将/帅** | 每次走 1 格（上下左右） | 只能在九宫格内移动 |
| **士/仕** | 每次走斜线 1 格 | 只能在九宫格内移动 |
| **象/相** | 走"田"字 | 不能过河，有"塞象眼"限制 |
| **馬** | 走"日"字 | 有"别马腿"限制 |
| **車** | 直线移动（横或竖） | 不能越过其他棋子 |
| **炮** | 直线移动 | 吃子时必须隔一个棋子 |
| **兵/卒** | 过河前只能前进，过河后可横走 | 每次走 1 格 |

### 胜负判定

- **将死**：一方的将/帅被将军且无法解除
- **困毙**：一方无棋可走但未被将军

## AI 说明

### 简单 AI（难度 1）

使用贪心算法，评估每种走法的即时收益：
- 优先吃子
- 考虑棋子位置价值
- 反应时间 < 1 秒

### 强力 AI（难度 3）

使用 Minimax 算法 + Alpha-Beta 剪枝：
- 搜索深度 3 层
- 考虑未来走法的影响
- 反应时间 < 3 秒

## 项目结构

```
chinese-chess/
├── src/
│   ├── Views/
│   │   ├── HomePage.vue          # 首页
│   │   └── GamePage.vue          # 游戏页
│   ├── components/
│   │   └── ChessBoard.vue        # 棋盘组件
│   ├── stores/
│   │   └── game.ts               # 游戏状态 Store
│   ├── ai/
│   │   └── engine.ts             # AI 引擎
│   ├── rules/
│   │   └── validator.ts          # 走棋验证
│   ├── types/
│   │   └── index.ts              # 类型定义
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── App.vue                   # 主应用组件
│   └── main.ts                   # 应用入口
├── public/
│   └── favicon.svg               # 网站图标
├── package.json
└── vite.config.ts
```

## 开发说明

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 最佳实践
- 组件使用 `<script setup>` 语法

### 状态管理

游戏状态使用 Pinia Store 集中管理：

```typescript
interface GameState {
  board: Board              // 棋盘状态
  currentTurn: PieceColor   // 当前回合
  selectedPiece: Piece      // 选中的棋子
  moveHistory: Move[]       // 走棋历史
  gameMode: GameMode        // 游戏模式
  isGameOver: boolean       // 游戏是否结束
  winner: PieceColor | null // 获胜方
}
```

### 渲染机制

棋盘使用 HTML5 Canvas 渲染：
- 实体纹理棋子，双层圆环设计
- 流畅的移动动画（200ms）
- 选中高亮、合法走法提示
- 最后一步标记

## 扩展计划

- [ ] 添加音效和背景音乐
- [ ] 实现在线对战功能
- [ ] 增加更多 AI 难度等级
- [ ] 添加棋谱保存和加载
- [ ] 实现定式库和开局库
- [ ] 添加棋子皮肤选择
- [ ] 支持翻转棋盘

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**中国象棋** — 传承千年智慧，智享楚河汉界

</div>
