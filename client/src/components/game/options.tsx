import { LiveObject } from "@liveblocks/client";
import { useMutation } from "@liveblocks/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useRef, useState } from "react";
import { Player } from "../../../liveblock.config";
import { stringToColor } from "@/utils/string-to-color";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import LeaderBoard from "./leader-board";
import { getUser } from "@/actions/get-user";
import { addFunds } from "@/actions/add-funds";
import { toast } from "sonner";
import { addUser } from "@/actions/add-user";
import { lamportsToSol } from "@/utils/lamports-to-sol";
import { solToLamports } from "@/utils/sol-to-lamports";

const Options = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [color, setColor] = useState("white");
  const [funds, setFunds] = useState(0);
  const [username, setUsername] = useState("");
  const [lamports, setLamports] = useState(0.1);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  const removePlayer = useMutation(({ storage }, playerId?: string) => {
    if (!playerId) return;
    const players = storage.get("players");
    if (players && players.get(playerId)) {
      players.delete(playerId);
    }
  }, []);

  const initPlayer = useMutation(
    ({ storage }, playerId: string, playerData: Player) => {
      const players = storage.get("players");
      if (players) {
        players.set(playerId, new LiveObject(playerData));
      }
    },
    []
  );

  useEffect(() => {
    if (wallet.publicKey) {
      setColor(stringToColor({ input: wallet.publicKey.toString() }));
      (async () => {
        const res = await getUser({ connection, wallet });
        const funds = lamportsToSol(Number(res?.funds.toString()));
        setFunds(funds);
        setUsername(res?.username);
      })();
    }
    return () => removePlayer(wallet.publicKey?.toString());
  }, [wallet.publicKey, loading]);

  return (
    <div
      className="flex absolute z-50 top-0 left-0 size-full w-screen overflow-hidden p-2 flex-col select-none"
      onClick={(e) => {
        if (!gameActive) e.stopPropagation();
      }}
    >
      <div className="w-full px-10 flex items- justify-end h-fit gap-10">
        <WalletMultiButton />
      </div>
      <div className="flex size-full">
        <div className="size-full flex items-center justify-center">
          {!wallet.publicKey && <WalletMultiButton />}
          {!gameActive && wallet.publicKey && (
            <div className="size-full flex items-center justify-center backdrop-blur-md">
              {!username && (
                <div className="w-96 h-fit pb-10 gap-2 flex flex-col bg-[#212428] p-1 rounded-lg text-white">
                  <div className="h-12 flex items-center justify-center font-semibold flex-col ">
                    <p>Register</p>
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    <input
                      ref={usernameRef}
                      placeholder="username"
                      className="bg-transparent px-2 py-1 outline-none border rounded-lg border-[#3E4144]"
                    />
                    <button
                      className="px-4 py-1 bg-[#404143] w-fit rounded-lg border-[#3E4144] border active:scale-95 transition-transform disabled:bg-[#7d7e7f] disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (!wallet.publicKey) {
                          toast.error("wallet not connected");
                          return;
                        }
                        if (!usernameRef.current) {
                          toast.error("Username is empty");
                          return;
                        }
                        setLoading(true);
                        await addUser({
                          username: usernameRef.current.value,
                          wallet,
                          connection,
                        });
                        setLoading(false);
                      }}
                      disabled={loading}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              {username && (
                <div className="flex flex-col gap-2">
                  <button
                    className="px-4 py-1 rounded-lg bg-[#404143] active:scale-95 transition-transform"
                    onClick={() => {
                      if (!funds) {
                        toast.error("Add more funds to play");
                        return;
                      }
                      if (!username) {
                        toast.error("Register to play");
                        return;
                      }
                      initPlayer(wallet.publicKey!.toString(), {
                        color,
                        size: funds * 100,
                        x: 50,
                        y: 50,
                        username,
                      });

                      setGameActive(true);
                    }}
                  >
                    Start Game
                  </button>
                  <div className="w-96 h-fit pb-6 gap-2 flex flex-col bg-[#212428] p-1 rounded-lg text-white">
                    <div className="h-12 flex items-center justify-center font-semibold flex-col ">
                      <p>
                        Add Funds
                        <span className="text-xs text-gray-400 font-normal">
                          ( bal {funds} SOL)
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        placeholder="SOL"
                        className="bg-transparent px-2 py-1 outline-none border rounded-lg border-[#3E4144]"
                        value={lamports}
                        onChange={(e) => setLamports(Number(e.target.value))}
                        type="number"
                      />
                      SOL
                    </div>
                    <button
                      className="px-4 py-1 bg-[#404143] w-fit rounded-lg border-[#3E4144] border active:scale-95 transition-transform disabled:bg-[#7d7e7f] disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (!wallet.publicKey) {
                          toast.error("wallet not connected");
                          return;
                        }
                        if (!lamports) {
                          toast.error("specify valid lamports");
                          return;
                        }
                        setLoading(true);
                        await addFunds({
                          funds: solToLamports(lamports),
                          wallet,
                          connection,
                        });
                        toast.success("funds added");
                        setLoading(false);
                      }}
                      disabled={loading}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <LeaderBoard gameActive={gameActive} setGameActive={setGameActive} />
      </div>
    </div>
  );
};

export default Options;
