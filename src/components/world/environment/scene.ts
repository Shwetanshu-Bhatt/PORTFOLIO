import * as THREE from 'three';

function createSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#2b82bd');
  gradient.addColorStop(0.34, '#62c9df');
  gradient.addColorStop(0.62, '#a8e4e0');
  gradient.addColorStop(0.77, '#ffc181');
  gradient.addColorStop(1, '#d8e6c0');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return new THREE.CanvasTexture(canvas);
}

export function createWorldScene(width: number, height: number) {
  const scene = new THREE.Scene();
  scene.background = createSkyTexture() || new THREE.Color(0x62c9df);
  scene.fog = new THREE.Fog(0xa8d5cf, 220, 720);

  const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 900);
  camera.position.set(0, 6, 16);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = false;

  scene.add(new THREE.HemisphereLight(0x9cddff, 0x23473f, 2.4));
  const sun = new THREE.DirectionalLight(0xffe0a8, 3.2);
  sun.position.set(-70, 110, 45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 300;
  sun.shadow.camera.left = -340;
  sun.shadow.camera.right = 340;
  sun.shadow.camera.top = 340;
  sun.shadow.camera.bottom = -340;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(760, 760),
    new THREE.MeshStandardMaterial({ color: 0x2b5c51, roughness: 0.94, metalness: 0.04 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const waterfront = new THREE.Mesh(
    new THREE.PlaneGeometry(280, 760),
    new THREE.MeshStandardMaterial({ color: 0x2c9dc0, roughness: 0.25, metalness: 0.45, emissive: 0x0b4d69, emissiveIntensity: 0.25 }),
  );
  waterfront.rotation.x = -Math.PI / 2;
  waterfront.position.set(-330, 0.02, 0);
  waterfront.receiveShadow = true;
  scene.add(waterfront);

  return { scene, camera, renderer };
}
