/**
 * Lucid Audio Lab — the dedicated lucid-dreaming research page.
 *
 * What the audio/frequency literature actually shows (TLR cue pairing is the
 * validated route; beats-as-lucidity-switches are not shipped as claims), a
 * night-timing map (WBTB / REM window / cue replay), the practice preset pack,
 * the government-program file (Gateway, Stargate, ONR, the 2017 DoD trial),
 * math-physics octave portraits with stated n, and a falsifiable hypothesis
 * ledger for every experimental preset. Claim discipline per
 * src/docs/vocabulary.ts and src/dream/protocols.ts.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Archive, BookMarked, FlaskConical, ListChecks, Moon, Orbit } from 'lucide-react';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { Chip, Panel, WarningChip } from '@/ui/components/primitives';
import { useSession } from '@/ui/session/useSession';
import { getPresetById, presetDurationMin, type Preset } from '@/data/presets';
import {
  GOV_FREY,
  GOV_PROGRAMS,
  KEPLER_NOTE,
  KEPLER_SONGS,
  LUCID_AUDIO_STUDIES,
  LUCID_HYPOTHESES,
  OCTAVE_PORTRAITS,
} from '@/data/lucidLab';
import { fmtMin, parseBedtime, planNight } from '@/dream/scheduler';
import { fmtClock } from '@/ui/session/sessionMath';
import { Field4D } from '@/ui/components/Field4D';
import { useField4d } from '@/hooks/useField4d';
import { assetUrl } from '@/lib/assetUrl';

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

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

function StudyCard({ studyId }: { studyId: string }) {
  const s = LUCID_AUDIO_STUDIES.find((x) => x.id === studyId)!;
  return (
    <div className="panel" style={{ padding: 18 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span className="t-label text-3">STUDY</span>
        <GradeBadge grade={s.grade} minus={s.gradeMinus} citation={{ verdict: s.note, summary: s.outcome, source: s.source }} />
      </div>
      <h3 className="t-h3">{s.name}</h3>
      <p className="t-body-sm text-2" style={{ marginTop: 8 }}><strong>Setup · </strong>{s.setup}</p>
      <p className="t-body-sm text-2" style={{ marginTop: 6 }}><strong>Timing · </strong>{s.timing}</p>
      <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}><strong>Outcome · </strong>{s.outcome}</p>
      <p className="t-caption text-3" style={{ marginTop: 8 }}>{s.note}</p>
      <p className="t-caption font-mono2 text-3" style={{ marginTop: 6 }}>▸ {s.source}</p>
    </div>
  );
}

function PresetMiniCard({ preset }: { preset: Preset }) {
  const session = useSession();
  const navigate = useNavigate();
  const playing = session.previewId === `preset:${preset.id}`;
  const blocked = session.running || session.panicked || session.muted;
  const preview = () => {
    if (blocked) return;
    if (!session.advisoryAcknowledged) { session.openAdvisory(); return; }
    session.previewPreset(preset);
  };
  const load = () => {
    session.stopPreview(); session.stop(); session.loadPreset(preset); navigate('/studio');
  };
  return (
    <article className="panel" style={{ padding: 18, overflow: 'hidden' }} data-testid={`lucid-preset-${preset.id}`}>
      {preset.art && (
        <img
          src={assetUrl(preset.art)}
          alt={`${preset.title} cover art`}
          loading="lazy"
          style={{ width: 'calc(100% + 36px)', margin: '-18px -18px 12px', aspectRatio: '3 / 1', objectFit: 'cover', display: 'block', opacity: 0.9 }}
        />
      )}
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span className="t-label text-3">FULL SESSION · {fmtClock(presetDurationMin(preset) * 60)}</span>
        <GradeBadge grade={preset.grade} citation={{ verdict: 'See rationale and sources.', summary: preset.rationale, source: preset.citations[0] }} />
      </div>
      <h3 className="t-h3">{preset.title}</h3>
      <p className="t-body-sm text-2" style={{ marginTop: 8 }}>{preset.rationale}</p>
      <ul className="t-caption font-mono2 text-3" style={{ marginTop: 8, paddingLeft: 0, listStyle: 'none' }}>
        {preset.citations.map((c) => <li key={c} style={{ marginTop: 4 }}>▸ {c}</li>)}
      </ul>
      <div className="flex gap-2" style={{ marginTop: 12, flexWrap: 'wrap' }}>
        <button type="button" className={`chip ${playing ? 'chip-active' : ''}`} disabled={blocked} onClick={preview}
          aria-label={playing ? `Stop preview of ${preset.title}` : `Preview first 10 seconds of ${preset.title}`}>
          {playing ? '■ STOP' : '▶ PREVIEW · 10 S'}
        </button>
        <button type="button" className="chip chip-active" onClick={load}>LOAD INTO STUDIO</button>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Night timing map
// ---------------------------------------------------------------------------

function NightMap() {
  const [bedtime, setBedtime] = useState('23:00');
  const plan = useMemo(() => {
    const b = parseBedtime(bedtime);
    return b === null ? null : planNight({ bedtimeMin: b });
  }, [bedtime]);

  if (!plan) return null;
  const total = Math.max(1, plan.wakeTime.relMin);
  const pct = (rel: number) => `${Math.min(100, Math.max(0, (rel / total) * 100)).toFixed(1)}%`;
  const marks = [
    plan.wbtb ? { at: plan.wbtb.alarm.relMin, label: `WBTB alarm ${fmtMin(plan.wbtb.alarm.absMin)}`, color: 'var(--amber)' } : null,
    plan.wbtb ? { at: plan.wbtb.backToBed.relMin, label: `Back to bed ${fmtMin(plan.wbtb.backToBed.absMin)} (MILD)`, color: 'var(--amber)' } : null,
    plan.tlr ? { at: plan.tlr.windowStart.relMin, label: `Cue window opens ${fmtMin(plan.tlr.windowStart.absMin)}`, color: 'var(--teal)' } : null,
  ].filter(Boolean) as { at: number; label: string; color: string }[];

  return (
    <Panel>
      <div className="flex items-center justify-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="t-h3">One night, mapped</h3>
          <p className="t-body-sm text-2">The timing skeleton the validated protocols share. Set your bedtime; the cue window sits in the REM-rich last third.</p>
        </div>
        <label className="t-body-sm text-2 flex items-center gap-2">
          Bedtime
          <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} aria-label="Bedtime" />
        </label>
      </div>
      <div style={{ position: 'relative', height: 64, background: 'var(--ink-0)', borderRadius: 8, marginTop: 28 }}>
        {plan.tlr && (
          <div style={{
            position: 'absolute', left: pct(plan.tlr.windowStart.relMin), width: pct(plan.tlr.windowEnd.relMin - plan.tlr.windowStart.relMin),
            top: 8, bottom: 8, background: 'color-mix(in srgb, var(--teal) 22%, transparent)', border: '1px solid var(--teal)', borderRadius: 6,
          }} aria-label={`TLR cue window ${fmtMin(plan.tlr.windowStart.absMin)} to ${fmtMin(plan.tlr.windowEnd.absMin)}`} />
        )}
        {marks.map((m) => (
          <div key={m.label} style={{ position: 'absolute', left: pct(m.at), top: -20, bottom: 0, borderLeft: `2px dashed ${m.color}` }}>
            <span className="t-caption font-mono2" style={{ position: 'absolute', top: -4, left: 6, whiteSpace: 'nowrap', color: m.color }}>{m.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between t-caption font-mono2 text-3" style={{ marginTop: 6 }}>
        <span>Bed {fmtMin(plan.bedtime.absMin)}</span>
        <span>Onset {fmtMin(plan.sleepOnset.absMin)}</span>
        <span>Wake {fmtMin(plan.wakeTime.absMin)}</span>
      </div>
      {plan.warnings.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {plan.warnings.map((w) => <WarningChip key={w} tone="amber">{w}</WarningChip>)}
        </div>
      )}
      <p className="t-caption text-3" style={{ marginTop: 10 }}>
        Timing canon: cue pairing 15–25 min before sleep · replay from ~6 h after onset (last-third heuristic without EEG) ·
        WBTB wake 4.5–6 h after onset, awake 20–40 min · lab naps 90 min · cue level 40–45 dB SPL equivalent — loud enough
        to be incorporated, quiet enough not to wake.
      </p>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PRACTICE_IDS = ['lucid-tlr-training-bed', 'lucid-wbtb-return-descent', 'lucid-rem-window-theta', 'lucid-n1-incubation', 'lucid-ssild-pacer'];
const GATEWAY_IDS = ['gateway-focus-10-reconstruction', 'gateway-focus-12-reconstruction', 'gateway-focus-15-reconstruction', 'gateway-focus-21-reconstruction'];
const HEALING_IDS = ['relax-archaeo-110', 'relax-vat-40-analog'];
const PHYSICS_IDS = ['exp-theta-gamma-interleave', 'exp-rem-gamma-whisper', 'exp-newton-spectrum-dorian', 'exp-planetary-octave-ascent', 'exp-hydrogen-21cm-portrait', 'exp-solar-pmode-portrait', 'exp-cmb-peak-portrait'];
const EXPEDITION_IDS = ['exp-kepler-motet', 'meditate-five-tones', 'exp-tesla-369', 'exp-genus-daily-hour'];
const ALL_GOV = [...GOV_PROGRAMS, GOV_FREY];

const byId = (id: string) => getPresetById(id)!;

const JUMPS = [
  ['#evidence', 'Evidence'], ['#night', 'Night map'], ['#presets', 'Practice presets'],
  ['#govt', 'Government file'], ['#portraits', 'Octave portraits'], ['#hypotheses', 'Hypothesis ledger'],
] as const;

export default function LucidLab() {
  const [field4dOn, setField4dOn] = useField4d();
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1080, position: 'relative', isolation: 'isolate' }}>
      {field4dOn && <Field4D />}
      <header>
        <div className="flex items-start justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
          <p className="t-label text-3">AUDIO × FREQUENCY × LUCIDITY · RESEARCH-GRADED</p>
          <button type="button" className={`chip ${field4dOn ? 'chip-active' : ''}`} aria-pressed={field4dOn}
            aria-label="Toggle 4D field backdrop" onClick={() => setField4dOn(!field4dOn)}>
            4D field {field4dOn ? 'on' : 'off'}
          </button>
        </div>
        <h1 className="t-display-lg">Lucid Audio Lab</h1>
        <p className="t-body text-2" style={{ maxWidth: 760 }}>
          Every audio route to lucid dreaming that has been measured, what it actually did, and how long each protocol takes —
          plus reconstructions of the government-era sound work and new physics-derived experimental tones. No sound here
          switches lucidity on: the validated ingredients are cue–mindset pairing, timing, and practice quality.
        </p>
        <div className="flex gap-2" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <WarningChip tone="amber">Headphones required for binaural content</WarningChip>
          <WarningChip tone="amber">Cue discipline ≤45 dB SPL at the ear — incorporation, not waking</WarningChip>
          <WarningChip tone="amber">Sleep-paralysis pre-education lives on the Sleep &amp; Dream page</WarningChip>
        </div>
        <nav className="flex gap-2" style={{ marginTop: 14, flexWrap: 'wrap' }} aria-label="Section shortcuts">
          {JUMPS.map(([href, label]) => <Chip key={href} onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}>{label}</Chip>)}
        </nav>
      </header>

      {/* ---------------------------------------------------------- evidence */}
      <section>
        <SectionTitle icon={<BookMarked size={18} />} id="evidence" title="What the research actually shows"
          sub="Audio and frequency approaches to lucid dreaming, with the real numbers. The pattern across 40 years: cues work by association after deliberate pairing; raw beat frequencies alone do not survive controlled tests." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {LUCID_AUDIO_STUDIES.map((s) => <StudyCard key={s.id} studyId={s.id} />)}
        </div>
      </section>

      {/* ------------------------------------------------------------ night */}
      <section id="night">
        <SectionTitle icon={<Moon size={18} />} id="night-map" title="Timing beats frequency"
          sub="REM periods lengthen across the night (the last one can run ~45–60 min), so every serious protocol targets the final third. This map uses the same scheduler as the Sleep & Dream page." />
        <NightMap />
      </section>

      {/* ---------------------------------------------------------- presets */}
      <section>
        <SectionTitle icon={<FlaskConical size={18} />} id="presets" title="Practice presets"
          sub="Built around the validated mechanisms: pairing practice, the WBTB return window, the REM window, sleep-onset incubation, and paced sense-cycling. Load into Studio to adjust duration before playing." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {PRACTICE_IDS.map((id) => <PresetMiniCard key={id} preset={byId(id)} />)}
        </div>
      </section>

      {/* ------------------------------------------------------------- govt */}
      <section>
        <SectionTitle icon={<Archive size={18} />} id="govt" title="Government file"
          sub="Declassified and published government-linked work, graded twice: the record itself, and the capability claims it explored. An assessment is not an endorsement — read what the documents actually found." />
        <div className="flex flex-col gap-4">
          {ALL_GOV.map((g) => (
            <div key={g.id} className="panel" style={{ padding: 18 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <span className="t-label text-3">{g.agency.toUpperCase()} · {g.years.toUpperCase()}</span>
                <span className="flex items-center gap-2">
                  <span className="t-caption text-3">RECORD</span>
                  <GradeBadge grade={g.recordGrade} citation={{ verdict: 'Grade of the historical documentation.', summary: g.record, source: g.source }} />
                  <span className="t-caption text-3">CLAIMS</span>
                  <GradeBadge grade={g.claimGrade} citation={{ verdict: 'Grade of the capability claims explored.', summary: g.audioLink, source: g.source }} />
                </span>
              </div>
              <h3 className="t-h3">{g.name}</h3>
              <p className="t-body-sm text-2" style={{ marginTop: 8 }}>{g.record}</p>
              <p className="t-body-sm" style={{ marginTop: 8, color: 'var(--amber)' }}><strong>Audio link · </strong>{g.audioLink}</p>
              <p className="t-caption font-mono2 text-3" style={{ marginTop: 8 }}>▸ {g.source}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginTop: 16 }}>
          {GATEWAY_IDS.map((id) => <PresetMiniCard key={id} preset={byId(id)} />)}
        </div>
        <p className="t-caption text-3" style={{ marginTop: 10 }}>
          The original Hemi-Sync tape settings were never published. These four sessions are reconstructions from the 1983
          assessment text and the institute's public Focus-level descriptions — compare the patent-based examples on
          <Link to="/sound-methods"> Sound Methods</Link> and the reconstructions in <Link to="/replication">Replication Bay</Link>.
        </p>
      </section>

      {/* --------------------------------------------------- healing range */}
      <section>
        <SectionTitle icon={<Orbit size={18} />} id="healing" title="Healing-range sessions, honestly sourced"
          sub="Two entries where a real measurement anchors the frequency — Neolithic chamber acoustics and clinical vibroacoustic therapy — with the modality caveats stated on the card." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {HEALING_IDS.map((id) => <PresetMiniCard key={id} preset={byId(id)} />)}
        </div>
      </section>

      {/* -------------------------------------------------------- portraits */}
      <section>
        <SectionTitle icon={<Orbit size={18} />} id="portraits" title="Octave portraits — the math-physics shelf"
          sub="Physical periods and measured lines mapped into hearing by exact powers of two (f × 2^±n, n stated). Arithmetic grade A; meaning grade D — an audible octave of an orbit or a photon shares no physics with its source." />
        <Panel>
          <div style={{ overflowX: 'auto' }}>
            <table className="t-body-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="t-label text-3" style={{ textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px 6px 0' }}>SOURCE</th>
                  <th style={{ padding: '6px 10px' }}>MEASURED / DEFINED VALUE</th>
                  <th style={{ padding: '6px 10px' }}>OCTAVE</th>
                  <th style={{ padding: '6px 10px' }}>TONE</th>
                </tr>
              </thead>
              <tbody>
                {OCTAVE_PORTRAITS.map((o) => (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--ink-0)' }}>
                    <td style={{ padding: '8px 10px 8px 0' }}>
                      <strong>{o.label}</strong>
                      <p className="t-caption text-3" style={{ marginTop: 2 }}>{o.sourceQuantity}</p>
                    </td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>{o.sourceValue}</td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>×2^{o.direction === 'up' ? '' : '−'}{o.octaveN}</td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>
                      {o.toneHz.toFixed(2)} Hz
                      {o.publishedHz !== undefined && Math.abs(o.publishedHz - o.toneHz) > 0.005 && (
                        <span className="t-caption text-3" style={{ display: 'block' }}>Cousto table: {o.publishedHz.toFixed(2)} Hz</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-caption text-3" style={{ marginTop: 12 }}>
            Newton check: the visible band (750→375 nm) spans almost exactly one octave of photon frequency — log₂(750/380) = 0.98 —
            which is why his Dorian string division of the spectrum (Opticks, 1704) closes cleanly. Orange and indigo are the
            semitone segments; that is why Newton drew them narrow. Verification: recompute any row as value × 2^±n.
          </p>
        </Panel>

        {/* Kepler's planet songs — computed from eccentricities */}
        <Panel style={{ marginTop: 16 }}>
          <h3 className="t-h3">Kepler’s planet songs (Harmonices Mundi, 1619) — recomputed</h3>
          <p className="t-body-sm text-2" style={{ margin: '6px 0 12px' }}>
            Kepler’s ratio is pure orbital mechanics: perihelion/aphelion angular speed = ((1+e)/(1−e))². Each planet below
            is octaved into Kepler’s own choir register (Saturn bass → Mercury soprano); n is stated per planet.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="t-body-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="t-label text-3" style={{ textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px 6px 0' }}>PLANET</th>
                  <th style={{ padding: '6px 10px' }}>APHELION → PERIHELION</th>
                  <th style={{ padding: '6px 10px' }}>RATIO</th>
                  <th style={{ padding: '6px 10px' }}>NEAREST INTERVAL</th>
                  <th style={{ padding: '6px 10px' }}>CENTS OFF</th>
                </tr>
              </thead>
              <tbody>
                {KEPLER_SONGS.map((k) => (
                  <tr key={k.planet} style={{ borderTop: '1px solid var(--ink-0)' }}>
                    <td style={{ padding: '8px 10px 8px 0' }}><strong>{k.planet}</strong> <span className="t-caption text-3">e={k.eccentricity} · n={k.octaveN}</span></td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>{k.aphelionHz.toFixed(2)} → {k.perihelionHz.toFixed(2)} Hz</td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>{k.ratio.toFixed(4)}</td>
                    <td style={{ padding: '8px 10px' }}>{k.interval}</td>
                    <td className="font-mono2" style={{ padding: '8px 10px', color: Math.abs(k.centsOff) <= 15 ? 'var(--teal)' : 'var(--amber)' }}>{k.centsOff > 0 ? '+' : ''}{k.centsOff.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-caption text-3" style={{ marginTop: 12 }}>{KEPLER_NOTE}</p>
        </Panel>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginTop: 16 }}>
          {PHYSICS_IDS.map((id) => <PresetMiniCard key={id} preset={byId(id)} />)}
        </div>
      </section>

      {/* ------------------------------------------------------ expedition */}
      <section>
        <SectionTitle icon={<Orbit size={18} />} id="expedition" title="Expedition shelf — history, tradition, folklore (labeled)"
          sub="Kepler's computed planet songs, the Chinese five-tone pentatonic with its meta-analytic music-therapy support, Tesla's unsourced 3-6-9 legend graded as folklore, and the clinical 40 Hz daily-hour dose. Every card states what is arithmetic, what is tradition, and what failed to replicate." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {EXPEDITION_IDS.map((id) => <PresetMiniCard key={id} preset={byId(id)} />)}
        </div>
      </section>

      {/* ------------------------------------------------------- hypotheses */}
      <section>
        <SectionTitle icon={<ListChecks size={18} />} id="hypotheses" title="Hypothesis ledger"
          sub="Every experimental preset on this page carries a falsifiable card: the prediction is written down before you listen, with a home test protocol and an honest prior. Null results are publishable — log them in the Dream journal." />
        <div className="flex flex-col gap-4">
          {LUCID_HYPOTHESES.map((h) => {
            const preset = getPresetById(h.presetId);
            return (
              <div key={h.id} className="panel" style={{ padding: 18, borderLeft: '3px solid var(--amber)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span className="t-label text-3">HYPOTHESIS · PRIOR: {h.prior.toUpperCase()}</span>
                  <GradeBadge grade={h.grade} citation={{ verdict: 'Experimental hypothesis; the prediction may fail.', summary: h.prediction, source: h.citations[0] }} />
                </div>
                <h3 className="t-h3">{h.title}</h3>
                <p className="t-body-sm text-2" style={{ marginTop: 8 }}><strong>Statement · </strong>{h.statement}</p>
                <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}><strong>Prediction · </strong>{h.prediction}</p>
                <p className="t-body-sm text-2" style={{ marginTop: 6 }}><strong>Home test · </strong>{h.homeTest}</p>
                {preset && <p className="t-caption font-mono2 text-3" style={{ marginTop: 8 }}>PRESET · {preset.title} · {fmtClock(presetDurationMin(preset) * 60)}</p>}
                {h.citations.map((c) => <p key={c} className="t-caption font-mono2 text-3" style={{ marginTop: 4 }}>▸ {c}</p>)}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="t-body-sm text-3" style={{ borderTop: '1px solid var(--ink-0)', paddingTop: 16 }}>
        Companion pages: <Link to="/dream">Sleep &amp; Dream protocols and journal</Link> · <Link to="/presets?collection=all">Full preset catalog</Link> ·{' '}
        <Link to="/programs">Programs archive</Link> · <Link to="/safety">Safety center</Link>. Lucid-dreaming practice with
        dissociative, psychosis-spectrum, or nightmare-disorder conditions belongs with a clinician first.
      </footer>
    </div>
  );
}
