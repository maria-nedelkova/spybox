/**
 * Sprite.ts
 *
 * A small, dependency-free TypeScript class for rendering and animating
 * a sprite sheet on an HTML5 Canvas 2D context.
 *
 * Works with any grid-based sprite sheet: pass the image source and the
 * grid layout (frame size, columns/rows) and it handles frame timing,
 * looping, play/pause, and drawing (including horizontal flipping).
 *
 * Supports sheets that pack multiple animations into one image/grid via
 * `startFrame` — see `setAnimation()` for switching between them without
 * reloading the image.
 */

/** Describes the grid layout of a sprite sheet image, or a sub-animation within it. */
export interface SpriteSheetConfig {
  /** Width of a single frame, in source pixels. */
  frameWidth: number;
  /** Height of a single frame, in source pixels. */
  frameHeight: number;
  /** Number of columns in the sheet's grid. */
  columns: number;
  /** Number of rows in the sheet's grid. */
  rows: number;
  /**
   * Number of frames this animation uses, in row-major order starting at
   * `startFrame`. Defaults to columns * rows, i.e. every cell in the grid.
   */
  frameCount?: number;
  /**
   * Flat (row-major) index into the grid where this animation begins.
   * Useful when one sheet packs several animations — e.g. a run cycle in
   * rows 0-1 and a back-facing walk in row 2. Default: 0.
   */
  startFrame?: number;
}

/** Options controlling how the animation plays. */
export interface SpriteAnimationOptions {
  /** Playback speed in frames per second. Default: 12. */
  fps?: number;
  /** Whether the animation loops back to frame 0 when it finishes. Default: true. */
  loop?: boolean;
  /** Start playing immediately once the image has loaded. Default: true. */
  autoplay?: boolean;
}

/** Options for a single draw() call. */
export interface SpriteDrawOptions {
  /** Uniform scale applied to the frame's on-screen size. Default: 1. */
  scale?: number;
  /** Mirror the frame horizontally (useful for left/right facing). Default: false. */
  flipX?: boolean;
  /** Opacity, 0-1. Default: 1. */
  alpha?: number;
}

export class Sprite {
  private readonly image: HTMLImageElement;
  private frameWidth: number;
  private frameHeight: number;
  private columns: number;
  private frameCount: number;
  private startFrame: number;

  private loaded = false;
  private loadError: Error | null = null;
  private currentFrame = 0;
  private frameDuration: number; // seconds per frame
  private elapsed = 0; // seconds accumulated toward the next frame
  private playing: boolean;
  private loop: boolean;
  private onFrameChange: ((frame: number) => void) | null = null;
  private onComplete: (() => void) | null = null;

