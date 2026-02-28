# The Pour Pig - Landing Page Outline

> 游戏落地页结构 - 用于 Netlify/Vercel 部署的单页应用

---

## Page Structure (Single Scrollable Page)

```
┌────────────────────────────────────────────────────────────┐
│  HERO SECTION                                              │
│  - Game logo/title: "The Pour Pig"                         │
│  - Tagline: "Every Pig is Unique. Every Score is On-Chain."│
│  - CTA: "Play Now" (primary) / "How It Works" (secondary)  │
│  - Background: Animated 3D pig or gameplay video loop      │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  WHAT MAKES IT SPECIAL (3 Cards)                           │
│  - VRF-Powered Unique Pigs (每只猪属性独一无二)              │
│  - Zero-Signature Gaming (零签名游戏体验)                   │
│  - On-Chain Leaderboard (链上排行榜)                        │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  HOW TO PLAY (3 Steps)                                     │
│  1. Connect with Cartridge (一键登录)                       │
│  2. Mint Your Unique Pig (VRF生成属性)                      │
│  3. Collect Coins, Dominate Leaderboard                     │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  GAMEPLAY VIDEO / DEMO                                     │
│  - Embedded video (YouTube/Loom)                           │
│  - OR live playable demo iframe                            │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  PIG ATTRIBUTES SHOWCASE (Visual)                          │
│  - color_hue → 花纹颜色                                       │
│  - speed_bonus → 移动速度加成                                 │
│  - size_scale → 模型大小                                      │
│  - rarity → Common/Uncommon/Rare/Legendary                  │
│  - 8 Pattern Types: Houndstooth, Stripes, Polka Dots...    │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  ACHIEVEMENTS SYSTEM                                        │
│  - 🥇 Coin Collector (score ≥ 100)                          │
│  - 👑 Coin Master (score ≥ 500)                             │
│  - ⚔️ Veteran (10+ games played)                            │
│  - 💎 Legend (score ≥ 1000)                                 │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  LIVE LEADERBOARD                                           │
│  - Top 10 scores (fetched from contract)                    │
│  - Real-time updates                                       │
│  - "Your Rank" highlight                                   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  BUILT ON STARKNET (Tech Stack)                            │
│  - Cairo Smart Contracts                                    │
│  - Cartridge VRF (链上可验证随机)                            │
│  - Cartridge Controller (Account Abstraction)               │
│  - Three.js (3D Game Engine)                               │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  FAQ                                                        │
│  - Q: Do I need to install a wallet?                       │
│  - A: No! Cartridge Controller works in-browser.           │
│  - Q: Is it free?                                           │
│  - A: Yes, Sepolia testnet is free.                        │
│  - Q: What makes each pig unique?                          │
│  - A: VRF generates color, speed, size, rarity on-chain.   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│  FOOTER                                                     │
│  - Built for Starknet Re{define} / ETHGlobal SF            │
│  - GitHub repo link                                        │
│  - Contract address (Voyager link)                         │
│  - Social links (Twitter / Discord)                        │
└────────────────────────────────────────────────────────────┘
```

---

## Detailed Section Content

### 1. HERO SECTION

**Title:** The Pour Pig
**Subtitle:** A 3D Coin Rush Game on Starknet
**Tagline:** Every Pig is Unique. Every Score is On-Chain. Zero Popups.

**CTA Buttons:**
- Primary: "🎮 Play Now" (scrolls to game or opens new tab)
- Secondary: "📖 How It Works" (scrolls to explanation)

**Background:**
- Option A: Animated Three.js canvas with pig idle animation
- Option B: Autoplay video loop of gameplay
- Option C: Gradient with floating pig silhouettes

---

### 2. WHAT MAKES IT SPECIAL (3-CARD GRID)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  🎲 VRF-Powered │  │  ⚡ Zero-Sig    │  │  🏆 On-Chain     │
│  Unique Pigs    │  │  Gaming         │  │  Leaderboard     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│  Every pig has  │  │  No wallet      │  │  Top scores on   │
│  unique VRF-    │  │  extension. No  │  │  Starknet.       │
│  generated      │  │  popups while   │  │  Verifiable,     │
│  attributes:    │  │  playing.       │  │  immutable.      │
│  • Color        │  │                 │  │                  │
│  • Speed        │  │  Powered by     │  │  Compete with    │
│  • Size         │  │  Cartridge      │  │  players global. │
│  • Rarity       │  │  Controller     │  │                  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

### 3. HOW TO PLAY (3-STEP PROCESS)

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   1. CONNECT     │───▶│   2. MINT PIG    │───▶│   3. PLAY & WIN  │
│                  │    │                  │    │                  │
│  Click "Connect" │    │  VRF generates   │    │  Collect coins   │
│  → Cartridge     │    │  your pig's      │    │  in 60 seconds   │
│  login           │    │  unique attrs    │    │  Submit score    │
│                  │    │                  │    │  Climb ladder    │
│  ✅ No wallet    │    │  ✅ One pig per  │    │  ✅ Earn badges   │
│  ✅ 30 seconds   │    │     player       │    │  ✅ Daily reset   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

### 4. PIG ATTRIBUTES SHOWCASE

**Visual Display:**

| Attribute | Range | Gameplay Effect | Visual Effect |
|-----------|-------|-----------------|---------------|
| **Color Hue** | 0-360° | Determines pattern type | 8 pattern colors |
| **Speed Bonus** | 0-20% | Movement multiplier | Faster coin collection |
| **Size Scale** | 80-120% | Collision radius | Bigger/smaller pig |
| **Rarity** | 0-3 | Higher rarity → better stats | Badge + glow effect |

