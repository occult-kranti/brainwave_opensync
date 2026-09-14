/**
 * Guide — dual-register documentation for every feature in the app.
 * SIMPLE ↔ DEEP TECHNICAL segmented control, live search, grouped by module.
 * Every plot widget gets an axes / good / bad explainer. All copy renders from
 * src/docs/features.ts — the same source as Home and the test suite.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { FEATURES, featuresByModule, type FeatureEntry } from '@/docs/features';
import { navigationForPath } from '@/app/navigation';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import './guide.css';

type Register = 'simple' | 'deep';

function FeatureCard({ entry, register }: { entry: FeatureEntry; register: Register }) {
  return (
    <motion.article
      className="panel"
      style={{ padding: 20 }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
        <h3 className="t-h3" style={{ flex: 1, minWidth: 160 }}>
          {entry.name}
        </h3>
        {entry.status === 'in-verification' && (
          <span
            className="t-caption font-mono2"
            style={{
              color: 'var(--text-3)',
              border: '1px dashed var(--line-2)',
              borderRadius: 2,
              padding: '2px 6px',
              fontSize: 10,
            }}
          >
            IN VERIFICATION
          </span>
        )}
        {entry.grade && <GradeBadge grade={entry.grade} compact />}
      </div>

      <p className={register === 'simple' ? 't-body text-2' : 't-body-sm text-2'}>
        {register === 'simple' ? entry.simple : entry.deep}
      </p>

      {entry.gradeScope && (
        <p className="t-caption text-3" style={{ marginTop: 8 }}>
          Evidence scope: {entry.gradeScope}
        </p>
      )}

      <div style={{ marginTop: 14, borderTop: '1px solid var(--line-1)', paddingTop: 12 }}>
        <span className="t-label text-3" style={{ display: 'block', marginBottom: 8 }}>
          HOW TO USE
        </span>
        <ol className="t-body-sm" style={{ color: 'var(--text-2)', margin: 0, paddingLeft: 18 }}>
          {entry.howTo.map((step) => (
            <li key={step} style={{ marginBottom: 4 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {entry.plot && (
        <div
          className="scope-well"
          style={{ marginTop: 14, padding: 14, border: '1px solid var(--line-1)' }}
        >
          <span className="t-label" style={{ display: 'block', marginBottom: 8, color: 'var(--teal-hi)' }}>
            READING THE PLOT
          </span>
          <p className="t-body-sm text-2" style={{ marginBottom: 8 }}>
            <span className="t-label text-3">AXES — </span>
            {entry.plot.axes}
          </p>
          <p className="t-body-sm" style={{ marginBottom: 8, color: 'var(--grade-A)' }}>
            <span className="t-label text-3">GOOD — </span>
            {entry.plot.good}
          </p>
          <p className="t-body-sm" style={{ color: 'var(--danger-hi)' }}>
            <span className="t-label text-3">BAD — </span>
            {entry.plot.bad}
          </p>
        </div>
      )}
    </motion.article>
  );
}

export default function Guide() {
  const [register, setRegister] = useState<Register>('simple');
  const [query, setQuery] = useState('');
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURES;
    return FEATURES.filter((f) =>
      [f.name, f.module, f.simple, f.deep, ...f.howTo].join('\n').toLowerCase().includes(q),
    );
  }, [query]);

  const groups = useMemo(() => [...featuresByModule(filtered).entries()], [filtered]);

  return (
    <div className="guide-page" style={{ padding: isMobile ? '20px 16px 56px' : '32px 40px 64px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <span className="t-label" style={{ color: 'var(--teal-hi)' }}>
          Help with the tools
        </span>
        <h1 className="t-display-lg" style={{ margin: '8px 0 12px' }}>
          Guide
        </h1>
        <p className="t-body text-2" style={{ maxWidth: 720, marginBottom: 24 }}>
          Start with a task below. Open a tool's instructions for more detail, or search for a control, sound, or measurement.
        </p>
      </motion.div>

      <section className="guide-start" aria-labelledby="guide-start-title">
        <h2 id="guide-start-title" className="t-h2">Start with a task</h2>
        <div className="guide-task-grid">
          <article><h3 className="t-h3">Play a preset</h3><p className="t-body-sm text-2">Choose a sound and hear its preview. Load it into Studio, check the session length, then press Play. Stop is always available.</p><Link to="/presets">Choose a sound <ArrowRight size={14} aria-hidden /></Link></article>
          <article><h3 className="t-h3">Make a chord</h3><p className="t-body-sm text-2">Choose a root note, chord, and tuning in Harmonic Lab. Preview the pattern, then adjust its overtones.</p><Link to="/harmonics">Build a chord <ArrowRight size={14} aria-hidden /></Link></article>
          <article><h3 className="t-h3">Inspect a recording</h3><p className="t-body-sm text-2">Open an audio file in Recording analysis to view its waveform, spectrum, and level. The file is processed in your browser.</p><Link to="/sample-lab">Inspect an audio file <ArrowRight size={14} aria-hidden /></Link></article>
          <article><h3 className="t-h3">Save or export</h3><p className="t-body-sm text-2">In Studio, save the current setup as a preset to edit later. Export WAV downloads the sound as an audio file.</p><Link to="/studio">Open Studio <ArrowRight size={14} aria-hidden /></Link></article>
        </div>
        <p className="guide-start-note t-body-sm text-2">Start at low device volume. Binaural sounds use a different tone in each ear, so headphones are needed.</p>
      </section>

      <h2 className="t-h2" style={{ marginBottom: 16 }}>Tool instructions</h2>

      {/* controls — sticky so the register switch stays reachable on long pages */}
      <div
        className="panel flex items-center gap-4 guide-controls"
        style={{ padding: '12px 16px', marginBottom: 20, flexWrap: 'wrap', position: 'sticky', top: 8, zIndex: 30 }}
      >
        <label className="flex items-center gap-2" style={{ flex: 1, minWidth: 'min(220px, 100%)' }}>
          <span className="sr-only">Search guide</span>
          <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try play, export, chords, or LUFS"
            aria-label="Search guide"
            className="font-mono2"
            style={{
              flex: 1,
              minWidth: 0,
              background: 'var(--ink-4)',
              border: '1px solid var(--line-1)',
              borderRadius: 2,
              color: 'var(--text-1)',
              padding: '6px 10px',
              fontSize: 12,
            }}
          />
        </label>
        <div className="flex" role="group" aria-label="Explanation detail">
          {(['simple', 'deep'] as Register[]).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={register === r}
              onClick={() => setRegister(r)}
              className="t-label"
              style={{
                minHeight: 40,
                padding: '0 14px',
                border: '1px solid var(--line-2)',
                borderRadius: 0,
                marginLeft: r === 'deep' ? -1 : 0,
                background: register === r ? 'var(--amber)' : 'transparent',
                color: register === r ? 'var(--text-inv)' : 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              {r === 'simple' ? 'SIMPLE' : 'DEEP TECHNICAL'}
            </button>
          ))}
        </div>
      </div>

      {query.trim() && <p className="t-body-sm text-2" role="status" style={{ marginBottom: 16 }}>{filtered.length} {filtered.length === 1 ? 'instruction' : 'instructions'} found</p>}

      {groups.length === 0 && (
        <div className="guide-empty"><p className="t-body text-2">No instructions match “{query}”.</p><button type="button" onClick={() => setQuery('')}>Clear search</button></div>
      )}

      {groups.map(([module, entries]) => (
        <details key={module} className="guide-module" open={query.trim() ? true : undefined}>
          <summary><span className="t-h3">{navigationForPath(entries[0].route)?.title ?? module}</span><span className="t-body-sm text-2">{entries.length} {entries.length === 1 ? 'instruction' : 'instructions'}</span></summary>
          <div className="guide-module-body">
            <Link className="guide-open-tool" to={entries[0].route}>Open {navigationForPath(entries[0].route)?.title ?? module} <ArrowRight size={14} aria-hidden /></Link>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))' }}>
              {entries.map((e) => <FeatureCard key={e.id} entry={e} register={register} />)}
            </div>
          </div>
        </details>
      ))}

      <details className="guide-module guide-shortcuts"><summary className="t-h3">Gestures &amp; shortcuts</summary><div className="guide-module-body"><GestureMapSection /></div></details>
    </div>
  );
}

