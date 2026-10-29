/**
 * Nature Calls Lab — animal-call acoustics (cat, sparrow, blue jay, squirrel),
 * plant & insect bioacoustics, soundscape health, and the Dolbear cricket
 * thermometer. Cards show the call-sign table up front; depth sits behind (i).
 * Field-playback ethics are restrictive on purpose.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Bird, FlaskConical, Leaf, ListChecks, Sprout, Thermometer } from 'lucide-react';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { Chip, Panel, WarningChip } from '@/ui/components/primitives';
import { DetailPopover } from '@/ui/components/DetailPopover';
import { LabPresetCard } from '@/ui/components/LabPresetCard';
import { getPresetById } from '@/data/presets';
import {
  CROP_HYPOTHESES,
  CROP_STUDIES,
  DOLBEAR_VALID_F,
  NATURE_HYPOTHESES,
  NATURE_STUDIES,
  PLAYBACK_ETHICS,
  SPECIES_CARDS,
  dolbearF,
  dolbearRateHz,
} from '@/data/natureLab';
import { LabRibbon } from '@/ui/components/LabRibbon';
import { LabHero } from '@/ui/components/LabHero';

function SectionTitle({ icon, id, title, sub }: { icon: ReactNode; id: string; title: string; sub: string }) {
  return (
    <div id={id} style={{ scrollMarginTop: 90 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
        {icon}
        <h2 className="t-h2">{title}</h2>
      </div>
      <p className="t-body-sm text-2" style={{ marginBottom: 16 }}>{sub}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dolbear thermometer widget
// ---------------------------------------------------------------------------

function DolbearWidget() {
  const [tempF, setTempF] = useState(70);
  const valid = tempF >= DOLBEAR_VALID_F.min && tempF <= DOLBEAR_VALID_F.max;
  const rate = dolbearRateHz(tempF);
  const tempC = ((tempF - 32) * 5) / 9;
  const perFifteen = useMemo(() => Math.round(rate * 15), [rate]);
  return (
    <Panel>
      <h3 className="t-h3">The cricket thermometer, live</h3>
      <p className="t-body-sm text-2" style={{ margin: '6px 0 12px' }}>
        Dolbear's law (Brooks 1881, Dolbear 1897): count snowy-tree-cricket chirps for 15 seconds and add 40 — that is
        the temperature in °F. Slide the temperature to see the chirp rate; play the reference preset to hear it.
      </p>
      <label className="t-body-sm text-2 flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
        Air temperature
        <input
          type="range" min={45} max={105} step={1} value={tempF}
          onChange={(e) => setTempF(Number(e.target.value))}
          aria-label="Air temperature in Fahrenheit"
          style={{ flex: 1, minWidth: 180 }}
        />
        <span className="t-readout-md font-mono2">{tempF} °F · {tempC.toFixed(1)} °C</span>
      </label>
      <div className="flex gap-4" style={{ marginTop: 12, flexWrap: 'wrap' }}>
        <span className="t-caption font-mono2 text-3">CHIRPS/SEC · {rate.toFixed(2)}</span>
        <span className="t-caption font-mono2 text-3">COUNT IN 15 S · {perFifteen} (+40 = {dolbearF(perFifteen)} °F)</span>
        <span className="t-caption font-mono2" style={{ color: valid ? 'var(--teal)' : 'var(--amber)' }}>
          {valid ? 'INSIDE THE VALID BAND (55–100 °F)' : 'OUTSIDE THE VALID BAND — crickets slow or stop'}
        </span>
      </div>
      <p className="t-caption text-3" style={{ marginTop: 10 }}>
        Margarette W. Brooks published the observation in 1881; Dolbear's 1897 paper made it famous. The U.S. National
        Weather Service still hosts a chirp converter. Rate math: chirps/min = (°F − 40) × 4.
      </p>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const CROP_IDS = ['nature-crop-paft-band', 'nature-seed-priming-portrait', 'nature-root-phonotropism', 'nature-sonolysis-portrait'];

const NATURE_IDS = [
  'nature-cat-purr-companion', 'nature-sparrow-band', 'nature-bluejay-jeer', 'nature-squirrel-alarm',
  'nature-plant-clicks-portrait', 'nature-bee-buzz-portrait', 'nature-dolbear-cricket', 'nature-stream-soundscape',
];
const byId = (id: string) => getPresetById(id)!;

const JUMPS = [
  ['#species', 'Species calls'], ['#ethics', 'Playback ethics'], ['#nature-presets', 'Presets'],
  ['#plants', 'Plants & insects'], ['#field', 'Field & water'], ['#dolbear', 'Thermometer'], ['#nature-hypotheses', 'Hypotheses'],
] as const;

export default function NatureLab() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1080, position: 'relative', isolation: 'isolate' }}>
      <header>
        <div className="flex items-start justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
          <p className="t-label text-3">BIOACOUSTICS · MEASURED BANDS · FIELD ETHICS</p>
        </div>
        <h1 className="t-display-lg">Nature Calls Lab</h1>
        <p className="t-body text-2" style={{ maxWidth: 780 }}>
          Learn the call signs of the animals around you — cat, sparrow, blue jay, squirrel — from measured acoustics,
          plus the stranger frontier: plants that click when stressed, flowers that hear bees, and a cricket that is a
          thermometer. Synthesized presets teach the bands; they are not recordings and not bird-caller apps.
        </p>
        <div className="flex gap-2" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <WarningChip tone="amber">Field playback is restricted by design — read the ethics card first</WarningChip>
          <WarningChip tone="amber">Synth presets are band approximations, never recordings</WarningChip>
        </div>
        <nav className="flex gap-2" style={{ marginTop: 14, flexWrap: 'wrap' }} aria-label="Section shortcuts">
          {JUMPS.map(([href, label]) => <Chip key={href} onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}>{label}</Chip>)}
        </nav>
        <LabRibbon />
        <LabHero src="art/hero-nature.jpg" alt="Dawn forest with birds and drifting sound rings — Nature Calls Lab banner" caption="NATURE CALLS LAB · measured bands · field ethics" />
      </header>

      {/* ---------------------------------------------------------- species */}
      <section>
        <SectionTitle icon={<Bird size={18} />} id="species" title="Call signs — four neighbors"
          sub="Measured bands and documented meanings. The table on each card is the field guide; the (i) carries hearing ranges, protocol and sources." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {SPECIES_CARDS.map((sp) => (
            <div key={sp.id} className="panel" style={{ padding: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="t-label text-3">SPECIES</span>
                <span className="flex items-center gap-1">
                  <GradeBadge grade={sp.grade} compact />
                  <DetailPopover title={sp.species} grade={sp.grade} label={`Details: ${sp.species}`}>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)' }}><strong>Hearing · </strong>{sp.hearing}</p>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)', marginTop: 8 }}><strong>Observation · </strong>{sp.observe}</p>
                    <p className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 8 }}>▸ {sp.source}</p>
                  </DetailPopover>
                </span>
              </div>
              <h3 className="t-h3">{sp.species}</h3>
              <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{sp.headline}</p>
              <table className="t-caption" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <tbody>
                  {sp.calls.map((c) => (
                    <tr key={c.name} style={{ borderTop: '1px solid var(--ink-0)' }}>
                      <td style={{ padding: '6px 8px 6px 0', verticalAlign: 'top' }}><strong>{c.name}</strong></td>
                      <td className="font-mono2 text-3" style={{ padding: '6px 8px', verticalAlign: 'top' }}>{c.band}</td>
                      <td className="text-3" style={{ padding: '6px 0 6px 8px', verticalAlign: 'top' }}>{c.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- ethics */}
      <section id="ethics">
        <SectionTitle icon={<ListChecks size={18} />} id="playback-ethics" title="Playback ethics (read before any field use)"
          sub="Call playback is a real research tool with real costs. These rules are deliberately conservative." />
        <Panel>
          <ul className="flex flex-col gap-2" style={{ paddingLeft: 0, listStyle: 'none' }}>
            {PLAYBACK_ETHICS.map((e) => (
              <li key={e} className="t-body-sm text-2 flex items-start gap-2">
                <span style={{ color: 'var(--amber)', flexShrink: 0 }}>▸</span>{e}
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {/* ---------------------------------------------------------- presets */}
      <section>
        <SectionTitle icon={<FlaskConical size={18} />} id="nature-presets" title="Band-learning presets"
          sub="Synthesized approximations in the documented bands — ear training and portraits, indoors, at low level. Durations on each card." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {NATURE_IDS.map((id) => <LabPresetCard key={id} preset={byId(id)} testidPrefix="nature" />)}
        </div>
      </section>

      {/* ----------------------------------------------------------- plants */}
      <section>
        <SectionTitle icon={<Leaf size={18} />} id="plants" title="Plants, insects, and the soundscape evidence"
          sub="The strongest and strangest nature-sound research of the last decade — each row graded, with the numbers on the card." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {NATURE_STUDIES.map((st) => (
            <div key={st.id} className="panel" style={{ padding: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="t-label text-3">RESEARCH</span>
                <span className="flex items-center gap-1">
                  <GradeBadge grade={st.grade} compact />
                  <DetailPopover title={st.name} grade={st.grade} label={`Details: ${st.name}`}>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)' }}>{st.finding}</p>
                    <p className="t-body-sm" style={{ color: 'var(--amber)', marginTop: 8 }}><strong>Numbers · </strong>{st.numbers}</p>
                    <p className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 8 }}>▸ {st.source}</p>
                  </DetailPopover>
                </span>
              </div>
              <h3 className="t-h3">{st.name}</h3>
              <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{st.headline}</p>
              <p className="t-caption font-mono2 text-3" style={{ marginTop: 8 }}>{st.numbers}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- field & water */}
      <section>
        <SectionTitle icon={<Sprout size={18} />} id="field" title="Field & water — crop acoustics, graded"
          sub="Greenhouse sound arrays, gene-level frequency responses, ultrasonic seed priming, and the water ledger — real cavitation engineering vs the water-memory folklore." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {CROP_STUDIES.map((st) => (
            <div key={st.id} className="panel" style={{ padding: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="t-label text-3">RESEARCH</span>
                <span className="flex items-center gap-1">
                  <GradeBadge grade={st.grade} compact />
                  <DetailPopover title={st.name} grade={st.grade} label={`Details: ${st.name}`}>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)' }}>{st.finding}</p>
                    <p className="t-body-sm" style={{ color: 'var(--amber)', marginTop: 8 }}><strong>Numbers · </strong>{st.numbers}</p>
                    <p className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 8 }}>▸ {st.source}</p>
                  </DetailPopover>
                </span>
              </div>
              <h3 className="t-h3">{st.name}</h3>
              <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{st.headline}</p>
              <p className="t-caption font-mono2 text-3" style={{ marginTop: 8 }}>{st.numbers}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginTop: 16 }}>
          {CROP_IDS.map((id) => <LabPresetCard key={id} preset={byId(id)} testidPrefix="nature" />)}
        </div>
        <p className="t-caption text-3" style={{ marginTop: 10 }}>
          Home-scale honesty: the positive field trials ran loud field arrays (65–106 dB SPL). We do not recommend
          reproducing those levels — the seed-tray hypothesis card below is the safe version of the experiment.
        </p>
      </section>

      {/* ---------------------------------------------------------- dolbear */}
      <section id="dolbear">
        <SectionTitle icon={<Thermometer size={18} />} id="dolbear-widget" title="The cricket thermometer"
          sub="1897 math, still on the National Weather Service site. Slide, count, verify." />
        <DolbearWidget />
      </section>

      {/* ------------------------------------------------------- hypotheses */}
      <section>
        <SectionTitle icon={<ListChecks size={18} />} id="nature-hypotheses" title="Hypothesis ledger — nature edition"
          sub="Falsifiable home and field tests, priors included. Null results count." />
        <div className="flex flex-col gap-4">
          {[...NATURE_HYPOTHESES, ...CROP_HYPOTHESES].map((h) => {
            const preset = getPresetById(h.presetId);
            return (
              <div key={h.id} className="panel" style={{ padding: 16, borderLeft: '3px solid var(--amber)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span className="t-label text-3">HYPOTHESIS · PRIOR: {h.prior.toUpperCase()}</span>
                  <span className="flex items-center gap-1">
                    <GradeBadge grade={h.grade} compact />
                    <DetailPopover title={h.title} grade={h.grade} label={`Details: ${h.title}`}>
                      <p className="t-body-sm" style={{ color: 'var(--text-2)' }}><strong>Statement · </strong>{h.statement}</p>
                      <p className="t-body-sm" style={{ color: 'var(--teal)', marginTop: 8 }}><strong>Prediction · </strong>{h.prediction}</p>
                      <p className="t-body-sm" style={{ color: 'var(--text-2)', marginTop: 8 }}><strong>Home test · </strong>{h.homeTest}</p>
                      {h.citations.map((c) => <p key={c} className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 6 }}>▸ {c}</p>)}
                    </DetailPopover>
                  </span>
                </div>
                <h3 className="t-h3">{h.title}</h3>
                <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{h.headline}</p>
                {preset && <p className="t-caption font-mono2 text-3" style={{ marginTop: 8 }}>PRESET · {preset.title}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="t-body-sm text-3" style={{ borderTop: '1px solid var(--ink-0)', paddingTop: 16 }}>
        Companion pages: <Link to="/healing">Healing Sound Lab</Link> · <Link to="/lucid">Lucid Audio Lab</Link> ·{' '}
        <Link to="/presets?collection=all">Full preset catalog</Link> · <Link to="/analyzer">Live analyzer</Link> (point it
        at real birds and read the bands yourself). Wildlife welfare outranks curiosity — always.
      </footer>
    </div>
  );
}
