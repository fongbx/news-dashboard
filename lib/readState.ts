const STORAGE_KEY = "news-dashboard:read-ids";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function isRead(id: string): boolean {
  return loadReadIds().has(id);
}

export function markRead(id: string): Set<string> {
  const ids = loadReadIds();
  ids.add(id);
  saveReadIds(ids);
  return ids;
}

export function getAllReadIds(): Set<string> {
  return loadReadIds();
}
