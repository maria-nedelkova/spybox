import type { Direction, GameState, Level, Pos } from "./types";

const WALL = "#";
const GOAL = ".";
const BOX = "$";
const BOX_ON_GOAL = "*";
const PLAYER = "@";
const PLAYER_ON_GOAL = "+";
const FLOOR = " ";

const DELTA: Record<Direction, Pos> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

export function key(pos: Pos): string {
  return `${pos.r},${pos.c}`;
}

/**
 * Parses a classic Sokoban ASCII grid. Standard notation: `#` wall, `.`
 * goal, `$` box, `*` box-on-goal, `@` player, `+` player-on-goal, ` `
 * floor. Ragged/short rows and everything past them are void (not
 * walkable, not a wall) — there's no separate void character, exactly
 * like real Sokoban level packs.
 */
export function parseLevel(name: string, rows: readonly string[]): Level {
  const walls = new Set<string>();
  const floors = new Set<string>();
  const goals = new Set<string>();
  const boxesStart = new Set<string>();
  let playerStart: Pos | undefined;

  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      const pos = { r, c };
      const k = key(pos);
      switch (ch) {
        case WALL:
          walls.add(k);
          break;
        case GOAL:
          floors.add(k);
          goals.add(k);
          break;
        case BOX:
          floors.add(k);
          boxesStart.add(k);
          break;
        case BOX_ON_GOAL:
          floors.add(k);
          goals.add(k);
          boxesStart.add(k);
          break;
        case PLAYER:
          floors.add(k);
          playerStart = pos;
          break;
        case PLAYER_ON_GOAL:
          floors.add(k);
          goals.add(k);
          playerStart = pos;
          break;
        case FLOOR:
          floors.add(k);
          break;
        default:
          break; // void/unreachable
      }
    }
  });

  if (!playerStart) {
    throw new Error(`Level "${name}" has no player start ("@" or "+")`);
  }
  if (boxesStart.size !== goals.size) {
    throw new Error(
      `Level "${name}" has ${boxesStart.size} boxes but ${goals.size} goals — they must match`,
    );
  }

  const height = rows.length;
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);

  return { name, width, height, walls, floors, goals, playerStart, boxesStart };
}

export function createInitialState(level: Level): GameState {
  return { player: level.playerStart, boxes: new Set(level.boxesStart), moves: 0, pushes: 0 };
}

/** Returns the next state, or the same `state` reference unchanged if the move is blocked. */
export function move(level: Level, state: GameState, direction: Direction): GameState {
  const d = DELTA[direction];
  const next: Pos = { r: state.player.r + d.r, c: state.player.c + d.c };
  const nextKey = key(next);

  if (!level.floors.has(nextKey)) return state;

  if (state.boxes.has(nextKey)) {
    const beyond: Pos = { r: next.r + d.r, c: next.c + d.c };
    const beyondKey = key(beyond);
    if (!level.floors.has(beyondKey) || state.boxes.has(beyondKey)) return state;

    const boxes = new Set(state.boxes);
    boxes.delete(nextKey);
    boxes.add(beyondKey);
    return { player: next, boxes, moves: state.moves + 1, pushes: state.pushes + 1 };
  }

  return { ...state, player: next, moves: state.moves + 1 };
}

export function isWon(level: Level, state: GameState): boolean {
  for (const goal of level.goals) {
    if (!state.boxes.has(goal)) return false;
  }
  return true;
}
