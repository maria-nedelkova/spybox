import { describe, expect, test } from "bun:test";
import { createInitialState, key, move, parseLevel } from "./engine";
import { findPath } from "./path";
import type { Direction, Level, Pos } from "./types";

/** Walks the path and returns where the player ends up. */
function follow(level: Level, from: ReturnType<typeof createInitialState>, path: Direction[]) {
  return path.reduce((state, direction) => move(level, state, direction), from);
}

describe("findPath", () => {
  test("returns an empty path for the tile the player is already on", () => {
    const level = parseLevel("t", ["#####", "#@  #", "#####"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 1, c: 1 })).toEqual([]);
  });

  test("steps onto a neighbouring tile", () => {
    const level = parseLevel("t", ["#####", "#@  #", "#####"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 1, c: 2 })).toEqual(["right"]);
  });

  test("takes a shortest route and actually arrives", () => {
    const level = parseLevel("t", ["#####", "#@  #", "#   #", "#   #", "#####"]);
    const state = createInitialState(level);
    const target: Pos = { r: 3, c: 3 };

    const path = findPath(level, state, target)!;
    expect(path).not.toBeNull();
    // Manhattan distance is the floor for a shortest walk on an open board.
    expect(path.length).toBe(4);
    expect(follow(level, state, path).player).toEqual(target);
  });

  test("goes around a wall", () => {
    const level = parseLevel("t", ["#####", "#@# #", "#   #", "#####"]);
    const state = createInitialState(level);
    const target: Pos = { r: 1, c: 3 };

    const path = findPath(level, state, target)!;
    expect(path).toEqual(["down", "right", "right", "up"]);
    expect(follow(level, state, path).player).toEqual(target);
  });

  test("returns null for a wall", () => {
    const level = parseLevel("t", ["#####", "#@  #", "#####"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 0, c: 0 })).toBeNull();
  });

  test("returns null for a tile outside the level", () => {
    const level = parseLevel("t", ["#####", "#@  #", "#####"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 9, c: 9 })).toBeNull();
  });

  test("returns null for a tile a crate is standing on", () => {
    const level = parseLevel("t", ["#####", "#@$.#", "#####"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 1, c: 2 })).toBeNull();
  });

  test("treats crates as walls rather than routing through them", () => {
    // The only way right is through the crate, so there is no walk at all.
    const level = parseLevel("t", ["#####", "#@$.#", "#####"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 1, c: 3 })).toBeNull();
  });

  test("walks the long way round rather than pushing a crate", () => {
    const level = parseLevel("t", ["#####", "#@$.#", "#   #", "#####"]);
    const state = createInitialState(level);
    const target: Pos = { r: 1, c: 3 };

    const path = findPath(level, state, target)!;
    expect(path).toEqual(["down", "right", "right", "up"]);
    // The crate has not moved.
    expect(follow(level, state, path).boxes.has(key({ r: 1, c: 2 }))).toBe(true);
  });

  test("returns null when the target is walled off", () => {
    const level = parseLevel("t", ["######", "#@ #.#", "#  #$#", "######"]);
    const state = createInitialState(level);
    expect(findPath(level, state, { r: 1, c: 4 })).toBeNull();
  });
});
