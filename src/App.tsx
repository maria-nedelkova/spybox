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
    walkTo,
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

        {/* The title and the d-pad live in here rather than in the row
            outside it, which is what lets both sit a fixed distance from the
            board's edge — the same distance the menu and rail keep. */}
        <div className="layout__stage">
          <h1 className="title">SPYBOX</h1>

          <Board
            level={level}
            state={state}
            character={character}
            facing={facing}
            moving={isMoving}
            onMove={applyMove}
            onWalkTo={walkTo}
          >
            {won && (
              // Inside the board so it centres on the puzzle rather than on
              // the viewport, and overlaid rather than stacked: a block in
              // the flow after the board is measured would push the touch
              // controls off the bottom.
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
          </Board>

          <TouchControls onMove={applyMove} />
        </div>

        {/* Same job as .layout__stage: a plain cell the grid can stretch, so
            the card inside it can shrink to the row on a short viewport
            instead of pushing the touch controls off the bottom. */}
        <div className="layout__rail">
          <MissionPanel {...missionProps} />
        </div>
      </div>
    </div>
  );
}
