import * as THREE from 'three';
import { applyCarColor, attachCarModel, findCarWheels } from './carModel';
import { createDriverNameTag } from './nameTag';

function createFallbackPlayerCar(color: number, playerName: string) {
  const car = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.62 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x080a0f, roughness: 0.72, metalness: 0.18 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x14243a, emissive: 0x07101c, emissiveIntensity: 0.45, roughness: 0.12, metalness: 0.32 });
  const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.2, metalness: 0.95 });
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff2222, emissiveIntensity: 1.4, roughness: 0.4, metalness: 0.1 });
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xfff3b0, emissive: 0xfff3b0, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.1 });

  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.05, 4.2), bodyMaterial);
  mainBody.position.y = 1.15;
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  car.add(mainBody);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.18, 1.3), bodyMaterial);
  hood.position.set(0, 1.62, 1.15);
  hood.castShadow = true;
  car.add(hood);
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.18, 1), bodyMaterial);
  trunk.position.set(0, 1.62, -1.55);
  trunk.castShadow = true;
  car.add(trunk);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.65, 1.75), glassMaterial);
  cabin.position.set(0, 1.65, -0.15);
  cabin.castShadow = true;
  car.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.14, 1.35), bodyMaterial);
  roof.position.set(0, 1.98, -0.15);
  roof.castShadow = true;
  car.add(roof);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.55, 0.1), glassMaterial);
  windshield.position.set(0, 1.72, 0.72);
  windshield.rotation.x = -0.35;
  car.add(windshield);
  const rearWindow = windshield.clone();
  rearWindow.position.set(0, 1.72, -1.02);
  rearWindow.rotation.x = 0.35;
  car.add(rearWindow);
  [-1, 1].forEach((side) => {
    const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 1.5), glassMaterial);
    sideWindow.position.set(side * 1.05, 1.62, -0.15);
    car.add(sideWindow);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 1.45), bodyMaterial);
    door.position.set(side * 1.12, 1.05, -0.15);
    door.castShadow = true;
    car.add(door);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.32), chromeMaterial);
    handle.position.set(side * 1.18, 1.25, -0.48);
    car.add(handle);
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 3.6), darkMaterial);
    skirt.position.set(side * 1.22, 0.72, 0);
    car.add(skirt);
  });

  [2.35, -2.35].forEach((z) => {
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.35, 0.4), darkMaterial);
    bumper.position.set(0, 0.55, z);
    bumper.castShadow = true;
    car.add(bumper);
  });

  const wheelGeometry = new THREE.CylinderGeometry(0.72, 0.72, 0.58, 24);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9, metalness: 0.02 });
  const rimGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.6, 10);
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xdbe6ef, roughness: 0.16, metalness: 0.95 });
  const brakeGeometry = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16);
  const brakeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.4 });
  const wheels: THREE.Mesh[] = [];
  [
    { x: -1.25, y: 0.72, z: 1.5 }, { x: 1.25, y: 0.72, z: 1.5 },
    { x: -1.25, y: 0.72, z: -1.5 }, { x: 1.25, y: 0.72, z: -1.5 },
  ].forEach((position) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.copy(position);
    wheel.castShadow = true;
    wheel.userData.isWheel = true;
    wheel.userData.isFrontWheel = position.z > 0;
    wheel.userData.isFallbackCarPart = true;
    car.add(wheel);
    wheels.push(wheel);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.z = Math.PI / 2;
    rim.position.copy(position);
    rim.userData.isFallbackCarPart = true;
    car.add(rim);
    const brake = new THREE.Mesh(brakeGeometry, brakeMaterial);
    brake.rotation.z = Math.PI / 2;
    brake.position.copy(position);
    brake.userData.isFallbackCarPart = true;
    car.add(brake);
  });

  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.1), chromeMaterial);
  grille.position.set(0, 0.82, 2.42);
  car.add(grille);
  for (let index = -3; index <= 3; index += 1) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.06), darkMaterial);
    slot.position.set(index * 0.2, 0.82, 2.48);
    slot.userData.isFallbackCarPart = true;
    car.add(slot);
  }
  [-0.65, 0.65].forEach((x) => {
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), yellowMaterial);
    headlight.position.set(x, 0.82, 2.42);
    headlight.userData.isFallbackCarPart = true;
    car.add(headlight);
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), chromeMaterial);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(x, 0.82, 2.38);
    bezel.userData.isFallbackCarPart = true;
    car.add(bezel);
  });
  [-0.7, 0.7].forEach((x) => {
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.12), chromeMaterial);
    bezel.position.set(x, 0.85, -2.38);
    bezel.userData.isFallbackCarPart = true;
    car.add(bezel);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.06), redMaterial);
    tail.position.set(x, 0.85, -2.48);
    tail.userData.isFallbackCarPart = true;
    car.add(tail);
  });
  [-0.55, 0.55].forEach((x) => {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.5), darkMaterial);
    rack.position.set(x, 2.05, -0.15);
    rack.userData.isFallbackCarPart = true;
    car.add(rack);
  });

  const underglow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 4.4),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.13 }),
  );
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.04;
  underglow.userData.isFallbackCarPart = true;
  car.add(underglow);
  const fill = new THREE.PointLight(0xffd1b8, 5.5, 10, 2);
  fill.position.set(0, 3.8, 0.3);
  fill.userData.isFallbackCarPart = true;
  car.add(fill);
  const nameTag = createDriverNameTag(playerName, color);
  car.add(nameTag);

  return { group: car, paintMaterial: bodyMaterial, nameTag, wheels };
}

export function createPlayerCar(color: number, playerName: string) {
  const baseCar = createFallbackPlayerCar(color, playerName);
  attachCarModel(baseCar.group, color);
  const currentWheels = findCarWheels(baseCar.group);
  return {
    group: baseCar.group,
    paintMaterial: baseCar.paintMaterial,
    nameTag: baseCar.nameTag,
    wheels: currentWheels.length > 0 ? currentWheels : baseCar.wheels,
  };
}

