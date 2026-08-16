import * as THREE from 'three';
import type { BuildingData } from '../types';

export const WORLD_BUILDINGS: BuildingData[] = [
  { x: -170, z: -30, w: 18, h: 14, d: 18, color: 0x556b6b, type: 'museum', label: 'Project Garage', description: 'A drive-through stop for selected builds, backend systems, and experiments from the portfolio.', href: '/#projects' },
  { x: 35, z: -55, w: 22, h: 18, d: 20, color: 0x6b5b4f, type: 'hotel', label: 'About Studio', description: 'A quick introduction to Shwetanshu, his engineering approach, and the kind of product work he enjoys.', href: '/#about' },
];

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
  return WORLD_BUILDINGS;
}
