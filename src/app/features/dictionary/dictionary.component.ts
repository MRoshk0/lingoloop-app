import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonContent, IonSearchbar, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';
import { WordLookupService } from '../../core/services/word-lookup.service';
import { WordEntry, DictionaryEntry } from '../../core/models';

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
  private router = inject(Router);

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

  private remoteSub: Subscription | null = null;

  constructor() {
    addIcons({ timeOutline });
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

  navigateToWord(entry: UnifiedEntry) {
    this.saveToHistory(this.query());
    this.router.navigate(['/navbar/dictionary/word', entry.word], {
      state: { article: entry.article, plural: entry.plural },
    });
  }

  private triggerSearch(q: string) {
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
}
