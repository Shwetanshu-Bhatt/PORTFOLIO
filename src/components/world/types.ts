import type * as THREE from 'three';

export interface BuildingData {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: number;
  type?: 'museum' | 'hotel';
  label?: string;
  description?: string;
  href?: string;
}

export interface CircularObstacle {
  x: number;
  z: number;
  radius: number;
}

export interface GuardRailCollider {
  id: number;
  ax: number;
  az: number;
  bx: number;
  bz: number;
  height: number;
  inwardX: number;
  inwardZ: number;
  group: THREE.Group;
  active: boolean;
  regenerateAt: number;
}

export interface RaceProgress {
  lap: number;
  checkpoint: number;
  finishedAt: number;
  bestLap: number;
  lapStartedAt: number;
}

export interface RemotePlayerVisual {
  group: THREE.Group;
  paintMaterial: THREE.MeshStandardMaterial;
  nameTag: THREE.Sprite;
  targetPosition: THREE.Vector3;
  targetRotation: number;
  speed: number;
  name: string;
  color: number;
  lap: number;
  checkpoint: number;
  finishedAt: number;
  bestLap: number;
  lastUpdate: number;
}

export interface CarBody {
  velocity: THREE.Vector3;
  position: THREE.Vector3;
  rotation: number;
  steer: number;
  trackIndex: number;
  onTrack: boolean;
}
