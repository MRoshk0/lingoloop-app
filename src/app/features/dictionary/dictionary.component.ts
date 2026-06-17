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

interface UnifiedEntry {
  word: string;
  article: string | null;
  pos: string;
  plural: string | null;
  forms: Record<string, string> | null;
}

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

  mergedResults = computed(() => {
    const local = this.localResults();
    const remote = this.remoteResults();

    const localUnified: UnifiedEntry[] = local.map((e) => ({
      word: e.lemma,
      article: e.article,
      pos: 'noun',
      plural: e.plural ?? null,
      forms: null,
    }));

    const remoteUnified: UnifiedEntry[] = remote.map((e) => ({
      word: e.word,
      article: e.article ?? null,
      pos: e.pos,
      plural: null,
      forms: e.forms ?? null,
    }));

    const seen = new Set(localUnified.map(e =>
      `${e.word.toLowerCase()}|${e.article ?? ''}`
    ));
    const merged = [...localUnified];
    for (const entry of remoteUnified) {
      const key = `${entry.word.toLowerCase()}|${entry.article ?? ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(entry);
      }
    }

    return merged.sort((a, b) => a.word.localeCompare(b.word, 'de'));
  });

  hasResults = computed(() => this.mergedResults().length > 0);

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

  toggleEntry(word: string, article?: string | null) {
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
