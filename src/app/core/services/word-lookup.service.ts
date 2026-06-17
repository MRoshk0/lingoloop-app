import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WordEntry } from '../models';
import { DictionaryEntry } from '../models';
import { DictionaryApiService } from './dictionary-api.service';

@Injectable({ providedIn: 'root' })
export class WordLookupService {
  isReady = signal(false);

  private index = new Map<string, WordEntry>();
  private sortedLemmas: string[] = [];
  private dictionaryApi = inject(DictionaryApiService);

  constructor(private http: HttpClient) {
    this.http.get<WordEntry[]>('/assets/data/german-nouns.json').subscribe({
      next: (entries) => {
        for (const entry of entries) {
          this.index.set(entry.lemma.toLowerCase(), entry);
        }
        this.sortedLemmas = [...this.index.keys()].sort();
        this.isReady.set(true);
      },
      error: (err) => console.error('[WordLookupService] Failed to load dictionary', err),
    });
  }

  private readonly ARTICLES = ['der', 'die', 'das'] as const;

  /** Parse "der See" → { article: 'der', prefix: 'See' }
      Parse "See"     → { article: null,  prefix: 'See' } */
  parseQuery(query: string): { article: string | null; prefix: string } {
    const q = query.trim();
    for (const art of this.ARTICLES) {
      if (q.toLowerCase().startsWith(art + ' ')) {
        const prefix = q.slice(art.length + 1).trim();
        return { article: art, prefix };
      }
    }
    return { article: null, prefix: q };
  }

  /** Case-insensitive prefix match, returns up to `limit` results. */
  search(query: string, limit = 10): WordEntry[] {
    if (!query.trim() || !this.isReady()) return [];
    const { article, prefix } = this.parseQuery(query);
    if (!prefix) return [];

    const q = prefix.toLowerCase();

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
      if (!entry) continue;
      if (article && entry.article !== article) continue;
      results.push(entry);
    }
    return results;
  }

  searchWithFallback(
    query: string,
    limit = 20
  ): Observable<{ local: WordEntry[]; remote: DictionaryEntry[] }> {
    const local = this.search(query, limit);
    if (local.length >= 3) {
      return of({ local, remote: [] });
    }
    return this.dictionaryApi.search(query, limit).pipe(
      map((remote) => ({ local, remote })),
      catchError((err) => {
        console.error('[WordLookupService] Remote search failed', err);
        return of({ local, remote: [] });
      })
    );
  }

  /** Exact lookup by lemma (case-insensitive). */
  lookup(lemma: string): WordEntry | undefined {
    return this.index.get(lemma.toLowerCase());
  }

  /** Returns `count` unique random entries. Uses partial Fisher-Yates — O(count). */
  getRandomWords(count: number): WordEntry[] {
    const all = [...this.index.values()];
    const n = Math.min(count, all.length);
    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(Math.random() * (all.length - i));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, n);
  }
}
