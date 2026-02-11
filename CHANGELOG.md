# Changelog

All notable changes to The Pour Pig project will be documented in this file.

---

## [0.4.1] - February 12, 2026

### ✨ Frontend

- **Achievements Panel UI**
  - New "Achievements" button in game HUD (shown after connecting wallet + minting pig)
  - Full achievement list with icons, names, and detailed descriptions for all 6 achievements
  - Visual distinction: unlocked (gold border, full color) vs locked (grayed out icon)
  - Real-time progress display for locked achievements:
    - Score achievements: `Progress: 150/500 points`
    - Game count: `Progress: 3/10 games`
    - Streak: `Progress: 2/3 days streak`
    - Daily Champion: `Ready to claim!` or `Not #1 today`

- **Speed Calculation Adjustment**
  - Fixed base movement speeds: walk 3, run 6, backward 2 (previously 1.5/3/1)
  - Speed bonus from VRF now multiplies base speed: `1.0x - 1.5x` range
  - Formula: `speedMultiplier = 1 + (speedBonus / 20) * 0.5`

### 📝 UX

- **Better Achievement Transparency**
  - Players can now see all achievement requirements before attempting to claim
  - Eliminates confusion from "STREAK_TOO_SHORT" errors
  - Progress indicators show how close players are to unlocking each achievement

---

## [0.4.0] - February 10, 2026 (Day 6: Daily Challenge + Power-ups)

### ✨ Smart Contracts (Cairo)

- **Daily Leaderboard System**
  - `daily_scores` storage: tracks each player's best score per day
  - `daily_leaderboard`: top-10 ranking per day (separate from all-time)
  - `get_daily_leaderboard_entry()`, `get_daily_leaderboard_size()`, `get_player_daily_score()`, `get_current_day()`

- **Player Streak Tracking**
  - `player_streak` + `last_play_day` storage
  - Auto-increments on consecutive daily play, resets on gap
  - `get_player_streak()` read function

- **New Achievements**
  - Achievement #4: **Daily Champion** — #1 on today's leaderboard
  - Achievement #5: **Streak Master** — 3+ day play streak

- **Contract Redeployed (V3)**
  - New address: `0x07e0635703126ca36f634ed88bbb591679c8a982fced5f52744e0b08f1e5d141`
  - Class hash: `0x0d1905bec970bb545f159fa718d368409415479c1fd98e7414f368150d09f3d`

### ✨ Frontend

- **Power-Up System** (3 types)
  - 🧲 **Magnet** (5s): attracts nearby coins within 8-unit radius
  - ⚡ **Speed** (4s): doubles walk/run speed
  - ⏰ **Freeze** (3s): pauses round timer, extends other power-ups
  - Each has unique 3D model (torus/octahedron/sphere), glow, point light, pulsing animation
  - Collision detection, particle effects, synthesized sound effects per type

- **VRF Rarity → Power-Up Bonuses**
  - Uncommon: +0.5s duration, 1 starting power-up
  - Rare: +1.0s duration, 1 starting power-up
  - Legendary: +1.5s duration, 2 starting power-ups

- **Daily Challenge UI**
  - Daily banner: day number, countdown to UTC midnight, today's best score, streak display
  - Auto-refreshes every 60s, hidden on disconnect

- **Leaderboard Tabs**
  - "All Time" / "Today" tab switcher
  - Today tab fetches daily leaderboard from contract

- **New Achievement Claims**
  - Auto-attempts Daily Champion + Streak Master after each round

### 🛠 Architecture

- **Shared Config** (`frontend/src/config.js`)
  - `CONTRACT_ADDRESS`, `VRF_PROVIDER`, `RPC_URL` in one file
  - `contract.js` and `controller.js` both import from here
  - No more address mismatch bugs on redeploy

### 🐛 Bugfixes

- **Controller login broken after redeploy**: `controller.js` had old contract address, session key policies didn't match new contract

---

## [0.3.0] - February 9, 2026

### 🛠 Architecture

