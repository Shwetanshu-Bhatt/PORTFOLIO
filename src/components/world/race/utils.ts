import { TRACK_SPAWN } from '../track/layout';

export function normalizeDriverName(name: string) {
  return name.trim().replace(/[^\p{L}\p{N} _-]/gu, '').replace(/\s+/g, ' ').slice(0, 18);
}

export function formatRaceTime(milliseconds: number) {
  if (!milliseconds) return '--:--.---';
  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = Math.floor((milliseconds % 60_000) / 1_000);
  const millis = Math.floor(milliseconds % 1_000);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function getGridSpawn(slot: number) {
  const forwardX = Math.sin(TRACK_SPAWN.rotation);
  const forwardZ = Math.cos(TRACK_SPAWN.rotation);
  const rightX = Math.cos(TRACK_SPAWN.rotation);
  const rightZ = -Math.sin(TRACK_SPAWN.rotation);
  const row = slot === 0 ? 0 : Math.ceil(slot / 2);
  const lane = slot === 0 ? 0 : slot % 2 === 0 ? 1 : -1;
  return {
    x: TRACK_SPAWN.x - forwardX * row * 5.5 + rightX * lane * 2.15,
    y: TRACK_SPAWN.y,
    z: TRACK_SPAWN.z - forwardZ * row * 5.5 + rightZ * lane * 2.15,
    rotation: TRACK_SPAWN.rotation,
  };
}
