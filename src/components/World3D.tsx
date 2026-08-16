'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  WORLD_MAX_PLAYERS,
  WORLD_PLAYER_COLORS,
  WORLD_STATE_INTERVAL_MS,
  WORLD_TOTAL_LAPS,
  type WorldPlayerState,
  type WorldRaceState,
  type WorldServerEvent,
} from '@/lib/world-protocol';
import { applyCarColor, findCarWheels } from './world/car/carModel';
import { createPlayerCar } from './world/car/playerCar';
import { createRemoteCar } from './world/car/remoteCar';
import { createEngineAudio } from './world/audio/engine';
import { readDrivingInput } from './world/controls/input';
import { addBuildings } from './world/environment/buildings';
import { createWorldScene } from './world/environment/scene';
import { addTreeObstacles } from './world/obstacles/trees';
import { createNitroEffect, removeNitroEffect } from './world/effects/nitro';
import { VEHICLE_PHYSICS } from './world/physics/config';
import { createCollisionResolver } from './world/physics/collisions';
import { formatRaceTime, getGridSpawn, normalizeDriverName } from './world/race/utils';
import { createTrack } from './world/track/createTrack';
import {
  DIRT_SEGMENT_END,
  DIRT_SEGMENT_START,
  RACE_CHECKPOINT_INDICES,
  TRACK_HEIGHTS,
  TRACK_POINTS,
  TRACK_SPAWN,
  TRACK_WIDTH,
  TRACK_WORLD_SIZE,
  nearestTrackPoint,
} from './world/track/layout';
import type {
  BuildingData,
  CarBody,
  CircularObstacle,
  GuardRailCollider,
  RaceProgress,
  RemotePlayerVisual,
} from './world/types';
import { TouchButton } from './world/ui/TouchButton';

interface World3DProps {
  onBack?: () => void;
}

interface WorldGameProps extends World3DProps {
  playerName: string;
}

export default function World3D({ onBack }: World3DProps) {
  const [draftName, setDraftName] = useState('');
  const [playerName, setPlayerName] = useState('');

  if (!playerName) {
    return (
      <div className="world-name-gate">
        {onBack && <button type="button" onClick={onBack} className="world-name-exit">← Exit</button>}
        <form
          className="world-name-card"
          onSubmit={(event) => {
            event.preventDefault();
            const normalizedName = normalizeDriverName(draftName);
            if (normalizedName.length >= 2) setPlayerName(normalizedName);
          }}
        >
          <span className="world-name-kicker">Multiplayer grid</span>
          <h1>Choose your driver name</h1>
          <p>This appears above your car for every racer.</p>
          <label htmlFor="world-driver-name">Driver name</label>
          <input
            id="world-driver-name"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            minLength={2}
            maxLength={18}
            autoComplete="nickname"
            autoFocus
            placeholder="Enter your name"
          />
          <button type="submit" disabled={normalizeDriverName(draftName).length < 2}>Enter circuit</button>
        </form>
      </div>
    );
  }

  return <WorldGame onBack={onBack} playerName={playerName} />;
}

