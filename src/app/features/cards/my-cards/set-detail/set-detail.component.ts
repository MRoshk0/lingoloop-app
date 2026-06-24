import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
  IonSpinner,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  addOutline,
  playCircle,
  createOutline,
  checkmarkOutline,
  closeOutline,
  cameraOutline,
  warningOutline,
} from 'ionicons/icons';
import { CardsService } from '../../../../core/services/cards.service';
import { PhotoCardService } from '../../../../core/services/photo-card.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { PhotoCardsModalComponent } from './photo-cards-modal/photo-cards-modal.component';

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
    IonSpinner,
  ],
  templateUrl: './set-detail.component.html',
  styleUrls: ['./set-detail.component.scss'],
})
export class SetDetailComponent {
  cardsService = inject(CardsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private photoCardService = inject(PhotoCardService);
  private translationService = inject(TranslationService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private destroyRef = inject(DestroyRef);

  setId = this.route.snapshot.paramMap.get('setId') ?? '';
  set = computed(() => this.cardsService.getSet(this.setId));

  duplicateFrontTexts = computed(() => {
    const texts = (this.set()?.cards ?? []).map((c) => c.frontText.trim().toLowerCase());
    return new Set(texts.filter((t, i) => texts.indexOf(t) !== i));
  });

  // Search
  searchQuery = signal('');
  filteredCards = computed(() => {
    const cards = this.set()?.cards ?? [];
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) => c.frontText.toLowerCase().includes(q) || c.backText.toLowerCase().includes(q)
    );
  });

  // Deck edit
  isEditingHeader = signal(false);
  editName = signal('');
  editDescription = signal('');

  // Add form
  frontText = signal('');
  backText = signal('');
  showForm = signal(false);
  isTranslating = signal(false);

  private autoFilled = signal(false);
  private frontText$ = new Subject<string>();

  // Edit state
  editingCardId = signal<string | null>(null);
  editFrontText = signal('');
  editBackText = signal('');

  // Photo flow
  photoLoading = signal(false);

  constructor() {
    addIcons({
      trashOutline,
      addOutline,
      playCircle,
      createOutline,
      checkmarkOutline,
      closeOutline,
      cameraOutline,
      warningOutline,
    });
    if (!this.cardsService.getSet(this.setId)) {
      this.cardsService.loadDecks().subscribe();
    }

    this.frontText$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((word) => {
          if (!word.trim()) {
            this.isTranslating.set(false);
            return [];
          }
          this.isTranslating.set(true);
          return this.translationService.deToUk(word);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((translation) => {
        this.isTranslating.set(false);
        if (translation && (this.backText().trim() === '' || this.autoFilled())) {
          this.backText.set(translation);
          this.autoFilled.set(true);
        }
      });
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

  onFrontTextInput() {
    this.frontText$.next(this.frontText());
  }

  onBackTextInput() {
    this.autoFilled.set(false);
  }

  addCard() {
    const front = this.frontText().trim();
    const back = this.backText().trim();
    if (!front || !back) return;
    this.cardsService.addCard(this.setId, front, back).subscribe({
      next: () => {
        this.frontText.set('');
        this.backText.set('');
        this.autoFilled.set(false);
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

  async deleteDeck() {
    const deckName = this.set()?.name ?? 'цю деку';
    const alert = await this.alertController.create({
      header: 'Видалити деку?',
      message: `«${deckName}» та всі її картки будуть видалені назавжди.`,
      buttons: [
        { text: 'Скасувати', role: 'cancel' },
        {
          text: 'Видалити',
          role: 'destructive',
          handler: () => {
            this.cardsService.deleteSet(this.setId).subscribe({
              next: () => this.router.navigateByUrl('/navbar/cards/my-cards', { replaceUrl: true }),
              error: (err) => console.error('Failed to delete deck', err),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async openPhotoFlow() {
    this.photoLoading.set(true);
    try {
      const cards = await this.photoCardService.pickAndExtract();
      if (cards.length === 0) return;
      const modal = await this.modalController.create({
        component: PhotoCardsModalComponent,
        componentProps: { extractedCards: cards, deckId: this.setId },
      });
      await modal.present();
      await modal.onWillDismiss();
    } catch (err) {
      console.error('Photo extraction failed', err);
    } finally {
      this.photoLoading.set(false);
    }
  }
}
