# The Pour Pig - Project Memory

## Active Decisions

### Engineering Decision: VRF Integration (Feb 8, 2026)
**Decision:** Skip `cartridge_vrf` npm dependency, manually define VRF interface in Cairo

**Why:**
- `cartridge_vrf` requires OpenZeppelin 2.0.0
- Project uses OpenZeppelin 3.0.0
- Cairo doesn't allow multiple major versions simultaneously

**Solution:**
```cairo
#[starknet::interface]
pub trait IVrfProvider<TContractState> {
    fn consume_random(ref self: TContractState, source: Source) -> felt252;
    fn request_random(ref self: TContractState, caller: ContractAddress, source: Source);
}
```

**Benefits:**
- Avoids dependency hell
- Lighter codebase
- Same functionality (interface-compatible)
- Aligns with "One Sharp Knife" philosophy

**Risk:** Must verify interface signatures match Cartridge VRF contract exactly.

---

### Frontend Architecture (Feb 8, 2026)
**Decision:** Migrate from vanilla JS + CDN to Vite + npm modules

**Why:**
- Better dev experience (HMR, bundling)
- Easier Starknet SDK integration
- Project structure aligns with hackathon requirements

**Tech Stack:**
- **Build:** Vite
- **3D:** Three.js (npm)
- **Wallet:** Cartridge Controller (planned)
- **Contract:** starknet.js (planned)

---

## Tech Stack

| Layer | Choice | Status |
|-------|--------|--------|
| Game | Three.js | ✅ Working |
| Build Tool | Vite | ✅ Configured |
| 3D Model | poorPIG.glb | ✅ Loaded |
| Smart Contract | Cairo (planned) | ⬜ Not started |
| Wallet | Cartridge Controller (planned) | ⬜ Not started |
| VRF | Manual interface + Cartridge Sepolia | ⬜ Contract pending |

---

## Known Issues

### Current Issues
- None (game runs locally)

### Potential Issues
- Cartridge Controller integration not yet tested
- VRF interface not yet verified against actual contract
- No collectibles/achievements implemented yet

---

## Assumptions to Test

### Game Mechanics
- [ ] VRF-generated pig attributes affect gameplay meaningfully
- [ ] Distance-based scoring is fun enough
- [ ] Collectibles system will work with current movement

### Blockchain Integration
- [ ] Cartridge Controller works without browser extension
- [ ] VRF randomness is truly unpredictable
- [ ] Gas fees on Sepolia remain low for frequent achievements

### User Experience
- [ ] Loading time for 3D model is acceptable
- [ ] Mobile controls (if added) work well
- [ ] New users understand wallet connect flow

---

## File Structure Reference

```
thepourpig-starknet/
├── contracts/              # Cairo smart contracts (TO DO)
│   ├── Scarb.toml
│   └── src/
├── frontend/               # Vite + Three.js ✅
│   ├── public/
│   │   └── poorPIG.glb    # 3D pig model
│   ├── src/
│   │   ├── main.js        # Game engine + blockchain UI
│   │   ├── style.css      # Game + UI styles
│   │   ├── controller.js  # Cartridge Controller (TO DO)
│   │   └── contract.js    # Contract interactions (TO DO)
│   ├── index.html
│   └── package.json
├── game.js                 # Original vanilla version (backup)
├── index.html              # Original HTML (backup)
├── poorPIG.glb             # Original 3D model (backup)
├── project-plan-v2.md      # Implementation plan
└── memory.md               # This file
```

---

## Code References

### Game Entry Point
- [main.js](frontend/src/main.js) - Lines 806-832: `initWithBlockchain()` function

### Pig Rendering
- [main.js](frontend/src/main.js) - Lines 710-729: `applyPigAttributes()` - Applies VRF colors/scale to 3D model

### Configuration
- [main.js](frontend/src/main.js) - Lines 12-36: Game CONFIG object (speed, camera, world boundaries)

---

## Next Steps (Per project-plan-v2.md)

1. **Day 1:** Cairo contracts (pig_nft.cairo, leaderboard.cairo, achievements.cairo)
2. **Day 2:** Deploy to Sepolia + Cartridge Controller integration
3. **Day 3:** Mint flow + pig attributes rendering
4. **Day 4:** Collectibles + achievements + leaderboard UI
5. **Day 5:** Polish + deploy + demo video
