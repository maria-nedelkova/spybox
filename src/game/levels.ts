/**
 * Level data as classic Sokoban ASCII grids (see the notation doc in
 * `engine.ts`). Hand-authored — not sourced from any existing level pack.
 *
 * Ordering is by `pushes x interaction`, not by push count. Push count alone
 * measures how *long* a level is: a wide room where each crate walks to its
 * own goal scores highly while asking nothing of the player. `interaction` is
 * the optimal push count divided by the sum of each crate solved alone (see
 * solver.soloPushSum) — near 1.0 means the crates never get in each other's
 * way, so the level is one easy sub-puzzle repeated. Every level here scores
 * above that, and the boards are small on purpose: the length comes from
 * untangling crates, not from hauling them across open floor.
 *
 * Every level is also a different room shape from its neighbours — a pillar
 * grid, a T-junction, a comb, a ring, diagonal walls — so no two consecutive
 * levels are the same puzzle at a different size.
 *
 * levels.test.ts enforces both the ordering and a minimum interaction, so a
 * long-but-shallow level cannot slip back in.
 */
export interface LevelSource {
  readonly name: string;
  readonly briefing: string;
  readonly rows: readonly string[];
}

export const LEVELS: readonly LevelSource[] = [
  {
    name: "First Contact",
    briefing: "Two packages, two drop points. Neither one is straight ahead.",
    rows: ["#######", "#     #", "# $ $ #", "#  #  #", "# .  .#", "#  @  #", "#######"],
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
    name: "Blind Spot",
    briefing: "Three crates in a cross. The arm you fill first decides the other two.",
    rows: ["#########", "###   ###", "### . ###", "#  $$$  #", "# .   . #", "###@  ###", "#########"],
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
    name: "Side Entrance",
    briefing: "The drops sit behind a wall with two ways in. Only one of them helps.",
    rows: ["#########", "#  ...  #", "# ### # #", "#   $   #", "# $   $ #", "#   @   #", "#########"],
  },
  {
    name: "Filing Room",
    briefing: "Narrow aisles, four crates. Park one wrong and the aisle is gone.",
    rows: ["#########", "# #.   .#", "# #  # @#", "#  $ #  #", "# # $#$ #", "# #. $. #", "#########"],
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
    name: "Perimeter Watch",
    briefing: "Four crates orbiting a blockhouse. They only leave in the right order.",
    rows: ["########", "# ..   #", "#  $$  #", "# #  # #", "#  $$  #", "#   .. #", "#  @   #", "########"],
  },
  {
    name: "Colonnade",
    briefing: "A hall full of pillars. Every crate has to thread between them.",
    rows: ["#########", "# $.@  .#", "# #$# # #", "# $     #", "# # # #.#", "#       #", "#########"],
  },
  {
    name: "Junction Box",
    briefing: "Two rooms, one junction, and no room to turn a crate around inside it.",
    rows: ["#########", "#   .   #", "#   $   #", "###.#.###", "#  $# $ #", "# @ #   #", "#########"],
  },
  {
    name: "Cross Section",
    briefing: "The walls run on the diagonal. Nothing lines up the way you expect.",
    rows: [
      "#########",
      "#.$    .#",
      "# #    $#",
      "#  #  $ #",
      "#$  #   #",
      "#    # .#",
      "# @ .   #",
      "#########",
    ],
  },
  {
    name: "Five Fingers",
    briefing: "Five crates in one small room. Most of your options here are mistakes.",
    rows: [
      "#########",
      "###   ###",
      "###   ###",
      "#. $ .$ #",
      "# $.@$  #",
      "### . ###",
      "###.$ ###",
      "#########",
    ],
  },
  {
    name: "The Pit",
    briefing: "Three crates stacked against a blockhouse, and the drops are the far corner.",
    rows: ["########", "# .$   #", "# $  @ #", "# $##  #", "#  ##  #", "#      #", "#   .. #", "########"],
  },
  {
    name: "Blind Alley",
    briefing: "A notched room where the obvious push is almost always the losing one.",
    rows: ["#########", "#.  #   #", "#  .#   #", "#  $    #", "#@ $#   #", "# .$    #", "#########"],
  },
  {
    name: "Split Cell",
    briefing: "Last mission. Two cells, one gap between them, and every crate needs both.",
    rows: [
      "##########",
      "#    #   #",
      "# $$ # .@#",
      "#  .  $  #",
      "#    #   #",
      "#    # . #",
      "##########",
    ],
  },
];
