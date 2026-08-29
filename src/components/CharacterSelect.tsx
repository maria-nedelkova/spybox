import { Avatar } from "@/components/Avatar";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { CHARACTERS, type CharacterId } from "@/game/characters";

export function CharacterSelect({ onSelect }: { onSelect: (id: CharacterId) => void }) {
  return (
    <div className="character-select">
      <h1 className="title">SPYBOX</h1>
      <p className="character-select__prompt">Choose your agent</p>
      <div className="character-select__grid">
        {CHARACTERS.map((c) => (
          // The button stays the interactive element and is left unstyled; the
          // 8bitcn card inside it supplies the frame, so these match the
          // mission panel in game.
          <button
            key={c.id}
            type="button"
            className="character-select__button"
            onClick={() => onSelect(c.id)}
          >
            <Card className="character-select__card">
              <CardContent className="character-select__card-body">
                <Avatar character={c.id} portrait className="character-select__avatar" />
                <span className="character-select__name">{c.name}</span>
                <span className="character-select__tagline">{c.tagline}</span>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
