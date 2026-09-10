/**
 * Module 1 — Studio (design: studio.md). Live generator front panel.
 */

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Check, Download, Headphones, Link2, MoonStar, Play, RotateCcw, Send, Square, Volume2, VolumeX } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import { fmtClock } from '@/ui/session/sessionMath';
import { FADE_OUT_CHOICES } from '@/ui/session/sessionDefaults';
import { EXPORT_FORMATS, type ExportFormat } from '@/ui/audio/renderExport';
import { Panel, Led, WarningChip, Readout } from '@/ui/components/primitives';
import { useModalA11y } from '@/ui/hooks';
import { Knob } from '@/ui/components/Knob';
import { Fader } from '@/ui/components/Fader';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { Visualizer } from '@/ui/components/Visualizer';
import { StudioScope } from '@/ui/components/StudioScope';
import { StudioCymatics } from '@/ui/components/StudioCymatics';
import { PhaseTimeline } from '@/ui/components/PhaseTimeline';
import { InfoPopover } from '@/ui/components/InfoPopover';
import { BowlSet } from '@/ui/components/BowlSet';
import { BANDS, BAND_COLOR, NOISE_COLOR, NOISE_SLOPE, bandForBeat } from '@/ui/theme';
import { useIsMobile } from '@/hooks/use-mobile';
import type { EntrainmentMode, NoiseColor } from '@/engine';

const MODE_DESC: Record<EntrainmentMode, string> = {
  binaural: 'Two slightly detuned carriers, one per ear. Headphones required. Percept valid ≤1 kHz carrier, ≤30 Hz beat.',
  monaural: 'Both tones summed acoustically before the ear. Stronger cortical AM response than binaural (Orozco Perez 2020).',
  isochronic: 'A single tone gated on/off at the beat rate. Works on speakers. Strongest AM stimulus of the three.',
};

const NATURE_KINDS = ['rain', 'ocean', 'stream', 'fire', 'thunder'] as const;

