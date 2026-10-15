import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, Clock3, Headphones, Leaf } from 'lucide-react';
import { PRACTICE_GOALS } from '@/data/listeningPractice';
import { suggestSessions, needsHeadphones } from '@/data/sessionSuggestions';
import { useSession } from '@/ui/session/useSession';
import { presetDisplayName } from '@/ui/components/presetPresentation';
import './practice.css';

export default function Meditate() {
  const [params, setParams] = useSearchParams();
  const goal = PRACTICE_GOALS.find((g) => g.id === params.get('goal')) ?? PRACTICE_GOALS[0];
  const [minutes, setMinutes] = useState(10);
  const [headphones, setHeadphones] = useState(false);
  const [experimental, setExperimental] = useState(false);
  const session = useSession();
  const navigate = useNavigate();
  const suggestions = suggestSessions({ goal: goal.id, minutes: Math.min(minutes, session.governor.maxSessionMin), headphones, experimental, infantMode: session.governor.infantMode });
  const load = (item: typeof suggestions[number]) => {
    session.stopPreview(); session.stop();
    // Put the selected cap in the loaded spec so it also applies when replacing
    // a running session whose React closure still has the previous time limit.
    session.loadPreset({ ...item.preset, spec: { ...item.preset.spec, limitMin: item.minutes } });
    navigate('/listen');
  };
  return <div className="practice-page">
    <header className="practice-heading"><span className="eyebrow"><Leaf size={15} /> Your next few minutes</span>
      <h1>Which meditation<br />should I do right now?</h1>
      <p>Start with how you want to spend this time. We’ll match a sound to your intention, your time, and your setup.</p>
    </header>
    <div className="suggestion-layout">
      <section className="preference-panel" aria-label="Session preferences">
        <fieldset><legend>01 <span>What brings you here?</span></legend><div className="intention-options">
          {PRACTICE_GOALS.map((g) => <button key={g.id} type="button" aria-pressed={goal.id === g.id} onClick={() => setParams({ goal: g.id })}><strong>{g.title}</strong><span>{g.description}</span></button>)}
        </div></fieldset>
        <fieldset><legend>02 <span>How much time do you have?</span></legend><div className="choice-row">{[5, 10, 15, 20, 30].map((n) => <button key={n} aria-pressed={minutes === n} onClick={() => setMinutes(n)}>{n} min</button>)}</div></fieldset>
        <fieldset><legend>03 <span>How will you listen?</span></legend><div className="choice-row"><button aria-pressed={!headphones} onClick={() => setHeadphones(false)}>Speakers</button><button aria-pressed={headphones} onClick={() => setHeadphones(true)}>Headphones</button></div></fieldset>
        <details className="quiet-disclosure"><summary>Include experiments</summary><label className="check-row"><input type="checkbox" checked={experimental} onChange={(e) => setExperimental(e.target.checked)} />Include experimental and grade D sounds</label><p>These proposed effects are unestablished. They are optional listening comparisons.</p></details>
      </section>
      <section className="suggestion-results" aria-label="Suggested sessions" aria-live="polite">
        {session.governor.infantMode ? <div className="suggestion-card"><h2>Adult practices are hidden</h2><p>Infant mode is active. Use the separate infant collection and its listening limits.</p><Link to="/presets">Open infant presets</Link></div> : suggestions.length ? suggestions.map((item, index) => <article className={`suggestion-card ${index === 0 ? 'suggestion-featured' : ''}`} key={item.preset.id}>
          <span className="eyebrow">{index === 0 ? 'A place to begin' : 'Another way in'} · Grade {item.preset.grade}</span>
          <h2>{presetDisplayName(item.preset)}</h2><p>{item.preset.purpose ?? item.preset.rationale}</p>
          <div className="session-meta"><span><Clock3 size={15} /> {item.minutes} min{item.shortened ? ' · shortened' : ''}</span><span><Headphones size={15} />{needsHeadphones(item.preset) ? 'Headphones' : 'Any setup'}</span></div>
          <p className="match-reason">{item.reason}</p>
          <button className={index === 0 ? 'practice-primary' : 'practice-text-button'} onClick={() => load(item)}>Set up this session <ArrowRight size={16} /></button>
          {index === 0 && <p className="small-note">You choose when to press Play. Start with low device volume.</p>}
          <details className="quiet-disclosure"><summary>Sound, evidence & limits</summary><p>{item.preset.rationale}</p><ul>{item.preset.citations.map((c) => <li key={c}>{c}</li>)}</ul></details>
        </article>) : <div className="suggestion-card"><h2>No match with these settings</h2><p>Try more time or browse the complete collection.</p><Link to="/overnight">Plan an overnight session</Link><Link to="/presets?collection=all">All presets</Link></div>}
        <p className="small-note">Matches use your choices and the preset catalog. This is not a health assessment or a measurement of your mental state.</p>
      </section>
    </div>
    <section className="practice-next"><h2>Go a little deeper</h2><Link to={goal.route}>Explore {goal.title.toLowerCase()} <ArrowRight size={17} /></Link><Link to="/overnight">Plan an overnight session</Link><Link to="/presets?collection=all">Every sound in the collection</Link><Link to="/hypnosis">Hypnosis, dreaming & the science of sound</Link></section>
  </div>;
}
