import { AnyaSprite } from "@/components/AnyaSprite";
import { PixelSprite } from "@/components/PixelSprite";
import type { CharacterId, Expression } from "@/game/characters";
import { getBondSprite, SPRITE_PALETTE } from "@/game/sprites";
import type { Direction } from "@/game/types";

export function Avatar({
  character,
  expression = "neutral",
  facing = "down",
  moving = false,
  className,
}: {
  character: CharacterId;
  expression?: Expression;
  facing?: Direction;
  moving?: boolean;
  className?: string;
}) {
  if (character === "anya") {
    return <AnyaSprite facing={facing} moving={moving} className={className} />;
  }

  return <PixelSprite matrix={getBondSprite(expression)} palette={SPRITE_PALETTE} className={className} />;
}
