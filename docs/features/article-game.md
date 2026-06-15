# Article Game Feature

A quick-fire der/die/das quiz built on top of the German noun dictionary.

## Game Flow

```
setup → playing → summary
           ↑          |
           └──────────┘  (Play Again)
```

**Setup:** choose a word count preset (10 / 20 / 30 / 50), tap "Start Game".

**Playing:**
1. A German noun (lemma only, no article) is displayed centred on screen.
2. Three buttons — `der`, `die`, `das` — styled in article colors (blue / red / green).
3. On tap:
   - Correct → chosen button turns green.
   - Wrong → chosen button turns red; the correct button turns green; plural is revealed below the lemma as context.
4. After 1.2 s the next word appears automatically (`setTimeout`, cleaned up on destroy).
5. Progress indicator "3 / 10" + progress bar at the top.

**Summary:**
- Score displayed as "X / Y correct".
- Mistake list: article badge + lemma + plural for every wrong answer.
- "Play Again" — new random set with the same word count.
- "Change Settings" — back to setup.

## Component

`features/article-game/article-game.component`

| Signal | Type | Role |
|---|---|---|
| `gameState` | `'setup' \| 'playing' \| 'summary'` | Screen router |
| `wordCount` | `number` | Selected preset |
| `words` | `WordEntry[]` | Current game's words |
| `currentIndex` | `number` | Pointer into `words` |
| `answerState` | `AnswerState \| null` | null = unanswered |
| `results` | `GameResult[]` | Per-word outcome |

`getButtonCorrect(article)` / `getButtonWrong(article)` — pure methods for
button class binding; avoid template type narrowing issues.

## Data Source

Delegates to `WordLookupService.getRandomWords(count)` — partial Fisher-Yates
shuffle, O(count), no repeats within a session.

## Article color convention

Shared CSS custom properties from `src/theme/variables.scss`:

```
--article-der: #1565C0  (blue)
--article-die: #C62828  (red)
--article-das: #2E7D32  (green)
```

## Route & Tab

- Route: `/navbar/game` (lazy-loaded)
- Tab: `game-controller-outline` icon, label "Game", inserted between Dictionary and Profile.

## Future steps (deferred)

- **Difficulty levels** — e.g. filter by frequency rank (common / rare nouns).
- **Favourites / custom sets** — let users quiz only their own card sets.
- **Streak & statistics** — persist per-article accuracy to `localStorage`.
- **Timer mode** — optional countdown per word for extra pressure.
