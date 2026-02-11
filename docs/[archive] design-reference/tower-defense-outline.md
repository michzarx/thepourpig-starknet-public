# Tower Defense 3D - Complete Game Outline

> A complete tower defense game in Three.js with XP system, tower evolution, and progressive levels

---

## Game Concept

**Title:** *Tower Defense 3D* (working title)

**Elevator Pitch:**
- Place defense towers on a hexagonal or square tile grid
- Block waves of enemies following a predefined path
- Each tower gains XP by eliminating enemies
- Evolve your towers through 5 levels with unique abilities
- At least 10 tower types × 5 evolution tiers = 50 unique variations

---

## Game Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  MAIN MENU                                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   PLAY   │  │  LEVELS  │  │  SCORES  │  │ OPTIONS  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LEVEL SELECTION                                            │
├─────────────────────────────────────────────────────────────┤
│  Level 1 [★]   Level 2 [★]   Level 3 [ ]   Level 4 [ ]      │
│  Level 5 [ ]   Level 6 [ ]   Level 7 [ ]   Level 8 [ ]      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  GAMEPLAY                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  3D TERRAIN with visible path                         │  │
│  │                                                       │  │
│  │  [START]  ══════════>  [BASE]                         │  │
│  │                                                       │  │
│  │  Towers placeable on green tiles                     │  │
│  │  Enemies follow yellow tiles                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  TOWER PANEL (Selection)                              │  │
│  │  [Tower1] [Tower2] [Tower3] ... [Tower10]             │  │
│  │  Cost: 50  |  XP: 120/200  |  Level: 2/5              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  WAVE INFO: Wave 5/10  |  Lives: 15/20  |  Gold: 350   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LEVEL COMPLETE                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           VICTORY / DEFEAT                             │  │
│  │                                                       │  │
│  │  Stars: ★ ★ ☆                                         │  │
│  │  Score: 12,450                                        │  │
│  │  Towers Evolved: 12                                   │  │
│  │                                                       │  │
│  │  [RETRY]  [MENU]  [NEXT LEVEL]                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Level System (5+ Levels)

### Level 1 - "The Peaceful Garden"
- **Terrain:** 8×8 tiles, simple straight path
- **Waves:** 5 waves of 5-10 enemies
- **Enemies:** Basic Pigs only
- **Starting Budget:** 100 gold
- **Objective:** Survive with at least 15 lives

### Level 2 - "The Dark Forest"
- **Terrain:** 10×10 tiles, path with 1 turn
- **Waves:** 7 waves, introduction of Fast Pigs
- **Enemies:** Basic Pigs + Fast Pigs (50%)
- **Starting Budget:** 150 gold
- **Objective:** Survive with at least 12 lives

### Level 3 - "The Steep Mountain"
- **Terrain:** 12×12 tiles, S-shaped path
- **Waves:** 10 waves, introduction of Tank Pigs
- **Enemies:** Mix of all 3 types
- **Starting Budget:** 200 gold
- **Objective:** Survive with at least 10 lives

### Level 4 - "The Valley of Waves"
- **Terrain:** 12×12 tiles, branching path
- **Waves:** 12 waves, introduction of Flying Pigs
- **Enemies:** All types, grouped waves
- **Starting Budget:** 180 gold
- **Objective:** Survive with at least 8 lives

### Level 5 - "The Final Fortress"
- **Terrain:** 15×15 tiles, complex path with loops
- **Waves:** 15 waves, Final Boss (Big Pig)
- **Enemies:** All types + Boss
- **Starting Budget:** 250 gold
- **Objective:** Survive with at least 5 lives

---

## 5+ Enemy Types

| # | Name | HP | Speed | Description | Appearance |
|---|-----|----|---------|-------------|-----------|
| 1 | **Basic Pig** | 50 | 1.0x | Standard enemy, balanced | Pink, normal size |
| 2 | **Fast Pig** | 30 | 2.0x | Very fast but fragile | White, smaller |
| 3 | **Tank Pig** | 200 | 0.5x | Slow but lots of HP | Gray, very large |
| 4 | **Flying Pig** | 80 | 1.5x | Can fly over certain obstacles | Blue, wings |
| 5 | **Big Pig (Boss)** | 1000 | 0.3x | End-of-level boss | Black, massive, crown |
| 6 | **Ghost Pig** | 60 | 1.2x | Can phase through walls (15% chance) | Transparent/green |
| 7 | **Healer Pig** | 40 | 0.8x | Heals nearby enemies for 10 HP/sec | Green with cross |