export default function Studio() {
  const s = useSession();
  const navigate = useNavigate();
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);
  // P0-4: Esc closes the modal, focus returns to the SAVE AS PRESET trigger.
  useModalA11y(saveOpen, () => setSaveOpen(false), saveInputRef);
  const isMobile = useIsMobile();

  // Persists via the SessionContext user-preset store; refused on an empty name.
  const confirmSave = () => {
    if (!saveName.trim() || saved) return;
    s.saveCurrentAsPreset(saveName.trim());
    setSaved(true);
    window.setTimeout(() => {
      setSaveOpen(false);
      setSaved(false);
      setSaveName('');
    }, 600);
  };

  // P0-6 4-state WAV export: idle → exporting (spinner only after a 200 ms
  // delay, so fast renders never flash) → done (brief inline confirm) or
  // error (inline, with retry). v2: the render runs in a Web Worker and the
  // format is a choice; the session limit caps the file.
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle');
  const [exportSpin, setExportSpin] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pcm16');
  const runExport = () => {
    if (exportState === 'exporting') return;
    setExportState('exporting');
    setExportSpin(false);
    const spinT = window.setTimeout(() => setExportSpin(true), 200);
    void s.exportWav({ format: exportFormat }).then((ok) => {
      window.clearTimeout(spinT);
      setExportSpin(false);
      if (ok) {
        setExportState('done');
        window.setTimeout(() => setExportState('idle'), 2500);
      } else {
        setExportState('error');
      }
    });
  };

  // Share link: copy to clipboard with a brief inline confirm.
  const [shared, setShared] = useState<'idle' | 'copied' | 'shown'>('idle');
  const [shareText, setShareText] = useState('');
  const shareFieldRef = useRef<HTMLInputElement>(null);
  const copyShareLink = () => {
    const url = s.getShareLink();
    setShareText(url);
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    const showField = () => {
      // Clipboard unavailable: keep the link on screen until dismissed, and put focus on it.
      setShared('shown');
      window.setTimeout(() => {
        shareFieldRef.current?.focus();
        shareFieldRef.current?.select();
      }, 0);
    };
    if (clip && typeof clip.writeText === 'function') {
      clip
        .writeText(url)
        .then(() => {
          setShared('copied');
          window.setTimeout(() => setShared((v) => (v === 'copied' ? 'idle' : v)), 4000);
        })
        .catch(showField);
    } else {
      showField();
    }
  };
  const formatNote = EXPORT_FORMATS.find((f) => f.id === exportFormat)?.note ?? '';

  const fadeStartsAtSec = Math.max(0, s.limitMin * 60 - s.fadeOutSec);
  // Countdown to silence: the fade's own end (manual or limit), not the limit.
  const remainingSec = Math.max(0, (s.fadeEndsAtSec ?? s.limitMin * 60) - s.elapsedSec);

  const limitPct = Math.min(100, (s.elapsedSec / (s.limitMin * 60)) * 100);

  return (
    <div style={{ padding: isMobile ? '20px 16px 40px' : '32px 40px 48px', maxWidth: 1440, margin: '0 auto' }}>
      {/* ROW A — Transport bar (wraps to two rows below md) */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="panel flex items-center gap-5"
        style={{
          minHeight: 64,
          height: isMobile ? 'auto' : 64,
          padding: isMobile ? '8px 12px' : '0 16px',
          marginBottom: 16,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          rowGap: isMobile ? 10 : undefined,
          columnGap: isMobile ? 12 : undefined,
        }}
      >
        <button
          type="button"
          onClick={s.running ? s.stop : s.start}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 48,
            padding: '0 20px',
            background: s.running ? 'transparent' : 'var(--amber)',
            border: s.running ? '1px solid var(--amber)' : 'none',
            borderRadius: 2,
            color: s.running ? 'var(--amber)' : 'var(--text-inv)',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            cursor: 'pointer',
          }}
        >
          {s.running ? <Square size={14} /> : <Play size={14} />}
          {s.running ? 'STOP' : 'START SESSION'}
        </button>
        <Led state={s.running ? 'amber' : 'off'} title={s.running ? 'Engine running' : 'Engine off'} />
        <span className="t-readout-lg" style={{ color: s.running ? 'var(--text-1)' : 'var(--text-3)' }}>
          {fmtClock(s.elapsedSec)}
        </span>
        <div title="Default 90-minute limit — change in Safety Center">
          <div className="t-readout-sm" style={{ color: limitPct >= 80 ? 'var(--danger)' : 'var(--text-3)' }}>
            LIMIT {fmtClock(s.limitMin * 60)}
          </div>
          <div style={{ width: 120, height: 2, background: 'var(--ink-4)', marginTop: 4 }}>
            <div
              style={{
                height: '100%',
                width: `${limitPct}%`,
                background: limitPct >= 80 ? 'var(--danger)' : 'var(--amber)',
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/presets')}
          className="chip"
          title="Open preset quick-switcher"
          style={{ position: 'relative' }}
        >
          {s.presetName ?? 'CUSTOM'}
          {s.presetGrade && <GradeBadge grade={s.presetGrade} compact />}
          {s.dirty && (
            <span
              style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }}
              title="Unsaved changes"
            />
          )}
        </button>
        <div
          className="flex items-center gap-2"
          style={isMobile ? { flexBasis: '100%', flexWrap: 'wrap', rowGap: 8 } : { marginLeft: 'auto' }}
        >
          <input
            type="range"
            min={-60}
            max={0}
            step={0.5}
            value={s.volumeDb}
            onChange={(e) => s.setVolumeDb(parseFloat(e.target.value))}
            aria-label="Output level"
            style={{ width: isMobile ? '100%' : 110, minWidth: isMobile ? 0 : undefined, accentColor: '#D9A441' }}
          />
          <span className="t-readout-sm text-2" style={{ width: 64 }}>
            {s.volumeDb.toFixed(1)} dB
          </span>
          <button
            type="button"
            onClick={() => s.setMuted(!s.muted)}
            className="chip"
            style={{ padding: '0 8px' }}
            title={s.muted ? 'Unmute' : 'Mute'}
          >
            {s.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <button type="button" className="chip" onClick={() => setSaveOpen(true)}>
            SAVE AS PRESET
          </button>
          <button type="button" className="chip" onClick={() => navigate('/analyzer')} style={{ borderColor: 'rgba(79,140,130,0.5)' }}>
            <Send size={11} /> ANALYZER
          </button>
          <button
            type="button"
            className="chip chip-active"
            data-testid="wav-export"
            data-state={exportState}
            onClick={runExport}
            disabled={exportState === 'exporting'}
            title={`Render offline in a worker + encode WAV (${exportFormat}); capped at the session limit`}
          >
            <Download size={11} className={exportSpin ? 'animate-spin' : undefined} />
            {exportState === 'exporting' ? (exportSpin ? 'RENDERING…' : 'WAV') : exportState === 'done' ? 'SAVED ✓' : 'WAV'}
          </button>
          {exportState === 'error' && (
            <span className="flex items-center gap-2" role="alert">
              <WarningChip tone="danger">Export failed</WarningChip>
              <button type="button" className="chip" onClick={runExport}>
                RETRY
              </button>
            </span>
          )}
        </div>
      </motion.div>

      {/* ROW A2 — Session tools (v2): sleep fade, share, export format, reset + notices */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.04 }}
        className="panel"
        data-testid="session-tools"
        style={{ padding: isMobile ? '10px 12px' : '10px 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', rowGap: 8 }}>
          <span className="t-label" style={{ color: 'var(--text-3)' }}>
            <MoonStar size={11} style={{ display: 'inline', marginRight: 6, verticalAlign: '-1px' }} />
            SLEEP FADE
          </span>
          <div className="flex gap-1" role="group" aria-label="Sleep fade length before the limit">
            {FADE_OUT_CHOICES.map((c) => (
              <button
                key={c.sec}
                type="button"
                aria-pressed={s.fadeOutSec === c.sec}
                className={`chip${s.fadeOutSec === c.sec ? ' chip-active' : ''}`}
                style={{ height: 24, padding: '0 8px', fontSize: 10 }}
                onClick={() => s.setFadeOutSec(c.sec)}
                title={c.sec === 0 ? 'Stop hard at the limit' : `Ramp to silence over the last ${c.label.toLowerCase()} before the limit`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {s.running && !s.fading && (
            <button
              type="button"
              className="chip"
              data-testid="fade-now"
              onClick={() => s.startSleepFade()}
              title="Fade to silence now (F)"
              style={{ height: 24, padding: '0 8px', fontSize: 10 }}
            >
              FADE NOW
            </button>
          )}
          {s.fading && (
            <span className="flex items-center gap-2" data-testid="fading-notice">
              <WarningChip tone="amber">FADING · {fmtClock(remainingSec)}</WarningChip>
              <button type="button" className="chip" style={{ height: 24, padding: '0 8px', fontSize: 10 }} onClick={s.cancelSleepFade}>
                CANCEL
              </button>
            </span>
          )}
          <span className="t-caption" style={{ color: 'var(--text-3)' }}>
            {s.fadeOutSec > 0 ? `fade begins at ${fmtClock(fadeStartsAtSec)} · limit ${fmtClock(s.limitMin * 60)}` : `hard stop at ${fmtClock(s.limitMin * 60)}`}
          </span>
          <div className="flex items-center gap-2" style={isMobile ? { flexBasis: '100%', flexWrap: 'wrap' } : { marginLeft: 'auto' }}>
            <label className="t-caption text-3" htmlFor="export-format" style={{ letterSpacing: '0.08em' }}>
              WAV
            </label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              aria-label="WAV export format"
              className="font-mono2"
              style={{ height: 24, background: 'var(--ink-3)', color: 'var(--text-1)', border: '1px solid var(--line-1)', borderRadius: 2, fontSize: 10, padding: '0 6px' }}
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <span className="t-caption" style={{ color: 'var(--text-3)' }} data-testid="export-format-note">
              {formatNote}
            </span>
            <button
              type="button"
              className="chip"
              data-testid="share-link"
              onClick={copyShareLink}
              title="Copy a link that reproduces this whole setup on any device"
              style={{ height: 24, padding: '0 8px', fontSize: 10 }}
            >
              {shared === 'copied' ? <Check size={11} /> : <Link2 size={11} />} {shared === 'copied' ? 'LINK COPIED' : 'SHARE'}
            </button>
            <span role="status" aria-live="polite" className="sr-only">
              {shared === 'copied' ? 'Share link copied to the clipboard' : shared === 'shown' ? 'Clipboard unavailable — the share link is shown below' : ''}
            </span>
            <button
              type="button"
              className="chip"
              onClick={s.resetFrontPanel}
              disabled={s.running}
              title={s.running ? 'Stop the session to reset' : 'Restore the factory front panel (presets and dose are kept)'}
              style={{ height: 24, padding: '0 8px', fontSize: 10 }}
            >
              <RotateCcw size={11} /> RESET
            </button>
          </div>
        </div>
        {shared === 'shown' && (
          <div className="flex items-center gap-2">
            <input
              ref={shareFieldRef}
              readOnly
              value={shareText}
              aria-label="Share link (copy it by hand)"
              onFocus={(e) => e.currentTarget.select()}
              className="font-mono2"
              style={{ flex: 1, minWidth: 0, height: 28, background: 'var(--ink-0)', color: 'var(--text-2)', border: '1px solid var(--line-1)', borderRadius: 2, fontSize: 11, padding: '0 8px' }}
            />
            <button type="button" className="chip" style={{ height: 24, padding: '0 8px', fontSize: 10 }} onClick={() => setShared('idle')} aria-label="Dismiss the share link">
              ✕
            </button>
          </div>
        )}
        {(s.mode === 'binaural' || s.startBlocked.length > 0 || s.interrupted || s.exportError) && (
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            {s.mode === 'binaural' && (
              <WarningChip tone="teal">
                <Headphones size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                HEADPHONES REQUIRED
              </WarningChip>
            )}
            {s.interrupted && <WarningChip tone="amber">AUDIO INTERRUPTED BY THE SYSTEM — PAUSED · PRESS RESUME</WarningChip>}
            {s.exportError && <WarningChip tone="danger">EXPORT: {s.exportError}</WarningChip>}
            {s.startBlocked.map((r) => (
              <WarningChip key={r} tone="danger">
                {r}
              </WarningChip>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid gap-4" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)' }}>
        {/* ROW B — Engine panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.05 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <Panel
            title="ENGINE"
            right={
              <GradeBadge
                grade="C"
                compact
                citation={{
                  verdict: 'Percept: Grade A physics. Cortical entrainment claim: Grade C.',
                  summary: 'Ingendoh 2023: 5 pro / 8 contra of 14 EEG studies on beat-driven entrainment.',
                  source: 'Ingendoh et al., PLOS ONE (2023), PMC10198548',
                }}
              />
            }
          >
            {/* mode tabs */}
            <div className="flex hairline-b" style={{ marginBottom: 12 }}>
              {(['binaural', 'monaural', 'isochronic'] as EntrainmentMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => s.setMode(m)}
                  className="t-label"
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: s.mode === m ? '2px solid var(--amber)' : '2px solid transparent',
                    color: s.mode === m ? 'var(--amber)' : 'var(--text-2)',
                    cursor: 'pointer',
                  }}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="t-body-sm text-2" style={{ minHeight: 40, marginBottom: 12 }}>
              {MODE_DESC[s.mode]}
            </p>
            {/* knobs */}
            <div className="flex justify-around" style={{ marginBottom: 8 }}>
              <div className="flex flex-col items-center gap-2">
                <Knob label="CARRIER (L/R)" value={s.carrierHz} min={20} max={1000} defaultValue={200} onChange={s.setCarrierHz} color="var(--teal)" />
                <Readout value={s.carrierHz.toFixed(2)} unit="Hz" size="lg" color="var(--teal)" editable onCommit={(raw) => {
                  const v = parseFloat(raw);
                  if (Number.isFinite(v)) s.setCarrierHz(v);
                  return Number.isFinite(v);
                }} />
                <span className="t-readout-sm">
                  <span className="text-teal">L {s.carrierHz.toFixed(2)}</span>
                  <span className="text-3"> ▏</span>
                  <span className="text-amber">R {(s.mode === 'binaural' ? s.carrierHz + s.beatHz : s.carrierHz).toFixed(2)}</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Knob label="BEAT" value={s.beatHz} min={0.1} max={40} log onChange={s.setBeatHz} color="var(--amber)" />
                <Readout value={s.beatHz.toFixed(2)} unit="Hz" size="lg" color="var(--amber)" editable onCommit={(raw) => {
                  const v = parseFloat(raw);
                  if (Number.isFinite(v)) s.setBeatHz(v);
                  return Number.isFinite(v);
                }} />
                {/* band strip */}
                <BandStrip beat={s.beatHz} />
              </div>
            </div>
            {/* warnings */}
            {s.warnings.length > 0 && (
              <div className="flex flex-col gap-2" style={{ margin: '8px 0' }}>
                {s.warnings.map((w) => (
                  <WarningChip key={w}>{w}</WarningChip>
                ))}
              </div>
            )}
            {/* synthesis options */}
            <div className="flex flex-col gap-3" style={{ marginTop: 12 }}>
              <div className="flex items-center gap-2">
                <span className="t-label" style={{ width: 90 }}>WAVEFORM</span>
                {(['sine', 'triangle', 'square'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`chip ${s.waveform === w ? 'chip-active' : ''}`}
                    onClick={() => s.setWaveform(w)}
                  >
                    {w.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="t-label" style={{ width: 90 }}>PHASE LOCK</span>
                <button type="button" className={`chip ${s.phaseLock ? 'chip-active' : ''}`} onClick={() => s.setPhaseLock(!s.phaseLock)}>
                  {s.phaseLock ? 'LOCKED' : 'FREE'}
                </button>
                <Led state={s.phaseLock ? 'teal' : 'off'} />
                <span className="t-caption text-3">
                  {s.phaseLock ? 'L/R phase locked at cycle boundaries' : 'independent oscillators (legacy style)'}
                </span>
              </div>
              {s.mode === 'isochronic' && (
                <div className="flex items-center gap-2">
                  <span className="t-label" style={{ width: 90 }}>GATE</span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={s.gateDuty * 100}
                    onChange={(e) => s.setGateDuty(parseInt(e.target.value, 10) / 100)}
                    aria-label="Gate duty"
                    style={{ width: 90, accentColor: '#D9A441' }}
                  />
                  <span className="t-readout-sm text-2">{Math.round(s.gateDuty * 100)}%</span>
                  {(['raised-cosine', 'hard'] as const).map((sh) => (
                    <button key={sh} type="button" className={`chip ${s.gateShape === sh ? 'chip-active' : ''}`} onClick={() => s.setGateShape(sh)}>
                      {sh === 'raised-cosine' ? 'COS' : 'HARD'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </motion.div>

        {/* ROW B — Master readout */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.1 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <div className="scope-well flex flex-col" style={{ padding: 24, height: '100%', border: s.running ? '1px solid var(--line-2)' : undefined }}>
            <span className="t-label">MASTER READOUT</span>
            <div style={{ margin: '8px 0' }}>
              <span className="t-readout-xl" style={{ color: 'var(--amber)' }}>
                {s.beatHz.toFixed(2)}
                <span className="text-3" style={{ fontSize: '0.5em' }}>
                  {'\u2009'}Hz
                </span>
              </span>
            </div>
            <div className="t-readout-md" style={{ marginBottom: 12 }}>
              <span className="text-teal">L {s.carrierHz.toFixed(2)} Hz</span>
              <span className="text-3"> ▏</span>
              <span className="text-amber">R {(s.mode === 'binaural' ? s.carrierHz + s.beatHz : s.carrierHz).toFixed(2)} Hz</span>
            </div>
            {/* phase coherence meter */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ width: 180, height: 6, background: 'var(--ink-4)', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: -2,
                    left: s.phaseLock ? 'calc(50% - 3px)' : 'calc(50% - 3px)',
                    width: 6,
                    height: 10,
                    background: 'var(--teal)',
                  }}
                />
                <div style={{ position: 'absolute', left: '50%', top: -3, width: 1, height: 12, background: 'var(--line-2)' }} />
              </div>
              <span className="t-readout-sm text-3">
                PHASE Δ {s.phaseLock ? '0.000' : '—'} rad
              </span>
            </div>
            <div className="t-readout-sm text-2" style={{ marginBottom: 16 }}>
              {s.running ? 'ENGINE RUNNING' : 'ENGINE STOPPED'} · {s.mode.slice(0, 3).toUpperCase()} · {s.waveform.toUpperCase()} ·
              GATE {s.mode === 'isochronic' ? `${Math.round(s.gateDuty * 100)}%` : '—'} · OUT {s.volumeDb.toFixed(1)} dBFS
            </div>
            <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 12, marginTop: 'auto' }}>
              <p className="t-caption text-3" style={{ marginBottom: 8 }}>
                Beat percept: verified psychoacoustics (Dove 1839; Oster 1973). Cortical entrainment at this setting:
                unproven — 8 of 14 EEG studies contradict (Ingendoh 2023). Behavioral effects, when found, are modest
                (g≈0.4).
              </p>
              <GradeBadge
                grade="C"
                compact
                citation={{
                  verdict: 'Entrainment claim unproven at this setting.',
                  summary: 'Percept itself is Grade A psychoacoustics; EEG entrainment is contradicted by 8/14 studies.',
                  source: 'Ingendoh et al., PLOS ONE (2023); Oster, Scientific American 229(4) (1973)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ROW B — Visualizer (tabbed scope/spectrum/correlation) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.15 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <Visualizer height={isMobile ? 280 : 560} />
        </motion.div>

        {/* ROW C — Visualization row: big live scope (left) + cymatics panel
            (right). Stacked on mobile, scope first (DOM order = visual order). */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.18 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 8' }}>
          <StudioScope height={isMobile ? 220 : 260} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.2 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
          <StudioCymatics height={260} />
        </motion.div>

        {/* ROW D — Noise mixer (master bypass: LED + label; bypassed = silent live, omitted from export) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.22 }} style={{ gridColumn: isMobile ? 'span 1' : 'span 5' }}>
          <Panel
            title="NOISE MIXER"
            right={
              <button
                type="button"
                data-testid="noise-mixer-toggle"
                aria-pressed={s.noiseOn}
                onClick={() => s.setNoiseOn(!s.noiseOn)}
                className="chip flex items-center gap-2"
                style={{ height: 22, fontSize: 10 }}
                title={
                  s.noiseOn
                    ? 'Bypass the whole noise mixer — silent live and omitted from the WAV export (click-free ramp)'
                    : 'Enable the noise mixer — fader positions were kept'
                }
              >
                <Led state={s.noiseOn ? 'amber' : 'off'} />
                {s.noiseOn ? 'MIX ON' : 'BYPASSED'}
              </button>
            }
          >
            <div
              data-testid="noise-mixer-body"
              data-dimmed={s.noiseOn ? undefined : 'true'}
              style={{ opacity: s.noiseOn ? 1 : 0.45, transition: 'opacity 160ms' }}
            >
              <div className="flex justify-between" style={{ gap: 8 }}>
                {(Object.keys(NOISE_COLOR) as NoiseColor[]).map((c) => (
                  <div key={c} className="flex flex-col items-center gap-2" title={NOISE_SLOPE[c]}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: NOISE_COLOR[c] }} />
                    <Fader db={s.noiseDb[c]} onChange={(db) => s.setNoiseDb(c, db)} color={NOISE_COLOR[c]} label={c.toUpperCase()} height={110} />
                  </div>
                ))}
              </div>
              <p className="t-caption text-3" style={{ marginTop: 12 }}>
                Masking/relaxation aid — no entrainment claim. Double-click a fader to turn it off.
                {s.noiseOn ? '' : ' Bypassed: faders kept, but the mixer is silent live and excluded from export.'}
              </p>
            </div>
          </Panel>
        </motion.div>

        {/* ROW D — Layers + phases */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.25 }} className="flex flex-col gap-4" style={{ gridColumn: isMobile ? 'span 1' : 'span 7' }}>
          <Panel
            title="LAYERS"
            right={
              <button
                type="button"
                data-testid="layers-toggle"
                aria-pressed={s.layersOn}
                onClick={() => s.setLayersOn(!s.layersOn)}
                className="chip flex items-center gap-2"
                style={{ height: 22, fontSize: 10 }}
                title={
                  s.layersOn
                    ? 'Bypass both layers — silent live and omitted from the WAV export (click-free ramp)'
                    : 'Enable the layers — per-layer settings were kept'
                }
              >
                <Led state={s.layersOn ? 'teal' : 'off'} />
                {s.layersOn ? 'LAYERS ON' : 'BYPASSED'}
              </button>
            }
          >
            <div
              data-testid="layers-body"
              data-dimmed={s.layersOn ? undefined : 'true'}
              className="flex flex-col gap-3"
              style={{ opacity: s.layersOn ? 1 : 0.45, transition: 'opacity 160ms' }}
            >
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => s.setNature({ on: !s.nature.on })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Led state={s.nature.on ? 'teal' : 'off'} />
                </button>
                <span className="t-label" style={{ width: 110 }}>NATURE</span>
                <select
                  value={s.nature.kind}
                  onChange={(e) => s.setNature({ kind: e.target.value as (typeof NATURE_KINDS)[number] })}
                  className="font-mono2"
                  style={{ background: 'var(--ink-3)', color: 'var(--text-1)', border: '1px solid var(--line-1)', borderRadius: 2, fontSize: 11, padding: '3px 6px' }}
                >
                  {NATURE_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  min={-60}
                  max={0}
                  value={s.nature.db}
                  onChange={(e) => s.setNature({ db: parseFloat(e.target.value) })}
                  aria-label="Nature level"
                  style={{ flex: 1, accentColor: '#4F8C82' }}
                />
                <GradeBadge grade="B" compact citation={{ verdict: 'Relaxation evidence, not entrainment.', summary: 'Nature soundscapes have small human relaxation studies; no entrainment claim.', source: 'Evidence synthesis — see Knowledge Base' }} />
              </div>
              {/* Singing-bowl set (up to MAX_BOWLS rows) + the interval bell. */}
              <BowlSet />
              {s.layersOn ? null : (
                <p className="t-caption text-3">
                  Bypassed: per-layer settings kept, but nature and bowls are silent live and excluded from export.
                </p>
              )}
            </div>
          </Panel>
          <Panel title="SESSION PHASES" right={<InfoPopover featureId="phase-timeline" label="About the phase timeline" />}>
            <PhaseTimeline phases={s.phases} onChange={s.setPhases} playheadSec={s.running ? s.elapsedSec : 0} height={100} />
          </Panel>
        </motion.div>
      </div>

      {/* Save-as-preset modal */}
      {saveOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(11,12,13,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSaveOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.14 }}
            className="panel"
            style={{ width: 'min(380px, calc(100vw - 32px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="t-h3" style={{ marginBottom: 12 }}>
              Save as preset
            </h3>
            <input
              ref={saveInputRef}
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmSave();
              }}
              placeholder="Preset name"
              aria-label="Preset name"
              className="font-mono2"
              style={{ width: '100%', background: 'var(--ink-4)', border: '1px solid var(--line-2)', borderRadius: 2, color: 'var(--text-1)', padding: '8px 10px', fontSize: 13, marginBottom: 8 }}
            />
            <p className="t-caption text-3" style={{ marginBottom: 12 }}>
              Saved to this browser session with the auto-computed grade of its frequencies. Grade cannot be edited upward.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="chip chip-active"
                disabled={!saveName.trim() || saved}
                onClick={confirmSave}
              >
                {saved ? 'SAVED ✓' : 'SAVE'}
              </button>
              <button type="button" className="chip" onClick={() => setSaveOpen(false)}>
                CANCEL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/** Brainwave band indicator strip (studio.md B.2). */
function BandStrip({ beat }: { beat: number }) {
  const active = bandForBeat(beat);
  const min = 0.5;
  const max = 40;
  const pos = Math.min(1, Math.max(0, Math.log(Math.max(0.5, beat) / min) / Math.log(max / min)));
  return (
    <div title={beat > 40 ? 'Beyond beat-percept range' : undefined}>
      <div className="flex" style={{ width: 150, height: 8, border: '1px solid var(--line-1)', position: 'relative' }}>
        {BANDS.map((b) => {
          const a = Math.log(b.min / min) / Math.log(max / min);
          const c = Math.log(b.max / min) / Math.log(max / min);
          return (
            <div
              key={b.name}
              style={{
                position: 'absolute',
                left: `${a * 100}%`,
                width: `${(c - a) * 100}%`,
                top: 0,
                bottom: 0,
                background: `${BAND_COLOR[b.name]}${active === b.name ? 'aa' : '33'}`,
              }}
            />
          );
        })}
        {/* position marker */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            bottom: -2,
            width: 2,
            background: '#fff',
            left: `${pos * 100}%`,
            transition: 'left 200ms',
          }}
        />
      </div>
      <div className="t-label" style={{ color: active ? BAND_COLOR[active] : 'var(--danger)', marginTop: 4, textAlign: 'center' }}>
        {beat > 40 ? 'BEYOND RANGE' : active?.toUpperCase() ?? '—'}
      </div>
    </div>
  );
}
