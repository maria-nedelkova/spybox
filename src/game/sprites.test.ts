import { describe, expect, test } from "bun:test";
import { getAnyaSprite, getBondSprite, SPRITE_PALETTE } from "./sprites";

const EXPRESSIONS = ["neutral", "determined", "surprised", "sleepy", "happy"] as const;
const SPRITES = { anya: getAnyaSprite, bond: getBondSprite };

describe("pixel sprites", () => {
  for (const [name, getSprite] of Object.entries(SPRITES)) {
    for (const expression of EXPRESSIONS) {
      test(`${name}/${expression} is a well-formed, mirrored, fully-paletted grid`, () => {
        const matrix = getSprite(expression);

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
  }

  test("expression overrides actually change the sprite", () => {
    const neutral = getAnyaSprite("neutral");
    const surprised = getAnyaSprite("surprised");
    expect(surprised).not.toEqual(neutral);
  });

  test("anya and bond sprites share the same dimensions", () => {
    const anya = getAnyaSprite("neutral");
    const bond = getBondSprite("neutral");
    expect(anya.length).toBe(bond.length);
    expect(anya[0]!.length).toBe(bond[0]!.length);
  });
});
