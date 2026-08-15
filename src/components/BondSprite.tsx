import { useLayoutEffect, useRef } from "react";
import bondSpriteSheet from "@/assets/bond-sprite.png";
import {
  createDog2Sprite,
  DOG2_BACKWARD_SHEET,
  DOG2_FORWARD_IDLE_SHEET,
  DOG2_FORWARD_WALK_SHEET,
  DOG2_LEFT_SHEET,
  DOG2_RIGHT_SHEET,
  type Sprite,
  type SpriteSheetConfig,
} from "@/lib/Sprite";
import type { Direction } from "@/game/types";

type AnimKey = "forward-idle" | "forward-walk" | "backward" | "left" | "right";

function animKeyFor(direction: Direction, moving: boolean): AnimKey {
  switch (direction) {
    case "up":
      return "backward";
    case "down":
      return moving ? "forward-walk" : "forward-idle";
    case "left":
      return "left";
    case "right":
      return "right";
  }
}

const SHEETS: Record<AnimKey, SpriteSheetConfig> = {
  "forward-idle": DOG2_FORWARD_IDLE_SHEET,
  "forward-walk": DOG2_FORWARD_WALK_SHEET,
  backward: DOG2_BACKWARD_SHEET,
  left: DOG2_LEFT_SHEET,
  right: DOG2_RIGHT_SHEET,
};

export function BondSprite({
  facing,
  moving,
  className,
}: {
  facing: Direction;
  moving: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<Sprite | null>(null);
  const animKeyRef = useRef<AnimKey>("forward-idle");

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sprite = createDog2Sprite(bondSpriteSheet, "forward", { fps: 8 });
    sprite.setAnimation(DOG2_FORWARD_IDLE_SHEET);
    spriteRef.current = sprite;

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
      sprite.update(dt);

      const ctx = canvas?.getContext("2d");
      if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / sprite.width, canvas.height / sprite.height);
        const w = sprite.width * scale;
        const h = sprite.height * scale;
        sprite.draw(ctx, (canvas.width - w) / 2, (canvas.height - h) / 2, { scale });
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
    const sprite = spriteRef.current;
    if (!sprite) return;

    const key = animKeyFor(facing, moving);
    if (animKeyRef.current !== key) {
      animKeyRef.current = key;
      sprite.setAnimation(SHEETS[key], { fps: 8 });
    }

    if (moving) {
      sprite.play();
    } else {
      sprite.pause();
      sprite.setFrame(0);
    }
  }, [facing, moving]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
