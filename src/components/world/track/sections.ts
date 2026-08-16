import * as THREE from 'three';
import { EAST_SWEEPERS } from './sections/eastSweepers';
import { FINAL_SECTOR } from './sections/finalSector';
import { FLYOVER } from './sections/flyover';
import { NORTH_SWEEPERS } from './sections/northSweepers';
import { START_STRAIGHT } from './sections/startStraight';
import { UNDERPASS } from './sections/underpass';
import { WEST_DIRT } from './sections/westDirt';

export const TRACK_SECTIONS = {
  startStraight: START_STRAIGHT,
  eastSweepers: EAST_SWEEPERS,
  flyover: FLYOVER,
  westDirt: WEST_DIRT,
  northSweepers: NORTH_SWEEPERS,
  underpass: UNDERPASS,
  finalSector: FINAL_SECTOR,
} as const;

export const TRACK_CONTROL_POINTS = Object.values(TRACK_SECTIONS)
  .flat()
  .map(([x, y, z]) => new THREE.Vector3(x, y, z));
