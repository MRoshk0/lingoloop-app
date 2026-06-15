import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  addOutline,
  playCircle,
  createOutline,
  checkmarkOutline,
  closeOutline,
} from 'ionicons/icons';
import { CardsService } from '../../../../core/services/cards.service';

@Component({
  selector: 'app-set-detail',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
  ],
  templateUrl: './set-detail.component.html',
  styleUrls: ['./set-detail.component.scss'],
})
export class SetDetailComponent {
  cardsService = inject(CardsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  setId = Number(this.route.snapshot.paramMap.get('setId'));
  set = computed(() => this.cardsService.getSet(this.setId));

  // Add form
  word = signal('');
  translation = signal('');
  showForm = signal(false);

  // Edit state
  editingCardId = signal<number | null>(null);
  editWord = signal('');
  editTranslation = signal('');

  constructor() {
    addIcons({
      trashOutline,
      addOutline,
      playCircle,
      createOutline,
      checkmarkOutline,
      closeOutline,
    });
  }

  addCard() {
    const w = this.word().trim();
    const t = this.translation().trim();
    if (!w || !t) return;
    this.cardsService.addCard(this.setId, w, t);
    this.word.set('');
    this.translation.set('');
    this.showForm.set(false);
  }

  startEdit(cardId: number, word: string, translation: string) {
    this.editingCardId.set(cardId);
    this.editWord.set(word);
    this.editTranslation.set(translation);
  }

  saveEdit() {
    const id = this.editingCardId();
    const w = this.editWord().trim();
    const t = this.editTranslation().trim();
    if (id !== null && w && t) {
      this.cardsService.updateCard(this.setId, id, w, t);
    }
    this.editingCardId.set(null);
  }

  cancelEdit() {
    this.editingCardId.set(null);
  }

  play() {
    this.router.navigateByUrl('/navbar/review');
  }

  removeCard(cardId: number) {
    this.cardsService.removeCard(this.setId, cardId);
  }
}
