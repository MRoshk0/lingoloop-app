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

  setId = this.route.snapshot.paramMap.get('setId') ?? '';
  set = computed(() => this.cardsService.getSet(this.setId));

  // Deck edit
  isEditingHeader = signal(false);
  editName = signal('');
  editDescription = signal('');

  // Add form
  frontText = signal('');
  backText = signal('');
  showForm = signal(false);

  // Edit state
  editingCardId = signal<string | null>(null);
  editFrontText = signal('');
  editBackText = signal('');

  constructor() {
    addIcons({
      trashOutline,
      addOutline,
      playCircle,
      createOutline,
      checkmarkOutline,
      closeOutline,
    });
    if (!this.cardsService.getSet(this.setId)) {
      this.cardsService.loadDecks().subscribe();
    }
  }

  startEditHeader() {
    const s = this.set();
    this.editName.set(s?.name ?? '');
    this.editDescription.set(s?.description ?? '');
    this.isEditingHeader.set(true);
  }

  saveHeader() {
    const name = this.editName().trim();
    if (!name) return;
    const description = this.editDescription().trim() || null;
    this.cardsService.updateDeck(this.setId, name, description).subscribe({
      next: () => this.isEditingHeader.set(false),
      error: (err) => {
        console.error('Failed to update deck', err);
        this.isEditingHeader.set(false);
      },
    });
  }

  cancelHeader() {
    this.isEditingHeader.set(false);
  }

  addCard() {
    const front = this.frontText().trim();
    const back = this.backText().trim();
    if (!front || !back) return;
    this.cardsService.addCard(this.setId, front, back).subscribe({
      next: () => {
        this.frontText.set('');
        this.backText.set('');
        this.showForm.set(false);
      },
      error: (err) => console.error('Failed to add card', err),
    });
  }

  startEdit(cardId: string, frontText: string, backText: string) {
    this.editingCardId.set(cardId);
    this.editFrontText.set(frontText);
    this.editBackText.set(backText);
  }

  saveEdit() {
    const id = this.editingCardId();
    const front = this.editFrontText().trim();
    const back = this.editBackText().trim();
    if (id === null || !front || !back) return;
    this.cardsService.updateCard(this.setId, id, front, back).subscribe({
      next: () => this.editingCardId.set(null),
      error: (err) => {
        console.error('Failed to update card', err);
        this.editingCardId.set(null);
      },
    });
  }

  cancelEdit() {
    this.editingCardId.set(null);
  }

  play() {
    this.router.navigateByUrl('/navbar/review');
  }

  removeCard(cardId: string) {
    this.cardsService.removeCard(this.setId, cardId).subscribe({
      error: (err) => console.error('Failed to remove card', err),
    });
  }
}
