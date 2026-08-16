import * as THREE from 'three';
import {
  RACE_CHECKPOINT_INDICES,
  TRACK_HEIGHTS,
  TRACK_POINTS,
  TRACK_SPAWN,
  TRACK_WIDTH,
  isPointOnTrack,
} from './layout';
import type { TrackMaterials } from './roadSurface';

function addStartGrid(scene: THREE.Scene, materials: TrackMaterials) {
  const normalX = Math.cos(TRACK_SPAWN.rotation);
  const normalZ = -Math.sin(TRACK_SPAWN.rotation);
  const dark = new THREE.MeshStandardMaterial({ color: 0x101116 });
  for (let tile = 0; tile < 12; tile += 1) {
    const offset = (tile - 5.5) * (TRACK_WIDTH / 12);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH / 12, 0.04, 1.5),
      tile % 2 === 0 ? materials.curbWhite : dark,
    );
    mesh.position.set(TRACK_SPAWN.x + normalX * offset, TRACK_SPAWN.y + 0.17, TRACK_SPAWN.z + normalZ * offset);
    mesh.rotation.y = TRACK_SPAWN.rotation;
    scene.add(mesh);
  }
}

function addDrivingLine(scene: THREE.Scene) {
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  TRACK_POINTS.forEach(([ax, az], index) => {
    if (index % 3 !== 0) return;
    const nextIndex = (index + 1) % TRACK_POINTS.length;
    const [bx, bz] = TRACK_POINTS[nextIndex];
    const dy = TRACK_HEIGHTS[nextIndex] - TRACK_HEIGHTS[index];
    const horizontalLength = Math.hypot(bx - ax, bz - az) || 1;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 4.8), material);
    stripe.position.set((ax + bx) / 2, (TRACK_HEIGHTS[index] + TRACK_HEIGHTS[nextIndex]) / 2 + 0.19, (az + bz) / 2);
    stripe.rotation.order = 'YXZ';
    stripe.rotation.set(-Math.atan2(dy, horizontalLength), Math.atan2(bx - ax, bz - az), 0);
    scene.add(stripe);
  });
}

function addCheckpoints(scene: THREE.Scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0x253044, emissive: 0x65e7ff, emissiveIntensity: 1.3, roughness: 0.35, metalness: 0.7 });
  RACE_CHECKPOINT_INDICES.slice(1).forEach((pointIndex) => {
    const [x, z] = TRACK_POINTS[pointIndex];
    const [nextX, nextZ] = TRACK_POINTS[(pointIndex + 1) % TRACK_POINTS.length];
    const length = Math.hypot(nextX - x, nextZ - z);
    const normalX = (nextZ - z) / length;
    const normalZ = -(nextX - x) / length;
    [-1, 1].forEach((side) => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.4, 0.24), material);
      pylon.position.set(x + normalX * side * (TRACK_WIDTH / 2 + 0.4), TRACK_HEIGHTS[pointIndex] + 1.2, z + normalZ * side * (TRACK_WIDTH / 2 + 0.4));
      scene.add(pylon);
    });
  });
}

function addFlyoverSupports(scene: THREE.Scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0x485060, roughness: 0.75, metalness: 0.25 });
  TRACK_POINTS.forEach(([x, z], index) => {
    const height = TRACK_HEIGHTS[index];
    if (height < 5 || index % 3 !== 0) return;
    const [nextX, nextZ] = TRACK_POINTS[(index + 1) % TRACK_POINTS.length];
    const tangentLength = Math.hypot(nextX - x, nextZ - z) || 1;
    const normalX = (nextZ - z) / tangentLength;
    const normalZ = -(nextX - x) / tangentLength;
    [-1, 1].forEach((side) => {
      const supportOffset = TRACK_WIDTH / 2 + 3;
      const supportX = x + normalX * side * supportOffset;
      const supportZ = z + normalZ * side * supportOffset;
      if (isPointOnTrack(supportX, supportZ, 1.5)) return;
      const support = new THREE.Mesh(new THREE.BoxGeometry(2.4, height, 2.4), material);
      // Keep the columns outside both the flyover deck and the lower lane at
      // the crossing. They are scenery, not barriers on a drivable surface.
      support.position.set(supportX, height / 2, supportZ);
      support.castShadow = true;
      scene.add(support);
    });
  });
}

