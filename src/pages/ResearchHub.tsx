import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { ToolDirectory } from '@/ui/components/ToolDirectory';
import { assetUrl, projectUrl } from '@/lib/assetUrl';
import './experience.css';

export default function ResearchHub() {
  return <div className="editorial-page research-hub">
    <header className="editorial-heading"><span className="overline">The reading room</span><h1>Stay <em>curious.</em><br />Look a little closer.</h1><p>Sound has a rich history and a growing science. Explore both, with the evidence and the uncertainties in view.</p></header>
    <section className="reading-feature"><div className="reading-feature-art"><BookOpen size={68} strokeWidth={.8} /><span>FIELD NOTES<br />ON SOUND & THE MIND</span></div><div><span className="overline">Start with the foundations</span><h2>What can a frequency actually do?</h2><p>Hear the difference between a pitch, a beat and a pulse. Explore hypnosis, the edge of sleep and the mathematics that describes a sound—then see where the evidence stops.</p><Link className="journey-button" to="/hypnosis">Read & explore <ArrowRight size={17} /></Link></div></section>
    <section className="reading-index" aria-label="Research collections">{[
      ['/bashar-research', 'BR', 'Bashar: statements & mechanisms', 'Transcripts, attribution limits and typed connections to primary physics research.'],
      ['/frequency-hypotheses', 'FH', 'Frequency hypothesis workshop', 'Three virtual models, eight proposed tests and quiet listening references.'],
      ['/levitation', 'LV', 'Forces, fields & levitation', 'Acoustic and magnetic benches, government records, quantum research and four listening illustrations.'],
      ['/newton-tesla', 'NT', 'Newton–Tesla research network', 'Primary texts, patents, typed connections and mathematical device models with explicit limits.'],
      ['/sound-research', '00', 'The sound research bench', 'Interactive signal models, recent studies, books, product claims and twelve original listening variations.'],
      ['/traditions', '01', 'Programs, books & traditions', 'Government archives, Russian and Chinese research, and esoteric texts. Original experiments with a clear distinction between history and validation.'],
      ['/overnight', '02', 'The overnight notebook', 'Seven-hour plans, speaker listening, lucid-dream cues and why more sound is not always better sleep.'],
      ['/nano-lab', '03', 'Inside a sound', 'Compare two-tone beats, amplitude modulation, baseband and carrier controls in NanoLab. Inspect the actual spectrum.'],
      ['/lucid', '04', 'The dreaming mind', 'Cue research, sleep timing, dream recall and the limits of an open-loop soundtrack.'],
      ['/healing', '05', 'Sound & comfort', 'Singing bowls, vibroacoustics and healing traditions, with measured doses and research limitations.'],
      ['/theory', '06', 'Follow a claim to its source', 'Trace assumptions, critique studies and find the questions that are still open.'],
    ].map(([to, n, title, copy]) => <Link to={to} key={to}><span className="reading-number">{n}</span><div><h2>{title}</h2><p>{copy}</p></div><ArrowUpRight size={22} /></Link>)}</section>
    <div className="evidence-key"><strong>How to read the evidence</strong><p>Grades describe support for a particular claim, not the quality of a sound. Historical documents record what someone proposed; they do not establish that it worked. Experimental listening recipes are labeled accordingly.</p><Link to="/knowledge">Understand the evidence grades <ArrowRight size={15} /></Link></div>
    <div id="tools" className="research-tools"><ToolDirectory /></div>
    <footer className="editorial-footer"><a data-testid="everyday-link" href={assetUrl('app/')}>Simple player · separate listening view ↗</a><a href={projectUrl('previous/')}>Previous listening room ↗</a><Link to="/presets?collection=bashar" data-testid="home-bashar-link">Bashar experimental collection</Link></footer>
  </div>;
}
