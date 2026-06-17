import { Component, inject, signal, computed } from '@angular/core';
import { IonContent, IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircle } from 'ionicons/icons';
import { CardsService } from '../../core/services/cards.service';
import { Card, CardSet } from '../../core/models';

type SessionState = 'picking' | 'idle' | 'reviewing' | 'complete';
type Rating = 'again' | 'hard' | 'good' | 'easy';

interface SessionResult {
  card: Card;
  rating: Rating;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [IonContent, IonButton, IonCard, IonCardContent, IonIcon],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent {
  private cardsService = inject(CardsService);

  decks = computed(() => this.cardsService.cardSets().filter((s) => s.cards.length > 0));

  state = signal<SessionState>('picking');
  selectedDeck = signal<CardSet | null>(null);
  cards = signal<Card[]>([]);
  currentIndex = signal(0);
  showAnswer = signal(false);
  results = signal<SessionResult[]>([]);

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
    this.state.set('idle');
  }

  start() {
    this.currentIndex.set(0);
    this.showAnswer.set(false);
    this.results.set([]);
    this.cards.set([...this.selectedDeck()!.cards]);
    this.state.set('reviewing');
  }

  reveal() {
    this.showAnswer.set(true);
  }

  rate(rating: Rating) {
    this.results.update((r) => [...r, { card: this.currentCard(), rating }]);
    const next = this.currentIndex() + 1;
    if (next >= this.cards().length) {
      this.state.set('complete');
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
