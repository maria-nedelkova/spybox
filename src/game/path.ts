import { key } from "./engine";
import type { Direction, GameState, Level, Pos } from "./types";

const STEPS: readonly (readonly [Direction, number, number])[] = [
  ["up", -1, 0],
  ["down", 1, 0],
  ["left", 0, -1],
  ["right", 0, 1],
];

/**
 * The shortest walk from the player to `target`, as the directions to take,
 * or null if there is no route. An empty array means the player is already
 * there.
 *
 * Crates are obstacles here, not things to push. A tap is a request to walk
 * somewhere, and shoving a crate on the way past is how a level becomes
 * unwinnable — so a route that would need one is no route at all. Pushing
 * stays deliberate: a swipe, a key, or a tap onto the crate itself.
 */
export function findPath(level: Level, state: GameState, target: Pos): Direction[] | null {
  const targetKey = key(target);
  const startKey = key(state.player);

  if (!level.floors.has(targetKey) || state.boxes.has(targetKey)) return null;
  if (startKey === targetKey) return [];

  // Breadth-first, so the first route to reach the target is a shortest one.
  // Boards top out around 90 tiles, so an index into the queue is cheaper
  // and clearer than anything fancier.
  const cameFrom = new Map<string, { readonly from: string; readonly direction: Direction }>();
  const seen = new Set<string>([startKey]);
  const queue: Pos[] = [state.player];

  for (let head = 0; head < queue.length; head++) {
    const at = queue[head]!;

    for (const [direction, dr, dc] of STEPS) {
      const next = { r: at.r + dr, c: at.c + dc };
      const nextKey = key(next);

      if (seen.has(nextKey)) continue;
      if (!level.floors.has(nextKey) || state.boxes.has(nextKey)) continue;

      seen.add(nextKey);
      cameFrom.set(nextKey, { from: key(at), direction });

      if (nextKey === targetKey) {
        const path: Direction[] = [];
        for (let step = nextKey; step !== startKey; ) {
          const previous = cameFrom.get(step)!;
          path.push(previous.direction);
          step = previous.from;
        }
        return path.reverse();
      }

      queue.push(next);
    }
  }

  return null;
}
