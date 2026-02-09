# Changelog

All notable changes to The Pour Pig project will be documented in this file.

---

## [Unreleased] - February 9, 2026

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
