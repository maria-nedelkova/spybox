import { Avatar } from "@/components/Avatar";
import { CHARACTERS, type CharacterId } from "@/game/characters";

export function CharacterSelect({ onSelect }: { onSelect: (id: CharacterId) => void }) {
  return (
    <div className="character-select">
      <h1 className="title">SPYBOX</h1>
      <p className="character-select__prompt">Choose your agent</p>
      <div className="character-select__grid">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className="character-select__card"
            onClick={() => onSelect(c.id)}
          >
            <Avatar character={c.id} portrait className="character-select__avatar" />
            <span className="character-select__name">{c.name}</span>
            <span className="character-select__tagline">{c.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
