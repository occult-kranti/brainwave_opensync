/**
 * Healing Sound Lab — the healing-frequencies research page.
 *
 * The honest version of "healing frequencies": measured instrument acoustics,
 * clinical session doses (VAT 20–45 min tactile, Naghdi's 23-min fibromyalgia
 * protocol, WBV's 30 Hz/20-min daily window, Cochrane music trials), the NIH
 * program record, ultrasound/nanoparticle SOTA rendered as labeled octave
 * portraits, and an explicit panel on why the occult sources carry ratios,
 * not Hz. Claim discipline per src/docs/vocabulary.ts.
 */

import { Link } from 'react-router';
import { Archive, BookMarked, FlaskConical, HeartPulse, ListChecks, Orbit } from 'lucide-react';
import type { ReactNode } from 'react';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { Chip, Panel, WarningChip } from '@/ui/components/primitives';
import { DetailPopover } from '@/ui/components/DetailPopover';
import { LabPresetCard } from '@/ui/components/LabPresetCard';
import { getPresetById, presetDurationMin } from '@/data/presets';
import {
  HEALING_GOV,
  HEALING_HYPOTHESES,
  HEALING_HYPOTHESES_R4,
  HEALING_STUDIES,
  HEALING_STUDIES_R4,
  NANO_PORTRAITS,
} from '@/data/healingLab';
import { fmtClock } from '@/ui/session/sessionMath';
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

const HEALING_IDS = ['heal-bowl-session', 'heal-vat-skille-scan', 'heal-wbv-30-analog', 'heal-pythagorean-ladder', 'heal-pythagorean-evening', 'heal-pythagorean-morning'];
const NANO_IDS = ['exp-sonodynamic-portrait', 'exp-piezo-nano-portrait', 'exp-tuning-fork-128'];
const ALL_STUDIES = [...HEALING_STUDIES, ...HEALING_STUDIES_R4];
const ALL_HYPOTHESES = [...HEALING_HYPOTHESES, ...HEALING_HYPOTHESES_R4];
const byId = (id: string) => getPresetById(id)!;

const JUMPS = [
  ['#heal-evidence', 'Evidence'], ['#modality', 'Modality boundary'], ['#heal-presets', 'Presets'],
  ['#heal-gov', 'Programs'], ['#nano', 'Nano & ultrasound'], ['#heal-hypotheses', 'Hypotheses'],
] as const;

