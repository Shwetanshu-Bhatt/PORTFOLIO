import { Redis } from '@upstash/redis';
import type { WebSocket, RawData } from 'ws';
import {
  WORLD_MAX_PLAYERS,
  WORLD_PLAYER_COLORS,
  WORLD_STATE_INTERVAL_MS,
  WORLD_TOTAL_LAPS,
  type WorldClientEvent,
  type WorldPlayerState,
  type WorldRaceState,
  type WorldServerEvent,
} from '@/lib/world-protocol';

const CHANNEL = 'portfolio:world:events';
const PLAYERS_KEY = 'portfolio:world:players';
const PRESENCE_KEY = 'portfolio:world:presence';
const RACE_KEY = 'portfolio:world:race';
const STALE_AFTER_MS = 12_000;

type Session = { id: string | null; lastUpdate: number; lastImpact: number; lastRailBreak: number };

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
    && isFiniteNumber(player.steer) && Math.abs(player.steer) <= 1
    && (player.ready === undefined || typeof player.ready === 'boolean')
    && (player.lap === undefined || Number.isInteger(player.lap) && player.lap >= 1 && player.lap <= WORLD_TOTAL_LAPS)
    && (player.checkpoint === undefined || Number.isInteger(player.checkpoint) && player.checkpoint >= 0 && player.checkpoint <= 32)
    && (player.finishedAt === undefined || isFiniteNumber(player.finishedAt) && player.finishedAt >= 0)
    && (player.bestLap === undefined || isFiniteNumber(player.bestLap) && player.bestLap >= 0 && player.bestLap < 3_600_000);
}

function normalizePlayer(player: Omit<WorldPlayerState, 'updatedAt'>): WorldPlayerState {
  const name = String(player.name || 'Driver').trim().replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 18) || 'Driver';
  return {
    id: player.id,
    name,
    color: Number.isInteger(player.color) ? Math.min(0xffffff, Math.max(0, player.color)) : 0xff5a36,
    x: player.x,
    z: player.z,
    rotation: player.rotation,
    speed: player.speed,
    steer: player.steer,
    ready: Boolean(player.ready),
    lap: Number.isInteger(player.lap) ? player.lap : 1,
    checkpoint: Number.isInteger(player.checkpoint) ? player.checkpoint : 0,
    finishedAt: isFiniteNumber(player.finishedAt) ? player.finishedAt : 0,
    bestLap: isFiniteNumber(player.bestLap) ? player.bestLap : 0,
    updatedAt: Date.now(),
  };
}

function defaultRace(): WorldRaceState {
  return { id: 'lobby', phase: 'lobby', startAt: 0, participants: [], totalLaps: WORLD_TOTAL_LAPS, results: [], leaderboard: [] };
}

async function getRace(redis: Redis) {
  const stored = await redis.get<WorldRaceState | string>(RACE_KEY);
  if (!stored) return defaultRace();
  try { return typeof stored === 'string' ? JSON.parse(stored) as WorldRaceState : stored; } catch { return defaultRace(); }
}

async function getPlayers(redis: Redis) {
  return (await redis.hvals(PLAYERS_KEY) as unknown[]).flatMap((value) => {
    try { return [typeof value === 'string' ? JSON.parse(value) as WorldPlayerState : value as WorldPlayerState]; } catch { return []; }
  });
}

