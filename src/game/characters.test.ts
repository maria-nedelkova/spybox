import { describe, expect, test } from "bun:test";
import { CHARACTERS, expressionForLevel, WIN_EXPRESSION } from "./characters";

describe("expressionForLevel", () => {
  test("cycles deterministically and wraps around", () => {
    const first4 = [0, 1, 2, 3].map(expressionForLevel);
    const next4 = [4, 5, 6, 7].map(expressionForLevel);
    expect(next4).toEqual(first4);
  });

  test("is a pure function of the index", () => {
    expect(expressionForLevel(2)).toBe(expressionForLevel(2));
  });

  test("never returns the win expression", () => {
    for (let i = 0; i < 12; i++) {
      expect(expressionForLevel(i)).not.toBe(WIN_EXPRESSION);
    }
  });
});

describe("CHARACTERS", () => {
  test("has a unique, non-empty entry per character id", () => {
    const ids = CHARACTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CHARACTERS) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.tagline.length).toBeGreaterThan(0);
    }
  });
});
