import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_ID } from "@/utils/constants";

const SONIC_RPC_URL = "https://api.testnet.sonic.game/";

const ACCOUNT_TO_UPDATE = new PublicKey("Account_To_Update");

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
      programId: new PublicKey(PROGRAM_ID),
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