  constructor(src: string, sheet: SpriteSheetConfig, options: SpriteAnimationOptions = {}) {
    this.frameWidth = sheet.frameWidth;
    this.frameHeight = sheet.frameHeight;
    this.columns = sheet.columns;
    this.frameCount = sheet.frameCount ?? sheet.columns * sheet.rows;
    this.startFrame = sheet.startFrame ?? 0;

    const fps = options.fps ?? 12;
    this.frameDuration = 1 / fps;
    this.loop = options.loop ?? true;
    this.playing = options.autoplay ?? true;

    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
    };
    this.image.onerror = () => {
      this.loadError = new Error(`Sprite: failed to load image "${src}"`);
    };
    this.image.src = src;
  }

  /** True once the underlying image has finished loading. */
  get isLoaded(): boolean {
    return this.loaded;
  }

  /** Set if the image failed to load. */
  get error(): Error | null {
    return this.loadError;
  }

  /** Index of the frame currently being displayed, relative to the current animation. */
  get frame(): number {
    return this.currentFrame;
  }

  /** Total number of frames in the current animation. */
  get totalFrames(): number {
    return this.frameCount;
  }

  /** Pixel width of a single frame (before scaling). */
  get width(): number {
    return this.frameWidth;
  }

  /** Pixel height of a single frame (before scaling). */
  get height(): number {
    return this.frameHeight;
  }

  /**
   * Switch to a different animation on the same sprite sheet image (e.g.
   * from a run cycle to an idle pose) without reloading the image. Resets
   * playback to the first frame of the new animation.
   */
  setAnimation(sheet: SpriteSheetConfig, options: SpriteAnimationOptions = {}): void {
    this.frameWidth = sheet.frameWidth;
    this.frameHeight = sheet.frameHeight;
    this.columns = sheet.columns;
    this.frameCount = sheet.frameCount ?? sheet.columns * sheet.rows;
    this.startFrame = sheet.startFrame ?? 0;

    if (options.fps !== undefined) this.setFps(options.fps);
    if (options.loop !== undefined) this.loop = options.loop;
    this.playing = options.autoplay ?? this.playing;

    this.currentFrame = 0;
    this.elapsed = 0;
  }

  /** Resume/start playback. */
  play(): void {
    this.playing = true;
  }

  /** Freeze on the current frame. */
  pause(): void {
    this.playing = false;
  }

  /** Pause and rewind to the first frame. */
  stop(): void {
    this.playing = false;
    this.currentFrame = 0;
    this.elapsed = 0;
  }

  /** Jump directly to a specific frame index (clamped to valid range), relative to the current animation. */
  setFrame(index: number): void {
    this.currentFrame = Math.max(0, Math.min(this.frameCount - 1, index));
    this.elapsed = 0;
  }

  /** Change playback speed in frames per second. */
  setFps(fps: number): void {
    this.frameDuration = 1 / Math.max(0.0001, fps);
  }

  /** Enable/disable looping. */
  setLoop(loop: boolean): void {
    this.loop = loop;
  }

  /** Register a callback fired whenever the displayed frame changes. */
  onFrame(callback: (frame: number) => void): void {
    this.onFrameChange = callback;
  }

  /** Register a callback fired once when a non-looping animation reaches its last frame. */
  onAnimationComplete(callback: () => void): void {
    this.onComplete = callback;
  }

  /**
   * Advance the animation. Call this once per game-loop tick with the
   * elapsed time (in seconds) since the previous call.
   */
  update(deltaSeconds: number): void {
    if (!this.playing || !this.loaded || this.frameCount <= 1) return;

    this.elapsed += deltaSeconds;

    while (this.elapsed >= this.frameDuration) {
      this.elapsed -= this.frameDuration;
      const next = this.currentFrame + 1;

      if (next >= this.frameCount) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frameCount - 1;
          this.playing = false;
          this.onComplete?.();
          break;
        }
      } else {
        this.currentFrame = next;
      }

      this.onFrameChange?.(this.currentFrame);
    }
  }

  /**
   * Draw the current frame onto a canvas context at (x, y), which is the
   * frame's top-left corner in destination space.
   */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, options: SpriteDrawOptions = {}): void {
    if (!this.loaded) return;

    const scale = options.scale ?? 1;
    const destWidth = this.frameWidth * scale;
    const destHeight = this.frameHeight * scale;

    const flatIndex = this.startFrame + this.currentFrame;
    const col = flatIndex % this.columns;
    const row = Math.floor(flatIndex / this.columns);
    const sx = col * this.frameWidth;
    const sy = row * this.frameHeight;

    ctx.save();
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }

    if (options.flipX) {
      ctx.translate(x + destWidth, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        sx, sy, this.frameWidth, this.frameHeight,
        0, 0, destWidth, destHeight
      );
    } else {
      ctx.drawImage(
        this.image,
        sx, sy, this.frameWidth, this.frameHeight,
        x, y, destWidth, destHeight
      );
    }

    ctx.restore();
  }
}

