import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { IonContent, IonSearchbar, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline, timeOutline } from 'ionicons/icons';
import { WordLookupService } from '../../core/services/word-lookup.service';
import { WordEntry, DictionaryEntry } from '../../core/models';

type TranslationState = 'loading' | 'error' | string;

interface UnifiedEntry {
  word: string;
  article: string | null;
  pos: string;
  plural: string | null;
  forms: Record<string, string> | null;
}

const HISTORY_KEY = 'll-search-history';
const HISTORY_MAX = 8;

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [IonContent, IonSearchbar, IonSpinner, IonIcon],
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent implements OnDestroy {
  private lookupService = inject(WordLookupService);
  private http = inject(HttpClient);

  query = signal('');
  isReady = this.lookupService.isReady;

  searchHistory = signal<string[]>(this.loadHistory());

  localResultsData = signal<WordEntry[]>([]);
  remoteResults = signal<DictionaryEntry[]>([]);
  isLoadingRemote = signal(false);

  mergedResults = computed(() => {
    const local = this.localResultsData();
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

    const seen = new Set(localUnified.map((e) => `${e.word.toLowerCase()}|${e.article ?? ''}`));
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
    addIcons({ chevronDownOutline, chevronUpOutline, timeOutline });
  }

  ngOnDestroy() {
    this.remoteSub?.unsubscribe();
  }

  onSearch(event: Event) {
    const q = ((event as CustomEvent).detail.value ?? '') as string;
    this.query.set(q);
    this.triggerSearch(q);
  }

  applyHistory(q: string) {
    this.query.set(q);
    this.triggerSearch(q);
  }

  clearHistory() {
    this.searchHistory.set([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  toggleEntry(word: string, article?: string | null) {
    if (this.expandedLemma() === word) {
      this.expandedLemma.set(null);
      return;
    }
    this.expandedLemma.set(word);
    this.saveToHistory(this.query());
    if (!this.translations()[word]) {
      this.fetchTranslation(word, article);
    }
  }

  private triggerSearch(q: string) {
    this.expandedLemma.set(null);
    this.translations.set({});
    this.remoteSub?.unsubscribe();

    if (!q.trim()) {
      this.localResultsData.set([]);
      this.remoteResults.set([]);
      this.isLoadingRemote.set(false);
      return;
    }

    this.isLoadingRemote.set(true);
    this.remoteSub = this.lookupService.searchWithFallback(q, 20).subscribe({
      next: ({ local, remote }) => {
        this.localResultsData.set(local);
        this.remoteResults.set(remote);
        this.isLoadingRemote.set(false);
      },
      error: () => {
        this.isLoadingRemote.set(false);
      },
    });
  }

  private saveToHistory(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const deduped = this.searchHistory().filter(
      (h) => h.toLowerCase() !== trimmed.toLowerCase()
    );
    deduped.unshift(trimmed);
    const updated = deduped.slice(0, HISTORY_MAX);
    this.searchHistory.set(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }

  private loadHistory(): string[] {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    } catch {
      return [];
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
