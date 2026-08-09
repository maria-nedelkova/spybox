export type CharacterId = "anya" | "bond";

export interface Character {
  readonly id: CharacterId;
  readonly name: string;
  readonly tagline: string;
}

export const CHARACTERS: readonly Character[] = [
  { id: "anya", name: "Anya", tagline: "Telepathic recruit. Reads the room (and the boxes)." },
  { id: "bond", name: "Bond", tagline: "Precog golden retriever. Always knows where the crate goes." },
];

export type Expression = "neutral" | "happy" | "surprised" | "determined" | "sleepy";

const EXPRESSION_CYCLE: readonly Expression[] = ["neutral", "determined", "surprised", "sleepy"];

/** Deterministic per-level expression so each mission's agent looks a little different. */
export function expressionForLevel(levelIndex: number): Expression {
  return EXPRESSION_CYCLE[levelIndex % EXPRESSION_CYCLE.length]!;
}

export const WIN_EXPRESSION: Expression = "happy";
