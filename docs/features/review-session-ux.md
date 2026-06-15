# Review Session UX

## UX Flow

```
idle ──[Start Review]──► reviewing ──[rate last card]──► complete
                              │                               │
                         [Again/Hard/                 [Back to Start]
                          Good/Easy]                         │
                              │                              idle
                         next card ◄────────────────────────┘
```

### idle
Start screen: deck name, emoji, "N cards due" badge, "Start Review" button.

### reviewing
- Progress indicator `current / total` (e.g. "3 / 10")
- Flashcard showing `frontText` (German word)
- "Show Answer" button reveals `backText` (Ukrainian translation)
- 4 rating buttons: **Again / Hard / Good / Easy**
- Rating logs to console; result stored in session array
- Auto-advances to next card; last card → `complete`

### complete
Summary screen: total cards reviewed, per-rating breakdown (Again/Hard/Good/Easy counts), "Back to Start" button → `idle`.

## Mock Data Structure

```ts
interface ReviewCard {
  id: string;
  frontText: string;   // German word shown on front
  backText: string;    // Ukrainian translation revealed on back
  deckId: string;
}
```

Source: `features/review/review.mock.ts` — 10 Travel deck cards.

## Rating → SM-2 Quality Mapping (TBD)

Rating buttons map to SM-2 quality scores — exact mapping is a separate decision:

| Button | SM-2 quality (proposed) |
|--------|------------------------|
| Again  | 0                      |
| Hard   | 2                      |
| Good   | 4                      |
| Easy   | 5                      |

> **Note:** This component is a UI foundation. Backend SM-2 endpoints will be
> integrated in a later step. When ready, replace mock array with API call and
> POST rating results to the SM-2 endpoint after each `rate()` call.
