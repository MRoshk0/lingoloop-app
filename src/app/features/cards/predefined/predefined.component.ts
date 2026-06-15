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
} from '@ionic/angular/standalone';
import { PredefinedSetsService } from '../../../core/services/predefined-sets.service';

@Component({
  selector: 'app-predefined',
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
  ],
  templateUrl: './predefined.component.html',
  styleUrls: ['./predefined.component.scss'],
})
export class PredefinedComponent {
  setsService = inject(PredefinedSetsService);
  private router = inject(Router);

  get sets() {
    return this.setsService.sets;
  }

  openDeck(id: number) {
    this.router.navigateByUrl(`/navbar/cards/predefined/${id}`);
  }
}
