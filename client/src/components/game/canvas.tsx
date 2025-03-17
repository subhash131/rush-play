"use client";
import React, { useEffect, useRef, useState } from "react";
import Player from "./classes/player";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import { useWallet } from "@solana/wallet-adapter-react";
import { Projectile } from "./classes/projectile";
import { LiveList, LiveObject } from "@liveblocks/client";
import { generateRandomId } from "@/utils/generate-random-id";
import { stringToColor } from "@/utils/string-to-color";

const PLAYER_SPEED = 10;
const PROJECTILE_SPEED = 5;

const Canvas: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

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

  const updateCanvas = useMutation(
    ({ storage }, width: number, height: number) => {
      const canvas = storage.get("canvas");
      if (height && width) {
        canvas.height = height;
        canvas.width = width;
      }
    },
    []
  );

  const updatePlayer = useMutation(
    ({ storage }, playerId: string, playerData: Partial<Player>) => {
      const players = storage.get("players");
      if (players) {
        const player = players.get(playerId);
        if (player) {
          player.update(playerData); // Reverted to your original working version
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
    const ctx = ref.current?.getContext("2d");
    if (!ctx || !ref.current) return;
    const dpr = window.devicePixelRatio || 1;

    const handleClick = (e: MouseEvent) => {
      const frontendPlayer = frontendPlayers[playerId];
      if (!frontendPlayer) return;

      const angle = Math.atan2(
        e.clientY * dpr - frontendPlayer.y,
        e.clientX * dpr - frontendPlayer.x
      );

      const velocity = {
        x: Math.cos(angle) * PROJECTILE_SPEED,
        y: Math.sin(angle) * PROJECTILE_SPEED,
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
        updatePlayer(playerId, { y: playerData.y - PLAYER_SPEED });
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        updatePlayer(playerId, { y: playerData.y + PLAYER_SPEED });
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        updatePlayer(playerId, { x: playerData.x - PLAYER_SPEED });
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        updatePlayer(playerId, { x: playerData.x + PLAYER_SPEED });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
    };
  }, [
    backendPlayers,
    publicKey,
    frontendPlayers,
    updatePlayer,
    updateProjectile,
  ]);

  // Sync frontend players with backend
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
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

  // Sync frontend projectiles with backend
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newProjectiles: Record<string, Projectile[]> = {};

    backendProjectiles.forEach((backendProjectileList, playerId) => {
      if (!backendProjectileList) return;

      const existingProjectiles = frontendProjectiles[playerId] || [];
      const updatedProjectiles = Array.from(backendProjectileList).map(
        (projectile) => {
          const projId = projectile.id;
          const existing = existingProjectiles.find((p) => p.id === projId);
          if (!existing) {
            return new Projectile({
              color: stringToColor({ input: playerId }),
              ctx,
              radius: 5,
              velocity: projectile.velocity,
              x: projectile.x,
              y: projectile.y,
              id: projId,
            });
          }
          return existing;
        }
      );

      newProjectiles[playerId] = updatedProjectiles;
    });

    setFrontendProjectiles(newProjectiles);
  }, [backendProjectiles]);

  useEffect(() => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const ctx = ref.current?.getContext("2d");
    if (!ctx || !ref.current) return;

    ref.current.width = innerWidth * devicePixelRatio;
    ref.current.height = innerHeight * devicePixelRatio;
    // updateCanvas(ref.current.width, ref.current.height);
  }, [backendCanvas, updateCanvas]);
  // Handle canvas resizing for responsiveness and high-DPI displays
  useEffect(() => {
    const handleResize = () => {
      const canvas = ref.current;
      if (canvas) {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!publicKey) return;

    const playerId = publicKey.toString();
    let animationId: number;

    function animate() {
      if (!canvas) return;
      if (!ctx) return;
      animationId = requestAnimationFrame(animate);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const id in frontendPlayers) {
        frontendPlayers[id].draw();
      }

      const projectilesToRemove: { playerId: string; projectileId: string }[] =
        [];
      for (const currentPlayerId in frontendProjectiles) {
        frontendProjectiles[currentPlayerId].forEach((projectile) => {
          projectile.update();
          projectile.draw();

          // Only remove projectiles owned by the local player
          if (currentPlayerId === playerId) {
            const buffer = 50;
            if (
              projectile.x < -buffer ||
              projectile.x > canvas.width + buffer ||
              projectile.y < -buffer ||
              projectile.y > canvas.height + buffer
            ) {
              projectilesToRemove.push({
                playerId: currentPlayerId,
                projectileId: projectile.id,
              });
            }

            for (const id in frontendPlayers) {
              if (id === playerId) continue; // Skip self
              const opponent = frontendPlayers[id];
              const dx = opponent.x - projectile.x;
              const dy = opponent.y - projectile.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance <= opponent.radius + projectile.radius) {
                projectilesToRemove.push({
                  playerId: currentPlayerId,
                  projectileId: projectile.id,
                });
                console.log("collided with opponent", id);
              }
            }
          }
        });
      }

      projectilesToRemove.forEach(({ playerId, projectileId }) => {
        removeProjectile(playerId, projectileId);
      });
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [frontendPlayers, frontendProjectiles, publicKey, removeProjectile]);

  return <canvas ref={ref} className="size-full" />;
};

export default Canvas;
