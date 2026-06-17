export interface DictionaryEntry {
  id: number;
  word: string;
  article: string | null;
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'other';
  forms: Record<string, string> | null;
  frequency: number | null;
}
