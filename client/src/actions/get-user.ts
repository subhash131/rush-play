"use client";
import { getUserAddress } from "@/utils/program";
import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import idl from "@/utils/idl.json";
import { PROGRAM_ID } from "@/utils/constants";

export const getUser = async ({
  wallet,
  connection,
}: {
  connection: any;
  wallet: any;
}) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  const userPk = getUserAddress(wallet.publicKey);
  if (!userPk) return;
  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  try {
    const res = await program.account.user.fetch(userPk);
    return res;
  } catch (err) {
    console.log("🚀 ~ Failed to get funds ~ err:", err);
  }
};
