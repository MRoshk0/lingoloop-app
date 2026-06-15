# Word Dictionary Feature

## Overview

A client-side German noun dictionary for article lookup (der/die/das) and
autocomplete. Works fully offline — no backend required in Phase 1.

## Data Sources & Licenses

See [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md) for full attribution.

| Source | Content | License |
|--------|---------|---------|
| [gambolputty/german-nouns](https://github.com/gambolputty/german-nouns) | Noun morphology from Wiktionary | CC BY-SA 4.0 |
| [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) | Corpus frequency counts | MIT |

## Curated Subset

The full Wiktionary noun list is filtered to the **~12,000 most frequent German
nouns** by cross-referencing against a 50,000-word corpus frequency list.

**Build process** (`scripts/build-dictionary.ts`, run with `npx tsx`):
1. Download `de_50k.txt` — 50k words with frequency counts
2. Stream `nouns.csv` — 100k+ rows with morphology data
3. Cross-reference by lemma (case-insensitive), keep only entries with genus m/f/n
4. Sort by frequency descending, deduplicate, take top 12,000
5. Write `src/assets/data/german-nouns.json`

**Output size:** ~677 KB raw JSON (~150–180 KB gzipped).

## Data Structure

```ts
interface WordEntry {
  lemma: string;           // e.g. "Apfel"
  article: 'der' | 'die' | 'das';
  plural: string | null;   // e.g. "Äpfel", or null if unknown
}
```

## WordLookupService API

`core/services/word-lookup.service.ts`

```ts
isReady: Signal<boolean>          // true once JSON loaded & index built
search(query: string, limit?: number): WordEntry[]  // prefix match
lookup(lemma: string): WordEntry | undefined        // exact match
```

On first injection the service loads the JSON asset via `HttpClient`,
builds an in-memory `Map<lowercase, WordEntry>` + sorted array for O(log n)
prefix search via binary search.

## Word Search UI

**Route:** `/navbar/dictionary` (tab: Dictionary, icon: search-outline)

**Component:** `features/dictionary/dictionary.component`

### Screen flow
1. `ion-searchbar` at top — debounced 150 ms, updates `query` signal on each keystroke
2. Results computed reactively: `computed(() => lookupService.search(query(), 20))`
3. Results rendered as a rounded list container (`#F5E6C8` background) with dividers

### States
| State | Condition | Display |
|---|---|---|
| Loading | `isReady() === false` | Spinner + "Завантаження словника…" |
| Idle | query empty | 🔍 "Почни вводити слово для пошуку" |
| No results | query non-empty, 0 results | 😕 "Нічого не знайдено" |
| Results | query non-empty, N results | List of up to 20 entries |

### Result item layout
```
[der]  Apfel
       Pl.: Äpfel
```
Article shown as a colored badge; lemma bold; plural secondary text.

### Article color convention

Standard used in German learning apps (e.g. Der Die Das app).
Defined as CSS custom properties in `src/theme/variables.scss`:

```scss
--article-der: #1565C0;   /* blue  */
--article-die: #C62828;   /* red   */
--article-das: #2E7D32;   /* green */
```

Reuse these variables in Add Card autosuggest and any future article-aware UI.

---

## Phase 1 vs Phase 2

| | Phase 1 (current) | Phase 2 (future) |
|---|---|---|
| Data source | Local JSON asset | Local JSON + AI fallback |
| Coverage | Top ~12k nouns | Any German noun |
| Offline | Yes | Partial (AI needs network) |
| Backend | None | OpenAI / lingoloop-api |

**Phase 2 plan:** if `lookup()` returns `undefined`, fall through to an AI
endpoint (likely OpenAI via lingoloop-api) to get the article for rare or
newly coined nouns. Exact integration is a separate milestone.
