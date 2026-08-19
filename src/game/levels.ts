/**
 * Level data as classic Sokoban ASCII grids (see the notation doc in
 * `engine.ts`). Hand-authored — not sourced from any existing level pack.
 *
 * Ordered by minimum push count, which is the difficulty metric the solver
 * reports: 4, 6, 7, 10, 12, 17, 28. levels.test.ts checks every level is
 * solvable and that the ramp stays monotonic, so inserting a level in the
 * wrong slot fails the suite.
 *
 * The designs lean on the things that make Boxworld hard — narrow corridors,
 * one-way alcoves, single doorways and forced push order — rather than on
 * open rooms with more crates, which mostly add tedium.
 */
export interface LevelSource {
  readonly name: string;
  readonly briefing: string;
  readonly rows: readonly string[];
}

export const LEVELS: readonly LevelSource[] = [
  {
    name: "Dead Drop",
    briefing: "One package, one drop point — but it's round the corner. Get behind it.",
    rows: [
      "#######",
      "#     #",
      "#  $  #",
      "#  #  #",
      "#. @  #",
      "#######",
    ],
  },
  {
    name: "Double Agent",
    briefing: "Two contacts, two safehouses. Neither one lines up with the door.",
    rows: [
      "########",
      "#   .  #",
      "#  ##  #",
      "# $    #",
      "#   $  #",
      "#  .   #",
      "#   @  #",
      "########",
    ],
  },
  {
    name: "Need to Know",
    briefing: "The drop sits up a dead-end shaft. Line the package up underneath first.",
    rows: [
      "#########",
      "#       #",
      "#  ###  #",
      "#  #.#  #",
      "#  # #  #",
      "#  $ $  #",
      "#   .   #",
      "#   @   #",
      "#########",
    ],
  },
  {
    name: "Triple Cross",
    briefing: "Three parcels, three drops, one crossroads. Especially mind the middle one.",
    rows: [
      "#########",
      "#   .   #",
      "#   #   #",
      "# $ # $ #",
      "#. ### .#",
      "#   $   #",
      "#   @   #",
      "#########",
    ],
  },
  {
    name: "The Vault",
    briefing: "Four deposits, four slots. Fill them out of order and you'll wall yourself out.",
    rows: [
      "###########",
      "#    #    #",
      "# $ $ $ $ #",
      "#.#.#.#.# #",
      "#         #",
      "#    @    #",
      "###########",
    ],
  },
  {
    name: "Under Surveillance",
    briefing: "One checkpoint, and it only takes one package at a time. Clear it between runs.",
    rows: [
      "###########",
      "#         #",
      "# $ $ $   #",
      "#### #### #",
      "#         #",
      "# . . .   #",
      "#    @    #",
      "###########",
    ],
  },
  {
    name: "Final Extraction",
    briefing: "Every package moves through the one central corridor. Last mission — make it count.",
    rows: [
      "##########",
      "#   #    #",
      "# $ # .  #",
      "#   #    #",
      "#  ###   #",
      "# $   .  #",
      "#  ###   #",
      "#   #    #",
      "# $ # .  #",
      "#  @#    #",
      "##########",
    ],
  },
];