---

## 10 Defense Tower Types

### Direct Damage Towers

| # | Name | Type | Cost | Description | Evolution |
|---|-----|------|------|-------------|-----------|
| 1 | **Archer Tower** | Ranged | 50 gold | Fires arrows, fast fire rate | Damage ↑, Range ↑ |
| 2 | **Cannon Tower** | AoE | 100 gold | Area damage, slow fire rate | Radius ↑, Damage ↑ |
| 3 | **Ice Tower** | Slow | 75 gold | Slows enemies 20-60% | Duration ↑, Range ↑ |
| 4 | **Lightning Tower** | Chain | 125 gold | Hits up to 5 enemies in chain | Chain length ↑ |
| 5 | **Sniper Tower** | Long Range | 150 gold | Huge range, high damage, very slow | Damage ↑, Fire rate ↑ |
| 6 | **Machine Gun** | Rapid | 80 gold | Very fast, low damage | Fire rate ↑↑↑ |

### Support Towers

| # | Name | Type | Cost | Description | Evolution |
|---|-----|------|------|-------------|-----------|
| 7 | **Gold Tower** | Economic | 100 gold | Generates 5 gold/second | Production ↑ |
| 8 | **XP Tower** | Support | 120 gold | Increases XP gained by nearby towers 25% | Radius ↑, Bonus ↑ |
| 9 | **Shield Tower** | Defense | 90 gold | Reduces base damage taken by 15% | Reduction ↑, Radius ↑ |
| 10 | **Teleporter Tower** | Control | 110 gold | Teleports enemies backward randomly | Distance ↑, Frequency ↑ |

---

## Tower Evolution System (5 Tiers)

### Example: Archer Tower

| Level | Name | Damage | Fire Rate | Range | Special | XP Required |
|--------|-----|--------|-----------|-------|---------|--------------|
| 1 | Archer | 10 | 1.0/s | 4 tiles | - | 0 |
| 2 | Archer + | 15 | 1.2/s | 4 tiles | - | 100 |
| 3 | Elite Archer | 20 | 1.5/s | 5 tiles | 10% crit | 300 |
| 4 | Master Archer | 30 | 2.0/s | 5 tiles | 20% crit | 600 |
| 5 | Archer Legend | 50 | 2.5/s | 6 tiles | Piercing arrows (2 enemies) | 1000 |

### XP Formula
```
XP gained per enemy kill = (Enemy Base XP) × (Tower Level Multiplier)
Enemy Base XP:
- Basic Pig: 10 XP
- Fast Pig: 8 XP
- Tank Pig: 25 XP
- Flying Pig: 15 XP
- Boss: 200 XP
```

---

## Terrain System (Tiles)

### Tile Types

| Type | Color | Function |
|------|-------|----------|
| **Buildable** | Light green → Dark green | Can place towers |
| **Path** | Yellow / Orange | Enemy path |
| **Obstacle** | Gray / Rock | Cannot build |
| **Spawn** | Red | Enemy spawn point |
| **Base** | Blue | Base to defend |
| **Water** | Light blue | Natural obstacle |
| **Bridge** | Brown | Walkable by enemies, not buildable |

### Procedural Generation
```javascript
// Example structure
const TILE_TYPES = {
  BUILDABLE: 0,
  PATH: 1,
  OBSTACLE: 2,
  SPAWN: 3,
  BASE: 4,
  WATER: 5,
  BRIDGE: 6
};

// Green shades for buildable tiles
const GREEN_SHADES = [0x2d5a3f, 0x3d6a4f, 0x1a472a, 0x4d7a5f];
```

---

## User Interface

### HUD Elements

