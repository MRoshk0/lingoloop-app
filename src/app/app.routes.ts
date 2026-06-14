import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/cards/cards.component').then(m => m.CardsComponent),
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./features/review/review.component').then(m => m.ReviewComponent),
  },
];
