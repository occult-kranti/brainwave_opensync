import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Headphones, Play, Square, Waves } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import {
  cymaticsRecipe, LISTENING_LIMIT_SEC, LISTENING_PRESETS, listeningPhases,
  listeningPreviewId, SA_DEFAULT_HZ, SA_MAX_HZ, SA_MIN_HZ, validSaHz,
  type ListeningPreset,
} from './listening';
import type { TopicId } from './types';

export default function ListeningPresets({
  topics, id = 'listening',
}: {
  topics?: readonly TopicId[];
  id?: string;
}) {
  const session = useSession();
  const { advisoryAcknowledged, governor, muted, panicked, previewId, running, stopPreview } = session;
  const [saText, setSaText] = useState(String(SA_DEFAULT_HZ));
  const [notice, setNotice] = useState('');
  const previewRef = useRef<string | null>(null);
  const ownedPreview = useRef<string | null>(null);
  const presets = LISTENING_PRESETS.filter((preset) => !topics || topics.includes(preset.topic) ||
    (preset.relatedTopic && topics.includes(preset.relatedTopic)));
  const saHz = validSaHz(saText.trim() ? Number(saText) : NaN);
  const blocked = running || muted || panicked || governor.infantMode;
  const blockedMessage = running ? 'Stop the Studio session to hear a preview.' :
    muted ? 'Unmute Open Sync to hear a preview.' :
    governor.infantMode ? 'Research previews are paused in infant mode.' :
    panicked ? 'Return from the stop screen to hear a preview.' : '';

  useEffect(() => { previewRef.current = previewId; }, [previewId]);
  useEffect(() => () => {
    if (ownedPreview.current && previewRef.current === ownedPreview.current) stopPreview();
  }, [stopPreview]);
  useEffect(() => {
    if (ownedPreview.current && previewRef.current === ownedPreview.current) stopPreview();
  }, [running, muted, panicked, advisoryAcknowledged, governor.infantMode, governor.maxGainDbFs, stopPreview]);

  function play(preset: ListeningPreset) {
    const nextId = listeningPreviewId(preset);
    if (previewId === nextId) {
      stopPreview();
      return;
    }
    if (blocked) return;
    if (!advisoryAcknowledged) {
      session.openAdvisory();
      setNotice('Read the listening advisory, then press Play again.');
      return;
    }
    ownedPreview.current = nextId;
    session.previewPhases(nextId, listeningPhases(preset, saHz), LISTENING_LIMIT_SEC);
    setNotice('');
  }

  return (
    <section className="arch-listening" id={id} aria-labelledby={`${id}-title`}>
      <div className="arch-listening-heading">
        <Headphones size={22} aria-hidden="true" />
        <div>
          <h2 id={`${id}-title`}>Listening presets</h2>
          <p>Synthetic previews play for up to {LISTENING_LIMIT_SEC} seconds. Use a low output volume, especially with headphones.</p>
        </div>
      </div>
      {(blockedMessage || notice) && <p className="arch-listening-status" role="status">{blockedMessage || notice}</p>}
      <div className="arch-listening-grid">
        {presets.map((preset) => {
          const playing = previewId === listeningPreviewId(preset);
          const figure = cymaticsRecipe(preset, saHz);
          const duration = preset.phases.reduce((total, phase) => total + phase.seconds, 0) -
            0.5 * (preset.phases.length - 1);
          return (
            <article className="arch-preset" key={preset.id}>
              <p className="arch-preset-kind">{preset.kind} · {duration} s</p>
              <h3>{preset.title}</h3>
              <p className="arch-preset-reference">{preset.id === 'sa-tonic' ? `Sa ${saHz} Hz · Pa ${Number((saHz * 1.5).toFixed(2))} Hz` : preset.reference}</p>
              <p>{preset.description}</p>
              {preset.id === 'sa-tonic' && (
                <label className="arch-listening-sa" htmlFor={`${id}-sa`}>
                  Sa tonic in Hz
                  <input
                    id={`${id}-sa`}
                    type="number" min={SA_MIN_HZ} max={SA_MAX_HZ} step="0.1" value={saText}
                    onChange={(event) => {
                      if (playing) stopPreview();
                      setSaText(event.target.value);
                    }}
                    onBlur={() => setSaText(String(saHz))}
                  />
                </label>
              )}
              {preset.source && <a className="arch-preset-source" href={preset.source.url} target="_blank" rel="noreferrer">{preset.source.label}</a>}
              <div className="arch-preset-actions">
                <button type="button" disabled={blocked && !playing} onClick={() => play(preset)} aria-label={`${playing ? 'Stop' : 'Play'} ${preset.title}`}>
                  {playing ? <Square size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
                  {playing ? 'Stop' : 'Play'}
                </button>
                {figure && (
                  <Link to={{ pathname: '/cymatics', search: new URLSearchParams({ look: JSON.stringify(figure) }).toString() }}>
                    <Waves size={15} aria-hidden="true" />
                    {figure.view === 'water' ? 'Liquid visualization' : 'Virtual plate'} · {Number(figure.hz.toFixed(2))} Hz
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
