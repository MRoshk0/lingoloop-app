import { Injectable, signal } from '@angular/core';

export interface Card {
  id: number;
  word: string;
  translation: string;
}

export interface CardSet {
  id: number;
  name: string;
  cards: Card[];
}

@Injectable({ providedIn: 'root' })
export class CardsService {
  private nextSetId = 1;
  private nextCardId = 1;

  cardSets = signal<CardSet[]>([]);

  createSet(name: string): CardSet {
    const newSet: CardSet = { id: this.nextSetId++, name, cards: [] };
    this.cardSets.update((sets) => [...sets, newSet]);
    return newSet;
  }

  getSet(id: number): CardSet | undefined {
    return this.cardSets().find((s) => s.id === id);
  }

  addCard(setId: number, word: string, translation: string): void {
    const card: Card = { id: this.nextCardId++, word, translation };
    this.cardSets.update((sets) =>
      sets.map((s) => (s.id === setId ? { ...s, cards: [...s.cards, card] } : s))
    );
  }

  updateCard(setId: number, cardId: number, word: string, translation: string): void {
    this.cardSets.update((sets) =>
      sets.map((s) =>
        s.id === setId
          ? { ...s, cards: s.cards.map((c) => (c.id === cardId ? { ...c, word, translation } : c)) }
          : s
      )
    );
  }

  removeCard(setId: number, cardId: number): void {
    this.cardSets.update((sets) =>
      sets.map((s) =>
        s.id === setId ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) } : s
      )
    );
  }
}
