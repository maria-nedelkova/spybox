import type { Direction } from "@/game/types";

export function TouchControls({ onMove }: { onMove: (direction: Direction) => void }) {
  return (
    <div className="touch-controls">
      <button
        type="button"
        className="touch-controls__btn touch-controls__btn--up"
        aria-label="Move up"
        onClick={() => onMove("up")}
      >
        ▲
      </button>
      <button
        type="button"
        className="touch-controls__btn touch-controls__btn--left"
        aria-label="Move left"
        onClick={() => onMove("left")}
      >
        ◀
      </button>
      <button
        type="button"
        className="touch-controls__btn touch-controls__btn--down"
        aria-label="Move down"
        onClick={() => onMove("down")}
      >
        ▼
      </button>
      <button
        type="button"
        className="touch-controls__btn touch-controls__btn--right"
        aria-label="Move right"
        onClick={() => onMove("right")}
      >
        ▶
      </button>
    </div>
  );
}
