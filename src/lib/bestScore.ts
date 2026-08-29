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

/**
 * Every level needs at least one move, so a stored 0 (or a negative, or
 * garbage) is not a real record. A level-switch race used to bank exactly that
 * — see the reset in useGame — leaving an unbeatable "best: 0 moves" on file.
 * The race is fixed, but ignoring impossible values on read repairs the saves
 * it already wrote without discarding anyone's genuine records.
 */
function isPlausibleScore(moves: number): boolean {
  return Number.isFinite(moves) && moves > 0;
}

export function loadBest(levelName: string, store: KeyValueStore | null = defaultStore()): number | null {
  const raw = store?.getItem(STORAGE_PREFIX + levelName) ?? null;
  if (raw === null) return null;
  const value = Number(raw);
  return isPlausibleScore(value) ? value : null;
}

/** Records `moves` as the level's best if it beats (or sets) the stored best. */
export function recordScore(
  levelName: string,
  moves: number,
  store: KeyValueStore | null = defaultStore(),
): { best: number; isNewBest: boolean } {
  const prev = loadBest(levelName, store);
  if (!isPlausibleScore(moves)) {
    return { best: prev ?? moves, isNewBest: false };
  }
  const isNewBest = prev === null || moves < prev;
  if (isNewBest) store?.setItem(STORAGE_PREFIX + levelName, String(moves));
  return { best: isNewBest ? moves : prev!, isNewBest };
}
