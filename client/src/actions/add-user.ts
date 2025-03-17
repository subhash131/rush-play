import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import idl from "@/utils/idl.json";
import { PROGRAM_ID } from "@/utils/constants";
import { getUserAddress } from "@/utils/program";

export const addUser = async ({
  username,
  connection,
  wallet,
}: {
  username: string;
  connection: any;
  wallet: any;
}) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  const userPk = getUserAddress(wallet.publicKey);
  if (!userPk) return;

  console.log({ userPk: userPk.toString() });
  try {
    const res = await program.methods
      .addUser(username)
      .accounts({
        user: userPk,
        authority: wallet.publicKey,
      })
      .rpc();

    return res;
  } catch (err) {
    console.error("🚀 ~ Failed to add user ~ err:", err);
  }
};
