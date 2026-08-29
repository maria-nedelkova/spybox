import { useCallback, useEffect, useMemo, useState } from "react";
import { createInitialState, isWon, move, parseLevel } from "@/game/engine";
import { LEVELS } from "@/game/levels";
import type { Direction, GameState, Level } from "@/game/types";

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

  const applyMove = useCallback(
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

  const undo = useCallback(() => {
    setSlice((s) => {
      if (s.history.length === 0) return s;
      const previous = s.history[s.history.length - 1]!;
      return { level: s.level, current: previous, history: s.history.slice(0, -1) };
    });
  }, []);

  const reset = useCallback(() => {
    setSlice(freshSlice(level));
  }, [level]);

  const nextLevel = useCallback(() => {
    setLevelIndex((i) => Math.min(i + 1, LEVELS.length - 1));
  }, []);

  const goToLevel = useCallback((index: number) => {
    setLevelIndex(Math.max(0, Math.min(index, LEVELS.length - 1)));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[e.key];
      if (!direction) return;
      e.preventDefault();
      applyMove(direction);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyMove]);

  return {
    level,
    levelIndex,
    levelNames: LEVELS.map((l) => l.name),
    briefing: LEVELS[levelIndex]!.briefing,
    state: active.current,
    facing,
    won,
    canUndo: active.history.length > 0,
    hasNextLevel: levelIndex < LEVELS.length - 1,
    applyMove,
    undo,
    reset,
    nextLevel,
    goToLevel,
  };
}
