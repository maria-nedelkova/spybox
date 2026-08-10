import { useLayoutEffect, useRef } from "react";
import chimeraSpriteSheet from "@/assets/chimera-sprite.png";
import {
  CHIMERA_WALK_BACKWARD_SHEET,
  CHIMERA_WALK_FORWARD_SHEET,
  CHIMERA_WALK_LEFT_SHEET,
  CHIMERA_WALK_RIGHT_SHEET,
  createChimeraSprite,
  type Sprite,
} from "@/lib/Sprite";
import type { Direction } from "@/game/types";

type ChimeraWalkAnimation = "walkLeft" | "walkRight" | "walkForward" | "walkBackward";

const SHEETS: Record<ChimeraWalkAnimation, typeof CHIMERA_WALK_FORWARD_SHEET> = {
  walkLeft: CHIMERA_WALK_LEFT_SHEET,
  walkRight: CHIMERA_WALK_RIGHT_SHEET,
  walkForward: CHIMERA_WALK_FORWARD_SHEET,
  walkBackward: CHIMERA_WALK_BACKWARD_SHEET,
};

function animationFor(direction: Direction): ChimeraWalkAnimation {
  switch (direction) {
    case "up":
      return "walkBackward";
    case "down":
      return "walkForward";
    case "left":
      return "walkLeft";
    case "right":
      return "walkRight";
  }
}

export function ChimeraSprite({
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
  const animRef = useRef<ChimeraWalkAnimation>("walkForward");

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sprite = createChimeraSprite(chimeraSpriteSheet, "walkForward", { fps: 8 });
    sprite.pause();
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

    const anim = animationFor(facing);
    if (animRef.current !== anim) {
      animRef.current = anim;
      sprite.setAnimation(SHEETS[anim], { fps: 8 });
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
