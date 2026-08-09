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
