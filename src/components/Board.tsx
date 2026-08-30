import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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
}: {
  level: Level;
  state: GameState;
  character: CharacterId;
  facing: Direction;
  moving: boolean;
  onMove: (direction: Direction) => void;
  onWalkTo: (target: Pos) => void;
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
  // The height budget is deliberately derived from the title and the touch
  // controls rather than from the board's own position on screen. The page is
  // vertically centred, so measuring the board's top would be self-referential:
  // a smaller board leaves more free space, centring pushes the board further
  // down, the budget shrinks again, and the cells collapse. Sizing against
  // siblings whose height does not depend on the board breaks that loop.
  //
  // Width has the same problem from the other direction. The board's own
  // column hugs it, so that the menu and rail sit a fixed distance from the
  // board's edges rather than drifting off with the window — which means the
  // column's width is the board's width and measuring it would be circular
  // too. The menu, rail and d-pad are all sized independently of the board,
  // so the row's width minus whichever of them is beside it is a budget that
  // does not depend on the board at all.
  //
  // Which of them is beside it changes with the layout: the rail is dropped
  // on a narrow screen, the menu drops under the board there, and on a
  // sideways phone the d-pad moves out of the row below and in alongside.
  // So each one is charged to width or to height depending on whether it
  // shares the board's grid row — reading the placement rather than guessing
  // it from geometry.
  useLayoutEffect(() => {
    function recalc() {
      const el = boardRef.current;
      if (!el) return;
      const app = el.closest(".app");
      const layout = el.closest<HTMLElement>(".layout");
      const stage = el.parentElement;
      const title = app?.querySelector<HTMLElement>(".title");

      const stageRow = stage ? getComputedStyle(stage).gridRowStart : "";
      const siblings = [
        layout?.querySelector<HTMLElement>(".menu"),
        layout?.querySelector<HTMLElement>(".layout__rail"),
        layout?.querySelector<HTMLElement>(".touch-controls"),
      ].filter((node): node is HTMLElement => !!node && node.offsetWidth > 0);
      const beside = siblings.filter(
        (node) => getComputedStyle(node).gridRowStart === stageRow
      );
      const above = siblings.filter((node) => !beside.includes(node));

      const layoutStyles = layout ? getComputedStyle(layout) : null;
      const columnGap = layoutStyles ? parseFloat(layoutStyles.columnGap) || 0 : 0;
      const rowGap = layoutStyles ? parseFloat(layoutStyles.rowGap) || 0 : 0;

      // Measured rather than a fixed allowance: the page's padding and the
      // gap under the title both shrink on a sideways phone, and a constant
      // tuned for the desktop layout charged the board about 56px it could
      // have used — a seventh of the height there.
      const appStyles = app instanceof HTMLElement ? getComputedStyle(app) : null;
      const titleHeight = title?.offsetHeight ?? 0;
      const chrome =
        (appStyles
          ? parseFloat(appStyles.paddingTop) + parseFloat(appStyles.paddingBottom)
          : 0) +
        titleHeight +
        (titleHeight > 0 && appStyles ? parseFloat(appStyles.rowGap) || 0 : 0) +
        above.reduce((total, node) => total + node.offsetHeight + rowGap, 0) +
        SAFETY_PX;
      const availableHeight = window.innerHeight - chrome;
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
    </div>
  );
}
