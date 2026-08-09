import type { CharacterId } from "@/game/characters";
import { cn } from "@/lib/utils";

export function Avatar({ character, className }: { character: CharacterId; className?: string }) {
  if (character === "anya") {
    return (
      <div className={cn("avatar avatar--anya", className)}>
        <div className="avatar__head">
          <div className="avatar__hair" />
          <div className="avatar__stripe avatar__stripe--1" />
          <div className="avatar__stripe avatar__stripe--2" />
          <div className="avatar__face" />
        </div>
      </div>
    );
  }
  return (
    <div className={cn("avatar avatar--bond", className)}>
      <div className="avatar__body" />
      <div className="avatar__ear avatar__ear--left" />
      <div className="avatar__ear avatar__ear--right" />
      <div className="avatar__snout" />
    </div>
  );
}
