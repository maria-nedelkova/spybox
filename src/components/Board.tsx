import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { BoxToken } from "@/components/BoxToken";
import { Cell, type TerrainKind } from "@/components/Cell";
import { PlayerToken } from "@/components/PlayerToken";
import type { CharacterId } from "@/game/characters";
import type { Direction, GameState, Level } from "@/game/types";

const MAX_CELL_PX = 56;
const MIN_CELL_PX = 14;
/** .board's padding + border on both sides; must match style.css. */
const BOARD_CHROME_PX = 26;
/** Grid gap between cells; must match --cell-gap in style.css. */
const GAP_PX = 2;
/** Room left under the board for the touch controls. */
const SPACE_BELOW_BOARD_PX = 130;

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

  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MAX_CELL_PX);

  // Shrink the cells (never past 56px) so even the widest/tallest level fits
  // without scrolling. Neither budget is a fixed amount: the header and the
  // side columns change size with the viewport, so measure both rather than
  // subtracting guessed constants. Width comes from the containing column
  // (NOT the window) — the menu and mission panel flank the board, and using
  // the full window width would size cells that overlap them.
  useLayoutEffect(() => {
    function recalc() {
      const el = boardRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const availableHeight = window.innerHeight - top - SPACE_BELOW_BOARD_PX;
      const availableWidth = el.parentElement?.clientWidth ?? window.innerWidth;
      const fitsWidth = (availableWidth - BOARD_CHROME_PX - (level.width - 1) * GAP_PX) / level.width;
      const fitsHeight =
        (availableHeight - BOARD_CHROME_PX - (level.height - 1) * GAP_PX) / level.height;
      setCellSize(Math.max(MIN_CELL_PX, Math.floor(Math.min(MAX_CELL_PX, fitsWidth, fitsHeight))));
    }
    recalc();
    window.addEventListener("resize", recalc);
    // The column can also change width without the window resizing — when the
    // layout switches between stacked and three-column, for instance.
    const parent = boardRef.current?.parentElement;
    const observer = parent ? new ResizeObserver(recalc) : null;
    if (parent && observer) observer.observe(parent);
    return () => {
      window.removeEventListener("resize", recalc);
      observer?.disconnect();
    };
  }, [level.width, level.height]);

  return (
    <div
      ref={boardRef}
      className="board"
      style={{ "--cell-size": `${cellSize}px` } as CSSProperties}
    >
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
