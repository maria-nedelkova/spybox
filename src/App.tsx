import { Board } from "@/components/Board";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/8bit/button";
import { useGame } from "@/hooks/useGame";

export function App() {
  const { level, state, won, canUndo, hasNextLevel, undo, reset, nextLevel } = useGame();

  return (
    <div className="app">
      <h1 className="title">SPYBOX</h1>
      <TopBar
        levelName={level.name}
        moves={state.moves}
        pushes={state.pushes}
        canUndo={canUndo}
        onUndo={undo}
        onReset={reset}
      />
      <Board level={level} state={state} />
      {won && (
        <div className="win-banner">
          <p>Level cleared.</p>
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
