/**
 * Sounds (#/sounds): radio-style rows for noise colour, nature kind, bowl
 * set and interval bell, plus one level slider per section. Every change
 * goes straight through the session setters (they ramp click-free).
 */

import type { NatureKind, NoiseColor } from '@/engine';
import { BOWL_SETS } from '@/engine';
import { useSession } from '@/ui/session/useSession';
import { bowlSetToLayers } from '@/ui/session/sessionMath';
import { copy } from '../copy';
import {
  BELL_ROWS,
  LEVEL_MAX_DB,
  LEVEL_MIN_DB,
  NATURE_DEFAULT_DB,
  NOISE_DEFAULT_DB,
  NOISE_ROWS,
  bowlsLevelDb,
  dbToPct,
  fmtMin,
  matchBowlSet,
  pctToDb,
  selectedNoise,
} from '../format';
import { NOISE_COLORS } from '../intents';
import { RadioRow, Range, Section } from '../components/primitives';

const NATURE_ROWS: readonly NatureKind[] = ['rain', 'ocean', 'stream', 'fire', 'thunder'];

const toPct = (db: number) => dbToPct(db, LEVEL_MIN_DB, LEVEL_MAX_DB);
const toDb = (pct: number) => pctToDb(pct, LEVEL_MIN_DB, LEVEL_MAX_DB);

export default function Sounds() {
  const s = useSession();

  // ---- noise ---------------------------------------------------------------
  const noiseSel = s.noiseOn ? selectedNoise(s.noiseDb) : null;
  const noiseDb = noiseSel ? s.noiseDb[noiseSel] : NOISE_DEFAULT_DB;
  const pickNoise = (color: NoiseColor | null) => {
    for (const c of NOISE_COLORS) s.setNoiseDb(c, color === c ? noiseDb : -Infinity);
    if (color && !s.noiseOn) s.setNoiseOn(true);
  };

  // ---- nature --------------------------------------------------------------
  const natureSel = s.nature.on ? s.nature.kind : null;
  const pickNature = (kind: NatureKind | null) => {
    if (kind) {
      s.setNature({ on: true, kind, db: Number.isFinite(s.nature.db) ? s.nature.db : NATURE_DEFAULT_DB });
      if (!s.layersOn) s.setLayersOn(true);
    } else {
      s.setNature({ on: false });
    }
  };

  // ---- bowls ---------------------------------------------------------------
  const bowlSel = matchBowlSet(s.bowls);
  const bowlDb = bowlsLevelDb(s.bowls);
  const pickBowls = (setId: string | null) => {
    if (!setId) {
      s.setBowls(s.bowls.map((b) => ({ ...b, on: false })));
      return;
    }
    const set = BOWL_SETS.find((x) => x.id === setId);
    if (!set) return;
    s.setBowls(bowlSetToLayers(set));
    if (!s.layersOn) s.setLayersOn(true);
  };

  return (
    <div className="ev-page" data-testid="screen-sounds">
      <h1 className="ev-h1">{copy.tabs.sounds}</h1>

      <Section title={copy.headings.noise} testId="section-noise">
        <div className="ev-list" role="radiogroup" aria-label={copy.headings.noise}>
          <RadioRow testId="noise-off" checked={noiseSel === null} onSelect={() => pickNoise(null)}>
            {copy.sounds.off}
          </RadioRow>
          {NOISE_ROWS.map((c) => (
            <RadioRow key={c} testId={`noise-${c}`} checked={noiseSel === c} onSelect={() => pickNoise(c)}>
              {copy.sounds.noise[c]}
            </RadioRow>
          ))}
        </div>
        <Range label={copy.sounds.level} value={toPct(noiseDb)} testId="noise-level" disabled={noiseSel === null} onChange={(p) => noiseSel && s.setNoiseDb(noiseSel, toDb(p))} />
      </Section>

      <Section title={copy.headings.nature} testId="section-nature">
        <div className="ev-list" role="radiogroup" aria-label={copy.headings.nature}>
          <RadioRow testId="nature-off" checked={natureSel === null} onSelect={() => pickNature(null)}>
            {copy.sounds.off}
          </RadioRow>
          {NATURE_ROWS.map((k) => (
            <RadioRow key={k} testId={`nature-${k}`} checked={natureSel === k} onSelect={() => pickNature(k)}>
              {copy.sounds.nature[k]}
            </RadioRow>
          ))}
        </div>
        <Range label={copy.sounds.level} value={toPct(s.nature.db)} testId="nature-level" disabled={natureSel === null} onChange={(p) => s.setNature({ db: toDb(p) })} />
      </Section>

      <Section title={copy.headings.bowls} testId="section-bowls">
        <div className="ev-list" role="radiogroup" aria-label={copy.headings.bowls}>
          <RadioRow testId="bowls-off" checked={bowlSel === 'off'} onSelect={() => pickBowls(null)}>
            {copy.sounds.off}
          </RadioRow>
          {BOWL_SETS.map((set) => (
            <RadioRow key={set.id} testId={`bowls-${set.id}`} checked={bowlSel === set.id} onSelect={() => pickBowls(set.id)} sub={copy.sounds.bowlSets[set.id as keyof typeof copy.sounds.bowlSets]}>
              {set.name}
            </RadioRow>
          ))}
        </div>
        <Range label={copy.sounds.level} value={toPct(bowlDb)} testId="bowls-level" disabled={bowlSel === 'off'} onChange={(p) => s.setBowls(s.bowls.map((b) => ({ ...b, db: toDb(p) })))} />
      </Section>

      <Section title={copy.headings.bell} testId="section-bell">
        <div className="ev-list" role="radiogroup" aria-label={copy.headings.bell}>
          {BELL_ROWS.map((m) => (
            <RadioRow key={m} testId={`bell-${m}`} checked={s.bellEveryMin === m} onSelect={() => s.setBellEveryMin(m)}>
              {m === 0 ? copy.sounds.off : fmtMin(m)}
            </RadioRow>
          ))}
        </div>
      </Section>
    </div>
  );
}
