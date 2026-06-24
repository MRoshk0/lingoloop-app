export interface ActivityEntry {
  date: string; // YYYY-MM-DD
  type: 'article-game' | 'review';
  score: number;
  total: number;
}
