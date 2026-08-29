import { Avatar } from "@/components/Avatar";
import { CHARACTERS, type CharacterId } from "@/game/characters";

/**
 * The game's controls as a vertical menu down the left edge. Every item is the
 * same width and carries a text label — the icons sit alongside the words
 * rather than replacing them, so nothing depends on recognising a glyph.
 */
export function SideMenu({
  character,
  canUndo,
  muted,
  onUndo,
  onReset,
  onToggleMuted,
  onSwitchAgent,
}: {
  character: CharacterId;
  canUndo: boolean;
  muted: boolean;
  onUndo: () => void;
  onReset: () => void;
  onToggleMuted: () => void;
  onSwitchAgent: () => void;
}) {
  const characterName = CHARACTERS.find((c) => c.id === character)?.name ?? "Agent";

  return (
    <nav className="menu" aria-label="Game controls">
      <button type="button" className="menu__item" onClick={onUndo} disabled={!canUndo}>
        <span className="menu__icon" aria-hidden="true">
          ↺
        </span>
        <span className="menu__label">Undo</span>
      </button>

      <button type="button" className="menu__item" onClick={onReset}>
        <span className="menu__icon" aria-hidden="true">
          ⟳
        </span>
        <span className="menu__label">Reset</span>
      </button>

      <button
        type="button"
        className="menu__item"
        onClick={onToggleMuted}
        aria-pressed={!muted}
        title={muted ? "Sound off — click to unmute" : "Sound on — click to mute"}
      >
        <span className="menu__icon" aria-hidden="true">
          {muted ? "🔇" : "🔊"}
        </span>
        <span className="menu__label">Sound</span>
        <span className="menu__state">{muted ? "off" : "on"}</span>
      </button>

      <button
        type="button"
        className="menu__item menu__item--agent"
        onClick={onSwitchAgent}
        title={`Switch agent — currently ${characterName}`}
      >
        <span className="menu__icon menu__icon--avatar" aria-hidden="true">
          <Avatar character={character} portrait className="menu__avatar" />
        </span>
        <span className="menu__label">{characterName}</span>
        <span className="menu__state">switch</span>
      </button>
    </nav>
  );
}
