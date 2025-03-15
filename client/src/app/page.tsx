"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { callContract, updateContract } from "@/components/demo-fn";

const ConnectWallet = dynamic(() => import("@/components/connect-wallet"), {
  ssr: false,
});

export default function Home() {
  useEffect(() => {
    // getBlockNumber();
    callContract();
  }, []);
  return (
    <div className="size-full flex items-center justify-center flex-col gap-10">
      <ConnectWallet />
      <button
        onClick={() => updateContract()}
        className="bg-blue-300 px-4 py-2 rounded-md"
      >
        Add user
      </button>
    </div>
  );
}
