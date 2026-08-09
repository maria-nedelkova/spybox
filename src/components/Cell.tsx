import { cn } from "@/lib/utils";

export type CellKind = "void" | "wall" | "floor" | "goal" | "player" | "player-goal" | "box" | "box-goal";

const LABEL: Partial<Record<CellKind, string>> = {
  player: "P",
  "player-goal": "P",
  box: "B",
  "box-goal": "B",
};

export function Cell({ kind }: { kind: CellKind }) {
  return (
    <div className={cn("cell", `cell--${kind}`)}>
      {LABEL[kind] && <span className="cell__glyph">{LABEL[kind]}</span>}
    </div>
  );
}
