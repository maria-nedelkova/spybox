import { useLayoutEffect, useRef } from "react";
import anyaSpriteSheet from "@/assets/anya-sprite.png";
import {
  createPinkGirl2Sprite,
  PINKGIRL2_RUN_SHEET,
  PINKGIRL2_WALK_BACK_SHEET,
  PINKGIRL2_WALK_FRONT_SHEET,
  type PinkGirl2Animation,
  type Sprite,
} from "@/lib/Sprite";
import type { Direction } from "@/game/types";

const SHEETS: Record<PinkGirl2Animation, typeof PINKGIRL2_RUN_SHEET> = {
  run: PINKGIRL2_RUN_SHEET,
  walkBack: PINKGIRL2_WALK_BACK_SHEET,
  walkFront: PINKGIRL2_WALK_FRONT_SHEET,
};

function animationFor(direction: Direction): { anim: PinkGirl2Animation; flipX: boolean } {
  switch (direction) {
    case "up":
      return { anim: "walkBack", flipX: false };
    case "down":
      return { anim: "walkFront", flipX: false };
    case "left":
      return { anim: "run", flipX: true };
    case "right":
      return { anim: "run", flipX: false };
  }
}

export function AnyaSprite({
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
  const animRef = useRef<PinkGirl2Animation>("walkFront");
  const flipXRef = useRef(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sprite = createPinkGirl2Sprite(anyaSpriteSheet, "walkFront", { fps: 8 });
    sprite.pause();
    spriteRef.current = sprite;

    const dpr = window.devicePixelRatio || 1;

    // Match the canvas's internal resolution to its actual displayed CSS
    // size (times devicePixelRatio) so the browser never has to smooth-
    // downscale the bitmap in one big jump.
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
        sprite.draw(ctx, (canvas.width - w) / 2, (canvas.height - h) / 2, {
          scale,
          flipX: flipXRef.current,
        });
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

    const { anim, flipX } = animationFor(facing);
    flipXRef.current = flipX;
    if (animRef.current !== anim) {
      animRef.current = anim;
      sprite.setAnimation(SHEETS[anim], { fps: anim === "run" ? 10 : 8 });
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
