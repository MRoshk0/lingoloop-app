import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface WordEntry {
  lemma: string;
  article: 'der' | 'die' | 'das';
  plural: string | null;
}

@Injectable({ providedIn: 'root' })
export class WordLookupService {
  isReady = signal(false);

  private index = new Map<string, WordEntry>();
  private sortedLemmas: string[] = []; // lowercase, sorted for prefix search

  constructor(private http: HttpClient) {
    this.http.get<WordEntry[]>('/assets/data/german-nouns.json').subscribe({
      next: entries => {
        for (const entry of entries) {
          this.index.set(entry.lemma.toLowerCase(), entry);
        }
        this.sortedLemmas = [...this.index.keys()].sort();
        this.isReady.set(true);
      },
      error: err => console.error('[WordLookupService] Failed to load dictionary', err),
    });
  }

  /** Case-insensitive prefix match, returns up to `limit` results. */
  search(query: string, limit = 10): WordEntry[] {
    if (!query.trim() || !this.isReady()) return [];
    const q = query.toLowerCase();

    // Binary search for the first lemma >= q
    let lo = 0;
    let hi = this.sortedLemmas.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.sortedLemmas[mid] < q) lo = mid + 1;
      else hi = mid;
    }

    const results: WordEntry[] = [];
    for (let i = lo; i < this.sortedLemmas.length && results.length < limit; i++) {
      if (!this.sortedLemmas[i].startsWith(q)) break;
      const entry = this.index.get(this.sortedLemmas[i]);
      if (entry) results.push(entry);
    }
    return results;
  }

  /** Exact lookup by lemma (case-insensitive). */
  lookup(lemma: string): WordEntry | undefined {
    return this.index.get(lemma.toLowerCase());
  }
}
