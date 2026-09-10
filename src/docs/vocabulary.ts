/**
 * Claim-discipline vocabulary — the single list of phrases that must never
 * appear in user-facing copy (feature docs, catalog cards, protocol text).
 * Enforced by tests across modules; CI runs those tests on every push.
 *
 * Why: these words assert a physiological mechanism the evidence does not
 * support (cortical entrainment by binaural beats is unproven), or borrow
 * authority ("CIA-validated") from documents that never validated anything.
 */
export const BANNED_PHRASES: readonly string[] = [
  'induces',
  'synchronizes',
  'attunes',
  'cia-validated',
  'digital drug',
];

/** Case-insensitive scan; returns the banned phrases found in `text`. */
export function findBannedPhrases(text: string, banned: readonly string[] = BANNED_PHRASES): string[] {
  const lower = text.toLowerCase();
  return banned.filter((b) => lower.includes(b));
}
