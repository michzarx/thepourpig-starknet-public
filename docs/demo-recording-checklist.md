# 🎬 Demo Recording Checklist

> Demo 录制检查清单 — Use this checklist to prepare and record the 3-minute demo video efficiently.
> 使用此清单高效准备和录制3分钟Demo视频。

---

- [ ] Choose background music (30-second loop, upbeat)


## Phase 1: Pre-Recording Setup (30 min)
## 阶段 1: 录制前准备 (30分钟)

### Environment Setup / 环境设置
- [ ] Clean browser state: Chrome Incognito mode / 清理浏览器：Chrome无痕模式
- [ ] Set screen resolution: 1920x1080 / 设置屏幕分辨率

---

### 🎯 Choose Your Approach / 选择你的方案

**⚡ Option A - Demo Mode (Recommended) / 选项A - Demo模式（推荐）**
- ✅ No extra accounts needed / 不需要额外账号
- ✅ No manual gameplay for filler data / 不需要手动玩游戏填充数据
- ✅ One command to populate leaderboards / 一条命令填充排行榜
- ⏱️ Setup time: ~2 minutes / 准备时间：约2分钟

---

### Option A: Demo Mode Setup (Quick) / 选项A：Demo模式设置（快速）
- [ ] **Enable Demo Mode in code** / **在代码中启用Demo模式** (find the details below)
  - [ ] Open `frontend/index.html` 
  - [ ] Uncomment demo-mode script line (remove `<!--` and `-->`)
  - [ ] Redeploy or test locally / 重新部署或本地测试
