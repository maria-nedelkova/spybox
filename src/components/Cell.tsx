import { Avatar } from "@/components/Avatar";
import type { CharacterId } from "@/game/characters";
import { cn } from "@/lib/utils";

export type CellKind = "void" | "wall" | "floor" | "goal" | "player" | "player-goal" | "box" | "box-goal";

const LABEL: Partial<Record<CellKind, string>> = {
  box: "💼",
  "box-goal": "💼",
};

const PLAYER_KINDS: readonly CellKind[] = ["player", "player-goal"];

export function Cell({ kind, character }: { kind: CellKind; character: CharacterId }) {
  const isPlayer = PLAYER_KINDS.includes(kind);
  return (
    <div className={cn("cell", `cell--${kind}`)}>
      {isPlayer && <Avatar character={character} className="cell__avatar" />}
      {LABEL[kind] && <span className="cell__glyph">{LABEL[kind]}</span>}
    </div>
  );
}
