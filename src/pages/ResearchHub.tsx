import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ToolDirectory } from '@/ui/components/ToolDirectory';
import { assetUrl, projectUrl } from '@/lib/assetUrl';
import './experience.css';
import './atlas-library.css';

/** One searchable index for the complete workshop and its reading material. */
export default function ResearchHub() {
  return <div className="editorial-page research-hub atlas-directory">
    <header className="atlas-directory-heading"><h1>Tools & notes.</h1><p>Make a sound, inspect a signal, or follow an idea to its source. Every Open Sync tool and reading page is here.</p></header>
    <nav className="atlas-directory-jumps" aria-label="Common research tasks">
      <Link to="/sample-lab"><span>Inspect a recording<small>Waveforms, spectra & loudness</small></span><ArrowUpRight size={20} /></Link>
      <Link to="/quicklab"><span>Compare two sounds<small>A small listening experiment</small></span><ArrowUpRight size={20} /></Link>
      <Link to="/knowledge"><span>Understand the basics<small>Sound, perception & evidence</small></span><ArrowUpRight size={20} /></Link>
    </nav>
    <div id="tools" className="research-tools"><ToolDirectory /></div>
    <section className="atlas-reading-guide" aria-labelledby="atlas-reading-title">
      <div><h2 id="atlas-reading-title">A good question<br />needs a clear source.</h2><p>Evidence grades describe support for a particular claim, not how good a sound is. A historical document records what someone proposed; it does not establish that it worked.</p><Link to="/knowledge">Understand the evidence grades <ArrowRight size={17} /></Link></div>
      <div className="atlas-reading-links">
        <Link to="/hypnosis"><span>Attention, suggestion & the edge of sleep<small>Start with the practice and its research limits.</small></span><ArrowRight size={18} /></Link>
        <Link to="/theory"><span>Trace a claim to its assumptions<small>Follow its sources and alternative explanations.</small></span><ArrowRight size={18} /></Link>
        <Link to="/traditions"><span>Explore programs & traditions<small>Archives, primary texts and reconstruction limits.</small></span><ArrowRight size={18} /></Link>
      </div>
    </section>
    <footer className="editorial-footer"><a data-testid="everyday-link" href={assetUrl('app/')}>Simple player · separate listening view <ArrowUpRight size={15} /></a><a href={projectUrl('previous/')}>Previous listening room <ArrowUpRight size={15} /></a><Link to="/presets?collection=bashar" data-testid="home-bashar-link">Bashar experimental collection</Link></footer>
  </div>;
}
