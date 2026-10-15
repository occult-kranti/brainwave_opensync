import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BookOpen, ArrowRight } from 'lucide-react';
import { PRACTICE_PRESETS, PRACTICE_SOURCES } from '@/data/listeningPractice';
import { useSession } from '@/ui/session/useSession';
import { getPresetById } from '@/data/presets';
import './practice.css';

const findings: { title: string; grade: string; text: string; limit: string; source: keyof typeof PRACTICE_SOURCES }[] = [
  { title: 'Hypnotic suggestion can change sleep in selected participants', grade: 'B · specific human study', source: 'hypnosis',
    text: 'Cordi and colleagues used spoken suggestions before a monitored nap. Deep sleep increased in highly suggestible young women; responsiveness mattered.',
    limit: 'This was a verbal intervention in a selected population. It does not validate a theta soundtrack or predict your response.' },
  { title: 'Hypnosis involves attention networks, not a single frequency', grade: 'B · imaging study', source: 'networks',
    text: 'Jiang and colleagues compared hypnotic conditions using functional MRI. They found differences in activity and connectivity associated with hypnosis, especially in highly hypnotizable participants.',
    limit: 'Brain-network associations are not a recipe for selecting an audio frequency. No personal brain-state measurement is made here.' },
  { title: 'Binaural perception does not guarantee EEG entrainment', grade: 'C · inconsistent outcome evidence', source: 'beats',
    text: 'López-Caballero and Escera tested five beat rates. They found no corresponding enhancement of EEG power or changes in the measured arousal signals under their conditions.',
    limit: 'A null result under one protocol does not rule out every effect. It does rule out treating the frequency subtraction alone as proof of a mental-state change.' },
  { title: 'Sleep onset can be a useful window for creative insight', grade: 'B · task-specific evidence', source: 'creativity',
    text: 'Lacaux and colleagues studied a hidden-rule task around sleep onset. Brief N1 sleep was associated with a higher chance of finding the rule than staying awake or reaching deeper sleep.',
    limit: 'A laboratory task result is not a guarantee of insight. A timer cannot establish that you are in N1.' },
  { title: 'Dream incubation depends on cues and timing', grade: 'B · monitored protocol', source: 'incubation',
    text: 'Targeted dream incubation research presented theme-related auditory prompts around sleep onset and collected dream reports. Subsequent creative performance differed between study conditions.',
    limit: 'Our Dream edge sound has no biosensors, spoken prompts or sleep-stage detection. It is a personal imagery exercise, not a reproduction of this result.' },
  { title: 'Slow sound pulses can interfere with falling asleep', grade: 'B · state-dependent experiment', source: 'acoustic',
    text: 'Ngo and colleagues found that rhythmic 0.8 Hz acoustic stimulation delayed sleep onset, although slow oscillations increased once stable non-REM sleep was established.',
    limit: 'A rhythm beneficial during one measured sleep state may be unhelpful before sleep. Open Sync does not deliver closed-loop sleep stimulation.' },
];

