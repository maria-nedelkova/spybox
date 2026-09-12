import { type KeyValueStore, loadBest } from "./bestScore";

/**
 * Set when a player says they have played before — see unlockAll. Kept apart
 * from the best scores: it is a claim about a save that is gone, not a record
 * of anything done in this one, and it should not invent scores to say so.
 */
const UNLOCK_ALL_KEY = "spybox:unlocked-all";

function defaultStore(): KeyValueStore | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

export function hasUnlockedAll(store: KeyValueStore | null = defaultStore()): boolean {
  return store?.getItem(UNLOCK_ALL_KEY) === "1";
}

/**
 * Opens every level, for a player whose progress was cleared out from under
 * them. There is no way to tell that apart from a first visit — clearing site
 * data takes every storage the origin has, including anything that could have
 * vouched for them — so this is offered rather than detected.
 */
export function unlockAll(store: KeyValueStore | null = defaultStore()): void {
  store?.setItem(UNLOCK_ALL_KEY, "1");
}

/**
 * How many levels the player has access to, counting from the first.
 *
 * Derived from the best scores rather than stored separately. A level only
 * has a best once it has been finished, so "has a record" already means
 * "completed" — and deriving it means there is no second copy of the same
 * fact to fall out of step with the first.
 *
 * Unlocking is sequential, so a count says everything a set would: levels
 * below it are open, the rest are not.
 */
export function unlockedCount(
  levelNames: readonly string[],
  store: KeyValueStore | null = defaultStore(),
): number {
  if (hasUnlockedAll(store)) return levelNames.length;

  // The first level is always open — there is nothing to have finished yet.
  let unlocked = 1;
  while (
    unlocked < levelNames.length &&
    loadBest(levelNames[unlocked - 1]!, store) !== null
  ) {
    unlocked++;
  }
  return unlocked;
}
