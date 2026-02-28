import { Contract, RpcProvider, CallData, cairo } from "starknet";
import { getAccount } from "./controller.js";
import { CONTRACT_ADDRESS, VRF_PROVIDER, RPC_URL } from "./config.js";

const provider = new RpcProvider({
  nodeUrl: RPC_URL,
});

// Cache ABI fetched from chain
let cachedAbi = null;
async function fetchAbi() {
  if (cachedAbi) return cachedAbi;
  const cls = await provider.getClassAt(CONTRACT_ADDRESS);
  cachedAbi = cls.abi;
  return cachedAbi;
}

async function getReadContract() {
  const abi = await fetchAbi();
  return new Contract({ abi, address: CONTRACT_ADDRESS, provider });
}

async function getWriteContract() {
  const account = getAccount();
  if (!account) throw new Error("Not connected");
  const abi = await fetchAbi();
  return new Contract({ abi, address: CONTRACT_ADDRESS, provider: account });
}

// Mint pig via multicall: request_random + mint_pig
export async function mintPig() {
  const account = getAccount();
  if (!account) throw new Error("Not connected");

  // Multicall: 1) request VRF random, 2) mint pig
  // Source enum: Nonce=0, Salt=1. We use Nonce variant with contract address.
  const calls = [
    {
      contractAddress: VRF_PROVIDER,
      entrypoint: "request_random",
      calldata: [CONTRACT_ADDRESS, "0", CONTRACT_ADDRESS],
    },
    {
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: "mint_pig",
      calldata: [],
    },
  ];

  const tx = await account.execute(calls);

  // Wait for confirmation
  await provider.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

// Start game round (on-chain timer)
export async function startGame() {
  const account = getAccount();
  if (!account) throw new Error("Not connected");

  const tx = await account.execute([
    {
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: "start_game",
      calldata: [],
    },
  ]);

  await provider.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

// Submit score
export async function submitScore(score) {
  const account = getAccount();
  if (!account) throw new Error("Not connected");

  const tx = await account.execute([
    {
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: "submit_score",
      calldata: CallData.compile({ score }),
    },
  ]);

  await provider.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

// Read: check if player already has an achievement
export async function hasAchievement(playerAddress, achievementId) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("has_achievement", [playerAddress, achievementId]);
    return Boolean(result);
  } catch {
    return false;
  }
}

// Claim achievement
export async function claimAchievement(achievementId) {
  const account = getAccount();
  if (!account) throw new Error("Not connected");

  const tx = await account.execute([
    {
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: "claim_achievement",
      calldata: CallData.compile({ achievement_id: achievementId }),
    },
  ]);

  await provider.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

// Read: get player's pig token ID
export async function getPlayerPig(playerAddress) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_player_pig", [playerAddress]);
    // u256 returns as bigint or object with low/high
    if (typeof result === 'bigint') return Number(result);
    if (result && result.low !== undefined) return Number(result.low);
    return Number(result);
  } catch (e) {
    return 0;
  }
}

// Read: get pig attributes
export async function getPigAttributes(tokenId) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_pig_attributes", [
      cairo.uint256(tokenId),
    ]);
    // With full ABI, result is a PigAttributes struct with named fields
    return {
      colorHue: Number(result.color_hue ?? result[0]),
      speedBonus: Number(result.speed_bonus ?? result[1]),
      sizeScale: Number(result.size_scale ?? result[2]),
      rarity: Number(result.rarity ?? result[3]),
    };
  } catch (e) {
    return null;
  }
}

// Read: get player score
export async function getPlayerScore(playerAddress) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_player_score", [playerAddress]);
    return Number(result);
  } catch {
    return 0;
  }
}

// Read: get leaderboard
export async function getLeaderboard() {
  const contract = await getReadContract();
  try {
    const size = Number(await contract.call("get_leaderboard_size", []));
    const entries = [];
    for (let i = 0; i < size; i++) {
      const entry = await contract.call("get_leaderboard_entry", [i]);
      // With full ABI, entry is a LeaderboardEntry struct
      const player = entry.player ?? entry[0];
      const score = entry.score ?? entry[1];
      entries.push({
        player: "0x" + BigInt(player).toString(16),
        score: Number(score),
      });
    }
    return entries;
  } catch (e) {
    return [];
  }
}

// Read: total supply
export async function getTotalSupply() {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_total_supply", []);
    return Number(result);
  } catch {
    return 0;
  }
}

// Read: daily seed for coin positions
export async function getDailySeed() {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_daily_seed", []);
    return BigInt(result).toString();
  } catch {
    return "0";
  }
}

// Read: games played
export async function getGamesPlayed(playerAddress) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_games_played", [playerAddress]);
    return Number(result);
  } catch {
    return 0;
  }
}

// Read: daily leaderboard
export async function getDailyLeaderboard(day) {
  const contract = await getReadContract();
  try {
    const size = Number(await contract.call("get_daily_leaderboard_size", [day]));
    const entries = [];
    for (let i = 0; i < size; i++) {
      const entry = await contract.call("get_daily_leaderboard_entry", [day, i]);
      const player = entry.player ?? entry[0];
      const score = entry.score ?? entry[1];
      entries.push({
        player: "0x" + BigInt(player).toString(16),
        score: Number(score),
      });
    }
    return entries;
  } catch (e) {
    return [];
  }
}

// Read: current day number
export async function getCurrentDay() {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_current_day", []);
    return Number(result);
  } catch {
    return 0;
  }
}

// Read: player daily score
export async function getPlayerDailyScore(playerAddress, day) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_player_daily_score", [playerAddress, day]);
    return Number(result);
  } catch {
    return 0;
  }
}

// Read: player streak
export async function getPlayerStreak(playerAddress) {
  const contract = await getReadContract();
  try {
    const result = await contract.call("get_player_streak", [playerAddress]);
    return Number(result);
  } catch {
    return 0;
  }
}

const RARITY_NAMES = ["Common", "Uncommon", "Rare", "Legendary"];
export function rarityName(rarity) {
  return RARITY_NAMES[rarity] || "Unknown";
}

// Seeded PRNG for deterministic coin positions from daily seed
export function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  }
  return function() {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}
