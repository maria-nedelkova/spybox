import type { Level } from "./types";

/** Neighbour slots, ordered so `d ^ 1` is always the opposite direction. */
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

export interface SolveResult {
  readonly solvable: boolean;
  /** Minimum number of pushes, when solvable. */
  readonly pushes?: number;
  /** Distinct positions expanded — a rough difficulty/complexity signal. */
  readonly states: number;
  /** True when the search hit `maxStates` instead of proving unsolvability. */
  readonly exhausted: boolean;
}

interface Node {
  /** Box cell indices, kept sorted so they form a canonical key. */
  readonly boxes: readonly number[];
  /** Where the player ended up (the cell the pushed box vacated). */
  readonly player: number;
  readonly pushes: number;
}

/**
 * Searches over *pushes* rather than individual player steps.
 *
 * Two positions with the same boxes are equivalent whenever the player can
 * walk between them without pushing, so each position is keyed by its boxes
 * plus the lowest-indexed cell the player can reach. That collapse is what
 * makes this tractable: a plain move-by-move BFS burns millions of states
 * re-walking identical box layouts.
 *
 * Cells are flat `row * width + col` indices with precomputed neighbours,
 * and the flood fill reuses generation-stamped scratch buffers, so no
 * per-state allocation or string building happens in the hot loop.
 */
export function solve(level: Level, maxStates = 200_000): SolveResult {
  const { width, height } = level;
  const size = width * height;

  const floor = new Uint8Array(size);
  for (const k of level.floors) floor[cellIndex(k, width)] = 1;

  const isGoal = new Uint8Array(size);
  for (const k of level.goals) isGoal[cellIndex(k, width)] = 1;

  // nbr[cell * 4 + direction] -> neighbouring cell, or -1 off-grid. Computed
  // from row/col (not cell ± 1) so row edges never wrap into each other.
  const nbr = new Int32Array(size * 4).fill(-1);
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const i = r * width + c;
      if (r > 0) nbr[i * 4 + UP] = (r - 1) * width + c;
      if (r < height - 1) nbr[i * 4 + DOWN] = (r + 1) * width + c;
      if (c > 0) nbr[i * 4 + LEFT] = r * width + (c - 1);
      if (c < width - 1) nbr[i * 4 + RIGHT] = r * width + (c + 1);
    }
  }

  const startBoxes = [...level.boxesStart].map((k) => cellIndex(k, width)).sort((a, b) => a - b);
  const playerStart = level.playerStart.r * width + level.playerStart.c;

  // parseLevel guarantees boxes.length === goals.size, so "every box is on a
  // goal" is equivalent to "every goal is filled".
  const isWon = (boxes: readonly number[]): boolean => {
    for (let i = 0; i < boxes.length; i++) {
      if (!isGoal[boxes[i]!]) return false;
    }
    return true;
  };

  if (isWon(startBoxes)) {
    return { solvable: true, pushes: 0, states: 1, exhausted: false };
  }

  // Generation-stamped scratch buffers: bumping `gen` invalidates both marks
  // without clearing them.
  const reachMark = new Int32Array(size);
  const boxMark = new Int32Array(size);
  const stack = new Int32Array(size);
  let gen = 0;

  /**
   * Flood-fills the player's walkable region, stamping `reachMark`/`boxMark`
   * with the current generation, and returns the region's lowest cell index.
   * The stamps stay valid until the next call.
   */
  function computeRegion(boxes: readonly number[], start: number): number {
    gen++;
    for (let i = 0; i < boxes.length; i++) boxMark[boxes[i]!] = gen;

    let sp = 0;
    stack[sp++] = start;
    reachMark[start] = gen;
    let canonical = start;

    while (sp > 0) {
      const p = stack[--sp]!;
      const base = p * 4;
      for (let d = 0; d < 4; d++) {
        const n = nbr[base + d]!;
        if (n < 0 || reachMark[n] === gen || boxMark[n] === gen || !floor[n]) continue;
        reachMark[n] = gen;
        if (n < canonical) canonical = n;
        stack[sp++] = n;
      }
    }
    return canonical;
  }

  const keyOf = (boxes: readonly number[], canonical: number): string =>
    `${canonical}:${boxes.join(",")}`;

  const seen = new Set<string>([keyOf(startBoxes, computeRegion(startBoxes, playerStart))]);
  const queue: Node[] = [{ boxes: startBoxes, player: playerStart, pushes: 0 }];
  let head = 0;

  while (head < queue.length) {
    const node = queue[head++]!;
    const boxes = node.boxes;

    // Pass 1: collect legal pushes while this node's region stamps are live.
    computeRegion(boxes, node.player);
    const pushes: { readonly slot: number; readonly from: number; readonly to: number }[] = [];
    for (let slot = 0; slot < boxes.length; slot++) {
      const box = boxes[slot]!;
      const base = box * 4;
      for (let d = 0; d < 4; d++) {
        const dest = nbr[base + d]!;
        if (dest < 0 || !floor[dest] || boxMark[dest] === gen) continue;
        // To push the box toward `d`, the player must stand on the far side.
        const stand = nbr[base + (d ^ 1)]!;
        if (stand < 0 || reachMark[stand] !== gen) continue;
        pushes.push({ slot, from: box, to: dest });
      }
    }

    // Pass 2: apply them (each recomputes the region, invalidating the stamps).
    for (const { slot, from, to } of pushes) {
      const next = boxes.slice();
      next[slot] = to;
      next.sort((a, b) => a - b);

      const pushCount = node.pushes + 1;
      if (isWon(next)) {
        return { solvable: true, pushes: pushCount, states: seen.size, exhausted: false };
      }

      const key = keyOf(next, computeRegion(next, from));
      if (seen.has(key)) continue;
      seen.add(key);
      if (seen.size > maxStates) {
        return { solvable: false, states: seen.size, exhausted: true };
      }
      queue.push({ boxes: next, player: from, pushes: pushCount });
    }
  }

  return { solvable: false, states: seen.size, exhausted: false };
}

function cellIndex(key: string, width: number): number {
  const comma = key.indexOf(",");
  return Number(key.slice(0, comma)) * width + Number(key.slice(comma + 1));
}

/**
 * Validates that a hand-authored level can actually be finished before it
 * ships — see levels.test.ts.
 */
export function isSolvable(level: Level, maxStates = 200_000): boolean {
  return solve(level, maxStates).solvable;
}
