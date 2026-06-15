# Third-Party Notices

This file contains attributions for third-party data sources used in LingoLoop.

---

## german-nouns (Wiktionary-derived noun morphology)

- **Repository:** https://github.com/gambolputty/german-nouns
- **License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- **License URL:** https://creativecommons.org/licenses/by-sa/4.0/
- **Original source:** Wiktionary (https://www.wiktionary.org)
- **Usage:** Noun lemmas, grammatical gender (der/die/das), and plural forms.
  Used to build `src/assets/data/german-nouns.json` via `scripts/build-dictionary.ts`.

Under CC BY-SA 4.0 you are free to share and adapt the material provided you
give appropriate credit, link to the license, and distribute derivatives under
the same license.

---

## FrequencyWords (German corpus frequency list)

- **Repository:** https://github.com/hermitdave/FrequencyWords
- **File used:** `content/2018/de/de_50k.txt`
- **License:** MIT License
- **Copyright:** © 2016 Hermit Dave

MIT License text:

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

- **Usage:** Word frequency counts used to rank and select the top ~12,000 most
  common German nouns. Used in `scripts/build-dictionary.ts` only; raw data is
  not distributed with the app.
