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
import { Card, CardSet } from '../../core/models';

type SessionState = 'picking' | 'idle' | 'reviewing' | 'complete';
type Rating = 'again' | 'hard' | 'good' | 'easy';

const RATING_MAP: Record<Rating, number> = { again: 0, hard: 2, good: 4, easy: 5 };

interface SessionResult {
  card: Card;
  rating: Rating;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonSpinner],
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
}
