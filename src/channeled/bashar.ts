/** Supplied digest claims remain unverified; arithmetic has a separate scope. */
import type { FrequencyEntry } from '@/data/frequencies';
import type { KnowledgeEntry } from '@/data/knowledge';
import type { Preset } from '@/data/presets';
import { CLEAN_PRESET_MIX } from '@/data/presetMix';
import { map, PHI_CENTS, PHI_LADDER_HZ, SCALE_READINGS, vacuumWavelength } from './mapping';

export interface ExhibitSource {
  label: string;
  url?: string;
}

const digest = (id: string): ExhibitSource => ({
  label: `Bashar session, video id ${id} — supplied auto-transcript digest; transcript unverified`,
  url: `https://www.youtube.com/watch?v=${id}`,
});

export const DIGEST_SOURCE: ExhibitSource = {
  label: 'User-supplied bashar-opensync-prompt.md, sections 3–4 (auto-transcript digests, not verified transcripts)',
};
export const UNIT_SOURCE: ExhibitSource = {
  label: 'BIPM, SI Brochure: hertz is the unit of frequency; Hz = s⁻¹',
  url: 'https://www.bipm.org/en/publications/si-brochure',
};
export const LIGHT_SOURCE: ExhibitSource = {
  label: 'NIST CODATA: speed of light in vacuum, 299,792,458 m/s (exact)',
  url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
};
export const PLANCK_SOURCE: ExhibitSource = {
  label: 'NIST CODATA: Planck time, approximately 5.391247 × 10⁻⁴⁴ s',
  url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt',
};
export const EEG_SOURCE: ExhibitSource = {
  label: 'Braboszcz et al. (2017), PLOS ONE: alpha and gamma measures in the same EEG study; not a study of Anka',
  url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0170647',
};

export const MAPPING_CONTEXT =
  'With chosen k = 5,000, anchored on 200,000 ↔ 40 Hz, divide each source number by 5,000.';
export const MAPPING_LIMIT =
  'The constant fits one reference point. Other results falling within EEG bands do not establish a physical connection.';
export const MAPPING_NOTE =
  `${MAPPING_CONTEXT} Grade A covers this reproducible arithmetic only. Grade D covers what the source numbers measure: the supplied digest identifies no instrument or operational measurement method. Cycles per second and Hz have the same dimension; the physical quantity is unspecified. ${MAPPING_LIMIT}`;
export const PHI_NOTE =
  `Grade A arithmetic: φ = (1 + √5)/2; 110 × φ = ${PHI_LADDER_HZ[1].toFixed(5)} Hz, and 1,200 log₂(φ) = ${PHI_CENTS.toFixed(2)} cents. This is a pitch ratio, not a beat rate. Grade D covers the supplied digest's consciousness interpretation; no physiological outcome is established.`;

