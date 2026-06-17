import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { IonContent, IonSearchbar, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { WordLookupService } from '../../core/services/word-lookup.service';
import { DictionaryApiService } from '../../core/services/dictionary-api.service';
import { DictionaryEntry } from '../../core/models';

type TranslationState = 'loading' | 'error' | string;

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [IonContent, IonSearchbar, IonSpinner, IonIcon],
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent {
  private lookupService = inject(WordLookupService);
  private dictionaryApiService = inject(DictionaryApiService);
  private http = inject(HttpClient);

  query = signal('');
  isReady = this.lookupService.isReady;

  localResults = computed(() => {
    const q = this.query().trim();
    return q ? this.lookupService.search(q, 20) : [];
  });

  remoteResults = signal<DictionaryEntry[]>([]);
  isLoadingRemote = signal(false);

  hasResults = computed(() => this.localResults().length > 0 || this.remoteResults().length > 0);

  expandedLemma = signal<string | null>(null);
  translations = signal<Record<string, TranslationState>>({});

  private remoteSub: Subscription | null = null;

  constructor() {
    addIcons({ chevronDownOutline, chevronUpOutline });
  }

  onSearch(event: Event) {
    this.query.set((event as CustomEvent).detail.value ?? '');
    this.expandedLemma.set(null);
    this.remoteResults.set([]);
  }

  toggle(lemma: string, article?: string | null) {
    if (this.expandedLemma() === lemma) {
      this.expandedLemma.set(null);
      return;
    }
    this.expandedLemma.set(lemma);
    if (!this.translations()[lemma]) {
      this.fetchTranslation(lemma, article);
    }
  }

  toggleRemote(word: string, article?: string | null) {
    if (this.expandedLemma() === word) {
      this.expandedLemma.set(null);
      return;
    }
    this.expandedLemma.set(word);
    if (!this.translations()[word]) {
      this.fetchTranslation(word, article);
    }
  }

  private fetchTranslation(lemma: string, article?: string | null) {
    this.translations.update((t) => ({ ...t, [lemma]: 'loading' }));
    const query = article ? `${article} ${lemma}` : lemma;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=de|uk`;
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
