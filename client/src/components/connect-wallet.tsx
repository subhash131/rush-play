"use client";

import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import idl from "@/utils/idl.json"; // Your IDL file
import { Connection } from "@solana/web3.js";
import { PROGRAM_ID } from "@/utils/constants";

const SONIC_RPC_URL = "https://api.testnet.sonic.game/";
// const PROGRAM_ID = new web3.PublicKey(PROGRAM_ID); // Replace with your program ID

export default function UpdateContractButton() {
  const wallet = useAnchorWallet(); // Get connected wallet

  const updateContract = async () => {
    if (!wallet) {
      console.error("Wallet not connected");
      return;
    }

    const provider = new AnchorProvider(new Connection(SONIC_RPC_URL), wallet, {
      preflightCommitment: "confirmed",
    });

    const program = new Program(idl as Idl, PROGRAM_ID, provider);

    try {
      const res = await program.methods
        .addUser("test 2")
        .accounts({
          user: new web3.PublicKey(
            "4kppMrZnVDRFYZ28VGDprC5Ac34xge8cceeMoKUoGFx3"
          ),
          authority: wallet.publicKey,
        })
        .rpc();

      console.log("Transaction successful:", res);
    } catch (error) {
      console.error("Transaction failed:", JSON.stringify(error, null, 2));
    }
  };

  return (
    <button onClick={updateContract} disabled={!wallet?.publicKey}>
      Update Contract
    </button>
  );
}
