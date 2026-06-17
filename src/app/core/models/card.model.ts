export interface Card {
  id: string;
  frontText: string;
  backText: string;
  deckId: string | null;
}

export interface CardSet {
  id: string;
  name: string;
  description?: string | null;
  readOnly?: boolean;
  cards: Card[];
}
