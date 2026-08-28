import { describe, expect, test } from "bun:test";
import { parseLevel } from "./engine";
import { LEVELS } from "./levels";
import { soloPushSum, solve } from "./solver";

const solved = LEVELS.map(({ name, rows }) => {
  const level = parseLevel(name, rows);
  const result = solve(level);
  const solo = soloPushSum(level);
  return {
    name,
    boxes: level.boxesStart.size,
    cells: level.floors.size,
    pushes: result.pushes,
    solvable: result.solvable,
    // How much the crates get in each other's way. 1.0 = not at all.
    interaction: result.solvable ? result.pushes! / solo : 0,
    // Length weighted by entanglement — the ordering key for levels.ts.
    score: result.solvable ? (result.pushes! * result.pushes!) / solo : 0,
  };
});

describe("LEVELS", () => {
  for (const level of solved) {
    test(`"${level.name}" is solvable`, () => {
      expect(level.solvable).toBe(true);
    });
  }

  test("level names are unique", () => {
    // Best scores are stored per level name, so a duplicate would make two
    // different levels share (and overwrite) one record.
    const names = LEVELS.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("difficulty ramps up monotonically", () => {
    // Ordered by pushes x interaction, not raw pushes — see levels.ts.
    const ramp = solved.map((l) => `${l.name}=${l.score.toFixed(1)}`);
    const ordered = [...solved].sort((a, b) => a.score - b.score).map((l) => `${l.name}=${l.score.toFixed(1)}`);
    expect(ramp).toEqual(ordered);
  });

  test("no level is padding: the crates must actually interfere", () => {
    // A wide room where each crate strolls to its own goal racks up a big push
    // count while asking nothing of the player. This is the guard against that
    // creeping back in.
    const tangled = solved.map((l) => `${l.name}=${l.interaction.toFixed(2)}`);
    expect(tangled).toEqual(tangled.filter((_, i) => solved[i]!.interaction >= 1.0));

    // The back half should be meaningfully tangled, not merely long.
    for (const level of solved.slice(-8)) {
      expect(`${level.name}=${level.interaction.toFixed(2)}`).toBe(
        level.interaction >= 1.5 ? `${level.name}=${level.interaction.toFixed(2)}` : "too shallow",
      );
    }
  });

  test("boards stay compact, so length comes from thinking not walking", () => {
    for (const level of solved) {
      expect(level.cells).toBeLessThanOrEqual(70);
    }
  });

  test("opens with two crates and ends on a genuinely hard one", () => {
    expect(solved[0]!.boxes).toBeGreaterThanOrEqual(2);
    expect(solved.at(-1)!.score).toBeGreaterThanOrEqual(40);
  });
});
