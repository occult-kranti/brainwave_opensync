/**
 * BowlSet — the singing-bowl section of the Studio LAYERS panel: a header
 * (count, ready-made sets, add), one row per bowl (on/off, material, strike,
 * pitch, LOCK, pan, interval, level, remove) and the interval-bell row.
 *
 * All state lives in the session (useSession); this component renders it and
 * calls the setters. Rows are flex-wrap with minWidth 0 so the panel keeps
 * working at 390 px. Copy here describes sound models only — the layer is
 * graded D throughout and claims no effect.
 */

import { useState } from 'react';
import { BOWL_MATERIALS, BOWL_NOTE_CHOICES, BOWL_RESTRIKE_CHOICES, BOWL_SETS, BOWL_STRIKES, MAX_BOWLS, noteLabel } from '@/engine';
import type { BowlMaterial, BowlStrike } from '@/engine';
import { useSession } from '@/ui/session/useSession';
import { BELL_CHOICES, bowlSetToLayers, type BowlLayer } from '@/ui/session/sessionMath';
import { Led, Readout } from './primitives';
import { GradeBadge } from './GradeBadge';
import { InfoPopover } from './InfoPopover';
import {
  CUSTOM_NOTE,
  bellChoiceLabel,
  bowlCaption,
  bowlPitchHz,
  customNoteLabel,
  levelSliderDb,
  noteSelectValue,
  panLabel,
  parseBowlHz,
  restrikeLabel,
} from './bowlSetLogic';

/** Same select styling as the NATURE row. */
const SELECT_STYLE: React.CSSProperties = {
  background: 'var(--ink-3)',
  color: 'var(--text-1)',
  border: '1px solid var(--line-1)',
  borderRadius: 2,
  fontSize: 11,
  padding: '3px 6px',
  maxWidth: '100%',
};
const SMALL_CHIP: React.CSSProperties = { height: 24, padding: '0 8px', fontSize: 10 };
const BOWL_ACCENT = '#D9A441';
const BOWL_CITATION = {
  verdict: 'Traditional use; no controlled evidence — included as texture.',
  summary: 'Singing bowls are a cultural practice; physiological claims are unevidenced.',
  source: 'Evidence audit — see Knowledge Base',
};

type BowlPatch = Partial<Omit<BowlLayer, 'id'>>;

