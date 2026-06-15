import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline,
  refreshCircleOutline,
  searchOutline,
  gameControllerOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class NavbarComponent {
  constructor() {
    addIcons({
      cardOutline,
      refreshCircleOutline,
      searchOutline,
      gameControllerOutline,
      personOutline,
    });
  }
}
