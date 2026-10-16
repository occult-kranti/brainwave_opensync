/** Selected primary-text passages, with our interpretations separated from their claims. */
export interface TextStudy {
  id: string;
  title: string;
  author: string;
  date: string;
  section: string;
  claim: string;
  formalization: string;
  categoryError: string;
  counterexample: string;
  testableQuestion: string;
  url: string;
  access: string;
}

export const TEXT_STUDIES: readonly TextStudy[] = [
  {
    id: 'text-plato-proportion',
    title: 'Timaeus · proportion and the education of attention',
    author: 'Plato; English translation by Benjamin Jowett',
    date: 'Fourth century BCE; nineteenth-century translation, edition unspecified by host',
    section: '35b–36b: division of the world-soul; 47c–47e: hearing, harmony and rhythm',
    claim: 'The dialogue gives the world-soul a structure of numerical proportions and presents music as an aid to ordered thought and character. Its aim is ethical and cosmological; it does not prescribe a healing pitch.',
    formalization: 'Our acoustic illustration: choose any root f₀ and set f₂ = 3f₀/2. The interval is 1200 log₂(3/2) ≈ 701.955 cents. The root remains a free choice; no value in Hz follows from the ratio.',
    categoryError: 'Turning a dimensionless proportion or an account of the soul into a measured tissue resonance. The text supplies neither a coupling mechanism nor a biological dose.',
    counterexample: '220:330 and 440:660 both realize 3:2, yet have different absolute pitches. The same ratio alone cannot select one uniquely effective frequency.',
    testableQuestion: 'When labels are hidden and order balanced, does preference for a 3:2 interval persist across several roots and timbres? This tests a limited listening question, not the dialogue’s cosmology.',
    url: 'https://classics.mit.edu/Plato/timaeus.html',
    access: 'Full Jowett translation publicly accessible; the cited passages read. Modern formula and counterexample are our analysis, not Plato’s notation.',
  },
  {
    id: 'text-inayat-context',
    title: 'The Mysticism of Sound / Music · context, voice and care',
    author: 'Hazrat Inayat Khan; compiled lectures in The Sufi Message, Volume II',
    date: 'Mysticism of Sound first published 1923; Music includes 1921 lectures and later collected papers',
    section: 'Part I, Chapters I–III; Part II, Chapter XIII, The Healing Power of Music',
    claim: 'Khan places sound within Sufi spiritual development and treats tone, rhythm, sympathy and the listener’s circumstances as connected. He also claims broad healing powers, while describing a hospital concert that distressed its listeners.',
    formalization: 'A defensible subset is contextual: describe tempo, spectral brightness, loudness, voice prosody and familiarity separately, then compare reported comfort. This is our proposed measurement framework, not a translation of spirit into Hz.',
    categoryError: 'Equating spiritual harmony with a medical diagnosis, or inferring that illness is caused by insufficient love or the wrong thought. Those claims go beyond the chapter’s anecdotes.',
    counterexample: 'Khan’s own hospital-concert story defeats an unconditional claim that music always helps. His emphasis on fitting the music to the listener is more specific than a universal frequency list.',
    testableQuestion: 'At comfortable listening levels, does a listener-chosen sound differ from an assigned sound in comfort ratings? Record familiarity and expectations; neither a change nor a null result establishes a cure.',
    url: 'https://wahiduddin.net/mv2/II/II_21.htm',
    access: 'Full chapters and preface read in the public Wahiduddin transcription. This is a compiled edition, not a first-edition facsimile; the exact date of Chapter XIII is not established by its page.',
  },
  {
    id: 'text-kybalion-vibration',
    title: 'The Kybalion · the vibration analogy',
    author: 'Three Initiates (the authorship printed in the source)',
    date: 'Early twentieth century; accessed transcription’s title page states 1912',
    section: 'Chapter IX, Vibration; Chapter II’s summary provides context',
    claim: 'The authors propose a continuum from matter through mind to spirit and use an accelerating wheel to illustrate rising vibration. Their practical aim is deliberate mental change; the claimed ancient lineage is the book’s own assertion.',
    formalization: 'For a specified periodic observable only, f = 1/T and x(t) = A cos(2πft + φ). The text gives no measurable variable, instrument or conversion for a “mental vibration”; such a frequency cannot be computed from its analogy.',
    categoryError: 'Treating sound, rotation, electromagnetic radiation and mental experience as one physical quantity because all can be described using the word vibration. Shared units of repetition do not supply a shared mechanism.',
    counterexample: 'A 440 Hz pressure wave and a 440 Hz changing electric signal have the same repetition rate but different measured quantities and coupling. Raising audio pitch alone does not turn a speaker’s sound into visible light.',
    testableQuestion: 'Does a neutral versus contemplative description change ratings of the identical audio? That could examine interpretation and attention, without claiming to measure the book’s spiritual scale.',
    url: 'https://www.gutenberg.org/cache/epub/14209/pg14209.html',
    access: 'Complete Chapter IX and contextual Chapter II read in Project Gutenberg eBook 14209. The displayed edition date is retained; the transcription is not evidence of an ancient manuscript.',
  },
  {
    id: 'text-helmholtz-beats',
    title: 'Sensations of Tone · what a beat actually measures',
    author: 'Hermann von Helmholtz; translated and annotated by Alexander J. Ellis',
    date: '1895 third English edition; reprint of the 1885 edition based on the 1877 German edition',
    section: 'Part II, Chapter VIII, pp. 159–166: interference and the origin of beats',
    claim: 'Helmholtz distinguishes the motion of sound sources from the listener’s sensation, then uses interference and a double siren to relate beat count to frequency difference. This supplies a concrete acoustic model rather than a universal wellness law.',
    formalization: 'Our notation: cos(2πf₁t) + cos(2πf₂t) = 2 cos(π(f₂−f₁)t) cos(π(f₁+f₂)t). Envelope magnitude repeats at |f₂−f₁|. A linear two-tone sum has no separate spectral line at that difference.',
    categoryError: 'Reading an acoustic beat rate as an EEG measurement, or treating physical intensity and subjective loudness as interchangeable. The historical physiological account also needs its own modern evaluation.',
    counterexample: 'Two equal-frequency, equal-amplitude waves can reinforce or cancel depending on phase. Frequency alone does not determine even the local acoustic amplitude, much less a health outcome.',
    testableQuestion: 'For a quiet rendered two-tone sum, do envelope peak counts equal the frequency difference while the FFT retains the two source lines? Compare with sine AM, which adds sidebands around a carrier.',
    url: 'https://archive.org/stream/onsensationsofto00helmrich/onsensationsofto00helmrich_djvu.txt',
    access: 'Public full-book OCR and edition metadata accessible via the University of California scan. Cited pages read; OCR contains errors, and Ellis’s bracketed additions are distinguished from the author’s text.',
  },
];
