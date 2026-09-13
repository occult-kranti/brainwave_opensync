/**
 * src/docs/features.ts — SINGLE SOURCE OF TRUTH for feature documentation.
 *
 * Every feature, graph, and meter in Open Sync gets exactly one entry here.
 * Home renders its module cards from this data; Guide renders both registers
 * from this data; the vitest suite audits this data for coverage and claim
 * discipline. No hand-written divergent copy anywhere else.
 *
 * Claim discipline: effects "bias toward" states — never stronger verbs.
 * Banned strings in user-facing fields (enforced by test):
 *   'induces', 'synchronizes', 'attunes', 'CIA-validated', 'digital drug'.
 */

import type { GradeLetter } from '@/ui/theme';

export interface PlotExplainer {
  /** What the axes and controls mean. */
  axes: string;
  /** What a healthy/good reading looks like. */
  good: string;
  /** What a warning/bad reading looks like and what to do. */
  bad: string;
}

export interface FeatureEntry {
  /** Stable unique id. */
  id: string;
  /** Grouping module name (Guide groups on this). */
  module: string;
  /** App route where the feature lives. */
  route: string;
  name: string;
  /** Plain language: what it does + how to use it. 2–3 sentences, no jargon. */
  simple: string;
  /** Technical register: DSP / physics / stats. 3–5 sentences. */
  deep: string;
  /** Evidence grade where the feature makes or embodies a claim. */
  grade?: GradeLetter;
  /** What the grade applies to (grade scope discipline). */
  gradeScope?: string;
  /** Step-by-step usage. */
  howTo: string[];
  /** Present when the feature contains a plot/graph/scope widget. */
  plot?: PlotExplainer;
  /** 'in-verification' = module announced, build in progress by another team. */
  status?: 'live' | 'in-verification';
}

/** Every routed screen in the app (test coverage target). */
export const APP_SCREENS: readonly { route: string; label: string }[] = [
  { route: '/', label: 'Home' },
  { route: '/guide', label: 'Guide' },
  { route: '/studio', label: 'Studio' },
  { route: '/library', label: 'Library' },
  { route: '/presets', label: 'Presets' },
  { route: '/levels', label: 'Levels' },
  { route: '/analyzer', label: 'Analyzer' },
  { route: '/safety', label: 'Safety' },
  { route: '/knowledge', label: 'Knowledge' },
  { route: '/about', label: 'About' },
  { route: '/lab', label: 'Experiment Lab' },
  { route: '/critique', label: 'Critique Library' },
  { route: '/hypotheses', label: 'Hypothesis Tracker' },
  { route: '/programs', label: 'Programs Archive' },
  { route: '/cymatics', label: 'Cymatic Studio' },
  { route: '/dream', label: 'Sleep & Dream' },
  { route: '/replication', label: 'Replication Bay' },
  { route: '/quicklab', label: 'Quick Lab' },
  { route: '/theory', label: 'Theory Explorer' },
  { route: '/sonic-lab', label: 'Sonic Lab' },
  { route: '/sample-lab', label: 'Sample Lab' },
  { route: '/harmonics', label: 'Harmonic Lab' },
  { route: '/sound-methods', label: 'Sound Methods' },
  { route: '/channeled', label: 'Channeled Sources' },
] as const;

