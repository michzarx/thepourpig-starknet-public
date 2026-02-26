/**
 * DEMO MODE — For recording purposes only
 *
 * USAGE:
 * 1. Uncomment the script in index.html
 * 2. Open the game
 * 3. Run `enableDemoMode()` in browser console
 * 4. Leaderboard will be populated with fake data
 * 5. Run `previewPig(1)`, `previewPig(2)`, etc. to see different pig styles
 */

// Fake data
const DEMO_ADDRESSES = [
  '0x1234...abcd',
  '0x5678...efgh',
  '0x9abc...def0',
  '0x1111...2222',
  '0x3333...4444',
];

// Pre-configured pig presets for demo recording
// All 8 patterns covered: Houndstooth(0), Stripes(1), Polka Dots(2), Plaid(3), Stars(4), Diamond(5), Chevron(6), Camo(7)
const PIG_PRESETS = [
  { name: 'Red Common',        colorHue: 0,   rarity: 0, speedBonus: 5,  sizeScale: 100 }, // Pattern 0: Houndstooth
  { name: 'Cyan Rare',         colorHue: 180, rarity: 2, speedBonus: 12, sizeScale: 100 }, // Pattern 6: Chevron
  { name: 'Purple Legendary',  colorHue: 270, rarity: 3, speedBonus: 18, sizeScale: 100 }, // Pattern 5: Diamond
  { name: 'Green Uncommon',    colorHue: 120, rarity: 1, speedBonus: 8,  sizeScale: 100 }, // Pattern 5: Diamond
  { name: 'Orange Rare',       colorHue: 30,  rarity: 2, speedBonus: 14, sizeScale: 100 }, // Pattern 0: Houndstooth
  { name: 'Blue Common',       colorHue: 210, rarity: 0, speedBonus: 3,  sizeScale: 100 }, // Pattern 2: Polka Dots
  { name: 'Blue Legendary',    colorHue: 240, rarity: 3, speedBonus: 20, sizeScale: 100 }, // Pattern 7: Camo
  { name: 'Yellow Uncommon',   colorHue: 60,  rarity: 1, speedBonus: 10, sizeScale: 100 }, // Pattern 1: Stripes
  { name: 'Mint Rare',         colorHue: 1,   rarity: 2, speedBonus: 13, sizeScale: 100 }, // Pattern 3: Plaid
  { name: 'Teal Rare',         colorHue: 90,  rarity: 2, speedBonus: 15, sizeScale: 100 }, // Pattern 4: Stars
];

/**
 * Enable demo mode — populates leaderboards with fake data
 */
window.enableDemoMode = () => {
  console.log('%c🎬 ENABLING DEMO MODE', 'color: #ff6b6b; font-size: 20px; font-weight: bold');

  // Override getLeaderboard
  window.getLeaderboard = async () => [
    { player: '0xabcd...1234', score: 587 },
    { player: DEMO_ADDRESSES[0], score: 542 },
    { player: DEMO_ADDRESSES[1], score: 498 },
    { player: '0xdead...beef', score: 456 },
    { player: DEMO_ADDRESSES[2], score: 412 },
    { player: '0xcafe...babe', score: 389 },
    { player: DEMO_ADDRESSES[3], score: 345 },
    { player: '0xfefe...fefe', score: 298 },
  ];

  // Override getDailyLeaderboard — more competitive (accepts day param but ignores it)
  window.getDailyLeaderboard = async (_day) => [
    { player: DEMO_ADDRESSES[0], score: 450 },
    { player: '0xabcd...1234', score: 423 },  // Close to #1
    { player: DEMO_ADDRESSES[1], score: 398 },
    { player: DEMO_ADDRESSES[2], score: 356 },
    { player: '0xdead...beef', score: 312 },
  ];

  // Override getPlayerScore — for top right HUD display
  window.getPlayerScore = async (_playerAddress) => 380;

  // Override getPlayerDailyScore — player's best today (accepts 2 params but ignores them)
  window.getPlayerDailyScore = async (_playerAddress, _day) => 380;

  // Override getPlayerStreak — show active streak
  window.getPlayerStreak = async (_playerAddress) => 3;

  // Override getCurrentDay
  window.getCurrentDay = async () => 142;

  // Refresh displays immediately
  if (window.updateDailyBanner) window.updateDailyBanner();

  // Update top bar score display
  const playerScoreEl = document.getElementById('player-score');
  if (playerScoreEl) playerScoreEl.textContent = 'Best: 380';

  console.log('%c✅ Demo mode enabled! Leaderboards will show fake data.', 'color: #4ecdc4; font-weight: bold');
  console.log('%cRun refreshLeaderboard() to update the display.', 'color: #666');
  console.log('%c🐷 Run previewPig(1-10) to see different pig styles!', 'color: #ff9500; font-weight: bold');
};

/**
 * Preview different pig styles for recording
 * Usage: previewPig(1) for preset 1, previewPig(2) for preset 2, etc.
 */
window.previewPig = (presetIndex) => {
  const idx = (presetIndex - 1) % PIG_PRESETS.length;
  const preset = PIG_PRESETS[idx];

  console.log(`%c🐷 Loading: ${preset.name}`, 'color: #ff9500; font-size: 14px; font-weight: bold');
  console.log(`  Pattern: ${preset.colorHue + preset.rarity * 37 % 8}/8 | Rarity: ${preset.rarity}/3 | Speed: +${preset.speedBonus} | Size: ${preset.sizeScale}%`);

  // Trigger custom event that main.js listens for
  window.dispatchEvent(new CustomEvent('demo-preview-pig', { detail: preset }));
};

/**
 * List all available pig presets
 */
window.listPigPresets = () => {
  console.log('%c🐷 Available Pig Presets:', 'color: #ff9500; font-size: 14px; font-weight: bold');
  PIG_PRESETS.forEach((p, i) => {
    const patternIdx = (p.colorHue + p.rarity * 37) % 8;
    const rarityNames = ['Common', 'Uncommon', 'Rare', 'Legendary'];
    console.log(`  ${i + 1}. ${p.name.padEnd(18)} | Pattern: ${patternIdx} | Rarity: ${rarityNames[p.rarity]} | Speed: +${p.speedBonus} | Size: ${p.sizeScale}%`);
  });
};

/**
 * Refresh leaderboard after enabling demo mode
 */
window.refreshLeaderboard = () => {
  const lbBtn = document.getElementById('leaderboard-btn');
  if (lbBtn) lbBtn.click();
};

/**
 * Disable demo mode — restores real data
 */
window.disableDemoMode = () => {
  console.log('%c🔴 DISABLING DEMO MODE', 'color: #f66; font-size: 16px; font-weight: bold');
  console.log('%cRefresh the page to restore real blockchain data.', 'color: #666');
};

console.log('%cDemo Mode loaded. Run enableDemoMode() in console to activate.', 'color: #999; font-style: italic');