async function joinRoom(redis: Redis, player: WorldPlayerState) {
  const script = `
    local stale = redis.call('ZRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
    for _, id in ipairs(stale) do redis.call('HDEL', KEYS[2], id) end
    if #stale > 0 then redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1]) end
    local exists = redis.call('ZSCORE', KEYS[1], ARGV[2])
    if not exists and redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[5]) then return -1 end
    local used = {}
    local entries = redis.call('HGETALL', KEYS[2])
    for i = 1, #entries, 2 do
      if entries[i] ~= ARGV[2] then
        local ok, activePlayer = pcall(cjson.decode, entries[i + 1])
        if ok and activePlayer.color then used[tonumber(activePlayer.color)] = true end
      end
    end
    local assigned = nil
    local currentPlayer = nil
    local current = redis.call('HGET', KEYS[2], ARGV[2])
    if current then
      local ok, decodedCurrent = pcall(cjson.decode, current)
      if ok then currentPlayer = decodedCurrent end
      if ok and currentPlayer.color and not used[tonumber(currentPlayer.color)] then assigned = tonumber(currentPlayer.color) end
    end
    if not assigned then
      for i = 6, #ARGV do
        local candidate = tonumber(ARGV[i])
        if not used[candidate] then assigned = candidate break end
      end
    end
    if not assigned then return -1 end
    local decodedPlayer = cjson.decode(ARGV[4])
    decodedPlayer.color = assigned
    if currentPlayer then
      decodedPlayer.x = currentPlayer.x
      decodedPlayer.z = currentPlayer.z
      decodedPlayer.rotation = currentPlayer.rotation
      decodedPlayer.speed = currentPlayer.speed
      decodedPlayer.steer = currentPlayer.steer
      decodedPlayer.ready = currentPlayer.ready
      decodedPlayer.lap = currentPlayer.lap
      decodedPlayer.checkpoint = currentPlayer.checkpoint
      decodedPlayer.finishedAt = currentPlayer.finishedAt
      decodedPlayer.bestLap = currentPlayer.bestLap
    end
    redis.call('ZADD', KEYS[1], ARGV[3], ARGV[2])
    redis.call('HSET', KEYS[2], ARGV[2], cjson.encode(decodedPlayer))
    return assigned
  `;
  const assignedColor = Number(await redis.eval(
    script,
    [PRESENCE_KEY, PLAYERS_KEY],
    [player.updatedAt - STALE_AFTER_MS, player.id, player.updatedAt, JSON.stringify(player), WORLD_MAX_PLAYERS, ...WORLD_PLAYER_COLORS],
  ));
  return assignedColor >= 0 ? assignedColor : null;
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
    let player = normalizePlayer(event.player);
    const assignedColor = await joinRoom(redis, player);
    if (assignedColor === null) {
      send(ws, { type: 'snapshot', players: await getPlayers(redis), maxPlayers: WORLD_MAX_PLAYERS, race: await getRace(redis), spectator: true });
      return;
    }
    const joined = await redis.hget<WorldPlayerState | string>(PLAYERS_KEY, player.id);
    player = typeof joined === 'string' ? JSON.parse(joined) as WorldPlayerState : joined || { ...player, color: assignedColor };
    session.id = player.id;
    session.lastUpdate = player.updatedAt;
    const players = await getPlayers(redis);
    send(ws, { type: 'snapshot', players, maxPlayers: WORLD_MAX_PLAYERS, race: await getRace(redis) });
    await publish(redis, { type: 'player', player });
    return;
  }

  if (event.type === 'collision') {
    const now = Date.now();
    if (!session.id || now - session.lastImpact < 100
      || !/^[a-zA-Z0-9_-]{8,64}$/.test(event.targetId)
      || !isFiniteNumber(event.impulseX) || !isFiniteNumber(event.impulseZ)
      || Math.hypot(event.impulseX, event.impulseZ) > 28) return;
    session.lastImpact = now;
    await publish(redis, {
      type: 'impact',
      targetId: event.targetId,
      sourceId: session.id,
      impulseX: event.impulseX,
      impulseZ: event.impulseZ,
    });
    return;
  }

  if (event.type === 'rail_break') {
    const now = Date.now();
    if (!session.id || now - session.lastRailBreak < 250
      || !Number.isInteger(event.railId) || event.railId < 0 || event.railId > 31) return;
    session.lastRailBreak = now;
    await publish(redis, {
      type: 'rail_break',
      railId: event.railId,
      regenerateAt: now + 5_000 + Math.floor(Math.random() * 5_001),
    });
    return;
  }

  if (event.type === 'ready') {
    if (!session.id) return;
    const stored = await redis.hget<WorldPlayerState | string>(PLAYERS_KEY, session.id);
    const existing = typeof stored === 'string' ? JSON.parse(stored) as WorldPlayerState : stored;
    if (!existing) return;
    const race = await getRace(redis);
    if (race.phase === 'countdown' && (!event.ready || Date.now() >= race.startAt - 1_000)) return;
    const player = normalizePlayer({ ...existing, ready: event.ready });
    await redis.hset(PLAYERS_KEY, { [player.id]: player });
    await publish(redis, { type: 'player', player });
    if (race.phase === 'countdown') {
      if (!race.participants.includes(player.id)) {
        const updatedRace = { ...race, participants: [...race.participants, player.id] };
        await redis.set(RACE_KEY, updatedRace);
        await publish(redis, { type: 'race', race: updatedRace });
      }
      return;
    }
    if (!event.ready) return;
    const players = await getPlayers(redis);
    const participants = players.filter((candidate) => candidate.ready).map((candidate) => candidate.id);
    if (participants.length === 0) return;
    for (const candidate of players.filter((entry) => participants.includes(entry.id))) {
      const resetPlayer = normalizePlayer({ ...candidate, ready: false, lap: 1, checkpoint: 0, finishedAt: 0, bestLap: 0 });
      await redis.hset(PLAYERS_KEY, { [candidate.id]: resetPlayer });
      await publish(redis, { type: 'player', player: resetPlayer });
    }
    const nextRace: WorldRaceState = {
      id: `${Date.now()}`,
      phase: 'countdown',
      startAt: Date.now() + 6_000,
      participants,
      totalLaps: WORLD_TOTAL_LAPS,
      results: [],
      leaderboard: race.leaderboard || [],
    };
    await redis.set(RACE_KEY, nextRace);
    await publish(redis, { type: 'race', race: nextRace });
    return;
  }

  if (!session.id || event.player.id !== session.id) return;
  const now = Date.now();
  if (now - session.lastUpdate < WORLD_STATE_INTERVAL_MS - 10 || !validPlayer(event.player)) return;
  session.lastUpdate = now;
  const stored = await redis.hget<WorldPlayerState | string>(PLAYERS_KEY, session.id);
  const existing = typeof stored === 'string' ? JSON.parse(stored) as WorldPlayerState : stored;
  if (!existing) return;
  const activeRace = await getRace(redis);
  let player = normalizePlayer({ ...existing, ...event.player });
  if (activeRace.phase === 'countdown' && activeRace.participants.includes(player.id)) {
    const expectedCheckpoint = (existing.checkpoint + 1) % 10;
    if (player.checkpoint !== existing.checkpoint && player.checkpoint !== expectedCheckpoint) {
      player = { ...player, lap: existing.lap, checkpoint: existing.checkpoint, finishedAt: existing.finishedAt, bestLap: existing.bestLap };
    }
    if (player.lap < existing.lap || player.lap > existing.lap + 1) player.lap = existing.lap;
    if (player.finishedAt > 0 && existing.finishedAt === 0) {
      player.finishedAt = Math.max(1, Date.now() - activeRace.startAt);
    } else if (existing.finishedAt > 0) {
      player.finishedAt = existing.finishedAt;
    }
  }
  await redis.multi()
    .hset(PLAYERS_KEY, { [player.id]: player })
    .zadd(PRESENCE_KEY, { score: player.updatedAt, member: player.id })
    .publish(CHANNEL, JSON.stringify({ type: 'player', player }))
    .exec();

  const race = activeRace;
  if (race.phase === 'countdown' && race.participants.includes(player.id) && player.finishedAt > 0) {
    const players = await getPlayers(redis);
    const participants = race.participants.flatMap((id) => {
      const participant = players.find((candidate) => candidate.id === id);
      return participant ? [participant] : [];
    });
    const results = participants
      .filter((candidate) => candidate.finishedAt > 0)
      .map((candidate) => ({ id: candidate.id, name: candidate.name, color: candidate.color, finishedAt: candidate.finishedAt, bestLap: candidate.bestLap }))
      .sort((a, b) => a.finishedAt - b.finishedAt);
    const nextRace: WorldRaceState = {
      ...race,
      phase: participants.length > 0 && participants.every((candidate) => candidate.finishedAt > 0) ? 'finished' : race.phase,
      results,
      leaderboard: [...(race.leaderboard || []), ...results]
        .reduce<typeof results>((leaders, result) => {
          const existingResult = leaders.find((candidate) => candidate.id === result.id);
          if (!existingResult) leaders.push(result);
          else if (result.bestLap > 0 && (existingResult.bestLap === 0 || result.bestLap < existingResult.bestLap)) Object.assign(existingResult, result);
          return leaders;
        }, [])
        .sort((a, b) => (a.bestLap || Infinity) - (b.bestLap || Infinity))
        .slice(0, WORLD_MAX_PLAYERS),
    };
    await redis.set(RACE_KEY, nextRace);
    await publish(redis, { type: 'race', race: nextRace });
  }
}

export function registerWorldSocket(ws: WebSocket) {
  const redis = getPublisher();
  sockets.set(ws, { id: null, lastUpdate: 0, lastImpact: 0, lastRailBreak: 0 });

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
