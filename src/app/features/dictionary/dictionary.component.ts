import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonSearchbar, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { WordLookupService } from '../../core/services/word-lookup.service';

type TranslationState = 'loading' | 'error' | string; // string = translated text

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [IonContent, IonSearchbar, IonSpinner, IonIcon],
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent {
  private lookupService = inject(WordLookupService);
  private http = inject(HttpClient);

  query = signal('');
  isReady = this.lookupService.isReady;
  results = computed(() => {
    const q = this.query().trim();
    return q ? this.lookupService.search(q, 20) : [];
  });

  expandedLemma = signal<string | null>(null);
  translations = signal<Record<string, TranslationState>>({});

  constructor() {
    addIcons({ chevronDownOutline, chevronUpOutline });
  }

  onSearch(event: Event) {
    this.query.set((event as CustomEvent).detail.value ?? '');
    this.expandedLemma.set(null);
  }

  toggle(lemma: string) {
    if (this.expandedLemma() === lemma) {
      this.expandedLemma.set(null);
      return;
    }
    this.expandedLemma.set(lemma);
    if (!this.translations()[lemma]) {
      this.fetchTranslation(lemma);
    }
  }

  private fetchTranslation(lemma: string) {
    this.translations.update((t) => ({ ...t, [lemma]: 'loading' }));
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(lemma)}&langpair=de|uk`;
    this.http.get<{ responseData: { translatedText: string } }>(url).subscribe({
      next: (res) => {
        const text = res?.responseData?.translatedText?.trim();
        this.translations.update((t) => ({ ...t, [lemma]: text || 'error' }));
      },
      error: () => {
        this.translations.update((t) => ({ ...t, [lemma]: 'error' }));
      },
    });
  }
}
