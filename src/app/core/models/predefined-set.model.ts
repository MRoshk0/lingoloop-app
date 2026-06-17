export interface PredefinedCard {
  word: string;
  translation: string;
}

export interface PredefinedSet {
  id: number;
  title: string;
  emoji: string;
  cards: PredefinedCard[];
}
