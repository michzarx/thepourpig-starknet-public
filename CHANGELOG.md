# Changelog / 更新日志

本文件记录 The Pour Pig 项目的所有重要变更。

---

## [0.4.3] - February 26, 2026

### ✨ 前端 / Frontend

- **Demo Mode - 录制辅助工具 / Demo Mode - Recording Helper**
  - 添加 `demo-mode.js` 用于演示视频录制
  - **假排行榜数据 / Fake Leaderboard Data**: 一条命令填充活跃的排行榜
    - `enableDemoMode()` - 激活假数据模式
    - All-Time 排行榜: 8 个假玩家 (分数 298-587)
    - Today 排行榜: 5 个假玩家 (竞争更激烈, #1 和 #2 只差 27 分)
    - 玩家数据: 今日最佳 380 分, 连续 3 天

  - **猪预览功能 / Pig Preview Feature**: 无需多次 mint 即可展示不同猪样式
    - `listPigPresets()` - 列出所有 8 个预设猪
    - `previewPig(1-8)` - 即时切换猪外观 (Common → Legendary)
    - 适用于录制时快速展示多样性,无需等待 VRF mint

  - **如何禁用 / How to Disable**:
    - 录制完成后,在 `index.html` 中重新注释 demo-mode 脚本
    - Push 到 GitHub,Netlify 自动部署后禁用

- **Demo 录制清单 / Demo Recording Checklist**
  - 添加 `docs/demo-recording-checklist.md` 完整录制指南
  - Shot-by-shot 镜头分解 (3 分钟 demo)
  - Demo Mode vs 真实数据 两种方案对比
  - 修复回合时长: 60s → 50s (与代码一致)

### 📝 文档 / Documentation

- **Demo 录制清单 / Demo Recording Checklist** (`docs/demo-recording-checklist.md`)
  - Phase 1: 录制前准备 (环境, 游戏状态练习)
  - Phase 2: 逐镜头录制指南 (9 个镜头)
  - Phase 3: 录制后处理 (审查, 音频, 剪辑)
  - Demo Mode 使用说明 (启用, 激活, 禁用)

---

## [0.4.2] - February 21, 2026

### 🛠 架构变更 / Architecture

- **Netlify 部署配置 / Netlify Deployment Configuration**
  - 添加根目录 `netlify.toml` 构建设置 (base: frontend, publish: dist)
  - 配置 SPA 路由 `force=false` 以允许静态资源直接访问
  - 添加 `frontend/public/_redirects` 文件用于明确的静态资源规则
  - 静态资源 (.glb, .js, .css, .svg, .json, 图片, 字体) 直接提供服务,无需重定向
  - 其他所有路由回退到 index.html

### ✨ 前端 / Frontend

- **字体全面升级 / Typography Overhaul**
  - 添加 Google Fonts: **Fredoka One** (标题, 按钮) 和 **Nunito** (正文, UI)
  - 所有文本现在使用活泼的圆角字体,匹配游戏的休闲风格

- **UI 重设计 - 3D 按钮风格 / UI Redesign - 3D Button Style**
  - 钱包按钮: 胶囊形状, 3D 阴影效果, 渐变背景 (#ff9a6a 到 #ff6b35), 白色边框
  - Mint 按钮: 特粗字体, 更大尺寸 (1.4rem), 三层阴影, 内部高光增加深度感
  - HUD 按钮 (分数/排行榜/成就): 玻璃态风格, 渐变叠加
  - 所有按钮具有弹性 cubic-bezier 动画, 字间距, 按压/激活状态

- **精致的视觉细节 / Polished Visual Details**
  - 标题: Fredoka One 字体, 字间距和文字阴影
  - 加载屏幕: 更大的标题 (3.5rem), 分层阴影效果
  - 排行榜/成就面板: 增强的排版, 统一的间距
  - 回合横幅 & 分数弹出: Fredoka One 字体增加视觉冲击力

- **UI 文字更新 / UI Text Updates**
  - 每日横幅: "Day #X" → "Daily Challenge"
  - 每日最佳: "Today: X" → "Your Best: X"
  - 连续天数: "X day streak" → "X day"
  - 更简洁、更对新手友好的文案

- **演示模式支持 / Demo Mode Support**
  - 添加 demo-mode.js 集成钩子 (在 index.html 中已注释)
  - 便于使用假排行榜数据进行录制

### 🐛 修复 / Bugfixes

- **修复 Netlify 上 3D 模型文件的 404 错误 / Fixed 404 errors for 3D model files on Netlify**
  - `poorPIG.glb` 和 `coin.glb` 现在可以在生产环境中正常加载
  - `_redirects` 文件格式比基于 TOML 的重定向更可靠
  - 明确的资源规则防止 Netlify 将文件请求重定向到 SPA 处理器

---

## [0.4.1] - February 12, 2026

### ✨ 前端 / Frontend

- **成就面板 UI / Achievements Panel UI**
  - 新增"成就"按钮在游戏 HUD 中 (连接钱包 + mint 小猪后显示)
  - 完整的成就列表,包含图标、名称和所有 6 个成就的详细描述
  - 视觉区分: 已解锁 (金色边框, 全彩) vs 未解锁 (灰色图标)
  - 未解锁成就的实时进度显示:
    - 分数成就: `Progress: 150/500 points`
    - 游戏次数: `Progress: 3/10 games`
    - 连续天数: `Progress: 2/3 days streak`
    - 每日冠军: `Ready to claim!` 或 `Not #1 today`

- **速度计算调整 / Speed Calculation Adjustment**
  - 固定基础移动速度: 行走 3, 跑步 6, 后退 2 (之前为 1.5/3/1)
  - VRF 提供的速度加成现在乘以基础速度: `1.0x - 1.5x` 范围
  - 公式: `speedMultiplier = 1 + (speedBonus / 20) * 0.5`

### 📝 用户体验 / UX

- **更好的成就透明度 / Better Achievement Transparency**
  - 玩家现在可以在尝试领取之前查看所有成就要求
  - 消除 "STREAK_TOO_SHORT" 错误带来的困惑
  - 进度指示器显示玩家距离解锁每个成就还有多近

---

## [0.4.0] - February 10, 2026 (Day 6: Daily Challenge + Power-ups)

### ✨ 智能合约 (Cairo) / Smart Contracts (Cairo)

- **每日排行榜系统 / Daily Leaderboard System**
  - `daily_scores` 存储: 跟踪每个玩家每天的最佳分数
  - `daily_leaderboard`: 每日前 10 名排名 (与总榜分开)
  - `get_daily_leaderboard_entry()`, `get_daily_leaderboard_size()`, `get_player_daily_score()`, `get_current_day()`

- **玩家连续天数跟踪 / Player Streak Tracking**
  - `player_streak` + `last_play_day` 存储
  - 连续每日游玩时自动增加, 有间断时重置
  - `get_player_streak()` 读取函数

- **新成就 / New Achievements**
  - 成就 #4: **每日冠军 / Daily Champion** — 在今日排行榜上获得第一名
  - 成就 #5: **连续大师 / Streak Master** — 连续游玩 3+ 天

- **合约重新部署 (V3) / Contract Redeployed (V3)**
  - 新地址: `0x07e0635703126ca36f634ed88bbb591679c8a982fced5f52744e0b08f1e5d141`
  - Class hash: `0x0d1905bec970bb545f159fa718d368409415479c1fd98e7414f368150d09f3d`

### ✨ 前端 / Frontend

- **道具系统 / Power-Up System** (3 种类型)
  - 🧲 **磁铁 / Magnet** (5秒): 吸引 8 单位半径内的 nearby 硬币
  - ⚡ **加速 / Speed** (4秒): 行走/跑步速度翻倍
  - ⏰ **冻结 / Freeze** (3秒): 暂停回合计时器, 延长其他道具
  - 每种都有独特的 3D 模型 (圆环/八面体/球体), 发光效果, 点光源, 脉冲动画
  - 碰撞检测, 粒子效果, 每种类型的合成音效

- **VRF 稀有度 → 道具加成 / VRF Rarity → Power-Up Bonuses**
  - 罕见: +0.5秒持续时间, 1 个初始道具
  - 稀有: +1.0秒持续时间, 1 个初始道具
  - 传说: +1.5秒持续时间, 2 个初始道具

- **每日挑战 UI / Daily Challenge UI**
  - 每日横幅: 天数, UTC 午夜倒计时, 今日最佳分数, 连续天数显示
  - 每 60 秒自动刷新, 断开连接时隐藏

- **排行榜标签 / Leaderboard Tabs**
  - "All Time" / "Today" 标签切换器
  - Today 标签从合约获取每日排行榜

- **新成就领取 / New Achievement Claims**
  - 每回合后自动尝试每日冠军 + 连续大师

### 🛠 架构变更 / Architecture

- **共享配置 / Shared Config** (`frontend/src/config.js`)
  - `CONTRACT_ADDRESS`, `VRF_PROVIDER`, `RPC_URL` 在一个文件中
  - `contract.js` 和 `controller.js` 都从这里导入
  - 重新部署后不再出现地址不匹配的 bug

### 🐛 修复 / Bugfixes

- **重新部署后 Controller 登录失败 / Controller login broken after redeploy**: `controller.js` 有旧的合约地址, 会话密钥策略与新合约不匹配

---

## [0.3.0] - February 9, 2026

### 🛠 架构变更 / Architecture

- **构建系统迁移 / Build System Migration**: 从原生 JS + CDN 迁移到 Vite + npm 模块
  - 更好的开发体验, 支持热模块替换和打包
  - 更容易集成 Starknet SDK
  - `npm create vite@latest frontend -- --template vanilla`

- **VRF 集成决策 / VRF Integration Decision**: 手动定义 VRF 接口而不是 `cartridge_vrf` 依赖
  - 避免 OpenZeppelin 版本冲突 (2.0.0 vs 3.0.0)
  - 更轻量的代码库, 相同的功能

### ✨ 智能合约 (Cairo) / Smart Contracts (Cairo)

- **PigNFT 合约 / PigNFT Contract** (`contracts/src/pig_nft.cairo`)
  - 基于 ERC721 的 NFT, 具有 VRF 生成的小猪属性
  - 属性: color_hue, speed_bonus, size_scale, rarity (0-3)
  - 每个玩家一只小猪 (类似灵魂绑定)

- **链上游戏机制 / Game Mechanics On-Chain**
  - `mint_pig()`: VRF 生成独特的小猪属性
  - `start_game()`: 跟踪每个玩家的游戏回合
  - `submit_score()`: 更新前 10 名排行榜
  - `claim_achievement()`: 4 个成就 (Coin Collector, Master, Veteran, Legend)

- **排行榜系统 / Leaderboard System**
  - 前 10 名全球排名
  - 提交分数时自动排序
  - 防止每回合重复提交

- **每日种子系统 / Daily Seed System**
  - `get_daily_seed()`: 从区块时间戳派生的确定性种子
  - 同一天的所有玩家硬币位置相同

- **VRF 接口 / VRF Interface** (`contracts/src/vrf_provider.cairo`)
  - Cartridge VRF 的手动接口定义
  - `consume_random(Source) -> felt252`
  - `request_random(caller, Source)`

### ✨ 前端 / Frontend

- **Three.js 游戏引擎 / Three.js Game Engine** (`frontend/src/main.js`)
  - 带有闲置/行走/跑步动画的 3D 小猪模型
  - 带弹簧阻尼跟随的第三人称相机
  - WASD + 箭头键移动, Shift 冲刺
  - 圆形世界边界 (半径: 40 单位)
  - 程序化环境 (树木, 岩石, 花朵, 草地)

- **区块链 UI 骨架 / Blockchain UI Skeleton**
  - 钱包连接按钮 (右上角)
  - VRF 小猪生成的 Mint 面板
  - 小猪属性显示 (颜色, 速度, 大小, 稀有度)
  - 排行榜面板 (前 10 名)
  - 分数 HUD, 带提交按钮
  - 成就显示 (4 个成就)

- **图案系统 / Pattern System**
  - 8 种小猪皮肤图案: Houndstooth, Stripes, Polka Dots, Plaid, Stars, Diamond, Chevron, Camo
  - 图案从 VRF color_hue + rarity 派生

### 🎮 游戏功能 / Game Features

- ✅ 带动画的 3D 小猪模型
- ✅ 平滑跟随的第三人称相机
- ✅ 键盘控制 (WASD + 箭头 + Shift)
- ✅ 程序化环境生成
- ✅ 圆形世界边界
- ⬜ 钱包连接 (计划: Cartridge Controller)
- ⬜ VRF mint 流程 (计划)
- ⬜ 收藏品生成 (计划)
- ⬜ 链上分数提交 (计划)

### 📝 文档 / Documentation

- **项目计划 / Project Plan** (`project-plan-v2.md`)
  - ETHGlobal SF 的 5 天构建计划
  - 每日任务分解
  - 合约架构设计

- **项目记忆 / Project Memory** (`memory.md`)
  - 活跃决策日志
  - 技术栈参考
  - 已知问题和待测试假设

- **黑客松研究 / Hackathon Research** (`hackathon-opportunities.md`)
  - SF 黑客松活动 (ethSF, DeSci, Aztec 等)
  - 奖金池和资格要求

---

## [0.1.0] - December 10, 2025 (Original Game / 原始游戏)

### ✨ 前端 / Frontend
- 初始 Three.js 游戏实现
- 带动画的 GLTF 小猪模型
- 第三人称相机系统
- 程序化环境生成
- 键盘控制 (WASD + 箭头)
- 阴影映射和照明

---

## Format / 格式

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

Categories / 分类:
- **🛠 Architecture** - Structural changes, build system, dependencies / 架构变更
- **✨ Smart Contracts** - Cairo contract changes / 智能合约
- **✨ Frontend** - UI, game engine, blockchain integration / 前端
- **🎮 Game Features** - Gameplay mechanics / 游戏功能
- **📝 Documentation** - Docs, plans, research / 文档
- **🐛 Bugfixes** - Bug fixes / 修复
