import { AnyaSprite } from "@/components/AnyaSprite";
import { BondSprite } from "@/components/BondSprite";
import type { CharacterId } from "@/game/characters";
import type { Direction } from "@/game/types";

export function Avatar({
  character,
  facing = "down",
  moving = false,
  className,
}: {
  character: CharacterId;
  facing?: Direction;
  moving?: boolean;
  className?: string;
}) {
  if (character === "anya") {
    return <AnyaSprite facing={facing} moving={moving} className={className} />;
  }

  return <BondSprite facing={facing} moving={moving} className={className} />;
}
