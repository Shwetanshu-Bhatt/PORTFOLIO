import * as THREE from 'three';

export function createWorldScene(width: number, height: number) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x17132d);
  scene.fog = new THREE.Fog(0x2a1f4f, 150, 620);

  const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 900);
  camera.position.set(0, 6, 16);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0x8a7dff, 0x101c24, 1.8));
  const sun = new THREE.DirectionalLight(0xffb06b, 2.6);
  sun.position.set(-70, 110, 45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
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
    new THREE.MeshStandardMaterial({ color: 0x183a35, roughness: 0.96 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  return { scene, camera, renderer };
}
