import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AiService } from './ai.service';
import { ExtractedCard } from '../models';

@Injectable({ providedIn: 'root' })
export class PhotoCardService {
  private aiService = inject(AiService);

  pickAndExtract(): Promise<ExtractedCard[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve([]);
          return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const [meta, base64] = dataUrl.split(',');
          const mimeType = meta.split(':')[1].split(';')[0];

          try {
            const cards = await firstValueFrom(this.aiService.extractCards(base64, mimeType));
            resolve(cards);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }
}
