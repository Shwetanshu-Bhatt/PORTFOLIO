import * as THREE from 'three';
import { applyCarColor, attachCarModel } from './carModel';
import { createDriverNameTag } from './nameTag';

function createFallbackRemoteCar(color: number, name: string) {
  const car = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.58 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x07090d, roughness: 0.78, metalness: 0.12 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x14243a, roughness: 0.12, metalness: 0.35 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.05, 4.2), bodyMaterial);
  body.position.y = 1.15;
  body.castShadow = true;
  body.userData.isFallbackCarPart = true;
  car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.65, 1.75), glassMaterial);
  cabin.position.set(0, 1.65, -0.15);
  cabin.castShadow = true;
  cabin.userData.isFallbackCarPart = true;
  car.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.14, 1.35), bodyMaterial);
  roof.position.set(0, 1.98, -0.15);
  roof.castShadow = true;
  roof.userData.isFallbackCarPart = true;
  car.add(roof);
  const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 18);
  [[-0.95, 1.45], [0.95, 1.45], [-0.95, -1.45], [0.95, -1.45]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, darkMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.72, z);
    wheel.castShadow = true;
    wheel.userData.remoteWheel = true;
    wheel.userData.isFallbackCarPart = true;
    wheel.userData.isWheel = true;
    wheel.userData.isFrontWheel = z > 0;
    car.add(wheel);
  });
  const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xff2525 });
  [-0.7, 0.7].forEach((x) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.06), tailMaterial);
    tail.position.set(x, 0.85, -2.48);
    tail.userData.isFallbackCarPart = true;
    car.add(tail);
  });
  const nameTag = createDriverNameTag(name, color);
  car.add(nameTag);
  return { group: car, paintMaterial: bodyMaterial, nameTag };
}

export function createRemoteCar(color: number, name: string) {
  const fallbackCar = createFallbackRemoteCar(color, name);
  attachCarModel(fallbackCar.group, color);
  return {
    group: fallbackCar.group,
    paintMaterial: fallbackCar.paintMaterial,
    nameTag: fallbackCar.nameTag,
  };
}

