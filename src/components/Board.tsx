import { Cell, type CellKind } from "@/components/Cell";
import { key } from "@/game/engine";
import type { GameState, Level } from "@/game/types";

function kindAt(level: Level, state: GameState, r: number, c: number): CellKind {
  const k = `${r},${c}`;
  if (level.walls.has(k)) return "wall";
  if (!level.floors.has(k)) return "void";

  const isGoal = level.goals.has(k);
  const isPlayer = key(state.player) === k;
  const isBox = state.boxes.has(k);

  if (isPlayer) return isGoal ? "player-goal" : "player";
  if (isBox) return isGoal ? "box-goal" : "box";
  return isGoal ? "goal" : "floor";
}

export function Board({ level, state }: { level: Level; state: GameState }) {
  const rows = Array.from({ length: level.height }, (_, r) => r);
  const cols = Array.from({ length: level.width }, (_, c) => c);

  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${level.width}, var(--cell-size))` }}
    >
      {rows.map((r) =>
        cols.map((c) => <Cell key={`${r},${c}`} kind={kindAt(level, state, r, c)} />),
      )}
    </div>
  );
}