export const BASHAR_COPY = {
  title: 'Channeled Sources',
  eyebrow: 'BASHAR · SOURCE REVIEW',
  subtitle: 'Read the supplied claims, check the calculations, and listen to examples.',
  provenanceTitle: 'Sources and limits',
  provenance: [
    'This page uses the supplied auto-transcript digests of sessions attributed to Bashar through Darryl Anka. The original transcripts have not been independently verified.',
    'Grade D covers the source claims. Grade A covers the calculations. These grades make no judgment about the origin of the material.',
    'No fixed musical tuning is prescribed in the supplied digest. It provides no support for 432 Hz or 528 Hz products, and does mention EEG values in Hz. This review covers only the supplied material.',
  ],
  provenanceNote: 'Session links come from the supplied brief. The summaries are paraphrases of its digests; the original wording and attribution remain unverified.',
  claimGrade: 'D · SOURCE CLAIMS',
  arithmeticGrade: 'A · ARITHMETIC ONLY',
  sourceLinkLabel: 'Source / verification status',
  sourceStatus: 'Supplied digest · unverified',
  gradeLabel: (grade: string) => `Grade ${grade}`,
  harmonicLink: 'Explore ratios in Harmonic Lab',
  jumpLabel: 'Exhibit sections',
  sections: [
    { id: 'source', label: 'Reported claims' },
    { id: 'consistency', label: 'Measurement & consistency' },
    { id: 'mapping', label: 'Scale calculator' },
    { id: 'literal', label: 'Units and calculations' },
    { id: 'play', label: 'Play & compare' },
  ],
  sourceIntro: 'Six themes from the supplied digest. All source claims are Grade D, including claims about consciousness and reported readings.',
  consistencyIntro: 'The supplied brief includes no recordings, instrument specifications, raw EEG data, measurement uncertainty, or calibration.',
  mappingTitle: 'Divide by a chosen constant',
  mappingIntro: MAPPING_CONTEXT,
  mappingLimit: MAPPING_LIMIT,
  mappingGrade: 'A for division · D for a link to consciousness',
  mappingCaption: `Illustrative mapping table. ${MAPPING_CONTEXT}`,
  tableHeaders: ['Stated cycles/s', 'Illustrative result', 'Catalog EEG band', 'Source status'],
  bandNames: { 'band-theta': 'Theta', 'band-alpha': 'Alpha', 'band-beta': 'Beta', 'band-gamma': 'Gamma' },
  bandNote: 'Band labels use this app’s existing EEG catalog and are conventions, not state diagnoses. Here the catalog defines gamma as 30–100 Hz; 40 Hz is the chosen anchor, not a universal gamma onset.',
  anchorLabel: 'chosen anchor',
  calculatorLabel: 'Try a stated number',
  calculatorHelp: 'Divides your number by 5,000. No body signal is measured.',
  calculatorInvalid: 'Enter a finite number from 0 to 1,000,000.',
  calculatorResult: (stated: number, result: number) =>
    `With chosen k = 5,000, anchored on 200,000 ↔ 40 Hz: ${stated.toLocaleString('en-US')} ÷ 5,000 = ${result.toLocaleString('en-US', { maximumFractionDigits: 5 })} Hz (illustrative result; Grade A arithmetic, Grade D interpretation).`,
  literalIntro: 'Hz counts cycles per second. To interpret a frequency, identify what changes: sound pressure, a field, or a recorded electrical signal.',
  phiTitle: 'Golden-ratio pitches',
  phiSubtitle: 'Five pitches · one repeated golden-ratio interval',
  phiFormula: `fₙ = 110 × φⁿ Hz · φ = (1 + √5)/2 · ${PHI_CENTS.toFixed(2)} cents per step`,
  phiNote: PHI_NOTE,
  phiDifference: `At a 200 Hz lower pitch, φ spacing gives an arithmetic separation of ${(200 * ((1 + Math.sqrt(5)) / 2 - 1)).toFixed(2)} Hz. That separation is not a supported binaural beat rate; a perceived difference tone is not guaranteed.`,
  playIntro: 'These presets demonstrate sound patterns. No measured consciousness state or contact method is established. Preview plays the opening segment; Studio loads the full sequence for editing and WAV export. The requested 20-second phase fades are saved as metadata but do not run during playback or export.',
  preview: 'Preview opening',
  previewBlocked: 'Previews are unavailable during a running session, mute, panic, or infant mode.',
  previewAdvisory: 'Read the listening advisory before previewing; then press Preview opening again.',
  stopPreview: 'Stop preview',
  loadPreset: 'Load in Studio',
  bowlTitle: 'Golden-ratio bowl chord',
  bowlDescription: 'Five bowl fundamentals at 110 × φⁿ, played together with the existing bowl model. The modeled partials are not pure sine waves. Grade A describes the fundamental spacing only; Grade D covers the source interpretation.',
  bowlLoad: 'Load bowl chord',
  bowlHelp: 'Loads a 15-minute preset with five modeled bowls and a steady 110 Hz root. The preset replaces the previous sound mix and opens Studio without starting playback.',
  presetMeta: (minutes: number) => `${minutes} min · Grade D · experimental tier`,
  phaseLabel: (index: number, carrier: number, beat: number, mode: string) =>
    `${index + 1}. ${carrier.toFixed(2)} Hz carrier · ${beat} Hz ${mode === 'monaural' ? 'monaural modulation' : beat === 0 ? 'no beat' : 'binaural beat'}`,
  sourcesTitle: 'Missing evidence',
  nextEvidence: 'Original transcripts with timestamps are needed to check attribution. Testing the scale also needs a defined quantity, a calibrated instrument, raw recordings, and predictions checked against new data.',
} as const;

