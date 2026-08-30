import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitialState, isWon, move, parseLevel } from "@/game/engine";
import { LEVELS } from "@/game/levels";
import { findPath } from "@/game/path";
import type { Direction, GameState, Level, Pos } from "@/game/types";

/**
 * Gap between the steps of a tapped walk. Matches the token's CSS transition
 * so each step lands just as the next begins and the walk reads as one
 * continuous move rather than a series of hops.
 */
const STEP_MS = 130;

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

interface Slice {
  /** The level this state belongs to — see the reset in useGame(). */
  readonly level: Level;
  readonly current: GameState;
  readonly history: readonly GameState[];
}

function freshSlice(level: Level): Slice {
  return { level, current: createInitialState(level), history: [] };
}

export function useGame() {
  const [levelIndex, setLevelIndex] = useState(0);

  const level: Level = useMemo(
    () => parseLevel(LEVELS[levelIndex]!.name, LEVELS[levelIndex]!.rows),
    [levelIndex],
  );

  const [slice, setSlice] = useState<Slice>(() => freshSlice(level));
  const [facing, setFacing] = useState<Direction>("down");

  // Reset on level change during render, not in an effect. An effect runs
  // *after* this render, which left one render where `level` was the new level
  // but `slice` still held the previous one's crates — and isWon() against that
  // mismatched pair can genuinely read as a win. Switching from Stack Room to
  // First Contact did exactly that, banking a bogus "best: 0 moves".
  const active = slice.level === level ? slice : freshSlice(level);
  if (slice.level !== level) setSlice(active);

  const won = isWon(level, active.current);

  // A tapped walk plays out over several ticks, so any other input has to be
  // able to call it off — otherwise the remaining steps replay against a
  // board that has moved on under them, and a route that avoided every crate
  // starts shoving them.
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelWalk = useCallback(() => {
    if (walkTimer.current === null) return;
    clearTimeout(walkTimer.current);
    walkTimer.current = null;
  }, []);

  const step = useCallback(
    (direction: Direction) => {
      setFacing(direction);
      if (won) return;
      setSlice((s) => {
        const next = move(level, s.current, direction);
        if (next === s.current) return s;
        return { level: s.level, current: next, history: [...s.history, s.current] };
      });
    },
    [level, won],
  );

  const applyMove = useCallback(
    (direction: Direction) => {
      cancelWalk();
      step(direction);
    },
    [cancelWalk, step],
  );

  /**
   * Go to a tapped tile: one move if it is next to the player, otherwise a
   * walk, a tile per tick. No-op when there is no route.
   */
  const walkTo = useCallback(
    (target: Pos) => {
      cancelWalk();
      if (won) return;

      // A neighbouring tile is a plain move rather than a walk, which is what
      // makes tapping a crate push it. findPath will not route onto a crate —
      // deliberately, since barging one on the way past is how a level
      // becomes unwinnable — so a push has to be asked for directly.
      const dr = target.r - active.current.player.r;
      const dc = target.c - active.current.player.c;
      if (Math.abs(dr) + Math.abs(dc) === 1) {
        if (dr === -1) step("up");
        else if (dr === 1) step("down");
        else if (dc === -1) step("left");
        else step("right");
        return;
      }

      const path = findPath(level, active.current, target);
      if (!path || path.length === 0) return;

      let index = 0;
      const takeStep = () => {
        step(path[index]!);
        index += 1;
        walkTimer.current = index < path.length ? setTimeout(takeStep, STEP_MS) : null;
      };
      takeStep();
    },
    [active.current, cancelWalk, level, step, won],
  );

  // Undo, reset and level changes all invalidate a walk in flight, and so
  // does unmounting.
  useEffect(() => cancelWalk, [cancelWalk]);
  useEffect(() => {
    cancelWalk();
  }, [level, cancelWalk]);

  const undo = useCallback(() => {
    cancelWalk();
    setSlice((s) => {
      if (s.history.length === 0) return s;
      const previous = s.history[s.history.length - 1]!;
      return { level: s.level, current: previous, history: s.history.slice(0, -1) };
    });
  }, [cancelWalk]);

  const reset = useCallback(() => {
    cancelWalk();
    setSlice(freshSlice(level));
  }, [cancelWalk, level]);

  const nextLevel = useCallback(() => {
    setLevelIndex((i) => Math.min(i + 1, LEVELS.length - 1));
  }, []);

  const goToLevel = useCallback((index: number) => {
    setLevelIndex(Math.max(0, Math.min(index, LEVELS.length - 1)));
  }, []);

  const hasNextLevel = levelIndex < LEVELS.length - 1;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Enter carries on to the next level once one is cleared, so the
      // keyboard never has to reach for the mouse. Skipped while a control
      // has focus, where Enter already means "press this" — otherwise the
      // banner's own button would fire and advance twice.
      if (e.key === "Enter") {
        if (!won || !hasNextLevel) return;
        if (e.target instanceof HTMLElement && e.target.closest("button, a, [role='button']")) {
          return;
        }
        e.preventDefault();
        nextLevel();
        return;
      }

      const direction = KEY_TO_DIRECTION[e.key];
      if (!direction) return;
      e.preventDefault();
      applyMove(direction);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyMove, hasNextLevel, nextLevel, won]);

  return {
    level,
    levelIndex,
    levelNames: LEVELS.map((l) => l.name),
    briefing: LEVELS[levelIndex]!.briefing,
    state: active.current,
    facing,
    won,
    canUndo: active.history.length > 0,
    hasNextLevel,
    applyMove,
    walkTo,
    undo,
    reset,
    nextLevel,
    goToLevel,
  };
}
