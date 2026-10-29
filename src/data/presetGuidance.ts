import type { Phase, Preset } from './presets';

export interface PresetGuidance {
  /** What is actually in the sound, separated from the interpretation. */
  logic: string;
  /** Possible listening impressions, never a prediction about a brain state. */
  experience: string;
  howToUse: string;
  /** Optional practice schedule, not an evidence-based therapeutic dose. */
  howOften: string;
  limits: string;
  sources: readonly { label: string; url: string }[];
}

const SOURCES = {
  signal: { label: 'OpenStax · beats and sound mathematics', url: 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats' },
  review: { label: 'Ingendoh et al. · EEG entrainment evidence review', url: 'https://doi.org/10.1371/journal.pone.0286023' },
  bashar: { label: 'Bashar · permission-slip meditation (source description)', url: 'https://tv.bashar.org/programs/mind-body-meditation' },
  monroe: { label: 'Monroe Institute · Gateway program (source description)', url: 'https://www.monroeinstitute.org/products/gateway-experience-wave-i-discovery' },
  body: { label: 'Blanke et al. · altered own-body perception; not an audio study', url: 'https://www.nature.com/articles/419269a' },
  dream: { label: 'International Lucid Dream Induction Study (2020)', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01746/full' },
  cue: { label: 'Konkoly et al. · trained dream cues at home', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11542932/' },
} as const;

const QUIET_USE = 'Choose a comfortable position, start with a short preview at a quiet level, and stop whenever you wish. Keep breathing natural.';
const OPTIONAL_SCHEDULE = 'Optional starter schedule, not a validated dose: try up to 5–10 minutes, or the full preset if shorter, on two or three separate days. Keep it only if comfortable and useful; longer or more frequent listening is not known to work better.';
const EXPLORATORY_SCHEDULE = 'Optional comparison schedule, not a validated dose: try one short session on two separate days. Alternate it with a quiet or steady-tone session and record your impressions before reading the labels.';
const OBE_SCHEDULE = 'Optional starter schedule, not a validated OBE dose: try up to 5–10 minutes, or the full preset if shorter, once or twice a week while rested. Leave a normal night of sleep between experiments; there is no requirement to progress through longer sessions.';
const OBE_LIMIT = 'Floating, imagery, tingling or a changed sense of body position can be subjective experiences; they do not by themselves establish that awareness left the body. No audio frequency or practice schedule here is established to produce an OBE, astral travel or verified distant perception.';
const MAPPING_LIMIT = 'The chosen conversion is k = 5,000, anchored on 200,000 ↔ 40 Hz. It fits one reference point; the source scale has no supplied instrument or physiological calibration. The audio does not measure a human frequency, raise a measured vibration or establish ET contact.';

type GuidanceOverride = Partial<Omit<PresetGuidance, 'sources'>> & { sources?: PresetGuidance['sources'] };

/** Curated interpretation accompanies, rather than replaces, the actual signal arithmetic. */
const SPECIFIC: Record<string, GuidanceOverride> = {
  'exp-bashar-scale-map': {
    logic: 'Each supplied source number is divided by the chosen k = 5,000: 30,000 → 6; 50,000 → 10; 137,000 → 27.4; 143,000 → 28.6; 146,000 → 29.2; 200,000 → 40; 333,000 → 66.6 Hz. The 200 Hz carrier and five minutes per step are app choices. The first five phases are binaural; the last two use monaural playback.',
    experience: 'You may notice a changing beat or texture as the sequence progresses; the faster shared-channel segments can feel rougher or buzzier. There is no required sensation and no experience that confirms the source scale.',
    howToUse: 'Use stereo headphones for the binaural steps. Preview quietly, then compare individual steps in Sound details before attempting the full 35 minutes. Note the audible differences without ranking them as higher or lower consciousness; return to a steady control afterwards.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: MAPPING_LIMIT,
    sources: [SOURCES.bashar, SOURCES.review],
  },
  'exp-bashar-gamma-contradiction': {
    logic: 'The first ten minutes use 200 Hz left and 210.5 Hz right: 210.5 − 200 = 10.5 Hz. The next ten minutes use a 40 Hz shared-channel pattern. Both rate and playback mode change, so this cannot isolate a frequency effect.',
    experience: 'The second section may sound more textured or intense. Calmness, alertness, drowsiness or no change are all possible; a preference does not identify alpha or gamma activity in your brain.',
    howToUse: 'Listen with stereo headphones, quietly. Compare the two sections and record sound comfort separately from mood or attention. If the second section is unpleasant, stop rather than increasing its level or duration.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: 'No EEG is recorded. Alpha and gamma measures can coexist; the supplied digest’s descriptions need original recordings and definitions before they can be compared. This listening comparison does not test channeling or diagnose a state.',
    sources: [SOURCES.bashar, SOURCES.review],
  },
  'exp-phi-ladder': {
    logic: 'Five sequential pitches follow fₙ = 110 × φⁿ Hz, where φ = (1 + √5)/2 ≈ 1.618. The pitches are approximately 110, 177.98, 287.98, 465.97 and 753.95 Hz, five minutes each. Every beat setting is zero: φ is a pitch ratio, not a beat rate or an integer harmonic series.',
    experience: 'Expect a distinctly rising pitch sequence with unfamiliar intervals. You might enjoy its spacious quality or find it tense; neither response verifies a spiritual or physiological meaning for φ.',
    howToUse: 'Use speakers or headphones at a comfortable level. Hear each step briefly before a full listen; compare the intervals with an ordinary octave or simple-ratio sequence. You can use one quiet step as an attention anchor without following the whole ladder.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: '110 Hz is a chosen musical root. Exact ratio arithmetic does not establish a natural healing scale, an OBE mechanism or a frequency of consciousness. The underlying source digest remains unverified.',
    sources: [SOURCES.bashar, SOURCES.signal],
  },
  'exp-phi-bowl-chord': {
    logic: 'Five modeled bowl fundamentals follow 110 × φⁿ Hz and are struck together every 12 seconds over a steady 110 Hz root. The fundamental spacing is mathematical; modeled bowl partials add other frequencies. Unlike the ladder, these pitches overlap as a chord.',
    experience: 'Expect ringing decays and a layered chord rather than a low-rate beat exercise. It may be a pleasant focus for resting attention, or you may prefer fewer bowls. A particular bodily sensation is not required.',
    howToUse: 'Use speakers or headphones quietly. Rest attention on one strike and its decay, then allow attention to widen to the room. Start with five minutes; the full composition is 15 minutes and contains no spoken guidance.',
    limits: 'These are synthesized instruments, not recordings of physical bowls. The root, timing and instrument voices are app choices. Neither golden-ratio spacing nor subjective calm verifies the supplied consciousness claims.',
    sources: [SOURCES.bashar, SOURCES.signal],
  },
  'bashar-study-matched-steps': {
    logic: '248 → 310 → 372 → 496 Hz gives ratios 1, 5/4, 3/2 and 2 relative to 248 Hz. Each pitch lasts 90 seconds and is identical in both channels. This is the matched-channel control for Offset pitch steps.',
    howToUse: 'Use the same stereo headphones and comfortable volume for both matched and offset versions. Alternate their order across two trials and rate sound preference before looking at the names.',
    experience: 'Expect four clear pitch steps, ending an octave above the first. Any mood change is your listening report, not a measurement of personal alignment.',
  },
  'bashar-study-offset-steps': {
    logic: 'The left channel is 248 → 310 → 372 → 496 Hz; the right is 250 → 312 → 374 → 498 Hz. At each 90-second step, fR − fL = 2 Hz and relative phase advances by two turns per second. No separate 2 Hz tone is generated.',
    howToUse: 'Use stereo headphones, with spatial-audio or mono mixing disabled if possible. Compare with Matched pitch steps at the same device setting; write down comfort and the perceived beat rather than seeking a required altered state.',
    experience: 'You may hear gentle fluctuation or little difference from the matched version. Individual beat perception varies, and no distinct experience is required.',
  },
  'bashar-study-fifth-return': {
    logic: '372 → 248 → 496 → 248 Hz compares a 3:2 descent with a 2:1 descent; every step lasts 90 seconds. Only the opening pitch differs from Octave then return. Equal digital gain is not equal perceived loudness.',
    howToUse: 'Listen to this and Octave then return at the same comfortable setting. Notice the first return to 248 Hz and compare the sense of contrast; reverse the order on another day.',
  },
  'bashar-study-octave-return': {
    logic: '496 → 248 → 496 → 248 Hz repeats a 2:1 octave return, 90 seconds per step. Timing, gain and the last three pitches match Fifth then return; its opening 372 Hz changes to 496 Hz here.',
    howToUse: 'Compare its first octave return with the fifth-return version. Record the musical difference before assigning meaning to it; an interval preference is not evidence for a special internal state.',
  },
  'frequency-study-phase-reference': {
    logic: 'Both channels carry 312 Hz, so the ideal relative frequency difference is zero. This control does not prescribe an initial phase offset or measure a room interference pattern.',
    howToUse: 'Compare the steady reference with Phase drift at 1.25 Hz, using the same stereo headphones and quiet level. Record fluctuation and comfort separately.',
  },
  'frequency-study-phase-drift': {
    logic: '312 Hz left and 313.25 Hz right give Δf = 1.25 Hz. Relative phase advances by 2π × 1.25 × t radians: one complete turn every 1/1.25 = 0.8 seconds. Detuning changes phase over time; it is not a fixed initial phase setting.',
  },
  'frequency-study-sideband-pair': {
    logic: '288 Hz left and 293 Hz right have a 5 Hz separation. This is a stereo two-tone comparison, not AM: 5 Hz AM of a 288 Hz carrier would also require the lower 283 Hz sideband with specified amplitudes. No separate 5 Hz tone is emitted.',
  },
  'frequency-study-alias-proxy': {
    logic: 'For an illustrative 8,000 samples/s clock, |7,712 − 8,000| = 288 Hz is an alias magnitude. This preset directly generates a steady 288 Hz tone at the app’s normal sample rate; it does not generate 7,712 Hz, undersample it or reveal a hidden signal.',
  },
  'nt-phase-drift': {
    logic: '240 Hz left and 240.5 Hz right give a 0.5 Hz difference: one relative-phase turn every two seconds. This models detuning between audio channels, not Tesla’s rotating magnetic field or an initial phase angle.',
  },
  'nt-detuning-3': {
    logic: '240 Hz left and 243 Hz right give three relative-phase turns per second. Compare with the 0.5 Hz example: carrier, duration and digital gain match, while right-channel frequency changes. The 3 Hz difference is not a separate low-frequency pressure wave.',
  },
  'nt-ratio-steps': {
    logic: 'The 256 Hz root is multiplied by 5/4, 3/2, 2 and 1, yielding 320, 384, 512 and 256 Hz. These sequential musical intervals are app choices inspired by historical reading; they are not Newton’s prescribed treatment frequencies.',
  },
  'nt-tempered-steps': {
    logic: 'Equal temperament uses f = 256 × 2^(n/12) Hz for n = 4, 7, 12, 0, giving about 322.54, 383.57, 512 and 256 Hz. Compare this with the simple-ratio version; the root and pitch order are chosen musical parameters.',
  },
  'research-ratio-sequence': {
    logic: 'A 220 Hz root is multiplied by 1, 5/4, 3/2 and 2, giving 220, 275, 330 and 440 Hz. Each pitch plays separately for two minutes. These are successive musical intervals; the four tones are not a simultaneously sounding harmonic series.',
  },
  'research-equal-temperament': {
    logic: 'Each two-minute pitch follows f = 220 × 2^(n/12) Hz for n = 0, 4, 7, 12: approximately 220, 277.183, 329.628 and 440 Hz. Compare with the simple-ratio sequence at the same quiet level; the inner intervals differ while the root and octave agree.',
  },
  'research-fifth-drone': {
    logic: 'A steady 220 Hz tone overlaps a modeled bowl with a 330 Hz fundamental: 330/220 = 3/2, a perfect-fifth ratio. The bowl has additional modeled partials, so its full spectrum is not a single pure tone. These chosen pitches are a new composition, not a recovered ancient practice.',
  },
  'archive-harmonic-contemplation': {
    logic: 'The steady 110 Hz root accompanies recurring modeled bowls at 220 and 330 Hz: their base-frequency ratios are 1:2:3. This is an integer-multiple relationship between fundamentals; modeled bowl partials add other spectral components. Timing and pitches are app choices, not a prescribed Sufi dose.',
  },
  'archive-seven-intervals': {
    logic: 'The chosen 110 Hz root is multiplied by 1, 9/8, 5/4, 4/3, 3/2, 5/3 and 2. The seven one-minute pitches are approximately 110, 123.75, 137.5, 146.667, 165, 183.333 and 220 Hz. Ratios describe a new musical sequence, not organ, planetary or therapeutic frequencies.',
  },
  'meditate-om-cousto': {
    logic: 'The symbolic Earth-year mapping uses f = 2ⁿ/T, where T is the chosen year in seconds. Selecting n = 32 gives approximately 136.1 Hz, the stored carrier here. Choosing an octave moves an extremely slow periodicity into hearing range; the audio does not reproduce the Earth’s orbit or a measurable OM field.',
  },
  'exp-planetary-octave-ascent': {
    logic: 'For each chosen orbital or rotation period T in seconds, an audible portrait uses f = (1/T) × 2ⁿ, with an independently selected integer octave n. The eight 90-second stored pitches are 136.1, 141.27, 144.72, 147.85, 183.58, 194.18, 210.42 and 221.23 Hz. Period and octave choice both matter; sorting by audible pitch is not ordering the planets by orbital frequency.',
  },
  'exp-newton-spectrum-dorian': {
    logic: 'The color portrait maps a selected band-center wavelength λ to f = (c/λ) × 2⁻⁴⁰, using c = 299,792,458 m/s and λ in meters. The seven rounded stored audio pitches are 385.6, 419.79, 457.01, 514.13, 578.4, 629.68 and 685.51 Hz. Historical color divisions and band-center choices determine the mapping; this is synthesized sound, not converted photons.',
  },
  'exp-hydrogen-21cm-portrait': {
    logic: 'The neutral-hydrogen line near 1,420.405751768 MHz is divided by 2²¹: 1,420,405,751.768/2,097,152 ≈ 677.302 Hz. The preset rounds that result to a steady 677.3 Hz tone for 20 minutes. The octave shift is a chosen representation; the output is sound, not 21 cm radio radiation.',
  },
  'exp-solar-pmode-portrait': {
    logic: 'A representative five-minute solar period gives f = 1/300 Hz. Chosen shifts produce (1/300) × 2¹⁷ ≈ 436.907 Hz and (1/300) × 2¹³ ≈ 27.307 Hz, stored as a 436.91 Hz left carrier and 27.31 Hz interaural difference. The right carrier is 464.22 Hz. These rounded numbers portray a representative solar oscillation; they do not couple the listener to the Sun.',
  },
  'exp-cmb-peak-portrait': {
    logic: 'A chosen frequency-spectrum peak near 160.4 GHz is divided by 2²⁸: 160,400,000,000/268,435,456 ≈ 597.537 Hz. The preset rounds this to a steady 597.54 Hz tone for 15 minutes. A blackbody peak depends on the spectral representation; this is an audible portrait, not cosmic microwave exposure.',
  },
  'exp-kepler-motet': {
    logic: 'For a planet with orbital eccentricity e, the ratio of angular speeds at perihelion and aphelion is ((1 + e)/(1 − e))². The composition applies those ratios to chosen musical roots, then plays each aphelion pitch followed by its perihelion pitch for 40 seconds each. These are successive tone steps, not planetary recordings or continuous orbital glides.',
  },
  'exp-tesla-369': {
    logic: 'Three rounds repeat 3, 6 and 9 Hz binaural differences over carriers of 120, 150 and 180 Hz. Each stage lasts three minutes: 3 rounds × 3 stages × 3 minutes = 27 minutes. The numerical pattern is a composition choice; no primary Tesla source or physical law establishes a special power for 3–6–9.',
  },
  'archive-gateway-inspired': {
    logic: 'Three five-minute stages use a 180 Hz left tone with 188, 186 and 184 Hz right tones, giving 8, 6 and 4 Hz differences. These settings were authored here as a listening companion to a historical report, not recovered from a proprietary recording.',
    experience: 'You may become relaxed or drowsy, notice imagery, or simply hear the sound. The sequence does not confirm arrival at a numbered Focus level or movement outside the body.',
    howToUse: 'Use stereo headphones while comfortably seated or lying down. First notice the room and bodily support; let the sound accompany easy attention. Finish by opening your eyes, moving comfortably and writing a brief description in ordinary language.',
    howOften: OBE_SCHEDULE,
    limits: OBE_LIMIT + ' The 1983 assessment is historical documentation, not proof of an effective audio recipe.',
    sources: [SOURCES.monroe, SOURCES.body, SOURCES.review],
  },
  'night-astral': {
    logic: 'A steady 140 Hz tone and ocean texture accompany an optional imagery practice. The two long audio sections total seven hours; they contain no OBE detector, sleep-stage sensing, voice or exit cue.',
    experience: 'A familiar imagined scene may become vivid as you become drowsy. Floating impressions can occur, but neither vividness nor the length of the soundtrack establishes literal astral travel.',
    howToUse: 'Start with a 5–10 minute timer rather than the seven-hour setting. Use a quiet speaker, imagine a familiar peaceful place, and keep awareness of bodily support. Reorient to the room at the end. Shorten or stop the sound if it disturbs sleep.',
    howOften: OBE_SCHEDULE,
    limits: OBE_LIMIT + ' Seven hours is an available file length, not a recommended practice dose.',
    sources: [SOURCES.body, { label: 'Leadbeater · historical astral tradition', url: 'https://www.gutenberg.org/ebooks/21080' }],
  },
  'night-viewing': {
    logic: 'A steady 174 Hz tone supplies a neutral journal background. No target information is encoded and no method for receiving remote information is supplied by the frequency.',
    experience: 'Images or impressions may occur while resting, as they can in silence. Their apparent significance should be separated from whether a preselected target was actually matched.',
    howToUse: 'Use a short quiet session, then timestamp the complete unedited report. For a target experiment, have someone else conceal a randomly selected target, predefine scoring and count misses as well as apparent hits.',
    howOften: 'Optional journal schedule, not a validated dose: one short trial on separate rested days. Avoid repeating until an impression seems to fit; retain every result.',
    limits: 'Neither a seven-hour tone nor vivid imagery verifies distant perception. The audio is a personal journaling aid and is not a validated remote-viewing protocol.',
  },
  'lucid-tlr-training-bed': {
    howToUse: 'While awake, practice noticing whether you are dreaming and pair a separate, recognizable cue with that intention. This bed is only a background: it does not automatically insert, train or replay a cue during REM. Keep a dream journal after natural waking.',
    experience: 'The immediate experience may be ordinary relaxation. A dream later containing a practiced cue is possible but not promised; hearing this bed alone is not a test of targeted lucidity reactivation.',
    limits: 'Research on trained cue replay does not validate the beat rate or this background composition. The app does not sense REM, verify lucidity or reproduce the complete cited protocol.',
    sources: [SOURCES.cue, SOURCES.dream],
  },
  'lucid-wbtb-return-descent': {
    howToUse: 'If you are already awake near morning and have enough sleep time left, use a short quiet listen while returning to rest. Set a gentle intention to recognize a dream and record recall after waking. There is no need to add an alarm or deliberately lose sleep for this audio.',
    limits: 'Wake-back-to-bed research concerns a cognitive practice and timing, not proof that these beat rates produce REM or lucidity. The preset has no sleep sensing; avoid it if the experiment leaves you less rested.',
  },
  'lucid-rem-window-theta': {
    howToUse: 'Treat this as optional quiet audio when naturally returning to sleep, rather than proof that you are in REM. Keep the timer short, and let silence replace it if sound delays sleep. Write down recall after waking.',
    limits: 'REM Window is an intended use label. The app neither detects REM nor targets your recorded theta rhythm, and a clock-based window cannot establish your current sleep stage.',
  },
  'lucid-n1-incubation': {
    howToUse: 'Choose one simple theme, such as a tree, before a short rest. Notice any drifting images without forcing them, then write what you remember. This audio has no sleep sensor or spoken prompts to collect dream reports.',
    limits: 'Dormio research used monitored and timed interventions. This open-loop composition does not reproduce that apparatus, detect N1 or establish an effect on creativity or lucid dreaming.',
  },
  'lucid-ssild-pacer': {
    logic: 'Eight cycles contain three 30-second pitches each: 392 Hz for imagined visual attention, 493.88 Hz for hearing and 329.63 Hz for body sensations. The 24 sections total 12 minutes; all beat settings are zero. Pitch changes mark when to shift attention.',
    howToUse: 'Rest with eyes closed and cycle gently through imagined visual impressions, ordinary sounds and bodily sensations when the marker changes. Do not strain to see images. Finish without trying to force sleep or a lucid dream.',
    limits: 'Evidence about the SSILD cognitive exercise is not validation of this musical pacer. The pitch choices are markers, not frequencies that control the senses or guarantee lucidity.',
  },
  'sleep-slow-wave-cue': {
    limits: 'This is open-loop audio. The cited closed-loop sleep study timed stimulation to measured EEG; this preset has no EEG input and cannot reproduce that intervention or establish a memory benefit.',
  },
};

const format = (value: number) => Number.isFinite(value) ? Number(value.toFixed(3)).toString() : 'unspecified';
const list = (values: readonly number[]) => values.map(format).join(' → ');

function signalLogic(preset: Preset): string {
  const phases = preset.spec.phases;
  if (!phases.length) return 'No phase sequence is saved. Add a valid sound phase in Studio before listening.';
  const minutes = phases.reduce((sum, phase) => sum + phase.durationSec, 0) / 60;
  const pitches = list(phases.map(phase => phase.carrierHz));
  const timing = phases.every(phase => phase.durationSec === phases[0].durationSec)
    ? `${phases.length} section${phases.length === 1 ? '' : 's'} of ${format(phases[0].durationSec / 60)} minutes`
    : `${phases.length} sections totaling ${format(minutes)} minutes`;
  const descriptions: string[] = [`The saved sound plan has ${timing}. Carrier pitch${new Set(phases.map(phase => phase.carrierHz)).size > 1 ? 'es' : ''}: ${pitches} Hz.`];
  const binaural = phases.filter(phase => (phase.mode ?? 'binaural') === 'binaural' && phase.beatHz > 0);
  if (binaural.length) descriptions.push(`Binaural differences: ${list(binaural.map(phase => phase.beatHz))} Hz. In each such section, right-channel pitch = carrier + difference; separate stereo channels are required, and the difference is not a separate low-frequency sound.`);
  const monaural = phases.filter(phase => phase.mode === 'monaural' && phase.beatHz > 0);
  if (monaural.length) descriptions.push(`Shared-channel rates: ${list(monaural.map(phase => phase.beatHz))} Hz. Preview/export uses sine amplitude modulation; live playback mixes carrier and carrier + rate. Their envelopes and spectra differ despite the shared rate.`);
  const pulses = phases.filter(phase => phase.mode === 'isochronic' && phase.beatHz > 0);
  if (pulses.length) descriptions.push(`Isochronic pulse rates: ${list(pulses.map(phase => phase.beatHz))} pulses per second; the audible carrier is rhythmically gated in both channels.`);
  if (phases.every(phase => phase.beatHz === 0)) descriptions.push('Every beat setting is zero; changing carrier pitch is not a low-rate beat or an EEG measurement.');
  if (phases.some(phase => phase.mode === 'noise')) descriptions.push('The legacy noise mode currently falls back to steady-tone playback; its noise-only label does not create a noise texture. Check the actual mixed layers separately.');
  const textures = mixLogic(preset);
  if (textures) descriptions.push(textures);
  if (preset.spec.limitMin !== undefined && preset.spec.limitMin < minutes) descriptions.push(`The saved listening timer stops at ${format(preset.spec.limitMin)} minutes, before the full sequence ends.`);
  return descriptions.join(' ');
}

function mixLogic(preset: Preset): string {
  const mix = preset.spec.mix;
  if (!mix) return 'No complete mixer profile is authored here; check current Studio layers before listening.';
  const layers: string[] = [];
  if (mix.noiseOn && Object.keys(mix.noiseDb).length) layers.push(`${Object.keys(mix.noiseDb).join('/')} noise`);
  if (mix.layersOn !== false && mix.nature.on) layers.push(`${mix.nature.kind} texture`);
  const bowls = mix.layersOn === false ? [] : mix.bowls.filter(bowl => bowl.on);
  if (bowls.length) layers.push(`${bowls.length} modeled bowl${bowls.length === 1 ? '' : 's'} (${bowls.map(bowl => bowl.lock ? 'pitch follows the current carrier' : `${format(bowl.baseHz)} Hz`).join(', ')})`);
  return layers.length ? `The authored mix also includes ${layers.join(' and ')}.` : '';
}

const usesBinaural = (phases: readonly Phase[]) => phases.some(phase => (phase.mode ?? 'binaural') === 'binaural' && phase.beatHz > 0);

function familyGuidance(preset: Preset): GuidanceOverride {
  const id = preset.id;
  if (preset.category === 'Infant') return {
    experience: 'This is a restricted sound environment, not an infant brainwave or developmental intervention. An infant cannot report listening preference; quiet surroundings may be preferable.',
    howToUse: 'Use only the app’s infant mode, a distant speaker and its calibrated crib-level controls with an attentive caregiver. Never put headphones on an infant or use audio to mask distress. Check the existing infant listening notice before starting.',
    howOften: 'No automatic repeat schedule is recommended. Use only within the existing infant-mode limits and the caregiver’s appropriate clinical guidance; there is no validated developmental dose for this preset.',
    limits: 'Digital dBFS is not the sound level at a crib. The existing calibration, duration, low-pass and level restrictions remain required; this guide does not authorize a longer or louder session.',
  };
  if (id.startsWith('gateway-')) return {
    experience: 'Rest, ordinary thoughts, drowsiness, vivid imagery or a changed sense of bodily boundaries are possible. There is no required milestone and no sensation that confirms a particular Focus level.',
    howToUse: 'Use stereo headphones while comfortably supported. Begin by noticing the actual room; rest attention on the sound without trying to force stillness or an exit from the body. End by moving gently, looking around and journaling what you noticed.',
    howOften: OBE_SCHEDULE,
    limits: OBE_LIMIT + ' This unofficial composition is not an authenticated reconstruction of proprietary Gateway settings; numbered Focus labels are source terminology, not EEG readings or a required progression.',
    sources: [SOURCES.monroe, SOURCES.body, SOURCES.review],
  };
  if (id.startsWith('bashar-study-')) return {
    experience: 'Expect a short sequence of audible musical intervals. You may find one version clearer, softer or more interesting; a preference does not measure consciousness, alignment or contact readiness.',
    howToUse: 'Hear the paired comparison at the same comfortable device setting, with a short quiet pause between versions. Write a description before interpreting it. An optional intention can guide attention, but no particular sensation is required.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: 'These original pitches, timings and comparisons are app choices. The interview source describes reported beliefs; it does not prescribe these tones. In Bashar’s framework an exercise may be called a permission slip, but no sound-to-consciousness calibration or ET-contact effect is established.',
    sources: [SOURCES.bashar, SOURCES.signal],
  };
  if (id.startsWith('night-')) return {
    experience: 'Expect a continuous quiet tone, with any listed nature layer. You may find it restful or distracting; the sound does not follow your sleep stages and changes in sleep quality are possible.',
    howToUse: 'Try 5–10 minutes while awake first. For a wind-down use a short timer and a quiet speaker; preserve your normal sleep opportunity and leave the remaining night quiet if sound is distracting. Read the preset’s specific practice before playback.',
    howOften: 'Optional trial schedule, not a validated dose: compare one short wind-down with a quiet night. Review morning restfulness before repeating. Seven hours is an available soundtrack length, not a recommended nightly exposure.',
    limits: 'Continuous sound does not verify REM, lucid dreaming, hypnosis, remote viewing or healing. No particular benefit follows from listening for the full seven hours; the app has no sleep-stage sensing.',
  };
  if (/lucid|dream|n1-incubation|theta-gamma-interleave|rem-gamma/.test(id) || preset.category === 'Lucid Dream') return {
    experience: 'You may notice drowsiness, drifting images, ordinary thoughts or no change. Dream recall and lucid dreaming vary from night to night; a particular beat rate does not establish either.',
    howToUse: 'Choose a simple intention before resting, use a short quiet timer and record recall after natural waking. Notice imagery without forcing it. Preserve a full sleep opportunity rather than extending the audio or repeatedly waking to chase an experience.',
    howOften: 'Optional practice schedule, not a validated audio dose: try a short session on one or two rested evenings a week and keep a morning journal. Skip it whenever it reduces sleep quality; ordinary dream journaling can continue without audio.',
    limits: 'Studies of learned cues or cognitive dream practice do not validate this composition’s beat rates. This sound has no REM sensing, verified dream readout or automatic OBE effect.',
    sources: [SOURCES.dream, SOURCES.cue],
  };
  if (id.startsWith('frequency-study-') || id.startsWith('nt-') || id.startsWith('research-') || id.startsWith('nano-') || id.startsWith('levitation-')) return {
    experience: 'Expect an audible comparison of pitch, rhythm or texture. Record what you actually hear and your comfort; no bodily response is needed for the signal arithmetic to be correct.',
    howToUse: 'Read the comparison first and use the same comfortable listening setup for both versions. Change one setting at a time, alternate the order on another day, and include a steady-tone or quiet control. The sound does not drive laboratory apparatus.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: 'The acoustic construction can be checked mathematically, while wellness, levitation, electromagnetic and material effects are separate unvalidated claims. Audio playback supplies no apparatus, calibrated physical dose or measured brain state.',
    sources: [SOURCES.signal],
  };
  if (/schumann/.test(id)) return {
    experience: 'You may hear a beat or a changing texture. A named Earth-resonance rate does not require any particular bodily sensation; compare it with a nearby rate if you are exploring preference.',
    howToUse: 'Listen quietly with the setup required by the actual playback mode. Treat the named rate as a number used in an acoustic demonstration and write down sound preference, rather than looking for signs of planetary alignment.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: 'Schumann resonances are electromagnetic cavity resonances. Reusing their numerical rates in audio is an analogy, not exposure to the Earth’s field, a measurement of current anomalies or a proven biological coupling.',
    sources: [SOURCES.signal, SOURCES.review],
  };
  if (/octave|portrait|spectrum|kepler|tesla-369|om-cousto/.test(id)) return {
    experience: 'Expect a musical or acoustic portrait of a calculation. An enjoyable interval or suggestive association is an aesthetic response; it is not a shared physical resonance with the source object.',
    howToUse: 'Read the stated root, ratio or octave mapping, then listen to a short example. Compare with an ordinary tone or interval at the same comfortable level and record the musical impression separately from the historical interpretation.',
    howOften: EXPLORATORY_SCHEDULE,
    limits: 'Octave shifting, number symbolism and color-to-pitch mappings are representational choices. Their arithmetic does not carry an astronomical, optical or electromagnetic process into the body through sound.',
    sources: [SOURCES.signal],
  };
  if (/hypnosis|suggestion/.test(id)) return {
    experience: 'You may notice absorbed attention, ordinary relaxation, imagery or no change. A voluntary phrase can be useful as an intention; there is no required trance depth.',
    howToUse: `${QUIET_USE} Read the preset’s self-guided practice before starting; there is no narrator. Choose a modest voluntary suggestion, let it go at the end and reorient to the room. Do not treat imagined scenes as recovered memories or facts.`,
    limits: 'This original sound bed is not a tested clinical hypnosis intervention and has no hidden or subliminal instructions. A frequency label does not establish hypnotic depth.',
  };
  if (preset.category === 'Sleep') return {
    experience: 'You may find the sound restful, become drowsy, or find it distracting. It is equally reasonable to prefer silence; sleep stages are not established by the beat label.',
    howToUse: 'Use a short quiet timer before bed and keep your normal sleep opportunity. Use stereo headphones only while comfortably awake when a binaural comparison is intended; a quiet speaker or silence is preferable for unattended rest.',
    howOften: 'Optional starter schedule, not a validated sleep dose: compare two short wind-downs on separate evenings with your usual quiet routine. Repeat only if sleep and next-day restfulness are at least as good; there is no need to listen nightly.',
    limits: 'The preset neither detects nor sets sleep stages. Evidence from a particular sleep intervention does not establish this sound as an insomnia treatment.',
  };
  if (preset.category === 'Focus') return {
    experience: 'A steady backdrop may make a task feel easier to settle into, or it may compete with attention. Judge it by the task you complete and comfort, rather than a sensation of reaching a named brainwave band.',
    howToUse: 'Choose one small task before starting, set a comfortable quiet level and try a short work block. Compare with the same kind of task in silence; take your normal breaks instead of extending listening to force concentration.',
    limits: 'Attention varies with task, rest and expectations. The preset does not measure concentration, establish an EEG state or guarantee better performance.',
  };
  if (/heal|vat|comfort|solfeggio|chakra/.test(id)) return {
    experience: 'You may enjoy warmth, rest or a meaningful association with a tradition; you may also notice no change. These are personal reports, separate from treatment outcomes.',
    howToUse: `${QUIET_USE} Let the sound accompany rest or a chosen contemplative intention. You need not assign a medical action to a pitch or force attention onto an uncomfortable body area.`,
    limits: 'A comfort practice or traditional frequency label does not establish organ tuning, tissue repair, disease treatment or a delivered vibroacoustic intervention. The preset’s evidence grade and cited-study limitations still apply.',
  };
  return {
    experience: 'You may find a repeating sound useful for resting attention, notice ordinary thoughts, or prefer silence. The expected audible structure is described above; no particular emotional or bodily response is required.',
    howToUse: `${QUIET_USE} Give attention one simple anchor, such as the audible tone or a fading bowl, and gently return when distracted. Finish by noticing the room before resuming your day.`,
    limits: 'This is a listening practice, not a measured brain-state prescription. Its evidence grade describes the cited claim, not a guarantee that this particular sound will have the same effect for every listener.',
  };
}

function sourceLinks(preset: Preset): PresetGuidance['sources'] {
  const links: { label: string; url: string }[] = [...(preset.links ?? [])];
  for (const citation of preset.citations) {
    const url = citation.match(/https?:\/\/[^\s<>]+/)?.[0]?.replace(/[),.;]+$/, '');
    if (url) links.push({ label: 'Preset source · see its stated evidence scope', url });
  }
  return [...new Map(links.map(link => [link.url, link])).values()];
}

/** Read-only presentation: never modifies a preset, timer, mixer or DSP setting. */
export function presetGuidance(preset: Preset): PresetGuidance {
  const family = familyGuidance(preset);
  const specific = Object.hasOwn(SPECIFIC, preset.id) ? SPECIFIC[preset.id] : {};
  const baseLogic = signalLogic(preset);
  const authoredLogic = specific.logic;
  // The spectral caveat applies even when an authored explanation replaces the summary.
  const monauralCaveat = authoredLogic && preset.spec.phases.some(phase => phase.mode === 'monaural' && phase.beatHz > 0)
    ? ' Preview/export uses sine amplitude modulation; live playback uses two summed tones, so their spectra differ.' : '';
  const setup = usesBinaural(preset.spec.phases) ? ' Use stereo headphones for the binaural sections.' : ' Speakers or headphones can reproduce the authored steady or shared-channel sound.';
  const phaseCap = preset.spec.phases.length > 8
    ? ` The saved recipe contains ${preset.spec.phases.length} sections, but the current Studio loader keeps only the first eight (${format(preset.spec.phases.slice(0, 8).reduce((sum, phase) => sum + phase.durationSec, 0) / 60)} minutes of the authored sequence). Loading does not play the complete saved recipe; the displayed full-plan mathematics is not a promise of full-sequence playback.` : '';
  const loadedUse = phaseCap ? ' When loaded for listening, only the first eight sections are retained; this is a shortened sequence, not the complete saved practice.' : '';
  const guide = {
    logic: (authoredLogic ? authoredLogic + monauralCaveat : baseLogic) + (phaseCap ? ' This describes the stored plan; current Listen/Studio playback loads only the first eight sections.' : ''),
    experience: specific.experience ?? family.experience ?? 'Expect changing musical pitches or a repeating sound. Your listening preference may vary; no particular mental state is required.',
    howToUse: (specific.howToUse ?? family.howToUse ?? QUIET_USE) + (preset.category === 'Infant' ? '' : setup) + loadedUse,
    howOften: specific.howOften ?? family.howOften ?? OPTIONAL_SCHEDULE,
    limits: (specific.limits ?? family.limits ?? 'No physiological outcome is established by the signal calculation alone.') + phaseCap,
    sources: [] as PresetGuidance['sources'],
  };
  const primary = specific.sources ?? family.sources ?? [SOURCES.signal, SOURCES.review];
  guide.sources = [...new Map([...sourceLinks(preset), ...primary].map(link => [link.url, link])).values()];
  return guide;
}
