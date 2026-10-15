import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Moon, ArrowRight, Volume2 } from 'lucide-react';
import { NIGHT_GOALS, NIGHT_MINUTES, NIGHT_RESEARCH, prepareNightPreset, type NightGoal } from '@/data/overnightPractice';
import { useSession } from '@/ui/session/useSession';
import { GradeBadge } from '@/ui/components/GradeBadge';
import './practice.css';
import './overnight.css';

export default function Overnight() {
  const [goal, setGoal] = useState<NightGoal>('sleep');
  const [continuous, setContinuous] = useState(false);
  const [headphones, setHeadphones] = useState(false);
  const [hint, setHint] = useState('');
  const session = useSession();
  const { stopPreview, governor } = session;
  const navigate = useNavigate();
  const intention = NIGHT_GOALS.find(g => g.id === goal)!;
  const preset = prepareNightPreset(goal, continuous, governor.maxSessionMin);
  const audioMinutes = preset.spec.limitMin!;
  const previewing = session.previewId === `preset:night-check-${goal}`;
  const previewBlocked = session.running || session.panicked || session.muted || governor.infantMode;
  useEffect(() => () => stopPreview(), [stopPreview]);
  const change = (action: () => void) => { stopPreview(); setHint(''); action(); };
  const test = () => {
    if (previewing) { stopPreview(); return; }
    if (!session.advisoryAcknowledged) { session.openAdvisory(); setHint('Read the listening advisory, then press Test sound again.'); return; }
    session.previewPreset({ ...preset, id: `night-check-${goal}`, spec: { ...preset.spec, phases: [{ ...preset.spec.phases[0], durationSec: 8 }] } });
  };
  const load = () => {
    stopPreview(); session.stop(); session.loadPreset(preset); session.setFadeOutSec(60); navigate('/studio');
  };
  return <div className="practice-page overnight-page">
    <header className="practice-heading"><span className="eyebrow"><Moon size={15} /> The overnight collection</span><h1>Make room for a quieter night.</h1><p>A seven-hour listening plan, shaped around your intention. Start with a short wind-down, or explicitly choose continuous sound.</p></header>
    {governor.infantMode ? <section className="research-section"><h2>Adult overnight plans are hidden in infant mode.</h2><p>Your current listening limits stay in place.</p><Link to="/safety">Review listening settings</Link></section> : <div className="suggestion-layout">
      <div className="preference-panel">
        <fieldset><legend>01 <span>Choose an intention</span></legend><div className="intention-options">{NIGHT_GOALS.map(g => <button key={g.id} aria-pressed={goal === g.id} onClick={() => change(() => setGoal(g.id))}><strong>{g.title}</strong><span>{g.texture ? `${g.texture} & steady tone` : 'A simple steady tone'}</span></button>)}</div></fieldset>
        <fieldset><legend>02 <span>Choose how long sound plays</span></legend><div className="night-duration-options"><button aria-pressed={!continuous} onClick={() => change(() => setContinuous(false))}><strong>Wind down, then quiet</strong><span>30 min sound · 6 h 30 min quiet · default</span></button><button aria-pressed={continuous} onClick={() => change(() => setContinuous(true))}><strong>Continuous · 7 hours</strong><span>Experimental · sound throughout the plan</span></button></div><p className="small-note">Quiet means the player stops and stays off. No alarm, REM cues or automatic restart. You can keep sleeping after the plan ends.</p></fieldset>
        <fieldset><legend>03 <span>Check your listening setup</span></legend><div className="choice-row"><button aria-pressed={!headphones} onClick={() => change(() => setHeadphones(false))}>Speakers</button><button aria-pressed={headphones} onClick={() => change(() => setHeadphones(true))}>Headphones</button></div><p className="small-note">{headphones ? 'These presets need no ear separation. Check physical comfort before choosing headphones overnight; speakers are the default.' : 'A single speaker works: both channels carry the same tone and rhythm. Set a low, comfortable device volume while awake.'} Digital dBFS is not a measured level at your ear.</p><button className="practice-text-button" disabled={previewBlocked} onClick={test}><Volume2 size={16} /> {previewing ? 'Stop test sound' : 'Test sound · 8 s'}</button>{previewBlocked && <p className="small-note">Stop the active session and clear mute or panic before testing sound.</p>}{hint && <p role="status" className="small-note">{hint}</p>}</fieldset>
      </div>
      <section className="suggestion-card suggestion-featured night-plan" aria-label="Your overnight plan">
        <span className="eyebrow">Your night, at a glance</span><h2>{intention.title}</h2><GradeBadge grade="D" citation={{ verdict: 'Original overnight recipe · experimental tier', summary: intention.limit, source: intention.source }} />
        <p className="night-sound">{intention.pitch} Hz steady tone{intention.texture ? ` + ${intention.texture}` : ''}<br />Speaker-compatible · no voice or binaural beat</p>
        <div className="night-timeline" role="img" aria-label={`${audioMinutes} minutes of sound, then ${NIGHT_MINUTES - audioMinutes} minutes quiet within a seven-hour plan`}><span style={{ flex: audioMinutes }} /><span style={{ flex: NIGHT_MINUTES - audioMinutes }} /></div>
        <div className="night-timeline-labels"><span>Start</span><span>7 hours</span></div>
        <dl className="night-facts"><div><dt>Sound stops after</dt><dd>{audioMinutes === 420 ? '7 hours' : `${audioMinutes} min`}</dd></div><div><dt>Final fade</dt><dd>60 seconds</dd></div><div><dt>Quiet remainder</dt><dd>{Math.floor((420 - audioMinutes) / 60)} h {(420 - audioMinutes) % 60} min</dd></div></dl>
        {audioMinutes < (continuous ? 420 : 30) && <p role="status">Your existing session cap shortens the sound to {audioMinutes} minutes. <Link to="/safety">Review your limit</Link>.</p>}
        <p>{intention.practice}</p><p className="match-reason">{intention.limit}</p>
        <button className="practice-primary" onClick={load}>Set up this night <ArrowRight size={16} /></button><p className="small-note">Opens Studio, stopped and ready. Your volume will never be raised. Press Play when ready.</p>
        <details className="quiet-disclosure"><summary>Before leaving it overnight</summary><p>A browser can suspend audio when the screen locks, the app loses focus, or the device changes power state. Test your actual device first; this is not a guaranteed overnight player or alarm.</p><p>Keep listening comfortable and stop if sound fragments your sleep. Seven hours is a plan length, not a prescription: adults commonly need seven to nine hours of actual sleep. This page adds no wake-up interruptions.</p><p>Use live playback for long sessions. Full seven-hour PCM16 audio at 48 kHz would require about 4.84 GB before working memory; browser WAV export rejects oversized renders. You can save the lightweight session settings instead.</p></details>
      </section>
    </div>}
    <section className="night-reading" aria-labelledby="night-reading-title"><span className="eyebrow">Theory, practice & sources</span><h2 id="night-reading-title">What belongs in a night plan?</h2><p>Sound timing is measurable. Sleep stages, hypnosis and dream content are not determined by a frequency label. This is a targeted review through 15 October 2026, with access limits shown; it is not an exhaustive survey of every government program.</p>
      {['Sleep & sound', 'Dream research', 'Government & traditions'].map(group => <details key={group} className="research-section"><summary>{group}</summary><div className="sourcebook-grid">{NIGHT_RESEARCH.filter(s => s.group === group).map(s => <article className="sourcebook-entry" key={s.title}><span className="eyebrow">{s.status}</span><h3>{s.title}</h3><p>{s.finding}</p><p><strong>Design implication:</strong> {s.consequence}</p><a href={s.url} target="_blank" rel="noreferrer">Read source ↗</a>{'extra' in s && <> · <a href={s.extra} target="_blank" rel="noreferrer">University report ↗</a></>}</article>)}</div></details>)}
      <details className="research-section"><summary>Frequency mathematics, without a sleep-stage promise</summary><p>Seven hours = 25,200 seconds. A 120 Hz tone repeats 120 times each second; that does not imply a 120 Hz EEG rhythm. A modulation rate describes an acoustic envelope, not the timing of a REM episode.</p><p>Fixed 90-minute blocks cannot establish your sleep stage. Closed-loop studies use measured physiological signals; this page uses only elapsed time. Continuous presets therefore avoid fabricated REM windows and repeated wake cues.</p><p>At the same measured acoustic level, seven hours carries fourteen times the sound energy of thirty minutes: 10 log₁₀(14) ≈ 11.46 dB in equal-energy terms. That is exposure arithmetic, not a prediction of sleep quality or a way to infer sound pressure from the app fader.</p></details>
    </section>
    <nav className="practice-next" aria-label="Continue exploring"><Link to="/presets?collection=overnight">All seven-hour presets →</Link><Link to="/traditions">Russia, China & government sourcebook →</Link><Link to="/hypnosis">Hypnosis & hypnagogia →</Link><Link to="/dream">Dream journal & advanced experiments →</Link><Link to="/nano-lab">NanoLab signal presets →</Link></nav>
  </div>;
}
