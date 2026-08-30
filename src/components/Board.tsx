import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BoxToken } from "@/components/BoxToken";
import { Cell, type TerrainKind } from "@/components/Cell";
import { PlayerToken } from "@/components/PlayerToken";
import type { CharacterId } from "@/game/characters";
import type { Direction, GameState, Level, Pos } from "@/game/types";
import { useBoardTouch } from "@/hooks/useBoardTouch";

const MAX_CELL_PX = 96;
const MIN_CELL_PX = 14;
/** .board's padding + border on both sides; must match style.css. */
const BOARD_CHROME_PX = 26;
/** Grid gap between cells; must match --cell-gap in style.css. */
const GAP_PX = 2;
/** Slack against sub-pixel rounding in the measurements below. */
const SAFETY_PX = 6;

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
  onMove,
  onWalkTo,
  children,
}: {
  level: Level;
  state: GameState;
  character: CharacterId;
  facing: Direction;
  moving: boolean;
  onMove: (direction: Direction) => void;
  onWalkTo: (target: Pos) => void;
  /** Overlays drawn on top of the puzzle, positioned against the board. */
  children?: ReactNode;
}) {
  const rows = Array.from({ length: level.height }, (_, r) => r);
  const cols = Array.from({ length: level.width }, (_, c) => c);

  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MAX_CELL_PX);

  // Tap a tile to walk to it. The cell is worked out from the grid's
  // geometry rather than from the event target, because the token layer sits
  // over the terrain and would swallow the hit. Where to walk — and whether
  // there is a route at all — is the game's business, not the board's.
  const onTap = useCallback(
    (clientX: number, clientY: number) => {
      const terrain = boardRef.current?.querySelector(".board__terrain");
      if (!terrain) return;

      const rect = terrain.getBoundingClientRect();
      const stride = cellSize + GAP_PX;
      const c = Math.floor((clientX - rect.left) / stride);
      const r = Math.floor((clientY - rect.top) / stride);
      if (r < 0 || c < 0 || r >= level.height || c >= level.width) return;

      onWalkTo({ r, c });
    },
    [cellSize, level.height, level.width, onWalkTo]
  );

  // The mobile layout is the board and the menu panel and nothing else, so
  // the board itself has to take movement input there.
  useBoardTouch(boardRef, onMove, onTap);

  // Shrink the cells (never past MAX_CELL_PX) so even the widest/tallest level
  // fits without scrolling.
  //
  // Height comes from the stage, the box the board shares with the title and
  // the d-pad. Its own height is settled before the board is sized — it is
  // the layout's minmax(0, 1fr) row, which cannot be grown by its contents —
  // so measuring it is not the loop that measuring the board's own position
  // would be. It also means anything outside the stage needs no accounting
  // at all: the menu bar under the board on a narrow screen has already been
  // taken out of the stage's height by the grid.
  //
  // Width cannot work the same way, because the board's column hugs it so
  // that the menu and rail keep a fixed distance from its edges — the
  // column's width *is* the board's width. The menu and rail are sized
  // independently of the board, so the row's width minus whichever of them
  // is beside it is a budget that does not depend on the board at all. Which
  // of them that is changes with the layout, so each is charged by whether
  // it shares the board's grid row rather than by guessing from geometry.
  useLayoutEffect(() => {
    function recalc() {
      const el = boardRef.current;
      if (!el) return;
      const layout = el.closest<HTMLElement>(".layout");
      const stage = el.parentElement;
      if (!stage) return;

      const stageRow = getComputedStyle(stage).gridRowStart;
      const beside = [
        layout?.querySelector<HTMLElement>(".menu"),
        layout?.querySelector<HTMLElement>(".layout__rail"),
      ].filter(
        (node): node is HTMLElement =>
          !!node &&
          node.offsetWidth > 0 &&
          getComputedStyle(node).gridRowStart === stageRow
      );

      // Stacked with the board inside the stage: the title above, the d-pad
      // below. Either can be hidden, in which case it costs nothing.
      const stacked = [...stage.children].filter(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && node !== el && node.offsetHeight > 0
      );

      const stageStyles = getComputedStyle(stage);
      const columnGap = layout ? parseFloat(getComputedStyle(layout).columnGap) || 0 : 0;

      // Gaps are charged per track, not per visible neighbour: the stage's
      // rows exist whether or not anything is in them, so hiding the title or
      // the d-pad frees their height but not the gap beside it.
      const tracks = stageStyles.gridTemplateRows.split(" ").filter(Boolean).length;
      const rowGaps = Math.max(0, tracks - 1) * (parseFloat(stageStyles.rowGap) || 0);

      const availableHeight =
        stage.clientHeight -
        stacked.reduce((total, node) => total + node.offsetHeight, 0) -
        rowGaps -
        SAFETY_PX;
      const availableWidth =
        (layout?.clientWidth ?? window.innerWidth) -
        beside.reduce((total, node) => total + node.offsetWidth + columnGap, 0);
      const fitsWidth = (availableWidth - BOARD_CHROME_PX - (level.width - 1) * GAP_PX) / level.width;
      const fitsHeight =
        (availableHeight - BOARD_CHROME_PX - (level.height - 1) * GAP_PX) / level.height;
      setCellSize(Math.max(MIN_CELL_PX, Math.floor(Math.min(MAX_CELL_PX, fitsWidth, fitsHeight))));
    }
    recalc();
    window.addEventListener("resize", recalc);
    // The row can also change width without the window resizing — when the
    // layout drops the mission rail at the narrow breakpoint, for instance.
    const layout = boardRef.current?.closest(".layout");
    const observer = layout ? new ResizeObserver(recalc) : null;
    if (layout && observer) observer.observe(layout);
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

      {/* Overlays belong in here rather than beside the board: .board is the
          positioning context, so anything absolute in this slot centres on
          the puzzle itself and not on whatever box happens to contain it. */}
      {children}
    </div>
  );
}
