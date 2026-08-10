import { useLayoutEffect, useRef } from "react";
import bondSpriteSheet from "@/assets/bond-sprite.png";
import {
  createDog2Sprite,
  DOG2_BACKWARD_SHEET,
  DOG2_FORWARD_SHEET,
  DOG2_LEFT_SHEET,
  DOG2_RIGHT_SHEET,
  type Dog2Direction,
  type Sprite,
} from "@/lib/Sprite";
import type { Direction } from "@/game/types";

const SHEETS: Record<Dog2Direction, typeof DOG2_FORWARD_SHEET> = {
  forward: DOG2_FORWARD_SHEET,
  backward: DOG2_BACKWARD_SHEET,
  left: DOG2_LEFT_SHEET,
  right: DOG2_RIGHT_SHEET,
};

function animationFor(direction: Direction): Dog2Direction {
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
  const animRef = useRef<Dog2Direction>("forward");

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sprite = createDog2Sprite(bondSpriteSheet, "forward", { fps: 8 });
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
