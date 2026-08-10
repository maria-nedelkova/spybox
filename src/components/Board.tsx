import { BoxToken } from "@/components/BoxToken";
import { Cell, type TerrainKind } from "@/components/Cell";
import { PlayerToken } from "@/components/PlayerToken";
import type { CharacterId } from "@/game/characters";
import type { Direction, GameState, Level } from "@/game/types";

function terrainAt(level: Level, r: number, c: number): TerrainKind {
  const k = `${r},${c}`;
  if (level.walls.has(k)) return "wall";
  if (!level.floors.has(k)) return "void";
  return level.goals.has(k) ? "goal" : "floor";
}

export function Board({
  level,
  state,
  character,
  facing,
  moving,
}: {
  level: Level;
  state: GameState;
  character: CharacterId;
  facing: Direction;
  moving: boolean;
}) {
  const rows = Array.from({ length: level.height }, (_, r) => r);
  const cols = Array.from({ length: level.width }, (_, c) => c);

  return (
    <div className="board">
      <div
        className="board__terrain"
        style={{ gridTemplateColumns: `repeat(${level.width}, var(--cell-size))` }}
      >
        {rows.map((r) => cols.map((c) => <Cell key={`${r},${c}`} kind={terrainAt(level, r, c)} />))}
      </div>
      <div className="board__tokens">
        {[...state.boxes].map((k) => {
          const [r, c] = k.split(",").map(Number) as [number, number];
          return <BoxToken key={k} r={r} c={c} onGoal={level.goals.has(k)} />;
        })}
        <PlayerToken
          r={state.player.r}
          c={state.player.c}
          character={character}
          facing={facing}
          moving={moving}
        />
      </div>
    </div>
  );
}
