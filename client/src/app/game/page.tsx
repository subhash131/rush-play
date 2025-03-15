import { Game } from "@/components/game";
import { Room } from "@/providers/liveblocks-provider";
import React from "react";

const GamePage = () => {
  return (
    <Room>
      <Game />
    </Room>
  );
};

export default GamePage;
