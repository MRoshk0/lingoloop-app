import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';
import { CardsService } from '../../../../core/services/cards.service';

@Component({
  selector: 'app-create-set',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonItem,
    IonInput,
    IonButton,
  ],
  templateUrl: './create-set.component.html',
  styleUrls: ['./create-set.component.scss'],
})
export class CreateSetComponent {
  name = signal('');
  private cardsService = inject(CardsService);
  private router = inject(Router);

  submit() {
    const trimmed = this.name().trim();
    if (!trimmed) return;
    this.cardsService.createSet(trimmed).subscribe((set) => {
      this.router.navigateByUrl(`/navbar/cards/my-cards/${set.id}`, { replaceUrl: true });
    });
  }
}
