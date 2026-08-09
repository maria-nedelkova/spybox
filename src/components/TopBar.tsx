import { Button } from "@/components/ui/8bit/button";

export function TopBar({
  levelName,
  moves,
  pushes,
  canUndo,
  muted,
  onUndo,
  onReset,
  onToggleMuted,
  onSwitchAgent,
}: {
  levelName: string;
  moves: number;
  pushes: number;
  canUndo: boolean;
  muted: boolean;
  onUndo: () => void;
  onReset: () => void;
  onToggleMuted: () => void;
  onSwitchAgent: () => void;
}) {
  return (
    <div className="topbar">
      <span>{levelName}</span>
      <span>
        Moves <span className="topbar__stat">{moves}</span>
      </span>
      <span>
        Pushes <span className="topbar__stat">{pushes}</span>
      </span>
      <Button size="sm" variant="secondary" disabled={!canUndo} onClick={onUndo}>
        Undo
      </Button>
      <Button size="sm" variant="secondary" onClick={onReset}>
        Reset
      </Button>
      <Button size="sm" variant="secondary" onClick={onToggleMuted}>
        {muted ? "🔇" : "🔊"}
      </Button>
      <Button size="sm" variant="secondary" onClick={onSwitchAgent}>
        Switch agent
      </Button>
    </div>
  );
}
