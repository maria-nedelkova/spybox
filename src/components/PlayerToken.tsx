import { Avatar } from "@/components/Avatar";
import type { CharacterId, Expression } from "@/game/characters";
import { CELL_SIZE_PX, CELL_STEP_PX } from "@/game/constants";

export function PlayerToken({
  r,
  c,
  character,
  expression,
}: {
  r: number;
  c: number;
  character: CharacterId;
  expression: Expression;
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
      <Avatar character={character} expression={expression} className="token__avatar" />
    </div>
  );
}
