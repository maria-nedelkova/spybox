import { cn } from "@/lib/utils";

export type TerrainKind = "void" | "wall" | "floor" | "goal";

export function Cell({ kind }: { kind: TerrainKind }) {
  return <div className={cn("cell", `cell--${kind}`)} />;
}
