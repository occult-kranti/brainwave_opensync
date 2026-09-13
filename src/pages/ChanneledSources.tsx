import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, Play, Square } from 'lucide-react';
import {
  BASHAR_COPY as copy, BASHAR_PRESETS, CONSISTENCY_CARDS, DIGEST_SOURCE,
  LITERAL_CARDS, SOURCE_CARDS, type ExhibitSource,
} from '@/channeled/bashar';
import { map, MAPPING_ANCHOR, PHI_LADDER_HZ, SCALE_READINGS } from '@/channeled/mapping';
import { BOWL_SETS } from '@/engine/bowls';
import { getPresetById, presetDurationMin } from '@/data/presets';
import { getFrequencyById } from '@/data/frequencies';
import { useSession } from '@/ui/session/useSession';
import { bowlSetToLayers } from '@/ui/session/sessionMath';
import '@/channeled/channeled.css';

function Sources({ sources }: { sources: readonly ExhibitSource[] }) {
  return <details className="source-citations">
    <summary>{copy.sourceLinkLabel}</summary>
    <ul>{sources.map((source) => <li key={source.label}>
      {source.url
        ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
        : source.label}
    </li>)}</ul>
  </details>;
}

function Grade({ grade }: { grade: 'A' | 'D' }) {
  return <span className="source-grade" data-grade={grade}>{copy.gradeLabel(grade)}</span>;
}

function Card({ title, text, grade, sources }: {
  title: string; text: string; grade: 'A' | 'D'; sources: readonly ExhibitSource[];
}) {
  return <article className="source-card">
    <div className="source-card-top"><h3>{title}</h3><Grade grade={grade} /></div>
    <p>{text}</p>
    <Sources sources={sources} />
  </article>;
}

