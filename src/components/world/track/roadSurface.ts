import * as THREE from 'three';
import type { GuardRailCollider } from '../types';
import {
  DIRT_SEGMENT_END,
  DIRT_SEGMENT_START,
  HARD_TURN_POINTS,
  TRACK_HEIGHTS,
  TRACK_POINTS,
  TRACK_WIDTH,
} from './layout';

export interface TrackMaterials {
  road: THREE.MeshStandardMaterial;
  dirt: THREE.MeshStandardMaterial;
  curbWhite: THREE.MeshStandardMaterial;
  curbRed: THREE.MeshStandardMaterial;
  railPost: THREE.MeshStandardMaterial;
}

export function addRoadSurface(scene: THREE.Scene) {
  const materials: TrackMaterials = {
    road: new THREE.MeshStandardMaterial({ color: 0x4b566d, emissive: 0x101525, emissiveIntensity: 0.6, roughness: 0.82, metalness: 0.04, side: THREE.DoubleSide }),
    dirt: new THREE.MeshStandardMaterial({ color: 0x8d5a3b, roughness: 1, metalness: 0, side: THREE.DoubleSide }),
    curbWhite: new THREE.MeshStandardMaterial({ color: 0xf5efe5, roughness: 0.72 }),
    curbRed: new THREE.MeshStandardMaterial({ color: 0xe73545, roughness: 0.72 }),
    railPost: new THREE.MeshStandardMaterial({ color: 0x68717d, roughness: 0.58, metalness: 0.62 }),
  };
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const railMaterial = new THREE.MeshStandardMaterial({ color: 0xb7c0ca, roughness: 0.42, metalness: 0.78 });
  const whiteCurbs: THREE.Matrix4[] = [];
  const redCurbs: THREE.Matrix4[] = [];
  const guardRails: GuardRailCollider[] = [];
  const guardedSegmentSides = new Map<number, Set<number>>();

  HARD_TURN_POINTS.forEach((turnIndex) => {
    const previousIndex = (turnIndex - 1 + TRACK_POINTS.length) % TRACK_POINTS.length;
    const [previousX, previousZ] = TRACK_POINTS[previousIndex];
    const [turnX, turnZ] = TRACK_POINTS[turnIndex];
    const [nextX, nextZ] = TRACK_POINTS[(turnIndex + 1) % TRACK_POINTS.length];
    const outsideSide = Math.sign(
      (turnX - previousX) * (nextZ - turnZ) - (turnZ - previousZ) * (nextX - turnX),
    ) || 1;
    [previousIndex, turnIndex].forEach((segmentIndex) => {
      const sides = guardedSegmentSides.get(segmentIndex) || new Set<number>();
      sides.add(outsideSide);
      guardedSegmentSides.set(segmentIndex, sides);
    });
  });

  TRACK_POINTS.forEach(([ax, az], index) => {
    const nextIndex = (index + 1) % TRACK_POINTS.length;
    const [bx, bz] = TRACK_POINTS[nextIndex];
    const ay = TRACK_HEIGHTS[index];
    const by = TRACK_HEIGHTS[nextIndex];
    const dx = bx - ax;
    const dz = bz - az;
    const dy = by - ay;
    const horizontalLength = Math.hypot(dx, dz);
    const length = Math.hypot(horizontalLength, dy);
    const angle = Math.atan2(dx, dz);
    const pitch = -Math.atan2(dy, horizontalLength);
    const dirt = index >= DIRT_SEGMENT_START && index <= DIRT_SEGMENT_END;
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH, 0.18, length + 4),
      dirt ? materials.dirt : materials.road,
    );
    road.position.set((ax + bx) / 2, (ay + by) / 2 + 0.09, (az + bz) / 2);
    road.rotation.order = 'YXZ';
    road.rotation.set(pitch, angle, 0);
    road.receiveShadow = true;
    scene.add(road);

    const normalX = dz / length;
    const normalZ = -dx / length;
    for (let distance = 2.5, stripe = 0; distance < length - 2.4; distance += 5, stripe += 1) {
      if (dirt) break;
      const t = distance / length;
      [-1, 1].forEach((side) => {
        const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(pitch, angle, 0, 'YXZ'));
        matrix.setPosition(
          ax + dx * t + normalX * side * (TRACK_WIDTH / 2 - 0.25),
          THREE.MathUtils.lerp(ay, by, t) + 0.14,
          az + dz * t + normalZ * side * (TRACK_WIDTH / 2 - 0.25),
        );
        (stripe % 2 === 0 ? whiteCurbs : redCurbs).push(matrix);
      });
    }
    for (let distance = 7; distance < length; distance += 14) {
      const t = distance / length;
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 4), markerMaterial);
      marker.position.set(ax + dx * t, THREE.MathUtils.lerp(ay, by, t) + 0.15, az + dz * t);
      marker.rotation.order = 'YXZ';
      marker.rotation.set(pitch, angle, 0);
      scene.add(marker);
    }

    guardedSegmentSides.get(index)?.forEach((side) => {
      const railStart = 0.15;
      const railEnd = 0.85;
      const railLength = length * (railEnd - railStart);
      const offset = side * (TRACK_WIDTH / 2 + 0.8);
      const railAx = ax + dx * railStart + normalX * offset;
      const railAz = az + dz * railStart + normalZ * offset;
      const railBx = ax + dx * railEnd + normalX * offset;
      const railBz = az + dz * railEnd + normalZ * offset;
      const group = new THREE.Group();
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, railLength), railMaterial);
      rail.position.set((railAx + railBx) / 2, (ay + by) / 2 + 0.72, (railAz + railBz) / 2);
      rail.rotation.order = 'YXZ';
      rail.rotation.set(pitch, angle, 0);
      rail.castShadow = true;
      group.add(rail);
      for (let distance = 1; distance < railLength; distance += 5.5) {
        const t = distance / railLength;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.25, 0.38), materials.railPost);
        post.position.set(
          railAx + (railBx - railAx) * t,
          THREE.MathUtils.lerp(ay, by, railStart + (railEnd - railStart) * t) + 0.62,
          railAz + (railBz - railAz) * t,
        );
        post.castShadow = true;
        group.add(post);
      }
      scene.add(group);
      guardRails.push({
        id: guardRails.length,
        ax: railAx,
        az: railAz,
        bx: railBx,
        bz: railBz,
        height: (ay + by) / 2,
        inwardX: -normalX * side,
        inwardZ: -normalZ * side,
        group,
        active: true,
        regenerateAt: 0,
      });
    });
  });

  const curbGeometry = new THREE.BoxGeometry(0.9, 0.1, 4.8);
  [[whiteCurbs, materials.curbWhite], [redCurbs, materials.curbRed]].forEach(([transforms, material]) => {
    const matrices = transforms as THREE.Matrix4[];
    const curbs = new THREE.InstancedMesh(curbGeometry, material as THREE.Material, matrices.length);
    matrices.forEach((matrix, index) => curbs.setMatrixAt(index, matrix));
    curbs.instanceMatrix.needsUpdate = true;
    curbs.receiveShadow = true;
    scene.add(curbs);
  });

  return { materials, guardRails };
}
