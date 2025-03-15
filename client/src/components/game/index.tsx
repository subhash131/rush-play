"use client";

import {
  useMyPresence,
  useOthers,
  useStorage,
} from "@liveblocks/react/suspense";
import Cursor from "./cursor";

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

export function Game() {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const userCount = others.length;
  const players = useStorage((root) => root.players);

  return (
    <div
      className="size-full bg-teal-700 h-screen"
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
      There are {userCount} other user(s) online
      {others.map(({ connectionId, presence }) => {
        if (presence.cursor === null) {
          return null;
        }

        return (
          <Cursor
            key={`cursor-${connectionId}`}
            color={COLORS[connectionId % COLORS.length]}
            x={presence?.cursor?.x}
            y={presence?.cursor?.y}
          />
        );
      })}
    </div>
  );
}
