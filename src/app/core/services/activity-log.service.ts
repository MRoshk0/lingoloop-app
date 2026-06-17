import { Injectable } from '@angular/core';
import { ActivityEntry } from '../models';

const STORAGE_KEY = 'll-activity-log';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  logActivity(entry: ActivityEntry): void {
    const all = this.load();
    all.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  getStreak(): { current: number; longest: number } {
    const entries = this.load();
    if (!entries.length) return { current: 0, longest: 0 };

    const uniqueDates = [...new Set(entries.map((e) => e.date))].sort();

    // Longest consecutive run
    let longest = 1;
    let run = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (this.shiftDay(uniqueDates[i - 1], 1) === uniqueDates[i]) {
        if (++run > longest) longest = run;
      } else {
        run = 1;
      }
    }

    // Current streak: consecutive days ending at today or yesterday
    const today = this.today();
    const yesterday = this.shiftDay(today, -1);
    const last = uniqueDates[uniqueDates.length - 1];
    let current = 0;

    if (last === today || last === yesterday) {
      let target = last;
      for (let i = uniqueDates.length - 1; i >= 0; i--) {
        if (uniqueDates[i] === target) {
          current++;
          target = this.shiftDay(target, -1);
        } else {
          break;
        }
      }
    }

    return { current, longest };
  }

  getTodayTotal(): number {
    const today = this.today();
    return this.load()
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.total, 0);
  }

  getStats(): { gamesPlayed: number; avgAccuracy: number } {
    const all = this.load().filter((e) => e.type === 'article-game');
    if (!all.length) return { gamesPlayed: 0, avgAccuracy: 0 };
    const avgAccuracy = all.reduce((sum, e) => sum + e.score / e.total, 0) / all.length;
    return { gamesPlayed: all.length, avgAccuracy };
  }

  today(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private shiftDay(dateStr: string, delta: number): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d + delta);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private load(): ActivityEntry[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
