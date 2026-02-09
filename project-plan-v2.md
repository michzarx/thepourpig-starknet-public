# 🐷 The Pour Pig — 5-Day Implementation Plan (v2)

> **升级版**：加入 VRF 随机猪属性 + Cartridge Controller (AA) + 链上排行榜
> 三个 Starknet-native 特性让项目从"普通NFT游戏"升级为"Starknet技术showcase"

---

## 核心竞争力（vs 普通NFT游戏）

| 特性 | 技术 | 为什么评委会在意 |
|------|------|-----------------|
| **每只猪属性独一无二** | Cartridge VRF 链上随机数 | Mint时链上生成花纹/速度/大小/稀有度，同一个3D模型但视觉和玩法有差异（VRF驱动花纹纹理+缩放+速度加成） |
| **零签名游戏体验** | Cartridge Controller + Session Keys | 展示Starknet账户抽象的杀手级应用——玩家登录一次，游戏内操作无需弹窗 |
| **全球竞争排行榜** | Cairo合约存储 Map + 排序 | 链上存储top scores，任何人可验证，不可篡改 |
| **频繁Mint成就** | Starknet低gas | 每个成就都是链上交易，在ETH L1上不可能（gas太贵） |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Game** | Vanilla Three.js (keep existing) | 已经能跑，不需要迁移 |
| **钱包/AA** | `@cartridge/controller` | 一键登录 + session keys + 内置paymaster |
| **VRF随机数** | 手动定义 VRF 接口 + Cartridge Sepolia Provider | 同步链上随机，专为游戏设计 |
| **Smart Contract** | Cairo (OpenZeppelin ERC721 + 自定义逻辑) | VRF属性 + 排行榜 + 成就系统 |
| **Build Tool** | Vite | 快速，支持npm imports |
| **Deploy (frontend)** | Netlify / Vercel | 免费，即时部署 |
| **Deploy (contract)** | Starknet Sepolia testnet | 免费测试网 |

---

## Engineering Decision: 跳过 cartridge_vrf 依赖

### 问题
原计划使用 `cartridge_vrf` Cairo 组件，但遇到依赖冲突：

```
cartridge_vrf  要求: openzeppelin = "2.0.0"
本项目使用:    openzeppelin_token = "3.0.0"
```

Cairo 包管理器不允许同时存在两个不同 major 版本的 OpenZeppelin。

### 解决方案
**手动定义 VRF 接口，而不是导入整个 cartridge_vrf 依赖：**

```cairo
// vrf_provider.cairo — 手动定义的接口
#[starknet::interface]
pub trait IVrfProvider<TContractState> {
    fn consume_random(ref self: TContractState, source: Source) -> felt252;
    fn request_random(ref self: TContractState, caller: ContractAddress, source: Source);
}
```

然后在 `pig_nft.cairo` 里直接调用 Sepolia 上的真实 VRF Provider 合约：

```cairo
let vrf = IVrfProviderDispatcher {
    contract_address: 0x051fea...,  // Cartridge VRF on Sepolia
};
let random = vrf.consume_random(Source::Nonce(get_contract_address()));
```

### 为什么这样能工作？

这就像调用外部 API —— **你不需要拥有服务器的源代码，只需要知道接口签名：**

| 方式 | 描述 |
|------|------|
| 用 cartridge_vrf 依赖 | 就像下载了某个 API 的 SDK，但 SDK 依赖的库版本和你项目冲突 |
| 手动定义接口 | 就像直接 `fetch(url)` 调用 API —— 只要你知道 URL 和参数格式 |

### 优势

✅ 避免了依赖地狱 (version conflict)
✅ 代码更少依赖，更轻量
✅ 功能完全相同 (接口兼容)
✅ 降低了 OpenZeppelin 2.x → 3.x 的迁移成本
✅ 符合 "One Sharp Knife" 哲学

### 唯一风险

