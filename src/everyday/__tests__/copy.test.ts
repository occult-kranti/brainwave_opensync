/**
 * Everyday copy contract: every user-visible string in copy.ts is ≤ 12
 * words, headings ≤ 3 words, no "!", none of the lab's banned phrases, and
 * no effect claims — intent sublines describe sound, not outcomes.
 */
import { describe, expect, it } from 'vitest';
import { BANNED_PHRASES, findBannedPhrases } from '@/docs/vocabulary';
import { copy } from '../copy';

interface Entry {
  path: string;
  text: string;
}

function walk(node: unknown, path: string, out: Entry[]): Entry[] {
  if (typeof node === 'string') out.push({ path, text: node });
  else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k, out);
  return out;
}

/** Tokens carrying at least one letter or digit ("—" and "·" are not words). */
export const wordCount = (s: string): number => s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;

const EFFECT_CLAIMS: readonly RegExp[] = [
  /\bhelps?\b/i,
  /\bboosts?\b/i,
  /\bimproves?\b/i,
  /\benhances?\b/i,
  /\bcures?\b/i,
  /\btreats?\b/i,
  /\bheals?\b/i,
  /\bproven\b/i,
  /\bclinically\b/i,
  /\bguarantee/i,
  /\bcalms?\b/i,
  /\breduces?\b/i,
  /\brelieves?\b/i,
  /better sleep/i,
  /deeper sleep/i,
  /fall asleep/i,
  /\bmakes you\b/i,
];

/** Sublines may only describe the sound — never the intent's outcome. */
const OUTCOME_WORDS = /\b(sleep|focus|relax|meditat\w*|calm|rest|stress|anxiety|energy)\b/i;

const ALL = walk(copy, '', []);

describe('everyday copy contract', () => {
  it('has strings to check', () => {
    expect(ALL.length).toBeGreaterThan(60);
  });

  it('every string is at most 12 words', () => {
    const long = ALL.filter((e) => wordCount(e.text) > 12);
    expect(long, long.map((e) => `${e.path}: "${e.text}"`).join('\n')).toEqual([]);
  });

  it('headings are at most 3 words', () => {
    const long = walk(copy.headings, 'headings', []).filter((e) => wordCount(e.text) > 3);
    expect(long).toEqual([]);
  });

  it('no exclamation marks', () => {
    expect(ALL.filter((e) => e.text.includes('!'))).toEqual([]);
  });

  it('none of the banned phrases', () => {
    expect(BANNED_PHRASES.length).toBeGreaterThan(0);
    const hits = ALL.filter((e) => findBannedPhrases(e.text).length > 0);
    expect(hits).toEqual([]);
  });

  it('no effect claims', () => {
    const hits = ALL.filter((e) => EFFECT_CLAIMS.some((re) => re.test(e.text)));
    expect(hits, hits.map((e) => `${e.path}: "${e.text}"`).join('\n')).toEqual([]);
  });

  it('intent sublines describe sound only (≤ 4 words, no outcome words)', () => {
    for (const [id, c] of Object.entries(copy.intents)) {
      expect(wordCount(c.sub), `${id}: "${c.sub}"`).toBeLessThanOrEqual(4);
      expect(OUTCOME_WORDS.test(c.sub), `${id}: "${c.sub}"`).toBe(false);
    }
  });

  it('bowl-set lines are at most 6 words', () => {
    for (const [id, line] of Object.entries(copy.sounds.bowlSets)) expect(wordCount(line), id).toBeLessThanOrEqual(6);
  });

  it('safety summaries are at most 10 words', () => {
    for (const [k, line] of Object.entries(copy.about.safety)) expect(wordCount(line), k).toBeLessThanOrEqual(10);
  });

  it('evidence sheet has exactly four rows', () => {
    expect(Object.keys(copy.evidence.rows)).toHaveLength(4);
  });
});
