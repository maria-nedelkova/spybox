import { cn } from "@/lib/utils";
import { CELL_SIZE_PX, CELL_STEP_PX } from "@/game/constants";

export function BoxToken({ r, c, onGoal }: { r: number; c: number; onGoal: boolean }) {
  return (
    <div
      className="token token--box"
      style={{
        width: CELL_SIZE_PX,
        height: CELL_SIZE_PX,
        transform: `translate(${c * CELL_STEP_PX}px, ${r * CELL_STEP_PX}px)`,
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
