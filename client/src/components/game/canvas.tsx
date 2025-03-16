"use client";
import React, { useEffect, useRef, useState } from "react";
import Player from "./classes/player";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import { useWallet } from "@solana/wallet-adapter-react";
import { Projectile } from "./classes/projectile";
import { LiveList, LiveObject } from "@liveblocks/client";
import { generateRandomId } from "@/utils/generate-random-id";
import { stringToColor } from "@/utils/string-to-color";

const SPEED = 10;

const Canvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const canvas = ref.current;

  const backendPlayers = useStorage((root) => root.players);
  const backendProjectiles = useStorage((root) => root.projectiles);
  const backendCanvas = useStorage((root) => root.canvas);
  const { publicKey } = useWallet();

  const [frontendPlayers, setFrontendPlayers] = useState<
    Record<string, Player>
  >({});
  const [frontendProjectiles, setFrontendProjectiles] = useState<
    Record<string, Projectile[]>
  >({});

  const removeProjectile = useMutation(
    ({ storage }, userId: string, projectileId: string) => {
      const projectiles = storage.get("projectiles");
      if (projectiles && projectiles.get(userId)) {
        const playerProjectiles = projectiles.get(userId);
        const index = playerProjectiles?.findIndex(
          (projectile) => projectile.get("id") === projectileId
        );
        if (index !== -1 && typeof index === "number") {
          playerProjectiles?.delete(index);
        }
      }
    },
    []
  );
  const updateCanvas = useMutation(({ storage }, width, height) => {
    const canvas = storage.get("canvas");
    if (height && width) {
      canvas.height = height;
      canvas.width = width;
    }
  }, []);

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
  const updateProjectile = useMutation(
    (
      { storage },
      playerId: string,
      projectileData: Partial<{
        x: number;
        y: number;
        velocity: { x: number; y: number };
      }>
    ) => {
      const projectiles = storage.get("projectiles");

      if (!projectiles) return;

      let playerProjectiles = projectiles.get(playerId);

      if (!playerProjectiles) {
        playerProjectiles = new LiveList<
          LiveObject<{
            id: string;
            x: number;
            y: number;
            velocity: { x: number; y: number };
          }>
        >([]);
        projectiles.set(playerId, playerProjectiles);
      }

      if (
        projectileData.x === undefined ||
        projectileData.y === undefined ||
        !projectileData.velocity
      ) {
        return;
      }

      playerProjectiles.push(
        new LiveObject({
          x: projectileData.x,
          y: projectileData.y,
          velocity: projectileData.velocity,
          id: generateRandomId(),
        })
      );
    },
    []
  );

  useEffect(() => {
    if (!publicKey) return;
    const playerId = publicKey.toString();
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const handleClick = (e: MouseEvent) => {
      const frontendPlayer = frontendPlayers[playerId];
      if (!frontendPlayer) return;

      const angle = Math.atan2(
        e.clientY * dpr - frontendPlayer.y,
        e.clientX * dpr - frontendPlayer.x
      );

      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      };

      updateProjectile(playerId, {
        x: frontendPlayer.x,
        y: frontendPlayer.y,
        velocity,
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const playerData = backendPlayers.get(playerId);
      if (!playerData) return;

      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        updatePlayer(playerId, { y: playerData.y - SPEED });
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        updatePlayer(playerId, { y: playerData.y + SPEED });
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        updatePlayer(playerId, { x: playerData.x - SPEED });
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        updatePlayer(playerId, { x: playerData.x + SPEED });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
    };
  }, [backendPlayers, publicKey, canvas]);

  useEffect(() => {
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const newPlayers: Record<string, Player> = {};

    backendPlayers.forEach((backendPlayer, id) => {
      if (!backendPlayer) return;

      if (!frontendPlayers[id]) {
        newPlayers[id] = new Player({
          color: backendPlayer.color,
          ctx,
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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setFrontendProjectiles((prevProjectiles) => {
      const newProjectiles: Record<string, Projectile[]> = {
        ...prevProjectiles,
      };

      backendProjectiles.forEach((backendProjectile, id) => {
        if (!backendProjectile) return;

        backendProjectile.forEach((projectile) => {
          const proj = new Projectile({
            color: stringToColor({ input: id }),
            ctx,
            radius: 5,
            velocity: projectile.velocity,
            x: projectile.x,
            y: projectile.y,
            id: projectile.id,
          });

          if (!newProjectiles[id]) {
            newProjectiles[id] = [];
          }

          newProjectiles[id].push(proj);
        });
      });
      return newProjectiles;
    });
  }, [backendProjectiles]);

  useEffect(() => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const ctx = canvas?.getContext("2d");

    if (!ctx || !canvas) return;

    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
  }, [canvas, backendCanvas]);

  useEffect(() => {
    let animationId: number;
    const ctx = canvas?.getContext("2d");

    function animate() {
      if (!ctx || !canvas) return;
      animationId = requestAnimationFrame(animate);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const id in frontendPlayers) {
        frontendPlayers[id].draw();
      }

      const newProjectiles: Record<string, Projectile[]> = {};

      const projectilesToRemove: { playerId: string; projectileId: string }[] =
        [];

      for (const playerId in frontendProjectiles) {
        newProjectiles[playerId] = frontendProjectiles[playerId].filter(
          (projectile) => {
            projectile.update();

            if (
              projectile.x < 0 ||
              projectile.x > canvas.width ||
              projectile.y < 0 ||
              projectile.y > canvas.height
            ) {
              projectilesToRemove.push({
                playerId,
                projectileId: projectile.id,
              });
              return false;
            }

            for (const opponentId in frontendPlayers) {
              if (opponentId === publicKey?.toString()) continue;

              const opponent = frontendPlayers[opponentId];
              const dx = opponent.x - projectile.x;
              const dy = opponent.y - projectile.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance <= opponent.radius + projectile.radius) {
                console.log(`🔥 Collision detected: Player ${opponentId} hit!`);
                projectilesToRemove.push({
                  playerId,
                  projectileId: projectile.id,
                });
                return false;
              }
            }

            return true;
          }
        );
      }

      setFrontendProjectiles((prev) => {
        const hasChanges = Object.keys(newProjectiles).some(
          (key) => newProjectiles[key].length !== prev[key]?.length
        );
        return hasChanges ? newProjectiles : prev;
      });

      console.log({ frontendProjectiles });
      projectilesToRemove.forEach(({ playerId, projectileId }) => {
        removeProjectile(playerId, projectileId);
      });
    }

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [frontendPlayers, frontendProjectiles, canvas]);

  return <canvas ref={ref} className="size-full" />;
};

export default Canvas;
