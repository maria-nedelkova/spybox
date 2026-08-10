/**
 * Level data as classic Sokoban ASCII grids (see the notation doc in
 * `engine.ts`). Hand-authored — not sourced from any existing level pack.
 * Solvability is checked automatically in levels.test.ts.
 */
export interface LevelSource {
  readonly name: string;
  readonly briefing: string;
  readonly rows: readonly string[];
}

export const LEVELS: readonly LevelSource[] = [
  {
    name: "Dead Drop",
    briefing: "One package, one drop point. Don't overthink it.",
    rows: ["#####", "#@$.#", "#####"],
  },
  {
    name: "Double Agent",
    briefing: "Two contacts, two safehouses. Keep them straight.",
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
    briefing: "Wider room, same job. Nobody sees the handoff.",
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
    briefing: "Three parcels. Trust no one, especially the middle one.",
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
    briefing: "The direct route is sealed. Go around, quietly.",
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
    briefing: "Three separate channels. Work them one at a time.",
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
    briefing: "Last mission. Both packages, both walls, no mistakes.",
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
