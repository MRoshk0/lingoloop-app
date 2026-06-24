import { Component, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonSpinner,
  IonButton,
  IonIcon,
  ActionSheetController,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, bookmarksOutline } from 'ionicons/icons';
import { WiktionaryService } from '../../../core/services/wiktionary.service';
import { CardsService } from '../../../core/services/cards.service';

@Component({
  selector: 'app-word-detail',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonSpinner,
    IonButton,
    IonIcon,
  ],
  templateUrl: './word-detail.component.html',
  styleUrls: ['./word-detail.component.scss'],
})
export class WordDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private wiktionary = inject(WiktionaryService);
  private location = inject(Location);
  private cardsService = inject(CardsService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  lemma = this.route.snapshot.paramMap.get('lemma') ?? '';
  article: string | null = null;
  plural: string | null = null;

  isLoading = signal(true);
  definitions = signal<{ pos: string; meanings: string[] }[]>([]);
  hasError = signal(false);

  constructor() {
    addIcons({ addOutline, bookmarksOutline });
  }

  ngOnInit() {
    const state = window.history.state as { article?: string | null; plural?: string | null };
    this.article = state?.article ?? null;
    this.plural = state?.plural ?? null;

    if (this.cardsService.cardSets().length === 0) {
      this.cardsService.loadDecks().subscribe();
    }

    this.wiktionary.getDefinitions(this.lemma).subscribe({
      next: (defs) => {
        this.definitions.set(defs);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  goBack() {
    this.location.back();
  }

  async addToDeck() {
    const decks = this.cardsService.cardSets();
    const frontText = this.article ? `${this.article} ${this.lemma}` : this.lemma;

    const deckButtons = decks.map((deck) => {
      const alreadyHas = deck.cards.some(
        (c) => c.frontText.toLowerCase() === frontText.toLowerCase()
      );
      return {
        text: alreadyHas ? `${deck.name} ✓` : deck.name,
        handler: () => {
          if (alreadyHas) {
            this.showAlreadyExists();
          } else {
            this.saveCard(deck.id, frontText);
          }
          return true;
        },
      };
    });

    const sheet = await this.actionSheetCtrl.create({
      header: 'Додати в деку',
      buttons: [
        ...deckButtons,
        {
          text: 'Створити нову деку',
          icon: 'add-outline',
          handler: () => {
            this.promptNewDeck(frontText);
            return true;
          },
        },
        { text: 'Скасувати', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private async saveCard(deckId: string, frontText: string) {
    const backText = this.definitions()[0]?.meanings[0] ?? '';
    try {
      await firstValueFrom(this.cardsService.addCard(deckId, frontText, backText));
      const toast = await this.toastCtrl.create({
        message: 'Картку додано ✓',
        duration: 1800,
        position: 'bottom',
        color: 'success',
      });
      await toast.present();
    } catch (err) {
      console.error('Failed to add card', err);
    }
  }

  private async showAlreadyExists() {
    const toast = await this.toastCtrl.create({
      message: 'Це слово вже є в цій деці',
      duration: 2000,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  private async promptNewDeck(frontText: string) {
    const alert = await this.alertCtrl.create({
      header: 'Нова дека',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Назва деки' }],
      buttons: [
        { text: 'Скасувати', role: 'cancel' },
        {
          text: 'Створити і додати',
          handler: async (data: { name?: string }) => {
            const name = data.name?.trim();
            if (!name) return false;
            try {
              const deck = await firstValueFrom(this.cardsService.createSet(name));
              await this.saveCard(deck.id, frontText);
            } catch (err) {
              console.error('Failed to create deck', err);
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }
}
