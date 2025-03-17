"use client";

import {
  useMutation,
  useMyPresence,
  useOthers,
} from "@liveblocks/react/suspense";
import Cursor from "./cursor";
import { useEffect, useState } from "react";
import { Player } from "../../../liveblock.config";
import { LiveObject } from "@liveblocks/client";
import { useWallet } from "@solana/wallet-adapter-react";
import Canvas from "./canvas";
import { stringToColor } from "@/utils/string-to-color";

export function Game() {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const { connect, publicKey } = useWallet();

  const [color, setColor] = useState<string>("");

  // Define the removePlayer mutation
  const removePlayer = useMutation(({ storage }, playerId: string) => {
    const players = storage.get("players");
    if (players && players.get(playerId)) {
      players.delete(playerId);
    }
  }, []);

  // Define the initPlayer mutation
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
    if (!publicKey) return;

    if (publicKey) {
      setColor(stringToColor({ input: publicKey?.toString() }));
      updateMyPresence({
        walletAddress: publicKey.toString(),
      });
    }

    const playerId = publicKey.toString();

    return () => {
      removePlayer(playerId);
    };
  }, [publicKey, initPlayer, removePlayer]);

  return (
    <div
      className="size-full relative"
      onPointerMove={(e) => {
        updateMyPresence({
          cursor: {
            x: e.clientX,
            y: e.clientY,
          },
        });
      }}
      onPointerLeave={() =>
        updateMyPresence({
          cursor: null,
        })
      }
    >
      <Canvas />
      <div className="flex gap-20 absolute z-50 pointer-events-none top-0 left-0 size-full">
        <button onClick={() => connect()}>
          {publicKey ? publicKey.toString() : "connect"}
        </button>
        <button onClick={() => removePlayer(publicKey!.toString())}>
          Remove user
        </button>
        <button
          onClick={() =>
            initPlayer(publicKey!.toString(), {
              color,
              size: 10,
              x: 50,
              y: 50,
            })
          }
        >
          Init user
        </button>
      </div>
    </div>
  );
}
