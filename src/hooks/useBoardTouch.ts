import { type RefObject, useEffect } from "react";

import type { Direction } from "@/game/types";

/** Under this a touch is a tap, not a swipe. */
const SWIPE_THRESHOLD_PX = 24;

/**
 * The board's own movement input, for the layouts where the d-pad is not on
 * screen. Two gestures, told apart by how far the finger travelled:
 *
 * - a swipe steps one tile in that direction
 * - a tap on a neighbouring tile steps onto it
 *
 * Both are one tile per gesture, which is what Sokoban is: a swipe is a
 * direction rather than a distance, so this fires once on release rather
 * than tracking the drag.
 */
export function useBoardTouch(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (direction: Direction) => void,
  onTap: (clientX: number, clientY: number) => void
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(event: TouchEvent) {
      // Ignore multi-touch outright: a pinch is neither gesture.
      const touch = event.touches.length === 1 ? event.touches[0] : undefined;
      if (!touch) {
        tracking = false;
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) {
        onTap(touch.clientX, touch.clientY);
        return;
      }

      // One axis per swipe — the larger delta wins, so a diagonal drag still
      // resolves to the direction the player mostly meant.
      if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? "right" : "left");
      else onSwipe(dy > 0 ? "down" : "up");
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, onSwipe, onTap]);
}
