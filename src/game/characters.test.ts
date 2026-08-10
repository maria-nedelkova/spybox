import { describe, expect, test } from "bun:test";
import { CHARACTERS } from "./characters";

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
