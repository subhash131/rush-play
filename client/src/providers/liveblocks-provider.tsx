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
        "pk_dev_St_cOy9aSHjB1qM5rEb4lLWnoL5hAHpOZMfDYn3ngPGBAtAmc8MEvQ5THjAyB5fR"
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
