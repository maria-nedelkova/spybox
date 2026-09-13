export type SoundKind = "move" | "push" | "win";

let ctx: AudioContext | null = null;
let primed = false;
let unlocked = false;

/* ---------------------------------------------------------------------
 * iOS audio survival kit.
 *
 * Three separate iOS behaviours will each silence a Web Audio game, and
 * they present identically ("no sound on my phone"), so all three are
 * handled here. The mechanisms are the ones that matter from unmute.js
 * (github.com/swevans/unmute).
 * ------------------------------------------------------------------- */

/** iOS silences Web Audio whenever the ring/silent switch is on, because
 * the default audio session behaves like a notification rather than media
 * playback. Claiming "playback" opts into the media category so the game is
 * audible either way. Safari 16.4+, and not in lib.dom, hence the cast. */
function claimPlaybackSession(): void {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = "playback";
}

/** iOS keeps a context nominally running but mute until something has been
 * played from inside a user gesture. A one-frame silent buffer satisfies it. */
function unlock(audio: AudioContext): void {
  if (unlocked) return;
  unlocked = true;
  const buffer = audio.createBuffer(1, 1, audio.sampleRate);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start(0);
}

const RESUME_EVENTS = ["pointerdown", "touchend", "click", "keydown"] as const;
let resumeListenersArmed = false;

function needsResume(audio: AudioContext): boolean {
  // Compared as a string because iOS has a fourth state, "interrupted",
  // that is absent from TypeScript's AudioContextState union — and it is
  // exactly what you land in after a tab switch or an incoming call, so
  // checking only for "suspended" leaves the game permanently silent.
  const state = audio.state as string;
  return state !== "running" && state !== "closed";
}

function armResumeListeners(arm: boolean): void {
  if (resumeListenersArmed === arm || typeof window === "undefined") return;
  resumeListenersArmed = arm;
  for (const event of RESUME_EVENTS) {
    if (arm) window.addEventListener(event, checkContextState, { capture: true, passive: true });
    else window.removeEventListener(event, checkContextState, { capture: true });
  }
}

/** resume() often won't take effect outside a user gesture, so whenever the
 * context isn't running we also arm listeners to retry on the next
 * interaction: sound returns on the player's next keypress or tap even if
 * the automatic resume was refused. */
function checkContextState(): void {
  if (!ctx) return;
  if (needsResume(ctx)) {
    void ctx.resume();
    armResumeListeners(true);
  } else {
    armResumeListeners(false);
  }
}

/** Creates the context, on a real user gesture and no earlier.
 *
 * A context constructed outside a gesture is one iOS never reliably starts,
 * no matter how often it is resumed later. Sounds here are played from
 * React effects reacting to a completed move, which run after the handler
 * has returned — so priming is bound to the raw input events instead, once,
 * rather than to any one call site. That also covers all three input paths
 * (keyboard, on-screen d-pad, board swipes) without touching them. */
function prime(): void {
  if (primed) return;
  primed = true;
  getContext();
}

if (typeof window !== "undefined") {
  for (const event of RESUME_EVENTS) {
    window.addEventListener(event, prime, { capture: true, passive: true, once: true });
  }
  // iOS's Page Visibility API is unreliable, so visibilitychange alone
  // misses cases; it does dispatch window focus/blur.
  document.addEventListener("visibilitychange", checkContextState, true);
  window.addEventListener("focus", checkContextState, true);
  window.addEventListener("blur", checkContextState, true);
  window.addEventListener("pageshow", checkContextState, true);
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx && !primed) return null;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) {
    claimPlaybackSession();
    ctx = new AudioCtor();
    // An interruption is reported here and nowhere else, which makes this
    // the most reliable of the three signals we listen on.
    ctx.addEventListener("statechange", checkContextState);
  }
  if (needsResume(ctx)) {
    void ctx.resume();
    armResumeListeners(true);
  }
  unlock(ctx);
  return ctx;
}

function tone(audioCtx: AudioContext, freq: number, startOffsetSec: number, durationMs: number, type: OscillatorType) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.07;
  osc.connect(gain).connect(audioCtx.destination);

  const startTime = audioCtx.currentTime + startOffsetSec;
  const stopTime = startTime + durationMs / 1000;
  gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
  osc.start(startTime);
  osc.stop(stopTime);
}

/** Synthesized retro beeps — no external audio assets needed. */
export function playSound(kind: SoundKind) {
  const audioCtx = getContext();
  if (!audioCtx) return;

  switch (kind) {
    case "move":
      tone(audioCtx, 220, 0, 50, "square");
      break;
    case "push":
      tone(audioCtx, 140, 0, 90, "sawtooth");
      break;
    case "win":
      tone(audioCtx, 440, 0, 120, "square");
      tone(audioCtx, 660, 0.12, 220, "square");
      break;
  }
}
