import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Card, CardSet } from '../models';

interface DeckResponse {
  id: string;
  name: string;
  description: string | null;
  readOnly: boolean;
  cards: CardResponse[];
  createdAt: string;
  updatedAt: string;
}

interface CardResponse {
  id: string;
  frontText: string;
  backText: string;
  deckId: string | null;
  createdAt: string;
  updatedAt: string;
}

function toCard(c: CardResponse): Card {
  return { id: c.id, frontText: c.frontText, backText: c.backText, deckId: c.deckId };
}

function toDeck(d: DeckResponse): CardSet {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    readOnly: d.readOnly,
    cards: d.cards.map(toCard),
  };
}

@Injectable({ providedIn: 'root' })
export class CardsService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  cardSets = signal<CardSet[]>([]);

  loadDecks(): Observable<CardSet[]> {
    return this.http.get<DeckResponse[]>(`${this.base}/api/decks`).pipe(
      map((decks) => decks.map(toDeck)),
      tap((sets) => this.cardSets.set(sets))
    );
  }

  createSet(name: string): Observable<CardSet> {
    return this.http.post<DeckResponse>(`${this.base}/api/decks`, { name }).pipe(
      map(toDeck),
      tap((set) => this.cardSets.update((sets) => [...sets, set]))
    );
  }

  getSet(id: string): CardSet | undefined {
    return this.cardSets().find((s) => s.id === id);
  }

  addCard(deckId: string, frontText: string, backText: string): Observable<Card> {
    return this.http
      .post<CardResponse>(`${this.base}/api/cards`, { frontText, backText, deckId })
      .pipe(
        map(toCard),
        tap((card) =>
          this.cardSets.update((sets) =>
            sets.map((s) => (s.id === deckId ? { ...s, cards: [...s.cards, card] } : s))
          )
        )
      );
  }

  removeCard(deckId: string, cardId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/api/cards/${cardId}`)
      .pipe(
        tap(() =>
          this.cardSets.update((sets) =>
            sets.map((s) =>
              s.id === deckId ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) } : s
            )
          )
        )
      );
  }

  // TODO: replace with PUT /api/cards/:id once the endpoint is available
  updateCard(deckId: string, cardId: string, frontText: string, backText: string): void {
    this.cardSets.update((sets) =>
      sets.map((s) =>
        s.id === deckId
          ? {
              ...s,
              cards: s.cards.map((c) => (c.id === cardId ? { ...c, frontText, backText } : c)),
            }
          : s
      )
    );
  }
}