export function BowlSet() {
  const s = useSession();
  // Blurb of the last loaded set, shown until the set is edited structurally.
  const [loadedSetId, setLoadedSetId] = useState<string | null>(null);
  const full = s.bowls.length >= MAX_BOWLS;
  const loadedSet = loadedSetId ? BOWL_SETS.find((x) => x.id === loadedSetId) : undefined;

  const loadSet = (id: string) => {
    const set = BOWL_SETS.find((x) => x.id === id);
    if (!set) return;
    s.setBowls(bowlSetToLayers(set));
    setLoadedSetId(set.id);
  };
  const addBowl = () => {
    if (s.addBowl() !== null) setLoadedSetId(null);
  };
  const removeBowl = (id: string) => {
    s.removeBowl(id);
    setLoadedSetId(null);
  };

  const bellCaption =
    s.bellEveryMin > 0
      ? `Strikes the first bowl once at start and every ${s.bellEveryMin} min (live and in the export).`
      : 'Off. When set, strikes the first bowl once at start and every N minutes (live and in the export).';

  return (
    <div className="flex flex-col gap-2" data-testid="bowl-set" style={{ minWidth: 0 }}>
      {/* header */}
      <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', rowGap: 8 }}>
        <span className="t-label" style={{ width: 110 }}>
          SINGING BOWLS
        </span>
        <span className="t-readout-sm text-3" data-testid="bowl-count" title={`Bowls in the set (max ${MAX_BOWLS})`}>
          {s.bowls.length} / {MAX_BOWLS}
        </span>
        <select
          value=""
          onChange={(e) => loadSet(e.target.value)}
          aria-label="Load bowl set"
          title="Replace the set with a ready-made arrangement"
          className="font-mono2"
          style={SELECT_STYLE}
        >
          <option value="">LOAD SET…</option>
          {BOWL_SETS.map((set) => (
            <option key={set.id} value={set.id} title={set.blurb}>
              {set.name.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="chip"
          style={SMALL_CHIP}
          onClick={addBowl}
          disabled={full}
          title={full ? `The set is full (${MAX_BOWLS} bowls)` : 'Add a bowl to the set'}
        >
          + ADD BOWL
        </button>
        <span className="flex items-center gap-3" style={{ marginLeft: 'auto' }}>
          <InfoPopover featureId="layer-bowls" label="About the singing bowls layer" />
          <GradeBadge grade="D" compact citation={BOWL_CITATION} />
        </span>
      </div>
      {loadedSet && (
        <p className="t-caption text-3" data-testid="bowl-set-blurb">
          {loadedSet.name}: {loadedSet.blurb}
        </p>
      )}
      {s.bowls.length === 0 && (
        <p className="t-caption text-3" data-testid="bowl-set-empty">
          No bowls in the set — press + ADD BOWL or load a set.
        </p>
      )}

      {/* one row per bowl */}
      {s.bowls.map((b, i) => (
        <BowlRow
          key={b.id}
          bowl={b}
          index={i + 1}
          carrierHz={s.carrierHz}
          onPatch={(patch) => s.setBowl(b.id, patch)}
          onRemove={() => removeBowl(b.id)}
        />
      ))}

      {/* interval bell */}
      <div className="flex flex-col gap-1" data-testid="interval-bell" style={{ marginTop: 4 }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', rowGap: 6 }}>
          <span className="t-label" style={{ width: 110 }}>
            INTERVAL BELL
          </span>
          <div className="flex gap-1" role="group" aria-label="Interval bell period" style={{ flexWrap: 'wrap', rowGap: 4 }}>
            {BELL_CHOICES.map((min) => (
              <button
                key={min}
                type="button"
                aria-pressed={s.bellEveryMin === min}
                className={`chip${s.bellEveryMin === min ? ' chip-active' : ''}`}
                style={SMALL_CHIP}
                onClick={() => s.setBellEveryMin(min)}
                title={min === 0 ? 'No interval bell' : `Ring the first bowl at start and every ${min} min`}
              >
                {bellChoiceLabel(min)}
              </button>
            ))}
          </div>
          <InfoPopover featureId="interval-bell" label="About the interval bell" />
        </div>
        <p className="t-caption text-3" data-testid="interval-bell-caption">
          {bellCaption}
        </p>
      </div>
    </div>
  );
}

function BowlRow({
  bowl: b,
  index: n,
  carrierHz,
  onPatch,
  onRemove,
}: {
  bowl: BowlLayer;
  index: number;
  carrierHz: number;
  onPatch: (patch: BowlPatch) => void;
  onRemove: () => void;
}) {
  const hz = bowlPitchHz(b, carrierHz);
  const noteValue = noteSelectValue(hz);
  const rim = b.strike === 'rim';

  return (
    <div className="flex flex-col gap-1" data-testid="bowl-row" data-bowl-id={b.id} style={{ minWidth: 0 }}>
      <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', rowGap: 6, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => onPatch({ on: !b.on })}
          aria-label={`Bowl ${n} on`}
          aria-pressed={b.on}
          title={b.on ? 'Switch this bowl off' : 'Switch this bowl on'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Led state={b.on ? 'amber' : 'off'} />
          <span className="t-label" style={{ width: 12 }}>
            {n}
          </span>
        </button>
        <select
          value={b.material}
          onChange={(e) => onPatch({ material: e.target.value as BowlMaterial })}
          aria-label={`Bowl ${n} material`}
          className="font-mono2"
          style={SELECT_STYLE}
        >
          {BOWL_MATERIALS.map((m) => (
            <option key={m.id} value={m.id} title={m.blurb}>
              {m.label.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={b.strike}
          onChange={(e) => onPatch({ strike: e.target.value as BowlStrike })}
          aria-label={`Bowl ${n} strike`}
          className="font-mono2"
          style={SELECT_STYLE}
        >
          {BOWL_STRIKES.map((k) => (
            <option key={k.id} value={k.id} title={k.blurb}>
              {k.label.toUpperCase()}
            </option>
          ))}
        </select>

        {/* pitch: note picker + typed Hz + LOCK */}
        <span className="flex items-center gap-2" style={{ flexWrap: 'wrap', rowGap: 6 }}>
          <select
            value={noteValue}
            disabled={b.lock}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onPatch({ baseHz: v });
            }}
            aria-label={`Bowl ${n} note`}
            title={b.lock ? 'Locked to the carrier' : 'Pick a 12-TET note (A4 = 440 Hz)'}
            className="font-mono2"
            style={SELECT_STYLE}
          >
            {noteValue === CUSTOM_NOTE && <option value={CUSTOM_NOTE}>{customNoteLabel(hz)}</option>}
            {BOWL_NOTE_CHOICES.map((c) => (
              <option key={c.label} value={String(c.hz)}>
                {c.label}
              </option>
            ))}
          </select>
          <Readout
            value={hz.toFixed(2)}
            unit="Hz"
            size="sm"
            editable={!b.lock}
            onCommit={(raw) => {
              const v = parseBowlHz(raw);
              if (v !== null) onPatch({ baseHz: v });
              return v !== null;
            }}
          />
          <span className="t-caption font-mono2 text-3" data-testid="bowl-note-label" title="Nearest note and offset in cents">
            {noteLabel(hz)}
          </span>
          <button
            type="button"
            className={`chip${b.lock ? ' chip-active' : ''}`}
            style={SMALL_CHIP}
            aria-pressed={b.lock}
            onClick={() => onPatch({ lock: !b.lock })}
            title="Detune to carrier"
          >
            LOCK
          </button>
        </span>

        {/* pan */}
        <span className="flex items-center gap-1" title="Stereo position">
          <span className="t-caption font-mono2 text-3">L</span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={b.pan}
            onChange={(e) => onPatch({ pan: parseFloat(e.target.value) })}
            aria-label={`Bowl ${n} pan`}
            style={{ width: 64, accentColor: BOWL_ACCENT }}
          />
          <span className="t-caption font-mono2 text-3">R</span>
          <span className="t-readout-sm text-3" style={{ width: 34 }} data-testid="bowl-pan-label">
            {panLabel(b.pan)}
          </span>
        </span>

        {/* re-strike interval (loop length of the swell/release cycle for a rim-sung bowl) */}
        <span className="flex items-center gap-1">
          <span className="t-caption font-mono2 text-3" style={{ letterSpacing: '0.08em' }} data-testid="bowl-interval-label">
            {restrikeLabel(b.strike)}
          </span>
          <select
            value={String(b.restrikeSec)}
            onChange={(e) => onPatch({ restrikeSec: parseInt(e.target.value, 10) })}
            aria-label={`Bowl ${n} interval`}
            title={rim ? 'Loop length of the swell-and-release cycle' : 'Seconds between strikes'}
            className="font-mono2"
            style={SELECT_STYLE}
          >
            {BOWL_RESTRIKE_CHOICES.map((sec) => (
              <option key={sec} value={String(sec)}>
                {sec} S
              </option>
            ))}
          </select>
        </span>

        {/* level */}
        <input
          type="range"
          min={-60}
          max={0}
          step={0.5}
          value={levelSliderDb(b.db)}
          onChange={(e) => onPatch({ db: parseFloat(e.target.value) })}
          aria-label={`Bowl ${n} level`}
          style={{ flex: '1 1 80px', minWidth: 60, accentColor: BOWL_ACCENT }}
        />
        <span className="t-readout-sm text-2" style={{ width: 60, whiteSpace: 'nowrap' }} data-testid="bowl-level-label">
          {levelSliderDb(b.db).toFixed(1)} dB
        </span>
        <button
          type="button"
          className="chip"
          style={{ ...SMALL_CHIP, padding: '0 7px' }}
          onClick={onRemove}
          aria-label={`Remove bowl ${n}`}
          title="Remove this bowl from the set"
        >
          ×
        </button>
      </div>
      <p className="t-caption text-3" data-testid="bowl-caption" style={{ margin: 0 }}>
        {bowlCaption(b.material, b.strike)}
      </p>
    </div>
  );
}
