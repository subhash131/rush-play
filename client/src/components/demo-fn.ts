import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import idl from "@/utils/idl.json"; // Replace with your program's IDL
import { PublicKey } from "@solana/web3.js";

const provider = new AnchorProvider(
  new web3.Connection("https://api.testnet.sonic.game/"),
  window.solana,
  { preflightCommitment: "processed" }
);

const program = new Program(
  idl as Idl,
  "Eq8DnEtutnm4snJtPR8AUho6Jtzk5WkxW6NF2HgeaUCX",
  provider
);

export async function callContract() {
  const res = await program.account.user.fetch(
    "D2q5zLESyvLy94ZKmZNrPtETSesJJthwmX4kJ49S8zmz"
  );
  console.log(JSON.stringify(res, null, 2));
}
export async function updateContract() {
  const wallet = window.solana; // Ensure wallet is available

  if (!wallet || !wallet.publicKey) {
    console.error("Wallet not connected");
    return;
  }

  try {
    const res = await program.methods
      .addUser("testUser")
      .accounts({
        user: new web3.PublicKey(
          "CXRTdEUmioVsANoSAtZTfDvwNWGth4QReSAAw9yT5GRm"
        ),
        authority: wallet.publicKey,
      })
      .rpc();

    console.log("Transaction successful:", res);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}
