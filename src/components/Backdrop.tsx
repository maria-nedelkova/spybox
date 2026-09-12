import backdropUrl from "@/assets/backdrop.svg";

/**
 * The mission-briefing backdrop: a dark wash, a starfield and blueprint
 * panels in the corners, with a floor grid receding below the board.
 *
 * One element rather than a layer per effect, and it sits behind everything
 * with pointer events off, so nothing here can catch a click meant for the
 * board. The two pseudo-elements carry the grid and the schematics; see
 * "Backdrop" in style.css.
 */
export function Backdrop() {
  return (
    <div
      className="backdrop"
      aria-hidden="true"
      style={{ "--backdrop-art": `url(${backdropUrl})` } as React.CSSProperties}
    />
  );
}
