import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DictionaryEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class DictionaryApiService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  search(query: string, limit = 20): Observable<DictionaryEntry[]> {
    return this.http.get<DictionaryEntry[]>(`${this.base}/api/dictionary`, {
      params: { q: query, limit: limit.toString() },
    });
  }
}
