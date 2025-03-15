import { Connection, clusterApiUrl } from "@solana/web3.js";

const SONIC_RPC_URL = "https://api.testnet.sonic.game/";
const connection = new Connection(SONIC_RPC_URL, "confirmed");

export async function getBlockNumber() {
  const slot = await connection.getSlot();
  console.log("Current Slot:", slot);
}

getBlockNumber();
