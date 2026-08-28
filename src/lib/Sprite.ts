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
  /**
   * Play the frames forwards then backwards (0,1,2,3,2,1,0,...) instead of
   * wrapping straight back to the start. Use this for cycles whose last
   * frame doesn't flow into the first — hard-looping those snaps visibly at
   * the wraparound. Endpoints are not repeated. Default: false.
   */
  pingpong?: boolean;
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

/** One step of frame sequencing. Pure, so it can be tested without a DOM. */
export function advanceFrame(
  current: number,
  direction: number,
  frameCount: number,
  mode: { loop: boolean; pingpong: boolean },
): { frame: number; direction: number; finished: boolean } {
  const next = current + direction;

  if (next >= frameCount) {
    // Turn around without replaying the frame we're already on.
    if (mode.pingpong) return { frame: Math.max(0, frameCount - 2), direction: -1, finished: false };
    if (mode.loop) return { frame: 0, direction, finished: false };
    return { frame: frameCount - 1, direction, finished: true };
  }

  // Only reachable mid-ping-pong; bounce back off frame 0.
  if (next < 0) return { frame: Math.min(1, frameCount - 1), direction: 1, finished: false };

  return { frame: next, direction, finished: false };
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
  private pingpong: boolean;
  /** +1 while advancing, -1 while retreating through a ping-pong cycle. */
  private direction = 1;
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
    this.pingpong = options.pingpong ?? false;
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
    if (options.pingpong !== undefined) this.pingpong = options.pingpong;
    this.playing = options.autoplay ?? this.playing;

    this.currentFrame = 0;
    this.elapsed = 0;
    this.direction = 1;
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
    this.direction = 1;
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

      const step = advanceFrame(this.currentFrame, this.direction, this.frameCount, {
        loop: this.loop,
        pingpong: this.pingpong,
      });
      this.currentFrame = step.frame;
      this.direction = step.direction;

      if (step.finished) {
        this.playing = false;
        this.onComplete?.();
        break;
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
 * a 4x5 grid, 232x248 px per frame, packing three animations:
 *  - an 8-frame 3/4-view run cycle (rows 0-1)
 *  - a 4-frame back-facing walk (row 2)
 *  - a 5-frame front-facing walk (row 3 plus the first cell of row 4):
 *    a neutral standing frame followed by the four stride frames, so the
 *    cycle rests on two feet instead of freezing mid-stride when idle.
 *    Row 4's remaining three cells are empty.
 *
 * The standing frame is the only new art here — it came from a separate
 * 6-frame strip whose other frames were pixel-identical to the stride
 * frames already in this sheet, so the sheet grew by one row rather than
 * being replaced.
 */
const PINKGIRL2_GRID = { frameWidth: 232, frameHeight: 248, columns: 4, rows: 5 } as const;

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
  frameCount: 5,
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
 * Preset grid configs for the included `assets/bond-sprite.png` sheet
 * (re-exported 2026-08-28): a 4x5 grid, 230x230 px per frame — note the
 * taller cell than earlier exports — packing:
 *  - Forward (row 0, 4 frames) — a front-facing standing idle. The dog is
 *    symmetric with all four paws down, bobbing slightly; frames 0 and 3
 *    are identical bookends and 1-2 settle progressively lower. This
 *    replaces the old sit-and-wave art, which read as a one-sided raised
 *    paw rather than movement, and retires the separate
 *    `bond-walk-forward.png` sheet that previously stood in for it.
 *  - Backward (row 1, 4 frames)
 *  - Left (row 2, 3 frames — cell 11 empty)
 *  - Right (row 3, 3 frames — cell 15 empty), the Left frames mirrored
 *  - Avatars (row 4): sitting at 16, standing at 17; cells 18-19 empty
 *
 * None of the rows is a closed loop, so `createDog2Sprite` ping-pongs them
 * (see SpriteAnimationOptions.pingpong) — hard-looping snaps at the wrap.
 *
 * Verified by direct pixel inspection: per-cell opaque-pixel counts confirm
 * the empty cells, that frames 0/3 of Forward are identical, that Right's
 * frames match Left's exactly (mirrored), and that avatar frame 17 is the
 * same standing pose as Forward frame 0.
 */
const DOG2_GRID = { frameWidth: 230, frameHeight: 230, columns: 4, rows: 5 } as const;

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
  frameCount: 3,
  startFrame: 8,
};

export const DOG2_RIGHT_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 3,
  startFrame: 12,
};

/** Static portrait poses — character select only, never part of a walk cycle. */
export const DOG2_AVATAR_SITTING_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 1,
  startFrame: 16,
};