export const SOURCE_CARDS = [
  {
    id: 'vibrational-scale', title: 'A. A claimed vibrational scale',
    text: 'The digest reports 30,000–50,000 cycles/s for an average human, 200,000+ for coherent consciousness, and 333,000 as a maximum physical value. It also reports individual readings of 143,000 and 146,000, and a temporary drop to 137,000 when a measurement was requested. These are reported numbers, not measurements verified here.',
    grade: 'D', sources: ['p8JC21bFf5M', 'ygzBrMyMAQA', 'lLFUTAVah30', 'hTlU_M_R0eE'].map(digest),
  },
  {
    id: 'eeg-claims', title: 'B. Separate EEG descriptions',
    text: 'The digest describes channeling as gamma activity at 40–100 cycles/s, and separately reports an EEG set point changing from 9 Hz to 10–11 Hz. The underlying recordings, analysis protocol, and definitions of state and set point are not supplied.',
    grade: 'D', sources: ['mgSgI0ElfTI', 'ZACIL5Hzb5c', '7WjydoNj7hE'].map(digest),
  },
  {
    id: 'frame-rate', title: 'C. A proposed reality frame rate',
    text: 'The digest attributes a reality-shifting frame rate of 10⁴³ to the source without a session ID. This is a separate claim with no supplied measurement protocol; the reference to Planck time does not establish physical frames of reality.',
    grade: 'D', sources: [DIGEST_SOURCE],
  },
  {
    id: 'phi', title: 'D. Chords based on phi',
    text: 'The digest associates chords at a ratio of approximately 1:1.618 with a template of nature and consciousness. The ratio can be calculated and used for pitch spacing; its proposed meaning is a separate Grade D claim. The 110 Hz base in this app is our musical choice.',
    grade: 'D', sources: [digest('Rcjd1TkZUMY')],
  },
  {
    id: 'sound-current', title: 'E. A three-layer sound current',
    text: 'The digest describes physical sound, an energetic template, and an underlying light matrix, and connects electronic plus acoustic instruments to a complete spectrum. These layers have no operational definitions or measuring instruments in the supplied material.',
    grade: 'D', sources: [digest('Rcjd1TkZUMY')],
  },
  {
    id: 'music-state', title: 'F. Music and subjective state',
    text: 'In a hospice or transition context, the digest connects musical harmonics with spirit frequencies; elsewhere it emphasizes the state created by music over literal words. These are source interpretations, not established physiological or communication mechanisms.',
    grade: 'D', sources: [digest('9FrwPg8FYvM'), digest('94agFEADfyk')],
  },
] as const;

export const CONSISTENCY_CARDS = [
  {
    title: 'No measurement method supplied',
    text: 'The supplied digest of session 94agFEADfyk says the method is outside current scientific understanding and combines physical and spirit-realm vibrations. That is not an operational method a reader can reproduce. Cycles/s is dimensionally Hz, but the measured quantity, instrument, and calibration remain unspecified.',
    grade: 'D', sources: [digest('94agFEADfyk'), UNIT_SOURCE],
  },
  {
    title: 'Alpha and gamma: unresolved descriptions',
    text: 'The reported 9–11 Hz values fall in the app’s alpha range; 40–100 Hz overlaps its gamma range. Different bands can coexist, and an alpha peak can change while gamma power changes. Without the original recordings or a definition of set point, these descriptions are not a demonstrated contradiction and establish no finding about Anka.',
    grade: 'D', sources: [digest('7WjydoNj7hE'), digest('mgSgI0ElfTI'), EEG_SOURCE],
  },
  {
    title: 'One fitted reference point',
    text: `${MAPPING_CONTEXT} The digest does not establish that an average human must map to beta, so imposing that extra anchor cannot prove the source internally inconsistent. The claimed vibrational scale, EEG frequencies, and frame rate remain separate until an explicit model links them.`,
    grade: 'D', sources: [DIGEST_SOURCE],
  },
] as const;

export const LITERAL_CARDS = [
  {
    title: '200,000 cycles/s = 200 kHz, dimensionally',
    text: 'If a periodic process actually makes 200,000 cycles per second, its frequency is 200 kHz. That equivalence alone does not tell us whether the source refers to sound, electromagnetic fields, neural signals, or any measurable quantity.',
    grade: 'A', sources: [UNIT_SOURCE],
  },
  {
    title: 'Conditional electromagnetic calculation',
    text: `Only if the signal is an electromagnetic wave in vacuum, λ = c/f gives ${vacuumWavelength(200_000).toFixed(2)} m at 200 kHz, with a geometric half-wavelength of ${(vacuumWavelength(200_000) / 2).toFixed(2)} m. Conversely, a 1.7 m geometric half-wavelength corresponds to ${(299_792_458 / (2 * 1.7) / 1e6).toFixed(2)} MHz. A human body is not an ideal wire antenna; these equations do not calculate its actual resonance.`,
    grade: 'A', sources: [LIGHT_SOURCE],
  },
  {
    title: 'Planck-time calculation',
    text: 'Using the CODATA Planck time, 1/tₚ is approximately 1.855 × 10⁴³ s⁻¹, not exactly 10⁴³. The reciprocal is arithmetic (Grade A); a universal reality frame rate is a separate source claim (Grade D). No frame-counting measurement is supplied.',
    grade: 'A', sources: [PLANCK_SOURCE, DIGEST_SOURCE],
  },
] as const;

