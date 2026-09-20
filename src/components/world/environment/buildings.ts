import * as THREE from 'three';
import type { BuildingData } from '../types';
import { nearestTrackPoint, TRACK_WIDTH } from '../track/layout';

export const WORLD_BUILDINGS: BuildingData[] = [
  { x: -350, z: -160, w: 18, h: 14, d: 18, color: 0x273954, type: 'museum', label: 'Project Garage', description: 'A drive-through stop for selected builds, backend systems, and experiments from the portfolio.', href: '/#projects' },
  { x: 350, z: -170, w: 22, h: 18, d: 20, color: 0x4a2759, type: 'hotel', label: 'About Studio', description: 'A quick introduction to Shwetanshu, his engineering approach, and the kind of product work he enjoys.', href: '/#about' },
];

const skyline = [
  [-280, -205, 26, 42, 24, 0x4c6f78], [-228, -224, 18, 29, 20, 0xb05f67], [-150, -235, 34, 54, 28, 0x3a7680],
  [110, -250, 22, 38, 22, 0x9c6471], [178, -236, 34, 65, 26, 0x356b78], [250, -190, 24, 45, 22, 0xc17868],
  [-290, 155, 30, 52, 25, 0x4f8581], [-225, 190, 22, 34, 18, 0xd08a67], [230, 175, 34, 58, 26, 0x47718c],
  [285, 115, 20, 34, 22, 0xc47b72], [-42, 260, 42, 48, 30, 0x5d7f87], [48, 245, 24, 33, 20, 0xd49a70],
] as const;

function addSkylineBuilding(scene: THREE.Scene, x: number, z: number, w: number, h: number, d: number, color: number, index: number) {
  if (nearestTrackPoint(x, z).distance <= TRACK_WIDTH / 2 + Math.hypot(w, d) / 2 + 10) return;

  const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.68, metalness: 0.12, emissive: color, emissiveIntensity: 0.035 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMaterial);
  body.position.set(x, h / 2, z);
  body.castShadow = false;
  body.receiveShadow = false;
  scene.add(body);

  const towerHeight = 3 + (index % 3) * 2;
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.62, towerHeight, d * 0.62),
    new THREE.MeshStandardMaterial({ color: 0xf0c18b, roughness: 0.7, metalness: 0.08 }),
  );
  tower.position.set(x, h + towerHeight / 2, z);
  scene.add(tower);

  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.8, 0.22, d + 0.8),
    new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? 0xff4fa3 : 0x61e7ff }),
  );
  ledge.position.set(x, h + 0.14, z);
  scene.add(ledge);

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.72, 0.28, d * 0.72),
    new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? 0xff5f86 : 0x22c7d9 }),
  );
  crown.position.set(x, h + towerHeight + 0.15, z);
  scene.add(crown);

  if (index % 2 === 0) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, h * 0.72, 0.32),
      new THREE.MeshBasicMaterial({ color: index % 4 === 0 ? 0x22c7d9 : 0xff5f86 }),
    );
    fin.position.set(x - w / 2 - 0.18, h * 0.55, z + d * 0.18);
    scene.add(fin);
  }

  const windowMaterial = new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? 0xffd58d : 0x75e7ff });
  const rows = Math.max(3, Math.floor(h / 5));
  const columns = Math.max(2, Math.floor(w / 4));
  const windows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.1, 0.7), windowMaterial, rows * columns);
  const matrix = new THREE.Matrix4();
  let windowIndex = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      matrix.makeTranslation(x - w / 2 + 2 + column * 4, 2.5 + row * 5, z - d / 2 - 0.02);
      windows.setMatrixAt(windowIndex, matrix);
      windowIndex += 1;
    }
  }
  windows.instanceMatrix.needsUpdate = true;
  scene.add(windows);
}

function addPalm(scene: THREE.Scene, x: number, z: number, scale: number) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32 * scale, 0.55 * scale, 5.5 * scale, 7),
    new THREE.MeshStandardMaterial({ color: 0x704735, roughness: 0.9 }),
  );
  trunk.position.set(x, 2.75 * scale, z);
  trunk.rotation.z = (x % 3 - 1) * 0.035;
  trunk.castShadow = false;
  scene.add(trunk);

  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x1f8b76, roughness: 0.8, emissive: 0x0d2d39, emissiveIntensity: 0.35, side: THREE.DoubleSide });
  for (let leaf = 0; leaf < 5; leaf += 1) {
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.38 * scale, 3.8 * scale, 5), leafMaterial);
    frond.position.set(x, 5.55 * scale, z);
    frond.rotation.z = Math.cos(leaf * 0.9) * 0.7;
    frond.rotation.y = leaf * (Math.PI * 2 / 7);
    frond.scale.y = 0.35;
    frond.castShadow = false;
    scene.add(frond);
  }
}

