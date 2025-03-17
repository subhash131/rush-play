import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import idl from "@/utils/idl.json";
import { PROGRAM_ID } from "@/utils/constants";

const provider = new AnchorProvider(
  new web3.Connection("https://api.testnet.sonic.game/"),
  window.solana,
  { preflightCommitment: "processed" }
);

const program = new Program(idl as Idl, PROGRAM_ID, provider);

export async function callContract() {
  const res = await program.account.user.fetch(
    "D2q5zLESyvLy94ZKmZNrPtETSesJJthwmX4kJ49S8zmz"
  );
  console.log(JSON.stringify(res, null, 2));
}
export async function updateContract() {
  const wallet = window.solana;

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
