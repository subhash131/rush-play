"use client";
import {
  AnchorProvider,
  BN,
  Program,
  Wallet,
  Idl,
} from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";

import IDL from "./idl.json";

import { MASTER_SEED, USER_SEED, PROGRAM_ID } from "./constants";

// How to fetch our Program
export const getProgram = (connection: Connection, wallet: Wallet) => {
  if (!PROGRAM_ID) {
    return { msg: "PROGRAM_ID not found!" };
  }
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program(IDL as Idl, PROGRAM_ID, provider);
  return program;
};

export const getUserAddress = (walletAddress: PublicKey) => {
  if (!USER_SEED) {
    console.log("USER_SEED is missing");
    return;
  }
  if (!PROGRAM_ID) {
    console.log("PROGRAM_ID is missing");
    return;
  }
  return PublicKey.findProgramAddressSync(
    [Buffer.from(USER_SEED), walletAddress.toBuffer()],
    new PublicKey(PROGRAM_ID)
  )[0];
};

export const getMasterAddress = () => {
  if (!MASTER_SEED) {
    console.log("MASTER_SEED not found!");
    return;
  }
  if (!PROGRAM_ID) {
    console.log("Program id not found!");
    return;
  }
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MASTER_SEED)],
    new PublicKey(PROGRAM_ID)
  )[0];
};

// export const getBidAddress = (venuePk: PublicKey, id: string) => {
//   if (!BID_SEED) {
//     return { msg: "BID_SEED not found!" };
//   }
//   if (!PROGRAM_ID) {
//     return { msg: "Program id not found!" };
//   }
//   return PublicKey.findProgramAddressSync(
//     [Buffer.from(BID_SEED), venuePk.toBuffer(), Buffer.from(id)],
//     new PublicKey(PROGRAM_ID)
//   )[0];
// };

// export const getTotalPrize = (venue: { lastBidId: BN; bidPrice: BN }) => {
//   return new BN(venue.lastBidId)
//     .mul(venue.bidPrice)
//     .div(new BN(LAMPORTS_PER_SOL))
//     .toString();
// };
