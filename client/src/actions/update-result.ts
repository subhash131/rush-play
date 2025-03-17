"use client";
import { getMasterAddress, getUserAddress } from "@/utils/program";
import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import {
  PublicKey,
  TransactionSignature,
  Connection,
  Keypair,
} from "@solana/web3.js";
import idl from "@/utils/idl.json";
import { PROGRAM_ID } from "@/utils/constants";

export const updateResult = async ({
  connection,
  userAddress,
  value,
  adminPrivateKey,
}: {
  connection: Connection;
  userAddress: PublicKey;
  value: number;
  adminPrivateKey: Uint8Array;
}): Promise<TransactionSignature | undefined> => {
  const adminKeypair = Keypair.fromSecretKey(adminPrivateKey);

  const provider = new AnchorProvider(
    connection,
    { publicKey: adminKeypair.publicKey } as any,
    { preflightCommitment: "processed" }
  );

  const userPk = getUserAddress(userAddress);
  const masterPk = getMasterAddress();
  if (!userPk || !masterPk) {
    console.error("Failed to derive user or master address");
    return undefined;
  }

  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  try {
    const master = await program.account.master.fetch(masterPk);
    if (!adminKeypair.publicKey.equals(master.owner)) {
      console.error(
        "Provided private key does not match the admin (master.owner)"
      );
      return undefined;
    }

    const transaction = await program.methods
      .updateResult(value, userAddress)
      .accounts({
        user: userPk,
        master: masterPk,
        authority: adminKeypair.publicKey,
      })
      .transaction(); // Get the transaction object

    // Sign the transaction with the admin’s private key
    const signedTx = await provider.wallet.signTransaction(transaction); // This won’t work without a real wallet, so we sign manually
    //TODO:: transaction.sign([adminKeypair]); // Manually sign with the Keypair

    // Send the signed transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize()
    );
    await connection.confirmTransaction(signature, "processed");

    console.log(
      `Result updated for user ${userAddress.toBase58()}. Signature: ${signature}`
    );
    return signature;
  } catch (err) {
    console.error("Failed to update result:", err);
    return undefined;
  }
};
