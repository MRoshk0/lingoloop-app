import { Component, input, output, signal, effect } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-flashcard-player',
  standalone: true,
  imports: [IonCard, IonCardContent],
  templateUrl: './flashcard-player.component.html',
  styleUrls: ['./flashcard-player.component.scss'],
})
export class FlashcardPlayerComponent {
  frontText = input.required<string>();
  backText = input.required<string>();
  progress = input.required<string>();
  progressPercent = input.required<number>();

  closed = output<void>();
  next = output<void>();

  showBack = signal(false);

  constructor() {
    // Reset card flip state whenever a new card is passed in
    effect(() => {
      this.frontText();
      this.showBack.set(false);
    });
  }

  onCardTap() {
    if (this.showBack()) {
      this.next.emit();
    } else {
      this.showBack.set(true);
    }
  }
}