**Pattern Types (8 total):**
- Houndstooth (千鸟格)
- Stripes (条纹)
- Polka Dots (波点)
- Plaid (格子)
- Stars (星星)
- Diamond (菱形)
- Chevron (人字纹)
- Camo (迷彩)

**Rarity Distribution:**
- Common (60%) - Standard stats
- Uncommon (25%) - Slightly better
- Rare (10%) - Notable speed bonus
- Legendary (5%) - Maximum speed, unique glow

---

### 5. ACHIEVEMENTS

| Achievement | Condition | Reward |
|-------------|-----------|--------|
| 🥇 Coin Collector | Score ≥ 100 | On-chain badge |
| 👑 Coin Master | Score ≥ 500 | On-chain badge |
| ⚔️ Veteran | Play 10+ games | On-chain badge |
| 💎 Legend | Score ≥ 1000 | On-chain badge + Bragging rights |

---

### 6. LIVE LEADERBOARD

```
┌─────────────────────────────────────────────────────────────┐
│  🏆 GLOBAL LEADERBOARD                                      │
├─────────────────────────────────────────────────────────────┤
│  1. 0x1234...5678        ████████████████████  2,450       │
│  2. 0xabcd...efgh        ██████████████████░░  2,380       │
│  3. 0x9876...5432        ████████████████░░░░  2,290       │
│  ...                                                           │
│  ─────────────────────────────────────────────────           │
│  YOU (0xPlayer...)       ████████░░░░░░░░░░░░    850       │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. TECH STACK (BUILT ON STARKNET)

**Why Starknet?**
- **Low Gas**: Frequent transactions (mint, score, achievements) are nearly free
- **Account Abstraction**: Cartridge Controller enables session keys
- **VRF**: Cartridge VRF provides on-chain verifiable randomness
- **Fast Confirmations**: ~2-5 seconds on Sepolia

**Tech Stack Diagram:**
```
Frontend          →  Starknet Sepolia
───────────────────────────────────────
Three.js         →  PigNFT Contract
Cartridge Ctrl   →  VRF Provider
starknet.js      →  Leaderboard Data
Vite Build       →  Achievement Storage
```

---

### 8. FAQ

**Q: Do I need to install a wallet extension?**
A: No! Cartridge Controller runs entirely in your browser. Just click "Connect" and sign up with username/password or social login.

**Q: Is this free to play?**
A: Yes! The game runs on Starknet Sepolia testnet, which is completely free. Test tokens are provided automatically.

**Q: What makes each pig unique?**
A: When you mint, Cartridge VRF generates four attributes on-chain: color hue (determines pattern), speed bonus (0-20%), size scale (80-120%), and rarity (Common to Legendary). These affect both visuals and gameplay.

**Q: Can I play on mobile?**
A: The game is optimized for desktop keyboard controls (WASD + arrows). Mobile support is planned for future updates.

**Q: How are scores verified?**
A: When you start a round, the contract records the timestamp. Your score must be submitted within 65 seconds, preventing cheating.

**Q: What happens to my achievements?**
A: Achievements are minted on-chain as part of your player record. Anyone can verify them on the Starknet explorer.

---

### 9. FOOTER

```
Built for Starknet Re{define} 2026 | ETHGlobal San Francisco

┌────────────────────────────────────────────────────────────┐
│  [GitHub]    [Contract on Voyager]    [Twitter]    [Discord] │
└────────────────────────────────────────────────────────────┘

© 2026 The Pour Pig. All rights reserved.
Game assets powered by Three.js. Smart contracts on Starknet.
```

---

## Implementation Notes

### File Structure
```
frontend/
├── index.html           ← Main landing page
├── landing.css          ← Landing page styles
├── landing.js           ← Leaderboard fetch, animations
└── game.html            ← Separate game page (or iframe)
```

### Key Components to Build
1. **Leaderboard Fetcher** - Calls `getLeaderboard()` from contract.js
2. **Video/Autoplay Demo** - Embed YouTube or use Three.js canvas
3. **Attribute Visualizer** - Show different pig patterns
4. **CTA Button Logic** - Scroll to game or open new tab
5. **Mobile Responsive** - Stack cards on small screens

### Copywriting Tips
- Keep it short: Most visitors scan, don't read
- Use emojis: They break up text and add personality
- Focus on benefits, not features: "Play without interruptions" > "Session keys"
- Social proof: Show live leaderboard count ("1,234 players competed today")

### Performance Considerations
- Lazy load video/3D canvas (only when in viewport)
- Use WebP images for pattern showcase
- Leaderboard: Cache for 30 seconds, refresh on scroll
- Hero background: Consider CSS gradient if 3D is too heavy

---

## Design Inspiration

Similar game landing pages to study:
- [Dookey Dash](https://dookeydash.boredapeyachtclub.com/) - Yuga Labs
- [Walkabout Mini Golf](https://www.walkaboutgolf.com/) - Game club on L2
- [STARKNET.id](https://app.starknet.id/) - Clean Starknet branding

Color Palette (suggested):
- Primary: `#10B981` (Starknet green)
- Secondary: `#6F42C1` (Starknet purple)
- Accent: `#F59E0B` (Gold/coins)
- Dark bg: `#1F2937` (Game feel)
- Light text: `#F9FAFB`

---

## Optional: Interactive Elements

1. **Pig Preview Generator** - Users can see what attributes look like before minting
2. **Leaderboard Filter** - "Today", "This Week", "All Time"
3. **Achievement Tracker** - "You're 50 points away from Coin Master!"
4. **Share Card** - "I just scored 500 on The Pour Pig! 🐷" (Twitter)
5. **Countdown Timer** - "Daily seed resets in 02:34:12"
