import { Avatar } from "@/components/Avatar";
import type { CharacterId } from "@/game/characters";
import type { Direction } from "@/game/types";

export function PlayerToken({
  r,
  c,
  character,
  facing,
  moving,
}: {
  r: number;
  c: number;
  character: CharacterId;
  facing: Direction;
  moving: boolean;
}) {
  return (
    <div
      className="token token--player"
      style={{
        width: "var(--cell-size)",
        height: "var(--cell-size)",
        // Percentage of the token's own width, not var(--cell-size) — see the
        // note in BoxToken about transforms not recomputing on var changes.
        transform: `translate(
          calc(${c} * (100% + var(--cell-gap))),
          calc(${r} * (100% + var(--cell-gap)))
        )`,
      }}
    >
      <Avatar character={character} facing={facing} moving={moving} className="token__avatar" />
    </div>
  );
}
