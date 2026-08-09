import type { Palette, SpriteMatrix, SpriteRow } from "@/components/PixelSprite";
import type { Expression } from "@/game/characters";

/**
 * Hand-authored 10x14 pixel sprites, each defined as a left half (5 cols)
 * that gets mirrored into the full 10-col width — keeps the sprites
 * symmetric and halves the authoring work. "O" is a shared ink-outline
 * token so both characters read as the same flat, thick-outlined 8-bit
 * style.
 */
export const SPRITE_PALETTE: Palette = {
  O: "#1a140f",
  H: "#f7d774",
  S: "#ff6fa8",
  F: "#ffd9b0",
  P: "#3fae5c",
  L: "#ff9fa8",
  M: "#5a3420",
  J: "#333a52",
  N: "#262b38",
  Z: "#161822",
  Fu: "#d9a441",
  Fd: "#a5701f",
  Ey: "#241a12",
  Sn: "#f1d9a0",
  Nz: "#1a140f",
  Bw: "#1a1a1a",
  Tg: "#e78a9a",
};

interface ExpressionOverride {
  readonly eyeRow?: SpriteRow;
  readonly mouthRow?: SpriteRow;
}

interface SpriteDef {
  readonly base: readonly SpriteRow[];
  readonly eyeRowIndex: number;
  readonly mouthRowIndex: number;
  readonly expressions: Partial<Record<Expression, ExpressionOverride>>;
}

const ANYA: SpriteDef = {
  base: [
    [".", ".", ".", "O", "H"],
    [".", ".", "O", "H", "H"],
    [".", "O", "H", "S", "H"],
    ["O", "H", "H", "F", "F"],
    ["O", "H", "F", "P", "F"], // eyeRow
    ["O", "H", "F", "L", "F"],
    ["O", "H", "F", "M", "F"], // mouthRow
    [".", "O", "F", "F", "O"],
    [".", ".", "O", "J", "J"],
    [".", "F", "J", "J", "J"],
    [".", "O", "J", "J", "O"],
    [".", ".", "O", "N", "N"],
    [".", ".", "O", "N", "N"],
    [".", ".", "O", "Z", "O"],
  ],
  eyeRowIndex: 4,
  mouthRowIndex: 6,
  expressions: {
    determined: { mouthRow: ["O", "H", "M", "M", "F"] },
    surprised: { eyeRow: ["O", "H", "P", "P", "F"], mouthRow: ["O", "F", "M", "M", "F"] },
    sleepy: { eyeRow: ["O", "H", "F", "H", "F"] },
    happy: { mouthRow: ["O", "H", "F", "M", "M"] },
  },
};

const BOND: SpriteDef = {
  base: [
    ["Fd", ".", ".", ".", "."],
    ["Fd", "Fd", ".", ".", "Fu"],
    ["Fd", "Fd", "O", "Fu", "Fu"],
    ["O", "Fu", "Fu", "Fu", "Fu"],
    ["O", "Fu", "Fu", "Ey", "Fu"], // eyeRow
    ["O", "Fu", "Fu", "Sn", "Sn"],
    ["O", "Fu", "Sn", "Sn", "Nz"],
    ["O", "Fu", "Sn", "Sn", "O"], // mouthRow
    [".", "O", "Fu", "Fu", "O"],
    [".", "O", "Fu", "Bw", "Bw"],
    [".", "O", "Fu", "Fu", "Fu"],
    [".", ".", "O", "Fu", "Fu"],
    [".", ".", "O", "Fd", "Fd"],
    [".", ".", "O", "Fd", "O"],
  ],
  eyeRowIndex: 4,
  mouthRowIndex: 7,
  expressions: {
    happy: { mouthRow: ["O", "Fu", "Tg", "Tg", "O"] },
    surprised: { eyeRow: ["O", "Fu", "Ey", "Ey", "Fu"] },
    determined: { mouthRow: ["O", "Fu", "O", "O", "O"] },
    sleepy: { eyeRow: ["O", "Fu", "Fu", "Fu", "Fu"] },
  },
};

function mirrorRow(half: SpriteRow): SpriteRow {
  return [...half, ...[...half].reverse()];
}

function buildMatrix(def: SpriteDef, expression: Expression): SpriteMatrix {
  const override = def.expressions[expression];
  const rows = def.base.map((row, i) => {
    if (i === def.eyeRowIndex && override?.eyeRow) return override.eyeRow;
    if (i === def.mouthRowIndex && override?.mouthRow) return override.mouthRow;
    return row;
  });
  return rows.map(mirrorRow);
}

export function getAnyaSprite(expression: Expression): SpriteMatrix {
  return buildMatrix(ANYA, expression);
}

export function getBondSprite(expression: Expression): SpriteMatrix {
  return buildMatrix(BOND, expression);
}