const FEATURES_CORE: readonly FeatureEntry[] = [
  {
    id: 'sound-methods-player', module: 'Sound Methods', route: '/sound-methods', name: 'Published sound methods',
    grade: 'A', gradeScope: 'The generated signal and arithmetic only; patent claims and mental effects need separate evidence.',
    simple: 'Hear original examples based on Monroe patents and audio research. Change the settings, preview a sound, or export its WAV and recipe.',
    deep: 'A separate renderer makes tone pairs, amplitude envelopes, opposite stereo phase modulation, and deterministic filtered noise. Public patent examples are distinguished from chosen demonstration settings. Previews last up to thirty seconds; background WAV exports last up to five minutes. Both use the same output ceiling and fifty-millisecond edge fades, without reproducing commercial recordings or voice scripts.',
    howTo: ['Choose a sound and read its source note.', 'Start at low device volume, then press Play preview.', 'Change a setting or compare a second method.', 'Export the WAV and JSON settings to reproduce your result.'],
    plot: { axes: 'Left and right relative waveform amplitudes over forty milliseconds, after the initial fade.', good: 'The displayed signal matches the selected channel construction.', bad: 'The plot describes generated audio; it cannot measure a listener’s brain state.' },
  },
  {
    id: 'sound-methods-sources', module: 'Sound Methods', route: '/sound-methods', name: 'Patents, studies, and tools',
    simple: 'Read what each source describes and what it leaves untested. Filter patents, studies, and open-source tools, or search for a name.',
    deep: 'The collection links historical disclosures, the Gateway assessment, human studies, and software documentation. Patent descriptions establish a proposed signal method, not its effectiveness. Study entries separate auditory responses from mood, attention, or sleep outcomes. Software entries record checked licenses and gaps without importing third-party recordings.',
    howTo: ['Open Sources and tools.', 'Filter by source type or enter a search term.', 'Follow the original source and read the stated limitation.'],
  },
  {
    id: 'harmonic-composer', module: 'Harmonic Lab', route: '/harmonics', name: 'Harmonic composer',
    grade: 'A', gradeScope: 'Frequency arithmetic and digital synthesis only; no physiological outcome is established.',
    simple: 'Build a chord, shape its overtones, and hear a short musical phrase. Compare tunings and export the exact sound or its recipe.',
    deep: 'Each note follows an explicit ratio to the chosen root. Integer multiples form its harmonic spectrum, while equal temperament divides an octave logarithmically. Quiet previews and WAV exports use the same bounded renderer and gain. These calculations describe audio, not a measured brain state.',
    howTo: ['Choose a root, chord, and tuning.', 'Adjust relative overtones, then choose a chord, arpeggio, or progression.', 'Play a short preview, compare tunings, or export WAV and recipe files.'],
    plot: { axes: 'The component map shows predicted frequency on a logarithmic horizontal axis and unsummed per-voice weight vertically.', good: 'The frequency table and partial lines match the chosen ratios.', bad: 'Omitted out-of-band partials are reported; the plot is a prediction, not a microphone measurement.' },
  },
  {
    id: 'channeled-bashar-exhibit', module: 'Channeled Sources', route: '/channeled', name: 'Bashar source exhibit',
    grade: 'D', gradeScope: 'The channeled claims themselves; supplied digests are not independently verified transcripts.',
    simple: 'Read the frequency claims in the supplied Bashar summaries and the limits of those sources. Compare the numbers and listen to audio examples.',
    deep: 'The supplied digest gives several frequencies without a reproducible measurement method. Alpha and gamma activity can occur in the same recording. The page separates unverified source claims from calculations and audio demonstrations. Original transcripts and recordings are needed to check attribution and measurements.',
    howTo: ['Read the source and verification note.', 'Compare the reported quantities with the measurement audit.', 'Explore the experimental presets or mathematical bowl set.'],
  },
  {
    id: 'channeled-scale-mapping', module: 'Channeled Sources', route: '/channeled', name: 'Illustrative scale mapping',
    grade: 'A', gradeScope: 'The chosen k = 5,000 arithmetic only, anchored at 200,000 ↔ 40 Hz.',
    simple: 'Check a division whose constant was chosen to fit one reference point. Landing inside an EEG band does not validate the source scale.',
    deep: 'The free parameter k = 5,000 is chosen to map 200,000 to 40 Hz. Dividing the remaining source numbers produces reproducible values. This is a fitted illustration, not a measured conversion or independent prediction. Source interpretations remain Grade D.',
    howTo: ['Read the chosen anchor and free parameter.', 'Recalculate each row by dividing by 5,000.', 'Keep arithmetic and physiological interpretation separate.'],
  },
  // ------------------------------------------------------------- Home / Guide
  {
    id: 'home-landing',
    module: 'Home',
    route: '/',
    name: 'Home landing',
    simple:
      'Home explains the app and links to each module. Follow the quick start to play a session, or choose a card to explore.',
    deep:
      'The header animation illustrates a pair of tones; it is not a measurement of current audio. Module cards use the same feature descriptions as the Guide. Each summary badge shows the lowest evidence grade assigned within that module.',
    howTo: [
      'Read the app description below the header.',
      'Pick a module card, or follow the 60-second quick-start strip.',
      'Open the Guide any time you meet a meter you do not understand.',
    ],
  },
  {
    id: 'guide-itself',
    module: 'Guide',
    route: '/guide',
    name: 'This guide',
    simple:
      'A plain-language and a technical explanation of every screen and meter in the app. Flip the Simple / Deep Technical switch to change registers. Search to jump straight to a feature.',
    deep:
      'The Guide renders the same FeatureEntry records consumed by Home and by the test suite — one data source, two registers. Every plot widget entry carries an axes explainer plus explicit good/bad pattern notes. User-facing strings in this dataset are continuously tested for banned overclaim phrases and for readable sentence length.',
    howTo: [
      'Type a feature name (e.g. "LUFS" or "panic") into search.',
      'Read the Simple card first; switch to Deep Technical for the math.',
      'Follow the how-to steps on the card inside the live module.',
    ],
  },

  // ------------------------------------------------------------------- Studio
  {
    id: 'engine-binaural',
    module: 'Studio',
    route: '/studio',
    name: 'Binaural engine',
    grade: 'C',
    gradeScope: 'Beat percept is Grade A psychoacoustics; the cortical-entrainment claim is Grade C.',
    simple:
      'Plays one tone in your left ear and a slightly different tone in your right ear, so you hear a slow pulsing beat. Headphones are required. Set the carrier and beat knobs, then press Start Session.',
    deep:
      'The engine synthesizes fL and fR = fL + Δf; the perceived beat equals |fL − fR| and is constructed centrally where the two auditory pathways converge in the superior olivary complex — it does not exist in the air. The percept is robust for carriers at or below ~1 kHz and beats at or below ~30 Hz (Oster 1973), which is why the UI warns outside that domain. The stronger claim that the beat biases cortical oscillations toward the beat rate is contradicted by 8 of 14 controlled EEG studies (Ingendoh 2023) and behavioral effects, where found, are modest (g ≈ 0.4). Phase-lock mode restarts both oscillators at shared zero-crossings so interaural phase stays exact instead of drifting.',
    howTo: [
      'Put on headphones — the effect needs one tone per ear.',
      'Choose a beat rate and compare how it sounds; the rate does not measure your state.',
      'Keep the carrier between 100 and 400 Hz, set a comfortable volume, press Start Session.',
    ],
  },
  {
    id: 'engine-monaural',
    module: 'Studio',
    route: '/studio',
    name: 'Monaural engine',
    grade: 'B',
    gradeScope: 'Stronger physiological marker than binaural; behavioral benefit still modest.',
    simple:
      'Both tones are mixed together before they reach your ears, so the pulsing beat is physically present in the sound. It works on speakers, though headphones still help. Pick the Monaural tab in the Engine panel.',
    deep:
      'Monaural beats sum acoustically: cos(2πfLt) + cos(2πfRt) = 2·cos(πΔf·t)·cos(2πf̄t) — a carrier at the mean frequency amplitude-modulated at Δf. Because the modulation exists in the cochlear input, monaural beats evoke a stronger auditory steady-state response than binaural beats at matched settings (Orozco Perez 2020). No interaural comparison is needed, so speakers are sufficient. Entrainment-to-cognition claims inherit the same caution as binaural mode.',
    howTo: [
      'Select the MONAURAL tab in the Engine panel.',
      'Set carrier and beat exactly as you would for binaural.',
      'Use speakers or headphones; verify the beat on the Visualizer scope.',
    ],
  },
  {
    id: 'engine-isochronic',
    module: 'Studio',
    route: '/studio',
    name: 'Isochronic engine',
    grade: 'C',
    gradeScope: 'Strongest amplitude-modulation stimulus of the three modes; entrainment claim unproven.',
    simple:
      'A single tone that switches on and off at the beat rate, like a soft sonic metronome. It works on speakers and needs no headphones. Set the pulse speed with Beat and the on/off ratio with Gate.',
    deep:
      'An isochronic tone is a carrier multiplied by a periodic gate at the beat frequency; the Gate control sets duty cycle (5–95%) and the envelope is either raised-cosine (click-free) or hard (maximum modulation depth). Hard gating spreads sidebands at f ± n·Δf, while raised-cosine shaping confines the spectrum — watch both on the Analyzer spectrum. The stimulus carries true amplitude modulation, so it elicits the largest cortical AM response of the three modes. People with photosensitive or seizure conditions should avoid pulsed modes (see Safety advisories).',
    howTo: [
      'Select the ISOCHRONIC tab in the Engine panel.',
      'Set Beat to the pulse rate and Gate to about 50% for a balanced pulse.',
      'Prefer the COS gate shape; use HARD only if you want maximum modulation.',
    ],
  },
  {
    id: 'noise-mixer',
    module: 'Studio',
    route: '/studio',
    name: 'Noise mixer (6 colors)',
    grade: 'A',
    gradeScope: 'Signal generation correctness; offered as masking/comfort, no entrainment claim.',
    simple:
      'Blend six colors of background noise. Each color has a different bass-to-treble balance. Use the faders to set their levels.',
    deep:
      'Spectral slopes per octave: white 0 dB (flat energy per Hz), pink −3 dB (equal energy per octave), brown −6 dB (random-walk, bass-weighted), blue +3 dB, violet +6 dB (differentiated white), grey psychoacoustic equal-loudness shaped so each band sounds equally loud. The engine synthesizes each color by filtering white noise and sums them through independent −60…0 dB gain stages. Double-clicking a fader returns it to off. All noise layers pass through the master gain and the dose meter like everything else.',
    howTo: [
      'Raise one fader at a time; pink or brown are the usual starting points.',
      'Blend small amounts of white or blue if the mix feels too dull.',
      'Double-click a fader to mute that color.',
    ],
  },
  {
    id: 'layer-nature',
    module: 'Studio',
    route: '/studio',
    name: 'Nature layer',
    grade: 'B',
    gradeScope: 'Small human relaxation studies; framed as relaxation, not entrainment.',
    simple:
      'Adds rain, ocean, stream, fire, or thunder underneath your session. Small human studies find natural soundscapes relaxing. Toggle Nature in the Layers panel and set its level.',
    deep:
      'Each nature sound is synthesized from filtered and slowly modulated noise. Live playback uses loops rendered by the audio engine. Studies of natural soundscapes do not directly validate these synthetic versions. The layer passes through the session master gain and contributes to its estimated sound dose.',
    howTo: [
      'Click the Nature LED in the Layers panel to enable it.',
      'Pick a scene (rain is the most spectrally neutral).',
      'Set the level low enough that the beat stays audible.',
    ],
  },
  {
    id: 'layer-bowls',
    module: 'Studio',
    route: '/studio',
    name: 'Singing bowls layer',
    grade: 'D',
    gradeScope: 'Traditional/cultural use documented; no controlled physiological evidence. Materials and sets are sound models, not effects.',
    simple:
      'Add up to seven modeled singing bowls, each with its own pitch, material, strike, pan, and interval. Choose a set or adjust each bowl. These are sound models; the app makes no wellness claim for them.',
    deep:
      'Each bowl is a physical-model voice: a sum of inharmonic partials with independent exponential decays, a slow shimmer and a split mode doublet that beats the way a hand-hammered bowl does. The five materials and three strikes are profiles chosen by ear against published partial measurements (Inácio 2006; Terwagne & Bush 2011); they change the sound, and nothing else is claimed. Every bowl has a pitch (note picker or typed Hz), a stereo pan, a re-strike interval and its own level, and LOCK ties a bowl to the session carrier so the texture stays consonant with the engine. Ready-made sets load a whole arrangement at once; the seven-note set is the C-major layout sold as a "chakra set", and its note-to-body mapping is folklore. Traditional meditative use is documented; controlled physiological evidence is absent, so the layer ships with a D badge and is labeled texture.',
    howTo: [
      'Click a bowl LED in the Layers panel, or press + ADD BOWL (up to seven bowls).',
      'Pick a material and a strike, then a note or a typed Hz — or press LOCK to follow the carrier.',
      'Set each bowl’s pan, repeat interval, and volume.',
      'Use LOAD SET for a ready-made arrangement, then edit it freely.',
    ],
  },
  {
    id: 'bowl-materials',
    module: 'Studio',
    route: '/studio',
    name: 'Bowl materials and strikes',
    grade: 'D',
    gradeScope: 'Sound-model profiles tuned by ear against published partial measurements; no physiological claim.',
    simple:
      'Five bowl materials and three ways of striking them, each a different sound model. Materials set the partials, ring length and shimmer; strikes set how bright the attack is or whether the bowl sings continuously. They change how the bowl sounds and claim nothing else.',
    deep:
      'A material is a profile of partial ratios, relative amplitudes, decay time, slow FM shimmer and a mode-doublet split: Tibetan bronze is the original three-partial voice, Himalayan antique adds a fourth partial and a long warm ring, bell bronze is bright with five partials, brass is thin and percussive, and crystal quartz is a near-pure fundamental with very long sustain. A strike weights those partials and shapes the onset: mallet lets every partial speak at once, soft mallet rolls off the highs behind a 12 ms bloom, and rim is a sustained voice that swells in and releases over its cycle length. The ratios sit inside the 1 : 2.7–2.9 : 4.9–5.7 : 7.9–9.1 range measured on struck metal bowls (Inácio, Henrique & Antunes 2006) and were tuned by ear, so they are sound models rather than measurements of any particular bowl. No profile carries a physiological claim; the D badge covers the whole layer.',
    howTo: [
      'Open a bowl row in the Layers panel and pick a material from its first menu.',
      'Pick a strike: MALLET or SOFT MALLET for a ring-down, RIM (SINGING) for a continuous voice.',
      'Read the one-line caption under the row — it describes the model, never an effect.',
    ],
  },
  {
    id: 'bowl-sets',
    module: 'Studio',
    route: '/studio',
    name: 'Bowl sets',
    grade: 'D',
    gradeScope: 'Ready-made arrangements described by sound only; the "chakra set" note-to-body mapping is folklore.',
    simple:
      'Ready-made bowl arrangements you can load from one menu. Loading a set replaces every bowl currently in the panel. Each set is described by how it sounds, nothing more.',
    deep:
      'Each set lists up to seven bowls with material, strike, pitch, level, pan, and repeat interval. LOAD SET replaces the current bowls with the selected arrangement. Sets include a Himalayan trio, crystal pairs, a C-major scale, and golden-ratio intervals. The C-major note-to-body mapping sold as a chakra set is a Grade D claim; the musical intervals can be checked separately.',
    howTo: [
      'Open the LOAD SET… menu in the Singing Bowls header.',
      'Choose a set; the current bowls are replaced and the set blurb appears under the header.',
      'Edit any bowl afterwards — a set is only a starting point.',
    ],
  },
  {
    id: 'interval-bell',
    module: 'Studio',
    route: '/studio',
    name: 'Interval bell',
    simple:
      'Rings the first bowl when a session starts and at your chosen interval. Use it as a timer for meditation or breaks. Turn it off in the Layers panel.',
    deep:
      'The bell is a single strike of the first bowl\'s voice (its material, strike and pitch, with LOCK resolved to the carrier); a rim-sung bowl is struck with a mallet instead, and an empty set falls back to an A3 antique bowl. Live, the session clock rings it at the first tick and at every period boundary, so it survives pause and resume without drift. In the export the bell is rendered as a bowl re-struck every N minutes, which rings at each phase start and every N minutes within a phase — a single-phase export therefore matches the live session, while a multi-phase export also rings at each phase boundary. Its level is fixed at −18 dB on the layer bus, and it is silent whenever the layers are bypassed.',
    howTo: [
      'Choose a period under INTERVAL BELL in the Layers panel (OFF turns it off).',
      'Make sure the first bowl row has the voice you want to hear — the bell copies it.',
      'Start the session; the bell rings once at the start and then once per period.',
    ],
  },
  {
    id: 'phase-timeline',
    module: 'Studio',
    route: '/studio',
    name: 'Phase timeline / sequencer',
    simple:
      'Change the beat frequency through a sequence of timed phases. The timeline marks the current phase as the session plays. Edit the durations and target frequencies to change the sequence.',
    deep:
      'Phases form a piecewise schedule of target beat frequencies with linear ramps; beatAtTime() maps elapsed seconds to the active segment and its interpolated beat. The oscillator bank retunes continuously without discontinuity clicks, and the playhead shares the clock used by the dose accumulator. Presets load into exactly this structure, so anything a preset does can be inspected and edited here.',
    plot: {
      axes:
        'Horizontal axis is elapsed session time; each row or block is one phase with its beat frequency labeled. The playhead marker shows the current position in the schedule.',
      good:
        'Segments tile the timeline edge to edge with no gaps, and the playhead advances smoothly across ramp boundaries.',
      bad:
        'A gap, an overlap, or a zero-length segment means the schedule is malformed — edit the phase durations until the blocks tile cleanly.',
    },
    howTo: [
      'Open the Session Phases panel in the Studio.',
      'Add a segment, set its duration and target beat frequency.',
      'Press Start Session and watch the playhead cross the segments.',
    ],
  },
  {
    id: 'visualizer',
    module: 'Studio',
    route: '/studio',
    name: 'Visualizer (scope / spectrum / correlation)',
    simple:
      'See the session waveform, frequency spectrum, and stereo correlation. These views read the generated audio. When playback stops, they show NO SIGNAL.',
    deep:
      'Three canvas views render from the engine analyser taps at 60 fps: the scope plots sample amplitude against time (teal = L, amber = R); the spectrum plots FFT magnitude in dB against Hz with 0.6 attack / 0.12 release smoothing and peak-hold dots decaying 20 dB per 3 s; the correlation meter shows normalized zero-lag L/R cross-correlation. A binaural pair intentionally reads near zero correlation — the ears differ by design. All scopes draw an instrument grid and a NO SIGNAL watermark when stopped.',
    plot: {
      axes:
        'Scope: x = time, y = amplitude. Spectrum: x = frequency (Hz), y = level (dB). Correlation: −1 (ears opposite) to +1 (ears identical).',
      good:
        'Binaural session: two clean spectrum peaks separated by the beat frequency, and correlation near zero.',
      bad:
        'Flat-topped waveforms or peaks glued to 0 dB mean clipping — lower the output level.',
    },
    howTo: [
      'Start a session, then switch the Visualizer between Scope, Spectrum, and Correlation.',
      'On Spectrum, confirm the two carrier peaks sit beat-Hz apart.',
      'If the scope waveform flattens at its peaks, reduce the output level.',
    ],
  },
  {
    id: 'wav-export',
    module: 'Studio',
    route: '/studio',
    name: 'WAV export',
    simple:
      'Renders your entire session — phases, noise, layers — into a standard WAV file you can keep or share. Choose 16-bit, 24-bit or float, then press the WAV button in the Studio transport. The render runs in the background and stops at your session limit.',
    deep:
      'exportWav() runs the same synthesis graph through an offline render at the session sample rate inside a Web Worker and encodes PCM-16, PCM-24 or float-32 WAV (engine/wav.ts, unit-tested for header layout and round-trip fidelity). The phase plan is truncated to the session limit before rendering, so the file can never outlast the cap. Offline rendering decouples export quality from real-time CPU load and respects the current output ceiling. The file follows the phase plan; live transitions can differ from offline crossfades.',
    howTo: [
      'Build or load the session you want in the Studio.',
      'Press the WAV button in the transport bar.',
      'Wait for the offline render, then save the downloaded file.',
    ],
  },
  {
    id: 'sleep-fade',
    module: 'Studio',
    route: '/studio',
    name: 'Sleep fade',
    simple:
      'Ends a session gently instead of cutting it off. Choose how long the fade lasts before the limit, or press FADE NOW to fade immediately. The default is 30 seconds.',
    deep:
      'The engine schedules a piecewise-linear approximation of an exponential (dB-linear) gain ramp on the master AudioParam: twelve segments down to −60 dBFS, then a snap to true zero. The session stays running until the ramp lands, so the clock and the H.870 dose tracker keep counting real output. Volume changes during the fade are deferred so they never fight the ramp; stop, pause and panic cancel it instantly. The same ramp replaces the hard stop when the session limit is reached.',
    howTo: [
      'Pick a fade length in the SLEEP FADE row (OFF, 30 s, 2, 5 or 10 minutes).',
      'Let the session reach its limit, or press FADE NOW (F) to fade right away.',
      'Press CANCEL during a fade to restore the volume and keep going.',
    ],
  },
  {
    id: 'share-link',
    module: 'Studio',
    route: '/studio',
    name: 'Share links',
    simple:
      'SHARE copies a link that recreates your whole setup on another device. Modality, carrier, phase plan, mixer and layers all travel inside the link itself. Nothing is uploaded — there is no server.',
    deep:
      'The front panel is serialized to a compact JSON wire format and base64url-encoded into the URL hash, so it never reaches a server log. Decoding validates and clamps every field to the same ranges the Studio setters enforce, ignores unknown keys, and rejects malformed or empty plans. Applying a link marks the panel dirty and names it Shared session until you save it as a preset. Links open on any deploy base because the router and asset paths follow the configured base URL.',
    howTo: [
      'Build the session you want in the Studio.',
      'Press SHARE — the link is copied (or shown to copy by hand).',
      'Open the link anywhere; the Studio loads with the same setup.',
    ],
  },
  {
    id: 'front-panel-memory',
    module: 'Studio',
    route: '/studio',
    name: 'Front-panel memory',
    simple:
      'The Studio remembers your last setup across reloads. RESET restores the factory panel whenever the engine is stopped. Saved presets and your dose history are kept separately.',
    deep:
      'State is written to localStorage as a versioned envelope through the shared storage helper, debounced 250 ms after the last change. On boot every field is sanitized against the defaults, so a corrupt or out-of-range blob degrades to defaults rather than crashing. The engine receives the restored mixer and layer state before any AudioContext exists and materializes it on the first start. Persisted keys are registered in one place to prevent drift.',
    howTo: [
      'Set up the Studio and close the tab.',
      'Reopen the app — the same panel is back.',
      'Press RESET (engine stopped) to return to defaults.',
    ],
  },
];

