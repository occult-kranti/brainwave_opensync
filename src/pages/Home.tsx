import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Headphones, Speaker, Check, Clock3, BookOpen, SlidersHorizontal } from 'lucide-react';
import { suggestSessions, needsHeadphones } from '@/data/sessionSuggestions';
import type { PracticeGoal } from '@/data/listeningPractice';
import { presetDisplayName } from '@/ui/components/presetPresentation';
import { assetUrl, projectUrl } from '@/lib/assetUrl';
import { useIsMobile } from '@/hooks/use-mobile';
import './atlas-home.css';

const MOODS: { goal: PracticeGoal; label: string; note: string }[] = [
  { goal: 'unwind', label: 'Unwind', note: 'Turn the day down a little.' },
  { goal: 'focus', label: 'Focus', note: 'Make room for one thing.' },
  { goal: 'sleep', label: 'Wind down', note: 'Ease into your evening.' },
  { goal: 'meditate', label: 'Meditate', note: 'Give your attention somewhere to rest.' },
];

export default function Home() {
  const isMobile = useIsMobile();
  const [goal, setGoal] = useState<PracticeGoal>('unwind');
  const [minutes, setMinutes] = useState(10);
  const [headphones, setHeadphones] = useState(false);
  const choice = suggestSessions({ goal, minutes, headphones, experimental: false })[0];
  const mood = MOODS.find(item => item.goal === goal)!;
  return <div className="atlas-home">
    <header className="atlas-home-heading">
      <h1>Find your<br /> <span>next sound.</span></h1>
      <div><p>A personal library for quiet time, focused work, and curious minds.</p><Link to="/presets?collection=all" className="atlas-inline-link">Browse the sound library <ArrowUpRight size={18} /></Link></div>
    </header>
    <section className="atlas-pick" aria-label="Find a sound">
      <div className="atlas-picker">
        <h2>What brings you here?</h2>
        <div className="atlas-moods" role="group" aria-label="Listening intention">
          {MOODS.map(item => <button key={item.goal} type="button" aria-pressed={goal === item.goal} onClick={() => setGoal(item.goal)}>{item.label}{goal === item.goal && <Check size={16} />}</button>)}
        </div>
        <p className="atlas-mood-note">{mood.note}</p>
        <details className="atlas-picker-options" open={!isMobile}><summary>{minutes} min · {headphones ? 'Headphones' : 'Speakers'}<span>Adjust <SlidersHorizontal size={15} /></span></summary>
        <fieldset className="atlas-time"><legend>How much time do you have?</legend><div>{[5,10,20,30].map(value => <button key={value} type="button" aria-pressed={minutes === value} onClick={() => setMinutes(value)}>{value}<span>min</span></button>)}</div></fieldset>
        <fieldset className="atlas-equipment"><legend>Listening with</legend><div><button type="button" aria-pressed={!headphones} onClick={() => setHeadphones(false)}><Speaker size={18} />Speakers</button><button type="button" aria-pressed={headphones} onClick={() => setHeadphones(true)}><Headphones size={18} />Headphones</button></div></fieldset>
        </details>
        <Link to="/meditate" className="atlas-inline-link">Help me choose <ArrowRight size={16} /></Link>
      </div>
      <div className="atlas-pick-result">
        <figure><img src={assetUrl('art/listening-atlas-cover.webp')} alt="" width={1774} height={887} fetchPriority="high" /><figcaption>Original sound, at your own pace.</figcaption></figure>
        {choice ? <article className="atlas-selection" aria-live="polite">
          <div className="atlas-selection-meta"><span><Clock3 size={15} />{choice.minutes} minutes</span><span>{needsHeadphones(choice.preset) ? 'Stereo headphones' : 'Any setup'}</span></div>
          <h2>{presetDisplayName(choice.preset)}</h2><p>{choice.preset.purpose ?? choice.preset.rationale}</p>
          <Link className="atlas-primary" to={`/listen?preset=${choice.preset.id}&minutes=${choice.minutes}`}>Open this sound <ArrowRight size={19} /></Link>
          <small>Loads quietly. Press Play when you’re ready.{choice.shortened ? ' This session will use your selected time limit.' : ''}</small>
        </article> : <article className="atlas-selection"><h2>Find a sound your way.</h2><p>Try headphones or browse the full library for more options.</p><Link to="/presets?collection=all" className="atlas-primary">Find a sound <ArrowRight size={18} /></Link></article>}
      </div>
    </section>
    <section className="atlas-home-routine" aria-labelledby="routine-heading"><div><h2 id="routine-heading">A practice that<br />fits your life.</h2><p>Decide when to listen, what to repeat, and when to leave room for quiet.</p></div><div className="atlas-routine-links"><Link to="/practice-plan"><span>Plan your next four weeks<small>A flexible home timetable, with sources and room to adjust.</small></span><ArrowUpRight size={23} /></Link><Link to="/overnight"><span>Settle in for the night<small>Build a night of sound, transitions, and quiet time.</small></span><ArrowUpRight size={23} /></Link><Link to="/presets?collection=hypnosis"><span>Explore hypnosis & dreaming<small>Find practices and read what their evidence can tell you.</small></span><ArrowUpRight size={23} /></Link></div></section>
    <section className="atlas-home-workbench" aria-labelledby="workbench-heading"><div className="atlas-workbench-intro"><SlidersHorizontal size={28} /><h2 id="workbench-heading">Take the sound<br />into your own hands.</h2><p>Make a mix, look at a signal, or follow an interesting question.</p><Link to="/studio" className="atlas-primary">Open Studio <ArrowRight size={18} /></Link></div><nav aria-label="Tools and reading"><Link to="/cymatics"><span>See sound take shape<small>Cymatics and the visual lab</small></span><ArrowUpRight size={20} /></Link><Link to="/analyzer"><span>Measure a signal<small>Waveform, spectrum, and comparison tools</small></span><ArrowUpRight size={20} /></Link><Link to="/research-hub#tools"><span>Browse the whole workbench<small>Every tool, source collection, and research note</small></span><ArrowUpRight size={20} /></Link></nav></section>
    <details className="atlas-home-reading"><summary><BookOpen size={20} />Follow your curiosity <span>Sources, questions & archives</span></summary><nav aria-label="Research collections"><Link to="/lucid" data-testid="home-lab-lucid">Dreaming & the mind <ArrowUpRight size={16} /></Link><Link to="/healing" data-testid="home-lab-healing">Sound & healing traditions <ArrowUpRight size={16} /></Link><Link to="/nature" data-testid="home-lab-nature">Patterns in nature <ArrowUpRight size={16} /></Link><Link to="/bashar-research">Bashar source studies <ArrowUpRight size={16} /></Link><Link to="/traditions">Programs & traditions <ArrowUpRight size={16} /></Link></nav></details>
    <footer className="atlas-home-footer"><p>Made for listening. Open to questions.</p><Link to="/guide">How it works</Link><Link to="/safety">Listening safely</Link><a href={projectUrl('previous/')}>Previous version</a><a href={projectUrl('')}>Original workspace</a></footer>
  </div>;
}
