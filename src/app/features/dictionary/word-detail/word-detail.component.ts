import { Component, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { WiktionaryService } from '../../../core/services/wiktionary.service';

@Component({
  selector: 'app-word-detail',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonSpinner],
  templateUrl: './word-detail.component.html',
  styleUrls: ['./word-detail.component.scss'],
})
export class WordDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private wiktionary = inject(WiktionaryService);
  private location = inject(Location);

  lemma = this.route.snapshot.paramMap.get('lemma') ?? '';
  article: string | null = null;
  plural: string | null = null;

  isLoading = signal(true);
  definitions = signal<{ pos: string; meanings: string[] }[]>([]);
  hasError = signal(false);

  ngOnInit() {
    const state = window.history.state as { article?: string | null; plural?: string | null };
    this.article = state?.article ?? null;
    this.plural = state?.plural ?? null;

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
}
