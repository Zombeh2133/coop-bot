const ROOM_NAME_PATTERN = /^g(\d+)-/;

export function parseRoomNumber(channelName) {
  const match = channelName.match(ROOM_NAME_PATTERN);
  return match ? match[1] : null;
}

export function buildChannelName(roomNumber, code, needed) {
  if (!code) return `g${roomNumber}-xxxxx`;
  if (needed <= 0) return `g${roomNumber}-${code}-f`;
  return `g${roomNumber}-${code}`;
}
