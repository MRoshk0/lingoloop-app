import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'navbar/cards',
    pathMatch: 'full',
  },
  {
    path: 'navbar',
    loadComponent: () =>
      import('./features/navbar/navbar.component').then((m) => m.NavbarComponent),
    children: [
      {
        path: 'cards',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/cards/cards.component').then((m) => m.CardsComponent),
          },
          {
            path: 'my-cards',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/cards/my-cards/my-cards.component').then(
                    (m) => m.MyCardsComponent
                  ),
              },
              {
                path: 'create-set',
                loadComponent: () =>
                  import('./features/cards/my-cards/create-set/create-set.component').then(
                    (m) => m.CreateSetComponent
                  ),
              },
              {
                path: ':setId',
                loadComponent: () =>
                  import('./features/cards/my-cards/set-detail/set-detail.component').then(
                    (m) => m.SetDetailComponent
                  ),
              },
            ],
          },
          {
            path: 'predefined',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/cards/predefined/predefined.component').then(
                    (m) => m.PredefinedComponent
                  ),
              },
              {
                path: ':deckId',
                loadComponent: () =>
                  import('./features/cards/predefined/deck-detail/deck-detail.component').then(
                    (m) => m.DeckDetailComponent
                  ),
              },
            ],
          },
        ],
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./features/cards/add/add-card.component').then((m) => m.AddCardComponent),
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./features/review/review.component').then((m) => m.ReviewComponent),
      },
      {
        path: 'dictionary',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/dictionary/dictionary.component').then(
                (m) => m.DictionaryComponent
              ),
          },
          {
            path: 'word/:lemma',
            loadComponent: () =>
              import('./features/dictionary/word-detail/word-detail.component').then(
                (m) => m.WordDetailComponent
              ),
          },
        ],
      },
      {
        path: 'game',
        loadComponent: () =>
          import('./features/article-game/article-game.component').then(
            (m) => m.ArticleGameComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: '',
        redirectTo: 'cards',
        pathMatch: 'full',
      },
    ],
  },
];
