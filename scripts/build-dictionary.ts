/**
 * build-dictionary.ts
 * One-time data prep: downloads German nouns + frequency list, outputs JSON.
 * Run: npx tsx scripts/build-dictionary.ts
 *
 * Sources:
 *  - gambolputty/german-nouns (CC BY-SA 4.0) — Wiktionary-derived noun morphology
 *  - hermitdave/FrequencyWords (MIT) — corpus frequency counts
 */

import https from 'node:https';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { IncomingMessage } from 'node:http';

const NOUNS_CSV_URL =
  'https://raw.githubusercontent.com/gambolputty/german-nouns/main/german_nouns/nouns.csv';
const FREQ_URL =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt';
const OUTPUT_PATH = path.join(process.cwd(), 'src/assets/data/german-nouns.json');
const TOP_N = 12_000;

export interface WordEntry {
  lemma: string;
  article: 'der' | 'die' | 'das';
  plural: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function httpsGet(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          httpsGet(res.headers.location).then(resolve).catch(reject);
        } else {
          resolve(res);
        }
      })
      .on('error', reject);
  });
}

async function downloadText(url: string): Promise<string> {
  const res = await httpsGet(url);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    res.on('data', (c: Buffer) => chunks.push(c));
    res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    res.on('error', reject);
  });
}

/** Minimal RFC-4180 CSV row parser (handles quoted fields with embedded commas). */
function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

function mapGenus(genus: string): 'der' | 'die' | 'das' | null {
  if (genus === 'm') return 'der';
  if (genus === 'f') return 'die';
  if (genus === 'n') return 'das';
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Step 1 — frequency list (de_50k.txt: "word count" per line, sorted desc)
  console.log('⬇️  Downloading frequency list…');
  const freqText = await downloadText(FREQ_URL);
  const freqMap = new Map<string, number>(); // lowercase word → raw count
  for (const line of freqText.split('\n')) {
    const parts = line.trim().split(' ');
    if (parts.length >= 2) {
      const word = parts[0].toLowerCase();
      const count = parseInt(parts[1], 10);
      if (word && !isNaN(count)) freqMap.set(word, count);
    }
  }
  console.log(`   ${freqMap.size.toLocaleString()} words in frequency list`);

  // Step 2 — stream nouns.csv line-by-line
  console.log('⬇️  Streaming nouns.csv…');
  const res = await httpsGet(NOUNS_CSV_URL);
  const rl = readline.createInterface({ input: res, crlfDelay: Infinity });

  let headers: string[] = [];
  // column indices (resolved from header row)
  let iLemma = 0;
  let iGenus = 2;
  let iGenus1 = 3;
  let iNomPlural = -1;
  let iNomPlural1 = -1;

  const candidates: Array<{ entry: WordEntry; freq: number }> = [];
  let rowCount = 0;

  await new Promise<void>((resolve, reject) => {
    rl.on('line', (line: string) => {
      if (!line.trim()) return;
      const row = parseCSVRow(line);

      if (headers.length === 0) {
        // header row
        headers = row;
        iLemma = headers.indexOf('lemma');
        iGenus = headers.indexOf('genus');
        iGenus1 = headers.indexOf('genus 1');
        iNomPlural = headers.indexOf('nominativ plural');
        iNomPlural1 = headers.indexOf('nominativ plural 1');
        return;
      }

      rowCount++;
      const lemma = row[iLemma]?.trim();
      if (!lemma) return;

      // resolve genus: prefer primary, fallback to genus 1
      const rawGenus = row[iGenus]?.trim() || row[iGenus1]?.trim() || '';
      const article = mapGenus(rawGenus);
      if (!article) return; // skip non-noun or ambiguous

      // frequency cross-reference
      const freq = freqMap.get(lemma.toLowerCase());
      if (!freq) return; // not in frequency list

      // plural: prefer nominativ plural, fallback to nominativ plural 1
      const plural =
        (iNomPlural >= 0 ? row[iNomPlural]?.trim() : '') ||
        (iNomPlural1 >= 0 ? row[iNomPlural1]?.trim() : '') ||
        null;

      candidates.push({
        entry: { lemma, article, plural: plural || null },
        freq,
      });
    });
    rl.on('close', resolve);
    rl.on('error', reject);
  });

  console.log(`   ${rowCount.toLocaleString()} CSV rows parsed`);
  console.log(`   ${candidates.length.toLocaleString()} nouns cross-referenced with frequency list`);

  // Step 3 — sort by frequency desc, deduplicate by lemma, take top N
  candidates.sort((a, b) => b.freq - a.freq);

  const seen = new Set<string>();
  const result: WordEntry[] = [];
  for (const { entry } of candidates) {
    const key = entry.lemma.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
      if (result.length >= TOP_N) break;
    }
  }

  // Step 4 — write JSON
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result), 'utf8');
  const sizeKB = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
  console.log(`✅ Written ${result.length.toLocaleString()} entries → ${OUTPUT_PATH}`);
  console.log(`   File size: ${sizeKB} KB`);
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
