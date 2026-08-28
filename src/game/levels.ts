/**
 * Level data as classic Sokoban ASCII grids (see the notation doc in
 * `engine.ts`). Hand-authored — not sourced from any existing level pack.
 *
 * Ordered by minimum push count, the difficulty metric the solver reports:
 * 5, 6, 7, 10, 12, 17, 19, 21, 22, 25, 26, 28, 28, 32, 33, 39, 48.
 * levels.test.ts checks every level is solvable and that the ramp stays
 * monotonic, so a level dropped into the wrong slot fails the suite.
 *
 * The designs lean on what makes Boxworld hard — narrow corridors, one-way
 * alcoves, single doorways and forced push order — rather than on open rooms
 * with more crates, which mostly add tedium. Four motifs recur at growing
 * scale: goal alcoves, a funnel through one doorway, a storage room fed
 * through a side door, and a walled inner room with a single exit.
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
    rows: [
      "#######",
      "#     #",
      "# $ $ #",
      "#  #  #",
      "# .  .#",
      "#  @  #",
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
    name: "Safe House",
    briefing: "Everything on the left has to come through the one side door. Mind the queue.",
    rows: [
      "##########",
      "#   #    #",
      "# $ #    #",
      "#   #    #",
      "# $   .. #",
      "#   #    #",
      "# $ # .  #",
      "#   #    #",
      "#  @#    #",
      "##########",
    ],
  },
  {
    name: "Border Crossing",
    briefing: "Same checkpoint trick, wider ground. The long way round is the only way.",
    rows: [
      "#############",
      "#           #",
      "# $ $ $     #",
      "##### ##### #",
      "#           #",
      "# . . .     #",
      "#     @     #",
      "#############",
    ],
  },
  {
    name: "Cold Storage",
    briefing: "A bigger room past the same door. Park a crate badly and it blocks the next one.",
    rows: [
      "############",
      "#   #      #",
      "# $ #      #",
      "#   #      #",
      "# $    ..  #",
      "#   #      #",
      "# $ #  .   #",
      "#   #      #",
      "#  @#      #",
      "############",
    ],
  },
  {
    name: "The Warehouse",
    briefing: "Three crates, one door, and a lot of floor between you and the marks.",
    rows: [
      "##############",
      "#   #        #",
      "# $ #        #",
      "#   #        #",
      "# $     ..   #",
      "#   #        #",
      "# $ #   .    #",
      "#   #        #",
      "#  @#        #",
      "##############",
    ],
  },
  {
    name: "Inner Circle",
    briefing: "The crates are sealed in a ring with one way out. Get behind them first.",
    rows: [
      "#############",
      "#           #",
      "# ######### #",
      "# #       # #",
      "# # $ $ $ # #",
      "# #       # #",
      "# ##### ### #",
      "#           #",
      "# . . .     #",
      "#     @     #",
      "#############",
    ],
  },
  {
    name: "The Long Way Round",
    briefing: "Every package moves through the one central corridor. No shortcuts.",
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
  {
    name: "Bottleneck",
    briefing: "Four crates, one gap in the wall. Only one gets through at a time.",
    rows: [
      "###########",
      "#         #",
      "# $ $ $ $ #",
      "#### #### #",
      "#         #",
      "# . . . . #",
      "#    @    #",
      "###########",
    ],
  },
  {
    name: "Back Channel",
    briefing: "The way out of the ring is nowhere near the drops. Plan the whole haul.",
    rows: [
      "###############",
      "#             #",
      "# ########### #",
      "# #         # #",
      "# # $  $  $ # #",
      "# #         # #",
      "# ### ####### #",
      "#             #",
      "#     .  .  . #",
      "#      @      #",
      "###############",
    ],
  },
  {
    name: "Deep Cover",
    briefing: "The same central corridor, twice the ground to cover. Order matters more now.",
    rows: [
      "############",
      "#   #      #",
      "# $ #    . #",
      "#   #      #",
      "#  ###     #",
      "# $      . #",
      "#  ###     #",
      "#   #      #",
      "# $ #    . #",
      "#  @#      #",
      "############",
    ],
  },
  {
    name: "Sleeper Cell",
    briefing: "Long hauls, one lane, and no room to turn a crate around once it's moving.",
    rows: [
      "##############",
      "#   #        #",
      "# $ #      . #",
      "#   #        #",
      "#  ###       #",
      "# $        . #",
      "#  ###       #",
      "#   #        #",
      "# $ #      . #",
      "#  @#        #",
      "##############",
    ],
  },
  {
    name: "Exfiltration",
    briefing: "Last mission. Three crates, one gap in the ring, and the whole floor to cross.",
    rows: [
      "#####################",
      "#                   #",
      "# ################# #",
      "# #               # #",
      "# #  $    $    $  # #",
      "# #               # #",
      "# ############# ### #",
      "#                   #",
      "# .     .     .     #",
      "#         @         #",
      "#####################",
    ],
  },
];
