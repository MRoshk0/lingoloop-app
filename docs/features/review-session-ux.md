# Review Session UX

## UX Flow

```
picking ──[select deck]──► idle ──[Start SM-2 Review]──► reviewing ──[rate last card]──► complete
    │                        │                                │                              │
    │                   [Practice]                      [Again/Hard/                [Review Again]
    │                        │                           Good/Easy]                        │
    │                   practicing ◄──────────────────[loops forever, reshuffle on end]    │
    │                                                                               ◄──── idle
    │
    └──[🎲 Random Game]──► random-setup ──[Start Game]──► random-playing ──[last card]──► random-complete
                               │                                                               │
                            [Back]                                              [Play Again / Change Settings]
```

### picking
List of all user decks that have at least one card. Tap to select → idle.
Also shows a **🎲 Random Game** button (outline, green) at the bottom → `random-setup`.

### idle
Start screen: deck name, emoji, **"N due today"** badge (loaded via `GET /api/decks/:id/due-cards`).

- Badge fades when 0 due cards
- **Start SM-2 Review** button is disabled when 0 due cards or while loading
- Shows "No cards due today! 🎉" message when `getDueCards` returns an empty list
- Loading spinner replaces the play icon while fetching
- **Practice** button (outline) shows total card count — always enabled; no API call, no SM-2 side effects

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

### practicing
Infinite flashcard loop over the selected deck's cards. No SM-2 effects.

- Cards shuffled on entry; reshuffled on each loop
- Progress bar and `current / total` counter (resets on reshuffle)
- Tap card → reveals back; **Next →** button advances
- Top-right **✕** → back to idle

### random-setup
Configuration screen for a cross-deck random game.

- **All decks** toggle (on by default; empty set = all decks)
- When "All decks" is ON: individual deck chips appear selected and are disabled
- Deck chips: multi-select; selected = yellow fill
- **Number of cards** presets: 10 / 20 / 30 / 50 (chip style)
- Custom number input (min 5, max 100)
- **Start Game** → `random-playing` | **Back** → `picking`

### random-playing
Same UI as `practicing` but pulls from the configured cross-deck card pool (shuffled, sliced to N).
No SM-2 effects. Last card → `random-complete`.

### random-complete
Mini summary: "Game over! X cards practiced."
- **Play Again** → `startRandomGame()` (same settings, re-shuffle)
- **Change Settings** → `random-setup`
- **Back to Decks** → `picking`

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
