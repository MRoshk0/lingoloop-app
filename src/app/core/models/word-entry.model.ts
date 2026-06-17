export interface WordEntry {
  lemma: string;
  article: 'der' | 'die' | 'das';
  plural: string | null;
}
