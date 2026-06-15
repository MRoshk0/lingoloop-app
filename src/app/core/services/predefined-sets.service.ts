import { Injectable } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class PredefinedSetsService {
  readonly sets: PredefinedSet[] = [
    { id: 1, title: 'Basic German', emoji: '📚', cards: [] },
    { id: 2, title: 'Numbers', emoji: '🔢', cards: [] },
    { id: 3, title: 'Food & Drinks', emoji: '🍎', cards: [] },
    {
      id: 4,
      title: 'Travel',
      emoji: '✈️',
      cards: [
        { word: 'das Flugzeug', translation: 'літак' },
        { word: 'der Flughafen', translation: 'аеропорт' },
        { word: 'der Bahnhof', translation: 'вокзал' },
        { word: 'der Zug', translation: 'поїзд' },
        { word: 'das Taxi', translation: 'таксі' },
        { word: 'der Koffer', translation: 'валіза' },
        { word: 'der Reisepass', translation: 'паспорт' },
        { word: 'die Fahrkarte', translation: 'квиток' },
        { word: 'das Hotel', translation: 'готель' },
        { word: 'die Unterkunft', translation: 'житло' },
        { word: 'die Reservierung', translation: 'бронювання' },
        { word: 'der Stadtplan', translation: 'карта міста' },
        { word: 'die Straße', translation: 'вулиця' },
        { word: 'das Restaurant', translation: 'ресторан' },
        { word: 'die Sehenswürdigkeit', translation: 'визначна памʼятка' },
        { word: 'der Strand', translation: 'пляж' },
        { word: 'das Museum', translation: 'музей' },
        { word: 'die Grenze', translation: 'кордон' },
        { word: 'der Zoll', translation: 'митниця' },
        { word: 'die Abfahrt', translation: 'відправлення' },
      ],
    },
  ];

  getSet(id: number): PredefinedSet | undefined {
    return this.sets.find((s) => s.id === id);
  }
}
