import * as THREE from 'three';
import type { CarBody } from '../types';

export function createCollisionResolver(
  body: CarBody,
  forward: THREE.Vector3,
  onImpact: (strength: number) => void,
) {
  const normal = new THREE.Vector3();
  const tangent = new THREE.Vector3();

  const resolveStaticImpact = (normalX: number, normalZ: number) => {
    normal.set(normalX, 0, normalZ).normalize();
    const normalSpeed = body.velocity.dot(normal);
    if (normalSpeed >= 0) return;
    const impactSpeed = -normalSpeed;
    onImpact(impactSpeed);
    tangent.copy(body.velocity).addScaledVector(normal, -normalSpeed);
    const retention = THREE.MathUtils.clamp(0.82 - impactSpeed * 0.018, 0.38, 0.76);
    body.velocity.copy(tangent.multiplyScalar(retention)).addScaledVector(normal, impactSpeed * 0.16);
    body.steer *= 0.55;
  };

  const resolveCircleImpact = (x: number, z: number, minDistance: number, movingVelocity?: THREE.Vector3) => {
    let dx = body.position.x - x;
    let dz = body.position.z - z;
    let distance = Math.hypot(dx, dz);
    if (distance >= minDistance) return null;
    if (distance < 0.001) {
      dx = -forward.x;
      dz = -forward.z;
      distance = 1;
    }
    const normalX = dx / distance;
    const normalZ = dz / distance;
    body.position.x += normalX * (minDistance - distance + 0.02);
    body.position.z += normalZ * (minDistance - distance + 0.02);
    if (!movingVelocity) {
      resolveStaticImpact(normalX, normalZ);
      return null;
    }
    normal.set(normalX, 0, normalZ);
    tangent.copy(body.velocity).sub(movingVelocity);
    const relativeNormalSpeed = tangent.dot(normal);
    if (relativeNormalSpeed >= 0) return null;
    onImpact(-relativeNormalSpeed);
    body.velocity.addScaledVector(normal, -relativeNormalSpeed * 0.82);
    body.velocity.multiplyScalar(0.94);
    body.steer *= 0.7;
    return { normalX, normalZ, impactSpeed: -relativeNormalSpeed };
  };

  return { normal, resolveStaticImpact, resolveCircleImpact };
}
