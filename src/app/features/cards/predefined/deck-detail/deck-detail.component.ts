import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircle } from 'ionicons/icons';
import { PredefinedSetsService } from '../../../../core/services/predefined-sets.service';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon],
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent {
  private route = inject(ActivatedRoute);
  private setsService = inject(PredefinedSetsService);
  private router = inject(Router);

  deckId = Number(this.route.snapshot.paramMap.get('deckId'));
  deck = computed(() => this.setsService.getSet(this.deckId));

  constructor() {
    addIcons({ playCircle });
  }

  play() {
    this.router.navigateByUrl('/navbar/review');
  }
}
