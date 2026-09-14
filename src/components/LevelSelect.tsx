import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Tiles per row in the expanded grid; the arrow-key roving focus steps by this. */
const COLUMNS = 8;

const NAV_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Compact level picker: a "LVL 06/32" stepper that expands into a numbered
 * grid. One button per level would wrap to eleven rows at 32 levels and shove
 * the board off-screen, so the full list lives in an absolutely-positioned
 * popover — opening it must not change the header height, because Board.tsx
 * only re-measures its available space on mount and on window resize.
 */
export function LevelSelect({
  names,
  activeIndex,
  unlockedCount,
  onSelect,
}: {
  names: readonly string[];
  activeIndex: number;
  /** Levels below this are playable; the rest are locked. */
  unlockedCount: number;
  onSelect: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  // Which locked level was reached for, if any, so the press can be answered
  // with a reason. On a touch screen the tile's title never shows, so without
  // this a tap on a locked level does nothing at all.
  const [blocked, setBlocked] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Opening with the keyboard should land on the level you are already playing.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const target =
      panel?.querySelector<HTMLButtonElement>('[data-active="true"]') ??
      panel?.querySelector<HTMLButtonElement>("button");
    target?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setBlocked(null);
    toggleRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (!NAV_KEYS.includes(event.key)) return;

    // Tiles only, by class rather than by tag: the panel also holds the
    // locked-level message, and the grid the arrow keys walk is just the
    // numbers.
    const tiles = [
      ...(panelRef.current?.querySelectorAll<HTMLButtonElement>(".level-nav__tile") ?? []),
    ];
    const current = tiles.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;

    // The game moves the player on arrow keys via a window listener, so keep
    // these from escaping the popover.
    event.preventDefault();
    event.stopPropagation();

    let next = current;
    if (event.key === "ArrowLeft") next = current - 1;
    else if (event.key === "ArrowRight") next = current + 1;
    else if (event.key === "ArrowUp") next = current - COLUMNS;
    else if (event.key === "ArrowDown") next = current + COLUMNS;
    else if (event.key === "Home") next = 0;
    else next = tiles.length - 1;

    tiles[Math.min(Math.max(next, 0), tiles.length - 1)]?.focus();
  }

  const activeName = names[activeIndex] ?? "";

  return (
    <div className="level-nav" ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="level-nav__step"
        onClick={() => onSelect(activeIndex - 1)}
        disabled={activeIndex === 0}
        aria-label="Previous level"
        title="Previous level"
      >
        ◀
      </button>

      <button
        type="button"
        ref={toggleRef}
        className={cn("level-nav__current", open && "level-nav__current--open")}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={`Level ${activeIndex + 1} of ${names.length}: ${activeName}. Choose a level`}
        title="Choose a level"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="level-nav__kicker" aria-hidden="true">
          LVL
        </span>
        <span className="level-nav__num" aria-hidden="true">
          {pad(activeIndex + 1)}
        </span>
        <span className="level-nav__total" aria-hidden="true">
          /{names.length}
        </span>
        <span className="level-nav__caret" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      <button
        type="button"
        className="level-nav__step"
        onClick={() => onSelect(activeIndex + 1)}
        disabled={activeIndex + 1 >= unlockedCount}
        aria-label="Next level"
        title={
          activeIndex + 1 >= unlockedCount
            ? "Finish this level to carry on"
            : "Next level"
        }
      >
        ▶
      </button>

      {open && (
        <div
          className="level-nav__panel"
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="Select level"
        >
          {names.map((name, i) => {
            // Locked levels keep their number but not their name: it is the
            // one thing about a level you have not reached that is worth not
            // giving away.
            const locked = i >= unlockedCount;
            return (
              <button
                key={`${i}-${name}`}
                type="button"
                data-active={i === activeIndex}
                aria-current={i === activeIndex ? "true" : undefined}
                aria-label={locked ? `Level ${i + 1}: locked` : `Level ${i + 1}: ${name}`}
                title={
                  locked ? `Locked — finish level ${unlockedCount}` : `${i + 1}. ${name}`
                }
                className={cn(
                  "level-nav__tile",
                  i === activeIndex && "level-nav__tile--active",
                  locked && "level-nav__tile--locked",
                )}
                onClick={() => {
                  // Locked tiles stay clickable so the press can be answered
                  // with a reason rather than nothing at all.
                  if (locked) {
                    setBlocked(i);
                    return;
                  }
                  onSelect(i);
                  close();
                }}
              >
                {i + 1}
              </button>
            );
          })}

          {blocked !== null && (
            <p className="level-nav__blocked" role="status">
              Level {blocked + 1} is locked. Finish level {unlockedCount} to
              reach it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
