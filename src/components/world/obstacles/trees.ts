import * as THREE from 'three';
import type { CircularObstacle } from '../types';
import { isPointOnTrack } from '../track/layout';

const TREE_POSITIONS = [
  [-40, -90], [-20, -100], [30, -95], [50, -85], [-90, -20], [-95, 35], [90, -35], [95, 45],
  [-45, 95], [-25, 105], [35, 100], [55, 90], [-20, -50], [40, 60], [-100, 70], [105, -65],
].filter(([x, z]) => !isPointOnTrack(x, z, 5));

export function addTreeObstacles(scene: THREE.Scene): CircularObstacle[] {
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.35, 0.45, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1 }),
    TREE_POSITIONS.length,
  );
  const leaves = new THREE.InstancedMesh(
    new THREE.ConeGeometry(2.5, 5.5, 7),
    new THREE.MeshStandardMaterial({ color: 0x3d6b3d, roughness: 0.9 }),
    TREE_POSITIONS.length,
  );
  TREE_POSITIONS.forEach(([x, z], index) => {
    const matrix = new THREE.Matrix4().makeTranslation(x, 1.5, z);
    trunks.setMatrixAt(index, matrix);
    matrix.setPosition(x, 5.5, z);
    leaves.setMatrixAt(index, matrix);
  });
  [trunks, leaves].forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
  return TREE_POSITIONS.map(([x, z]) => ({ x, z, radius: 1.15 }));
}
