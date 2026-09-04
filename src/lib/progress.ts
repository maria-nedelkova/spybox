import { type KeyValueStore, loadBest } from "./bestScore";

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
  store?: KeyValueStore | null,
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
