import { Game } from "@/components/game";
import React from "react";
import dynamic from "next/dynamic";

const Room = dynamic(() =>
  import("@/providers/liveblocks-provider").then((mod) => mod.Room)
);

const Home = () => {
  return (
    <Room>
      <Game />
    </Room>
  );
};

export default Home;
