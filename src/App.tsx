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

  // The same panel appears in the rail on a wide screen and inside the level
  // button's popover on a narrow one; only ever one of the two is rendered.
  const missionProps = {
    levelName: level.name,
    levelIndex,
    levelNames,
    briefing,
    moves: state.moves,
    pushes: state.pushes,
    best,
    onSelectLevel: goToLevel,
  };

  return (
    <div className="app">
      <h1 className="title">SPYBOX</h1>

      <div className="layout">
        <SideMenu
          character={character}
          canUndo={canUndo}
          muted={muted}
          levelIndex={levelIndex}
          levelCount={levelNames.length}
          levelPanel={<MissionPanel {...missionProps} bare />}
          onUndo={undo}
          onReset={reset}
          onToggleMuted={toggleMuted}
          onSwitchAgent={() => setCharacter(null)}
        />

        <div className="layout__stage">
          <Board
            level={level}
            state={state}
            character={character}
            facing={facing}
            moving={isMoving}
            onSwipe={applyMove}
          />
        </div>

        {/* Same job as .layout__stage: a plain cell the grid can stretch, so
            the card inside it can shrink to the row on a short viewport
            instead of pushing the touch controls off the bottom. */}
        <div className="layout__rail">
          <MissionPanel {...missionProps} />
        </div>

        <TouchControls onMove={applyMove} />
      </div>

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
