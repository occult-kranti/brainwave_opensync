import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowUpRight, Pause, Play, SlidersHorizontal, Square, Volume2, VolumeX, Waves } from 'lucide-react';
import { PRESETS } from '@/data/presets';
import { OVERNIGHT_PRESETS } from '@/data/overnightPractice';
import { useSession } from '@/ui/session/useSession';
import { fmtClock } from '@/ui/session/sessionMath';
import { INFANT_MAX_VOLUME_DB } from '@/ui/session/sessionDefaults';
import { CymaticsOverlay } from '@/ui/components/CymaticsOverlay';
import { assetUrl } from '@/lib/assetUrl';
import './experience.css';

export default function Listen() {
  const s = useSession();
  const [params] = useSearchParams();
  const requested = params.get('preset');
  const handled = useRef<string | null>(null);
  const [sand, setSand] = useState(false);
  const selected = PRESETS.find(p => p.id === requested);
  const adultBlocked = Boolean(selected && s.governor.infantMode && selected.category !== 'Infant');
  useEffect(() => {
    if (adultBlocked || !requested || !selected || handled.current === requested) return;
    handled.current = requested;
    s.stopPreview(); s.stop(); s.loadPreset(selected);
  }, [requested, selected, s, adultBlocked]);
  const preset = PRESETS.find(p => p.title === s.presetName) ?? (s.presetName?.includes(' min audio — experimental tier') ? OVERNIGHT_PRESETS.find(p => p.title.split(' · ')[0] === s.presetName?.split(' · ')[0]) : undefined);
  const headphones = (s.running && s.mode === 'binaural' && s.beatHz > 0) || s.phases.some(phase => (phase.mode ?? s.mode) === 'binaural' && phase.beatHz > 0);
  const name = (s.presetName ?? 'Your sound space').replace(/ — experimental tier$/, '');
  const isNight = preset?.category === 'Sleep' || preset?.category === 'Lucid Dream' || preset?.id.startsWith('night-') || preset?.id.includes('dream');
  const remaining = Math.max(0, Math.min(s.fadeEndsAtSec ?? Infinity, s.limitMin * 60) - s.elapsedSec);
  const progress = Math.min(100, s.elapsedSec / Math.max(1, s.limitMin * 60) * 100);
  const state = s.panicked ? 'All sound stopped' : s.running ? s.paused ? 'Paused · take your time' : s.fading ? 'Fading gently to quiet' : 'Listening' : 'Ready when you are';
  return <div className="listen-page">
    <div className="listen-topline"><Link to="/presets"><ArrowLeft size={16} />Explore sounds</Link><Link to="/studio"><SlidersHorizontal size={16} />Customize sound</Link></div>
    {adultBlocked && <p role="status" className="listen-notice">Infant mode is active. This adult practice has not been loaded. <Link to="/presets">Open the infant collection.</Link></p>}
    {requested && !selected && <p role="status" className="listen-notice">That sound could not be found. Your current session is unchanged. <Link to="/presets">Choose another sound.</Link></p>}
    <div className="listening-stage">
      <div className="listen-art"><img src={assetUrl(isNight ? 'art/night-country.webp' : 'art/quiet-horizon.webp')} alt={isNight ? 'A quiet painted desert under a crescent moon' : 'A painted lake beneath blue mountain ridges'} width="1536" height="1024" /><button onClick={() => setSand(true)} className="sand-launch"><Waves size={17} />Watch the sand</button></div>
      <section className="listen-controls" aria-label="Session player"><span className="overline" data-testid="listen-state">{state}</span><h1>{name}</h1><p className="listen-description">{preset?.purpose ?? 'A little space to listen. Your current sound and session settings are ready.'}</p>
        <div className="listen-meta"><span>{s.limitMin} min</span><span>{headphones ? 'Stereo headphones' : 'Speakers or headphones'}</span>{s.presetGrade && <span>Evidence {s.presetGrade}{s.presetGrade === 'D' ? ' · experimental' : ''}</span>}</div>
        <div className="listen-time"><span>{fmtClock(remaining)}</span><span>remaining</span></div><div className="listen-progress" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>
        <div className="listen-transport"><button className="listen-play" disabled={s.panicked} onClick={() => s.running ? s.togglePause() : s.start()}>{s.running && !s.paused ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}{s.running ? s.paused ? 'Resume session' : 'Pause session' : 'Play session'}</button><button className="listen-stop" disabled={!s.running && !s.previewId} onClick={() => { s.stopPreview(); s.stop(); }}><Square size={17} />Stop</button></div>
        <div className="listen-volume"><button aria-label={s.muted ? 'Unmute sound' : 'Mute sound'} onClick={() => s.setMuted(!s.muted)}>{s.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button><label htmlFor="listen-volume">Volume<input id="listen-volume" type="range" min={-60} max={Math.min(-6, s.governor.maxGainDbFs, s.governor.infantMode ? INFANT_MAX_VOLUME_DB : -6)} step={1} value={s.volumeDb} onChange={e => s.setVolumeDb(Number(e.target.value))} /></label><output htmlFor="listen-volume">{s.muted ? 'Muted' : `${s.volumeDb} dBFS`}</output></div>
        <p className="listen-small">Start with low device volume. You can pause or stop at any time.</p>
        {(s.startBlocked.length > 0 || s.interrupted) && <p role="status" className="listen-notice">{s.interrupted ? 'Playback was interrupted. Resume the session when you are ready.' : s.startBlocked.join(' ')} <Link to="/safety">Review listening settings</Link></p>}
      </section>
    </div>
    <div className="listen-below"><details><summary>About this sound</summary><p>{preset?.rationale ?? 'This is your current Studio mix. Open Customize sound to inspect its frequencies, layers and phase sequence.'}</p>{preset?.citations && <ul>{preset.citations.map(c => <li key={c}>{c}</li>)}</ul>}<p>{s.dirty ? 'You have edited this session in Studio. The original preset description may no longer describe every sound setting.' : 'These are original listening designs. No particular mental state or health outcome is guaranteed.'}</p></details><Link to="/studio">Make this sound your own <ArrowUpRight size={18} /></Link><Link to="/overnight">Set up a night of listening <ArrowUpRight size={18} /></Link></div>
    {sand && <CymaticsOverlay onClose={() => setSand(false)} />}
  </div>;
}
