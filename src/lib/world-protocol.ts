export const WORLD_MAX_PLAYERS = 8;
export const WORLD_STATE_INTERVAL_MS = 80;
export const WORLD_PLAYER_COLORS = [
  0x2f80ed,
  0xff4d4d,
  0x2ed573,
  0xffa502,
  0xa55eea,
  0x00d2d3,
  0xff6bcb,
  0xf1f2f6,
] as const;

export interface WorldPlayerState {
  id: string;
  name: string;
  color: number;
  x: number;
  z: number;
  rotation: number;
  speed: number;
  steer: number;
  updatedAt: number;
}

export type WorldClientEvent =
  | { type: 'join'; player: Omit<WorldPlayerState, 'updatedAt'> }
  | { type: 'state'; player: Omit<WorldPlayerState, 'name' | 'color' | 'updatedAt'> }
  | { type: 'collision'; targetId: string; impulseX: number; impulseZ: number };

export type WorldServerEvent =
  | { type: 'snapshot'; players: WorldPlayerState[]; maxPlayers: number }
  | { type: 'player'; player: WorldPlayerState }
  | { type: 'leave'; id: string }
  | { type: 'impact'; targetId: string; sourceId: string; impulseX: number; impulseZ: number }
  | { type: 'room_full'; maxPlayers: number }
  | { type: 'unavailable' };
