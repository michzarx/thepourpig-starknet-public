import Controller from "@cartridge/controller";
import { constants } from "starknet";
import { CONTRACT_ADDRESS, VRF_PROVIDER } from "./config.js";

const controller = new Controller({
  appId: "thepourpig",
  chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" }],
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  policies: {
    contracts: {
      [CONTRACT_ADDRESS]: {
        methods: [
          { name: "mint_pig", entrypoint: "mint_pig" },
          { name: "start_game", entrypoint: "start_game" },
          { name: "submit_score", entrypoint: "submit_score" },
          { name: "claim_achievement", entrypoint: "claim_achievement" },
        ],
      },
      [VRF_PROVIDER]: {
        methods: [
          { name: "request_random", entrypoint: "request_random" },
        ],
      },
    },
  },
});

let account = null;

export async function connect() {
  try {
    const res = await controller.connect();
    if (res) {
      account = res;
      return account;
    }
  } catch (e) {
    console.error("Controller connect error:", e);
    throw e;
  }
  return null;
}

export async function disconnect() {
  await controller.disconnect();
  account = null;
}

export function getAccount() {
  return account;
}

export function getAddress() {
  if (!account) return null;
  return account.address;
}

export function shortAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}