function WorldGame({ onBack, playerName }: WorldGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carRef = useRef<THREE.Group | null>(null);
  const remotePlayersRef = useRef<Map<string, RemotePlayerVisual>>(new Map());
  const multiplayerSocketRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef('');
  const localPaintMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const localNameTagRef = useRef<THREE.Sprite | null>(null);
  const raceStateRef = useRef<WorldRaceState>({ id: 'lobby', phase: 'lobby', startAt: 0, participants: [], totalLaps: WORLD_TOTAL_LAPS, results: [], leaderboard: [] });
  const restoredRaceIdRef = useRef('');
  const raceProgressRef = useRef<RaceProgress>({ lap: 1, checkpoint: 0, finishedAt: 0, bestLap: 0, lapStartedAt: 0 });
  const lastCheckpointRef = useRef(0);
  const spectatorRef = useRef(false);
  const roomSpectatorRef = useRef(false);
  const readyRef = useRef<boolean | null>(null);
  const carBodyRef = useRef<CarBody | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gamepadRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState('N');
  const [surface, setSurface] = useState<'ASPHALT' | 'DIRT' | 'OFF ROAD'>('ASPHALT');
  const [mapPosition, setMapPosition] = useState({
    x: 50 + (TRACK_SPAWN.x / TRACK_WORLD_SIZE) * 100,
    y: 50 + (TRACK_SPAWN.z / TRACK_WORLD_SIZE) * 100,
    rotation: -THREE.MathUtils.radToDeg(TRACK_SPAWN.rotation),
  });
  const [multiplayerStatus, setMultiplayerStatus] = useState<'connecting' | 'online' | 'solo' | 'full' | 'spectating'>('connecting');
  const [playerCount, setPlayerCount] = useState(1);
  const playerColorRef = useRef<number>(WORLD_PLAYER_COLORS[Math.floor(Math.random() * WORLD_PLAYER_COLORS.length)]);
  const [playerColor, setPlayerColor] = useState<number>(playerColorRef.current);
  const [raceState, setRaceState] = useState<WorldRaceState>(raceStateRef.current);
  const [raceProgress, setRaceProgress] = useState<RaceProgress>(raceProgressRef.current);
  const [racePosition, setRacePosition] = useState(1);
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [lobbyDrivers, setLobbyDrivers] = useState<Array<{ id: string; name: string; color: number; ready: boolean | null }>>([]);
  const [wrongWay, setWrongWay] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [opponents, setOpponents] = useState<Array<{ id: string; name: string; color: number; x: number; z: number; lap: number; checkpoint: number; finishedAt: number; bestLap: number }>>([]);
  const [nearbyBuilding, setNearbyBuilding] = useState<BuildingData | null>(null);
  const [activeBuilding, setActiveBuilding] = useState<BuildingData | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const buildingsRef = useRef<BuildingData[]>([]);
  const obstaclesRef = useRef<CircularObstacle[]>([]);
  const guardRailCollidersRef = useRef<GuardRailCollider[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const activeBuildingRef = useRef(activeBuilding);
  activeBuildingRef.current = activeBuilding;
  const nearbyBuildingRef = useRef(nearbyBuilding);
  nearbyBuildingRef.current = nearbyBuilding;

  const initScene = useCallback(() => {
    console.log('initScene started');
    if (!containerRef.current) return;

    const { scene, camera, renderer } = createWorldScene(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    sceneRef.current = scene;
    cameraRef.current = camera;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const { guardRails } = createTrack(scene);
    guardRailCollidersRef.current = guardRails;

    buildingsRef.current = addBuildings(scene);
    obstaclesRef.current = addTreeObstacles(scene);

    const { group: car, paintMaterial, nameTag } = createPlayerCar(playerColorRef.current, playerName);
    localPaintMaterialRef.current = paintMaterial;
    localNameTagRef.current = nameTag;

    car.position.set(TRACK_SPAWN.x, TRACK_SPAWN.y, TRACK_SPAWN.z);
    car.rotation.y = TRACK_SPAWN.rotation;
    scene.add(car);
    carRef.current = car;
    carBodyRef.current = {
      velocity: new THREE.Vector3(0, 0, 0),
      position: new THREE.Vector3(TRACK_SPAWN.x, TRACK_SPAWN.y, TRACK_SPAWN.z),
      rotation: TRACK_SPAWN.rotation,
      trackIndex: 0,
      steer: 0,
      onTrack: true,
    };

    clockRef.current = new THREE.Clock();
    console.log('initScene complete, setting loading false');
    setLoading(false);
  }, [playerName]);

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
          const checkpointIndex = RACE_CHECKPOINT_INDICES[lastCheckpointRef.current] || 0;
          const [x, z] = TRACK_POINTS[checkpointIndex];
          const [nextX, nextZ] = TRACK_POINTS[(checkpointIndex + 1) % TRACK_POINTS.length];
          const rotation = Math.atan2(nextX - x, nextZ - z);
          carBodyRef.current.position.set(x, TRACK_HEIGHTS[checkpointIndex], z);
          carBodyRef.current.rotation = rotation;
          carBodyRef.current.velocity.set(0, 0, 0);
          carBodyRef.current.steer = 0;
          if (carRef.current) {
            carRef.current.position.set(x, TRACK_HEIGHTS[checkpointIndex], z);
            carRef.current.rotation.y = rotation;
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

    const {
      maxSpeed, nitroMaxSpeed, reverseSpeed, reverseAcceleration, acceleration,
      nitroAcceleration, brakeForce, handbrakeForce, turnSpeed, steeringRate, maxSteer,
    } = VEHICLE_PHYSICS;

    const buildings = buildingsRef.current;

    const forward = new THREE.Vector3();
    const rightAxis = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);
    const cameraOffset = new THREE.Vector3();
    const targetCameraPos = new THREE.Vector3();
    let frameCount = 0;
    let lastSpeed = -1;
    let lastGear = 'N';
    let lastSurface: 'ASPHALT' | 'DIRT' | 'OFF ROAD' = 'ASPHALT';
    let previousLongitudinal = 0;
    let activeRaceId = raceStateRef.current.id;
    let checkpointArmed = true;
    let lastCountdown = '';
    let nitroFlameMeshes: THREE.Mesh[] = [];
    let smokeCursor = 0;
    let skidCursor = 0;
    let sparkCursor = 0;
    let cameraShake = 0;
    const engineAudio = createEngineAudio();
    const smokeOffset = new THREE.Vector3();
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
    const skidGeometry = new THREE.PlaneGeometry(0.28, 1.25);
    const skidMaterial = new THREE.MeshBasicMaterial({ color: 0x08090d, transparent: true, opacity: 0.5, depthWrite: false });
    const skidMarks = Array.from({ length: 80 }, () => {
      const mark = new THREE.Mesh(skidGeometry, skidMaterial);
      mark.rotation.x = -Math.PI / 2;
      mark.visible = false;
      scene.add(mark);
      return mark;
    });
    const sparkGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.32);
    const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const sparks = Array.from({ length: 24 }, () => {
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
      spark.visible = false;
      spark.userData.life = 0;
      spark.userData.velocity = new THREE.Vector3();
      scene.add(spark);
      return spark;
    });

    const startAudio = () => engineAudio.start();
    window.addEventListener('keydown', startAudio, { once: true });
    window.addEventListener('pointerdown', startAudio, { once: true });

    const triggerImpactFeedback = (strength: number) => {
      cameraShake = Math.min(1.2, cameraShake + strength / 24);
      for (let index = 0; index < Math.min(8, Math.ceil(strength / 3)); index += 1) {
        const spark = sparks[sparkCursor++ % sparks.length];
        spark.position.copy(body.position).setY(0.55);
        (spark.userData.velocity as THREE.Vector3).set((Math.random() - 0.5) * strength, 2 + Math.random() * 3, (Math.random() - 0.5) * strength);
        spark.userData.life = 0.35 + Math.random() * 0.3;
        spark.visible = true;
      }
    };

    const { normal: collisionNormal, resolveStaticImpact, resolveCircleImpact } = createCollisionResolver(
      body,
      forward,
      triggerImpactFeedback,
    );

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const dt = Math.min(delta, 0.05);
      const currentRace = raceStateRef.current;
      const nowMs = Date.now();
      const isParticipant = currentRace.participants.includes(clientIdRef.current);
      const isRaceLocked = spectatorRef.current
        || (currentRace.phase === 'countdown' && isParticipant && nowMs < currentRace.startAt)
        || raceProgressRef.current.finishedAt > 0;

      if (currentRace.id !== activeRaceId && isParticipant) {
        activeRaceId = currentRace.id;
        checkpointArmed = true;
        if (restoredRaceIdRef.current === currentRace.id) {
          restoredRaceIdRef.current = '';
        } else {
          const progress = { lap: 1, checkpoint: 0, finishedAt: 0, bestLap: 0, lapStartedAt: currentRace.startAt };
          raceProgressRef.current = progress;
          lastCheckpointRef.current = 0;
          setRaceProgress(progress);
          const gridSpawn = getGridSpawn(Math.max(0, currentRace.participants.indexOf(clientIdRef.current)));
          body.position.set(gridSpawn.x, gridSpawn.y, gridSpawn.z);
          body.rotation = gridSpawn.rotation;
          body.velocity.set(0, 0, 0);
          body.steer = 0;
        }
      }

      let nextCountdown = '';
      if (currentRace.phase === 'countdown' && isParticipant && nowMs < currentRace.startAt) {
        nextCountdown = String(Math.max(1, Math.ceil((currentRace.startAt - nowMs) / 1000)));
      } else if (currentRace.phase === 'countdown' && isParticipant && nowMs - currentRace.startAt < 900) {
        nextCountdown = 'GO!';
      }
      if (nextCountdown !== lastCountdown) {
        lastCountdown = nextCountdown;
        setCountdown(nextCountdown);
      }

      const input = readDrivingInput(keysRef.current, gamepadRef.current);
      let throttleInput = input.throttle;
      let brakeInput = input.brake;
      let steerInput = input.steer;
      const handbrakeInput = input.handbrake;

      if (isRaceLocked) {
        throttleInput = 0;
        brakeInput = 0;
        steerInput = 0;
        body.velocity.multiplyScalar(Math.exp(-12 * dt));
      }

      forward.set(0, 0, 1).applyAxisAngle(upAxis, body.rotation);
      rightAxis.set(1, 0, 0).applyAxisAngle(upAxis, body.rotation);

      const trackContact = nearestTrackPoint(body.position.x, body.position.z, body.position.y, body.trackIndex);
      body.trackIndex = trackContact.index;
      const trackHeightError = Math.abs(body.position.y - trackContact.height);
      const onRoad = trackContact.distance <= TRACK_WIDTH / 2;
      const canFollowTrackHeight = trackContact.height <= 3.5 || trackHeightError <= 3.5;
      body.onTrack = onRoad;
      const onDirt = onRoad && trackContact.index >= DIRT_SEGMENT_START && trackContact.index <= DIRT_SEGMENT_END;
      const longitudinal = body.velocity.dot(forward);
      let nextLongitudinal = longitudinal;
      let lateral = body.velocity.dot(rightAxis);
      const isDrifting = onRoad && handbrakeInput && Math.abs(longitudinal) > 8 && Math.abs(steerInput) > 0.1;
      const canBoost = !handbrakeInput && throttleInput > 0 && longitudinal > 3 && input.nitro;

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

      const rollingDrag = onDirt ? 0.72 : onRoad ? 0.32 : 2.4;
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
      const tireGrip = isDrifting ? 1.35 : onDirt ? 6.2 : onRoad ? 13 : 4.2;
      lateral *= Math.exp(-tireGrip * dt);
      if (isDrifting) nextLongitudinal *= Math.exp(-0.42 * dt);
      const surfaceMaxSpeed = onDirt ? 35 : onRoad ? (canBoost ? nitroMaxSpeed : maxSpeed) : 18;
      nextLongitudinal = THREE.MathUtils.clamp(nextLongitudinal, -reverseSpeed, surfaceMaxSpeed);
      body.velocity.copy(forward).multiplyScalar(nextLongitudinal).addScaledVector(rightAxis, lateral);

      body.position.addScaledVector(body.velocity, dt);
      body.position.y = THREE.MathUtils.lerp(
        body.position.y,
        onRoad && canFollowTrackHeight ? trackContact.height : 0,
        1 - Math.exp(-10 * dt),
      );

      if (!spectatorRef.current) {
        const targetCheckpoint = (lastCheckpointRef.current + 1) % RACE_CHECKPOINT_INDICES.length;
        const [checkpointX, checkpointZ] = TRACK_POINTS[RACE_CHECKPOINT_INDICES[targetCheckpoint]];
        const checkpointDistance = Math.hypot(body.position.x - checkpointX, body.position.z - checkpointZ);
        if (checkpointDistance > TRACK_WIDTH * 1.35) checkpointArmed = true;
        if (checkpointArmed && checkpointDistance < TRACK_WIDTH * 0.95) {
          checkpointArmed = false;
          lastCheckpointRef.current = targetCheckpoint;
        }
      }

      if (currentRace.phase === 'countdown' && isParticipant && nowMs >= currentRace.startAt && raceProgressRef.current.finishedAt === 0) {
        const progress = raceProgressRef.current;
        const targetCheckpoint = (progress.checkpoint + 1) % RACE_CHECKPOINT_INDICES.length;
        if (lastCheckpointRef.current === targetCheckpoint) {
          const updated = { ...progress, checkpoint: targetCheckpoint };
          if (targetCheckpoint === 0) {
            const lapDuration = nowMs - progress.lapStartedAt;
            updated.bestLap = progress.bestLap === 0 ? lapDuration : Math.min(progress.bestLap, lapDuration);
            if (progress.lap >= currentRace.totalLaps) {
              updated.finishedAt = nowMs - currentRace.startAt;
            } else {
              updated.lap = progress.lap + 1;
              updated.lapStartedAt = nowMs;
            }
          }
          raceProgressRef.current = updated;
          setRaceProgress(updated);
        }
      }

      const wheels = findCarWheels(car);
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
      if (isDrifting && frameCount % 2 === 0) {
        [-0.78, 0.78].forEach((side) => {
          const mark = skidMarks[skidCursor++ % skidMarks.length];
          smokeOffset.set(side, 0.17, -1.58).applyAxisAngle(upAxis, body.rotation);
          mark.position.copy(body.position).add(smokeOffset);
          mark.rotation.z = -body.rotation;
          mark.visible = true;
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
      sparks.forEach((spark) => {
        if (spark.userData.life <= 0) return;
        spark.userData.life -= dt;
        const velocity = spark.userData.velocity as THREE.Vector3;
        velocity.y -= 9.8 * dt;
        spark.position.addScaledVector(velocity, dt);
        spark.rotation.x += dt * 12;
        if (spark.position.y < 0.12 || spark.userData.life <= 0) spark.visible = false;
      });

      engineAudio.update(nextLongitudinal, maxSpeed, isRaceLocked);

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

      guardRailCollidersRef.current.forEach((rail) => {
        if (!rail.active) {
          if (Date.now() >= rail.regenerateAt) {
            rail.active = true;
            rail.group.visible = true;
          }
          return;
        }
        if (Math.abs(body.position.y - rail.height) > 2.5) return;
        const dx = rail.bx - rail.ax;
        const dz = rail.bz - rail.az;
        const lengthSquared = dx * dx + dz * dz;
        const t = THREE.MathUtils.clamp(((body.position.x - rail.ax) * dx + (body.position.z - rail.az) * dz) / lengthSquared, 0, 1);
        const closestX = rail.ax + dx * t;
        const closestZ = rail.az + dz * t;
        if (Math.hypot(body.position.x - closestX, body.position.z - closestZ) < 1.55) {
          const impactSpeed = -body.velocity.dot(collisionNormal.set(rail.inwardX, 0, rail.inwardZ));
          if (impactSpeed > 70 / 3.6) {
            triggerImpactFeedback(impactSpeed);
            rail.active = false;
            rail.group.visible = false;
            rail.regenerateAt = Date.now() + 7_500;
            body.velocity.multiplyScalar(0.72);
            body.steer *= 0.72;
            const socket = multiplayerSocketRef.current;
            if (socket?.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'rail_break', railId: rail.id }));
            }
            return;
          }
          body.position.x = closestX + rail.inwardX * 1.57;
          body.position.z = closestZ + rail.inwardZ * 1.57;
          resolveStaticImpact(rail.inwardX, rail.inwardZ);
        }
      });

      remotePlayersRef.current.forEach((remote, id) => {
        if (Math.abs(remote.group.position.y - body.position.y) > 3) return;
        obstacleVelocity
          .set(0, 0, remote.speed / 3.6)
          .applyAxisAngle(upAxis, remote.group.rotation.y);
        const impact = resolveCircleImpact(remote.group.position.x, remote.group.position.z, 3.2, obstacleVelocity);
        const socket = multiplayerSocketRef.current;
        if (impact && impact.impactSpeed > 1.2 && clientIdRef.current < id && socket?.readyState === WebSocket.OPEN) {
          const transfer = Math.min(20, impact.impactSpeed * 0.58);
          socket.send(JSON.stringify({
            type: 'collision',
            targetId: id,
            impulseX: -impact.normalX * transfer,
            impulseZ: -impact.normalZ * transfer,
          }));
        }
      });

      if (Math.abs(body.position.x) > 350) {
        body.position.x = THREE.MathUtils.clamp(body.position.x, -350, 350);
        body.velocity.x *= -0.2;
      }
      if (Math.abs(body.position.z) > 350) {
        body.position.z = THREE.MathUtils.clamp(body.position.z, -350, 350);
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
        const nextSurface = onDirt ? 'DIRT' : onRoad ? 'ASPHALT' : 'OFF ROAD';
        if (nextSurface !== lastSurface) {
          lastSurface = nextSurface;
          setSurface(nextSurface);
        }
        let nearestSegment = 0;
        let nearestTrackDistance = Infinity;
        TRACK_POINTS.forEach(([ax, az], index) => {
          const [bx, bz] = TRACK_POINTS[(index + 1) % TRACK_POINTS.length];
          const dx = bx - ax;
          const dz = bz - az;
          const lengthSquared = dx * dx + dz * dz;
          const t = THREE.MathUtils.clamp(((body.position.x - ax) * dx + (body.position.z - az) * dz) / lengthSquared, 0, 1);
          const distance = Math.hypot(body.position.x - (ax + dx * t), body.position.z - (az + dz * t));
          if (distance < nearestTrackDistance) {
            nearestTrackDistance = distance;
            nearestSegment = index;
          }
        });
        const [segmentAx, segmentAz] = TRACK_POINTS[nearestSegment];
        const [segmentBx, segmentBz] = TRACK_POINTS[(nearestSegment + 1) % TRACK_POINTS.length];
        const segmentLength = Math.hypot(segmentBx - segmentAx, segmentBz - segmentAz);
        const travelSpeed = Math.hypot(body.velocity.x, body.velocity.z) || 1;
        setWrongWay(onRoad && Math.abs(nextLongitudinal) > 4
          && (body.velocity.x / travelSpeed) * ((segmentBx - segmentAx) / segmentLength)
            + (body.velocity.z / travelSpeed) * ((segmentBz - segmentAz) / segmentLength) < -0.35);

        const localProgress = raceProgressRef.current;
        const localScore = localProgress.finishedAt > 0
          ? 1_000_000 - localProgress.finishedAt
          : localProgress.lap * 100 + localProgress.checkpoint;
        let position = 1;
        remotePlayersRef.current.forEach((remote) => {
          const remoteScore = remote.finishedAt > 0
            ? 1_000_000 - remote.finishedAt
            : remote.lap * 100 + remote.checkpoint;
          if (remoteScore > localScore) position += 1;
        });
        setRacePosition(position);
        setMapPosition({ x: 50 + (body.position.x / TRACK_WORLD_SIZE) * 100, y: 50 + (body.position.z / TRACK_WORLD_SIZE) * 100, rotation: -THREE.MathUtils.radToDeg(body.rotation) });
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
        nitroFlameMeshes = createNitroEffect(car);
      } else if (!canBoost && nitroFlameMeshes.length > 0) {
        removeNitroEffect(car, nitroFlameMeshes);
      }

      if (cameraRef.current) {
        const spectated = spectatorRef.current || raceProgressRef.current.finishedAt > 0
          ? remotePlayersRef.current.values().next().value as RemotePlayerVisual | undefined
          : undefined;
        if (spectated) {
          forward.set(0, 0, 1).applyAxisAngle(upAxis, spectated.group.rotation.y);
          cameraOffset.set(0, 6.5, -12).applyAxisAngle(upAxis, spectated.group.rotation.y);
          targetCameraPos.copy(spectated.group.position).add(cameraOffset);
          cameraRef.current.position.lerp(targetCameraPos, 1 - Math.exp(-6 * dt));
          cameraShake *= Math.exp(-9 * dt);
          cameraRef.current.position.x += (Math.random() - 0.5) * cameraShake;
          cameraRef.current.position.y += (Math.random() - 0.5) * cameraShake;
          cameraRef.current.lookAt(spectated.group.position.x, 1.1, spectated.group.position.z);
          rendererRef.current?.render(scene, cameraRef.current);
          return;
        }
        const speedFactor = Math.min(Math.abs(nextLongitudinal) / 35, 1);
        cameraOffset.set(-body.steer * 1.4, 5.4 + speedFactor * 1.8, -10.5 - speedFactor * 3.5).applyAxisAngle(upAxis, body.rotation);
        targetCameraPos.copy(body.position).add(cameraOffset);
        cameraRef.current.position.lerp(targetCameraPos, 1 - Math.exp(-7 * dt));
        cameraShake *= Math.exp(-9 * dt);
        cameraRef.current.position.x += (Math.random() - 0.5) * cameraShake;
        cameraRef.current.position.y += (Math.random() - 0.5) * cameraShake;
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
      removeNitroEffect(car, nitroFlameMeshes);
      smokeParticles.forEach((particle) => {
        scene.remove(particle);
        (particle.material as THREE.Material).dispose();
      });
      smokeGeometry.dispose();
      skidMarks.forEach((mark) => scene.remove(mark));
      skidGeometry.dispose();
      skidMaterial.dispose();
      sparks.forEach((spark) => scene.remove(spark));
      sparkGeometry.dispose();
      sparkMaterial.dispose();
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('pointerdown', startAudio);
      engineAudio.stop();
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
    clientIdRef.current = clientId;
    const requestedColor = playerColorRef.current;

    const applyLocalColor = (color: number, name = playerName) => {
      localPaintMaterialRef.current?.color.setHex(color);
      if (carRef.current) applyCarColor(carRef.current, color);
      const updateDriver = localNameTagRef.current?.userData.updateDriver as ((name: string, color: number) => void) | undefined;
      updateDriver?.(name, color);
      setPlayerColor(color);
    };

    const removeRemote = (id: string) => {
      const remote = remotePlayersRef.current.get(id);
      if (!remote) return;
      scene.remove(remote.group);
      remote.group.traverse((child) => {
        if (child instanceof THREE.Sprite) {
          child.material.map?.dispose();
          child.material.dispose();
          return;
        }
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      });
      remotePlayersRef.current.delete(id);
      setOpponents(Array.from(remotePlayersRef.current, ([remoteId, visual]) => ({
        id: remoteId, name: visual.name, color: visual.color, x: visual.targetPosition.x, z: visual.targetPosition.z,
        lap: visual.lap, checkpoint: visual.checkpoint, finishedAt: visual.finishedAt, bestLap: visual.bestLap,
      })));
    };

    const clearRemotes = () => {
      Array.from(remotePlayersRef.current.keys()).forEach(removeRemote);
      setPlayerCount(1);
      setOpponents([]);
      setLobbyDrivers([]);
    };

    const upsertRemote = (player: WorldPlayerState) => {
      if (player.id === clientId) return;
      let remote = remotePlayersRef.current.get(player.id);
      if (!remote) {
        const { group, paintMaterial, nameTag } = createRemoteCar(player.color, player.name);
        group.position.set(player.x, player.y ?? 0, player.z);
        group.rotation.y = player.rotation;
        scene.add(group);
        remote = {
          group,
          paintMaterial,
          nameTag,
          targetPosition: new THREE.Vector3(player.x, player.y ?? 0, player.z),
          targetRotation: player.rotation,
          speed: player.speed,
          name: player.name,
          color: player.color,
          lap: player.lap,
          checkpoint: player.checkpoint,
          finishedAt: player.finishedAt,
          bestLap: player.bestLap,
          lastUpdate: Date.now(),
        };
        remotePlayersRef.current.set(player.id, remote);
      } else {
        remote.paintMaterial.color.setHex(player.color);
        applyCarColor(remote.group, player.color);
        const updateDriver = remote.nameTag.userData.updateDriver as ((name: string, color: number) => void) | undefined;
        updateDriver?.(player.name, player.color);
        remote.targetPosition.set(player.x, player.y ?? 0, player.z);
        remote.targetRotation = player.rotation;
        remote.speed = player.speed;
        remote.name = player.name;
        remote.color = player.color;
        remote.lap = player.lap;
        remote.checkpoint = player.checkpoint;
        remote.finishedAt = player.finishedAt;
        remote.bestLap = player.bestLap;
        remote.lastUpdate = Date.now();
      }
      setOpponents(Array.from(remotePlayersRef.current, ([id, visual]) => ({
        id,
        name: visual.name,
        color: visual.color,
        x: visual.targetPosition.x,
        z: visual.targetPosition.z,
        lap: visual.lap,
        checkpoint: visual.checkpoint,
        finishedAt: visual.finishedAt,
        bestLap: visual.bestLap,
      })));
      setPlayerCount(Math.min(WORLD_MAX_PLAYERS, remotePlayersRef.current.size + 1));
    };

    const sendJoin = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN || !carBodyRef.current) return;
      const body = carBodyRef.current;
      socket.send(JSON.stringify({
        type: 'join',
        player: {
          id: clientId,
          name: playerName,
          color: requestedColor,
          x: body.position.x,
          y: body.position.y,
          z: body.position.z,
          rotation: body.rotation,
          speed: body.velocity.length() * 3.6,
          steer: body.steer,
          ready: null,
          lap: 1,
          checkpoint: 0,
          finishedAt: 0,
          bestLap: 0,
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
          raceStateRef.current = event.race;
          setRaceState(event.race);
          roomSpectatorRef.current = Boolean(event.spectator);
          const shouldSpectate = Boolean(event.spectator)
            || (event.race.phase === 'countdown' && !event.race.participants.includes(clientId));
          spectatorRef.current = shouldSpectate;
          setLobbyDrivers(event.players.map((player) => ({ id: player.id, name: player.name, color: player.color, ready: player.ready })));
          if (carRef.current) carRef.current.visible = !shouldSpectate;
          const localPlayer = event.players.find((player) => player.id === clientId);
          if (localPlayer) {
            applyLocalColor(localPlayer.color, localPlayer.name);
            readyRef.current = localPlayer.ready;
            setIsReady(localPlayer.ready);
            if (event.race.participants.includes(clientId) && carBodyRef.current) {
              restoredRaceIdRef.current = event.race.id;
              carBodyRef.current.position.set(localPlayer.x, localPlayer.y ?? 0, localPlayer.z);
              carBodyRef.current.rotation = localPlayer.rotation;
              const restoredProgress = {
                lap: localPlayer.lap,
                checkpoint: localPlayer.checkpoint,
                finishedAt: localPlayer.finishedAt,
                bestLap: localPlayer.bestLap,
                lapStartedAt: Date.now(),
              };
              raceProgressRef.current = restoredProgress;
              lastCheckpointRef.current = localPlayer.checkpoint;
              setRaceProgress(restoredProgress);
            }
          }
          event.players.forEach(upsertRemote);
          setPlayerCount(Math.max(1, Math.min(event.maxPlayers, event.players.length)));
          setMultiplayerStatus(shouldSpectate ? 'spectating' : 'online');
        } else if (event.type === 'player') {
          setLobbyDrivers((drivers) => {
            const nextDriver = { id: event.player.id, name: event.player.name, color: event.player.color, ready: event.player.ready };
            return drivers.some((driver) => driver.id === event.player.id)
              ? drivers.map((driver) => driver.id === event.player.id ? nextDriver : driver)
              : [...drivers, nextDriver];
          });
          if (event.player.id === clientId) {
            applyLocalColor(event.player.color, event.player.name);
            readyRef.current = event.player.ready;
            setIsReady(event.player.ready);
          }
          else upsertRemote(event.player);
        } else if (event.type === 'race') {
          raceStateRef.current = event.race;
          setRaceState(event.race);
          const shouldSpectate = roomSpectatorRef.current
            || (event.race.phase === 'countdown' && !event.race.participants.includes(clientId));
          spectatorRef.current = shouldSpectate;
          if (carRef.current) carRef.current.visible = !shouldSpectate;
          setMultiplayerStatus(shouldSpectate ? 'spectating' : 'online');
        } else if (event.type === 'leave') {
          removeRemote(event.id);
          setLobbyDrivers((drivers) => drivers.filter((driver) => driver.id !== event.id));
          setPlayerCount(remotePlayersRef.current.size + 1);
        } else if (event.type === 'rail_break') {
          const rail = guardRailCollidersRef.current.find((candidate) => candidate.id === event.railId);
          if (rail) {
            rail.active = false;
            rail.group.visible = false;
            rail.regenerateAt = event.regenerateAt;
          }
        } else if (event.type === 'room_full') {
          reconnectAllowed = false;
          setMultiplayerStatus('full');
        } else if (event.type === 'unavailable') {
          reconnectAllowed = false;
          setMultiplayerStatus('solo');
        } else if (event.type === 'impact' && event.targetId === clientId && carBodyRef.current) {
          carBodyRef.current.velocity.x += event.impulseX;
          carBodyRef.current.velocity.z += event.impulseZ;
        }
      });
      socket.addEventListener('close', () => {
        if (cancelled || !reconnectAllowed) return;
        setMultiplayerStatus('connecting');
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
          y: body.position.y,
          z: body.position.z,
          rotation: body.rotation,
          speed: body.velocity.length() * 3.6,
          steer: body.steer,
          ready: readyRef.current,
          lap: raceProgressRef.current.lap,
          checkpoint: raceProgressRef.current.checkpoint,
          finishedAt: raceProgressRef.current.finishedAt,
          bestLap: raceProgressRef.current.bestLap,
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
      if (clientIdRef.current === clientId) clientIdRef.current = '';
      clearRemotes();
    };
  }, [playerName]);

  const resetCar = useCallback(() => {
    if (carBodyRef.current) {
      const checkpointIndex = RACE_CHECKPOINT_INDICES[lastCheckpointRef.current] || 0;
      const [x, z] = TRACK_POINTS[checkpointIndex];
      const [nextX, nextZ] = TRACK_POINTS[(checkpointIndex + 1) % TRACK_POINTS.length];
      const rotation = Math.atan2(nextX - x, nextZ - z);
      carBodyRef.current.position.set(x, TRACK_HEIGHTS[checkpointIndex], z);
      carBodyRef.current.rotation = rotation;
      carBodyRef.current.trackIndex = checkpointIndex;
      carBodyRef.current.onTrack = true;
      carBodyRef.current.velocity.set(0, 0, 0);
      carBodyRef.current.steer = 0;
      if (carRef.current) {
        carRef.current.position.set(x, TRACK_HEIGHTS[checkpointIndex], z);
        carRef.current.rotation.y = rotation;
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

  const setRaceChoice = useCallback((choice: boolean) => {
    const socket = multiplayerSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || spectatorRef.current || raceStateRef.current.phase === 'countdown') return;
    readyRef.current = choice;
    setIsReady(choice);
    setLobbyDrivers((drivers) => drivers.map((driver) => (
      driver.id === clientIdRef.current ? { ...driver, ready: choice } : driver
    )));
    socket.send(JSON.stringify({ type: 'ready', ready: choice }));
  }, []);

  const startRace = useCallback(() => {
    const socket = multiplayerSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || spectatorRef.current || raceStateRef.current.phase === 'countdown') return;
    socket.send(JSON.stringify({ type: 'start_race' }));
  }, []);

  const allChoicesSet = lobbyDrivers.length > 0 && lobbyDrivers.every((driver) => driver.ready !== null);
  const readyDriverCount = lobbyDrivers.filter((driver) => driver.ready === true).length;
  const standings = [
    ...(raceState.participants.includes(clientIdRef.current) ? [{
      id: clientIdRef.current,
      name: playerName,
      color: playerColor,
      lap: raceProgress.lap,
      checkpoint: raceProgress.checkpoint,
      finishedAt: raceProgress.finishedAt,
      bestLap: raceProgress.bestLap,
    }] : []),
    ...opponents.filter((opponent) => raceState.participants.includes(opponent.id)),
  ].sort((a, b) => {
    if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
    if (a.finishedAt) return -1;
    if (b.finishedAt) return 1;
    return (b.lap * 100 + b.checkpoint) - (a.lap * 100 + a.checkpoint);
  });

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
        <span className="world-mission-kicker">Circuit race</span>
        <strong>{raceState.phase === 'countdown' ? 'Race in progress' : raceState.phase === 'finished' ? 'Race complete' : 'Waiting on the grid'}</strong>
        <small>Three laps · twelve checkpoints · eight drivers</small>
      </div>

      <div className="world-race-strip">
        <span><small>POSITION</small><strong>{racePosition}/{Math.max(1, playerCount)}</strong></span>
        <span><small>LAP</small><strong>{raceProgress.lap}/{raceState.totalLaps}</strong></span>
        <span><small>BEST</small><strong>{formatRaceTime(raceProgress.bestLap)}</strong></span>
      </div>

      {countdown && <div className={`world-countdown${countdown === 'GO!' ? ' is-go' : ''}`}>{countdown}</div>}
      {wrongWay && <div className="world-wrong-way">WRONG WAY</div>}

      {(multiplayerStatus === 'online' || multiplayerStatus === 'connecting') && lobbyDrivers.length > 0 && raceState.phase !== 'countdown' && (
        <div className="world-ready-card">
          <span>{raceState.phase === 'finished' ? 'NEXT RACE' : 'RACE LOBBY'} · {readyDriverCount}/{lobbyDrivers.length} RACING</span>
          <strong>{isReady === null ? 'CHOOSE YOUR STATUS' : isReady ? 'YOU WILL RACE' : 'YOU WILL WATCH'}</strong>
          <div className="world-ready-actions">
            <button type="button" disabled={multiplayerStatus !== 'online'} className={isReady === true ? 'is-selected' : ''} onClick={() => setRaceChoice(true)}>Ready</button>
            <button type="button" disabled={multiplayerStatus !== 'online'} className={isReady === false ? 'is-selected is-sitting-out' : ''} onClick={() => setRaceChoice(false)}>Not racing</button>
          </div>
          <div className="world-lobby-list">
            {lobbyDrivers.map((driver) => (
              <div key={driver.id}><i style={{ backgroundColor: `#${driver.color.toString(16).padStart(6, '0')}` }} /><b>{driver.name}</b><em>{driver.ready === null ? 'DECIDING' : driver.ready ? 'READY' : 'SITTING OUT'}</em></div>
            ))}
          </div>
          <button type="button" className="world-start-race" disabled={multiplayerStatus !== 'online' || !allChoicesSet || readyDriverCount === 0} onClick={startRace}>
            {multiplayerStatus !== 'online' ? 'Reconnecting…' : !allChoicesSet ? 'Waiting for decisions' : readyDriverCount === 0 ? 'No racers ready' : 'Start race'}
          </button>
        </div>
      )}

      {(multiplayerStatus === 'spectating' || raceProgress.finishedAt > 0) && (
        <div className="world-spectator-banner">SPECTATING · {opponents[0]?.name || 'WAITING FOR DRIVER'}</div>
      )}

      {raceState.phase === 'countdown' && standings.length > 0 && (
        <div className="world-standings">
          <span>LIVE STANDINGS</span>
          {standings.map((driver, index) => (
            <div key={driver.id} className={driver.id === clientIdRef.current ? 'is-you' : ''}>
              <b>{index + 1}</b><i style={{ backgroundColor: `#${driver.color.toString(16).padStart(6, '0')}` }} /><strong>{driver.name}</strong>
              <em>{driver.finishedAt ? formatRaceTime(driver.finishedAt) : `L${driver.lap} · CP${driver.checkpoint + 1}`}</em>
            </div>
          ))}
        </div>
      )}

      {raceState.phase === 'finished' && raceState.results.length > 0 && (
        <div className="world-results">
          <span>RACE RESULTS</span>
          {raceState.results.map((result, index) => (
            <div key={result.id}><i style={{ backgroundColor: `#${result.color.toString(16).padStart(6, '0')}` }} /><b>{index + 1}</b><strong>{result.name}</strong><time>{formatRaceTime(result.finishedAt)}</time></div>
          ))}
        </div>
      )}

      {raceState.phase === 'lobby' && (raceState.leaderboard || []).length > 0 && (
        <div className="world-results">
          <span>SESSION BEST LAPS</span>
          {raceState.leaderboard.slice(0, 5).map((result, index) => (
            <div key={result.id}><i style={{ backgroundColor: `#${result.color.toString(16).padStart(6, '0')}` }} /><b>{index + 1}</b><strong>{result.name}</strong><time>{formatRaceTime(result.bestLap)}</time></div>
          ))}
        </div>
      )}

      {showControls && (
        <div className="world-panel world-controls-panel">
          <div className="world-panel-heading"><span>Manual</span><strong>How to drive</strong></div>
          <div className="world-control-list">
            <div><strong>W / ↑</strong><span>Accelerate</span></div>
            <div><strong>S / ↓</strong><span>Brake / Reverse</span></div>
            <div><strong>Space</strong><span>Handbrake drift</span></div>
            <div><strong>Shift</strong><span>Nitro boost</span></div>
            <div><strong>A / D</strong><span>Steer</span></div>
            <div><strong>R</strong><span>Return to last checkpoint</span></div>
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
              <polyline className="world-map-track-outline" points={`${TRACK_POINTS.map(([x, z]) => `${50 + (x / TRACK_WORLD_SIZE) * 100},${50 + (z / TRACK_WORLD_SIZE) * 100}`).join(' ')} 50,${50 + (TRACK_POINTS[0][1] / TRACK_WORLD_SIZE) * 100}`} />
              <polyline className="world-map-track-road" points={`${TRACK_POINTS.map(([x, z]) => `${50 + (x / TRACK_WORLD_SIZE) * 100},${50 + (z / TRACK_WORLD_SIZE) * 100}`).join(' ')} 50,${50 + (TRACK_POINTS[0][1] / TRACK_WORLD_SIZE) * 100}`} />
              <polyline className="world-map-track-line" points={`${TRACK_POINTS.map(([x, z]) => `${50 + (x / TRACK_WORLD_SIZE) * 100},${50 + (z / TRACK_WORLD_SIZE) * 100}`).join(' ')} 50,${50 + (TRACK_POINTS[0][1] / TRACK_WORLD_SIZE) * 100}`} />
            </svg>
            <div className="world-map-player" style={{ left: `${mapPosition.x}%`, top: `${mapPosition.y}%`, transform: `translate(-50%, -50%) rotate(${mapPosition.rotation}deg)`, backgroundColor: `#${playerColor.toString(16).padStart(6, '0')}` }} />
            {opponents.map((opponent) => (
              <div
                key={opponent.id}
                className="world-map-opponent"
                title={opponent.name}
                style={{ left: `${50 + (opponent.x / TRACK_WORLD_SIZE) * 100}%`, top: `${50 + (opponent.z / TRACK_WORLD_SIZE) * 100}%`, backgroundColor: `#${opponent.color.toString(16).padStart(6, '0')}` }}
              />
            ))}
            {buildingsRef.current.map((b, i) => (
              <div key={i} className={`world-map-building${b.type ? ` world-map-building-${b.type}` : ''}`} style={{ left: `${50 + (b.x / TRACK_WORLD_SIZE) * 100}%`, top: `${50 + (b.z / TRACK_WORLD_SIZE) * 100}%` }} />
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
        <div className="world-hud-right">
          <span className="world-hud-label">LOBBY</span>
          <span className={`world-drive-mode is-${multiplayerStatus}`}>
            {multiplayerStatus === 'online' ? `${playerCount}/${WORLD_MAX_PLAYERS}` : multiplayerStatus === 'full' ? 'FULL' : multiplayerStatus === 'connecting' ? 'SYNC' : 'SOLO'}
          </span>
          <span className="world-player-color"><i style={{ backgroundColor: `#${playerColor.toString(16).padStart(6, '0')}` }} />YOU</span>
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
