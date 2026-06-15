import { Component, signal, computed } from '@angular/core';
import { IonContent, IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircle } from 'ionicons/icons';
import { MOCK_REVIEW_CARDS, MOCK_DECK_NAME, ReviewCard } from './review.mock';

type SessionState = 'idle' | 'reviewing' | 'complete';
type Rating = 'again' | 'hard' | 'good' | 'easy';

interface SessionResult {
  card: ReviewCard;
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
  readonly deckName = MOCK_DECK_NAME;
  readonly cards = MOCK_REVIEW_CARDS;

  state = signal<SessionState>('idle');
  currentIndex = signal(0);
  showAnswer = signal(false);
  results = signal<SessionResult[]>([]);

  currentCard = computed(() => this.cards[this.currentIndex()]);
  progress = computed(() => `${this.currentIndex() + 1} / ${this.cards.length}`);
  progressPercent = computed(() => ((this.currentIndex() + 1) / this.cards.length) * 100);

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

  start() {
    this.currentIndex.set(0);
    this.showAnswer.set(false);
    this.results.set([]);
    this.state.set('reviewing');
  }

  reveal() {
    this.showAnswer.set(true);
  }

  rate(rating: Rating) {
    this.results.update((r) => [...r, { card: this.currentCard(), rating }]);
    console.log(`[Review] card=${this.currentCard().id} rating=${rating}`);

    const next = this.currentIndex() + 1;
    if (next >= this.cards.length) {
      this.state.set('complete');
    } else {
      this.currentIndex.set(next);
      this.showAnswer.set(false);
    }
  }

  restart() {
    this.state.set('idle');
  }
}
