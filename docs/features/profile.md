# Profile Feature

## Overview

Local-first user profile: username, streak tracker, daily word goal, and stats
dashboard. All data except backend deck counts lives in `localStorage` — no auth
required.

## Activity Log

`ActivityLogService` (`core/services/activity-log.service.ts`) is the single
source of truth for streak and stats. It stores an array of `ActivityEntry`
records in `localStorage` under the key `ll-activity-log`.

```ts
interface ActivityEntry {
  date: string; // YYYY-MM-DD, local timezone
  type: 'article-game';
  score: number; // correct answers
  total: number; // total questions
}
```

### Current data sources

| Source | When logged |
|---|---|
| Article Game | On every completed game (transition to summary screen) |
| Review session | **Deferred** — will be wired once SM-2 uses real card data |

Multiple entries per day per type are stored as separate records (no merging).
This keeps the log append-only and avoids conflict resolution.

### Streak algorithm

1. Collect unique dates from the log, sort ascending.
2. **Current streak**: walk backward from the last date; count consecutive days
   ending at today *or* yesterday (yesterday counts so you don't lose a streak
   by checking the app before midnight).
3. **Longest streak**: single linear scan for the longest consecutive run.

### Stats

- `getStats()` aggregates all `article-game` entries: count = `gamesPlayed`,
  mean of `score/total` across entries = `avgAccuracy`.
- `getTodayTotal()` sums `total` for today's date — used by the Daily Goal bar.

## Daily Goal

User picks a preset (10 / 20 / 30 / 50 words/day). Stored in `localStorage`
under `ll-daily-goal` (default 20). Progress = `getTodayTotal() / goal`, capped
at 100 %. The goal bar is driven by the article game's `total` field.

## Stats Dashboard

Four stat cards in a 2 × 2 grid:

| Card | Source |
|---|---|
| Games played | `ActivityLogService.getStats()` |
| Avg accuracy | `ActivityLogService.getStats()` |
| Decks | `GET /api/decks` (lingoloop-api) |
| Total cards | Sum of `cards.length` across API response |

The backend stats show "…" while loading and "—" on error (e.g. API offline in
dev). The API URL is set via `environment.apiUrl` (`http://localhost:3000` in
dev, `https://api.lingoloop.app` in prod).

## Lifecycle

`ProfileComponent.ionViewWillEnter()` refreshes all activity-log signals each
time the Profile tab becomes active, so the streak and stats are always current
without requiring a full component re-creation.

## localStorage Keys

| Key | Content | Default |
|---|---|---|
| `ll-username` | Display name string | `'Player'` |
| `ll-daily-goal` | Goal as string-encoded number | `'20'` |
| `ll-activity-log` | JSON array of `ActivityEntry` | `'[]'` |

## Future Steps (deferred)

- **Export / Backup**: download `ll-activity-log` as JSON; import from file.
- **Review session integration**: log SM-2 review sessions once real card data
  is used (post Add-Card milestone).
- **Streak freeze**: consumable item that keeps the streak alive for one missed
  day.
- **Weekly chart**: per-day bar chart of words practiced using activity log.
