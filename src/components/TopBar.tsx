import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/8bit/button";
import { CHARACTERS, type CharacterId } from "@/game/characters";

export function TopBar({
  levelName,
  moves,
  pushes,
  character,
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
  character: CharacterId;
  canUndo: boolean;
  muted: boolean;
  onUndo: () => void;
  onReset: () => void;
  onToggleMuted: () => void;
  onSwitchAgent: () => void;
}) {
  const characterName = CHARACTERS.find((c) => c.id === character)?.name ?? "agent";

  return (
    <div className="topbar">
      <div className="topbar__info">
        <span className="topbar__level">{levelName}</span>
        <span className="topbar__sep" aria-hidden="true">
          ·
        </span>
        <span>
          Moves <span className="topbar__stat">{moves}</span>
        </span>
        <span className="topbar__sep" aria-hidden="true">
          ·
        </span>
        <span>
          Pushes <span className="topbar__stat">{pushes}</span>
        </span>
      </div>

      <div className="topbar__actions">
        <Button size="sm" variant="secondary" disabled={!canUndo} onClick={onUndo}>
          Undo
        </Button>
        <Button size="sm" variant="secondary" onClick={onReset}>
          Reset
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggleMuted}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          title={muted ? "Unmute sound" : "Mute sound"}
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
        </Button>
        <button
          type="button"
          className="topbar__agent"
          onClick={onSwitchAgent}
          aria-label={`Switch agent — currently ${characterName}`}
          title={`Switch agent — currently ${characterName}`}
        >
          <Avatar character={character} portrait className="topbar__agent-avatar" />
        </button>
      </div>
    </div>
  );
}