export default function ChanneledSources() {
  const [statedInput, setStatedInput] = useState('200000');
  const session = useSession();
  const { stopPreview } = session;
  const navigate = useNavigate();
  const stated = Number(statedInput);
  const validInput = statedInput.trim() !== '' && Number.isFinite(stated) && stated >= 0 && stated <= 1_000_000;
  const previewBlocked = session.running || session.panicked || session.muted || session.governor.infantMode;
  const ownsPreview = BASHAR_PRESETS.some((preset) => session.previewId === `preset:${preset.id}`);

  useEffect(() => () => stopPreview(), [stopPreview]);
  useEffect(() => {
    if (previewBlocked && ownsPreview) stopPreview();
  }, [previewBlocked, ownsPreview, stopPreview]);

  const loadChord = () => {
    const bowls = BOWL_SETS.find((set) => set.id === 'golden-ratio-chord');
    if (!bowls) return;
    session.stopPreview();
    session.stop();
    session.setBowls(bowlSetToLayers(bowls));
    session.setLayersOn(true);
    navigate('/studio');
  };

  return <div className="channeled">
    <header>
      <p className="source-eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="source-subtitle">{copy.subtitle}</p>
      <div className="source-provenance" data-testid="channeled-provenance">
        <h2>{copy.provenanceTitle}</h2>
        <ol>{copy.provenance.map((paragraph) => <li key={paragraph}>{paragraph}</li>)}</ol>
        <div className="source-tags">
          <span className="source-grade" data-grade="D">{copy.claimGrade}</span>
          <span className="source-grade" data-grade="A">{copy.arithmeticGrade}</span>
        </div>
        <p className="source-meta">{copy.provenanceNote}</p>
        <Sources sources={[DIGEST_SOURCE]} />
      </div>
    </header>

    <nav className="source-jumps" aria-label={copy.jumpLabel}>
      {copy.sections.map((section) => <a key={section.id} href={`#channeled-${section.id}`}>{section.label}</a>)}
    </nav>

    <section id="channeled-source" className="source-section">
      <h2>{copy.sections[0].label}</h2><p>{copy.sourceIntro}</p>
      <div className="source-grid">{SOURCE_CARDS.map((card) => <Card key={card.id} {...card} />)}</div>
    </section>

    <section id="channeled-consistency" className="source-section">
      <h2>{copy.sections[1].label}</h2><p>{copy.consistencyIntro}</p>
      <div className="source-grid">{CONSISTENCY_CARDS.map((card) => <Card key={card.title} {...card} />)}</div>
    </section>

    <section id="channeled-mapping" className="source-section">
      <h2>{copy.sections[2].label}</h2>
      <div className="source-mapping">
        <div className="source-card-top"><h3>{copy.mappingTitle}</h3><Grade grade="A" /></div>
        <p>{copy.mappingIntro}</p><p>{copy.mappingLimit}</p>
        <p className="source-meta">{copy.mappingGrade}</p>
        <div className="source-table-scroll" role="region" aria-label={copy.mappingCaption} tabIndex={0}>
          <table>
            <thead><tr>{copy.tableHeaders.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>{SCALE_READINGS.map((reading) => <tr key={reading.stated} className={reading.stated === MAPPING_ANCHOR.stated ? 'source-anchor' : undefined}>
              <td>{reading.stated.toLocaleString('en-US')}</td>
              <td>{map(reading.stated).toFixed(1)} Hz{reading.stated === MAPPING_ANCHOR.stated && <div className="source-meta">{copy.anchorLabel}</div>}</td>
              <td>{copy.bandNames[reading.bandId]}<div className="source-meta">{getFrequencyById(reading.bandId)?.band?.minHz}–{getFrequencyById(reading.bandId)?.band?.maxHz} Hz</div></td>
              <td><span className="source-meta">{copy.sourceStatus}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="source-meta">{copy.bandNote}</p>
        <Sources sources={SOURCE_CARDS[0].sources} />
        <div className="source-calculator">
          <label htmlFor="channeled-stated">{copy.calculatorLabel}</label>
          <input id="channeled-stated" type="number" min={0} max={1_000_000} step="any" value={statedInput}
            aria-describedby="channeled-calculator-help channeled-calculator-result" aria-invalid={!validInput}
            onChange={(event) => setStatedInput(event.target.value)} />
          <p id="channeled-calculator-help" className="source-meta">{copy.calculatorHelp}</p>
          <output id="channeled-calculator-result" aria-live="polite" className={validInput ? undefined : 'source-error'}>
            {validInput ? copy.calculatorResult(stated, map(stated)) : copy.calculatorInvalid}
          </output>
        </div>
      </div>
    </section>

    <section id="channeled-literal" className="source-section">
      <h2>{copy.sections[3].label}</h2><p>{copy.literalIntro}</p>
      <div className="source-grid">{LITERAL_CARDS.map((card) => <Card key={card.title} {...card} />)}</div>
    </section>

    <section className="source-section" aria-labelledby="channeled-phi-title">
      <h2 id="channeled-phi-title">{copy.phiTitle}</h2><p>{copy.phiSubtitle}</p>
      <div className="source-mapping">
        <div className="source-card-top"><h3>{copy.phiFormula}</h3><Grade grade="A" /></div>
        <div className="source-pitches">{PHI_LADDER_HZ.map((frequency) => <div className="source-pitch" key={frequency}>{frequency.toFixed(2)} Hz</div>)}</div>
        <p>{copy.phiNote}</p><p>{copy.phiDifference}</p>
        <Sources sources={SOURCE_CARDS[3].sources} />
        <p><Link to="/harmonics">{copy.harmonicLink}</Link></p>
      </div>
    </section>

    <section id="channeled-play" className="source-section">
      <h2>{copy.sections[4].label}</h2><p>{copy.playIntro}</p>
      {previewBlocked && <p className="source-meta" role="status">{copy.previewBlocked}</p>}
      {!session.advisoryAcknowledged && <p className="source-meta">{copy.previewAdvisory}</p>}
      <div className="source-grid">
        {BASHAR_PRESETS.map(({ id }) => {
          const preset = getPresetById(id)!;
          const previewing = session.previewId === `preset:${preset.id}`;
          return <article className="source-card" key={preset.id}>
            <div className="source-card-top"><h3>{preset.title}</h3><Grade grade="D" /></div>
            <p className="source-meta">{copy.presetMeta(presetDurationMin(preset))}</p>
            <p>{preset.rationale}</p>
            <ul className="source-phases">{preset.spec.phases.map((phase, index) => <li key={phase.name}>
              {copy.phaseLabel(index, phase.carrierHz, phase.beatHz, phase.mode ?? 'binaural')}
            </li>)}</ul>
            <Sources sources={preset.citations.map((label) => ({ label }))} />
            <div className="source-actions">
              <button type="button" className="source-action" aria-pressed={previewing} disabled={previewBlocked} onClick={() => {
                if (previewBlocked) return;
                if (!session.advisoryAcknowledged) { session.openAdvisory(); return; }
                session.previewPreset(preset);
              }}>
                {previewing ? <Square size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                {previewing ? copy.stopPreview : copy.preview}
              </button>
              <button type="button" className="source-action primary" onClick={() => {
                session.stopPreview(); session.stop(); session.loadPreset(preset); navigate('/studio');
              }}><ArrowUpRight size={16} aria-hidden="true" />{copy.loadPreset}</button>
            </div>
          </article>;
        })}
        <article className="source-card">
          <div className="source-card-top"><h3>{copy.bowlTitle}</h3><Grade grade="D" /></div>
          <p>{copy.bowlDescription}</p><p className="source-meta">{copy.bowlHelp}</p>
          <Sources sources={SOURCE_CARDS[3].sources} />
          <div className="source-actions"><button type="button" className="source-action primary" onClick={loadChord}>
            <ArrowUpRight size={16} aria-hidden="true" />{copy.bowlLoad}
          </button></div>
        </article>
      </div>
    </section>

    <footer className="source-footer"><h2>{copy.sourcesTitle}</h2><p>{copy.nextEvidence}</p><Sources sources={[DIGEST_SOURCE]} /></footer>
  </div>;
}