function addStreetLight(scene: THREE.Scene, x: number, z: number, color: number) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.4, 6), new THREE.MeshStandardMaterial({ color: 0x263346, metalness: 0.8, roughness: 0.4 }));
  post.position.set(x, 2.7, z);
  scene.add(post);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), new THREE.MeshBasicMaterial({ color }));
  lamp.position.set(x, 5.45, z);
  scene.add(lamp);
  const light = new THREE.PointLight(color, 8, 22, 2);
  light.position.set(x, 5.2, z);
  scene.add(light);
}

export function addBuildings(scene: THREE.Scene) {
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
  WORLD_BUILDINGS.forEach((building) => {
    const mesh = new THREE.Mesh(buildingGeometry, new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.8, metalness: 0.05 }));
    mesh.position.set(building.x, building.h / 2, building.z);
    mesh.scale.set(building.w, building.h, building.d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(building.w + 0.6, 1, building.d + 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.2 }),
    );
    roof.position.set(building.x, building.h + 0.5, building.z);
    roof.castShadow = true;
    scene.add(roof);

    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffee });
    const windowGeometry = new THREE.PlaneGeometry(building.w * 0.15, building.h * 0.12);
    for (let floor = 0; floor < Math.floor(building.h / 3); floor += 1) {
      for (let side = 0; side < 4; side += 1) {
        for (let index = 0; index < Math.floor(building.w / 3); index += 1) {
          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
          const y = 1 + floor * 3;
          let x = building.x;
          let z = building.z;
          if (side === 0) { x -= building.w / 2 + 0.01; z += -building.d / 2 + 2 + index * 3; }
          else if (side === 1) { x += building.w / 2 + 0.01; z += -building.d / 2 + 2 + index * 3; }
          else if (side === 2) { x += -building.w / 2 + 2 + index * 3; z -= building.d / 2 + 0.01; }
          else { x += -building.w / 2 + 2 + index * 3; z += building.d / 2 + 0.01; }
          windowMesh.position.set(x, y, z);
          if (side < 2) windowMesh.rotation.y = Math.PI / 2;
          scene.add(windowMesh);
        }
      }
    }

    if (!building.type) return;
    const signColor = building.type === 'museum' ? 0xd9ff48 : 0xff5e5e;
    const backing = new THREE.Mesh(
      new THREE.PlaneGeometry(building.w * 0.8, 2.5),
      new THREE.MeshBasicMaterial({ color: signColor }),
    );
    backing.position.set(building.x, building.h + 2, building.z + building.d / 2 + 0.1);
    scene.add(backing);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    context.fillStyle = `#${signColor.toString(16)}`;
    context.fillRect(0, 0, 256, 128);
    context.fillStyle = '#1a1a1a';
    context.font = 'bold 32px Georgia';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(building.label || '', 128, 64);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(building.w * 0.75, 1.8),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }),
    );
    sign.position.set(building.x, building.h + 2, building.z + building.d / 2 + 0.15);
    scene.add(sign);
  });

  skyline.forEach(([x, z, w, h, d, color], index) => addSkylineBuilding(scene, x, z, w, h, d, color, index));
  [-250, -70, 205, 276].forEach((x, index) => {
    const z = index % 2 === 0 ? -112 : 108;
    if (nearestTrackPoint(x, z).distance > TRACK_WIDTH / 2 + 18) addPalm(scene, x, z, 0.9 + (index % 3) * 0.12);
  });
  [[-118, -126, 0xff4fa3], [64, -118, 0x61e7ff], [130, 108, 0xffd166], [-178, 108, 0xff4fa3]].forEach(([x, z, color]) => {
    if (nearestTrackPoint(x, z).distance > TRACK_WIDTH / 2 + 12) addStreetLight(scene, x, z, color);
  });

  return WORLD_BUILDINGS;
}
