import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";

export type Player = {
  x: number;
  y: number;
  size: number;
  color: string;
};
export type Projectile = {
  id: string;
  x: number;
  y: number;
  velocity: { x: number; y: number };
};

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: {
        x: number;
        y: number;
      } | null;
      walletAddress: string | null;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      players: LiveMap<string, LiveObject<Player>>;
      projectiles: LiveMap<string, LiveList<LiveObject<Projectile>>>;
      canvas: { width: number; height: number };
    };

    UserMeta: {
      id: string;
      // Custom user info set when authenticating with a secret key
      info: {};
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {};

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {};

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {};

    // Custom activities data for custom notification kinds
    ActivitiesData: {};
  }
}

// Necessary if you have no imports/exports
export {};
