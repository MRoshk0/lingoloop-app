export interface ReviewCard {
  id: string;
  frontText: string;
  backText: string;
  deckId: string;
}

export const MOCK_DECK_NAME = 'Travel';

export const MOCK_REVIEW_CARDS: ReviewCard[] = [
  { id: '1', frontText: 'das Flugzeug', backText: 'літак', deckId: 'travel' },
  { id: '2', frontText: 'der Flughafen', backText: 'аеропорт', deckId: 'travel' },
  { id: '3', frontText: 'der Bahnhof', backText: 'вокзал', deckId: 'travel' },
  { id: '4', frontText: 'der Koffer', backText: 'валіза', deckId: 'travel' },
  { id: '5', frontText: 'der Reisepass', backText: 'паспорт', deckId: 'travel' },
  { id: '6', frontText: 'die Fahrkarte', backText: 'квиток', deckId: 'travel' },
  { id: '7', frontText: 'das Hotel', backText: 'готель', deckId: 'travel' },
  { id: '8', frontText: 'die Sehenswürdigkeit', backText: 'визначна памʼятка', deckId: 'travel' },
  { id: '9', frontText: 'der Strand', backText: 'пляж', deckId: 'travel' },
  { id: '10', frontText: 'die Abfahrt', backText: 'відправлення', deckId: 'travel' },
];
