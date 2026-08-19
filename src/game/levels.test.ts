import { describe, expect, test } from "bun:test";
import { parseLevel } from "./engine";
import { LEVELS } from "./levels";
import { solve } from "./solver";

const solved = LEVELS.map(({ name, rows }) => ({ name, result: solve(parseLevel(name, rows)) }));

describe("LEVELS", () => {
  for (const { name, result } of solved) {
    test(`"${name}" is solvable`, () => {
      expect(result.solvable).toBe(true);
    });
  }

  test("difficulty ramps up monotonically", () => {
    // Labelled so a failure names the levels that are out of order.
    const ramp = solved.map(({ name, result }) => `${name}=${result.pushes}`);
    const ordered = [...solved]
      .sort((a, b) => a.result.pushes! - b.result.pushes!)
      .map(({ name, result }) => `${name}=${result.pushes}`);
    expect(ramp).toEqual(ordered);
  });

  test("no level is a trivial straight shove, and the finale is a real puzzle", () => {
    const first = solved[0]!.result.pushes!;
    const last = solved.at(-1)!.result.pushes!;
    expect(first).toBeGreaterThanOrEqual(3);
    expect(last).toBeGreaterThanOrEqual(20);
  });
});
