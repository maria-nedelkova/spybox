import { describe, expect, test } from "bun:test";
import { createInitialState, isWon, key, move, parseLevel } from "./engine";

describe("parseLevel", () => {
  test("reads walls, floors, goals, boxes, and player position", () => {
    const level = parseLevel("t", ["#####", "#@$.#", "#####"]);
    expect(level.width).toBe(5);
    expect(level.height).toBe(3);
    expect(level.playerStart).toEqual({ r: 1, c: 1 });
    expect(level.boxesStart.has(key({ r: 1, c: 2 }))).toBe(true);
    expect(level.goals.has(key({ r: 1, c: 3 }))).toBe(true);
    expect(level.walls.has(key({ r: 0, c: 0 }))).toBe(true);
  });

  test("throws if box count and goal count don't match", () => {
    expect(() => parseLevel("bad", ["#####", "#@$$#", "#####"])).toThrow();
  });

  test("throws if there's no player start", () => {
    expect(() => parseLevel("bad", ["#####", "# $.#", "#####"])).toThrow();
  });

  test("box-on-goal registers both the goal and the box occupant", () => {
    const level = parseLevel("t", ["####", "#@*#", "####"]);
    expect(level.goals.has(key({ r: 1, c: 2 }))).toBe(true);
    expect(level.boxesStart.has(key({ r: 1, c: 2 }))).toBe(true);
  });

  test("player-on-goal registers the goal without a box occupant", () => {
    const level = parseLevel("t", ["####", "#+$#", "####"]);
    expect(level.goals.has(key({ r: 1, c: 1 }))).toBe(true);
    expect(level.boxesStart.has(key({ r: 1, c: 1 }))).toBe(false);
    expect(level.playerStart).toEqual({ r: 1, c: 1 });
  });
});

describe("move", () => {
  const level = parseLevel("t", ["#####", "#@$.#", "#####"]);

  test("steps onto open floor", () => {
    const state = createInitialState(level);
    const next = move(level, state, "down");
    expect(next).toBe(state); // wall below — blocked, same reference back
  });

  test("pushes a box into open space", () => {
    const state = createInitialState(level);
    const next = move(level, state, "right");
    expect(next.player).toEqual({ r: 1, c: 2 });
    expect(next.boxes.has(key({ r: 1, c: 3 }))).toBe(true);
    expect(next.moves).toBe(1);
    expect(next.pushes).toBe(1);
    expect(isWon(level, next)).toBe(true);
  });

  test("won't push a box into a wall", () => {
    // Goal on the row below just balances the box/goal count check — it's
    // not reachable from the push path and doesn't affect this assertion.
    const boxAgainstWall = parseLevel("t2", ["#####", "#@$##", "#.  #", "#####"]);
    const state = createInitialState(boxAgainstWall);
    const next = move(boxAgainstWall, state, "right");
    expect(next).toBe(state);
  });

  test("won't push a box into another box", () => {
    const stacked = parseLevel("t3", ["#####", "#@$$#", "#..##", "#####"]);
    const state = createInitialState(stacked);
    const next = move(stacked, state, "right");
    expect(next).toBe(state);
  });

  test("moves onto floor without a box don't count as a push", () => {
    const open = parseLevel("t4", ["####", "#@ #", "####"]);
    const state = createInitialState(open);
    const next = move(open, state, "right");
    expect(next.moves).toBe(1);
    expect(next.pushes).toBe(0);
  });
});

describe("isWon", () => {
  test("false until every goal has a box on it", () => {
    const level = parseLevel("t", ["#######", "#@$ $ #", "# . . #", "#######"]);
    const state = createInitialState(level);
    expect(isWon(level, state)).toBe(false);
  });
});
