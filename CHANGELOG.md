# Changelog

All notable changes to The Pour Pig project will be documented in this file.

## [Unreleased] - February 9, 2026

### Added
- **Project Planning**: Comprehensive implementation plan (project-plan-v2.md)
  - 5-day build schedule for ETHGlobal San Francisco
  - Cairo contract architecture (PigNFT, Leaderboard, Achievements)
  - Cartridge Controller + Sepolia deployment strategy

- **Hackathon Research**: Documented SF hackathon opportunities
  - ethSF, DeSci, Aztec, and other events
  - Prize pools and eligibility requirements

### Changed
- Updated project memory.md with VRF integration decision
- Finalized tech stack: Vite + Three.js + Cairo + Cartridge

---

## [0.2.0] - February 8, 2026

### Added
- **Vite Project Setup**: Initialized frontend with Vite build tool
  - `npm create vite@latest frontend -- --template vanilla`
  - Configured for vanilla JavaScript + Three.js

- **Three.js Integration**: Migrated from CDN to npm module
  - Installed `three` via npm
  - Updated imports from `https://unpkg.com/three@0.160.0/` to `import * as THREE from 'three'`
  - GLTFLoader now imports from `three/addons/loaders/GLTFLoader.js`

- **Game Migration**: Ported existing game to Vite structure
  - Moved `game.js` → `frontend/src/main.js`
  - Moved inline CSS → `frontend/src/style.css`
  - Copied `poorPIG.glb` to `frontend/public/`

- **Blockchain UI Skeleton**: Added placeholder UI for Starknet integration
  - Wallet connect button (top-right)
  - Mint panel (for VRF pig generation)
  - Pig stats display (color, speed, size, rarity)
  - Leaderboard panel
  - Score HUD with submit button

- **Project Documentation**:
  - `memory.md` - Project decisions, tech stack, known issues
  - `CHANGELOG.md` - This file

### Changed
- **HTML Structure**: Updated `index.html` with blockchain UI elements
- **CSS**: Expanded styles from ~100 lines to ~330 lines with game + blockchain UI
- **Import Pattern**: Changed from ES modules via importmap to npm imports

### Technical Decisions
- **VRF Integration**: Decided to manually define VRF interface instead of using `cartridge_vrf` dependency due to OpenZeppelin version conflict (2.0.0 vs 3.0.0)
- **Build Tool**: Chose Vite over vanilla setup for better DX and Starknet SDK integration

### Removed
- `frontend/src/counter.js` - Default Vite template file
- `frontend/src/javascript.svg` - Default Vite template asset

### Game Features (Working)
- ✅ 3D pig model with idle/walk/run animations
- ✅ Third-person camera with spring-damper following
- ✅ WASD + Arrow key movement
- ✅ Sprint with Shift key
- ✅ Circular world boundary (radius: 40 units)
- ✅ Procedural environment (trees, rocks, flowers, grass patches)

### Game Features (Planned)
- ⬜ Wallet connection via Cartridge Controller
- ⬜ VRF-based pig attribute generation
- ⬜ Collectibles (coins, gems, legendary items)
- ⬜ Chain-based achievements
- ⬜ On-chain leaderboard
- ⬜ Score submission

---

## [0.1.0] - December 10, 2025 (Original Game)

### Added
- Initial Three.js game implementation
- GLTF pig model with animations
- Third-person camera system
- Procedural environment generation
- Keyboard controls (WASD + arrows)
- Shadow mapping and lighting

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes
