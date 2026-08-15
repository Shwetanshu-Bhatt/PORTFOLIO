'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  WORLD_MAX_PLAYERS,
  WORLD_STATE_INTERVAL_MS,
  type WorldPlayerState,
  type WorldServerEvent,
} from '@/lib/world-protocol';

interface World3DProps {
  onBack?: () => void;
}

interface BuildingData {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: number;
  type?: 'museum' | 'hotel';
  label?: string;
  description?: string;
  href?: string;
}

interface RemotePlayerVisual {
  group: THREE.Group;
  targetPosition: THREE.Vector3;
  targetRotation: number;
  speed: number;
  lastUpdate: number;
}

interface CircularObstacle {
  x: number;
  z: number;
  radius: number;
}

const TRACK_WIDTH = 16;
const TRACK_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, -125], [72, -112], [118, -72], [132, -18], [118, 42], [82, 92],
  [28, 120], [-34, 112], [-78, 82], [-92, 40], [-64, 10], [-18, 2],
  [38, 12], [70, 42], [44, 70], [2, 62], [-34, 38], [-82, 30],
  [-125, 5], [-132, -48], [-102, -94], [-52, -120],
];
const TRACK_SPAWN = { x: 0, z: -125, rotation: Math.atan2(72, 13) };

function distanceToTrack(x: number, z: number) {
  let closest = Infinity;
  TRACK_POINTS.forEach(([ax, az], index) => {
    const [bx, bz] = TRACK_POINTS[(index + 1) % TRACK_POINTS.length];
    const dx = bx - ax;
    const dz = bz - az;
    const lengthSquared = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / lengthSquared));
    closest = Math.min(closest, Math.hypot(x - (ax + dx * t), z - (az + dz * t)));
  });
  return closest;
}

function isPointOnTrack(x: number, z: number, margin = 0) {
  return distanceToTrack(x, z) <= TRACK_WIDTH / 2 + margin;
}

function createRemoteCar(color: number) {
  const car = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.58 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x07090d, roughness: 0.78, metalness: 0.12 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x14243a, roughness: 0.12, metalness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 4.75), bodyMaterial);
  body.position.y = 0.52;
  body.castShadow = true;
  car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.58, 1.75), glassMaterial);
  cabin.position.set(0, 1.05, -0.2);
  cabin.castShadow = true;
  car.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.14, 1.2), bodyMaterial);
  roof.position.set(0, 1.4, -0.22);
  roof.castShadow = true;
  car.add(roof);
  const wheelGeometry = new THREE.CylinderGeometry(0.56, 0.56, 0.46, 18);
  [[-1.2, 1.45], [1.2, 1.45], [-1.2, -1.45], [1.2, -1.45]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, darkMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.52, z);
    wheel.castShadow = true;
    wheel.userData.remoteWheel = true;
    car.add(wheel);
  });
  const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xff2525 });
  [-0.7, 0.7].forEach((x) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.06), tailMaterial);
    tail.position.set(x, 0.55, -2.42);
    car.add(tail);
  });
  return car;
}