const FEATURES_MODULES: readonly FeatureEntry[] = [
  // ------------------------------------------------------------------ Library
  {
    id: 'frequency-library',
    module: 'Library',
    route: '/library',
    name: 'Frequency Library & grades',
    simple:
      'Browse brainwave bands, Schumann resonances, Solfeggio pitches, planetary tones, and other frequency entries. Each row includes an evidence grade and citation. Filters dim entries outside your selection.',
    deep:
      'Each entry stores a documented origin, a best-available citation, and one or two grades — planetary tones, for instance, grade A for the octave arithmetic and D for the healing claim. Schumann entries use the measured Earth-ionosphere cavity modes (7.83 Hz fundamental), not vendor numerology; Solfeggio Hz values trace to 1970s digit-reduction numerology rather than medieval practice, and are labeled as such. The rubric: A = replicated physics, B = small human studies, C = plausible but weak, D = folklore. Preview tones render through the same engine as the Studio.',
    howTo: [
      'Filter by category or grade; dimmed rows are still readable.',
      'Click any grade badge to open its citation popover.',
      'Use the preview button to hear a tone, or send it to the Studio.',
    ],
  },
  // ------------------------------------------------------------------ Presets
  {
    id: 'presets',
    module: 'Presets',
    route: '/presets',
    name: 'Protocol presets',
    simple:
      'Ready-made sessions for sleep, focus, relaxation, meditation, and experimentation that load straight into the Studio. Each card shows its evidence grade and duration. Press load, then Start Session.',
    deep:
      'A preset is a typed SessionSpec: mode, carrier, a phase schedule, noise and layer mix, plus an auto-computed grade equal to the weakest grade among its constituent claims — the grade cannot be edited upward. More than 24 protocols ship built in, and any Studio setup can be saved as a preset with the same auto-grading. Declared durations feed the Safety Center time cap and dose accounting.',
    howTo: [
      'Filter by goal (Sleep, Focus, Relax, Meditate, Experimental) or by grade.',
      'Open a card to read its phase schedule and evidence drawer.',
      'Load it, adjust in the Studio if you like, then Start Session.',
    ],
  },
  // ------------------------------------------------------------------- Levels
  {
    id: 'focus-levels',
    module: 'Levels',
    route: '/levels',
    name: 'Deep Focus levels (F1–F49)',
    grade: 'C',
    gradeScope: 'Historical construct with plausible relaxation use; consciousness claims unproven.',
    simple:
      'Browse historical Gateway Focus labels and load audio demonstrations. There is no verified conversion from a Focus number to a beat frequency. Each card explains its source and limits.',
    deep:
      'The page pairs historical Focus labels with carrier and beat settings chosen for this app. Those settings do not reproduce a verified Focus-number-to-Hz mapping or a commercial recording. The displayed depth scale orders the labels; it does not measure consciousness. Loading a level configures Studio and starts no audio.',
    howTo: [
      'Pick a level on the ladder — F10 and F12 are the documented starting points.',
      'Read the level card and its grade before loading.',
      'Load into Studio and keep early sessions under 30 minutes.',
    ],
  },
  {
    id: 'gateway-exhibit',
    module: 'Levels',
    route: '/levels',
    name: 'CIA Gateway report exhibit',
    simple:
      'Read the 1983 Army assessment of the Gateway program, later released in the CIA archive. The page explains the report and its limits. DOCUMENTED does not mean VALIDATED.',
    deep:
      'The source is the 1983 Army Gateway assessment, archived as CIA-RDP96-00788R001700210016-5. It describes the Monroe Institute program and proposes explanations for its effects. The assessment does not establish those effects through controlled experiments. Use it to study the claims and history, then check outcome evidence separately.',
    howTo: [
      'Open the Levels module and scroll to the exhibit panel.',
      'Read the framing banner first, then the document summary.',
      'Chase any claim into the Knowledge Base for its graded verdict.',
    ],
  },
  // ----------------------------------------------------------------- Analyzer
  {
    id: 'lufs-meter',
    module: 'Analyzer',
    route: '/analyzer',
    name: 'LUFS loudness meter',
    grade: 'A',
    gradeScope: 'ITU-R BS.1770 standardized measurement, unit-tested implementation.',
    simple:
      'Estimates signal loudness in LUFS using frequency weighting. Integrated covers the full measurement; Momentary covers the latest 400 milliseconds. Your device volume also determines how loud playback is.',
    deep:
      'Loudness follows ITU-R BS.1770: K-weighting (a high-shelf pre-filter plus an RLB high-pass), then mean-square energy, converted to LUFS. Gating removes a −70 LUFS absolute floor and a −10 LU relative gate so silence cannot bias the Integrated value. Momentary uses a 400 ms window and Short-term 3 s. K-weighted loudness approximates perception far better than peak level, which is why the dose meter consumes loudness rather than raw amplitude.',
    plot: {
      axes: 'Readouts: Integrated (whole measurement), Short-term (3 s), Momentary (400 ms), all in LUFS. History trace: x = time, y = LUFS.',
      good: 'A stable Integrated well below 0 LUFS; for sleep content, quieter is the design goal.',
      bad: 'Momentary pinned near 0 LUFS or a steadily climbing Integrated at high level — turn the output down.',
    },
    howTo: [
      'Open the Analyzer and choose a source: engine, file, or mic.',
      'Start audio and let Integrated settle for a few seconds.',
      'Compare against your comfort target; lower the Studio output if high.',
    ],
  },
  {
    id: 'true-peak',
    module: 'Analyzer',
    route: '/analyzer',
    name: 'True peak & clip detection',
    grade: 'A',
    gradeScope: 'BS.1770 inter-sample peak method.',
    simple:
      'Catches brief overloads that normal meters miss, including peaks hiding between digital samples. If the clip light turns red, lower the output level. Even one red flash counts.',
    deep:
      'True peak is estimated by 4× oversampling the signal per BS.1770 Annex and comparing the maximum absolute value against 0 dBFS. A waveform can pass a sample-peak meter and still clip a DAC reconstruction filter, which is what inter-sample detection catches. The clip indicator latches, so a single transient cannot flicker past unnoticed. Sustained true peaks at or above the ceiling mean real distortion downstream.',
    plot: {
      axes: 'Readout in dBTP (decibels relative to full scale, true peak). 0 dBTP is the digital ceiling.',
      good: 'Peaks holding comfortably below −1 dBTP with a dark clip LED.',
      bad: 'Any latched red clip LED, or peaks touching 0 dBTP — reduce output level.',
    },
    howTo: [
      'Watch the true-peak readout while your session plays.',
      'If the clip LED latches, lower the Studio output and reset the latch.',
      'Re-check after every level change.',
    ],
  },
  {
    id: 'thd-sinad',
    module: 'Analyzer',
    route: '/analyzer',
    name: 'THD / SINAD utilities',
    grade: 'A',
    gradeScope: 'Standard audio metrology, validated against known-clean generated tones.',
    simple:
      'Measures how pure a tone is — how much unwanted harmonic grit the signal contains. Lower THD means a cleaner tone. Pair it with the built-in calibration tones to check your own playback chain.',
    deep:
      'THD is the ratio of harmonic power to the fundamental — the root-sum-square of harmonics n ≥ 2 divided by the fundamental — reported in percent and dB. THD+N includes noise and everything else in the residual; its reciprocal is SINAD. The Analyzer synthesizes a known-clean reference tone, notches the fundamental, and integrates the residual above the FFT noise floor. Testing headphones or adapters requires a recording of their output; an internal signal measurement cannot check external hardware.',
    plot: {
      axes: 'Readouts: THD (% and dB), THD+N, SINAD (dB). The spectrum view shows the fundamental and any harmonic peaks above the floor.',
      good: 'Sine source: THD below 0.1%, harmonic peaks barely above the noise floor.',
      bad: 'Comb-like harmonic peaks rising well above the floor, or THD above 1% — something in the chain is distorting.',
    },
    howTo: [
      'Enable a calibration tone in the Analyzer.',
      'Run the THD measurement and note THD and SINAD.',
      'Repeat through your full playback chain to audit your own hardware.',
    ],
  },
  {
    id: 'spectrum-analyzer',
    module: 'Analyzer',
    route: '/analyzer',
    name: 'Spectrum analyzer',
    grade: 'A',
    gradeScope: 'Standard FFT measurement; window and smoothing constants shown in the Guide.',
    simple:
      'Shows which frequencies are present in your sound and how strong each one is, as a moving graph. Use it to confirm your session really contains the tones the Studio says it is generating. You can also load a WAV file or use the microphone.',
    deep:
      'Magnitude spectra come from a radix-2 FFT over windowed frames, plotted in dB against Hz with frame smoothing (attack 0.6, release 0.12 per frame) and peak-hold dots. Sources are the live engine, an uploaded file, or the measurement tone generator; everything is computed locally. Window choice trades time resolution against frequency resolution, and the visible floor is the analysis noise floor, not true silence. Treat it as the source of truth for "what is actually playing."',
    plot: {
      axes: 'x = frequency (Hz), y = magnitude (dB). Peak-hold dots mark recent maxima and decay over about 3 s.',
      good: 'Binaural session: two narrow peaks separated by exactly the beat frequency, low floor elsewhere.',
      bad: 'A raised forest of harmonics or a floor sitting near 0 dB indicates clipping or distortion — lower levels.',
    },
    howTo: [
      'Pick a source chip: ENGINE, FILE, or a calibration tone.',
      'Start audio and read peak positions against the Hz scale.',
      'Use Freeze to hold a frame for close inspection.',
    ],
  },
  // ------------------------------------------------------------------- Safety
  {
    id: 'session-cap',
    module: 'Safety',
    route: '/safety',
    name: 'Session cap',
    simple:
      'There is no fixed session cap any more; you set your own in the Safety Center. The session length can never exceed the cap you set. Lowering the cap applies at once, raising it waits for the next session.',
    deep:
      'The cap is a SafetyGovernor setting (maxSessionMin) checked by authorizeSession() at every START and enforced by the session setters: the length is clamped to the cap, a lower cap tightens a running session immediately, and a higher cap never loosens one. It defaults to the 24-hour engineering bound, which is a limit of the clock and the export, not a health claim. Infant mode keeps its 45-minute cap whatever the setting, and a share link lands under the receiver\'s cap. The cap is remembered with the front panel and shown in the Studio readout next to the session length. The WHO-ITU H.870 dose meter remains the evidence-anchored limit and counts regardless.',
    howTo: [
      'Open the Safety Center and find SESSION CAP under Session Limits.',
      'Press OFF for no cap, a chip for a common value, or type a custom cap and press Enter.',
      'Set the session length below it; the length chips only offer values inside the cap.',
    ],
  },
  {
    id: 'dose-gauge',
    module: 'Safety',
    route: '/safety',
    name: 'Sound dose gauge (H.870)',
    grade: 'A',
    gradeScope: 'WHO-ITU H.870 method; dBA conversion from digital level is a stated approximation.',
    simple:
      'Tracks how much sound your ears have absorbed, like a fuel gauge for listening. It fills faster when you listen louder. Green is fine, amber means ease off, red means stop for today.',
    deep:
      'Dose follows WHO-ITU H.870 safe-listening practice: 80 dBA for 40 hours per 7 days for adults (75 dBA for children and sensitive listeners), accumulated with the 3 dB equal-energy exchange rate — every +3 dB doubles the dose rate and halves the allowed time. Digital dBFS is mapped to an estimated dBA with a fixed calibration offset, an approximation that cannot replace measuring your own headphones. There is no fixed session cap; you set your own in the Safety Center, and the dose meter keeps counting whatever the cap.',
    plot: {
      axes: 'Radial gauge: 0–100% of the weekly reference dose; the status bar mirrors the same percentage live.',
      good: 'Green zone with slow growth during moderate sessions.',
      bad: 'Amber means shorten or quieten sessions; red means the weekly budget is spent — stop.',
    },
    howTo: [
      'Open the Safety Center and read the dose gauge before long sessions.',
      'Prefer lower levels: at −3 dB the same listening time costs half the dose.',
      'Respect red: give your ears quiet days to reset the weekly budget.',
    ],
  },
  {
    id: 'panic-button',
    module: 'Safety',
    route: '/safety',
    name: 'Panic button',
    simple:
      'One button — or the P key — that instantly silences everything, from anywhere in the app. Use it the moment sound feels wrong or overwhelming. Shift+P rehearses the flow without a real session.',
    deep:
      'Panic executes an immediate engine mute (0 ms target), dims the screen, and requires a deliberate resume so an accidental keypress cannot restart audio. It is bound globally in the app shell and duplicated in the rail and status bar, with no fades and no network calls in the path. Rehearsal mode (Shift+P) walks the identical flow without audio so the motor memory exists before it is needed. Safety UX is treated as a feature, not a settings page.',
    howTo: [
      'Press P, or click the red PANIC control, any time audio must stop now.',
      'Read the overlay, then resume deliberately or leave the session stopped.',
      'Run Shift+P once to rehearse before your first real session.',
    ],
  },
  {
    id: 'infant-mode',
    module: 'Safety',
    route: '/safety',
    name: 'Infant mode',
    grade: 'B',
    gradeScope: 'Limits anchored to AAP guidance and measured NICU levels; pediatric evidence is thin by nature.',
    simple:
      'A locked-down mode for use around babies: very quiet, bass-only sound with hard limits you cannot override. Turn it on in the Safety Center. The status bar shows INFANT whenever it is active.',
    deep:
      'The safety governor enforces a mandatory lowpass at or below 1000 Hz (approximating intrauterine acoustics) and a gain path targeting no more than 50 dBA at the crib, aligned with AAP guidance and measured NICU Leq recommendations. Consumer white-noise machines have been measured exceeding occupational limits at crib distance (Hugh 2014), which is why these limits are hard constraints, not advisories. While infant mode is on, the Presets screen shows only the Infant category. It is a set of guardrails, not a claim of benefit.',
    howTo: [
      'Open the Safety Center and enable Infant Mode.',
      'Place the speaker away from the crib and keep sessions short.',
      'Watch for the INFANT chip in the status bar to confirm it is active.',
    ],
  },
  // ---------------------------------------------------------------- Knowledge
  {
    id: 'knowledge-archive',
    module: 'Knowledge',
    route: '/knowledge',
    name: 'Knowledge Base (1839–2026)',
    simple:
      'Search papers, patents, government records, and claim reviews from 1839 onward. Cards show a verdict, evidence grade, and citation. Government records distinguish documentation from validation.',
    deep:
      'Entries are typed records — myth-bust, evidence, safety, history — each with a graded citation, and the timeline view scrubs 1839 to 2026 with era markers. The archive is the citation target for every badge popover in the app, so any claim can be chased to a source in one click. Debunking claims are graded with the same rubric as the claims they attack. Each entry includes its sources so the grade can be reviewed.',
    howTo: [
      'Search a term (e.g. "Oster" or "Schumann") or scrub the timeline.',
      'Filter by category or grade to compare evidence tiers.',
      'Open a card to read the verdict, summary, and citation.',
    ],
  },
  // -------------------------------------------------------------------- About
  {
    id: 'honesty-manifesto',
    module: 'About',
    route: '/about',
    name: 'Evidence and methods',
    simple:
      'Read how Open Sync grades claims and separates source records from measured results. The About page explains the four grades and the app’s scope. Follow a citation to check the evidence.',
    deep:
      'The A–D rubric summarizes the evidence for individual claims. Library filters keep excluded entries visible, and government-program pages distinguish documentation from validation. About also lists historical audio patents and the software stack. Documentation tests check prohibited claims, readability, and page coverage.',
    howTo: [
      'Open About and read the five policy commitments.',
      'Check the rubric table to learn what each grade requires.',
      'Open a badge to read its source and scope.',
    ],
  },
  {
    id: 'evidence-badges',
    module: 'About',
    route: '/about',
    name: 'Evidence badges (A–D)',
    simple:
      'A–D badges summarize the evidence for the claim beside them. A covers established findings, B limited human studies, C weak or inconsistent evidence, and D unsupported claims or traditions. Open a badge to read its scope and source.',
    deep:
      'The same four-grade rubric is used across the app. Dual grades separate claims such as frequency arithmetic and proposed health effects. B− marks borderline B-grade evidence. A badge summarizes a review; its source and scope explain the limits.',
    howTo: [
      'Find any claim in the app; its badge sits beside it.',
      'Click the badge to open the citation popover.',
      'Follow the popover link into the Knowledge Base for the full entry.',
    ],
  },
  // ----------------------------------------------------------------- Research
  {
    id: 'experiment-registry',
    module: 'Experiment Lab',
    route: '/lab',
    name: 'Experiment registry (X01–X14)',
    simple:
      'Fourteen planned experiments list hypotheses, methods, and analysis rules. No results have been collected here. Each card explains how a null result will be reported.',
    deep:
      'Protocol cards link a hypothesis to a method, evidence grade, and null-result rule. Sample sizes and confidence intervals remain empty until data is collected. Analysis criteria are recorded before the planned runs. This makes later changes visible; it does not establish an external preregistration.',
    howTo: [
      'Open the Experiment Lab and browse the X01–X14 cards.',
      'Read a card’s hypothesis, protocol, and null-handling statement.',
      'Check the result fields: placeholders mean no data yet.',
    ],
  },
  {
    id: 'critique-library',
    module: 'Critique Library',
    route: '/critique',
    name: 'Critique Library (13 theories)',
    simple:
      'Read structured reviews of thirteen theories. Each review checks the mechanism, mathematics, history, and evidence. It includes the strongest supporting argument, identified flaws, and a verdict.',
    deep:
      'The reviews use six categories: mechanism, mathematics, history, evidence, overreach, and the strongest supporting argument. The same categories apply to claims and to critiques of those claims. Each entry records findings and a verdict. Citations link to the sources used in the review.',
    howTo: [
      'Open the Critique Library and pick a theory.',
      'Read the supporting argument, identified flaws, and verdict.',
      'Follow citations into the Knowledge Base to check the work.',
    ],
  },
  {
    id: 'hypothesis-tracker',
    module: 'Hypothesis Tracker',
    route: '/hypotheses',
    name: 'Hypothesis Tracker (11 claims)',
    simple:
      'Track eleven claims and their current evidence grades. Each entry states what evidence would raise or lower its grade. The history records any changes.',
    deep:
      'Each hypothesis stores its grade, review history, and criteria for changing the grade. It links to an experiment that could test the claim. Entries awaiting data are labeled accordingly. New evidence can raise or lower a grade.',
    plot: {
      axes:
        'The grade-audit timeline runs left to right by date; each step mark is one grade event on the A–D scale, and hovering it shows the evidence that triggered the change.',
      good:
        'Every step links to a cited piece of evidence and matches the pre-written promotion or demotion criteria for that claim.',
      bad:
        'A step with no linked citation or no matching criterion is a process bug — report it rather than trusting the new grade.',
    },
    howTo: [
      'Open the Hypothesis Tracker and pick a claim.',
      'Read the current grade and the promotion and demotion criteria.',
      'Check the audit trail to see whether the grade has ever moved.',
    ],
  },
  {
    id: 'programs-archive',
    module: 'Programs Archive',
    route: '/programs',
    name: 'Programs Archive (42 programs)',
    simple:
      'Browse forty-two government-program records related to auditory stimulation, entrainment, and psychotronics. One grade covers documentation; another covers evidence for the claimed effect. Funding alone does not establish an effect.',
    deep:
      'DOCUMENTED PROGRAM grades the evidence that an effort existed. VALIDATED EFFECT grades controlled evidence for the claimed outcome. Each record includes sources, dates, and relevant negative findings. Read both grades before drawing a conclusion from a historical record.',
    howTo: [
      'Open the Programs Archive and read the framing banner first.',
      'Compare the two grades on any card — documentation versus validation.',
      'Use era and agency filters to trace how the programs cluster.',
    ],
  },
  // ------------------------------------------------- Incoming (verification)
  {
    id: 'cymatic-patterns',
    module: 'Cymatic Studio',
    route: '/cymatics',
    name: 'Chladni cymatic patterns',
    status: 'in-verification',
    grade: 'A',
    gradeScope: 'Grade A plate physics; any therapeutic reading of the geometry is Grade D and is not made here.',
    simple:
      'Turns sound into the standing-wave patterns you would see if sand sat on a vibrating plate. Different frequencies draw different figures, from simple lines to intricate webs. This module is in verification and opens soon.',
    deep:
      'The renderer evaluates the classic square-plate modal superposition cos(nπx)·cos(mπy) − cos(mπx)·cos(nπy), or the generalized sine-mix family, and draws nodal lines as the zero-amplitude level set — the curves where sand physically collects. Mode integers n and m and the mix coefficients are driven from the audio, so frequency maps to pattern complexity. The model is the idealized center-driven free plate of the classic Chladni demonstration, not a claim that sound heals through geometry. Pattern physics is replicated textbook material; therapeutic interpretations are not made anywhere in the module.',
    plot: {
      axes: 'The plate view is spatial: x and y are position on the plate; brightness is vibration amplitude. Dark lines are nodal curves of zero motion.',
      good: 'Sharp, stable nodal lines while a tone holds; pattern complexity grows with mode numbers.',
      bad: 'A washed-out or flickering figure means the driving signal is unsteady — check the engine first.',
    },
    howTo: [
      'Wait for the module to leave verification, then open Cymatic Studio.',
      'Drive it from a Studio tone and watch the nodal lines form.',
      'Sweep the frequency slowly and compare figures across modes.',
    ],
  },
  {
    id: 'lucid-dream-cues',
    module: 'Sleep & Dream',
    route: '/dream',
    name: 'Lucid-dream cue engine',
    status: 'in-verification',
    grade: 'B',
    gradeScope: 'Best-validated audio protocol (TLR) plus MILD/WBTB behavioral core; success rates quoted, never promised.',
    simple:
      'A sleep mode built on the best-tested lucid-dream techniques: pair a sound with the intention to notice you are dreaming, then hear it softly during REM sleep. It biases the odds toward lucidity — it does not guarantee lucid dreams. This module is in verification and opens soon.',
    deep:
      'The audio core is Targeted Lucidity Reactivation: a cue sound trained with intention practice while awake, replayed during REM — 50% signal-verified lucid dreams in cued lab naps versus 17% uncued (Carr 2023), with a successful smartphone translation (Mallett/Paller 2024). The behavioral backbone is MILD plus wake-back-to-bed, about 46% per attempt in motivated volunteers (Aspy 2017). The 40 Hz stimulation claims in this space failed replication and used an invalid lucidity criterion, so they are excluded by design. Out-of-body experiences are framed through their replicated neuroscience — temporoparietal and vestibular origins — never as soul travel, for which no controlled evidence exists.',
    plot: {
      axes:
        'The night-plan strip runs left to right across clock time; rows mark the scheduled sleep blocks, and the small flags mark when cue sounds are set to play inside the late-night windows.',
      good:
        'Cue flags land inside the late-night windows, volumes sit at the low end, and an auto-shutoff ends the plan on its own.',
      bad:
        'Cue flags stacked early in the night, at high level, or with no shutoff mean a badly formed plan — re-run the planner before sleeping.',
    },
    howTo: [
      'Wait for the module to leave verification, then open Sleep & Dream.',
      'Do the short awake training so the cue sound is linked to the intention.',
      'Let the cue play during late-night REM windows and journal in the morning.',
    ],
  },
  {
    id: 'replication-protocols',
    module: 'Replication Bay',
    route: '/replication',
    name: 'Replication protocols',
    status: 'in-verification',
    simple:
      'Review published stimulus settings and the changes needed for browser demonstrations. Protocol cards list procedures and result templates. This module is in verification.',
    deep:
      'Each protocol records carriers, beat rates, mode, duration, and a planned analysis. Fidelity notes identify missing hardware, unknown parameters, and substitutions. Those differences determine whether a run is a replication or only a demonstration. Record null and positive results against the same analysis plan.',
    howTo: [
      'Wait for the module to leave verification, then open Replication Bay.',
      'Pick a protocol and mirror its parameters in the Studio.',
      'Log outcomes against the pre-registered template, including nulls.',
    ],
  },
  {
    id: 'quicklab-selftest',
    module: 'Quick Lab',
    route: '/quicklab',
    name: 'Blinded self-experiments',
    grade: 'B',
    gradeScope: 'Individual comparisons with hidden condition labels; results apply to the recorded sessions and their limits.',
    simple:
      'Compare audio conditions across several sessions with their labels hidden. Rate each session, then review the estimated difference and confidence interval. Results remain inconclusive when the interval includes zero.',
    deep:
      'Quick Lab enrolls you into block-randomized, fully blinded n-of-1 protocols (seeded RNG, arm identity sealed until completion). Each arm is an engine-rendered session (including active-placebo and 0 Hz control arms drawn from the H1–H12 hypothesis set). Outcomes are session ratings and an optional simple-reaction tap test; results render only as n + estimate + 95% CI, a verdict string appears only at ≥10 sessions, and a CI spanning zero returns "inconclusive" by construction. Every session debits your WHO-ITU H.870 weekly dose budget and the scheduler refuses over-dose runs.',
    plot: {
      axes:
        'Results panel: the point mark is the estimated difference between arms, and the horizontal bar is its 95% confidence interval; the vertical zero line means no measured difference. The session counter n sits beside the estimate.',
      good:
        'n at or above 10 with a confidence interval narrow enough to read clearly, every session logged, and arms still blinded until completion.',
      bad:
        'An interval crossing zero is inconclusive. A wide interval means the estimated difference is uncertain.',
    },
    howTo: [
      'Open Quick Lab and pick a protocol — ear-swap and the 0 Hz-floor test are fastest.',
      'Run the scheduled sessions and record your rating after each.',
      'After ten sessions, read your estimate and confidence range — including if it is inconclusive.',
    ],
  },
  {
    id: 'theory-explorer',
    module: 'Theory Explorer',
    route: '/theory',
    name: 'Theory chain auditor',
    grade: 'A',
    gradeScope: 'Audit content is the program\u2019s gated critical-review record; verdicts carry flaw tables and citations.',
    simple:
      'Review claims about sound and the brain one step at a time. Each argument shows its assumptions, evidence gaps, and verdict. Follow the citations to check the review.',
    deep:
      'Each theory is rendered as its audited inference chain: numbered derivation steps with inline flaw flags (logical, mathematical, empirical, scope, statistical, semantic), the weakest arrow highlighted, the domain of validity, at least two mundane alternative explanations, a steelman, and the final verdict (REPAIRABLE / DEMOTE / DISCARD / OPEN) with links into the experiment registry. Discarded claims render as audited records with their flaw tables — never as selectable session options. The page links its findings to the underlying research records.',
    howTo: [
      'Open Theory Explorer and pick a claim — try "432 Hz" or the Gateway chain.',
      'Walk the numbered steps; the amber arrow marks where the argument breaks.',
      'Follow the registry link to see which experiment could settle it.',
    ],
  },
  {
    id: 'soniclab-shepard',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Shepard glissando',
    grade: 'A',
    gradeScope: 'Auditory illusion — replicated psychoacoustics (Shepard 1964).',
    simple:
      'Overlapping tones create the impression of a continually rising pitch. Set the center frequency and speed, then press play.',
    deep:
      'Eight to ten octave-spaced sine partials sweep upward while a Gaussian-in-log-frequency envelope fades partials in at the bottom and out at the top. The spectrum returns to itself every octave cycle, so perceived pitch height circulates without any real ascent. Loop mode snaps the base frequency so every partial completes whole cycles, making the loop sample-seamless.',
    howTo: [
      'Open Sonic Lab and find the Illusions group.',
      'Set a center frequency (300–500 Hz works best) and press play.',
      'Try loop mode and listen across the repeat point.',
    ],
  },
  {
    id: 'soniclab-risset-rhythm',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Risset rhythm',
    grade: 'A',
    gradeScope: 'Temporal analog of the Shepard illusion; perceptual, not therapeutic.',
    simple:
      'Overlapping click patterns create the impression of a continually accelerating rhythm. The displayed tempo returns to its starting point each cycle.',
    deep:
      'Click trains at multiple tempo ratios are crossfaded as the base tempo accelerates. Analytic scheduling keeps each pulse stream phase-coherent across the cycle boundary. The percept is the rhythm-domain version of the Shepard circulation.',
    howTo: ['Open the Illusions group.', 'Choose a tempo ratio and press play.', 'Watch the meta-bar indicator to see the cycle restart.'],
  },
  {
    id: 'soniclab-barber-pole',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Barber-pole AM',
    grade: 'A',
    gradeScope: 'Constant-direction amplitude-modulation illusion; perceptual demo.',
    simple:
      'A pulsing sound whose pulse rate seems to climb endlessly. The loop is snapped to whole beat cycles so it never clicks.',
    deep:
      'Several amplitude modulators at integer-related rates are crossfaded like Shepard octaves in the time domain. The sweep start frequency is snapped within ~0.1% so each loop contains an integer number of beat cycles. The result is a direction-locked pulse percept with a click-free loop.',
    howTo: ['Open Illusions.', 'Press play on Barber-pole AM.', 'Compare with the Risset rhythm to hear the same trick two ways.'],
  },
  {
    id: 'soniclab-euclidean',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Euclidean rhythm gates',
    grade: 'B',
    gradeScope: 'Bjorklund maximally-even patterns — real math, wide use in music; any neural claim is experimental.',
    simple:
      'Spreads any number of beats as evenly as possible over a cycle — the pattern behind many world rhythms. Pick beats and cycle length, then play it as a tone gate.',
    deep:
      'The Bjorklund algorithm constructs the maximally-even distribution of k onsets over n slots (E(3,8) = x..x..x.). All n rotations of the necklace are available. The pattern is used here as an amplitude gate, so the modulation itself carries the Euclidean structure.',
    howTo: ['Open Math Rhythms.', 'Set beats and cycle length.', 'Press play and read the pattern strip.'],
  },
  {
    id: 'soniclab-phi-beatty',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Golden-ratio pulses',
    grade: 'B',
    gradeScope: 'Beatty/Sturmian sequence with irrational slope — deterministic structure; aesthetic only.',
    simple:
      'Generate a pulse pattern from the golden ratio. Compare its uneven spacing with a regular beat.',
    deep:
      'A Beatty sequence with slope 1/φ selects pulse positions. The infinite sequence has no exact period. Playback uses a finite generated buffer, which can repeat in loop mode.',
    howTo: ['Open Math Rhythms.', 'Play the golden-ratio card.', 'Compare the pulse spacing with the prime-pulse pattern.'],
  },
  {
    id: 'soniclab-prime-pulse',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Prime pulse train',
    grade: 'B',
    gradeScope: 'Prime-indexed onsets; mathematical pattern, aesthetic listening object.',
    simple: 'Play clicks on prime-numbered steps: 2, 3, 5, 7, and so on. Set the step rate to hear the spacing change.',
    deep: 'Onsets occupy prime indices on a fixed time grid. The proportion of prime indices decreases roughly as 1/ln(n) at large n. This creates uneven gaps in the finite generated pattern.',
    howTo: ['Open Math Rhythms.', 'Play Prime pulses.', 'Change the step rate and compare the gaps between clicks.'],
  },
  {
    id: 'soniclab-fibonacci-word',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Fibonacci-word rhythm',
    grade: 'C',
    gradeScope: 'The substitution rule defines the rhythm; no special physiological effect is established.',
    simple:
      'Generate long and short steps with the Fibonacci substitution rule. Play the pattern and follow the displayed sequence.',
    deep:
      'The Fibonacci word is built by repeatedly applying 0→01 and 1→0. The two symbols set the rhythm’s long and short steps. This is a construction rule for sound, with no established special effect on listeners.',
    howTo: ['Open Math Rhythms.', 'Play the Fibonacci-word card.', 'Read the substitution rule beside the pattern.'],
  },
  {
    id: 'soniclab-fractal-noise',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Fractal 1/f noise',
    grade: 'B',
    gradeScope: '1/f^α spectra are real signal science; pleasantness claims are aesthetic.',
    simple:
      'Adjust the balance of low and high frequencies in noise. Alpha 0 gives white noise, 1 gives pink, and 2 gives Brownian.',
    deep:
      'Spectral shaping multiplies noise amplitudes by f^(−α/2) so power falls as f^−α (about −3α dB per octave). α=1 is pink, α=2 is Brownian, and α=0 is white. A Voss–McCartney time-domain approximation is included for comparison.',
    howTo: ['Open Fractal & Chaos.', 'Sweep the alpha slider while playing.', 'Match the slope readout against the Analyzer.'],
  },
  {
    id: 'soniclab-logistic',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Logistic chaos modulator',
    grade: 'A',
    gradeScope: 'The logistic map is textbook nonlinear dynamics (Feigenbaum); used here as a control signal.',
    simple:
      'Use the logistic map to vary a tone’s pitch or amplitude. Adjust r to compare steady, repeating, and chaotic patterns.',
    deep:
      'x_{n+1} = r·x_n(1−x_n) at control rate modulates pitch or amplitude. Below r≈3 it settles to a fixed point, past 3.449 it period-doubles, and at r=4 it is fully chaotic. The page warns you at each bifurcation edge.',
    howTo: ['Open Fractal & Chaos.', 'Drag the r slider slowly from 3.4 to 4.0.', 'Listen for the period-doubling cascade.'],
  },
  {
    id: 'soniclab-custom-wave',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Custom waveform designer',
    grade: 'A',
    gradeScope: 'Classic synthesis engineering (additive, FM, Chebyshev, phase distortion).',
    simple:
      'Build a waveform from harmonics, frequency modulation, or waveshaping. Preview the sound and export a WAV file.',
    deep:
      'Additive stacks up to 8 harmonics, Chowning FM with bandwidth following Carson\u2019s rule, and Chebyshev T_n waveshaping (T_n(cos θ) = cos nθ, verified by FFT in tests) are available. Casio-style phase distortion adds a second family of timbres. Export uses the engine\u2019s bit-exact WAV encoder.',
    howTo: ['Open Custom Waveforms.', 'Move harmonic sliders or set an FM index.', 'Press play, then export WAV if you like it.'],
  },
  {
    id: 'soniclab-tuning',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Tuning systems explorer',
    grade: 'B',
    gradeScope: 'Tuning mathematics is exact; consonance follows Plomp–Levelt roughness; healing-tuning claims are grade D and excluded.',
    simple:
      'Compare just intonation, equal temperament, and the Bohlen–Pierce scale. Play an interval and read its size in cents.',
    deep:
      'The tuning table calculates intervals from ratios and logarithms. A just major third is about 13.69 cents below its 12-TET equivalent; the syntonic comma is about 21.51 cents. Bohlen–Pierce divides the 3:1 tritave into 13 equal steps of about 146.304 cents. Roughness is one factor in consonance, alongside timbre, context, and listener experience.',
    howTo: ['Open Tuning Systems.', 'Play the same interval in JI and 12-TET.', 'Read the cent column while you listen.'],
  },
  {
    id: 'soniclab-astro',
    module: 'Sonic Lab',
    route: '/sonic-lab',
    name: 'Astronomically derived tunings',
    grade: 'D',
    gradeScope: 'Orbital arithmetic is grade A; any special meaning or effect is grade D — labeled inline, per program rule.',
    simple:
      'Convert orbital periods into audible pitches. The selected reference sets the octave or starting note. These calculations establish no special effect on listeners.',
    deep:
      'Orbital period ratios become pitch intervals. The TRAPPIST-1 demonstration uses planet h as C3, and Earth-year tones depend on the selected sidereal or tropical period. Grade A applies to the arithmetic; Grade D applies to proposed special effects. These are sound representations of selected astronomical data.',
    howTo: ['Open Astro-Tuned.', 'Toggle sidereal/tropical to hear the tiny difference.', 'Read the source and interpretation note before playing.'],
  },
// ------------------------------------------------------------- Sample Lab
{
  id: 'samplelab-upload',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Local file upload',
  simple:
    'Choose an audio file to inspect its frequencies, rhythm, loudness, stereo structure, and repeated sections. Processing happens on your device. The audio is not uploaded.',
  deep:
    'Files are decoded with AudioContext.decodeAudioData (WAV, MP3, OGG, M4A) into per-channel Float32 arrays at the native sample rate. All DSP runs in chunked, cancellable passes that yield between chunks so the page stays responsive, and long files are analyzed on a widened frame grid so memory and time stay bounded. No network call exists anywhere in the path; closing the tab discards everything.',
  howTo: [
    'Drop an audio file anywhere on the page, or click to pick one.',
    'Watch the progress bar; cancel any time.',
    'Read the report top to bottom — each plot has an ⓘ explainer.',
  ],
},
{
  id: 'samplelab-overview',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Analysis overview',
  simple:
    'The headline numbers of the loaded file in one row: how long, how loud, how hot the peaks are, and whether a tempo or a stereo carrier offset was found. Start here, then dig into the plot that matches your question.',
  deep:
    'Duration, sample rate, and channel count come from the decoded buffer. Loudness is ITU-R BS.1770-4 gated integrated (K-weighted); true peak is 4× oversampled per Annex 2. Tempo comes from the onset-envelope autocorrelation; Δf appears only when the stereo module flags an isolated, decorrelated carrier pair with a matching L·R product-spectrum peak. Every value is a measurement of the file — none of them, alone or together, say anything about effects on a listener.',
  plot: {
    axes: 'Readouts: duration (m:ss), sample rate (kHz), channels, LUFS-I, true peak (dBTP), tempo (BPM), beat offset Δf (Hz).',
    good: 'Values consistent with what the file claims to be — e.g. a quiet, steady, long-form session file.',
    bad: 'True peak at 0 dBTP, or a loudness reading closer to a loudness-war master than a relaxation file.',
  },
  howTo: ['Load a file.', 'Compare the readouts against whatever the source claimed about the file.'],
},
{
  id: 'samplelab-spectrogram',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Spectrogram',
  simple:
    'A map of the whole file: time runs left to right, pitch runs bottom to top, brightness means loudness. Steady tones draw flat lines; drum hits draw vertical smears. Two close lines that drift apart or together reveal a detuned stereo pair.',
  deep:
    'Short-time Fourier transform with a 2048-sample Hann window at 75% overlap (hop widens for very long files). Power per bin is shown in dB with a 90 dB display floor on a warm perceptual ramp. The frequency axis is logarithmic (30 Hz – 16 kHz) because low-frequency detail is where carrier pairs and slow modulations live. A genuine two-carrier construction shows up as two constant-Q ridges whose spacing equals the claimed beat frequency.',
  plot: {
    axes: 'x = time, y = frequency (log, Hz), color = power (dB, warm ramp, −90…0 dB).',
    good: 'Crisp horizontal ridges for steady tones; smooth band shapes for music; quiet floor elsewhere.',
    bad: 'Broadband vertical stripes (clicks or clipping), a hard energy shelf at 15–20 kHz (lossy re-encode), or nothing near a frequency the product label claims.',
  },
  howTo: [
    'Load a file and look for horizontal lines near any claimed carrier frequency.',
    'Check for vertical smears that indicate clicks or clipping.',
    'Compare the top of the energy band against the file\u2019s claimed format quality.',
  ],
},
{
  id: 'samplelab-spectral-stats',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Spectral statistics',
  simple:
    'Four small graphs that track the file\u2019s brightness, width, high-end reach, and noisiness over time. They answer "is this a tone or a hiss?" and "did the character change halfway through?" at a glance.',
  deep:
    'Per STFT frame: centroid C = Σf·p (brightness), spread S = √Σ(f−C)²·p, rolloff = smallest frequency holding 85% of power, flatness = geometric/arithmetic mean ratio of a lightly time-smoothed spectrum (0 = pure tone, →1 = noise), plus positive-only spectral flux F = Σ max(0, P − P_prev) which feeds onset detection. Rolloff is the lossy-encoder detector: mp3 re-encodes show a hard shelf at 15–20 kHz. All five are O(N) per frame on top of the shared STFT.',
  plot: {
    axes: 'Four time series: centroid (Hz, log), spread (Hz, log), rolloff-85 (Hz, log), flatness (0–1).',
    good: 'Flatness near 0 with stable centroid = clean tones; flatness near 1 with low centroid = a noise bed.',
    bad: 'A flatness or rolloff step midway = spliced or re-encoded material; rolloff glued below 16 kHz in a "lossless" file = mp3 in disguise.',
  },
  howTo: ['Load a file.', 'Scan flatness to classify tone vs noise.', 'Scan rolloff for codec shelves and splices.'],
},
{
  id: 'samplelab-band-energy',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Octave band energy',
  simple:
    'Bars showing where the file\u2019s energy lives, from sub-bass to the top octave. A calm sleep file should concentrate below 1 kHz. Surprise energy in the top bands means hiss — or content some listeners cannot hear at all.',
  deep:
    'STFT power is integrated over ANSI octave bands (centers 31.25 Hz – 16 kHz, edges at fc/√2 … fc·√2) and averaged across the file; bars show dB and the percentage of total spectral energy. Dominance of the 250/500 Hz bands with an empty top end is the classic profile of a clean carrier-pair file. Energy above 8 kHz in content marketed for sleep is a red flag: inaudible to many adults, potentially uncomfortable for young listeners.',
  plot: {
    axes: 'Bars: one per octave band (31.25 Hz – 16 kHz); length = mean band power (dB), label = share of total energy.',
    good: 'Most energy below 1 kHz for relaxation or carrier content; a smooth musical slope for songs.',
    bad: 'A tall 8 kHz or 16 kHz bar in a "sleep" file, or an empty low end where a product claims deep carriers.',
  },
  howTo: ['Load a file.', 'Check which bands dominate.', 'Question any band the label doesn\u2019t mention.'],
},
{
  id: 'samplelab-stereo-ms',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Stereo field & carrier-offset check',
  grade: 'B',
  gradeScope: 'The measurement itself (M/S decomposition, correlation, Δf detection) is standard DSP. Grade B covers only the percept: binaural beats are a real, well-replicated auditory illusion — what they do beyond that is not claimed here.',
  simple:
    'Splits the file into what both ears share (mid) and what differs between them (side), and measures how similar the two channels are. If the file hides one steady tone per ear, slightly detuned, this panel finds it and reports the offset. Finding that pattern says how the file was built — not what it does to you.',
  deep:
    'M = (L+R)/2, S = (L−R)/2; windowed Pearson correlation ρ over 100 ms frames. The construction check requires three independent agreements: low inter-channel correlation (ρ < 0.4), an isolated prominent carrier peak in each channel (30–1500 Hz) whose spacing sits in the 0.5–35 Hz beat range, and a corroborating peak at that exact offset in the spectrum of the product signal L·R (which contains a real component at |fL − fR| by the sum-and-difference identity). ρ ≈ +1 is mono-compatible; ρ < 0 disappears in mono mixdown.',
  plot: {
    axes: 'M/S level bars (dB), correlation meter (−1…+1) with ρ-over-time trace, and a verdict chip with Δf, carrier pair, and reason.',
    good: 'Verdict chip matches the file\u2019s own description; ρ near +1 for normal music; a clean low-ρ carrier pair for a labeled dichotic file.',
    bad: 'A "binaural" product with ρ ≈ 1 (no dichotic pair present), ρ < 0 (anti-phase; vanishes in mono), or a Δf that contradicts the label.',
  },
  howTo: [
    'Load a stereo file.',
    'Read the verdict chip: detected pair, Δf, and carrier frequencies.',
    'Cross-check the claimed beat frequency against the measured Δf.',
  ],
},
{
  id: 'samplelab-loudness-history',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Loudness history',
  grade: 'A',
  gradeScope: 'ITU-R BS.1770-4 standardized measurement, unit-tested implementation (shared dsp/loudness.ts).',
  simple:
    'How loud the file actually feels over its whole length, in LUFS, not how tall the waveform looks. A flat, quiet line is what a calm session should look like. Sawteeth and jumps mean aggressive mastering.',
  deep:
    'K-weighted loudness per ITU-R BS.1770-4: momentary (400 ms) and short-term (3 s) traces, gated integrated value, loudness range LRA (10th–95th percentile of gated short-term), and 4×-oversampled true peak. Reference lines include −23 LUFS (broadcast) and 0 dBTP (digital ceiling). As a sanity rule of thumb, sleep-class content should read LRA under ~3 LU and integrated well under −30 LUFS; a "relaxation" track at −8 LUFS is a loudness-war master in disguise.',
  plot: {
    axes: 'x = time, y = LUFS (−60…0); teal = momentary 400 ms, amber = short-term 3 s. Summary: LRA and true peak (dBTP).',
    good: 'A calm, flat trace in a quiet range with true peak below −1 dBTP.',
    bad: 'A hot trace near 0 LUFS, audible jumps, or any true peak touching 0 dBTP.',
  },
  howTo: ['Load a file.', 'Compare integrated LUFS and LRA against the calm-file rule of thumb.', 'Check true peak before playing loud.'],
},
{
  id: 'samplelab-pitch-track',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Pitch track & tuning',
  simple:
    'Follows the musical note through the file and tells you what the whole file is tuned to, within a fraction of a cent. This is the fact-check for tuning claims: a file labeled 432 Hz should measure at 432 Hz, not 440.',
  deep:
    'YIN (de Cheveigné & Kawahara 2002), browser subset: FFT-based difference function, cumulative-mean normalization, 0.1 absolute threshold with deepest-dip selection, and a float64 direct recomputation of the dip for sub-sample, sub-cent refinement. The whole-file tuning readout is the median f₀ over voiced frames, mapped to the nearest equal-tempered note with signed cents (n = 12·log₂(f/440) + 69). Every estimate carries a clarity score; unvoiced or noisy frames are excluded rather than guessed.',
  plot: {
    axes: 'Amber dots: f₀ contour (log Hz, 40–1200) over time; dot opacity = clarity. Table: median f₀, nearest note, cents, voiced percentage.',
    good: 'A stable plateau with high clarity and a cents value matching the file\u2019s tuning claim (±1¢ for synthetic tones).',
    bad: 'A jittery, low-clarity contour (no real pitch), or a measured plateau that contradicts the label — e.g. 440 Hz in a "432 Hz" product.',
  },
  howTo: ['Load a tonal file.', 'Read the median f₀ and cents in the tuning table.', 'Compare with any tuning the product claims.'],
},
{
  id: 'samplelab-loop-detect',
  module: 'Sample Lab',
  route: '/sample-lab',
  name: 'Loop detection',
  simple:
    'Look for repeated sections in an audio file. The detector estimates a repeat period from spectral similarity and shows the comparison curve.',
  deep:
    'The STFT is folded into 1-second, 16-band log-frequency energy fingerprints; every pair of fingerprints at every whole-second lag is compared by cosine similarity. An exact loop produces an off-diagonal ridge at the loop period (and its multiples); the smallest lag above 0.92 is reported as the period. Spectrally stationary content (flat noise, a single held tone) is ambiguous — any segment matches any other — so the detector abstains rather than inventing a period.',
  plot: {
    axes: 'x = lag (seconds), y = self-similarity (0–1); dashed amber line = 0.92 detection threshold; amber marker = reported period.',
    good: 'A dominant ridge suggests repetition at that lag; a low curve means less spectral similarity.',
    bad: 'Not applicable — abstains ("not evaluated") on silence, constant spectra, or files under 6 s instead of guessing.',
  },
  howTo: ['Load a long session file.', 'Read the verdict: loop period or "no exact loop".', 'Check the ridge on the curve for yourself.'],
},
  {
    id: 'advisory-gate',
    module: 'Safety',
    route: '/safety',
    name: 'First-run advisory & START gate',
    simple:
      'Before your first session, a short safety advisory must be acknowledged once per device. It covers headphones and level, driving, seizure history, medication precaution and crisis resources. You can review it again here at any time.',
    deep:
      'The SafetyGovernor refuses every session until the driving/machinery warning is acknowledged, and START calls authorizeSession() on the live front panel. Infant mode adds a live 1 kHz low-pass path, a 50 dBA level ceiling mapped to −26 dBFS on the headphone estimate, an automatic shutoff and a 45-minute cap; refusals are listed inline in the Studio. The acknowledgment is stored as a versioned record and re-checked at every start. The driving, seizure, medication and crisis items are the governor text verbatim; only the headphones-and-level item is authored in the dialog.',
    grade: 'B',
    gradeScope: 'Cognitive-task impairment during binaural listening: Klichowski et al. 2023 (n=1000, fluid-intelligence scores). Driving is an inferred precaution, not a tested outcome.',
    howTo: [
      'Press START in the Studio; read the advisory once and confirm.',
      'Open the Safety Center to review it again or check why a start would be refused.',
      'Turn on infant mode here to apply the tighter level, low-pass and time caps.',
    ],
  },
  {
    id: 'dose-log',
    module: 'Safety',
    route: '/safety',
    name: 'Seven-day dose log',
    simple:
      'The weekly dose meter covers seven days. Every second of session output is logged with its estimated level and replayed when the app starts. Muted time is not counted.',
    deep:
      'Exposures are coalesced per level into a rolling 7-day log persisted every 30 seconds and at stop, then replayed into the H.870 tracker at boot. The equal-energy 3 dB exchange model and the 80 dBA / 40 h reference are unchanged. The level is a headphone estimate (−18 dBFS ≈ 58 dBA), not a calibrated measurement, so the meter is conservative guidance rather than a dosimeter.',
    howTo: [
      'Run sessions as usual; the DOSE THIS WEEK readout accumulates across days.',
      'Lower the fader to slow the dose rate (3 dB halves it).',
      'Press RESET DOSE WEEK in the Safety Center if you change headphones or calibration.',
    ],
  },
  {
    id: 'install-offline',
    module: 'Home',
    route: '/',
    name: 'Install & offline use',
    simple:
      'Open Sync can be installed like an app and keeps working without a network. Lock-screen controls and a wake lock keep long sessions running on phones. Updates are offered, and a running session is never interrupted by one.',
    deep:
      'A service worker precaches the app shell (about 1.4 MB) and caches preview audio on first play; the 100 MB of preset previews and stimulus files are never precached. The Media Session API exposes PLAY, PAUSE and STOP with the session title, and a silent keep-alive element keeps the tab treated as playing so mobile browsers do not throttle it. The Screen Wake Lock is held while a session runs and re-acquired when the tab returns. A waiting build shows an UPDATE chip in the status bar; applying it reloads the page, and a tab with a live session holds its reload until the session ends.',
    howTo: [
      'Use your browser menu → Install (or Add to Home Screen).',
      'Start a session, then lock the phone — controls appear on the lock screen.',
      'When an UPDATE chip appears, stop the session and tap it.',
    ],
  },
];

/** Full feature list — the single import surface for Home, Guide, and tests. */
export const FEATURES: readonly FeatureEntry[] = [...FEATURES_CORE, ...FEATURES_MODULES];

/** Features grouped by module, preserving data order. */
/** Feature doc by id (InfoPopover explainers, catalog cards). */
export function getFeatureDoc(id: string, features: readonly FeatureEntry[] = FEATURES): FeatureEntry | undefined {
  return features.find((f) => f.id === id);
}

export function featuresByModule(features: readonly FeatureEntry[] = FEATURES): Map<string, FeatureEntry[]> {
  const map = new Map<string, FeatureEntry[]>();
  for (const f of features) {
    const list = map.get(f.module);
    if (list) list.push(f);
    else map.set(f.module, [f]);
  }
  return map;
}
