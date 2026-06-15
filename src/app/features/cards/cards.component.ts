import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent {
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigateByUrl(`/navbar/${path}`);
  }
}
