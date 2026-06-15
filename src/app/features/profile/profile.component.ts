import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flame, pencilOutline } from 'ionicons/icons';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { environment } from '../../../environments/environment';

interface DeckFromApi {
  cards: unknown[];
}

interface ApiStats {
  decks: number;
  cards: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonContent, IonIcon],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private activityLog = inject(ActivityLogService);
  private http = inject(HttpClient);

  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;

  readonly goalPresets = [10, 20, 30, 50];

  username = signal(localStorage.getItem('ll-username') ?? 'Player');
  isEditingName = signal(false);
  initial = computed(() => (this.username()[0] ?? '?').toUpperCase());

  dailyGoal = signal(Number(localStorage.getItem('ll-daily-goal') ?? '20'));
  todayTotal = signal(0);
  goalPercent = computed(() => Math.min((this.todayTotal() / this.dailyGoal()) * 100, 100));

  currentStreak = signal(0);
  longestStreak = signal(0);
  gamesPlayed = signal(0);
  avgAccuracy = signal(0);

  apiLoading = signal(true);
  apiError = signal(false);
  apiStats = signal<ApiStats>({ decks: 0, cards: 0 });

  constructor() {
    addIcons({ flame, pencilOutline });
    this.refreshActivity();
    this.loadApiStats();
  }

  ionViewWillEnter() {
    this.refreshActivity();
  }

  startEdit() {
    this.isEditingName.set(true);
    setTimeout(() => this.nameInputRef?.nativeElement.focus(), 0);
  }

  saveName(value: string) {
    const name = value.trim() || 'Player';
    this.username.set(name);
    localStorage.setItem('ll-username', name);
    this.isEditingName.set(false);
  }

  setGoal(n: number) {
    this.dailyGoal.set(n);
    localStorage.setItem('ll-daily-goal', String(n));
  }

  private refreshActivity() {
    const { current, longest } = this.activityLog.getStreak();
    this.currentStreak.set(current);
    this.longestStreak.set(longest);
    this.todayTotal.set(this.activityLog.getTodayTotal());
    const { gamesPlayed, avgAccuracy } = this.activityLog.getStats();
    this.gamesPlayed.set(gamesPlayed);
    this.avgAccuracy.set(avgAccuracy);
  }

  private loadApiStats() {
    this.http.get<DeckFromApi[]>(`${environment.apiUrl}/api/decks`).subscribe({
      next: (decks) => {
        this.apiStats.set({
          decks: decks.length,
          cards: decks.reduce((sum, d) => sum + (d.cards?.length ?? 0), 0),
        });
        this.apiLoading.set(false);
      },
      error: () => {
        this.apiError.set(true);
        this.apiLoading.set(false);
      },
    });
  }
}
