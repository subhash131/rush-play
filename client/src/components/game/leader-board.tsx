"use client";
import { useStorage } from "@liveblocks/react";
import React from "react";

const LeaderBoard = ({
  setGameActive,
  gameActive,
}: {
  setGameActive: React.Dispatch<React.SetStateAction<boolean>>;
  gameActive: boolean;
}) => {
  const data = useStorage((root) => root.players);

  return (
    <div className="w-fit h-full flex flex-col gap-10">
      <div className="pointer-events-none pl-10">
        <h1 className="opacity-80 text-nowrap">Leader Board</h1>
        <div>
          {data &&
            Array.from(data.entries())
              .sort(([, a], [, b]) => b.size - a.size)
              .map(([playerId, playerData]) => (
                <div key={playerId} className="flex gap-2 items-center">
                  <p>{`${playerData.username}  - ${playerData.size}`}</p>
                </div>
              ))}
        </div>
      </div>
      {gameActive && (
        <button
          className="px-4 py-1 flex items-center justify-center"
          onClick={() => {
            setGameActive(false);
          }}
        >
          Exit
        </button>
      )}
    </div>
  );
};

export default LeaderBoard;
