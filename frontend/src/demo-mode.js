/**
 * DEMO MODE — For recording purposes only
 *
 * USAGE:
 * 1. Uncomment the script in index.html
 * 2. Open the game
 * 3. Run `enableDemoMode()` in browser console
 * 4. Leaderboard will be populated with fake data
 */

// Fake data
const DEMO_ADDRESSES = [
  '0x1234...abcd',
  '0x5678...efgh',
  '0x9abc...def0',
  '0x1111...2222',
  '0x3333...4444',
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

  // Override getDailyLeaderboard — more competitive
  window.getDailyLeaderboard = async () => [
    { player: DEMO_ADDRESSES[0], score: 450 },
    { player: '0xabcd...1234', score: 423 },  // Close to #1
    { player: DEMO_ADDRESSES[1], score: 398 },
    { player: DEMO_ADDRESSES[2], score: 356 },
    { player: '0xdead...beef', score: 312 },
  ];

  // Override getPlayerDailyScore — player's best today
  window.getPlayerDailyScore = async () => 380;

  // Override getPlayerStreak — show active streak
  window.getPlayerStreak = async () => 3;

  // Override getCurrentDay
  window.getCurrentDay = async () => 142;

  console.log('%c✅ Demo mode enabled! Leaderboards will show fake data.', 'color: #4ecdc4; font-weight: bold');
  console.log('%cRun refreshLeaderboard() to update the display.', 'color: #666');
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