/**
 * P1-4 gesture map (ux_improvement_spec §3.4): one global meaning per
 * gesture, each with a visible non-gesture equivalent — gestures are
 * accelerators, never the only path.
 */
const GESTURE_MAP: { gesture: string; meaning: string; equivalent: string }[] = [
  { gesture: 'Tap', meaning: 'Trigger / select / toggle', equivalent: 'the button itself' },
  { gesture: 'Double-tap / double-click', meaning: 'Reset a knob or control to its default', equivalent: 'Ctrl/Cmd+click; re-type the value in its readout' },
  { gesture: 'Long-press', meaning: 'Contextual edit menu (session phases, preset rows)', equivalent: 'the edit affordance on the item' },
  { gesture: 'Vertical drag', meaning: 'Adjust a knob or fader (full range ≈ 160 px)', equivalent: 'arrow keys when focused; click-to-type readout' },
  { gesture: 'Shift+drag / two-finger drag', meaning: 'Fine adjust (×0.1 resolution)', equivalent: 'Shift+arrow keys' },
  { gesture: 'Scroll wheel over a knob', meaning: 'Step the value', equivalent: 'arrow keys' },
  { gesture: 'Swipe down / backdrop tap', meaning: 'Dismiss a sheet or dialog', equivalent: 'Esc key or the × close button' },
  { gesture: '⌘K / Ctrl+K', meaning: 'Command palette — jump to any module, run actions', equivalent: 'the ⌘K chip in the status bar' },
  { gesture: 'P', meaning: 'Panic — stop all audio immediately', equivalent: 'the PANIC button pinned on every screen' },
];

function GestureMapSection() {
  return (
    <section data-testid="gesture-map" style={{ marginBottom: 40 }}>
      <div className="flex items-center gap-3 hairline-b" style={{ paddingBottom: 8, marginBottom: 16 }}>
        <h2 className="t-h2">Gestures &amp; shortcuts</h2>
        <span className="t-label text-3">ONE MEANING PER GESTURE, EVERYWHERE</span>
      </div>
      <div className="panel" style={{ padding: 0 }}>
        {GESTURE_MAP.map((g, i) => (
          <div
            key={g.gesture}
            className="grid gap-2"
            style={{
              gridTemplateColumns: 'minmax(140px, 200px) 1fr 1fr',
              padding: '10px 16px',
              borderTop: i > 0 ? '1px solid var(--line-1)' : 'none',
              alignItems: 'baseline',
            }}
          >
            <span className="t-label" style={{ color: 'var(--amber)' }}>
              {g.gesture}
            </span>
            <span className="t-body-sm text-2">{g.meaning}</span>
            <span className="t-caption text-3">No-gesture path: {g.equivalent}</span>
          </div>
        ))}
      </div>
      <p className="t-caption text-3" style={{ marginTop: 8 }}>
        Every gesture above has a button, key, or menu path — gestures speed you up, they never gate a feature.
        Shake is deliberately unused (accessibility).
      </p>
    </section>
  );
}
