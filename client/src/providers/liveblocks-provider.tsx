"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

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
        }}
        initialStorage={{
          players: [{ x: 100, y: 100, size: 10, color: "red" }],
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
