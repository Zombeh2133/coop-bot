const RATE_LIMIT_MS = 5 * 60 * 1000;

const lastRenameAt = new Map();
const pendingTimers = new Map();

export function scheduleRename(channel, computeName) {
  const now = Date.now();
  const last = lastRenameAt.get(channel.id) ?? 0;
  const elapsed = now - last;

  if (elapsed >= RATE_LIMIT_MS) {
    lastRenameAt.set(channel.id, now);
    channel.setName(computeName()).catch(() => {});
    return;
  }

  if (pendingTimers.has(channel.id)) return;

  const timer = setTimeout(() => {
    pendingTimers.delete(channel.id);
    lastRenameAt.set(channel.id, Date.now());
    channel.setName(computeName()).catch(() => {});
  }, RATE_LIMIT_MS - elapsed);

  pendingTimers.set(channel.id, timer);
}
