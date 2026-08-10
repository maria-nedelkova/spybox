import { Avatar } from "@/components/Avatar";
import type { CharacterId } from "@/game/characters";
import { CELL_SIZE_PX, CELL_STEP_PX } from "@/game/constants";
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
        width: CELL_SIZE_PX,
        height: CELL_SIZE_PX,
        transform: `translate(${c * CELL_STEP_PX}px, ${r * CELL_STEP_PX}px)`,
      }}
    >
      <Avatar character={character} facing={facing} moving={moving} className="token__avatar" />
    </div>
  );
}
