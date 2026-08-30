import { Button } from "@/components/ui/8bit/button";
import type { Direction } from "@/game/types";

/**
 * The on-screen d-pad, built from the 8bitcn button so its chunky border and
 * press-down state match the side menu. Grid placement stays in CSS via the
 * modifier classes; the button supplies the framing.
 */
const PAD: { direction: Direction; glyph: string; label: string }[] = [
  { direction: "up", glyph: "▲", label: "Move up" },
  { direction: "left", glyph: "◀", label: "Move left" },
  { direction: "down", glyph: "▼", label: "Move down" },
  { direction: "right", glyph: "▶", label: "Move right" },
];

export function TouchControls({ onMove }: { onMove: (direction: Direction) => void }) {
  return (
    <div className="touch-controls">
      {PAD.map(({ direction, glyph, label }) => (
        <Button
          key={direction}
          variant="secondary"
          className={`touch-controls__btn touch-controls__btn--${direction}`}
          aria-label={label}
          onClick={() => onMove(direction)}
        >
          <span aria-hidden="true">{glyph}</span>
        </Button>
      ))}
    </div>
  );
}
