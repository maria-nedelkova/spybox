import { useEffect, useRef, useState } from "react";
import { Board } from "@/components/Board";
import { CharacterSelect } from "@/components/CharacterSelect";
import { MissionPanel } from "@/components/MissionPanel";
import { SideMenu } from "@/components/SideMenu";
import { TouchControls } from "@/components/TouchControls";
import { Button } from "@/components/ui/8bit/button";
import type { CharacterId } from "@/game/characters";
import { useGame } from "@/hooks/useGame";
import { useMuted } from "@/hooks/useMuted";
import { loadBest, recordScore } from "@/lib/bestScore";
import { playSound } from "@/lib/sound";

export function App() {
  const [character, setCharacter] = useState<CharacterId | null>(null);

  const {
    level,
    levelIndex,
    levelNames,
    briefing,
    state,
    facing,
    won,
    canUndo,
    hasNextLevel,
    applyMove,
    undo,
    reset,
    nextLevel,
    goToLevel,
  } = useGame();
  const { muted, toggle: toggleMuted } = useMuted();

  const stateRef = useRef(state);
  stateRef.current = state;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const prevRef = useRef({ moves: state.moves, pushes: state.pushes, levelName: level.name });
  useEffect(() => {
    const prev = prevRef.current;
    if (prev.levelName === level.name && !muted && state.moves > prev.moves) {
      playSound(state.pushes > prev.pushes ? "push" : "move");
    }
    prevRef.current = { moves: state.moves, pushes: state.pushes, levelName: level.name };
  }, [state.moves, state.pushes, level.name, muted]);

  const [isMoving, setIsMoving] = useState(false);
  const moveCountRef = useRef(state.moves);
  useEffect(() => {
    if (state.moves === moveCountRef.current) return;
    moveCountRef.current = state.moves;
    setIsMoving(true);
    const timeout = setTimeout(() => setIsMoving(false), 160);
    return () => clearTimeout(timeout);
  }, [state.moves]);

  const [scoreResult, setScoreResult] = useState<{ best: number; isNewBest: boolean } | null>(null);
  useEffect(() => {
    if (!won) {
      setScoreResult(null);
      return;
    }
    if (!mutedRef.current) playSound("win");
    setScoreResult(recordScore(level.name, stateRef.current.moves));
  }, [won, level.name]);

  // Re-read after a win so the panel shows a record set moments ago.
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    setBest(loadBest(level.name));
  }, [level.name, scoreResult]);

  if (!character) {
    return <CharacterSelect onSelect={setCharacter} />;
  }

  return (
    <div className="app">
      <h1 className="title">SPYBOX</h1>

      <div className="layout">
        <SideMenu
          character={character}
          canUndo={canUndo}
          muted={muted}
          onUndo={undo}
          onReset={reset}
          onToggleMuted={toggleMuted}
          onSwitchAgent={() => setCharacter(null)}
        />

        {/* The controls sit outside this row on purpose: inside it, the menu
            and rail would centre against board-plus-controls rather than
            against the board itself. */}
        <div className="layout__stage">
          <Board
            level={level}
            state={state}
            character={character}
            facing={facing}
            moving={isMoving}
          />
        </div>

        <MissionPanel
          levelName={level.name}
          levelIndex={levelIndex}
          levelNames={levelNames}
          briefing={briefing}
          moves={state.moves}
          pushes={state.pushes}
          best={best}
          onSelectLevel={goToLevel}
        />
      </div>

      <TouchControls onMove={applyMove} />

      {won && (
        // Overlaid rather than stacked under the board: adding a block to the
        // flow after the board is measured would push the touch controls past
        // the bottom of the viewport.
        <div className="win-banner" role="status">
          <p className="win-banner__headline">
            {hasNextLevel ? "Level cleared." : "Mission accomplished — all levels cleared!"}
          </p>
          {scoreResult && (
            <p className="win-banner__score">
              {scoreResult.isNewBest ? "New best: " : "Best: "}
              {scoreResult.best} moves
            </p>
          )}
          {hasNextLevel && (
            <Button size="sm" onClick={nextLevel}>
              Next level →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