export const BASHAR_FREQUENCIES: readonly FrequencyEntry[] = [
  ...SCALE_READINGS.map((reading): FrequencyEntry => ({
    id: `bashar-map-${reading.stated / 1_000}k`,
    name: `Bashar digest: ${reading.stated.toLocaleString('en-US')} illustrative map`,
    hz: map(reading.stated), grade: 'A', secondaryGrade: 'D',
    secondaryScope: 'what the source numbers measure',
    origin: `${MAPPING_CONTEXT} ${MAPPING_LIMIT}`,
    citation: reading.sessionIds.map((id) => digest(id).label).join('; '),
    note: MAPPING_NOTE + (reading.stated === 333_000 ? ' Library LOAD routes 66.6 Hz to the carrier, not the beat; use the scale-map preset for monaural modulation.' : reading.stated === 200_000 ? ' Use the scale-map preset for 40 Hz monaural modulation; generic Library LOAD may preserve an unsuitable binaural mode.' : ''),
  })),
  {
    id: 'bashar-phi-interval', name: 'Phi pitch interval from 110 Hz', hz: PHI_LADDER_HZ[1],
    grade: 'A', secondaryGrade: 'D', secondaryScope: 'the nature-template claim',
    origin: 'Exact golden-ratio pitch arithmetic applied to a 110 Hz base chosen for this app; meaning is attributed to the supplied digest, not established by the ratio.',
    citation: digest('Rcjd1TkZUMY').label, note: PHI_NOTE,
  },
];

export const BASHAR_KNOWLEDGE: readonly KnowledgeEntry[] = [
  {
    id: 'history-bashar-corpus', title: 'Bashar: supplied summaries and source limits', category: 'history',
    claim: 'The supplied Bashar digests establish a measurable consciousness-frequency scale.', grade: 'D',
    verdict: 'The supplied brief attributes the sessions to Darryl Anka channeling Bashar since 1983. This exhibit has auto-transcript digests, not independently verified full transcripts or measurements. It takes no position on the source of the material. Numbers and ratios can be audited without validating the claimed scale.',
    citations: [DIGEST_SOURCE.label],
  },
  {
    id: 'myth-bashar-hz-products', title: 'Do 432 or 528 Hz products follow from this source?', category: 'myth-bust',
    claim: 'Bashar prescribes 432 Hz or 528 Hz as a musical tuning.', grade: 'D',
    verdict: 'There is no support for a 432 Hz or 528 Hz musical prescription in the supplied digest. The digest does mention EEG Hz values and a phi pitch ratio; it does not prescribe a fixed musical tuning. This limited source review cannot establish absence throughout the complete corpus or audit every third-party product.',
    citations: [DIGEST_SOURCE.label, digest('Rcjd1TkZUMY').label],
  },
  {
    id: 'myth-bashar-cps-literal', title: 'Does 200,000 cycles/s identify a human frequency?', category: 'myth-bust',
    claim: 'A stated 200,000 cycles/s reading is a measured human or brain frequency.', grade: 'D',
    verdict: 'Cycles/s is dimensionally Hz, so 200,000 cycles/s is 200 kHz; the missing pieces are the measured quantity, instrument, and calibration. Only under an electromagnetic-wave-in-vacuum assumption does c/f give a wavelength of about 1,499 m. This arithmetic does not establish a body resonance, an EEG frequency, or a sound-to-consciousness conversion.',
    citations: [digest('94agFEADfyk').label, UNIT_SOURCE.url!, LIGHT_SOURCE.url!],
  },
  {
    id: 'myth-bashar-gamma-alpha', title: 'Alpha and gamma descriptions need the recordings', category: 'myth-bust',
    claim: 'The source’s alpha set point and gamma description verify a special channeling state.', grade: 'D',
    verdict: 'The digest reports 40–100 cycles/s as gamma and a separate 9 → 10–11 Hz set-point change. Those lower numbers fall in the app’s alpha band. Alpha and gamma can coexist; different statistics could describe one recording. Without raw EEG, protocols, or definitions, the descriptions are unresolved rather than a demonstrated contradiction or a finding about an individual.',
    citations: [digest('mgSgI0ElfTI').label, digest('ZACIL5Hzb5c').label, digest('7WjydoNj7hE').label, EEG_SOURCE.url!],
  },
];

