export type CharacterId = "anya" | "bond" | "chimera";

export interface Character {
  readonly id: CharacterId;
  readonly name: string;
  readonly tagline: string;
}

export const CHARACTERS: readonly Character[] = [
  { id: "anya", name: "Anya", tagline: "Telepathic recruit. Reads the room (and the boxes)." },
  { id: "bond", name: "Bond", tagline: "Precog golden retriever. Always knows where the crate goes." },
  // No space after "Mr." — it keeps the name on one line on the select card.
  { id: "chimera", name: "Mr.Chimera", tagline: "Mythical backup. Flies in when the mission gets weird." },
];
