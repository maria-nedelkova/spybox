import { describe, expect, test } from "bun:test";
import { type KeyValueStore, recordScore } from "./bestScore";
import { unlockedCount } from "./progress";

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const LEVELS = ["One", "Two", "Three", "Four"];

describe("unlockedCount", () => {
  test("only the first level is open on a fresh save", () => {
    expect(unlockedCount(LEVELS, memoryStore())).toBe(1);
  });

  test("finishing a level opens the next one", () => {
    const store = memoryStore();
    recordScore("One", 10, store);
    expect(unlockedCount(LEVELS, store)).toBe(2);
  });

  test("opens one level per level finished, in order", () => {
    const store = memoryStore();
    recordScore("One", 10, store);
    recordScore("Two", 10, store);
    expect(unlockedCount(LEVELS, store)).toBe(3);
  });

  test("stops at the first level without a record", () => {
    const store = memoryStore();
    recordScore("One", 10, store);
    // Finished out of order — say the save predates the lock — so "Three"
    // does not open a run the player never made.
    recordScore("Three", 10, store);
    expect(unlockedCount(LEVELS, store)).toBe(2);
  });

  test("never counts past the last level", () => {
    const store = memoryStore();
    for (const name of LEVELS) recordScore(name, 10, store);
    expect(unlockedCount(LEVELS, store)).toBe(LEVELS.length);
  });

  test("a score of zero is not a completion", () => {
    const store = memoryStore();
    // bestScore rejects these on read, so the level stays locked rather than
    // opening on a record that cannot be real.
    store.setItem("spybox:best:v2:One", "0");
    expect(unlockedCount(LEVELS, store)).toBe(1);
  });

  test("survives having no store at all", () => {
    expect(unlockedCount(LEVELS, null)).toBe(1);
  });

  test("a single-level game is entirely open", () => {
    expect(unlockedCount(["Only"], memoryStore())).toBe(1);
  });
});