export default function HealingLab() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1080, position: 'relative', isolation: 'isolate' }}>
      <header>
        <div className="flex items-start justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
          <p className="t-label text-3">VIBRATION × CLINICAL DOSE × HONEST LABELS</p>
        </div>
        <h1 className="t-display-lg">Healing Sound Lab</h1>
        <p className="t-body text-2" style={{ maxWidth: 780 }}>
          What the healing-sound literature actually measured — bowl acoustics, vibroacoustic doses, the 30 Hz bone
          window, hospital music trials — plus the ultrasound and nanoparticle frontier drawn as honest octave portraits.
          The strongest evidence in this field is for music and for touch-delivered vibration, not for any Hz value;
          everything here keeps that boundary visible.
        </p>
        <div className="flex gap-2" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <WarningChip tone="amber">VAT and WBV are tactile modalities — speakers are not the studied dose</WarningChip>
          <WarningChip tone="amber">No disease claims; pain and PTSD belong with clinicians</WarningChip>
          <WarningChip tone="amber">Low-frequency tones need headphones or a subwoofer to exist at all</WarningChip>
        </div>
        <nav className="flex gap-2" style={{ marginTop: 14, flexWrap: 'wrap' }} aria-label="Section shortcuts">
          {JUMPS.map(([href, label]) => <Chip key={href} onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}>{label}</Chip>)}
        </nav>
        <LabRibbon />
        <LabHero src="art/hero-healing.jpg" alt="Singing bowls in warm light with rippling waves — Healing Sound Lab banner" caption="HEALING SOUND LAB · clinical doses · honest labels" />
      </header>

      {/* ---------------------------------------------------------- evidence */}
      <section>
        <SectionTitle icon={<BookMarked size={18} />} id="heal-evidence" title="The evidence, with doses"
          sub="Every card carries the studied dose — frequency, session length, cadence — because 'how long and how often' is where healing-sound claims usually go vague." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {ALL_STUDIES.map((s) => (
            <div key={s.id} className="panel" style={{ padding: 18 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="t-label text-3">STUDY</span>
                <span className="flex items-center gap-1">
                  <GradeBadge grade={s.grade} minus={s.gradeMinus} compact />
                  <DetailPopover title={s.name} grade={s.grade} label={`Details: ${s.name}`}>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)' }}><strong>Setup · </strong>{s.setup}</p>
                    <p className="t-body-sm" style={{ color: 'var(--amber)', marginTop: 8 }}><strong>Dose · </strong>{s.dose}</p>
                    <p className="t-body-sm" style={{ color: 'var(--teal)', marginTop: 8 }}><strong>Outcome · </strong>{s.outcome}</p>
                    <p className="t-caption" style={{ color: 'var(--text-3)', marginTop: 8 }}>{s.note}</p>
                    <p className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 8 }}>▸ {s.source}</p>
                  </DetailPopover>
                </span>
              </div>
              <h3 className="t-h3">{s.name}</h3>
              <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{s.headline ?? s.outcome}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- modality */}
      <section id="modality">
        <SectionTitle icon={<HeartPulse size={18} />} id="modality-boundary" title="The modality boundary"
          sub="The single most important fact in this field: most 'frequency therapy' evidence is about vibration delivered through the body, or about music — not about tones through headphones." />
        <Panel>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div>
              <h3 className="t-h3" style={{ color: 'var(--teal)' }}>Tactile (studied)</h3>
              <p className="t-body-sm text-2">VAT chairs and beds, WBV platforms, tuning forks on skin. Energy enters tissue mechanically; doses are Hz × amplitude × minutes against the body.</p>
            </div>
            <div>
              <h3 className="t-h3" style={{ color: 'var(--amber)' }}>Airborne (this app)</h3>
              <p className="t-body-sm text-2">Speakers and headphones move air, then eardrums. Relaxation, masking and ritual live here — and we sell them as exactly that, with the grades on the card.</p>
            </div>
            <div>
              <h3 className="t-h3" style={{ color: 'var(--danger)' }}>Ultrasonic / field (lab only)</h3>
              <p className="t-body-sm text-2">Sonodynamic therapy and piezo/magnetoelectric nanoparticles run at MHz and kOe, in tissue, with drugs or particles present. Portrait tones on this page are ratio keepsakes, not doses.</p>
            </div>
          </div>
        </Panel>
      </section>

      {/* ---------------------------------------------------------- presets */}
      <section>
        <SectionTitle icon={<FlaskConical size={18} />} id="heal-presets" title="Healing presets — clinical doses, honest labels"
          sub="Synthesized bowls in measured geometry, the Skille 30–120 Hz scan as pure tones, the 30 Hz bone-window as an AM rate, and the harmonic ladder the old texts actually describe." />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {HEALING_IDS.map((id) => <LabPresetCard key={id} preset={byId(id)} testidPrefix="heal" />)}
        </div>
      </section>

      {/* ------------------------------------------------------------- govt */}
      <section>
        <SectionTitle icon={<Archive size={18} />} id="heal-gov" title="Programs on the public record"
          sub="Healing-sound work that touched government institutions — graded twice as always: the record itself, and the claims. Gateway-era and RF-hearing documents live in the Government File on the Lucid Audio Lab page." />
        <div className="flex flex-col gap-4">
          {HEALING_GOV.map((g) => (
            <div key={g.id} className="panel" style={{ padding: 18 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <span className="t-label text-3">{g.agency.toUpperCase()} · {g.years.toUpperCase()}</span>
                <span className="flex items-center gap-1">
                  <span className="t-caption text-3">RECORD</span>
                  <GradeBadge grade={g.recordGrade} compact />
                  <span className="t-caption text-3">CLAIMS</span>
                  <GradeBadge grade={g.claimGrade} compact />
                  <DetailPopover title={g.name} grade={g.claimGrade} label={`Details: ${g.name}`}>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)' }}>{g.record}</p>
                    <p className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 8 }}>▸ {g.source}</p>
                  </DetailPopover>
                </span>
              </div>
              <h3 className="t-h3">{g.name}</h3>
              <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{g.headline ?? g.record}</p>
            </div>
          ))}
        </div>
        <p className="t-caption text-3" style={{ marginTop: 10 }}>
          Related: the Gateway assessment, the Army Hemi-Sync evaluation, Stargate and the Frey RF-hearing patents are in
          the <Link to="/lucid">Lucid Audio Lab government file</Link>; patent-based sound examples are on
          <Link to="/sound-methods"> Sound Methods</Link>.
        </p>
      </section>

      {/* ------------------------------------------------------------- nano */}
      <section>
        <SectionTitle icon={<Orbit size={18} />} id="nano" title="Nano & ultrasound frontier — portraits, not doses"
          sub="The real SOTA: sonodynamic therapy, piezoelectric barium-titanate nanostimulators, magnetoelectric field coupling. Each row is an exact octave-down of a published protocol parameter, with n stated. Arithmetic A; therapy meaning D." />
        <Panel>
          <div style={{ overflowX: 'auto' }}>
            <table className="t-body-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="t-label text-3" style={{ textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px 6px 0' }}>PROTOCOL</th>
                  <th style={{ padding: '6px 10px' }}>PHYSICAL PARAMETERS</th>
                  <th style={{ padding: '6px 10px' }}>OCTAVE</th>
                  <th style={{ padding: '6px 10px' }}>PORTRAIT TONE</th>
                </tr>
              </thead>
              <tbody>
                {NANO_PORTRAITS.map((n) => (
                  <tr key={n.id} style={{ borderTop: '1px solid var(--ink-0)' }}>
                    <td style={{ padding: '8px 10px 8px 0' }}>
                      <strong>{n.label}</strong>
                      <p className="t-caption text-3" style={{ marginTop: 2 }}>{n.context}</p>
                    </td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>{n.physicalHz}</td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>{n.octaveN === 0 ? '—' : `×2^−${n.octaveN}`}</td>
                    <td className="font-mono2" style={{ padding: '8px 10px' }}>{n.toneHz.toFixed(2)} Hz</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-caption text-3" style={{ marginTop: 12 }}>
            Why these can never be doses: sonodynamic work needs MHz pressure waves plus sonosensitizers; piezo-nano
            stimulation needs injected particles plus W/cm² ultrasound. An audible tone at 2⁻¹³ of the carrier shares the
            number and nothing else. Companion measurement bench: <Link to="/nano-lab">NanoLab</Link>.
          </p>
        </Panel>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginTop: 16 }}>
          {NANO_IDS.map((id) => <LabPresetCard key={id} preset={byId(id)} testidPrefix="heal" />)}
        </div>
      </section>

      {/* ------------------------------------------------------- hypotheses */}
      <section>
        <SectionTitle icon={<ListChecks size={18} />} id="heal-hypotheses" title="Hypothesis ledger — healing edition"
          sub="Falsifiable home tests for the healing presets, including the two honest nulls: portraits should behave aesthetically, and folklore forks should not beat their neighbors." />
        <div className="flex flex-col gap-4">
          {ALL_HYPOTHESES.map((h) => {
            const preset = getPresetById(h.presetId);
            return (
              <div key={h.id} className="panel" style={{ padding: 18, borderLeft: '3px solid var(--amber)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span className="t-label text-3">HYPOTHESIS · PRIOR: {h.prior.toUpperCase()}</span>
                  <GradeBadge grade={h.grade} compact />
                  <DetailPopover title={h.title} grade={h.grade} label={`Details: ${h.title}`}>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)' }}><strong>Statement · </strong>{h.statement}</p>
                    <p className="t-body-sm" style={{ color: 'var(--teal)', marginTop: 8 }}><strong>Prediction · </strong>{h.prediction}</p>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)', marginTop: 8 }}><strong>Home test · </strong>{h.homeTest}</p>
                    {h.citations.map((c) => <p key={c} className="t-caption font-mono2" style={{ color: 'var(--text-3)', marginTop: 6 }}>▸ {c}</p>)}
                  </DetailPopover>
                </div>
                <h3 className="t-h3">{h.title}</h3>
                <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{h.headline ?? h.prediction}</p>
                {preset && <p className="t-caption font-mono2 text-3" style={{ marginTop: 8 }}>PRESET · {preset.title} · {fmtClock(presetDurationMin(preset) * 60)}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="t-body-sm text-3" style={{ borderTop: '1px solid var(--ink-0)', paddingTop: 16 }}>
        Companion pages: <Link to="/lucid">Lucid Audio Lab</Link> · <Link to="/nano-lab">NanoLab measurement bench</Link> ·{' '}
        <Link to="/presets?collection=all">Full preset catalog</Link> · <Link to="/safety">Safety center</Link>. Persistent
        pain, PTSD, osteoporosis and neurological conditions belong with clinicians; these sessions are listening
        experiences with honest grades, not treatment.
      </footer>
    </div>
  );
}
