import { describe, expect, test } from "bun:test";
import { parseLevel } from "./engine";
import { LEVELS } from "./levels";
import { isSolvable } from "./solver";

describe("LEVELS", () => {
  for (const { name, rows } of LEVELS) {
    test(`"${name}" is solvable`, () => {
      const level = parseLevel(name, rows);
      expect(isSolvable(level)).toBe(true);
    });
  }
});
