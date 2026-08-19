import { cn } from "@/lib/utils";

export function BoxToken({ r, c, onGoal }: { r: number; c: number; onGoal: boolean }) {
  return (
    <div
      className="token token--box"
      style={{
        width: "var(--cell-size)",
        height: "var(--cell-size)",
        // 100% is the token's own width, which already tracks --cell-size, so
        // the offset re-resolves when the board rescales. Referencing
        // --cell-size directly would not: a transform holding var() is not
        // recomputed when that custom property changes, leaving tokens
        // stranded at their old pixel offsets after a resize.
        transform: `translate(
          calc(${c} * (100% + var(--cell-gap))),
          calc(${r} * (100% + var(--cell-gap)))
        )`,
      }}
    >
      <div className={cn("crate", onGoal && "crate--on-goal")}>
        <div className="crate__brace crate__brace--1" />
        <div className="crate__brace crate__brace--2" />
        <div className="crate__bolt crate__bolt--tl" />
        <div className="crate__bolt crate__bolt--tr" />
        <div className="crate__bolt crate__bolt--bl" />
        <div className="crate__bolt crate__bolt--br" />
      </div>
    </div>
  );
}
