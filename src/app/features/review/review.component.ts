import { Component, inject, signal, computed } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircle } from 'ionicons/icons';
import { CardsService } from '../../core/services/cards.service';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { FlashcardPlayerComponent } from './flashcard-player/flashcard-player.component';
import { Card, CardSet } from '../../core/models';

type SessionState =
  | 'picking'
  | 'idle'
  | 'reviewing'
  | 'complete'
  | 'practicing'
  | 'practice-complete'
  | 'random-setup'
  | 'random-playing'
  | 'random-complete';
type Rating = 'again' | 'hard' | 'good' | 'easy';

const RATING_MAP: Record<Rating, number> = { again: 0, hard: 2, good: 4, easy: 5 };

interface SessionResult {
  card: Card;
  rating: Rating;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonSpinner, FlashcardPlayerComponent],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent {
  private cardsService = inject(CardsService);
  private activityLog = inject(ActivityLogService);

  decks = computed(() => this.cardsService.cardSets().filter((s) => s.cards.length > 0));

  state = signal<SessionState>('picking');
  selectedDeck = signal<CardSet | null>(null);
  cards = signal<Card[]>([]);
  currentIndex = signal(0);
  showAnswer = signal(false);
  results = signal<SessionResult[]>([]);
  dueCount = signal(0);
  isLoading = signal(false);
  noDue = signal(false);

  // Practice Mode
  practiceCards = signal<Card[]>([]);
  practiceIndex = signal(0);

  // Random Game
  randomSelectedDeckIds = signal<Set<string>>(new Set());
  randomCardCount = signal<number>(20);
  randomCards = signal<Card[]>([]);
  randomIndex = signal(0);

  currentCard = computed(() => this.cards()[this.currentIndex()]);
  progress = computed(() => `${this.currentIndex() + 1} / ${this.cards().length}`);
  progressPercent = computed(() => ((this.currentIndex() + 1) / this.cards().length) * 100);

  ratingCounts = computed(() => {
    const r = this.results();
    return {
      again: r.filter((x) => x.rating === 'again').length,
      hard: r.filter((x) => x.rating === 'hard').length,
      good: r.filter((x) => x.rating === 'good').length,
      easy: r.filter((x) => x.rating === 'easy').length,
    };
  });

  currentPracticeCard = computed(() => this.practiceCards()[this.practiceIndex()] as Card);
  practiceProgress = computed(
    () => `${this.practiceIndex() + 1} / ${this.practiceCards().length}`,
  );
  practiceProgressPercent = computed(
    () => ((this.practiceIndex() + 1) / this.practiceCards().length) * 100,
  );

  allDecksSelected = computed(() => this.randomSelectedDeckIds().size === 0);

  currentRandomCard = computed(() => this.randomCards()[this.randomIndex()] as Card);
  randomProgress = computed(() => `${this.randomIndex() + 1} / ${this.randomCards().length}`);
  randomProgressPercent = computed(
    () => ((this.randomIndex() + 1) / this.randomCards().length) * 100,
  );

  constructor() {
    addIcons({ playCircle });
  }

  ionViewWillEnter() {
    this.cardsService.loadDecks().subscribe();
    if (this.state() !== 'reviewing') {
      this.state.set('picking');
    }
  }

  selectDeck(deck: CardSet) {
    this.selectedDeck.set(deck);
    this.noDue.set(false);
    this.state.set('idle');
    this.cardsService.getDueCards(deck.id).subscribe({
      next: (cards) => this.dueCount.set(cards.length),
      error: () => this.dueCount.set(0),
    });
  }

  start() {
    this.isLoading.set(true);
    this.noDue.set(false);
    this.cardsService.getDueCards(this.selectedDeck()!.id).subscribe({
      next: (cards) => {
        this.isLoading.set(false);
        if (cards.length === 0) {
          this.noDue.set(true);
          return;
        }
        this.currentIndex.set(0);
        this.showAnswer.set(false);
        this.results.set([]);
        this.cards.set(cards);
        this.state.set('reviewing');
      },
      error: () => this.isLoading.set(false),
    });
  }

  reveal() {
    this.showAnswer.set(true);
  }

  rate(rating: Rating) {
    const card = this.currentCard();
    this.results.update((r) => [...r, { card, rating }]);

    this.cardsService.reviewCard(card.id, RATING_MAP[rating]).subscribe();

    const next = this.currentIndex() + 1;
    if (next >= this.cards().length) {
      this.state.set('complete');
      const counts = this.ratingCounts();
      this.activityLog.logActivity({
        date: this.activityLog.today(),
        type: 'review',
        score: counts.good + counts.easy,
        total: this.results().length,
      });
    } else {
      this.currentIndex.set(next);
      this.showAnswer.set(false);
    }
  }

  restart() {
    this.state.set('idle');
  }

  pickAnother() {
    this.selectedDeck.set(null);
    this.state.set('picking');
  }

  // ── Practice Mode ─────────────────────────────────────────────────────────

  startPractice() {
    const shuffled = [...this.selectedDeck()!.cards].sort(() => Math.random() - 0.5);
    this.practiceCards.set(shuffled);
    this.practiceIndex.set(0);
    this.state.set('practicing');
  }

  practiceNext() {
    const next = this.practiceIndex() + 1;
    if (next >= this.practiceCards().length) {
      this.state.set('practice-complete');
    } else {
      this.practiceIndex.set(next);
    }
  }

  restartPractice() {
    const reshuffled = [...this.practiceCards()].sort(() => Math.random() - 0.5);
    this.practiceCards.set(reshuffled);
    this.practiceIndex.set(0);
    this.state.set('practicing');
  }

  stopPractice() {
    this.state.set('idle');
  }

  // ── Random Game ───────────────────────────────────────────────────────────

  openRandomSetup() {
    this.randomSelectedDeckIds.set(new Set());
    this.randomCardCount.set(20);
    this.state.set('random-setup');
  }

  toggleDeckSelection(deckId: string) {
    const ids = new Set(this.randomSelectedDeckIds());
    if (ids.has(deckId)) ids.delete(deckId);
    else ids.add(deckId);
    this.randomSelectedDeckIds.set(ids);
  }

  toggleAllDecks() {
    if (this.randomSelectedDeckIds().size === 0) {
      const allIds = new Set(this.decks().map((d) => d.id));
      this.randomSelectedDeckIds.set(allIds);
    } else {
      this.randomSelectedDeckIds.set(new Set());
    }
  }

  setRandomCardCount(count: number) {
    this.randomCardCount.set(count);
  }

  onCustomCountChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (value >= 5 && value <= 100) {
      this.randomCardCount.set(value);
    }
  }

  startRandomGame() {
    const selectedIds = this.randomSelectedDeckIds();
    const sourceDecks =
      selectedIds.size === 0 ? this.decks() : this.decks().filter((d) => selectedIds.has(d.id));
    const allCards = sourceDecks.reduce<Card[]>((acc, d) => [...acc, ...d.cards], []);
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, this.randomCardCount());
    this.randomCards.set(picked);
    this.randomIndex.set(0);
    this.state.set('random-playing');
  }

  randomNext() {
    const next = this.randomIndex() + 1;
    if (next >= this.randomCards().length) {
      this.state.set('random-complete');
    } else {
      this.randomIndex.set(next);
    }
  }

  backFromRandomSetup() {
    this.state.set('picking');
  }

  backToRandomSetup() {
    this.state.set('random-setup');
  }
}