```
┌─────────────────────────────────────────────────────────────┐
│  Wave: 5/10  |  Lives: ❤️❤️❤️❤️❤️ (15/20)  |  Gold: 350 💰       │
│  Total XP: 1,250 ⭐                                            │
├─────────────────────────────────────────────────────────────┤
│  │                                                             │
│  │     [3D Terrain with rotatable/zoomable camera]             │
│  │                                                             │
│  │     [START] ═════════════════> [BASE]                       │
│  │           ║      ║                                          │
│  │        [Tower1]  [Tower2]                                   │
│  │           ║                                                │
│  │     ═══════════                                            │
│  │                                                             │
├─────────────────────────────────────────────────────────────┤
│  [🏹 Archer]  [💣 Cannon]  [❄️ Ice]  [⚡ Lightning]  [🎯 Sniper] │
│  [🔫 M-Gun]   [💰 Gold]   [⭐ XP]      [🛡️ Shield]   [🌀 TP]    │
│                                                                 │
│  Selected Tower: Archer Lvl 3                                  │
│  XP: 120/300  |  Upgrade (50 gold)  |  Sell (25 gold)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Gameplay Loop

### Preparation Phase
1. **Initial placement:** 30 seconds to place towers
2. **Wave preview:** See number and types of enemies
3. **Limited budget:** Manage gold efficiently

### Combat Phase
1. **Active wave:** Enemies spawn and follow the path
2. **Automatic firing:** Towers fire at enemies in range
3. **Gold gain:** +10 gold per enemy killed
4. **XP gain:** Each tower gains XP for its kills
5. **Real-time placement:** Can add towers during wave

### Transition Phase
1. **Between waves:** 15 second pause
2. **Shop/Upgrades:** Can upgrade or sell towers
3. **Next wave:** Preview upcoming enemies

### Level End
1. **Score calculation:** Based on remaining lives, gold, evolved towers
2. **Stars:** 1-3 stars based on performance
3. **Unlock:** Next level unlocked if ≥1 star

---

## Technologies

### Frontend
- **Three.js** - 3D Rendering
- **Vite** - Build system
- **GSAP** - UI Animations

### Code Structure
```
src/
├── main.js              # Entry point
├── game/
│   ├── Game.js          # Main game controller
│   ├── Level.js         # Level definition
│   ├── Wave.js          # Wave management
│   └── Enemy.js         # Enemy class
├── towers/
│   ├── Tower.js         # Base tower class
│   ├── ArcherTower.js   # Specific towers
│   ├── ...
│   └── TowerFactory.js  # Tower creation
├── terrain/
│   ├── Terrain.js       # 3D terrain generation
│   ├── Tile.js          # Individual tile
│   └── PathFinder.js    # Path calculation
├── ui/
│   ├── HUD.js           # In-game UI
│   ├── Menu.js          # Main menu
│   └── LevelSelect.js   # Level selection
└── utils/
    ├── XPSystem.js      # XP and evolution
    └── CameraController.js # 3D camera
