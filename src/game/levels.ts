/**
 * Level data as classic Sokoban ASCII grids (see the notation doc in
 * `engine.ts`). Hand-authored and hand-verified solvable — not sourced
 * from any existing level pack.
 */
export interface LevelSource {
  readonly name: string;
  readonly rows: readonly string[];
}

export const LEVELS: readonly LevelSource[] = [
  {
    name: "Tutorial",
    rows: ["#####", "#@$.#", "#####"],
  },
  {
    name: "Two Targets",
    rows: [
      "#######",
      "#     #",
      "# $ $ #",
      "# . . #",
      "#  @  #",
      "#######",
    ],
  },
];
