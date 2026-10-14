/**
 * LabPresetCard — compact preset card for the research lab pages.
 *
 * Card face: art, title, duration, grade, ONE use-case line, and the two
 * actions (preview / load into Studio). Everything else — full rationale,
 * citations, purpose detail, source videos — lives behind the (i) popover so
 * the grid stays scannable.
 */

import { useNavigate } from 'react-router';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { DetailPopover } from '@/ui/components/DetailPopover';
import { presetUseCase } from '@/ui/components/presetPresentation';
import { useSession } from '@/ui/session/useSession';
import { fmtClock } from '@/ui/session/sessionMath';
import { presetDurationMin, type Preset } from '@/data/presets';
import { assetUrl } from '@/lib/assetUrl';

export function LabPresetCard({ preset, testidPrefix = 'lab' }: { preset: Preset; testidPrefix?: string }) {
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
    <article className="panel" style={{ padding: 16, overflow: 'hidden' }} data-testid={`${testidPrefix}-preset-${preset.id}`}>
      {preset.art && (
        <img
          src={assetUrl(preset.art)}
          alt={`${preset.title} cover art`}
          loading="lazy"
          style={{ width: 'calc(100% + 32px)', margin: '-16px -16px 12px', aspectRatio: '3 / 1', objectFit: 'cover', display: 'block', opacity: 0.9 }}
        />
      )}
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span className="t-label text-3">{preset.category.toUpperCase()} · {fmtClock(presetDurationMin(preset) * 60)}</span>
        <span className="flex items-center gap-1">
          <GradeBadge grade={preset.grade} compact />
          <DetailPopover title={preset.title} grade={preset.grade} label={`Details: ${preset.title}`}>
            <p className="t-body-sm" style={{ color: 'var(--text-2)' }}>{preset.rationale}</p>
            {preset.purpose && (
              <p className="t-body-sm" style={{ color: 'var(--teal)', marginTop: 10 }}>{preset.purpose}</p>
            )}
            <ul className="t-caption font-mono2" style={{ marginTop: 10, paddingLeft: 0, listStyle: 'none', color: 'var(--text-3)' }}>
              {preset.citations.map((c) => <li key={c} style={{ marginTop: 4 }}>▸ {c}</li>)}
            </ul>
            {preset.links && preset.links.length > 0 && (
              <ul className="t-caption font-mono2" style={{ marginTop: 10, paddingLeft: 0, listStyle: 'none' }}>
                {preset.links.map((l) => (
                  <li key={l.url} style={{ marginTop: 4 }}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }}>▶ {l.label}</a>
                  </li>
                ))}
              </ul>
            )}
            {preset.dose && (
              <p className="t-caption font-mono2" style={{ marginTop: 10, color: 'var(--text-3)' }}>
                ▸ DOSE · assumes {preset.dose.assumedDbA} dBA listening; one full session ≈ {preset.dose.weeklyBudgetPct.toFixed(2)}% of the weekly H.870 budget.
              </p>
            )}
          </DetailPopover>
        </span>
      </div>
      <h3 className="t-h3">{preset.title}</h3>
      <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--teal)' }}>{presetUseCase(preset)}</p>
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
