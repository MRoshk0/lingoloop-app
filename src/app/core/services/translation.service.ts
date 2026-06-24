import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface MyMemoryResponse {
  responseStatus: number;
  responseData: { translatedText: string };
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private http = inject(HttpClient);

  deToUk(word: string): Observable<string> {
    if (!word.trim()) return of('');
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=de|uk`;
    return this.http.get<MyMemoryResponse>(url).pipe(
      map((res) => (res.responseStatus === 200 ? (res.responseData.translatedText?.trim() ?? '') : '')),
      catchError(() => of('')),
    );
  }
}
