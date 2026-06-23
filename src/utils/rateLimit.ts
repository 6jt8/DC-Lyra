const userCommandMap = new Map<string, number[]>();

const CLEANUP_INTERVAL = 60000;
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of userCommandMap) {
    const valid = timestamps.filter(t => now - t < 60000);
    if (valid.length === 0) {
      userCommandMap.delete(key);
    } else {
      userCommandMap.set(key, valid);
    }
  }
}, CLEANUP_INTERVAL).unref();

export function checkRateLimit(
  userId: string,
  maxCommands = 3,
  windowMs = 5000
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const key = userId;
  const timestamps = userCommandMap.get(key) || [];
  const recent = timestamps.filter(t => now - t < windowMs);

  if (recent.length >= maxCommands) {
    const oldest = recent[0];
    const retryAfter = windowMs - (now - oldest);
    return { allowed: false, retryAfter: Math.ceil(retryAfter / 1000) };
  }

  recent.push(now);
  userCommandMap.set(key, recent);
  return { allowed: true, retryAfter: 0 };
}
