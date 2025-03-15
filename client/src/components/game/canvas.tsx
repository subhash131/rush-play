"use client";
import React, { useEffect, useRef, useState } from "react";
import Player from "./classes/player";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import { LiveObject } from "@liveblocks/client";
import { useWallet } from "@solana/wallet-adapter-react";

const Canvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const backendPlayers = useStorage((root) => root.players);
  const { publicKey } = useWallet();

  const [frontendPlayers, setFrontendPlayers] = useState<
    Record<string, Player>
  >({});

  const updatePlayer = useMutation(
    ({ storage }, playerId: string, playerData: Partial<Player>) => {
      const players = storage.get("players");

      if (players) {
        const player = players.get(playerId);

        if (player) {
          player.update(playerData);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!publicKey) return;
    const playerId = publicKey.toString();

    const handleKeyDown = (e: KeyboardEvent) => {
      const playerData = backendPlayers.get(playerId);
      if (!playerData) return;

      if (e.key === "ArrowUp") {
        updatePlayer(playerId, { y: playerData.y - 5 });
      } else if (e.key === "ArrowDown") {
        updatePlayer(playerId, { y: playerData.y + 5 });
      } else if (e.key === "ArrowLeft") {
        updatePlayer(playerId, { x: playerData.x - 5 });
      } else if (e.key === "ArrowRight") {
        updatePlayer(playerId, { x: playerData.x + 5 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [backendPlayers, publicKey]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const newPlayers: Record<string, Player> = {};

    backendPlayers.forEach((backendPlayer, id) => {
      if (!backendPlayer) return;

      if (!frontendPlayers[id]) {
        newPlayers[id] = new Player({
          color: backendPlayer.color,
          ctx: ctx,
          radius: backendPlayer.size * window.devicePixelRatio || 1,
          x: backendPlayer.x,
          y: backendPlayer.y,
        });
      } else {
        newPlayers[id] = frontendPlayers[id];
        newPlayers[id].x = backendPlayer.x;
        newPlayers[id].y = backendPlayer.y;
      }
    });

    setFrontendPlayers(newPlayers);
  }, [backendPlayers]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const devicePixelRation = window.devicePixelRatio || 1;
    if (!ctx || !canvas) return;

    canvas.width = innerWidth * devicePixelRation;
    canvas.height = innerHeight * devicePixelRation;
  }, [ref.current]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;

      animationId = requestAnimationFrame(animate);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const id in frontendPlayers) {
        frontendPlayers[id].draw();
      }
    }
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [frontendPlayers]);

  return <canvas ref={ref} className="size-full" />;
};

export default Canvas;
