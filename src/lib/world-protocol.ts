export const WORLD_MAX_PLAYERS = 8;
export const WORLD_STATE_INTERVAL_MS = 80;

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
  | { type: 'state'; player: Omit<WorldPlayerState, 'name' | 'color' | 'updatedAt'> };

export type WorldServerEvent =
  | { type: 'snapshot'; players: WorldPlayerState[]; maxPlayers: number }
  | { type: 'player'; player: WorldPlayerState }
  | { type: 'leave'; id: string }
  | { type: 'room_full'; maxPlayers: number }
  | { type: 'unavailable' };
