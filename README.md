# 🐷 The Pour Pig — Starknet Coin Rush

> Every pig is unique. Every score is on-chain. Zero popups.

A 3D browser game where players mint unique pig NFTs with on-chain random attributes, then compete in timed coin-collecting rounds — all powered by Starknet's native account abstraction and verifiable randomness.

🎮 **[Play Now → thepourpig.netlify.app](https://thepourpig.netlify.app)**

📜 **[Contract on Starkscan](https://sepolia.starkscan.co/contract/0x077980c0fc1ef925fa1d962c6457ae86ba18e8a151570ec9af6e9371124530bc)**

---

## Why This Project?

Most blockchain games suffer from terrible UX: install a wallet extension, backup seed phrases, confirm every transaction with popups. **The Pour Pig** proves that Starknet can deliver a seamless gaming experience indistinguishable from Web2 — while keeping everything verifiable on-chain.

### Three Starknet-Native Features

| Feature | Technology | What It Does |
|---------|-----------|--------------|
| **Unique NFTs** | Cartridge VRF | Each pig's pattern, speed, size, and rarity are generated from on-chain verifiable randomness at mint time |
| **Zero-Popup Gameplay** | Cartridge Controller (AA + Session Keys) | Players sign in once, then start_game / submit_score / claim_achievement all execute automatically |
| **On-Chain Competition** | Cairo Smart Contract | Leaderboard, achievements, anti-cheat timer, and daily seed are all enforced by the contract |

---

## Gameplay

1. **Connect** — One-click login via Cartridge Controller (username/Google/Discord)
2. **Mint** — Get a unique pig with VRF-generated attributes (pattern, speed, size, rarity)
3. **Play** — 60-second Coin Rush: collect 15 coins + 1 golden coin (50 pts!) on a 3D field
4. **Compete** — Scores auto-submit to the on-chain leaderboard; achievements unlock automatically

### VRF Attributes Affect Gameplay

- **Speed Bonus** (0-20%) → Faster pigs collect more coins
- **Size Scale** (80-120%) → Visual variety
- **Pattern** (8 types × 360 hues) → Houndstooth, stripes, polka dots, plaid, stars, diamond, chevron, camo
- **Rarity** (Common/Uncommon/Rare/Legendary) → Rarer pigs tend to be faster

### Achievements (On-Chain Validated)

| ID | Name | Condition |
|----|------|-----------|
| 0 | Coin Collector | Score ≥ 100 |
| 1 | Coin Master | Score ≥ 500 |
| 2 | Veteran | 10+ games played |
| 3 | Legend | Score ≥ 1000 |

---

## Tech Stack

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite)                        │
│                                                          │
│  Three.js          Cartridge Controller    contract.js    │
│  - 3D pig model    - AA + Session Keys    - mintPig()    │
│  - coin.glb        - One-click login      - submitScore()│
│  - Canvas2D        - Zero popups          - claimAchieve │
│    patterns                               - getLeaderboard│
│  - Particles                              - getAttributes│
│  - Web Audio                                             │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   STARKNET SEPOLIA                        │
│                                                          │
│  Cartridge VRF Provider    PigNFT Contract               │
│  - request_random()        - ERC721 (OpenZeppelin)       │
│  - On-chain verifiable     - mint_pig() + VRF attributes │
│                            - start_game() + anti-cheat   │
│                            - submit_score() + leaderboard│
│                            - claim_achievement()         │
│                            - get_daily_seed() (Poseidon) │
└──────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|-------|-----------|
| Smart Contract | Cairo (Scarb 2.15.1) + OpenZeppelin ERC721 |
| Randomness | Cartridge VRF (on-chain verifiable) |
| Account Abstraction | Cartridge Controller (session keys) |
| 3D Engine | Three.js + GLTFLoader |
| Textures | Canvas2D procedural generation → CanvasTexture |
| Sound | Web Audio API (synthesized, no files) |
| Build | Vite 7 |
| Deploy | Netlify |

---

## Contract Details

| Field | Value |
|-------|-------|
| **Network** | Starknet Sepolia |
| **Contract** | `0x077980c0fc1ef925fa1d962c6457ae86ba18e8a151570ec9af6e9371124530bc` |
| **Class Hash** | `0x6d6473dbfbaf0d40c43397c2b16ccffe3f7db5e82851108b92d076b26006031` |
| **VRF Provider** | `0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f` |
| **RPC** | `https://api.cartridge.gg/x/starknet/sepolia` |
| **Explorer** | [Starkscan](https://sepolia.starkscan.co/contract/0x077980c0fc1ef925fa1d962c6457ae86ba18e8a151570ec9af6e9371124530bc) |

---

## Run Locally

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/thepourpig-starknet.git
cd thepourpig-starknet/frontend

# Install
npm install

# Dev server
npm run dev
# → http://localhost:3000
```

### Build Cairo Contract (optional)

```bash
cd contracts
scarb build        # Compile
snforge test       # Run 11 tests
```

---

## Project Structure

```
thepourpig-starknet/
├── contracts/
│   ├── Scarb.toml
│   ├── src/
│   │   ├── lib.cairo
│   │   ├── pig_nft.cairo         # ERC721 + VRF + Leaderboard + Achievements + Coin Rush
│   │   └── vrf_provider.cairo    # Cartridge VRF interface
│   └── tests/
│       └── test_contract.cairo   # 11 tests
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.js               # Game engine + rendering + collectibles + patterns + VFX
│   │   ├── contract.js           # Cartridge Controller + contract interactions
│   │   └── style.css             # UI styles
│   └── public/
│       ├── poorPIG.glb           # Pig 3D model
│       └── coin.glb              # Coin 3D model
└── README.md
```

---

## Anti-Cheat Design

The contract enforces fair play:

1. `start_game()` records `block_timestamp` on-chain
2. `submit_score()` validates `block_timestamp - start_time ≤ 120s`
3. Scores can only be submitted once per round (resets `game_start`)
4. `get_daily_seed()` uses `Poseidon hash(day_number)` so all players see the same coin layout each day

---

## Built For

**Starknet Re{define} Hackathon** — Demonstrating that Starknet's native account abstraction + VRF can deliver Web2-quality gaming UX while keeping everything verifiable on-chain.

---

## License

MIT
