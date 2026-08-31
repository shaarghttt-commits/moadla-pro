export type PresenceUser = {
  id: string | null;
  name?: string | null;
  lastSeen: string; // ISO
};

const users: Map<string, PresenceUser> = new Map();

export function touchUser(id: string | null, name?: string | null) {
  const key = id ?? `anon-${String(Math.random()).slice(2,8)}`;
  users.set(key, { id, name: name ?? null, lastSeen: new Date().toISOString() });
  // cleanup old
  const cutoff = Date.now() - 1000 * 60 * 5; // 5 minutes
  for (const [k, v] of users) {
    if (Date.parse(v.lastSeen) < cutoff) users.delete(k);
  }
  return Array.from(users.values());
}

export function getAllPresence() {
  return Array.from(users.values());
}
