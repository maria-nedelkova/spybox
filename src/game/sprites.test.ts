import { describe, expect, test } from "bun:test";
import { getBondSprite, SPRITE_PALETTE } from "./sprites";

const EXPRESSIONS = ["neutral", "determined", "surprised", "sleepy", "happy"] as const;

describe("Bond pixel sprite", () => {
  for (const expression of EXPRESSIONS) {
    test(`${expression} is a well-formed, mirrored, fully-paletted grid`, () => {
      const matrix = getBondSprite(expression);

      expect(matrix.length).toBeGreaterThan(0);
      const width = matrix[0]!.length;
      expect(width % 2).toBe(0);

      for (const row of matrix) {
        expect(row.length).toBe(width);
        // Every row is left/right symmetric, since it's built by mirroring a half-row.
        for (let c = 0; c < width / 2; c++) {
          expect(row[c]).toBe(row[width - 1 - c]);
        }
        for (const token of row) {
          if (token === ".") continue; // transparent, deliberately not in the palette
          expect(SPRITE_PALETTE[token]).toBeDefined();
        }
      }
    });
  }

  test("expression overrides actually change the sprite", () => {
    const neutral = getBondSprite("neutral");
    const surprised = getBondSprite("surprised");
    expect(surprised).not.toEqual(neutral);
  });
});
