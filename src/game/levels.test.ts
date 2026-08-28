import { describe, expect, test } from "bun:test";
import { parseLevel } from "./engine";
import { LEVELS } from "./levels";
import { solve } from "./solver";

const solved = LEVELS.map(({ name, rows }) => {
  const level = parseLevel(name, rows);
  return { name, boxes: level.boxesStart.size, result: solve(level) };
});

describe("LEVELS", () => {
  for (const { name, result } of solved) {
    test(`"${name}" is solvable`, () => {
      expect(result.solvable).toBe(true);
    });
  }

  test("level names are unique", () => {
    // Best scores are stored per level name, so a duplicate would make two
    // different levels share (and overwrite) one record.
    const names = LEVELS.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("difficulty ramps up monotonically", () => {
    // Labelled so a failure names the levels that are out of order.
    const ramp = solved.map(({ name, result }) => `${name}=${result.pushes}`);
    const ordered = [...solved]
      .sort((a, b) => a.result.pushes! - b.result.pushes!)
      .map(({ name, result }) => `${name}=${result.pushes}`);
    expect(ramp).toEqual(ordered);
  });

  test("opens with a real two-crate puzzle and ends with a hard one", () => {
    const first = solved[0]!;
    const last = solved.at(-1)!;
    expect(first.boxes).toBeGreaterThanOrEqual(2);
    expect(first.result.pushes).toBeGreaterThanOrEqual(4);
    expect(last.result.pushes).toBeGreaterThanOrEqual(45);
  });
});
