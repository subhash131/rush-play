import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

const SONIC_RPC_URL = "https://api.testnet.sonic.game/";
const PROGRAM_ID = new PublicKey(
  "Eq8DnEtutnm4snJtPR8AUho6Jtzk5WkxW6NF2HgeaUCX"
); // Replace with actual program ID
const ACCOUNT_TO_UPDATE = new PublicKey("Account_To_Update"); // Replace with the target account

export default function CallSmartContract() {
  const { publicKey, sendTransaction } = useWallet();

  const interactWithContract = async () => {
    if (!publicKey) {
      console.error("Wallet not connected");
      return;
    }

    const connection = new Connection(SONIC_RPC_URL, "confirmed");

    // Create a new transaction
    const transaction = new Transaction().add({
      keys: [
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: ACCOUNT_TO_UPDATE, isSigner: false, isWritable: true },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from([42]),  
    });

    try {
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction Signature:", signature);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return <button onClick={interactWithContract}>Call Contract</button>;
}
