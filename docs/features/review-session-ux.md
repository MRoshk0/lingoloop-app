# Review Session UX

## UX Flow

```
picking ──[select deck]──► idle ──[Start Review]──► reviewing ──[rate last card]──► complete
                                       │                  │                              │
                              [No cards due]         [Again/Hard/                [Review Again]
                              shows message           Good/Easy]                        │
                                                    next card ◄──────────────────────  idle
```

### picking
List of all user decks that have at least one card. Tap to select → idle.

### idle
Start screen: deck name, emoji, **"N due today"** badge (loaded via `GET /api/decks/:id/due-cards`).

- Badge fades when 0 due cards
- Start Review button is **disabled** when 0 due cards or while loading
- Shows "No cards due today! 🎉" message when `getDueCards` returns an empty list
- Loading spinner replaces the play icon while fetching

### reviewing
- Progress indicator `current / total` (e.g. "3 / 10")
- Flashcard showing `frontText` (German word)
- Tap card / "Tap to reveal" → reveals `backText` (Ukrainian translation)
- 4 rating buttons: **Again / Hard / Good / Easy**
- Each rating fires `POST /api/cards/:id/review` (fire-and-forget, never blocks UI)
- Auto-advances to next card; last card → `complete`

### complete
Summary screen: total cards reviewed, per-rating breakdown (Again/Hard/Good/Easy counts).
Logs session to ActivityLogService (`type: 'review'`, `score = good + easy`, `total = cards reviewed`).
"Review Again" → idle | "Choose Another Deck" → picking.

## API Endpoints

| Action | Endpoint | Body / Params |
|--------|----------|---------------|
| Fetch due cards | `GET /api/decks/:id/due-cards` | — |
| Submit rating | `POST /api/cards/:id/review` | `{ rating: number }` |

## Rating → SM-2 Quality Mapping

| Button | SM-2 quality |
|--------|-------------|
| Again  | 0           |
| Hard   | 2           |
| Good   | 4           |
| Easy   | 5           |

## Card SM-2 Fields

The `Card` model carries optional SM-2 fields returned by the backend after review:

```ts
dueDate?: string;       // ISO date "YYYY-MM-DD" — next review date
intervalDays?: number;  // current interval
repetitions?: number;   // successful review count
easeFactor?: number;    // SM-2 ease factor (default 2.5)
```