必须确保接口签名完全正确 —— 如果 Cartridge VRF 合约的实际函数签名和定义的不一样，调用会失败。可以通过 [Cartridge VRF 合约代码](https://github.com/cartridge-gg/vrf) 验证。

---

## 项目结构

```
thepourpig-starknet/
├── contracts/                    # Cairo 智能合约
│   ├── Scarb.toml               # 依赖: openzeppelin 3.0.0 (手动定义 VRF 接口)
│   └── src/
│       ├── lib.cairo
│       ├── pig_nft.cairo         # ERC721 + VRF随机属性
│       ├── leaderboard.cairo     # 链上排行榜
│       └── achievements.cairo    # 成就系统
├── frontend/                     # Vite + Three.js
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── src/
│   │   ├── game.js              # Three.js 游戏主逻辑（从现有game.js迁移）
│   │   ├── collectibles.js      # 收集品系统
│   │   ├── controller.js        # Cartridge Controller 连接
│   │   ├── contract.js          # 合约交互（mint, leaderboard, achievements）
│   │   ├── pig-renderer.js      # 根据链上属性渲染猪的外观
│   │   └── ui.js                # HUD, 排行榜面板, 成就弹窗
│   └── public/
│       ├── poorPIG.glb
│       └── sfx/                 # 音效文件
├── scripts/                     # 部署脚本
├── README.md
└── implementation-plan.md
```

---

## Smart Contract 设计

### PigNFT 合约核心逻辑

```cairo
// 猪的链上属性 — 由VRF随机数在mint时决定
struct PigAttributes {
    color_r: u8,        // 0-255 色调偏移
    color_g: u8,
    color_b: u8,
    speed_bonus: u8,    // 0-20 速度加成百分比
    size_scale: u8,     // 80-120 大小百分比
    rarity: u8,         // 0=common, 1=uncommon, 2=rare, 3=legendary
}

// 存储
storage {
    pig_attributes: Map<u256, PigAttributes>,     // token_id → attributes
    player_pig: Map<ContractAddress, u256>,        // wallet → token_id
    leaderboard: Map<u32, LeaderboardEntry>,       // rank → {address, score}
    leaderboard_size: u32,
    player_scores: Map<ContractAddress, u32>,      // wallet → best score
    achievements: Map<(ContractAddress, u8), bool>, // (wallet, achievement_id) → earned
}

// 关键函数
fn mint_pig(ref self)
    // 1. 检查该钱包没有猪
    // 2. consume_random() 获取VRF随机数
    // 3. 从随机数派生 PigAttributes
    // 4. mint ERC721
    // 5. 存储属性

fn submit_score(ref self, score: u32)
    // 1. 验证caller有猪
    // 2. 如果 score > player_scores[caller]，更新
    // 3. 如果进入top 10，更新leaderboard

fn claim_achievement(ref self, achievement_id: u8)
    // 1. 验证caller有猪
    // 2. 验证成就条件（由前端提交证明）
    // 3. 标记成就已获得

fn get_pig_attributes(self, token_id: u256) -> PigAttributes
fn get_leaderboard(self) -> Array<LeaderboardEntry>
fn get_player_achievements(self, player: ContractAddress) -> Array<u8>
```

### VRF 属性派生逻辑

```
random_number (felt252)
  ├── bytes[0-2]  → color RGB
  ├── bytes[3]    → speed_bonus (0-20)
  ├── bytes[4]    → size_scale (80-120)
  └── bytes[5]    → rarity (weighted: 60% common, 25% uncommon, 10% rare, 5% legendary)
```

---

## Cartridge Controller 集成

```javascript
// controller.js — 极简集成
import Controller from "@cartridge/controller";

const SESSION_POLICIES = {
  contracts: {
    "0xYOUR_CONTRACT": {
      name: "The Pour Pig",
      methods: [
        { name: "mint_pig", entrypoint: "mint_pig" },
        { name: "submit_score", entrypoint: "submit_score" },
        { name: "claim_achievement", entrypoint: "claim_achievement" },
      ],
    },
  },
};

const controller = new Controller({
  policies: SESSION_POLICIES,
  chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" }],
});

// 一键连接 — 用户看到Cartridge登录界面
// 支持: 用户名密码 / Google / Discord / Phantom
export async function connect() {
  const account = await controller.connect();
  return account; // 后续所有交易自动签名，无需弹窗
}
```

**用户体验对比：**
| 操作 | 传统钱包 (Argent X) | Cartridge Controller |
|------|---------------------|---------------------|
| 首次登录 | 安装扩展 → 创建钱包 → 备份助记词 | 点击Connect → 输入用户名 → 完成 |
| Mint猪 | 弹窗确认 → 签名 → 等待 | 自动执行（session key） |
| 提交分数 | 弹窗确认 → 签名 → 等待 | 自动执行 |
| 领取成就 | 弹窗确认 → 签名 → 等待 | 自动执行 |

---

## 5-Day Detailed Plan

### Day 1: 环境搭建 + Cairo合约开发 (8h)

**目标**: 合约编译通过，本地测试VRF + 排行榜逻辑

#### 上午 (4h) — 环境 + 合约骨架
- [ ] 安装开发工具（一条命令）：
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.starkup.dev | sh
  ```
  安装后验证：`scarb --version` (expect ≥2.15.1) + `snforge --version` (expect ≥0.56.0)
- [ ] 初始化 Cairo 项目：`scarb init contracts`
- [ ] 配置 `Scarb.toml` 依赖：
  ```toml
  [dependencies]
  openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts" }
  cartridge_vrf = { git = "https://github.com/cartridge-gg/vrf" }
  ```
- [ ] 编写 `pig_nft.cairo` 核心结构：
  - ERC721 基础（OpenZeppelin component）
  - `PigAttributes` struct
  - Storage layout（attributes map, leaderboard map, achievements map）
  - Constructor（接收 vrf_provider 地址）

#### 下午 (4h) — 合约逻辑 + 编译
- [ ] 实现 `mint_pig` — VRF consume_random + 属性派生 + ERC721 mint
- [ ] 实现 `submit_score` — 更新个人最高分 + 排行榜 top 10
- [ ] 实现 `claim_achievement` — 标记成就
- [ ] 实现 view 函数：`get_pig_attributes`, `get_leaderboard`, `get_player_achievements`
- [ ] `scarb build` 编译通过
- [ ] 用 `snforge test` 写基础单元测试

**Deliverable**: 合约编译通过，核心逻辑完成 ✅

---

### Day 2: 合约部署 + 前端脚手架 + Cartridge Controller (8h)

**目标**: 合约部署到Sepolia，前端连接Cartridge Controller，能调用合约

#### 上午 (4h) — 部署 + 验证
- [ ] 创建 Sepolia 部署账户（可以用 Cartridge 或 Argent）
- [ ] 获取测试 STRK（Alchemy faucet）
- [ ] `sncast declare` 声明合约
- [ ] `sncast deploy` 部署合约（传入 VRF provider 地址）
  - Cartridge VRF provider on Sepolia: 查文档获取地址
- [ ] 在 Voyager 上验证合约
- [ ] 用 `sncast invoke` 手动测试 mint_pig（通过 multicall 带 VRF request）

#### 下午 (4h) — Vite 项目 + Cartridge Controller
- [ ] 初始化 Vite 项目：
  ```bash
  npm create vite@latest frontend -- --template vanilla
  cd frontend
  npm install three @cartridge/controller starknet
  ```
- [ ] 迁移 `game.js` 和 `index.html` 到 Vite 结构
- [ ] 将 Three.js 从 CDN importmap 改为 npm import
- [ ] 创建 `controller.js`：
  - Cartridge Controller 初始化（带 session policies）
  - `connect()` / `disconnect()` / `getAccount()`
- [ ] 创建 `contract.js`：
  - 合约 ABI 加载
  - `mintPig(account)` — 构建 multicall（VRF request + mint_pig）
  - `getPigAttributes(tokenId)` — 读取链上属性
  - `getLeaderboard()` — 读取排行榜
- [ ] 测试：连接 Cartridge → 调用合约 → 控制台打印结果

**Deliverable**: 前端能连接Cartridge并调用合约 ✅

---

### Day 3: Coin Rush 玩法 + Starknet深度集成 (8h) ✅ DONE

**目标**: 真正的游戏玩法 — 60秒限时收集金币，VRF属性影响游戏，链上计时防作弊

#### 合约升级 (完成)
- [x] `start_game()` — 链上记录游戏开始时间戳
- [x] `submit_score()` — 验证 `block_timestamp - start_time ≤ 65s`，防止无限刷分
- [x] `claim_achievement()` — 链上验证成就条件：
  - Achievement 0: "Coin Collector" — score ≥ 100
  - Achievement 1: "Coin Master" — score ≥ 500
  - Achievement 2: "Veteran" — 玩过 10+ 局
  - Achievement 3: "Legend" — score ≥ 1000
- [x] `get_daily_seed()` — Poseidon hash(day_number) → 每日确定性种子
- [x] `games_played` 计数器
- [x] 11/11 测试通过（含轮次过期、成就验证、每日种子一致性）

#### 前端 Coin Rush 玩法 (完成)
- [x] **15个普通金币** (10分/个) + **1个黄金金币** (50分) — 旋转+浮动动画
- [x] 金币位置由 `get_daily_seed()` 决定 — 所有玩家同一天看到相同布局
- [x] **60秒倒计时** — 链上 `start_game()` 记录开始，前端本地计时
- [x] 碰撞检测：猪靠近金币 → 自动收集 → 金币消失 → 分数增加
- [x] 轮次结束 → 显示最终分数 → 提交到链上 → 自动尝试领取成就

#### VRF属性影响游戏 (完成)
- [x] `speed_bonus` (0-20) → 实际移动速度 1.0x-1.5x（快猪收集更多金币！）
- [x] `size_scale` (80-120) → 猪的3D模型大小
- [x] `color_hue` (0-360) + `rarity` → 猪的花纹纹理（8种图案 × 360色相 = 无限组合）
  - 花纹由 `(colorHue + rarity * 37) % 8` 决定：千鸟格、条纹、波点、格子、星星、菱形、人字纹、迷彩
  - 花纹颜色由 `colorHue` 的HSL色相决定，叠加在猪的粉色底色上
  - 使用 Canvas2D 程序化生成纹理 → Three.js CanvasTexture 直接替换材质贴图
- [x] 稀有猪 = 更高speed_bonus概率 = 竞争优势

#### Starknet集成亮点
- **VRF不只是mint** — 每日金币位置也来自链上确定性随机
- **防作弊** — 分数必须在 `start_game()` 后65秒内提交
- **成就可验证** — 合约检查分数/局数，不是前端自报
- **Session keys** — Cartridge Controller 让 start_game + submit_score 无弹窗

**Deliverable**: 完整Coin Rush玩法，Starknet深度集成 ✅

---

### Day 4: 成就系统 + 排行榜 + 打磨 (8h)

**目标**: 链上成就、排行榜UI、粒子特效、音效

#### 上午 (4h) — 成就 + 排行榜
- [ ] 成就系统（3个）：
  - 🥇 **"First Steps"** — 收集10个金币 → 自动 claim_achievement(0)
  - 👑 **"Gem Collector"** — 收集全部5个宝石 → claim_achievement(1)
  - 💎 **"Legendary Find"** — 找到传奇物品 → claim_achievement(2)
- [ ] 成就触发时：
  1. 游戏短暂暂停
  2. Three.js 粒子爆炸庆祝动画
  3. 显示成就卡片 + 链上交易状态
  4. 因为 Cartridge session key → **无需弹窗签名，自动执行**
  5. 恢复游戏
- [ ] 排行榜UI面板：
  - 按 Tab 键打开/关闭
  - 显示 Top 10 玩家（地址 + 分数）
  - 当前玩家排名高亮
  - 数据从合约 `get_leaderboard()` 读取
- [ ] 游戏结束时（收集完所有物品）：
  - 自动调用 `submit_score(totalScore)`
  - 显示最终分数 + 排行榜排名
  - "Play Again" 按钮（重新生成收集品）

#### 下午 (4h) — 视觉 + 音效 + 性能
- [ ] 粒子效果：
  - 金币收集：小型金色火花
  - 宝石收集：彩色爆炸
  - 成就：全屏庆祝（五彩纸屑）
  - Legendary猪：持续粒子尾迹
- [ ] 音效（免费SFX）：
  - 金币："叮"
  - 宝石：魔法音效
  - 成就：号角
  - 背景：自然环境音（可选）
- [ ] UI统一：
  - 配色：绿色(#10B981) + Starknet紫(#6F42C1) + 深色背景(#1F2937)
  - 所有按钮/面板统一圆角、阴影、hover效果
  - Cartridge Controller 品牌色融入
- [ ] 性能优化：
  - 金币用 InstancedMesh（一个draw call渲染20个）
  - 粒子用 BufferGeometry
  - 确保60fps

**Deliverable**: 完整打磨的游戏，链上成就+排行榜 ✅

---

### Day 5: 部署 + 视频 + 提交 (8h)

**目标**: 上线、录制视频、提交DoraHacks

#### 上午 (4h) — 部署 + QA
- [ ] 前端部署到 Netlify/Vercel：
  - 环境变量：合约地址、RPC URL、Chain ID
  - 测试线上URL端到端
- [ ] 完整QA：
  - 新用户流程：无账户 → Cartridge注册 → mint猪 → 看到独特属性 → 玩游戏 → 获得成就 → 提交分数 → 排行榜
  - 老用户流程：已有猪 → 直接玩
  - 错误场景：拒绝交易、网络慢、刷新页面
  - 不同浏览器测试（Chrome, Firefox）
- [ ] 写 README.md：
  - 项目简介 + 截图/GIF
  - **重点突出三个Starknet特性**（VRF, AA, 链上排行榜）
  - Tech stack + 架构图
  - 本地运行步骤
  - 合约地址 + Voyager链接
  - Live demo链接

#### 下午 (4h) — 视频 + 提交
- [ ] 录制3分钟Demo视频：
  - **0:00-0:15** — Hook: "Every pig is unique. Every score is on-chain. Zero popups."
  - **0:15-0:40** — 问题: 链游体验差（安装钱包、反复签名、千篇一律的NFT）
  - **0:40-1:00** — 解决方案: Starknet AA + VRF + 低gas
  - **1:00-1:20** — Demo: Cartridge一键登录（展示无需安装扩展）
  - **1:20-1:40** — Demo: Mint猪 → 展示VRF生成的独特属性（颜色/速度/稀有度）
  - **1:40-2:10** — Demo: 玩游戏 → 收集道具 → 成就自动mint（**无签名弹窗！**）
  - **2:10-2:30** — Demo: 提交分数 → 链上排行榜 → Voyager验证
  - **2:30-2:50** — 技术: Cairo + Cartridge VRF + Controller + Three.js
  - **2:50-3:00** — CTA: "Try it: [链接]" + "Built for Starknet Re{define}"
- [ ] 提交 DoraHacks：
  - GitHub repo
  - Demo视频（YouTube/Loom）
  - Live demo URL
  - 项目描述（500字英文，突出三个Starknet特性）
  - Sepolia合约地址

**Deliverable**: 已提交 DoraHacks ✅

---

## Architecture Overview (v2)

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND (Vite)                      │
│                                                          │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Three.js │  │  Cartridge    │  │  Contract Module │  │
│  │ Game     │  │  Controller   │  │                  │  │
│  │ Engine   │  │  (AA + Session│  │  - mintPig()     │  │
│  │          │  │   Keys)       │  │  - submitScore() │  │
│  │ - pig    │  │               │  │  - claimAchieve()│  │
│  │ - items  │  │  一键登录     │  │  - getLeaderboard│  │
│  │ - VFX    │  │  无签名交易   │  │  - getAttributes │  │
│  └────┬─────┘  └───────┬───────┘  └────────┬─────────┘  │
│       │                │                    │            │
│  ┌────▼────────────────▼────────────────────▼─────────┐  │
│  │              pig-renderer (main.js)                  │  │
│  │   链上属性 → Canvas2D花纹纹理 → Three.js材质        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   STARKNET SEPOLIA                        │
│                                                          │
│  ┌─────────────────────┐  ┌────────────────────────┐    │
│  │  Cartridge VRF      │  │  PigNFT Contract       │    │
│  │  Provider           │  │                        │    │
│  │                     │  │  ERC721 (OpenZeppelin)  │    │
│  │  request_random() ──┼──▶  mint_pig()            │    │
│  │                     │  │    └─ consume_random()  │    │
│  │  链上可验证随机数   │  │    └─ 生成 PigAttributes│    │
│  └─────────────────────┘  │                        │    │
│                           │  submit_score()        │    │
│                           │    └─ 更新排行榜Top10  │    │
│                           │                        │    │
│                           │  claim_achievement()   │    │
│                           │    └─ 标记成就         │    │
│                           │                        │    │
│                           │  get_leaderboard()     │    │
│                           │  get_pig_attributes()  │    │
│                           │  get_achievements()    │    │
│                           └────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 游戏流程图

```
[打开网页]
    │
    ▼
[显示游戏背景(模糊) + "Connect & Play" 按钮]
    │
    ▼
[Cartridge Controller 登录]  ← 一键注册/登录，无需安装扩展
    │
    ├── 已有猪NFT ──────────────────────────┐
    │                                       │
    ▼                                       ▼
[显示 "Mint Your Unique Pig"]        [读取链上属性]
    │                                       │
    ▼                                       │
[VRF Mint → 链上生成随机属性]               │
    │                                       │
    ▼                                       │
[显示属性卡片: 颜色/速度/大小/稀有度]       │
    │                                       │
    ▼                                       ▼
[进入游戏 — 猪的外观反映链上属性]
    │
    ▼
[收集金币(10分) + 宝石(50分) + 传奇(200分)]
    │
    ├── 10金币 → 🥇 成就自动mint（无弹窗）
    ├── 5宝石  → 👑 成就自动mint（无弹窗）
    ├── 传奇   → 💎 成就自动mint（无弹窗）
    │
    ▼
[全部收集完 → 提交分数到链上]
    │
    ▼
[显示排行榜 + 你的排名 + "Play Again"]
```

---

## Risk Mitigation

| 风险 | 概率 | 应急方案 |
|------|------|---------|
| Cartridge VRF 在 Sepolia 不可用 | 低 | 用 block hash 做伪随机（不可验证但能跑） |
| Cartridge Controller 集成问题 | 中 | 降级为 starknetkit + Argent X（失去session key优势） |
| Cairo 合约 bug | 中 | 简化排行榜逻辑（只存个人最高分，不排序） |
| 时间不够做排行榜UI | 中 | 排行榜只在控制台显示，优先保证mint+游戏循环 |
| 60fps 性能问题 | 低 | 减少粒子数量，金币用 InstancedMesh |

## 优先级（如果时间不够）

**必须有（Day 1-3）：**
- ✅ Cartridge Controller 登录
- ✅ VRF Mint 独特猪
- ✅ 猪属性可视化
- ✅ 收集品系统

**应该有（Day 4）：**
- ✅ 链上排行榜
- ✅ 成就系统（自动mint）
- ✅ 粒子特效

**锦上添花（Day 4-5）：**
- ⬜ 音效
- ⬜ 移动端适配
- ✅ 多种猪皮肤（8种VRF花纹纹理：千鸟格/条纹/波点/格子/星星/菱形/人字纹/迷彩）

---

## 评委视角：为什么这个项目值得获奖

### 技术深度
> "这不是一个简单的NFT mint页面。它用了 **Cartridge VRF** 做链上随机生成，**Cartridge Controller** 做无签名游戏体验，**链上排行榜** 做去中心化竞争。三个Starknet-native特性的有机结合。"

### 用户体验
> "玩家从打开网页到开始玩游戏只需要30秒。不需要安装钱包扩展，不需要备份助记词，游戏内操作零弹窗。这就是账户抽象应该带来的体验。"

### 创新性
> "每只猪的属性是链上VRF生成的，不是预设的。花纹纹理、速度、大小都不同，稀有度有权重分布。8种经典花纹（千鸟格、条纹、波点等）× 360种色相 = 每只猪视觉上独一无二。这让NFT从'一张图片'变成了'一个有属性的链上实体'。"

### Starknet优势展示
> "在以太坊L1上，每次成就mint要花$5-20 gas。在Starknet上，这几乎免费。这个游戏在一局中可能触发3-4次链上交易，只有Starknet的低gas费让这成为可能。"

---

## FAQ — 技术可行性验证

### Q: VRF随机猪属性是实时的吗？不需要等回调？
**A: 是的，一笔交易完成。** Cartridge VRF 是同步/原子的（和 Chainlink VRF 不同）。前端构建一个 multicall，把 `request_random` 和 `mint_pig` 打包在同一笔TX里。Cartridge Paymaster 拦截交易，生成VRF证明，你的合约在同一笔TX内调用 `consume_random()` 立即拿到随机数。用户点击Mint → 一笔TX确认（Sepolia约2-5秒）→ 猪的属性就生成好了。

```javascript
// 前端 multicall — 一笔交易搞定
account.execute([
  { contract: VRF_PROVIDER, entrypoint: 'request_random', calldata: [...] },
  { contract: PIG_CONTRACT, entrypoint: 'mint_pig', calldata: [...] },
]);
```

### Q: "每只猪独一无二"具体是什么意思？
**A: 同一个3D模型（poorPIG.glb），但花纹/大小/速度/稀有度由链上VRF决定。** 不是完全不同的猪模型，是参数化变体。VRF返回一个 `felt252`（~31字节），用模运算派生多个属性：

```cairo
let color_hue = random % 360;           // 色调 0-359 → 决定花纹颜色+花纹类型
let speed_bonus = (random / 360) % 21;  // 速度加成 0-20%
let size_scale = (random / 7560) % 41 + 80; // 大小 80-120%
let rarity_roll = (random / 309960) % 100;  // 稀有度 0-99
```

Three.js端应用：
- **花纹纹理**: `(colorHue + rarity * 37) % 8` 选择8种花纹之一（千鸟格/条纹/波点/格子/星星/菱形/人字纹/迷彩）
- Canvas2D 程序化绘制花纹 → `THREE.CanvasTexture` → 替换猪模型的 `material.map`
- 花纹颜色由 `colorHue` HSL色相决定，底色为猪的粉色皮肤
- `pig.scale.set(s,s,s)` + 修改 `CONFIG.walkSpeed`

### Q: Cartridge Controller 真的免费吗？谁付gas？
**A: Sepolia测试网上完全免费。** 测试STRK从faucet获取（Alchemy / Starknet Foundation）。Cartridge Controller SDK是开源的（`npm install @cartridge/controller`）。Controller内置Paymaster，VRF流程中Paymaster自动包装交易。如果未来上mainnet，Starknet gas费极低（~$0.001/TX），但hackathon demo只需要Sepolia。

### Q: 链上排行榜会不会很贵（存储成本）？
**A: 不会。** 只存Top 10（10个 `{address, score}` 条目），不是所有玩家的分数。Cairo的 `Map<u32, LeaderboardEntry>` 存储成本极低。每次 `submit_score` 只更新需要变动的slot。在Sepolia上完全免费。

### Q: 成就"自动mint"是什么意思？不需要用户确认？
**A: 对，因为Session Keys。** Cartridge Controller在用户首次连接时预授权了 `claim_achievement` 方法。之后游戏内触发成就时，前端直接调用合约，不弹签名窗口。这就是Starknet账户抽象的核心优势。

### Q: 这些功能需要我花钱吗？
**A: 零成本。** 所有工具开源免费，测试网gas免费，部署平台（Netlify）免费tier足够，DoraHacks提交免费。

---

## Key Resources
- [Cartridge Controller Docs](https://docs.cartridge.gg/controller/getting-started)
- [Cartridge VRF (Cairo)](https://github.com/cartridge-gg/vrf)
- [Cairo Book — Randomness with Cartridge VRF](https://www.starknet.io/cairo-book/ch103-05-02-randomness.html)
- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)
- [OpenZeppelin Contracts Wizard (Cairo)](https://wizard.openzeppelin.com/cairo)
- [Starknet Docs](https://docs.starknet.io)
- [Cairo Book](https://book.cairo-lang.org/)
- [starknet.js Docs](https://www.starknetjs.com/)
- [Alchemy Starknet Faucet](https://www.alchemy.com/faucets/starknet-sepolia)
- [Voyager Explorer (Sepolia)](https://sepolia.voyager.online/)
