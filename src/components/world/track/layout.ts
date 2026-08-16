import * as THREE from 'three';
import { TRACK_CONTROL_POINTS } from './sections';

export const TRACK_WIDTH = 18;
export const TRACK_WORLD_SIZE = 720;
// Dense sampling keeps the road ribbon and its curbs following the spline
// continuously instead of exposing the individual construction segments.
export const TRACK_SAMPLE_COUNT = 360;

const trackCurve = new THREE.CatmullRomCurve3(TRACK_CONTROL_POINTS, true, 'centripetal');
export const TRACK_PATH = Array.from({ length: TRACK_SAMPLE_COUNT }, (_value, index) => trackCurve.getPointAt(index / TRACK_SAMPLE_COUNT));
export const TRACK_POINTS: ReadonlyArray<readonly [number, number]> = TRACK_PATH.map((point) => [point.x, point.z]);
export const TRACK_HEIGHTS = TRACK_PATH.map((point) => point.y);
export const TRACK_SPAWN = {
  x: TRACK_PATH[0].x,
  y: TRACK_PATH[0].y,
  z: TRACK_PATH[0].z,
  rotation: Math.atan2(TRACK_PATH[1].x - TRACK_PATH[0].x, TRACK_PATH[1].z - TRACK_PATH[0].z),
};
export const HARD_TURN_POINTS = [42, 61, 87, 148, 177, 219, 254, 293, 328];
export const RACE_CHECKPOINT_INDICES = Array.from({ length: 12 }, (_value, index) => Math.floor(index * TRACK_SAMPLE_COUNT / 12));
export const DIRT_SEGMENT_START = Math.floor(TRACK_SAMPLE_COUNT * 0.42);
export const DIRT_SEGMENT_END = Math.floor(TRACK_SAMPLE_COUNT * 0.57);

export function nearestTrackPoint(x: number, z: number, y?: number, hintIndex?: number) {
  let closest = Infinity;
  let closestScore = Infinity;
  let closestIndex = 0;
  let closestT = 0;
  TRACK_POINTS.forEach(([ax, az], index) => {
    const [bx, bz] = TRACK_POINTS[(index + 1) % TRACK_POINTS.length];
    const dx = bx - ax;
    const dz = bz - az;
    const lengthSquared = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / lengthSquared));
    const distance = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
    const nextIndex = (index + 1) % TRACK_POINTS.length;
    const height = THREE.MathUtils.lerp(TRACK_HEIGHTS[index], TRACK_HEIGHTS[nextIndex], t);
    // The flyover and underpass deliberately cross at the same X/Z position.
    // Give height enough weight that a car on the lower lane cannot be pulled
    // onto the elevated lane just because the latter is a few units closer in
    // the sampled horizontal path.
    const indexDistance = hintIndex === undefined
      ? 0
      : Math.min(
        Math.abs(index - hintIndex),
        TRACK_POINTS.length - Math.abs(index - hintIndex),
      );
    const isHintedSegment = hintIndex === undefined || indexDistance <= 18;
    if (!isHintedSegment) return;
    const score = y === undefined ? distance : Math.hypot(distance, (y - height) * 4);
    if (score < closestScore) {
      closestScore = score;
      closest = distance;
      closestIndex = index;
      closestT = t;
    }
  });
  const nextIndex = (closestIndex + 1) % TRACK_POINTS.length;
  return {
    distance: closest,
    index: closestIndex,
    height: THREE.MathUtils.lerp(TRACK_HEIGHTS[closestIndex], TRACK_HEIGHTS[nextIndex], closestT),
  };
}

export function distanceToTrack(x: number, z: number) {
  return nearestTrackPoint(x, z).distance;
}

export function isPointOnTrack(x: number, z: number, margin = 0) {
  return distanceToTrack(x, z) <= TRACK_WIDTH / 2 + margin;
}