/**
 * Preset grid configs for the included `assets/anya-sprite.png` sheet:
 * a 4x4 grid, 232x248 px per frame, packing three animations:
 *  - an 8-frame 3/4-view run cycle (rows 0-1)
 *  - a 4-frame back-facing walk (row 2)
 *  - a 4-frame front-facing walk (row 3)
 */
const PINKGIRL2_GRID = { frameWidth: 232, frameHeight: 248, columns: 4, rows: 4 } as const;

export const PINKGIRL2_RUN_SHEET: SpriteSheetConfig = {
  ...PINKGIRL2_GRID,
  frameCount: 8,
  startFrame: 0,
};

export const PINKGIRL2_WALK_BACK_SHEET: SpriteSheetConfig = {
  ...PINKGIRL2_GRID,
  frameCount: 4,
  startFrame: 8,
};

export const PINKGIRL2_WALK_FRONT_SHEET: SpriteSheetConfig = {
  ...PINKGIRL2_GRID,
  frameCount: 4,
  startFrame: 12,
};

export type PinkGirl2Animation = "run" | "walkBack" | "walkFront";

const PINKGIRL2_ANIMATIONS: Record<PinkGirl2Animation, SpriteSheetConfig> = {
  run: PINKGIRL2_RUN_SHEET,
  walkBack: PINKGIRL2_WALK_BACK_SHEET,
  walkFront: PINKGIRL2_WALK_FRONT_SHEET,
};

/**
 * Convenience factory for the bundled pink-haired character sheet. Defaults
 * to the run animation; switch animations later with:
 *
 *   sprite.setAnimation(PINKGIRL2_WALK_FRONT_SHEET, { fps: 6 });
 */
export function createPinkGirl2Sprite(
  imageSrc: string,
  animation: PinkGirl2Animation = "run",
  options?: SpriteAnimationOptions
): Sprite {
  return new Sprite(imageSrc, PINKGIRL2_ANIMATIONS[animation], { fps: 10, loop: true, ...options });
}

/**
 * Preset grid configs for the included `assets/bond-sprite.png` sheet:
 * a 4x4 grid, 230x190 px per frame, packing four movement animations
 * (an "Attack" row from the source sheet was left out):
 *  - Forward (row 0, 4 frames)
 *  - Backward (row 1, 4 frames)
 *  - Left (row 2, 4 frames — all four cells are valid left-facing poses)
 *  - Right (row 3) — verified by direct pixel inspection to only have one
 *    genuine right-facing pose at flat index 13; index 12 is a mismatched
 *    front-facing sit and indices 14-15 are empty, so Right plays as a
 *    single static frame rather than a walk cycle.
 *
 * Left and Right are separately-drawn art, not mirror images of each
 * other — no flipX needed.
 */
const DOG2_GRID = { frameWidth: 230, frameHeight: 190, columns: 4, rows: 4 } as const;

export const DOG2_FORWARD_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 4,
  startFrame: 0,
};

export const DOG2_BACKWARD_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 4,
  startFrame: 4,
};

export const DOG2_LEFT_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 4,
  startFrame: 8,
};

export const DOG2_RIGHT_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 1,
  startFrame: 13,
};

export type Dog2Direction = "forward" | "backward" | "left" | "right";

const DOG2_ANIMATIONS: Record<Dog2Direction, SpriteSheetConfig> = {
  forward: DOG2_FORWARD_SHEET,
  backward: DOG2_BACKWARD_SHEET,
  left: DOG2_LEFT_SHEET,
  right: DOG2_RIGHT_SHEET,
};

/**
 * Convenience factory for the bundled pink dog movement sheet. Defaults to
 * facing forward; switch directions later with e.g.:
 *
 *   sprite.setAnimation(DOG2_LEFT_SHEET, { fps: 8 });
 */
export function createDog2Sprite(
  imageSrc: string,
  direction: Dog2Direction = "forward",
  options?: SpriteAnimationOptions
): Sprite {
  return new Sprite(imageSrc, DOG2_ANIMATIONS[direction], { fps: 8, loop: true, ...options });
}
