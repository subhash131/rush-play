"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Player, Projectile } from "../../liveblock.config";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_dev_tOHyssM6RdPFlhKg0keB8_XciJpQfJj-riMw7Ja4DY3OUEQjTaXZMAL0ftESqWGG"
      }
      throttle={16}
      preventUnsavedChanges
    >
      <RoomProvider
        id="my-room"
        initialPresence={{
          cursor: null,
          walletAddress: null,
        }}
        initialStorage={{
          players: new LiveMap<string, LiveObject<Player>>(),
          projectiles: new LiveMap<string, LiveList<LiveObject<Projectile>>>(),
          canvas: { height: 768, width: 1024 },
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
