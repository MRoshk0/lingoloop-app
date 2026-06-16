import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { CardsService } from '../../../core/services/cards.service';

@Component({
  selector: 'app-my-cards',
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
  ],
  templateUrl: './my-cards.component.html',
  styleUrls: ['./my-cards.component.scss'],
})
export class MyCardsComponent {
  cardsService = inject(CardsService);
  private router = inject(Router);

  constructor() {
    addIcons({ addOutline });
    this.cardsService.loadDecks().subscribe();
  }

  get sets() {
    return this.cardsService.cardSets();
  }

  createSet() {
    this.router.navigateByUrl('/navbar/cards/my-cards/create-set');
  }

  openSet(id: string) {
    this.router.navigateByUrl(`/navbar/cards/my-cards/${id}`);
  }
}
