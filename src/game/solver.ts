import { createInitialState, isWon, key, move } from "./engine";
import type { Direction, GameState, Level } from "./types";

const DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];

function stateKey(state: GameState): string {
  return `${key(state.player)}|${[...state.boxes].sort().join(",")}`;
}

/**
 * BFS over the (player, boxes) state space. Used to validate hand-authored
 * levels are actually solvable before they ship — see levels.test.ts.
 */
export function isSolvable(level: Level, maxStates = 200_000): boolean {
  const start = createInitialState(level);
  if (isWon(level, start)) return true;

  const seen = new Set<string>([stateKey(start)]);
  const queue: GameState[] = [start];
  let head = 0;

  while (head < queue.length) {
    const state = queue[head++]!;
    for (const direction of DIRECTIONS) {
      const next = move(level, state, direction);
      if (next === state) continue;
      if (isWon(level, next)) return true;

      const k = stateKey(next);
      if (seen.has(k)) continue;
      seen.add(k);
      if (seen.size > maxStates) return false;
      queue.push(next);
    }
  }
  return false;
}
