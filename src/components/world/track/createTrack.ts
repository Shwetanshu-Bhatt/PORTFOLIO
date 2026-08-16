import type * as THREE from 'three';
import { addTrackFeatures } from './features';
import { addRoadSurface } from './roadSurface';

export function createTrack(scene: THREE.Scene) {
  const { materials, guardRails } = addRoadSurface(scene);
  addTrackFeatures(scene, materials);
  return { guardRails };
}