function addPitAndStands(scene: THREE.Scene, materials: TrackMaterials) {
  const normalX = Math.cos(TRACK_SPAWN.rotation);
  const normalZ = -Math.sin(TRACK_SPAWN.rotation);
  const pitLane = new THREE.Mesh(new THREE.BoxGeometry(7, 0.08, 48), materials.road);
  pitLane.position.set(TRACK_SPAWN.x + normalX * 13, TRACK_SPAWN.y + 0.05, TRACK_SPAWN.z + normalZ * 13);
  pitLane.rotation.y = TRACK_SPAWN.rotation;
  pitLane.receiveShadow = true;
  scene.add(pitLane);
  const pitBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(7, 5, 44),
    new THREE.MeshStandardMaterial({ color: 0x30384b, roughness: 0.62, metalness: 0.32 }),
  );
  pitBuilding.position.set(TRACK_SPAWN.x + normalX * 19, TRACK_SPAWN.y + 2.5, TRACK_SPAWN.z + normalZ * 19);
  pitBuilding.rotation.y = TRACK_SPAWN.rotation;
  pitBuilding.castShadow = true;
  scene.add(pitBuilding);

  const material = new THREE.MeshStandardMaterial({ color: 0x39415a, roughness: 0.7, metalness: 0.24 });
  [[15, 142, 64, 0], [145, 35, 52, Math.PI / 2]].forEach(([x, z, width, rotation]) => {
    const stand = new THREE.Group();
    for (let row = 0; row < 4; row += 1) {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(width, 0.75, 2.2), material);
      tier.position.set(0, 0.5 + row * 0.72, row * 1.4);
      tier.castShadow = true;
      stand.add(tier);
    }
    stand.position.set(x, 0, z);
    stand.rotation.y = rotation;
    scene.add(stand);
  });
}

function addTrackLights(scene: THREE.Scene, postMaterial: THREE.Material) {
  TRACK_POINTS.filter((_point, index) => index % 3 === 0).forEach(([x, z], index) => {
    const nextIndex = (index + 1) % TRACK_POINTS.length;
    const [nextX, nextZ] = TRACK_POINTS[nextIndex];
    const length = Math.hypot(nextX - x, nextZ - z) || 1;
    const normalX = (nextZ - z) / length;
    const normalZ = -(nextX - x) / length;
    const poleOffset = TRACK_WIDTH / 2 + 5;
    const side = !isPointOnTrack(x + normalX * poleOffset, z + normalZ * poleOffset, 1.5) ? 1 : -1;
    const poleX = x + normalX * poleOffset * side;
    const poleZ = z + normalZ * poleOffset * side;
    if (isPointOnTrack(poleX, poleZ, 1.5)) return;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 8, 7), postMaterial);
    pole.position.set(poleX, 4, poleZ);
    scene.add(pole);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), new THREE.MeshBasicMaterial({ color: 0xb9f6ff }));
    lamp.position.set(poleX, 8, poleZ);
    scene.add(lamp);
    if (index % 2 === 0) {
      const light = new THREE.PointLight(0x8aefff, 16, 35, 2);
      light.position.set(poleX, 7.5, poleZ);
      scene.add(light);
    }
  });
}

export function addTrackFeatures(scene: THREE.Scene, materials: TrackMaterials) {
  addStartGrid(scene, materials);
  addDrivingLine(scene);
  addCheckpoints(scene);
  addFlyoverSupports(scene);
  addPitAndStands(scene, materials);
  addTrackLights(scene, materials.railPost);
}
