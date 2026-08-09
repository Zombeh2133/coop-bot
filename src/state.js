import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const dbPath = path.join(dataDir, 'rooms.json');

const emptyRoom = () => ({ code: null, needed: null, song: null, queue: [] });

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(all) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(all, null, 2));
}

export function getRoom(channelId) {
  return readAll()[channelId] ?? emptyRoom();
}

export function setCode(channelId, code, needed) {
  const all = readAll();
  all[channelId] = { ...emptyRoom(), ...all[channelId], code, needed };
  writeAll(all);
}

export function updateNeeded(channelId, needed) {
  const all = readAll();
  if (!all[channelId]) return;
  all[channelId].needed = needed;
  writeAll(all);
}

export function clearRoom(channelId) {
  const all = readAll();
  delete all[channelId];
  writeAll(all);
}

export function setSong(channelId, song) {
  const all = readAll();
  all[channelId] = { ...emptyRoom(), ...all[channelId], song };
  writeAll(all);
}

export function addToQueue(channelId, userId) {
  const all = readAll();
  const room = { ...emptyRoom(), ...all[channelId] };
  if (!room.queue.includes(userId)) room.queue.push(userId);
  all[channelId] = room;
  writeAll(all);
  return room.queue;
}

export function removeFromQueue(channelId, userId) {
  const all = readAll();
  const room = { ...emptyRoom(), ...all[channelId] };
  room.queue = room.queue.filter((id) => id !== userId);
  all[channelId] = room;
  writeAll(all);
  return room.queue;
}

export function popQueue(channelId) {
  const all = readAll();
  const room = { ...emptyRoom(), ...all[channelId] };
  if (room.queue.length === 0) return null;
  const [next, ...rest] = room.queue;
  room.queue = rest;
  all[channelId] = room;
  writeAll(all);
  return next;
}
