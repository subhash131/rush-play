"use client";
import { getMasterAddress, getUserAddress } from "@/utils/program";
import { AnchorProvider, BN, Idl, Program,  } from "@project-serum/anchor";

import idl from "@/utils/idl.json";
import { PROGRAM_ID } from "@/utils/constants";

export const addFunds = async ({
  wallet,
  funds,
  connection,
}: {
  connection: any;
  wallet: any;
  funds: number;
}) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  const userPk = getUserAddress(wallet.publicKey);
  if (!userPk) return;
  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  try {
    const masterPk = getMasterAddress();
    if (!masterPk) return;
    const master = await program.account.master.fetch(masterPk);

    const res = await program.methods
      .addFunds(new BN(funds))
      .accounts({
        master: masterPk,
        authority: wallet.publicKey,
        user: userPk,
        owner: master.owner.toString(),
      })
      .rpc();
    return res;
  } catch (err) {
    console.log("🚀 ~ Failed to get funds ~ err:", err);
  }
};