export default function World3D({ onBack }: World3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carRef = useRef<THREE.Group | null>(null);
  const remotePlayersRef = useRef<Map<string, RemotePlayerVisual>>(new Map());
  const multiplayerSocketRef = useRef<WebSocket | null>(null);
  const carBodyRef = useRef<{
    velocity: THREE.Vector3;
    position: THREE.Vector3;
    rotation: number;
    steer: number;
  } | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gamepadRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState('N');
  const [surface, setSurface] = useState<'ASPHALT' | 'OFF ROAD'>('ASPHALT');
  const [mapPosition, setMapPosition] = useState({
    x: 50 + (TRACK_SPAWN.x / 320) * 100,
    y: 50 + (TRACK_SPAWN.z / 320) * 100,
    rotation: -THREE.MathUtils.radToDeg(TRACK_SPAWN.rotation),
  });
  const [multiplayerStatus, setMultiplayerStatus] = useState<'connecting' | 'online' | 'solo' | 'full'>('connecting');
  const [playerCount, setPlayerCount] = useState(1);
  const [nitro, setNitro] = useState(100);
  const [nearbyBuilding, setNearbyBuilding] = useState<BuildingData | null>(null);
  const [activeBuilding, setActiveBuilding] = useState<BuildingData | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const buildingsRef = useRef<BuildingData[]>([]);
  const obstaclesRef = useRef<CircularObstacle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const nitroRef = useRef(nitro);
  nitroRef.current = nitro;
  const activeBuildingRef = useRef(activeBuilding);
  activeBuildingRef.current = activeBuilding;
  const nearbyBuildingRef = useRef(nearbyBuilding);
  nearbyBuildingRef.current = nearbyBuilding;

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x17132d);
    scene.fog = new THREE.Fog(0x2a1f4f, 90, 285);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      600
    );
    camera.position.set(0, 6, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const skyLight = new THREE.HemisphereLight(0x8a7dff, 0x101c24, 1.8);
    scene.add(skyLight);

    const sun = new THREE.DirectionalLight(0xffb06b, 2.6);
    sun.position.set(-70, 110, 45);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 300;
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x183a35, roughness: 0.96 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x151722, roughness: 0.88, metalness: 0.04 });
    const curbWhite = new THREE.MeshStandardMaterial({ color: 0xf5efe5, roughness: 0.72 });
    const curbRed = new THREE.MeshStandardMaterial({ color: 0xe73545, roughness: 0.72 });
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffd166 });

    TRACK_POINTS.forEach(([ax, az], index) => {
      const [bx, bz] = TRACK_POINTS[(index + 1) % TRACK_POINTS.length];
      const dx = bx - ax;
      const dz = bz - az;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (ax + bx) / 2;
      const midZ = (az + bz) / 2;
      const road = new THREE.Mesh(new THREE.BoxGeometry(TRACK_WIDTH, 0.12, length + 1.5), roadMaterial);
      road.position.set(midX, 0.06, midZ);
      road.rotation.y = angle;
      road.receiveShadow = true;
      scene.add(road);

      const normalX = dz / length;
      const normalZ = -dx / length;
      for (let distance = 2.5, stripe = 0; distance < length; distance += 5, stripe += 1) {
        const t = distance / length;
        [-1, 1].forEach((side) => {
          const curb = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.1, Math.min(4.8, length - distance)),
            stripe % 2 === 0 ? curbWhite : curbRed,
          );
          curb.position.set(
            ax + dx * t + normalX * side * (TRACK_WIDTH / 2 - 0.25),
            0.14,
            az + dz * t + normalZ * side * (TRACK_WIDTH / 2 - 0.25),
          );
          curb.rotation.y = angle;
          curb.receiveShadow = true;
          scene.add(curb);
        });
      }

      for (let distance = 7; distance < length; distance += 14) {
        const t = distance / length;
        const marker = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 4), markerMaterial);
        marker.position.set(ax + dx * t, 0.135, az + dz * t);
        marker.rotation.y = angle;
        scene.add(marker);
      }
    });

    TRACK_POINTS.forEach(([x, z]) => {
      const corner = new THREE.Mesh(new THREE.CylinderGeometry(TRACK_WIDTH / 2, TRACK_WIDTH / 2, 0.12, 28), roadMaterial);
      corner.position.set(x, 0.06, z);
      corner.receiveShadow = true;
      scene.add(corner);
    });

    const startAngle = TRACK_SPAWN.rotation;
    const startNormalX = Math.cos(startAngle);
    const startNormalZ = -Math.sin(startAngle);
    for (let tile = 0; tile < 12; tile += 1) {
      const offset = (tile - 5.5) * (TRACK_WIDTH / 12);
      const startTile = new THREE.Mesh(
        new THREE.BoxGeometry(TRACK_WIDTH / 12, 0.04, 1.5),
        tile % 2 === 0 ? curbWhite : new THREE.MeshStandardMaterial({ color: 0x101116 }),
      );
      startTile.position.set(TRACK_SPAWN.x + startNormalX * offset, 0.17, TRACK_SPAWN.z + startNormalZ * offset);
      startTile.rotation.y = startAngle;
      scene.add(startTile);
    }

    const buildings: BuildingData[] = [
      { x: -35, z: -55, w: 18, h: 14, d: 18, color: 0x556b6b, type: 'museum', label: 'Project Garage', description: 'A drive-through stop for selected builds, backend systems, and experiments from the portfolio.', href: '/#projects' },
      { x: 35, z: -55, w: 22, h: 18, d: 20, color: 0x6b5b4f, type: 'hotel', label: 'About Studio', description: 'A quick introduction to Shwetanshu, his engineering approach, and the kind of product work he enjoys.', href: '/#about' },
    ];

    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    buildings.forEach((building) => {
      const wallMat = new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.8, metalness: 0.05 });
      const mesh = new THREE.Mesh(buildingGeometry, wallMat);
      mesh.position.set(building.x, building.h / 2, building.z);
      mesh.scale.set(building.w, building.h, building.d);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.2 });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(building.w + 0.6, 1, building.d + 0.6), roofMat);
      roof.position.set(building.x, building.h + 0.5, building.z);
      roof.castShadow = true;
      scene.add(roof);

      const windowMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
      const windowGeom = new THREE.PlaneGeometry(building.w * 0.15, building.h * 0.12);
      const floors = Math.floor(building.h / 3);
      for (let floor = 0; floor < floors; floor++) {
        for (let side = 0; side < 4; side++) {
          const count = Math.floor(building.w / 3);
          for (let i = 0; i < count; i++) {
            const win = new THREE.Mesh(windowGeom, windowMat);
            const y = 1 + floor * 3;
            let x = building.x, z = building.z;
            if (side === 0) { x += -building.w / 2 - 0.01; z += -building.d / 2 + 2 + i * 3; }
            else if (side === 1) { x += building.w / 2 + 0.01; z += -building.d / 2 + 2 + i * 3; }
            else if (side === 2) { x += -building.w / 2 + 2 + i * 3; z += -building.d / 2 - 0.01; }
            else { x += -building.w / 2 + 2 + i * 3; z += building.d / 2 + 0.01; }
            win.position.set(x, y, z);
            if (side === 0 || side === 1) win.rotation.y = Math.PI / 2;
            scene.add(win);
          }
        }
      }

      if (building.type === 'museum' || building.type === 'hotel') {
        const signMat = new THREE.MeshBasicMaterial({ color: building.type === 'museum' ? 0xd9ff48 : 0xff5e5e });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(building.w * 0.8, 2.5), signMat);
        sign.position.set(building.x, building.h + 2, building.z + building.d / 2 + 0.1);
        scene.add(sign);
        
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = building.type === 'museum' ? '#d9ff48' : '#ff5e5e';
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 32px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(building.label || '', 128, 64);
        const texture = new THREE.CanvasTexture(canvas);
        const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(building.w * 0.75, 1.8), textMat);
        textMesh.position.set(building.x, building.h + 2, building.z + building.d / 2 + 0.15);
        scene.add(textMesh);
      }
    });

    buildingsRef.current = buildings;

    const treePositions = [
      [-40, -90], [-20, -100], [30, -95], [50, -85], [-90, -20], [-95, 35], [90, -35], [95, 45],
      [-45, 95], [-25, 105], [35, 100], [55, 90], [-20, -50], [40, 60], [-100, 70], [105, -65],
    ].filter(([x, z]) => !isPointOnTrack(x, z, 5));
    obstaclesRef.current = treePositions.map(([x, z]) => ({ x, z, radius: 1.15 }));
    
    const trunkGeometry = new THREE.CylinderGeometry(0.35, 0.45, 3, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1 });
    const leavesGeometry = new THREE.ConeGeometry(2.5, 5.5, 7);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x3d6b3d, roughness: 0.9 });

    const trunkInstanced = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, treePositions.length);
    const leavesInstanced = new THREE.InstancedMesh(leavesGeometry, leavesMaterial, treePositions.length);
    
    treePositions.forEach(([x, z], i) => {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, 1.5, z);
      trunkInstanced.setMatrixAt(i, matrix);
      matrix.setPosition(x, 5.5, z);
      leavesInstanced.setMatrixAt(i, matrix);
    });
    
    trunkInstanced.instanceMatrix.needsUpdate = true;
    trunkInstanced.castShadow = true;
    trunkInstanced.receiveShadow = true;
    leavesInstanced.instanceMatrix.needsUpdate = true;
    leavesInstanced.castShadow = true;
    leavesInstanced.receiveShadow = true;
    scene.add(trunkInstanced);
    scene.add(leavesInstanced);

    const car = new THREE.Group();

    const mainColor = 0xff5a36;
    const darkColor = 0x080a0f;
    const glassColor = 0x14243a;
    const chromeColor = 0xe5e7eb;
    const redColor = 0xff2222;

    const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.3, metalness: 0.62 });
    const darkMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.72, metalness: 0.18 });
    const glassMat = new THREE.MeshStandardMaterial({ color: glassColor, emissive: 0x07101c, emissiveIntensity: 0.45, roughness: 0.12, metalness: 0.32 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: chromeColor, roughness: 0.2, metalness: 0.95 });
    const redMat = new THREE.MeshStandardMaterial({ color: redColor, emissive: redColor, emissiveIntensity: 1.4, roughness: 0.4, metalness: 0.1 });

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 4.8), bodyMat);
    mainBody.position.y = 0.5;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    car.add(mainBody);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 1.4), bodyMat);
    hood.position.set(0, 0.78, 1.2);
    hood.castShadow = true;
    car.add(hood);

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 1.1), bodyMat);
    trunk.position.set(0, 0.78, -1.5);
    trunk.castShadow = true;
    car.add(trunk);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 1.7), glassMat);
    cabin.position.set(0, 1.05, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.14, 1.22), bodyMat);
    roof.position.set(0, 1.34, -0.25);
    roof.castShadow = true;
    car.add(roof);

    const hoodStripe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 1.48), darkMat);
    hoodStripe.position.set(0, 0.875, 1.23);
    car.add(hoodStripe);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.1), glassMat);
    windshield.position.set(0, 1.05, 0.7);
    windshield.rotation.x = -0.5;
    car.add(windshield);

    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.1), glassMat);
    rearWindow.position.set(0, 1.05, -1.1);
    rearWindow.rotation.x = 0.5;
    car.add(rearWindow);

    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.6), glassMat);
    sideL.position.set(-1.05, 1.05, -0.2);
    car.add(sideL);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.6), glassMat);
    sideR.position.set(1.05, 1.05, -0.2);
    car.add(sideR);

    [-1, 1].forEach((side) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 1.45), bodyMat);
      door.position.set(side * 1.115, 0.67, -0.2);
      door.castShadow = true;
      car.add(door);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.32), chromeMat);
      handle.position.set(side * 1.16, 0.79, -0.48);
      car.add(handle);
    });

    const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 3.8), darkMat);
    skirtL.position.set(-1.1, 0.35, 0);
    car.add(skirtL);
    const skirtR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 3.8), darkMat);
    skirtR.position.set(1.1, 0.35, 0);
    car.add(skirtR);

    const frontLip = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.3), darkMat);
    frontLip.position.set(0, 0.3, 2.45);
    car.add(frontLip);

    const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 0.4), darkMat);
    rearDiffuser.position.set(0, 0.25, -2.5);
    car.add(rearDiffuser);

    const wheelGeom = new THREE.CylinderGeometry(0.56, 0.56, 0.46, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9, metalness: 0.02 });
    const rimGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.49, 10);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdbe6ef, roughness: 0.16, metalness: 0.95 });
    const brakeGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16);
    const brakeMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.4 });
    const wheelPositions = [
      { x: -1.2, y: 0.5, z: 1.45 },
      { x: 1.2, y: 0.5, z: 1.45 },
      { x: -1.2, y: 0.5, z: -1.45 },
      { x: 1.2, y: 0.5, z: -1.45 },
    ];

    const wheels: THREE.Mesh[] = [];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.castShadow = true;
      wheel.userData.isWheel = true;
      wheel.userData.isFrontWheel = pos.z > 0;
      car.add(wheel);
      wheels.push(wheel);

      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(pos.x, pos.y, pos.z);
      car.add(rim);

      const brake = new THREE.Mesh(brakeGeom, brakeMat);
      brake.rotation.z = Math.PI / 2;
      brake.position.set(pos.x, pos.y, pos.z);
      car.add(brake);
    });

    const headlightBezel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.15), chromeMat);
    headlightBezel.position.set(-0.7, 0.5, 2.41);
    car.add(headlightBezel);
    const headlightBezelR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.15), chromeMat);
    headlightBezelR.position.set(0.7, 0.5, 2.41);
    car.add(headlightBezelR);

    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    headlightL.position.set(-0.7, 0.5, 2.5);
    car.add(headlightL);
    const headlightR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    headlightR.position.set(0.7, 0.5, 2.5);
    car.add(headlightR);

    const taillightBezel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.12), chromeMat);
    taillightBezel.position.set(-0.7, 0.5, -2.45);
    car.add(taillightBezel);
    const taillightBezelR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.12), chromeMat);
    taillightBezelR.position.set(0.7, 0.5, -2.45);
    car.add(taillightBezelR);

    const taillightL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), redMat);
    taillightL.position.set(-0.7, 0.5, -2.52);
    car.add(taillightL);
    const taillightR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), redMat);
    taillightR.position.set(0.7, 0.5, -2.52);
    car.add(taillightR);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.1), darkMat);
    grille.position.set(0, 0.45, 2.42);
    car.add(grille);

    const spoilerStandGeom = new THREE.BoxGeometry(0.12, 0.35, 0.12);
    const spoilerStandL = new THREE.Mesh(spoilerStandGeom, darkMat);
    spoilerStandL.position.set(-0.65, 0.85, -2.1);
    car.add(spoilerStandL);
    const spoilerStandR = new THREE.Mesh(spoilerStandGeom, darkMat);
    spoilerStandR.position.set(0.65, 0.85, -2.1);
    car.add(spoilerStandR);

    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.45), darkMat);
    spoiler.position.set(0, 1.05, -2.1);
    spoiler.castShadow = true;
    car.add(spoiler);

    const underglowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.13 });
    const underglow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 4.4), underglowMat);
    underglow.rotation.x = -Math.PI / 2;
    underglow.position.y = 0.04;
    car.add(underglow);

    const carFill = new THREE.PointLight(0xffd1b8, 5.5, 10, 2);
    carFill.position.set(0, 3.8, 0.3);
    car.add(carFill);

    car.position.set(TRACK_SPAWN.x, 0, TRACK_SPAWN.z);
    car.rotation.y = TRACK_SPAWN.rotation;
    scene.add(car);
    carRef.current = car;
    carBodyRef.current = {
      velocity: new THREE.Vector3(0, 0, 0),
      position: new THREE.Vector3(TRACK_SPAWN.x, 0, TRACK_SPAWN.z),
      rotation: TRACK_SPAWN.rotation,
      steer: 0,
    };

    clockRef.current = new THREE.Clock();
    setLoading(false);
  }, []);

  useEffect(() => {
    initScene();

    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      keysRef.current.add(e.code);
      if (e.code === 'KeyR') {
        if (carBodyRef.current) {
          carBodyRef.current.position.set(TRACK_SPAWN.x, 0, TRACK_SPAWN.z);
          carBodyRef.current.rotation = TRACK_SPAWN.rotation;
          carBodyRef.current.velocity.set(0, 0, 0);
          carBodyRef.current.steer = 0;
          if (carRef.current) {
            carRef.current.position.set(TRACK_SPAWN.x, 0, TRACK_SPAWN.z);
            carRef.current.rotation.y = TRACK_SPAWN.rotation;
          }
        }
      }
      if (e.code === 'KeyE') {
        if (nearbyBuildingRef.current && !activeBuildingRef.current) {
          setActiveBuilding(nearbyBuildingRef.current);
        } else if (activeBuildingRef.current) {
          setActiveBuilding(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    const handleGamepadConnected = (e: GamepadEvent) => {
      gamepadRef.current = e.gamepad.index;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('gamepadconnected', handleGamepadConnected);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);

      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene]);

  useEffect(() => {
    if (!sceneRef.current || !carRef.current || !carBodyRef.current || !clockRef.current) return;

    const scene = sceneRef.current;
    const car = carRef.current;
    const body = carBodyRef.current;
    const clock = clockRef.current;

    const maxSpeed = 43;
    const nitroMaxSpeed = 61;
    const reverseSpeed = 22;
    const reverseAcceleration = 32;
    const acceleration = 24;
    const nitroAcceleration = 38;
    const brakeForce = 42;
    const handbrakeForce = 16;
    const turnSpeed = 2.35;
    const steeringRate = 5.5;
    const maxSteer = 0.68;

    const buildings = buildingsRef.current;
    const wheels = car.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.userData.isWheel === true);

    const forward = new THREE.Vector3();
    const rightAxis = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);
    const cameraOffset = new THREE.Vector3();
    const targetCameraPos = new THREE.Vector3();
    let frameCount = 0;
    let lastSpeed = -1;
    let lastGear = 'N';
    let lastSurface: 'ASPHALT' | 'OFF ROAD' = 'ASPHALT';
    let previousLongitudinal = 0;
    let nitroFlameMeshes: THREE.Mesh[] = [];
    let smokeCursor = 0;
    const smokeOffset = new THREE.Vector3();
    const collisionNormal = new THREE.Vector3();
    const collisionTangent = new THREE.Vector3();
    const obstacleVelocity = new THREE.Vector3();
    const smokeGeometry = new THREE.SphereGeometry(0.32, 7, 5);
    const smokeParticles = Array.from({ length: 14 }, () => {
      const material = new THREE.MeshBasicMaterial({ color: 0xc8d2dc, transparent: true, opacity: 0, depthWrite: false });
      const particle = new THREE.Mesh(smokeGeometry, material);
      particle.visible = false;
      particle.userData.life = 0;
      scene.add(particle);
      return particle;
    });

    const createNitroFlame = () => {
      const flameGeom = new THREE.ConeGeometry(0.6, 3.5, 12);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.95 });
      const flame = new THREE.Mesh(flameGeom, flameMat);
      flame.position.set(0, 0.6, -3.0);
      flame.rotation.x = -Math.PI / 2;
      car.add(flame);
      nitroFlameMeshes.push(flame);

      const innerGeom = new THREE.ConeGeometry(0.3, 2.5, 8);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      const inner = new THREE.Mesh(innerGeom, innerMat);
      inner.position.set(0, 0.6, -2.8);
      inner.rotation.x = -Math.PI / 2;
      car.add(inner);
      nitroFlameMeshes.push(inner);
    };

    const removeNitroFlames = () => {
      nitroFlameMeshes.forEach(f => car.remove(f));
      nitroFlameMeshes.forEach(f => {
        f.geometry.dispose();
        (f.material as THREE.Material).dispose();
      });
      nitroFlameMeshes = [];
    };

    const resolveStaticImpact = (normalX: number, normalZ: number) => {
      collisionNormal.set(normalX, 0, normalZ).normalize();
      const normalSpeed = body.velocity.dot(collisionNormal);
      if (normalSpeed >= 0) return;

      const impactSpeed = -normalSpeed;
      collisionTangent.copy(body.velocity).addScaledVector(collisionNormal, -normalSpeed);
      const tangentRetention = THREE.MathUtils.clamp(0.82 - impactSpeed * 0.018, 0.38, 0.76);
      body.velocity
        .copy(collisionTangent.multiplyScalar(tangentRetention))
        .addScaledVector(collisionNormal, impactSpeed * 0.16);
      body.steer *= 0.55;
    };

    const resolveCircleImpact = (x: number, z: number, minDistance: number, movingVelocity?: THREE.Vector3) => {
      let dx = body.position.x - x;
      let dz = body.position.z - z;
      let distance = Math.hypot(dx, dz);
      if (distance >= minDistance) return;

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
        return;
      }

      collisionNormal.set(normalX, 0, normalZ);
      collisionTangent.copy(body.velocity).sub(movingVelocity);
      const relativeNormalSpeed = collisionTangent.dot(collisionNormal);
      if (relativeNormalSpeed >= 0) return;
      body.velocity.addScaledVector(collisionNormal, -relativeNormalSpeed * 0.62);
      body.velocity.multiplyScalar(0.86);
      body.steer *= 0.7;
    };

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const dt = Math.min(delta, 0.05);

      let throttleInput = keysRef.current.has('KeyW') || keysRef.current.has('ArrowUp') ? 1 : 0;
      let brakeInput = keysRef.current.has('KeyS') || keysRef.current.has('ArrowDown') ? 1 : 0;
      let steerInput = (keysRef.current.has('KeyA') || keysRef.current.has('ArrowLeft') ? 1 : 0) - (keysRef.current.has('KeyD') || keysRef.current.has('ArrowRight') ? 1 : 0);
      const handbrakeInput = keysRef.current.has('Space');

      const gamepads = navigator.getGamepads();
      forward.set(0, 0, 1).applyAxisAngle(upAxis, body.rotation);
      rightAxis.set(1, 0, 0).applyAxisAngle(upAxis, body.rotation);
      
      if (gamepads[gamepadRef.current]) {
        const gp = gamepads[gamepadRef.current];
        if (gp) {
          const axisY = gp.axes[1] || 0;
          const axisX = gp.axes[0] || 0;
          if (axisY < -0.15) throttleInput = Math.abs(axisY);
          if (axisY > 0.15) brakeInput = axisY;
          if (Math.abs(axisX) > 0.15) steerInput = -axisX;
        }
      }

      const onRoad = isPointOnTrack(body.position.x, body.position.z);
      const longitudinal = body.velocity.dot(forward);
      let nextLongitudinal = longitudinal;
      let lateral = body.velocity.dot(rightAxis);
      const isDrifting = onRoad && handbrakeInput && Math.abs(longitudinal) > 8 && Math.abs(steerInput) > 0.1;
      const canBoost = !handbrakeInput && throttleInput > 0 && longitudinal > 3 && nitroRef.current > 0 && (keysRef.current.has('ShiftLeft') || keysRef.current.has('ShiftRight'));

      const targetSteer = steerInput * maxSteer;
      body.steer += THREE.MathUtils.clamp(targetSteer - body.steer, -steeringRate * dt, steeringRate * dt);

      if (throttleInput > 0) {
        const engineForce = (canBoost ? nitroAcceleration : acceleration) * (handbrakeInput ? 0.25 : 1);
        const powerFalloff = 1 - Math.min(Math.max(nextLongitudinal, 0) / (canBoost ? nitroMaxSpeed : maxSpeed), 1) * 0.68;
        nextLongitudinal += engineForce * powerFalloff * throttleInput * dt;
      }
      if (brakeInput > 0) {
        if (nextLongitudinal > 0.8) nextLongitudinal = Math.max(0, nextLongitudinal - brakeForce * brakeInput * dt);
        else nextLongitudinal = Math.max(-reverseSpeed, nextLongitudinal - reverseAcceleration * brakeInput * dt);
      }
      if (handbrakeInput) {
        nextLongitudinal = Math.sign(nextLongitudinal) * Math.max(0, Math.abs(nextLongitudinal) - handbrakeForce * dt);
      }

      const rollingDrag = onRoad ? 0.32 : 2.4;
      if (throttleInput === 0 && brakeInput === 0) nextLongitudinal *= Math.exp(-rollingDrag * dt);
      else if (!onRoad) nextLongitudinal *= Math.exp(-1.2 * dt);
      body.velocity.copy(forward).multiplyScalar(nextLongitudinal).addScaledVector(rightAxis, lateral);

      const speedRatio = Math.min(Math.abs(nextLongitudinal) / 20, 1);
      if (Math.abs(nextLongitudinal) > 0.25) {
        body.rotation += body.steer * turnSpeed * (isDrifting ? 1.65 : 1) * speedRatio * Math.sign(nextLongitudinal) * dt;
      }

      forward.set(0, 0, 1).applyAxisAngle(upAxis, body.rotation);
      rightAxis.set(1, 0, 0).applyAxisAngle(upAxis, body.rotation);
      nextLongitudinal = body.velocity.dot(forward);
      lateral = body.velocity.dot(rightAxis);
      const tireGrip = isDrifting ? 1.35 : onRoad ? 13 : 4.2;
      lateral *= Math.exp(-tireGrip * dt);
      if (isDrifting) nextLongitudinal *= Math.exp(-0.42 * dt);
      const surfaceMaxSpeed = onRoad ? (canBoost ? nitroMaxSpeed : maxSpeed) : 18;
      nextLongitudinal = THREE.MathUtils.clamp(nextLongitudinal, -reverseSpeed, surfaceMaxSpeed);
      body.velocity.copy(forward).multiplyScalar(nextLongitudinal).addScaledVector(rightAxis, lateral);

      if (canBoost) {
        setNitro((n) => Math.max(0, n - 30 * dt));
      } else if (nitroRef.current < 100) {
        setNitro((n) => Math.min(100, n + 12 * dt));
      }

      body.position.addScaledVector(body.velocity, dt);
      body.position.y = 0;

      wheels.forEach((wheel) => {
        wheel.rotation.x += nextLongitudinal * dt * 1.75;
        if (wheel.userData.isFrontWheel) {
          wheel.rotation.y = THREE.MathUtils.lerp(wheel.rotation.y, body.steer * 0.58, 1 - Math.exp(-14 * dt));
        }
      });

      if (isDrifting && frameCount % 3 === 0) {
        [-0.78, 0.78].forEach((side) => {
          const particle = smokeParticles[smokeCursor++ % smokeParticles.length];
          smokeOffset.set(side, 0.24, -1.58).applyAxisAngle(upAxis, body.rotation);
          particle.position.copy(body.position).add(smokeOffset);
          particle.scale.setScalar(0.7);
          particle.userData.life = 0.75;
          particle.visible = true;
        });
      }
      smokeParticles.forEach((particle) => {
        if (particle.userData.life <= 0) return;
        particle.userData.life -= dt;
        particle.position.y += dt * 0.75;
        particle.scale.addScalar(dt * 1.6);
        (particle.material as THREE.MeshBasicMaterial).opacity = Math.max(0, particle.userData.life * 0.28);
        if (particle.userData.life <= 0) particle.visible = false;
      });

      buildings.forEach((b) => {
        const halfW = b.w / 2 + 1.15;
        const halfD = b.d / 2 + 1.15;
        const carX = body.position.x;
        const carZ = body.position.z;

        if (
          carX > b.x - halfW &&
          carX < b.x + halfW &&
          carZ > b.z - halfD &&
          carZ < b.z + halfD
        ) {
          const dx = carX - b.x;
          const dz = carZ - b.z;
          const overlapX = halfW - Math.abs(dx);
          const overlapZ = halfD - Math.abs(dz);

          if (overlapX < overlapZ) {
            const normalX = Math.sign(dx) || 1;
            body.position.x += (overlapX + 0.02) * normalX;
            resolveStaticImpact(normalX, 0);
          } else {
            const normalZ = Math.sign(dz) || 1;
            body.position.z += (overlapZ + 0.02) * normalZ;
            resolveStaticImpact(0, normalZ);
          }
        }
      });

      obstaclesRef.current.forEach((obstacle) => {
        resolveCircleImpact(obstacle.x, obstacle.z, obstacle.radius + 1.25);
      });

      remotePlayersRef.current.forEach((remote) => {
        obstacleVelocity
          .set(0, 0, remote.speed / 3.6)
          .applyAxisAngle(upAxis, remote.group.rotation.y);
        resolveCircleImpact(remote.group.position.x, remote.group.position.z, 3.2, obstacleVelocity);
      });

      if (Math.abs(body.position.x) > 160) {
        body.position.x = THREE.MathUtils.clamp(body.position.x, -160, 160);
        body.velocity.x *= -0.2;
      }
      if (Math.abs(body.position.z) > 160) {
        body.position.z = THREE.MathUtils.clamp(body.position.z, -160, 160);
        body.velocity.z *= -0.2;
      }

      car.position.copy(body.position);
      car.rotation.y = body.rotation;
      car.rotation.z = THREE.MathUtils.lerp(car.rotation.z, -body.steer * Math.min(Math.abs(nextLongitudinal) / 20, 1) * 0.12, 1 - Math.exp(-8 * dt));
      const accelerationPitch = THREE.MathUtils.clamp((nextLongitudinal - previousLongitudinal) / Math.max(dt, 0.001) / 80, -0.05, 0.05);
      car.rotation.x = THREE.MathUtils.lerp(car.rotation.x, accelerationPitch, 1 - Math.exp(-7 * dt));
      previousLongitudinal = nextLongitudinal;

      const now = Date.now();
      remotePlayersRef.current.forEach((remote, id) => {
        if (now - remote.lastUpdate > 6_000) {
          scene.remove(remote.group);
          remotePlayersRef.current.delete(id);
          setPlayerCount(remotePlayersRef.current.size + 1);
          return;
        }
        remote.group.position.lerp(remote.targetPosition, 1 - Math.exp(-10 * dt));
        const angleDelta = Math.atan2(
          Math.sin(remote.targetRotation - remote.group.rotation.y),
          Math.cos(remote.targetRotation - remote.group.rotation.y),
        );
        remote.group.rotation.y += angleDelta * (1 - Math.exp(-12 * dt));
        remote.group.children.forEach((child) => {
          if (child.userData.remoteWheel) child.rotation.x += (remote.speed / 3.6) * dt * 1.75;
        });
      });

      frameCount += 1;
      if (frameCount % 4 === 0) {
        const nextSpeed = Math.round(Math.abs(nextLongitudinal) * 3.6);
        if (nextSpeed !== lastSpeed) {
          lastSpeed = nextSpeed;
          setSpeed(nextSpeed);
        }
        const nextGear = nextLongitudinal < -0.5 ? 'R' : nextLongitudinal < 1 ? 'N' : String(Math.min(6, Math.max(1, Math.ceil(nextSpeed / 35))));
        if (nextGear !== lastGear) {
          lastGear = nextGear;
          setGear(nextGear);
        }
        const nextSurface = onRoad ? 'ASPHALT' : 'OFF ROAD';
        if (nextSurface !== lastSurface) {
          lastSurface = nextSurface;
          setSurface(nextSurface);
        }
        setMapPosition({ x: 50 + (body.position.x / 320) * 100, y: 50 + (body.position.z / 320) * 100, rotation: -THREE.MathUtils.radToDeg(body.rotation) });
        let nearest: BuildingData | null = null;
        let nearestDist = Infinity;
        buildings.forEach((b) => {
          if (!b.type) return;
          const dx = Math.max(Math.abs(body.position.x - b.x) - b.w / 2, 0);
          const dz = Math.max(Math.abs(body.position.z - b.z) - b.d / 2, 0);
          const dist = Math.hypot(dx, dz);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = b;
          }
        });
        if (nearestDist < 6 && nearest) {
          setNearbyBuilding(nearest as BuildingData);
        } else {
          setNearbyBuilding(null);
        }
      }

      if (canBoost && nitroFlameMeshes.length === 0) {
        createNitroFlame();
      } else if (!canBoost && nitroFlameMeshes.length > 0) {
        removeNitroFlames();
      }

      if (cameraRef.current) {
        const speedFactor = Math.min(Math.abs(nextLongitudinal) / 35, 1);
        cameraOffset.set(-body.steer * 1.4, 5.4 + speedFactor * 1.8, -10.5 - speedFactor * 3.5).applyAxisAngle(upAxis, body.rotation);
        targetCameraPos.copy(body.position).add(cameraOffset);
        cameraRef.current.position.lerp(targetCameraPos, 1 - Math.exp(-7 * dt));
        const cameraTarget = body.position.clone().addScaledVector(forward, 4 + speedFactor * 4);
        cameraRef.current.lookAt(cameraTarget.x, cameraTarget.y + 0.65, cameraTarget.z);
        cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, 64 + speedFactor * 10 + (canBoost ? 6 : 0), 1 - Math.exp(-5 * dt));
        cameraRef.current.updateProjectionMatrix();
      }

      rendererRef.current?.render(scene, cameraRef.current!);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      removeNitroFlames();
      smokeParticles.forEach((particle) => {
        scene.remove(particle);
        (particle.material as THREE.Material).dispose();
      });
      smokeGeometry.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !carBodyRef.current) return;

    const scene = sceneRef.current;
    let cancelled = false;
    let reconnectAllowed = true;
    let reconnectDelay = 1_000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let socket: WebSocket | null = null;
    const storedId = window.sessionStorage.getItem('world-player-id');
    const clientId = storedId || window.crypto.randomUUID().replaceAll('-', '');
    window.sessionStorage.setItem('world-player-id', clientId);
    const palette = [0xff5a36, 0x65e7ff, 0xd9ff48, 0xff4fa3, 0xffd166, 0x9d7dff];
    const color = palette[clientId.charCodeAt(0) % palette.length];
    const name = `Driver ${clientId.slice(0, 4).toUpperCase()}`;

    const removeRemote = (id: string) => {
      const remote = remotePlayersRef.current.get(id);
      if (!remote) return;
      scene.remove(remote.group);
      remote.group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      });
      remotePlayersRef.current.delete(id);
    };

    const clearRemotes = () => {
      Array.from(remotePlayersRef.current.keys()).forEach(removeRemote);
      setPlayerCount(1);
    };

    const upsertRemote = (player: WorldPlayerState) => {
      if (player.id === clientId) return;
      let remote = remotePlayersRef.current.get(player.id);
      if (!remote) {
        const group = createRemoteCar(player.color);
        group.position.set(player.x, 0, player.z);
        group.rotation.y = player.rotation;
        scene.add(group);
        remote = {
          group,
          targetPosition: new THREE.Vector3(player.x, 0, player.z),
          targetRotation: player.rotation,
          speed: player.speed,
          lastUpdate: Date.now(),
        };
        remotePlayersRef.current.set(player.id, remote);
      } else {
        remote.targetPosition.set(player.x, 0, player.z);
        remote.targetRotation = player.rotation;
        remote.speed = player.speed;
        remote.lastUpdate = Date.now();
      }
      setPlayerCount(Math.min(WORLD_MAX_PLAYERS, remotePlayersRef.current.size + 1));
    };

    const sendJoin = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN || !carBodyRef.current) return;
      const body = carBodyRef.current;
      socket.send(JSON.stringify({
        type: 'join',
        player: {
          id: clientId,
          name,
          color,
          x: body.position.x,
          z: body.position.z,
          rotation: body.rotation,
          speed: body.velocity.length() * 3.6,
          steer: body.steer,
        },
      }));
    };

    const connect = () => {
      if (cancelled || !reconnectAllowed) return;
      setMultiplayerStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      socket = new WebSocket(`${protocol}://${window.location.host}/api/world/ws/`);
      multiplayerSocketRef.current = socket;

      socket.addEventListener('open', () => {
        reconnectDelay = 1_000;
        sendJoin();
      });
      socket.addEventListener('message', (message) => {
        let event: WorldServerEvent;
        try { event = JSON.parse(String(message.data)) as WorldServerEvent; } catch { return; }
        if (event.type === 'snapshot') {
          clearRemotes();
          event.players.forEach(upsertRemote);
          setPlayerCount(Math.max(1, Math.min(event.maxPlayers, event.players.length)));
          setMultiplayerStatus('online');
        } else if (event.type === 'player') {
          upsertRemote(event.player);
        } else if (event.type === 'leave') {
          removeRemote(event.id);
          setPlayerCount(remotePlayersRef.current.size + 1);
        } else if (event.type === 'room_full') {
          reconnectAllowed = false;
          setMultiplayerStatus('full');
        } else if (event.type === 'unavailable') {
          reconnectAllowed = false;
          setMultiplayerStatus('solo');
        }
      });
      socket.addEventListener('close', () => {
        if (cancelled || !reconnectAllowed) return;
        setMultiplayerStatus('solo');
        clearRemotes();
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      });
      socket.addEventListener('error', () => socket?.close());
    };

    const stateTimer = window.setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN || !carBodyRef.current) return;
      const body = carBodyRef.current;
      socket.send(JSON.stringify({
        type: 'state',
        player: {
          id: clientId,
          x: body.position.x,
          z: body.position.z,
          rotation: body.rotation,
          speed: body.velocity.length() * 3.6,
          steer: body.steer,
        },
      }));
    }, WORLD_STATE_INTERVAL_MS);

    connect();
    return () => {
      cancelled = true;
      reconnectAllowed = false;
      window.clearInterval(stateTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      multiplayerSocketRef.current = null;
      clearRemotes();
    };
  }, []);

  const resetCar = useCallback(() => {
    if (carBodyRef.current) {
      carBodyRef.current.position.set(TRACK_SPAWN.x, 0, TRACK_SPAWN.z);
      carBodyRef.current.rotation = TRACK_SPAWN.rotation;
      carBodyRef.current.velocity.set(0, 0, 0);
      carBodyRef.current.steer = 0;
      if (carRef.current) {
        carRef.current.position.set(TRACK_SPAWN.x, 0, TRACK_SPAWN.z);
        carRef.current.rotation.y = TRACK_SPAWN.rotation;
      }
    }
  }, []);

  const toggleBuilding = useCallback(() => {
    if (nearbyBuildingRef.current && !activeBuildingRef.current) {
      setActiveBuilding(nearbyBuildingRef.current);
    } else if (activeBuildingRef.current) {
      setActiveBuilding(null);
    }
  }, []);

  return (
    <div className="world-shell">
      <div ref={containerRef} className="world-canvas" />

      {loading && (
        <div className="world-loading">
          <div className="world-loading-mark">SB</div>
          <p>LOADING WORLD...</p>
        </div>
      )}

      <div className="world-toolbar">
        {onBack && (
          <button onClick={onBack} className="world-button world-button-back">
            <span>←</span> Exit field
          </button>
        )}
        <button onClick={() => setShowControls(!showControls)} className={`world-button${showControls ? ' is-active' : ''}`}>
          <span>01</span> Controls
        </button>
        <button onClick={() => setShowMap(!showMap)} className={`world-button${showMap ? ' is-active' : ''}`}>
          <span>02</span> Map
        </button>
      </div>

      <div className="world-title-lockup">
        <span>SB // INTERACTIVE DISTRICT</span>
        <strong>NIGHT DRIVE</strong>
      </div>

      <div className="world-mission">
        <span className="world-mission-kicker">Free roam</span>
        <strong>Drive. Drift. Explore.</strong>
        <small>Highlighted buildings are interactive portfolio stops</small>
      </div>

      {showControls && (
        <div className="world-panel world-controls-panel">
          <div className="world-panel-heading"><span>Manual</span><strong>How to drive</strong></div>
          <div className="world-control-list">
            <div><strong>W / ↑</strong><span>Accelerate</span></div>
            <div><strong>S / ↓</strong><span>Brake / Reverse</span></div>
            <div><strong>Space</strong><span>Handbrake drift</span></div>
            <div><strong>Shift</strong><span>Nitro boost</span></div>
            <div><strong>A / D</strong><span>Steer</span></div>
            <div><strong>R</strong><span>Reset car</span></div>
            <div><strong>E</strong><span>Inspect highlighted stop</span></div>
            <div><strong>Left stick</strong><span>Drive</span></div>
          </div>
          <button onClick={() => setShowControls(false)} className="world-panel-close">Close</button>
        </div>
      )}

      {showMap && (
        <div className="world-panel world-map-panel">
          <div className="world-panel-heading"><span>Navigation</span><strong>Circuit map</strong></div>
          <div className="world-map">
            <svg className="world-map-track" viewBox="0 0 100 100" aria-hidden="true">
              <polyline className="world-map-track-outline" points={`${TRACK_POINTS.map(([x, z]) => `${50 + (x / 320) * 100},${50 + (z / 320) * 100}`).join(' ')} 50,${50 + (TRACK_POINTS[0][1] / 320) * 100}`} />
              <polyline className="world-map-track-road" points={`${TRACK_POINTS.map(([x, z]) => `${50 + (x / 320) * 100},${50 + (z / 320) * 100}`).join(' ')} 50,${50 + (TRACK_POINTS[0][1] / 320) * 100}`} />
              <polyline className="world-map-track-line" points={`${TRACK_POINTS.map(([x, z]) => `${50 + (x / 320) * 100},${50 + (z / 320) * 100}`).join(' ')} 50,${50 + (TRACK_POINTS[0][1] / 320) * 100}`} />
            </svg>
            <div className="world-map-player" style={{ left: `${mapPosition.x}%`, top: `${mapPosition.y}%`, transform: `translate(-50%, -50%) rotate(${mapPosition.rotation}deg)` }} />
            {buildingsRef.current.map((b, i) => (
              <div key={i} className={`world-map-building${b.type ? ` world-map-building-${b.type}` : ''}`} style={{ left: `${50 + (b.x / 320) * 100}%`, top: `${50 + (b.z / 320) * 100}%` }} />
            ))}
          </div>
          <button onClick={() => setShowMap(false)} className="world-panel-close">Close map</button>
        </div>
      )}

      {activeBuilding && (
        <div className="world-panel world-building-panel">
          <div className="world-panel-heading"><span>Location</span><strong>{activeBuilding.label}</strong></div>
          <p className="world-building-desc">{activeBuilding.description}</p>
          {activeBuilding.href && <a href={activeBuilding.href} className="world-panel-link">Open portfolio section <span>↗</span></a>}
          <button onClick={() => setActiveBuilding(null)} className="world-panel-close">Close</button>
        </div>
      )}

      {nearbyBuilding && !activeBuilding && (
        <div className="world-building-prompt">
          Press <strong>E</strong> to inspect {nearbyBuilding.label}
        </div>
      )}

      <div className="world-hud">
        <div className="world-gear" aria-label={`Gear ${gear}`}>
          <span>GEAR</span>
          <strong>{gear}</strong>
        </div>
        <div className="world-hud-divider" />
        <div className="world-hud-left">
          <span className="world-hud-label">SPEED</span>
          <div className="world-speedometer">
            <span className="world-speed-value">{String(speed).padStart(3, '0')}</span>
            <span className="world-speed-unit">km/h</span>
          </div>
        </div>
        <div className="world-hud-divider" />
        <div className="world-hud-center">
          <div className="world-nitro-container">
            <div className="world-nitro-label">NITRO</div>
            <div className="world-nitro-bar">
              <div className="world-nitro-fill" style={{ width: `${nitro}%` }} />
            </div>
          </div>
        </div>
        <div className="world-hud-divider" />
        <div className="world-hud-right">
          <span className="world-hud-label">LOBBY</span>
          <span className={`world-drive-mode is-${multiplayerStatus}`}>
            {multiplayerStatus === 'online' ? `${playerCount}/${WORLD_MAX_PLAYERS}` : multiplayerStatus === 'full' ? 'FULL' : multiplayerStatus === 'connecting' ? 'SYNC' : 'SOLO'}
          </span>
        </div>
      </div>

      <div className={`world-surface${surface === 'OFF ROAD' ? ' is-warning' : ''}`}>
        <span className="world-surface-dot" />
        <span>{surface}</span>
      </div>

      <div className="world-mobile-controls">
        <div className="world-mobile-left">
          <div className="world-dpad">
            <div />
            <TouchButton label="▲" onTouchStart={() => keysRef.current.add('KeyW')} onTouchEnd={() => keysRef.current.delete('KeyW')} />
            <div />
            <TouchButton label="◀" onTouchStart={() => keysRef.current.add('KeyA')} onTouchEnd={() => keysRef.current.delete('KeyA')} />
            <TouchButton label="▼" onTouchStart={() => keysRef.current.add('KeyS')} onTouchEnd={() => keysRef.current.delete('KeyS')} />
            <TouchButton label="▶" onTouchStart={() => keysRef.current.add('KeyD')} onTouchEnd={() => keysRef.current.delete('KeyD')} />
          </div>
        </div>
        <div className="world-mobile-right">
          <div className="world-mobile-actions">
            <TouchButton label="N2O" className="world-nitro-btn" onTouchStart={() => keysRef.current.add('ShiftLeft')} onTouchEnd={() => keysRef.current.delete('ShiftLeft')} />
            <TouchButton label="DRIFT" className="world-drift-btn" onTouchStart={() => keysRef.current.add('Space')} onTouchEnd={() => keysRef.current.delete('Space')} />
            <TouchButton label="RST" className="world-reset-btn" onTouchStart={resetCar} onTouchEnd={() => {}} />
            <TouchButton label="E" className="world-enter-btn" onTouchStart={toggleBuilding} onTouchEnd={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TouchButton({ label, onTouchStart, onTouchEnd, className }: { label: string; onTouchStart: () => void; onTouchEnd: () => void; className?: string }) {
  return (
    <div
      className={`world-touch-button${className ? ` ${className}` : ''}`}
      onTouchStart={(e) => { e.preventDefault(); onTouchStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); onTouchEnd(); }}
      onTouchCancel={onTouchEnd}
    >
      {label}
    </div>
  );
}
