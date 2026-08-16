import * as THREE from 'three';

export function createNitroEffect(car: THREE.Group) {
  const flames = [
    new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 3.5, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.95 }),
    ),
    new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 2.5, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
    ),
  ];
  flames[0].position.set(0, 0.6, -3);
  flames[1].position.set(0, 0.6, -2.8);
  flames.forEach((flame) => {
    flame.rotation.x = -Math.PI / 2;
    car.add(flame);
  });
  return flames;
}

export function removeNitroEffect(car: THREE.Group, flames: THREE.Mesh[]) {
  flames.forEach((flame) => {
    car.remove(flame);
    flame.geometry.dispose();
    (flame.material as THREE.Material).dispose();
  });
  flames.length = 0;
}
