"use client";

import Canvas from "./canvas";
import Options from "./options";

export function Game() {
  return (
    <div className="size-full relative">
      <Canvas />
      <Options />
    </div>
  );
}
