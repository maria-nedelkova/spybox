import type { Palette, SpriteMatrix, SpriteRow } from "@/components/PixelSprite";
import type { Expression } from "@/game/characters";

/**
 * Bond's hand-authored 10x14 pixel sprite, defined as a left half (5 cols)
 * that gets mirrored into the full 10-col width. Anya is rendered from an
 * image sprite sheet instead (see Avatar.tsx).
 */
export const SPRITE_PALETTE: Palette = {
  O: "#1a140f",
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

export function getBondSprite(expression: Expression): SpriteMatrix {
  return buildMatrix(BOND, expression);
}
