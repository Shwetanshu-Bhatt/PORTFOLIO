import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const CAR_MODEL_URL = '/models/car.glb';
const CAR_MODEL_CACHE = new Map<string, Promise<THREE.Group | null>>();

function isBodyPaintMaterial(material: THREE.Material, objectName: string) {
  const materialName = material.name.toLowerCase();
  const meshName = objectName.toLowerCase();
  // In this GLB, `body` is the painted shell and `bigfoot` is also used by
  // wheel geometry. Matching only the explicit body material prevents blue or
  // player colors from covering tires and other parts.
  return materialName === 'body' || meshName.includes('_body_');
}

function isColorMaterial(material: THREE.Material): material is THREE.Material & {
  color: THREE.Color;
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  roughness?: number;
  metalness?: number;
  flatShading?: boolean;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  needsUpdate: boolean;
} {
  return 'color' in material;
}

export function applyCarColor(root: THREE.Object3D, color: number) {
  const paintColor = new THREE.Color(color);

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (child.visible === false && child.userData.isFallbackCarPart === true) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!isColorMaterial(material)) return;
      const isPaintTarget = material.userData.isBodyPaint === true || isBodyPaintMaterial(material, child.name);
      if (!isPaintTarget) return;

      // Keep the GLB's original decals, tread, normal maps, and body geometry.
      material.color.copy(paintColor);
      material.needsUpdate = true;
    });
  });
}

function normalizeCarModel(model: THREE.Group) {
  model.name = 'drivable-car-model';
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.isFallbackCarPart = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (isColorMaterial(material)) {
          material.userData.isBodyPaint = isBodyPaintMaterial(material, child.name);
          material.needsUpdate = true;
        }
      });
      const lowerName = child.name.toLowerCase();
      if (lowerName.includes('wheel')) {
        child.userData.isWheel = true;
        child.userData.isFrontWheel = lowerName.includes('front') || lowerName.includes('lf') || lowerName.includes('rf') || child.position.z > 0;
      }
    }
  });
  model.scale.setScalar(1.15);
  // The game treats +Z as the car's front. This GLB already uses that axis.
  model.rotation.y = 0;
  return model;
}

export function loadCarModel(): Promise<THREE.Group | null> {
  const cacheKey = CAR_MODEL_URL;
  const cached = CAR_MODEL_CACHE.get(cacheKey);
  if (cached) return cached;

  const loader = new GLTFLoader();
  const promise = new Promise<THREE.Group | null>((resolve) => {
    loader.load(
      CAR_MODEL_URL,
      (gltf) => {
        const model = gltf.scene as THREE.Group;
        resolve(normalizeCarModel(model));
      },
      undefined,
      () => resolve(null),
    );
  });

  CAR_MODEL_CACHE.set(cacheKey, promise);
  return promise;
}

export function attachCarModel(group: THREE.Group, color: number) {
  void loadCarModel().then((model) => {
    if (!model) return;

    const carModel = model.clone(true);
    carModel.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material.clone();
    });

    group.add(carModel);
    applyCarColor(carModel, color);

    group.children.forEach((child) => {
      if (child === carModel || child instanceof THREE.Sprite) return;
      child.visible = false;
      child.userData.isFallbackCarPart = true;
    });
  });
}

export function findCarWheels(root: THREE.Object3D) {
  const wheels: THREE.Mesh[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || child.visible === false) return;
    if (child.userData.isWheel === true) {
      wheels.push(child);
    }
  });
  return wheels;
}