- **Build System Migration**: Migrated from vanilla JS + CDN to Vite + npm modules
  - Better DX with HMR and bundling
  - Easier Starknet SDK integration
  - `npm create vite@latest frontend -- --template vanilla`

- **VRF Integration Decision**: Manually define VRF interface instead of `cartridge_vrf` dependency
  - Avoids OpenZeppelin version conflict (2.0.0 vs 3.0.0)
  - Lighter codebase, same functionality

### ✨ Smart Contracts (Cairo)

- **PigNFT Contract** (`contracts/src/pig_nft.cairo`)
  - ERC721-based NFT with VRF-generated pig attributes
  - Attributes: color_hue, speed_bonus, size_scale, rarity (0-3)
  - One pig per player (Soulbound-ish)

- **Game Mechanics On-Chain**
  - `mint_pig()`: VRF generates unique pig attributes
  - `start_game()`: Tracks game rounds per player
  - `submit_score()`: Updates top-10 leaderboard
  - `claim_achievement()`: 4 achievements (Coin Collector, Master, Veteran, Legend)

- **Leaderboard System**
  - Top-10 global ranking
  - Auto-sorts on score submission
  - Prevents duplicate submissions per round

- **Daily Seed System**
  - `get_daily_seed()`: Deterministic seed from block timestamp
  - Same coin positions for all players on same day

- **VRF Interface** (`contracts/src/vrf_provider.cairo`)
  - Manual interface definition for Cartridge VRF
  - `consume_random(Source) -> felt252`
  - `request_random(caller, Source)`

### ✨ Frontend

- **Three.js Game Engine** (`frontend/src/main.js`)
  - 3D pig model with idle/walk/run animations
  - Third-person camera with spring-damper following
  - WASD + Arrow key movement, Shift to sprint
  - Circular world boundary (radius: 40 units)
  - Procedural environment (trees, rocks, flowers, grass)

- **Blockchain UI Skeleton**
  - Wallet connect button (top-right)
  - Mint panel for VRF pig generation
  - Pig stats display (color, speed, size, rarity)
  - Leaderboard panel (top-10)
  - Score HUD with submit button
  - Achievement display (4 achievements)

- **Pattern System**
  - 8 pig skin patterns: Houndstooth, Stripes, Polka Dots, Plaid, Stars, Diamond, Chevron, Camo
  - Pattern derived from VRF color_hue + rarity

### 🎮 Game Features

- ✅ 3D pig model with animations
- ✅ Third-person camera with smooth following
- ✅ Keyboard controls (WASD + arrows + Shift)
- ✅ Procedural environment generation
- ✅ Circular world boundary
- ⬜ Wallet connection (planned: Cartridge Controller)
- ⬜ VRF mint flow (planned)
- ⬜ Collectibles spawning (planned)
- ⬜ On-chain score submission (planned)

### 📝 Documentation

- **Project Plan** (`project-plan-v2.md`)
  - 5-day build schedule for ETHGlobal SF
  - Day-by-day task breakdown
  - Contract architecture design

- **Project Memory** (`memory.md`)
  - Active decisions log
  - Tech stack reference
  - Known issues and assumptions to test

- **Hackathon Research** (`hackathon-opportunities.md`)
  - SF hackathon events (ethSF, DeSci, Aztec, etc.)
  - Prize pools and eligibility requirements

---

## [0.1.0] - December 10, 2025 (Original Game)

### ✨ Frontend
- Initial Three.js game implementation
- GLTF pig model with animations
- Third-person camera system
- Procedural environment generation
- Keyboard controls (WASD + arrows)
- Shadow mapping and lighting

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

Categories:
- **🛠 Architecture** - Structural changes, build system, dependencies
- **✨ Smart Contracts** - Cairo contract changes
- **✨ Frontend** - UI, game engine, blockchain integration
- **🎮 Game Features** - Gameplay mechanics
- **📝 Documentation** - Docs, plans, research
- **🐛 Bugfixes** - Bug fixes
