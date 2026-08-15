import { useLayoutEffect, useRef } from "react";
import bondSpriteSheet from "@/assets/bond-sprite.png";
import bondWalkForwardSheet from "@/assets/bond-walk-forward.png";
import {
  createBondWalkForwardSprite,
  createDog2Sprite,
  DOG2_BACKWARD_SHEET,
  DOG2_FORWARD_IDLE_SHEET,
  DOG2_LEFT_SHEET,
  DOG2_RIGHT_SHEET,
  type Sprite,
  type SpriteSheetConfig,
} from "@/lib/Sprite";
import type { Direction } from "@/game/types";

type AnimKey = "forward" | "backward" | "left" | "right";

function animKeyFor(direction: Direction): AnimKey {
  switch (direction) {
    case "up":
      return "backward";
    case "down":
      return "forward";
    case "left":
      return "left";
    case "right":
      return "right";
  }
}

// "forward" (both standing-still and walking) is drawn from the dedicated
// walk-forward sprite/image; everything else comes from the shared
// bond-sprite.png sheet. The sitting DOG2_FORWARD_IDLE_SHEET pose is reserved
// for the character-select screen (portrait mode) only — see below.
const MAIN_SHEETS: Partial<Record<AnimKey, SpriteSheetConfig>> = {
  backward: DOG2_BACKWARD_SHEET,
  left: DOG2_LEFT_SHEET,
  right: DOG2_RIGHT_SHEET,
};

export function BondSprite({
  facing,
  moving,
  portrait = false,
  className,
}: {
  facing: Direction;
  moving: boolean;
  portrait?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainSpriteRef = useRef<Sprite | null>(null);
  const walkForwardSpriteRef = useRef<Sprite | null>(null);
  const animKeyRef = useRef<AnimKey>("forward");
  const portraitRef = useRef(portrait);
  portraitRef.current = portrait;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mainSprite = createDog2Sprite(bondSpriteSheet, "forward", { fps: 8 });
    mainSprite.setAnimation(DOG2_FORWARD_IDLE_SHEET);
    mainSpriteRef.current = mainSprite;

    const walkForwardSprite = createBondWalkForwardSprite(bondWalkForwardSheet, { fps: 8, autoplay: false });
    walkForwardSpriteRef.current = walkForwardSprite;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas) return;
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth === 0 || clientHeight === 0) return;
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let raf = 0;
    let last = performance.now();

    function loop(now: number) {
      const dt = (now - last) / 1000;
      last = now;

      const active =
        !portraitRef.current && animKeyRef.current === "forward" ? walkForwardSprite : mainSprite;
      active.update(dt);

      const ctx = canvas?.getContext("2d");
      if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / active.width, canvas.height / active.height);
        const w = active.width * scale;
        const h = active.height * scale;
        active.draw(ctx, (canvas.width - w) / 2, (canvas.height - h) / 2, { scale });
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const mainSprite = mainSpriteRef.current;
    const walkForwardSprite = walkForwardSpriteRef.current;
    if (!mainSprite || !walkForwardSprite) return;

    if (portrait) {
      animKeyRef.current = "forward";
      mainSprite.setAnimation(DOG2_FORWARD_IDLE_SHEET, { fps: 8 });
      mainSprite.pause();
      mainSprite.setFrame(0);
      walkForwardSprite.pause();
      return;
    }

    const key = animKeyFor(facing);
    const keyChanged = animKeyRef.current !== key;
    animKeyRef.current = key;

    if (key === "forward") {
      if (keyChanged) walkForwardSprite.setFrame(0);
      if (moving) walkForwardSprite.play();
      else {
        walkForwardSprite.pause();
        walkForwardSprite.setFrame(0);
      }
      return;
    }

    const sheet = MAIN_SHEETS[key];
    if (keyChanged && sheet) {
      mainSprite.setAnimation(sheet, { fps: 8 });
    }
    if (moving) {
      mainSprite.play();
    } else {
      mainSprite.pause();
      mainSprite.setFrame(0);
    }
  }, [facing, moving, portrait]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
