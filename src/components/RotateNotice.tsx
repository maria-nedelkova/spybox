/**
 * Spybox is landscape-only on phones. The levels are wide rooms — up to 11x7
 * — so a sideways phone matches their shape, and the board comes out around
 * half again as large as it would upright. That is also what lets the levels
 * stay as they are: squaring them off is the alternative to picking the
 * orientation that already fits them.
 *
 * There is no way to actually lock orientation from a browser tab — the web
 * manifest's `orientation` binds only installed PWAs, and Safari does not
 * implement screen.orientation.lock outside fullscreen — so this asks. It is
 * shown entirely by the media query in style.css; nothing here is dynamic.
 */
export function RotateNotice() {
  return (
    <div className="rotate-notice" role="alert">
      <p className="rotate-notice__icon" aria-hidden="true">
        ↻
      </p>
      <p className="rotate-notice__text">Turn your device sideways</p>
      <p className="rotate-notice__hint">Spybox plays in landscape.</p>
    </div>
  );
}
