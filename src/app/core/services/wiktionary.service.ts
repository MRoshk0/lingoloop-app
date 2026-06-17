import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface WiktionaryDefinition {
  definition: string;
}

interface WiktionaryEntry {
  partOfSpeech: string;
  definitions: WiktionaryDefinition[];
}

interface WiktionaryResponse {
  [lang: string]: WiktionaryEntry[];
}

@Injectable({ providedIn: 'root' })
export class WiktionaryService {
  private http = inject(HttpClient);

  getDefinitions(lemma: string): Observable<{ pos: string; meanings: string[] }[]> {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(lemma)}`;
    return this.http.get<WiktionaryResponse>(url).pipe(
      map((response) => {
        const entries = response['de'];
        if (!entries?.length) return [];
        return entries.map((entry) => ({
          pos: entry.partOfSpeech,
          meanings: entry.definitions
            .map((d) => d.definition.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean),
        }));
      }),
      catchError((err) => {
        console.error('[WiktionaryService] Failed to fetch definitions', err);
        return of([]);
      })
    );
  }
}
