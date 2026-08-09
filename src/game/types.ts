export type Direction = "up" | "down" | "left" | "right";

export interface Pos {
  readonly r: number;
  readonly c: number;
}

export interface Level {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  /** Wall tiles, keyed by `"r,c"`. */
  readonly walls: ReadonlySet<string>;
  /** Every walkable in-bounds tile (floor, goal, and anything a box/player can stand on), keyed by `"r,c"`. */
  readonly floors: ReadonlySet<string>;
  /** Goal tiles, keyed by `"r,c"`. */
  readonly goals: ReadonlySet<string>;
  readonly playerStart: Pos;
  /** Starting box positions, keyed by `"r,c"`. */
  readonly boxesStart: ReadonlySet<string>;
}

export interface GameState {
  readonly player: Pos;
  /** Current box positions, keyed by `"r,c"`. */
  readonly boxes: ReadonlySet<string>;
  readonly moves: number;
  readonly pushes: number;
}
