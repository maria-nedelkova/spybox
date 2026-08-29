import { describe, expect, test } from "bun:test";
import { type KeyValueStore, loadBest, recordScore } from "./bestScore";

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

describe("recordScore", () => {
  test("first score for a level is always a new best", () => {
    const store = memoryStore();
    expect(recordScore("Dead Drop", 12, store)).toEqual({ best: 12, isNewBest: true });
  });

  test("a lower move count beats the stored best", () => {
    const store = memoryStore();
    recordScore("Dead Drop", 12, store);
    expect(recordScore("Dead Drop", 8, store)).toEqual({ best: 8, isNewBest: true });
    expect(loadBest("Dead Drop", store)).toBe(8);
  });

  test("a higher move count does not overwrite the stored best", () => {
    const store = memoryStore();
    recordScore("Dead Drop", 8, store);
    expect(recordScore("Dead Drop", 12, store)).toEqual({ best: 8, isNewBest: false });
    expect(loadBest("Dead Drop", store)).toBe(8);
  });

  test("scores for different levels don't collide", () => {
    const store = memoryStore();
    recordScore("Dead Drop", 8, store);
    recordScore("Double Agent", 20, store);
    expect(loadBest("Dead Drop", store)).toBe(8);
    expect(loadBest("Double Agent", store)).toBe(20);
  });

  test("loadBest returns null when nothing recorded yet", () => {
    expect(loadBest("Nonexistent", memoryStore())).toBeNull();
  });
});

describe("impossible scores", () => {
  /** Like the shared memoryStore above, but exposes the raw map so a test
   * can assert that nothing was written at all. */
  function trackingStore() {
    const raw = new Map<string, string>();
    return {
      getItem: (k: string) => raw.get(k) ?? null,
      setItem: (k: string, v: string) => void raw.set(k, v),
      raw,
    };
  }

  test("a 0-move score is refused, not stored", () => {
    const store = trackingStore();
    const result = recordScore("First Contact", 0, store);
    expect(result.isNewBest).toBe(false);
    expect([...store.raw.values()]).toEqual([]);
  });

  test("an already-stored 0 is ignored and overwritten by a real score", () => {
    // What the level-switch race left behind on real saves.
    const store = trackingStore();
    store.raw.set("spybox:best:v2:First Contact", "0");
    expect(loadBest("First Contact", store)).toBeNull();

    const result = recordScore("First Contact", 9, store);
    expect(result).toEqual({ best: 9, isNewBest: true });
    expect(loadBest("First Contact", store)).toBe(9);
  });

  test("a genuine record still wins and is not clobbered", () => {
    const store = trackingStore();
    expect(recordScore("The Vault", 20, store).isNewBest).toBe(true);
    expect(recordScore("The Vault", 25, store)).toEqual({ best: 20, isNewBest: false });
    expect(recordScore("The Vault", 14, store)).toEqual({ best: 14, isNewBest: true });
  });
});
