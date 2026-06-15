import { Component, inject, signal, computed } from '@angular/core';
import {
  IonContent,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { WordLookupService } from '../../core/services/word-lookup.service';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [IonContent, IonSearchbar, IonSpinner],
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent {
  private lookupService = inject(WordLookupService);

  query = signal('');
  isReady = this.lookupService.isReady;
  results = computed(() => {
    const q = this.query().trim();
    return q ? this.lookupService.search(q, 20) : [];
  });

  onSearch(event: Event) {
    const value = (event as CustomEvent).detail.value ?? '';
    this.query.set(value);
  }
}