export const BASHAR_PRESETS: readonly Preset[] = [
  {
    id: 'exp-bashar-scale-map', title: 'Bashar scale illustration (experimental tier)', category: 'Experimental', grade: 'D',
    spec: {
      autoShutoff: true,
      mix: CLEAN_PRESET_MIX,
      phases: SCALE_READINGS.map((reading) => ({
        name: `Illustration: ${reading.stated.toLocaleString('en-US')}`,
        durationSec: 300, carrierHz: 200, beatHz: map(reading.stated), gainDbFs: -16, rampSec: 20,
        mode: map(reading.stated) > 30 ? 'monaural' as const : 'binaural' as const,
      })),
    },
    rationale: `${MAPPING_CONTEXT} Seven five-minute audio phases illustrate that chosen mapping; Grade A covers the division, Grade D covers any link to the source’s scale. ${MAPPING_LIMIT} The final 40 Hz and 66.6 Hz phases use monaural modulation.`,
    citations: [DIGEST_SOURCE.label, digest('p8JC21bFf5M').label, digest('hTlU_M_R0eE').label],
  },
  {
    id: 'exp-bashar-gamma-contradiction', title: 'Alpha / gamma descriptions (experimental tier)', category: 'Experimental', grade: 'D',
    spec: { autoShutoff: true, mix: CLEAN_PRESET_MIX, phases: [
      { name: 'Alpha-range illustration', durationSec: 600, carrierHz: 200, beatHz: 10.5, mode: 'binaural', gainDbFs: -16, rampSec: 20 },
      { name: 'Gamma-range illustration', durationSec: 600, carrierHz: 200, beatHz: 40, mode: 'monaural', gainDbFs: -16, rampSec: 20 },
    ] },
    rationale: 'A 10.5 Hz binaural segment followed by 40 Hz monaural modulation illustrates two descriptions in the supplied digest. Changing both rate and mode makes this a listening comparison, not a controlled neuroscience experiment. No EEG is measured. Alpha and gamma can coexist; the descriptions are unresolved without recordings and definitions.',
    citations: [digest('7WjydoNj7hE').label, digest('mgSgI0ElfTI').label],
  },
  {
    id: 'exp-phi-ladder', title: 'Golden-ratio pitch ladder (experimental tier)', category: 'Experimental', grade: 'D',
    spec: { autoShutoff: true, mix: CLEAN_PRESET_MIX, phases: PHI_LADDER_HZ.map((carrierHz, n) => ({
      name: `Phi pitch ${n + 1}`, durationSec: 300, carrierHz, beatHz: 0, mode: 'binaural', gainDbFs: -16, rampSec: 20,
    })) },
    rationale: `Five sequential carriers follow 110 × φⁿ with no beat. ${PHI_NOTE} Full precision is retained in playback; displayed pitches are rounded. The starting pitch and durations are app design choices.`,
    citations: [digest('Rcjd1TkZUMY').label],
  },
  {
    id: 'exp-phi-bowl-chord', title: 'Golden-ratio bowl chord (experimental tier)', category: 'Experimental', grade: 'D',
    spec: {
      autoShutoff: true,
      phases: [{ name: 'Steady root and five modeled bowls', durationSec: 900, carrierHz: 110, beatHz: 0, mode: 'binaural', gainDbFs: -16 }],
      mix: {
        ...CLEAN_PRESET_MIX,
        bowls: PHI_LADDER_HZ.map((baseHz, n) => ({
          on: true, material: 'crystal-quartz', strike: 'soft', baseHz,
          db: -26, pan: -0.6 + n * 0.3, restrikeSec: 12, lock: false,
        })),
      },
    },
    rationale: `Five modeled bowls play together at 110 × φⁿ, with a steady 110 Hz sine root and a new strike every 12 seconds. These are synthesized instruments, not acoustic recordings. ${PHI_NOTE} The root, bowl voice, duration, level and timing are app choices.`,
    citations: [digest('Rcjd1TkZUMY').label],
  },
];
