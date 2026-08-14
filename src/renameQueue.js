const WINDOW_MS = 10 * 60 * 1000;
const MAX_RENAMES_PER_WINDOW = 2;

const renameHistory = new Map();
const pendingTimers = new Map();

function pruneHistory(history, now) {
  return history.filter((ts) => now - ts < WINDOW_MS);
}

export function scheduleRename(channel, computeName) {
  const now = Date.now();
  const history = pruneHistory(renameHistory.get(channel.id) ?? [], now);

  if (history.length < MAX_RENAMES_PER_WINDOW) {
    history.push(now);
    renameHistory.set(channel.id, history);
    channel.setName(computeName()).catch((err) => console.error(`Failed to rename channel ${channel.id}:`, err));
    return;
  }

  if (pendingTimers.has(channel.id)) return;

  const oldest = Math.min(...history);
  const wait = WINDOW_MS - (now - oldest) + 1000;

  const timer = setTimeout(() => {
    pendingTimers.delete(channel.id);
    const freshNow = Date.now();
    const freshHistory = pruneHistory(renameHistory.get(channel.id) ?? [], freshNow);
    freshHistory.push(freshNow);
    renameHistory.set(channel.id, freshHistory);
    channel.setName(computeName()).catch((err) => console.error(`Failed to rename channel ${channel.id}:`, err));
  }, wait);

  pendingTimers.set(channel.id, timer);
}
