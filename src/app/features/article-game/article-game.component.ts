import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gameControllerOutline, trophyOutline } from 'ionicons/icons';
import { WordLookupService, WordEntry } from '../../core/services/word-lookup.service';
import { ActivityLogService } from '../../core/services/activity-log.service';

type GameState = 'setup' | 'playing' | 'summary';
type Article = 'der' | 'die' | 'das';

interface AnswerState {
  chosen: Article;
  correct: boolean;
}

interface GameResult {
  word: WordEntry;
  chosen: Article;
  correct: boolean;
}

@Component({
  selector: 'app-article-game',
  standalone: true,
  imports: [IonContent, IonIcon],
  templateUrl: './article-game.component.html',
  styleUrls: ['./article-game.component.scss'],
})
export class ArticleGameComponent implements OnDestroy {
  private lookupService = inject(WordLookupService);
  private activityLog = inject(ActivityLogService);

  readonly presets = [10, 20, 30, 50] as const;
  readonly articles: Article[] = ['der', 'die', 'das'];

  isReady = this.lookupService.isReady;
  gameState = signal<GameState>('setup');
  wordCount = signal<number>(10);
  words = signal<WordEntry[]>([]);
  currentIndex = signal(0);
  answerState = signal<AnswerState | null>(null);
  results = signal<GameResult[]>([]);

  currentWord = computed(() => this.words()[this.currentIndex()]);
  progress = computed(() => `${this.currentIndex() + 1} / ${this.words().length}`);
  progressPercent = computed(() => ((this.currentIndex() + 1) / this.words().length) * 100);
  score = computed(() => this.results().filter((r) => r.correct).length);
  mistakes = computed(() =>
    this.results()
      .filter((r) => !r.correct)
      .map((r) => r.word)
  );

  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    addIcons({ gameControllerOutline, trophyOutline });
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startGame() {
    this.clearTimer();
    this.words.set(this.lookupService.getRandomWords(this.wordCount()));
    this.currentIndex.set(0);
    this.answerState.set(null);
    this.results.set([]);
    this.gameState.set('playing');
  }

  choose(article: Article) {
    if (this.answerState() !== null) return;
    const word = this.currentWord();
    const correct = article === word.article;
    this.answerState.set({ chosen: article, correct });
    this.results.update((r) => [...r, { word, chosen: article, correct }]);
    this.autoAdvanceTimer = setTimeout(() => this.advance(), 1200);
  }

  getButtonCorrect(article: Article): boolean {
    const ans = this.answerState();
    if (ans === null) return false;
    const word = this.currentWord();
    return (ans.chosen === article && ans.correct) || (!ans.correct && article === word.article);
  }

  getButtonWrong(article: Article): boolean {
    const ans = this.answerState();
    if (ans === null) return false;
    return ans.chosen === article && !ans.correct;
  }

  playAgain() {
    this.startGame();
  }

  changeSettings() {
    this.clearTimer();
    this.gameState.set('setup');
  }

  private advance() {
    this.autoAdvanceTimer = null;
    const next = this.currentIndex() + 1;
    if (next >= this.words().length) {
      this.activityLog.logActivity({
        date: this.activityLog.today(),
        type: 'article-game',
        score: this.score(),
        total: this.words().length,
      });
      this.gameState.set('summary');
    } else {
      this.currentIndex.set(next);
      this.answerState.set(null);
    }
  }

  private clearTimer() {
    if (this.autoAdvanceTimer !== null) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }
}
