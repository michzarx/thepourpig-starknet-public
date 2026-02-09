import { Contract, RpcProvider, CallData, cairo } from "starknet";
import { getAccount } from "./controller.js";

const CONTRACT_ADDRESS = "0x077980c0fc1ef925fa1d962c6457ae86ba18e8a151570ec9af6e9371124530bc";
const VRF_PROVIDER = "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f";

const provider = new RpcProvider({
  nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
});

// Cache ABI fetched from chain
let cachedAbi = null;
async function fetchAbi() {
  if (cachedAbi) return cachedAbi;
  const cls = await provider.getClassAt(CONTRACT_ADDRESS);
  cachedAbi = cls.abi;
  console.log('Fetched ABI from chain');
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
  console.log("Mint tx:", tx.transaction_hash);

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
    console.log('getPlayerPig raw result:', result);
    // u256 returns as bigint or object with low/high
    if (typeof result === 'bigint') return Number(result);
    if (result && result.low !== undefined) return Number(result.low);
    return Number(result);
  } catch (e) {
    console.error('getPlayerPig error:', e);
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
    console.log('getPigAttributes raw result:', result);
    // With full ABI, result is a PigAttributes struct with named fields
    return {
      colorHue: Number(result.color_hue ?? result[0]),
      speedBonus: Number(result.speed_bonus ?? result[1]),
      sizeScale: Number(result.size_scale ?? result[2]),
      rarity: Number(result.rarity ?? result[3]),
    };
  } catch (e) {
    console.error('getPigAttributes error:', e);
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
      console.log('leaderboard entry raw:', entry);
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
    console.error('getLeaderboard error:', e);
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
