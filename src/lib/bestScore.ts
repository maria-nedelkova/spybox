/**
 * Bump the generation whenever the level layouts change. Records are keyed by
 * level name, and the names outlived the v1 grids — without this, anyone who
 * had played before would be stuck looking at a best score set on a different
 * (much easier) level, which the redesigned one can never beat.
 */
const STORAGE_PREFIX = "spybox:best:v2:";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStore(): KeyValueStore | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

export function loadBest(levelName: string, store: KeyValueStore | null = defaultStore()): number | null {
  const raw = store?.getItem(STORAGE_PREFIX + levelName) ?? null;
  return raw === null ? null : Number(raw);
}

/** Records `moves` as the level's best if it beats (or sets) the stored best. */
export function recordScore(
  levelName: string,
  moves: number,
  store: KeyValueStore | null = defaultStore(),
): { best: number; isNewBest: boolean } {
  const prev = loadBest(levelName, store);
  const isNewBest = prev === null || moves < prev;
  if (isNewBest) store?.setItem(STORAGE_PREFIX + levelName, String(moves));
  return { best: isNewBest ? moves : prev!, isNewBest };
}
