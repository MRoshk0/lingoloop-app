import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExtractedCard } from '../models';

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  extractCards(imageBase64: string, mimeType: string): Observable<ExtractedCard[]> {
    return this.http.post<ExtractedCard[]>(`${this.base}/api/ai/extract-cards`, {
      imageBase64,
      mimeType,
    });
  }
}
