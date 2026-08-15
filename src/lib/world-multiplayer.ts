import { Redis } from '@upstash/redis';
import type { WebSocket, RawData } from 'ws';
import {
  WORLD_MAX_PLAYERS,
  WORLD_STATE_INTERVAL_MS,
  type WorldClientEvent,
  type WorldPlayerState,
  type WorldServerEvent,
} from '@/lib/world-protocol';

const CHANNEL = 'portfolio:world:events';
const PLAYERS_KEY = 'portfolio:world:players';
const PRESENCE_KEY = 'portfolio:world:presence';
const STALE_AFTER_MS = 12_000;

type Session = { id: string | null; lastUpdate: number };

const sockets = new Map<WebSocket, Session>();
let publisher: Redis | null = null;
let subscriber: ReturnType<Redis['subscribe']> | null = null;

function send(ws: WebSocket, event: WorldServerEvent) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(event));
}

function broadcast(event: WorldServerEvent) {
  const payload = JSON.stringify(event);
  sockets.forEach((_session, ws) => {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  });
}

function getPublisher() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!publisher) publisher = Redis.fromEnv();
  return publisher;
}

function ensureSubscriber(redis: Redis) {
  if (subscriber) return;
  subscriber = redis.subscribe<WorldServerEvent | string>(CHANNEL);
  subscriber.on('message', ({ message }) => {
    try {
      broadcast(typeof message === 'string' ? JSON.parse(message) as WorldServerEvent : message as WorldServerEvent);
    } catch {
      // Ignore malformed pub/sub frames.
    }
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validPlayer(player: Partial<WorldPlayerState>) {
  return typeof player.id === 'string'
    && /^[a-zA-Z0-9_-]{8,64}$/.test(player.id)
    && isFiniteNumber(player.x) && Math.abs(player.x) <= 165
    && isFiniteNumber(player.z) && Math.abs(player.z) <= 165
    && isFiniteNumber(player.rotation) && Math.abs(player.rotation) <= Math.PI * 100
    && isFiniteNumber(player.speed) && player.speed >= 0 && player.speed <= 240
    && isFiniteNumber(player.steer) && Math.abs(player.steer) <= 1;
}

function normalizePlayer(player: Omit<WorldPlayerState, 'updatedAt'>): WorldPlayerState {
  return {
    id: player.id,
    name: String(player.name || 'Driver').slice(0, 24),
    color: Number.isInteger(player.color) ? Math.min(0xffffff, Math.max(0, player.color)) : 0xff5a36,
    x: player.x,
    z: player.z,
    rotation: player.rotation,
    speed: player.speed,
    steer: player.steer,
    updatedAt: Date.now(),
  };
}

async function joinRoom(redis: Redis, player: WorldPlayerState) {
  const script = `
    local stale = redis.call('ZRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
    for _, id in ipairs(stale) do redis.call('HDEL', KEYS[2], id) end
    if #stale > 0 then redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1]) end
    local exists = redis.call('ZSCORE', KEYS[1], ARGV[2])
    if not exists and redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[5]) then return 0 end
    redis.call('ZADD', KEYS[1], ARGV[3], ARGV[2])
    redis.call('HSET', KEYS[2], ARGV[2], ARGV[4])
    return 1
  `;
  return Number(await redis.eval(
    script,
    [PRESENCE_KEY, PLAYERS_KEY],
    [player.updatedAt - STALE_AFTER_MS, player.id, player.updatedAt, JSON.stringify(player), WORLD_MAX_PLAYERS],
  )) === 1;
}

async function publish(redis: Redis, event: WorldServerEvent) {
  await redis.publish(CHANNEL, JSON.stringify(event));
}

async function removePlayer(redis: Redis, id: string, lastUpdate: number) {
  const script = `
    local score = redis.call('ZSCORE', KEYS[1], ARGV[1])
    if score and tonumber(score) <= tonumber(ARGV[2]) then
      redis.call('ZREM', KEYS[1], ARGV[1])
      redis.call('HDEL', KEYS[2], ARGV[1])
      return 1
    end
    return 0
  `;
  const removed = Number(await redis.eval(script, [PRESENCE_KEY, PLAYERS_KEY], [id, lastUpdate])) === 1;
  if (removed) await publish(redis, { type: 'leave', id });
}

async function handleMessage(ws: WebSocket, data: RawData) {
  const redis = getPublisher();
  if (!redis) return send(ws, { type: 'unavailable' });

  let event: WorldClientEvent;
  try {
    event = JSON.parse(data.toString()) as WorldClientEvent;
  } catch {
    return;
  }

  const session = sockets.get(ws);
  if (!session) return;

  if (event.type === 'join') {
    if (!validPlayer(event.player)) return ws.close(4002, 'Invalid player');
    const player = normalizePlayer(event.player);
    if (!(await joinRoom(redis, player))) {
      send(ws, { type: 'room_full', maxPlayers: WORLD_MAX_PLAYERS });
      return ws.close(4003, 'Room full');
    }
    session.id = player.id;
    session.lastUpdate = player.updatedAt;
    const players = (await redis.hvals(PLAYERS_KEY) as unknown[]).flatMap((value) => {
      try { return [typeof value === 'string' ? JSON.parse(value) as WorldPlayerState : value as WorldPlayerState]; } catch { return []; }
    });
    send(ws, { type: 'snapshot', players, maxPlayers: WORLD_MAX_PLAYERS });
    await publish(redis, { type: 'player', player });
    return;
  }

  if (!session.id || event.player.id !== session.id) return;
  const now = Date.now();
  if (now - session.lastUpdate < WORLD_STATE_INTERVAL_MS - 10 || !validPlayer(event.player)) return;
  session.lastUpdate = now;
  const stored = await redis.hget<WorldPlayerState | string>(PLAYERS_KEY, session.id);
  const existing = typeof stored === 'string' ? JSON.parse(stored) as WorldPlayerState : stored;
  if (!existing) return;
  const player = normalizePlayer({ ...existing, ...event.player });
  await redis.multi()
    .hset(PLAYERS_KEY, { [player.id]: player })
    .zadd(PRESENCE_KEY, { score: player.updatedAt, member: player.id })
    .publish(CHANNEL, JSON.stringify({ type: 'player', player }))
    .exec();
}

export function registerWorldSocket(ws: WebSocket) {
  const redis = getPublisher();
  sockets.set(ws, { id: null, lastUpdate: 0 });

  if (!redis) {
    send(ws, { type: 'unavailable' });
    ws.close(1013, 'Redis unavailable');
    return;
  }

  ensureSubscriber(redis);
  ws.on('message', (data) => {
    void handleMessage(ws, data).catch(() => ws.close(1011, 'Realtime error'));
  });
  ws.on('close', () => {
    const session = sockets.get(ws);
    sockets.delete(ws);
    if (session?.id) void removePlayer(redis, session.id, session.lastUpdate);
  });
  ws.on('error', () => ws.close());
}
