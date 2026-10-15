import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Moon, Sun, Wind } from 'lucide-react';
import { PRACTICE_GOALS } from '@/data/listeningPractice';
import { projectUrl } from '@/lib/assetUrl';
import './experience.css';

export default function Home() {
  return <div className="today-page editorial-page">
    <header className="editorial-heading"><span className="overline">A little time, just for you</span><h1>Come back to <em>yourself.</em></h1><p>Sounds for a quieter mind, a curious spirit, and the moments in between.</p></header>
    <div className="today-feature-layout">
      <section className="today-feature" aria-labelledby="today-feature-title">
        <div className="today-landscape" aria-hidden="true" />
        <div className="today-feature-copy"><div><span className="overline">Begin here · 5 minutes · Speakers or headphones</span><h2 id="today-feature-title">A soft place to land.</h2><p>Gentle rain. A low, steady tone. A few minutes with nothing to do.</p></div><Link className="journey-button" to="/listen?preset=practice-soft-landing">Settle in <ArrowRight size={18} /></Link></div>
      </section>
      <section className="today-checkin" aria-labelledby="checkin-title"><Sun size={25} strokeWidth={1.2} /><span className="overline">Your next practice</span><h2 id="checkin-title">What do you<br />need right now?</h2><p>A session that fits your intention, your time and the way you listen.</p><div className="checkin-options">{PRACTICE_GOALS.slice(0, 3).map(g => <Link key={g.id} to={`/meditate?goal=${g.id}`}>{g.title}<ArrowUpRight size={16} /></Link>)}</div><Link className="checkin-all" to="/meditate">Help me choose <ArrowRight size={17} /></Link></section>
    </div>
    <section className="today-paths" aria-labelledby="paths-title"><div className="section-title"><h2 id="paths-title">Make room for your kind of quiet.</h2><Link to="/presets?collection=all">Explore all sounds <ArrowRight size={16} /></Link></div>
      <div className="listening-paths">
        <Link to="/listen?preset=practice-bowl-attention" className="listening-path path-breath"><span className="path-symbol"><Wind size={34} strokeWidth={1} /></span><div><span className="overline">Meditate · 10 min</span><h3>Bowl & breath</h3><p>Let each fading note bring you back.</p></div><ArrowUpRight size={22} /></Link>
        <Link to="/listen?preset=practice-steady-focus" className="listening-path path-focus"><span className="path-symbol"><Sun size={34} strokeWidth={1} /></span><div><span className="overline">Focus · 10 min</span><h3>One quiet task</h3><p>A steady sound. A single intention.</p></div><ArrowUpRight size={22} /></Link>
        <Link to="/listen?preset=practice-evening-rain" className="listening-path path-sleep"><span className="path-symbol"><Moon size={34} strokeWidth={1} /></span><div><span className="overline">Wind down · 15 min</span><h3>Evening rain</h3><p>Take the day a little more slowly.</p></div><ArrowUpRight size={22} /></Link>
      </div>
    </section>
    <section className="night-invitation"><div className="night-scene" aria-hidden="true"><Moon size={52} strokeWidth={.8} /><span>A slower kind of evening</span></div><div><span className="overline">When the day is done</span><h2>Leave a little<br />space for dreaming.</h2><p>Plan a seven-hour night, with a gentle beginning and room for silence. Explore sleep, dream recall and the ideas behind them.</p><Link className="journey-button journey-button-light" to="/overnight">Plan your night <ArrowRight size={18} /></Link></div></section>
    <section className="today-reading"><div><span className="overline">For the curious</span><h2>Listen. Wonder. Understand.</h2><p>Follow the science, the histories and the open questions. Every source has a place; every claim has its limits.</p><Link className="inline-link" to="/research-hub">Enter the reading room <ArrowRight size={18} /></Link></div><nav aria-label="Explore practices and research"><Link to="/lucid" data-testid="home-lab-lucid"><span>01</span>Dreaming & the mind<ArrowUpRight size={17} /></Link><Link to="/healing" data-testid="home-lab-healing"><span>02</span>Sound, rest & healing traditions<ArrowUpRight size={17} /></Link><Link to="/nature" data-testid="home-lab-nature"><span>03</span>Patterns in the natural world<ArrowUpRight size={17} /></Link><Link to="/traditions"><span>04</span>Programs, books & archives<ArrowUpRight size={17} /></Link></nav></section>
    <footer className="editorial-footer"><span>Made for listening. Open to exploration.</span><div><Link to="/studio">Sound workshop</Link><Link to="/research-hub#tools">All tools</Link><a href={projectUrl('previous/')}>Previous version ↗</a></div><p>Original listening designs, not medical treatments. Open Sync creates audio; it does not measure your brain activity.</p></footer>
  </div>;
}