export const DOG2_AVATAR_STANDING_SHEET: SpriteSheetConfig = {
  ...DOG2_GRID,
  frameCount: 1,
  startFrame: 17,
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
 * facing forward, and to ping-pong playback since none of the rows loop
 * cleanly; switch directions later with e.g.:
 *
 *   sprite.setAnimation(DOG2_LEFT_SHEET, { fps: 8 });
 */
export function createDog2Sprite(
  imageSrc: string,
  direction: Dog2Direction = "forward",
  options?: SpriteAnimationOptions
): Sprite {
  return new Sprite(imageSrc, DOG2_ANIMATIONS[direction], {
    fps: 8,
    loop: true,
    pingpong: true,
    ...options,
  });
}

/**
 * Preset grid configs for the included `assets/chimera-sprite.png` sheet
 * (re-exported 2026-08-28): a 4x5 grid, 230x250 px per frame, packing:
 *  - Walk right (row 0, 4 frames) — faces screen right
 *  - Walk left (row 1, 4 frames) — an exact mirror of row 0
 *  - Walk forward/down (row 2, 4 frames): standing, step, step, standing —
 *    bookended so the cycle begins and ends on two feet rather than stopping
 *    mid-stride. The two step frames use opposite paws. See the note below
 *    about how frame 9 was recovered.
 *  - Walk backward/up (row 3, 3 frames)
 *  - Sit (row 3, cell 4) — a front-facing seated portrait for the character
 *    select screen, not part of any walk cycle. This cell was empty in the
 *    previous export.
 *  - Four single-frame poses (row 4): Jump, Die, Wink, Dizzy
 *
 * Rows 0 and 1 are swapped relative to the 2026-08-15 export, which had them
 * mislabelled. Verified by pixel inspection: the two rows are exact mirrors
 * (identical opaque-pixel counts per column), and rendering row 0 enlarged
 * shows the muzzle pointing right. Colour-based heuristics are unreliable on
 * this sheet — both the mane and the wings are teal, and the wings carry
 * white highlights that read like eyes.
 *
 * Frame 9 does not come from the delivered export. That export's walk-forward
 * row was standing/standing/step/standing — frames 8, 9 and 11 were pixel
 * identical, so only one paw ever moved and the walk read as a twitch. The
 * missing second step still existed as frame 9 of the previous export (same
 * scale, same ground line), so this sheet is the delivered art with that one
 * cell composited back in; every other cell is byte-identical to what was
 * delivered. If a corrected export turns up, it can replace this wholesale —
 * the re-encode also costs ~190KB over the original.
 */
const CHIMERA_GRID = { frameWidth: 230, frameHeight: 250, columns: 4, rows: 5 } as const;

export const CHIMERA_WALK_RIGHT_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 4, startFrame: 0 };
export const CHIMERA_WALK_LEFT_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 4, startFrame: 4 };
export const CHIMERA_WALK_FORWARD_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 4, startFrame: 8 };
export const CHIMERA_WALK_BACKWARD_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 3, startFrame: 12 };

/** Seated portrait pose — character select only, mirroring Bond's avatar frame. */
export const CHIMERA_SIT_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 1, startFrame: 15 };

export const CHIMERA_JUMP_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 1, startFrame: 16 };
export const CHIMERA_DIE_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 1, startFrame: 17 };
export const CHIMERA_WINK_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 1, startFrame: 18 };
export const CHIMERA_DIZZY_SHEET: SpriteSheetConfig = { ...CHIMERA_GRID, frameCount: 1, startFrame: 19 };

export type ChimeraAnimation =
  | "walkLeft"
  | "walkRight"
  | "walkForward"
  | "walkBackward"
  | "sit"
  | "jump"
  | "die"
  | "wink"
  | "dizzy";

const CHIMERA_ANIMATIONS: Record<ChimeraAnimation, SpriteSheetConfig> = {
  walkLeft: CHIMERA_WALK_LEFT_SHEET,
  walkRight: CHIMERA_WALK_RIGHT_SHEET,
  walkForward: CHIMERA_WALK_FORWARD_SHEET,
  walkBackward: CHIMERA_WALK_BACKWARD_SHEET,
  sit: CHIMERA_SIT_SHEET,
  jump: CHIMERA_JUMP_SHEET,
  die: CHIMERA_DIE_SHEET,
  wink: CHIMERA_WINK_SHEET,
  dizzy: CHIMERA_DIZZY_SHEET,
};

/**
 * Convenience factory for the bundled Mr. Chimera sheet. Defaults to
 * walking forward; switch animations/poses later with e.g.:
 *
 *   sprite.setAnimation(CHIMERA_JUMP_SHEET, { loop: false });
 *
 * Single-pose animations (sit/jump/die/wink/dizzy) have frameCount: 1, so
 * update() leaves them frozen on their one frame automatically.
 */
export function createChimeraSprite(
  imageSrc: string,
  animation: ChimeraAnimation = "walkForward",
  options?: SpriteAnimationOptions
): Sprite {
  const sheet = CHIMERA_ANIMATIONS[animation];
  return new Sprite(imageSrc, sheet, {
    fps: 8,
    // Single-frame poses have nothing to cycle through.
    loop: (sheet.frameCount ?? sheet.columns * sheet.rows) > 1,
    ...options,
  });
}