```

---

## Game Economy

### Costs and Gains

| Action | Cost | Gain |
|--------|------|------|
| Place Archer Tower | 50 gold | - |
| Place Cannon Tower | 100 gold | - |
| Upgrade Tower (lvl→lvl+1) | 50% base price | - |
| Sell Tower | - | 50% base price |
| Enemy Kill (basic) | - | +10 gold |
| Enemy Kill (tank) | - | +25 gold |
| Gold Tower (per sec) | - | +5 gold |

### Balancing

**Base Rule:** A tower should pay for itself in ~10 enemy kills
```
Archer Tower: 50 gold ÷ 10 gold/enemy = 5 enemies to break even
Cannon Tower: 100 gold ÷ 25 gold/enemy (tank) = 4 tanks to break even
```

---

## Progression and Meta-Game

### Unlocks
- **Level 2 complete (1★):** Unlocks level 3
- **Level 3 complete (2★):** Unlocks Lightning Tower
- **Level 4 complete (2★):** Unlocks Machine Gun Tower
- **Level 5 complete (3★):** Infinite Mode

### Infinite Mode
- Endless waves with increasing difficulty
- Global high score saved
- Enemy stats multiplied by 1.1 every 10 waves

---

## Optional: Blockchain Integration (If Applicable)

### On-Chain Storage
- **High Scores per Level** - Verifiable leaderboards
- **Tower NFTs** - Unique tower collections
- **Achievements** - Badges for accomplishments

### Starknet Benefits
- **Low Gas** - Many transactions (placement, upgrades)
- **Account Abstraction** - Session keys for smooth gameplay
- **VRF** - Verifiable procedural level generation

---

## Development Roadmap

### Phase 1 - Core (Week 1)
- ✅ 3D Terrain with tiles
- ✅ Enemy path
- ✅ 2 enemy types
- ✅ 1 tower type
- ✅ Basic wave system

### Phase 2 - Content (Week 2)
- ✅ 5 enemy types
- ✅ 5 levels
- ✅ 5 tower types
- ✅ XP and evolution system

### Phase 3 - Extension (Week 3)
- ✅ 5 additional tower types
- ✅ Menu and level selection
- ✅ Score and stars
- ✅ Infinite mode

### Phase 4 - Polish (Week 4)
- ✅ Animations and VFX
- ✅ Sound and music
- ✅ Fine tuning balance
- ✅ Performance optimization

---

## Inspirations

- **Bloons TD** - For tower variety
- **Kingdom Rush** - For balance and design
- **Fieldrunners** - For simple 3D style
- **Plants vs Zombies** - For progression

---

## Design Notes

### Technical Constraints
- **Performance:** Target 60fps with max 100 enemies on screen
- **Mobile:** Touch controls for tower placement
- **Screen:** Support 16:9 (desktop) and 9:16 (mobile)

### Aesthetics
- **Style:** Low poly, colorful, cartoon
- **Palette:** Green (nature), Yellow (path), Red (danger)
- **Animations:** Fluid, satisfying (damage popups, explosions)

---

## Conclusion

This Three.js tower defense offers:
- **Replayability** - 5+ levels, infinite mode
- **Depth** - 10 towers × 5 levels = 50 variations
- **Accessibility** - Simple controls, clear progression
- **Extensibility** - Easy to add levels/towers/enemies

---

**Next File Projects:**
- `src/game/Game.js` - Main game loop
- `src/towers/Tower.js` - Base tower class with XP system
- `src/terrain/Terrain.js` - Tile-based 3D terrain
- `levels/level1.json` - Level data in JSON format


塔防游戏核心概念解释
游戏循环

准备阶段(30秒) → 放置塔 → 战斗开始 → 敌人沿路径前进 → 
塔自动攻击 → 杀敌赚金币 + XP → 升级塔 → 下一波
地形系统
绿色方块 = 可建造区域（放塔的地方）
黄色路径 = 敌人行走的路线
其他颜色 = 障碍物/水/特殊地块
10种防御塔
攻击类（6种）：

弓箭塔 (50金) - 基础远程攻击
加农炮 (100金) - 范围伤害，打慢但威力大
冰霜塔 (75金) - 减速敌人
闪电塔 (125金) - 连锁攻击，一次打5个敌人
狙击塔 (150金) - 射程超远，单点高伤
机枪塔 (80金) - 射速超快，伤害低
辅助类（4种）：
7. 黄金塔 (100金) - 被动产出金币（每秒+5）
8. 经验塔 (120金) - 附近塔的XP +25%
9. 护盾塔 (90金) - 减少基地受到的伤害
10. 传送塔 (110金) - 把敌人传送到后面

升级系统（每座塔5级）

Level 1: 基础
Level 2: 属性小幅提升 (100 XP)
Level 3: 解锁特殊能力 (300 XP) - 例如弓箭塔有10%暴击
Level 4: 大幅提升 (600 XP)
Level 5: 终极形态 (1000 XP) - 例如箭矢穿透2个敌人
7种敌人
敌人	特点
基础猪	普通，平衡
快速猪	速度快但脆
坦克猪	超慢但血厚
飞行猪	能飞过障碍
Boss猪	关底大Boss
幽灵猪	15%概率穿墙
治疗猪	治疗10HP/秒
5个关卡难度递增

关卡1: 直线 + 1种敌人
关卡2: 1个转弯 + 2种敌人
关卡3: S形路径 + 3种敌人
关卡4: 分叉路径 + 4种敌人
关卡5: 复杂路径 + Boss
核心玩法策略
经济平衡：

每座塔需要杀10个敌人才回本
黄金塔后期很重要（被动收入）
不要乱放塔，位置很重要（拐角放范围伤害塔）
升级策略：

集中升级2-3座塔到满级 > 升级10座塔到2级
早期放黄金塔积累经济
经验塔放在主力塔旁边