export type SoundKind = "move" | "push" | "win";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  ctx ??= new AudioCtor();
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