- [ ] **Test activation** / **测试激活**
  - [ ] Run `enableDemoMode()` in console (F12
  - [ ] Click Leaderboard → Verify fake data shows / 点击排行榜 → 验证假数据显示
- [ ] **🐷 Test Pig Preview (for recording different pigs)**
  - [ ] Run `listPigPresets()` to see all options / 运行 `listPigPresets()` 查看所有选项
  - [ ] Run `previewPig(1)`, `previewPig(2)`, etc. to switch styles / 运行 `previewPig(1)`, `previewPig(2)` 等切换样式
  - [ ] Choose 3 best-looking pigs for recording / 选择3只最好看的猪用于录制
- [ ] **Account 1 (Main Demo)** / **主账号（演示用）**
  - [ ] Fresh or existing? / 新账号还是现有账号？
  - [ ] If fresh: Test Cartridge signup / 如果是新的：测试Cartridge注册
  - [ ] If existing: Note existing pigs/achievements / 如果是现有的：记录现有的猪和成就
- [ ] **Skip Option B → Go to Game Mechanics Practice** / **跳过选项B → 进入游戏机制练习**


### Game Mechanics Practice / 游戏机制练习
- [ ] Practice power-up timing / 练习道具时机
  - [ ] Magnet: Know when coins are in range / 磁铁：知道金币何时在范围内
  - [ ] Speed boost: Practice movement during activation / 加速：练习激活期间移动
  - [ ] Time freeze: Note visual effect (coins stop floating) / 冻结：注意视觉效果（金币停止浮动）
- [ ] Practice 50-second run (aim for 300+ points) / 练习50秒跑动（目标300+分） ⏱️
- [ ] Practice golden coin collection (glowing, 50 pts) / 练习金色金币收集（发光，50分）
- [ ] Practice achieving 1 achievement mid-game / 练习游戏途中达成1个成就
- [ ] Test intro orbit (360° camera showcase on load) / 测试开场轨道（加载时360°相机展示）
- [ ] Test "daily champion" scenario if possible / 如果可能测试"每日冠军"场景
- [ ] **Rare+ feature**: Test starting power-ups (Uncommon+ pigs spawn with active power-ups) / **稀有+功能**：测试初始道具（Uncommon+猪生成时带已激活道具）

---

## Phase 2: Recording — Shot by Shot
## 阶段 2: 录制 — 逐个镜头

### Shot 1: Hook (0:00-0:15) — 15 seconds / 钩子画面
- [ ] Record intro orbit (360° camera showcase on first load) / 录制开场轨道（首次加载时360°相机展示）
- [ ] **🐷 Record 3 different pigs** (using Demo Mode preview) / **录制3只不同的猪**（使用Demo模式预览）
  - [ ] Run `previewPig(3)` → Purple Legendary/Diamond (3-5 sec) / 运行 → 紫色传说/菱形（3-5秒）
  - [ ] Run `previewPig(7)` → Blue Legendary/Camo (3-5 sec) / 运行 → 蓝色传说/迷彩（3-5秒）
  - [ ] Run `previewPig(9)` → Mint Rare/Plaid (3-5 sec) / 运行 → 薄荷绿稀有/格子纹（3-5秒）⭐ NEW
  - [ ] **In editing**: Cut between clips to show variety
- [ ] Record power-up activation sequences / 录制道具激活序列
- [ ] Record coin collection magnet effect / 录制金币收集磁铁效果
- [ ] Record golden coin (glowing, larger, screen shake) / 录制金色金币（发光、更大、屏幕震动）
- [ ] **Tip**: Capture at 60fps for smooth slow-motion options / **提示**：以60fps拍摄以便平滑慢动作

### Shot 2: Login (0:45-1:00) — 15 seconds / 登录
- [ ] Start fresh browser/incognito
- [ ] Click "Connect with Cartridge"
- [ ] Show no wallet extension installed
- [ ] Complete login flow / 完成登录流程
- [ ] **Tip**: Keep cursor visible to show no magicz

### Shot 3: Mint VRF Pig (1:00-1:20) — 20 seconds / Mint VRF猪
- [ ] Click "Mint Pig" button / 点击"Mint Pig"按钮
- [ ] Show transaction pending / 显示交易待处理
- [ ] Reveal generated attributes: / 揭示生成的属性：
  - [ ] Pattern (zoom in on texture) / 花纹（放大纹理）
  - [ ] Rarity (highlight if Legendary) / 稀有度（如果是Legendary则高亮）
  - [ ] Speed bonus / 速度加成
- [ ] **If Uncommon+**: Mention "This rarity starts with power-ups already active!" / **如果是Uncommon+**：提到"这个稀有度开始时道具已激活！"
- [ ] **Script**: "This pig is verifiably random — generated on-chain" / **脚本**："这只猪是可验证的随机——链上生成"

### Shot 4: Core Gameplay (1:20-1:45) — 25 seconds / 核心玩法
- [ ] Start "Play Round" / 开始"Play Round"
- [ ] Show 50-second countdown / 显示50秒倒计时 ⏱️
- [ ] WASD movement demonstration / WASD移动演示
- [ ] Coin collection (get ~10-15 coins) / 金币收集（获得约10-15个金币）
- [ ] **Tip**: Keep movement smooth, don't overshoot / **提示**：保持移动平滑，不要过度

### Shot 5: Power-up Showcase (1:45-2:00) — 15 seconds / 道具展示
- [ ] Collect golden coin first (50 pts, glowing, screen shake) / 先收集金色金币（50分，发光，屏幕震动）
- [ ] Collect Magnet power-up / 收集磁铁道具
  - [ ] Show coins flying toward pig / 显示金币飞向猪
  - [ ] **Visual: Blue halo particles rotating around pig** / **视觉效果：蓝色光环粒子围绕猪旋转**（磁铁：蓝色光环围绕猪旋转）
- [ ] Collect Speed power-up / 收集加速道具
  - [ ] Show movement increase / 显示移动增加
  - [ ] **Visual: Orange speed lines trailing behind pig** / **视觉效果：猪身后橙色速度线**（加速：猪身后橙色速度线）
- [ ] Collect Freeze power-up / 收集冻结道具
  - [ ] Show timer pause + coin freeze / 显示计时器暂停 + 金币冻结
  - [ ] **Visual: White frost particles at screen edges** / **视觉效果：屏幕边缘白色冰霜粒子**（时间冻结：屏幕边缘白色冰霜粒子）
- [ ] Show HUD with all 3 power-up timers / 显示带有所有3个道具计时器的HUD

### Shot 6: Daily Challenge (2:00-2:20) — 20 seconds / 每日挑战
- [ ] Show "Day #XXX Challenge" banner / 显示"Day #XXX Challenge"横幅
- [ ] Click Leaderboard → Switch to "Today" tab / 点击排行榜 → 切换到"Today"标签
- [ ] Show rankings with multiple players / 显示多个玩家的排名
- [ ] Show "You're XX points from #1!" message / 显示"你离第1名还差XX分！"消息
- [ ] **Script**: "Same map, same day — fair competition" / **脚本**："同一张地图，同一天——公平竞争"

### Shot 7: Achievement Mint (2:20-2:40) — 20 seconds / 成就Mint
- [ ] Trigger achievement (score > 100 or games_played milestone) / 触发成就（分数>100或游戏局数里程碑）
- [ ] Show "Achievement Minted!" notification / 显示"成就已Mint！"通知
- [ ] **CRITICAL**: Show NO signature popup appeared / **关键**：显示没有出现签名弹窗
- [ ] Check wallet/pig profile to see new achievement / 检查钱包/猪资料以查看新成就

### Shot 8: On-chain Verification (2:40-2:50) — 10 seconds / 链上验证
- [ ] Open StarkScan/Voyager / 打开StarkScan/Voyager
- [ ] Search contract address / 搜索合约地址
- [ ] Show score submission transaction / 显示分数提交交易
- [ ] Show achievement mint transaction / 显示成就mint交易
- [ ] **Script**: "Everything is verifiable on-chain" / **脚本**："一切都可以在链上验证"

### Shot 9: CTA (2:50-3:00) — 10 seconds / 行动号召
- [ ] End card: "Built for Starknet Re{define}" / 结束卡片："为Starknet Re{define}而构建"

---

## Phase 3: Post-Recording (30 min)
## 阶段 3: 录制后 (30分钟)

### Immediate Review / 立即审查
- [ ] Watch all footage once / 完整观看所有素材一次
- [ ] Mark best takes with timestamps / 用时间戳标记最佳片段
- [ ] Identify any missing shots / 识别任何缺失的镜头

### Audio Sync / 音频同步
- [ ] Choose background music track / 选择背景音乐曲目
- [ ] Record/edit voiceover (if not live) / 录制/编辑旁白（如果不是现场）
- [ ] Sync music to game footage beat / 将音乐与游戏画面节拍同步

### Visual Enhancements / 视觉增强
- [ ] Add zoom arrows (highlight "no popup" moments) / 添加缩放箭头（突出"无弹窗"时刻）
- [ ] Add text overlays ("On-chain!", "Zero Popup!") / 添加文字覆盖（"链上！"、"零弹窗！"）
- [ ] Add Starknet logo / partner logos / 添加Starknet标志/合作伙伴标志

### Export Settings / 导出设置
- [ ] Resolution: 1920x1080 / 分辨率
- [ ] Frame rate: 30fps or 60fps / 帧率
- [ ] Codec: H.264 / 编解码器
- [ ] Bitrate: 8-10 Mbps / 比特率
- [ ] Audio: AAC 192kbps / 音频

---

## Backup Plan (if something fails) / 备用计划（如果出现问题）

| Issue | Backup / 问题 | 备用方案 |
|-------|--------|-------------------------|
| Cartridge login fails | Use pre-recorded backup + voiceover / Cartridge登录失败 | 使用预录备份 + 旁白 |
| No Legendary pig minted | Use Rare pig + explain "this is Uncommon..." / 没有mint到Legendary猪 | 使用Rare猪 + 解释"这是Uncommon..." |
| Power-ups don't spawn | Restart round, or use pre-recorded footage / 道具不生成 | 重新开始回合，或使用预录素材 |
| Leaderboard empty | Use Demo Mode (⚡ faster) or add dummy accounts / 排行榜为空 | 使用Demo模式（⚡更快）或添加虚拟账号 |
| Audio issues | Add music in post-production / 音频问题 | 在后期制作中添加音乐 |

---

## Quick Reference: Key URLs / 快速参考：关键URL

| Resource | URL/Command / 资源 | URL/命令 |
|----------|-------------|-------------------|
| Live site | Live site | https://thepourpig.netlify.app |
| Contract (Sepolia) | 合约（Sepolia）| `0x07e0635703126ca36f634ed88bbb591679c8a982fced5f52744e0b08f1e5d141` |
| StarkScan | StarkScan | `https://sepolia.starkscan.co` |
| Recording tool | 录制工具 | OBS / Loom / CleanShot X |

---

## Demo Mode Usage / Demo模式使用

### 📋 What is Demo Mode? / 什么是Demo模式？

Demo Mode 是一个录制辅助工具，它会用假数据替换真实的排行榜数据，让你在录制demo时展示一个"活跃"的游戏环境。

### ⚠️ Important Notes / 重要提示

- **Demo Mode 仅在录制时使用** / Demo Mode is for recording ONLY
- 它不会影响真实的区块链数据 / It does NOT affect real blockchain data
- 它只在浏览器会话中有效 / It only works during browser session
- 刷新页面会重置 / Refreshing the page resets it

---

### Step 1: Enable Demo Mode in Code / 步骤1：在代码中启用Demo模式

**找到文件：** `frontend/index.html`

**操作：** 取消注释（删除 `<!--` 和 `-->`）demo-mode 脚本

**Change from / 从：**
```html
<!--
<script type="module" src="/src/demo-mode.js"></script>
-->
```

**To / 到：**
```html
<script type="module" src="/src/demo-mode.js"></script>
```

---

### Step 2: Activate Demo Mode in Browser / 步骤2：在浏览器中激活Demo模式

| 步骤 Step | 操作 Action |
|-----------|----------|
| 1 | 打开网站: https://thepourpig.netlify.app |
| 2 | 按 `F12` 打开浏览器控制台 (Open browser console) |
| 3 | 在控制台输入并回车：`enableDemoMode()` (Type and press Enter) |
| 4 | 看到控制台显示绿色成功消息 (See green console message) |
| 5 | 点击游戏中的 "Leaderboard" 按钮 (Click "Leaderboard" button) |
| 6 | 切换到 "Today" 标签 (Switch to "Today" tab) |

---

### 🐷 Step 3: Preview Different Pigs (Recording) / 步骤3：预览不同的猪（录制用）

**Available Commands / 可用命令：**

| Command | 命令 | Description / 描述 |
|---------|------|-------------------|
| `listPigPresets()` | 列出猪预设 | Show all 10 available pig styles |
| `previewPig(1)` | 预览猪1 | Red Common - Houndstooth (狗牙纹) |
| `previewPig(2)` | 预览猪2 | Cyan Rare - Chevron (人字纹) |
| `previewPig(3)` | 预览猪3 | Purple Legendary - Diamond (菱形) ⭐ |
| `previewPig(4)` | 预览猪4 | Green Uncommon - Diamond (菱形) |
| `previewPig(5)` | 预览猪5 | Orange Rare - Houndstooth (狗牙纹) |
| `previewPig(6)` | 预览猪6 | Pink Common - Polka Dots (波点) |
| `previewPig(7)` | 预览猪7 | Blue Legendary - Camo (迷彩) ⭐ |
| `previewPig(8)` | 预览猪8 | Yellow Uncommon - Stripes (条纹) |
| `previewPig(9)` | 预览猪9 | **Mint Rare - Plaid (格子纹)** ⭐ NEW |
| `previewPig(10)` | 预览猪10 | **Teal Rare - Stars (星星纹)** ⭐ NEW |

**Usage for Recording / 录制用法：**
```
1. 登录并 mint 一只猪（任何样式都可以）
2. Run: listPigPresets() → 查看所有选项
3. Run: previewPig(7) → 切换到蓝色Legendary猪（Camo迷彩）
4. 录制 5-10 秒奔跑画面
5. Run: previewPig(3) → 切换到紫色Legendary猪（Diamond菱形）
6. 录制 5-10 秒奔跑画面
7. Run: previewPig(9) → 切换到薄荷绿Rare猪（Plaid格子纹）⭐ NEW
8. 录制 5-10 秒奔跑画面
9. Run: previewPig(10) → 切换到青色Rare猪（Stars星星纹）⭐ NEW
10. 录制 5-10 秒奔跑画面
11. 后期剪辑时快速切换展示多样性
```

---

### Step 3: Verify Demo Mode is Working / 步骤3：验证Demo模式正在工作

**检查以下内容：** (You should see:)

✅ **控制台消息 / Console message:**
```
🎬 ENABLING DEMO MODE
✅ Demo mode enabled! Leaderboards will show fake data.
```

✅ **All Time 排行榜 / All-Time Leaderboard:**
- 显示 8 个假玩家 / Shows 8 fake players
- 分数范围：298 - 587 / Scores range: 298 - 587

✅ **Today 排行榜 / Today Leaderboard:**
- 显示 5 个假玩家 / Shows 5 fake players
- 分数更接近/竞争更激烈 / Scores are closer, more competitive
- 第1名和第2名只差27分 / #1 and #2 are only 27 points apart

✅ **玩家数据 / Player Data:**
- 今日最佳分数：380 / Daily best score: 380
- 连胜天数：3天 / Streak: 3 days
- Day 编号：#142 / Day number: #142

---

### Step 4: Disable After Recording / 步骤4：录制后禁用

**方法 A - 重新注释 / Method A - Re-comment:**
在 `frontend/index.html` 中把脚本重新注释掉：
```html
<!--
<script type="module" src="/src/demo-mode.js"></script>
-->
```

**方法 B - 直接刷新 / Method B - Just Refresh:**
直接刷新浏览器页面，Demo Mode 会自动重置 / Just refresh the page, demo mode resets automatically

---

### 🎬 Quick Reference / 快速参考

```
启用：解开 index.html 第80行注释
激活：F12 → enableDemoMode()
验证：点击 Leaderboard → 看假数据
禁用：重新注释，或刷新页面
```

---

## Notes During Recording / 录制时的笔记

```
[Use this space for real-time notes / 使用此空间记录实时笔记]

- Pig minted at timestamp: __________ / 猪mint的时间戳：__________
- Pattern type: __________ / 花纹类型：__________
- Rarity: __________ / 稀有度：__________
- Best power-up combo: __________ / 最佳道具组合：__________
- Any bugs/glitches: __________ / 任何错误/故障：__________
```

---

## Final Upload Checklist / 最终上传清单

- [ ] Video uploaded to YouTube/Loom / 视频已上传到YouTube/Loom
- [ ] Video is "Unlisted" or "Public" / 视频是"不公开"或"公开"状态
- [ ] Description contains: / 描述包含：
  - [ ] Project name / 项目名称
  - [ ] Key features (VRF, AA, Leaderboard) / 关键功能
  - [ ] Live demo link / Live演示链接
  - [ ] GitHub repo link / GitHub仓库链接
  - [ ] Contract address / 合约地址
- [ ] Thumbnail selected (high contrast, game screenshot) / 缩略图已选择（高对比度，游戏截图）
- [ ] Video shared to DoraHacks submission / 视频已分享到DoraHacks提交

---

**Total estimated time**: 2-3 hours (including prep, recording, basic editing)
**预计总时间**：2-3小时（包括准备、录制、基础编辑）
