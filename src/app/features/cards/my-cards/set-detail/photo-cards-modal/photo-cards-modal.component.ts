import { Component, Input, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonFooter,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { CardsService } from '../../../../../core/services/cards.service';
import { ExtractedCard } from '../../../../../core/models';

@Component({
  selector: 'app-photo-cards-modal',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonCheckbox,
    IonLabel,
    IonFooter,
    IonSpinner,
  ],
  templateUrl: './photo-cards-modal.component.html',
  styleUrls: ['./photo-cards-modal.component.scss'],
})
export class PhotoCardsModalComponent {
  @Input() extractedCards: ExtractedCard[] = [];
  @Input() deckId = '';

  private modalController = inject(ModalController);
  private cardsService = inject(CardsService);

  selected = signal<Set<number>>(new Set());
  saving = signal(false);
  savedCount = signal(0);
  done = signal(false);

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    this.selected.set(new Set(this.extractedCards.map((_, i) => i)));
  }

  toggleCard(index: number) {
    this.selected.update((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  isSelected(index: number): boolean {
    return this.selected().has(index);
  }

  async confirm() {
    this.saving.set(true);
    let count = 0;
    for (const index of this.selected()) {
      const card = this.extractedCards[index];
      await firstValueFrom(this.cardsService.addCard(this.deckId, card.front, card.back));
      count++;
    }
    this.saving.set(false);
    this.savedCount.set(count);
    this.done.set(true);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  close() {
    this.modalController.dismiss({ saved: this.savedCount() });
  }
}
