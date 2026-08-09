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
  readonly current: GameState;
  readonly history: readonly GameState[];
}

function freshSlice(level: Level): Slice {
  return { current: createInitialState(level), history: [] };
}

export function useGame() {
  const [levelIndex, setLevelIndex] = useState(0);

  const level: Level = useMemo(
    () => parseLevel(LEVELS[levelIndex]!.name, LEVELS[levelIndex]!.rows),
    [levelIndex],
  );

  const [slice, setSlice] = useState<Slice>(() => freshSlice(level));

  useEffect(() => {
    setSlice(freshSlice(level));
  }, [level]);

  const won = isWon(level, slice.current);

  const applyMove = useCallback(
    (direction: Direction) => {
      if (won) return;
      setSlice((s) => {
        const next = move(level, s.current, direction);
        if (next === s.current) return s;
        return { current: next, history: [...s.history, s.current] };
      });
    },
    [level, won],
  );

  const undo = useCallback(() => {
    setSlice((s) => {
      if (s.history.length === 0) return s;
      const previous = s.history[s.history.length - 1]!;
      return { current: previous, history: s.history.slice(0, -1) };
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
    state: slice.current,
    won,
    canUndo: slice.history.length > 0,
    hasNextLevel: levelIndex < LEVELS.length - 1,
    applyMove,
    undo,
    reset,
    nextLevel,
    goToLevel,
  };
}
