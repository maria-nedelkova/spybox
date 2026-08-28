import { describe, expect, test } from "bun:test";
import { advanceFrame } from "./Sprite";

/** Plays `steps` frames from 0 and returns the sequence actually displayed. */
function sequence(
  frameCount: number,
  mode: { loop: boolean; pingpong: boolean },
  steps: number,
): number[] {
  let frame = 0;
  let direction = 1;
  const seen = [frame];
  for (let i = 0; i < steps; i++) {
    const step = advanceFrame(frame, direction, frameCount, mode);
    frame = step.frame;
    direction = step.direction;
    seen.push(frame);
    if (step.finished) break;
  }
  return seen;
}

describe("advanceFrame", () => {
  test("hard loop wraps straight back to the start", () => {
    expect(sequence(4, { loop: true, pingpong: false }, 6)).toEqual([0, 1, 2, 3, 0, 1, 2]);
  });

  test("ping-pong bounces without repeating either endpoint", () => {
    // The snap this avoids is 3 -> 0; here 3 is followed by 2.
    expect(sequence(4, { loop: true, pingpong: true }, 10)).toEqual([
      0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2,
    ]);
  });

  test("ping-pong works for a 3-frame row (Bond's left/right)", () => {
    expect(sequence(3, { loop: true, pingpong: true }, 8)).toEqual([0, 1, 2, 1, 0, 1, 2, 1, 0]);
  });

  test("non-looping animation stops on the last frame and reports finished", () => {
    const seen = sequence(3, { loop: false, pingpong: false }, 10);
    expect(seen).toEqual([0, 1, 2, 2]);

    const atEnd = advanceFrame(2, 1, 3, { loop: false, pingpong: false });
    expect(atEnd).toEqual({ frame: 2, direction: 1, finished: true });
  });

  test("degenerate two- and one-frame animations stay in range", () => {
    expect(sequence(2, { loop: true, pingpong: true }, 4)).toEqual([0, 1, 0, 1, 0]);
    for (const frame of sequence(1, { loop: true, pingpong: true }, 4)) {
      expect(frame).toBe(0);
    }
  });
});
