import { PixelSprite } from "@/components/PixelSprite";
import type { CharacterId, Expression } from "@/game/characters";
import { getAnyaSprite, getBondSprite, SPRITE_PALETTE } from "@/game/sprites";

export function Avatar({
  character,
  expression = "neutral",
  className,
}: {
  character: CharacterId;
  expression?: Expression;
  className?: string;
}) {
  const matrix = character === "anya" ? getAnyaSprite(expression) : getBondSprite(expression);
  return <PixelSprite matrix={matrix} palette={SPRITE_PALETTE} className={className} />;
}
