/**
 * Level data as classic Sokoban ASCII grids (see the notation doc in
 * `engine.ts`). Hand-authored — not sourced from any existing level pack.
 * Solvability is checked automatically in levels.test.ts.
 */
export interface LevelSource {
  readonly name: string;
  readonly rows: readonly string[];
}

export const LEVELS: readonly LevelSource[] = [
  {
    name: "Dead Drop",
    rows: ["#####", "#@$.#", "#####"],
  },
  {
    name: "Double Agent",
    rows: [
      "#######",
      "#     #",
      "# $ $ #",
      "# . . #",
      "#  @  #",
      "#######",
    ],
  },
  {
    name: "Need to Know",
    rows: [
      "##########",
      "#        #",
      "#  $   $ #",
      "#        #",
      "#  .   . #",
      "#    @   #",
      "##########",
    ],
  },
  {
    name: "Triple Cross",
    rows: [
      "#######",
      "#     #",
      "# $ $ #",
      "#  $  #",
      "# . . #",
      "#  .  #",
      "#  @  #",
      "#######",
    ],
  },
  {
    name: "The Vault",
    rows: [
      "#########",
      "#   #   #",
      "# $ #   #",
      "#   #   #",
      "#   #####",
      "#     . #",
      "# @      #",
      "#########",
    ],
  },
  {
    name: "Under Surveillance",
    rows: [
      "###############",
      "#      @      #",
      "###$###$###$###",
      "### ### ### ###",
      "###.###.###.###",
      "###############",
    ],
  },
  {
    name: "Final Extraction",
    rows: [
      "###############",
      "#             #",
      "#    $   $    #",
      "#             #",
      "#   ### ###   #",
      "#             #",
      "#  .       .  #",
      "#      @      #",
      "###############",
    ],
  },
];
