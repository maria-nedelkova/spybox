import { type KeyValueStore, loadBest } from "./bestScore";

function defaultStore(): KeyValueStore | null {
  return typeof localStorage === "undefined" ? null : localStorage;
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
 *
 * This is the whole of the save system. Clearing the browser's storage loses
 * it, and there is no way back in — deliberately, because there is no way to
 * tell a cleared save from a first visit, so anything offering a way back has
 * to offer it to everybody.
 */
export function unlockedCount(
  levelNames: readonly string[],
  store: KeyValueStore | null = defaultStore(),
): number {
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