export default function Hypnosis() {
  const [left, setLeft] = useState('180');
  const [right, setRight] = useState('186');
  const l = Number(left), r = Number(right);
  const valid = left.trim() !== '' && right.trim() !== '' && Number.isFinite(l) && Number.isFinite(r) && l >= 20 && r >= 20 && l <= 1000 && r <= 1000;
  const difference = Math.abs(r - l);
  const s = useSession();
  const navigate = useNavigate();
  const load = (id: string) => {
    const p = getPresetById(id);
    if (!p || s.governor.infantMode) return;
    s.stopPreview(); s.stop(); s.loadPreset(p); navigate('/listen');
  };
  return <div className="practice-page">
    <header className="practice-heading"><span className="eyebrow"><BookOpen size={15} /> Listening notes · reviewed 15 October 2026</span>
      <h1>At the edge<br />of wakefulness.</h1><p>Hypnosis, hypnagogia, sound and pattern. What we can calculate, what human studies suggest, and what remains an experiment.</p>
      <Link className="practice-text-button" to="/meditate?goal=hypnosis">Find a practice for now <ArrowRight size={16} /></Link>
      <Link className="practice-text-button" to="/traditions">Explore government programs, books & traditions <ArrowRight size={16} /></Link>
    </header>
    <section className="research-overview" aria-label="Three different experiences">
      <article><h2>Meditation</h2><p>A family of attention and awareness practices. A tone or bowl can serve as an optional focus for attention.</p></article>
      <article><h2>Hypnosis</h2><p>Focused attention and response to suggestions. Hypnosis is not simply sleep, and a soundtrack alone is not a complete hypnotic intervention.</p></article>
      <article><h2>Hypnagogia</h2><p>The transition toward sleep, sometimes with fleeting imagery or sounds. It is distinct from becoming lucid during a later REM dream. <a href={PRACTICE_SOURCES.dormio.url}>Dormio research ↗</a></p></article>
    </section>
    <details className="research-section" open><summary>Practices & new sounds</summary>
      <p style={{ marginTop: 16 }}>Original listening designs with quiet authored levels and an automatic stop. No spoken hypnosis, subliminal messages or clinical treatment is included.</p>
      {s.governor.infantMode && <p>Infant mode is active. These adult practices cannot be loaded.</p>}
      <div className="research-preset-list">{PRACTICE_PRESETS.filter((p) => ['practice-suggestion-space', 'practice-evening-rain', 'practice-theta-comparison', 'practice-dream-edge'].includes(p.id)).map((p) => <article key={p.id}><span className="eyebrow">{p.category} · Grade {p.grade}</span><h3>{p.title}</h3><p>{p.purpose}</p><button disabled={s.governor.infantMode} className="practice-text-button" onClick={() => load(p.id)}>Set up for listening <ArrowRight size={15} /></button><details className="quiet-disclosure"><summary>Why this sound?</summary><p>{p.rationale}</p></details></article>)}</div>
      <Link to="/presets?collection=practice">Browse all eight new listening practices</Link>
    </details>
    <details className="research-section"><summary>A simple self-hypnosis practice</summary>
      <p style={{ marginTop: 16 }}>An original, self-read attention exercise. It is not the script used in the cited trials. Use while resting somewhere safe, never while driving.</p>
      <ol><li>Choose a comfortable position. Pick silence or a quiet soundtrack; there is no required frequency.</li><li>Rest your attention on a fixed point or a soft sound. Let your breathing stay easy, without holding or forcing it.</li><li>If comfortable, close your eyes. Notice contact with the chair, your hands, and your feet.</li><li>Repeat one voluntary, ordinary suggestion, such as “For these few minutes, I can let my shoulders rest.” You can change or ignore it.</li><li>When ready, open your eyes, look around, and stretch. Stop sooner if the exercise feels uncomfortable or disorienting.</li></ol>
      <p>Keep the exercise in the present. Do not use it to recover supposedly hidden memories. For a health condition, work with a qualified clinician; a sound preset is not a substitute for care.</p>
    </details>
    <details className="research-section"><summary>Noticing hypnagogic imagery</summary>
      <ol><li>Use a natural rest window; do not cut your sleep short to create one.</li><li>Choose a neutral image or question and set it aside. Rest with silence or a low sound you enjoy.</li><li>If fragments of imagery appear, notice them without trying to force a dream or a particular state.</li><li>After resting, write a few words in your <Link to="/dream">dream journal</Link>. Record “nothing noticed” when that is what happened.</li></ol>
      <p>This is an informal observation, not an N1 detector or a lucid-dream induction. <a href={PRACTICE_SOURCES.dormio.url}>Dormio</a> used sensors and auditory feedback; <Link to="/lucid">Lucid Audio Lab</Link> covers later-stage cueing.</p>
    </details>
    <details className="research-section" open><summary>Is there mathematical backing?</summary>
      <p style={{ marginTop: 16 }}>Yes, for the signal. These equations describe sound and timing. They do not prove a therapeutic effect or reveal your EEG.</p>
      <h3>1. Two tones and their difference</h3>
      <div className="math-inputs"><label>Left tone · Hz<input type="number" min="20" max="1000" value={left} onChange={(e) => setLeft(e.target.value)} /></label><label>Right tone · Hz<input type="number" min="20" max="1000" value={right} onChange={(e) => setRight(e.target.value)} /></label></div>
      <output className="math-result" aria-live="polite">{valid ? <><strong>{Number(difference.toFixed(3))} Hz difference</strong>{difference > 0 ? `One difference cycle every ${Number((1 / difference).toFixed(3))} seconds.` : 'Identical tones: no difference beat.'}{difference > 30 && <p>This difference is beyond the usual low-rate binaural range. The arithmetic still holds; a binaural beat percept is not assured.</p>}</> : 'Enter two finite frequencies from 20 to 1000 Hz.'}</output>
      <code className="math-formula">f_difference = |f_right − f_left|</code>
      <p>Separate ears receive separate signals in binaural listening. The brain may perceive a beat; the air in each ear does not contain their physical sum.</p>
      <code className="math-formula">cos(2πf₁t) + cos(2πf₂t) = 2 cos(π(f₂−f₁)t) cos(2π((f₁+f₂)/2)t)</code>
      <p>When the tones mix acoustically, the signed envelope changes sign, but its loudness peaks repeat at |f₂−f₁|. This is why the audible beat rate is the difference, not half the difference.</p>
      <h3>2. Amplitude modulation and pulses</h3><code className="math-formula">x(t) = A[1 + m cos(2πfₘt)] cos(2πf꜀t), 0 ≤ m ≤ 1</code><p>Sinusoidal amplitude modulation produces a carrier at f꜀ and sidebands at f꜀ ± fₘ. Isochronic gating is a different envelope shape and includes extra harmonics. Neither equation supplies a validated “hypnosis frequency”.</p>
      <h3>3. Rhythms, intervals and patterns</h3><code className="math-formula">period = 1 / rate · cycles/minute = 60 × rate · 330/220 = 3/2</code><p>A 0.1 Hz pulse repeats every 10 seconds. A 3:2 pitch ratio is a musical interval, not a 0.1 Hz pulse or an EEG value. Sand patterns depict a simulated plate’s nodes; they do not measure healing, consciousness or a person’s vibration.</p>
      <Link to="/cymatics">Explore the plate simulation</Link> · <Link to="/analyzer">Measure the generated audio</Link>
    </details>
    <details className="research-section"><summary>Evidence notebook · six findings</summary>
      {findings.map((f) => <article key={f.title}><h3>{f.title}</h3><span className="eyebrow">{f.grade}</span><p>{f.text}</p><p><strong>Limit:</strong> {f.limit}</p><a href={PRACTICE_SOURCES[f.source].url} target="_blank" rel="noreferrer">{PRACTICE_SOURCES[f.source].title} ↗</a></article>)}
      <h3>Recent research: a lead, not validation</h3><p>A 2025 customized binaural-audio insomnia pilot appeared in the search. Only its abstract/search record was accessible during this review; its full methods could not be checked. It does not justify a clinically validated or personalized preset here.</p><a href={PRACTICE_SOURCES.current.url}>Lin et al. (2025) ↗</a>
    </details>
    <details className="research-section"><summary>Try a fair personal comparison</summary><ol><li>Choose one outcome before listening: comfort or perceived calm on a 0–10 scale.</li><li>Compare silence, the sound bed alone, and the same bed with a rhythm. Keep duration and device volume similar.</li><li>Vary the order across several days, record starting tiredness and expectations, and keep all results.</li><li>Compare within-person changes. A pleasant session is useful feedback, but it cannot establish EEG entrainment or treat a disease.</li></ol><Link to="/quicklab">Open Quick Lab</Link></details>
  </div>;
}
