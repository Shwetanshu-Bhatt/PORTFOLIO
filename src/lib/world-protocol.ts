export const WORLD_MAX_PLAYERS = 8;
export const WORLD_STATE_INTERVAL_MS = 80;
export const WORLD_TOTAL_LAPS = 3;
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
  ready: boolean;
  lap: number;
  checkpoint: number;
  finishedAt: number;
  bestLap: number;
  updatedAt: number;
}

export interface WorldRaceResult {
  id: string;
  name: string;
  color: number;
  finishedAt: number;
  bestLap: number;
}

export interface WorldRaceState {
  id: string;
  phase: 'lobby' | 'countdown' | 'finished';
  startAt: number;
  participants: string[];
  totalLaps: number;
  results: WorldRaceResult[];
  leaderboard: WorldRaceResult[];
}

export type WorldClientEvent =
  | { type: 'join'; player: Omit<WorldPlayerState, 'updatedAt'> }
  | { type: 'state'; player: Omit<WorldPlayerState, 'name' | 'color' | 'updatedAt'> }
  | { type: 'collision'; targetId: string; impulseX: number; impulseZ: number }
  | { type: 'rail_break'; railId: number }
  | { type: 'ready'; ready: boolean };

export type WorldServerEvent =
  | { type: 'snapshot'; players: WorldPlayerState[]; maxPlayers: number; race: WorldRaceState; spectator?: boolean }
  | { type: 'player'; player: WorldPlayerState }
  | { type: 'race'; race: WorldRaceState }
  | { type: 'leave'; id: string }
  | { type: 'impact'; targetId: string; sourceId: string; impulseX: number; impulseZ: number }
  | { type: 'rail_break'; railId: number; regenerateAt: number }
  | { type: 'room_full'; maxPlayers: number }
  | { type: 'unavailable' };
