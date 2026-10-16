export type CulturalSource = {
  id: string;
  title: string;
  kind: string;
  claim: string;
  limits: string;
  url: string;
  access: string;
  idea: string;
};

export const CULTURAL_SURVEY_SCOPE =
  'A selected survey of historical texts, spiritual writing and commercial sound products. Full books and paid audio were not comprehensively reviewed. Listening ideas are original compositions, with no claim to reproduce a branded program or treat disease.';

export const CULTURAL_SOURCES: readonly CulturalSource[] = [
  {
    id: 'plato-harmony',
    title: 'Plato · Timaeus',
    kind: 'Historical philosophy',
    claim: 'The dialogue connects cosmic order and the soul with musical proportions, including 3:2 and 4:3.',
    limits: 'This is a historical cosmology. The ratios do not establish a biological treatment or a special healing pitch.',
    url: 'https://classics.mit.edu/Plato/timaeus.html',
    access: 'Full Benjamin Jowett translation accessible; relevant harmony passages checked.',
    idea: 'An original fifth-and-octave drone with a ratio display and a comparison against equal temperament.',
  },
  {
    id: 'nada-brahma',
    title: 'The World Is Sound · Nada Brahma',
    kind: 'Modern spiritual synthesis',
    claim: 'Joachim-Ernst Berendt explores listening, musical traditions and spiritual interpretations of sound.',
    limits: 'The publisher description mixes cultural interpretation with broad scientific claims. It supplies no clinical validation of this listening idea.',
    url: 'https://www.simonandschuster.com/books/The-World-Is-Sound-Nada-Brahma/Joachim-Ernst-Berendt/9780892813186',
    access: 'Publisher description and 1991 edition details checked; full book not reviewed.',
    idea: 'A slowly changing harmonic drone for observing timbre, attention and personal preference.',
  },
  {
    id: 'goldman-harmonics',
    title: 'Jonathan Goldman · Healing Sounds',
    kind: 'Spiritual practice and paid book',
    claim: 'The author sells a harmonics book with vocal examples, meditation audio and spiritual interpretations of sound.',
    limits: 'Claims about immunity, chakras and transformation are promotional claims. The sales page is not a controlled study.',
    url: 'https://www.healingsounds.com/product/healing-sounds-book/',
    access: 'Author sales page checked; full book and paid recordings not accessed.',
    idea: 'An original additive-synthesis voice-like tone whose harmonics can be heard one at a time.',
  },
  {
    id: 'jenny-cymatics',
    title: 'Hans Jenny · Cymatics',
    kind: 'Historical wave experiments',
    claim: 'The publisher offers a combined edition of Jenny’s books on visible wave and vibration phenomena.',
    limits: 'A pattern in a vibrating material does not demonstrate healing in tissue. A browser image is a model, not an observation of the body.',
    url: 'https://www.cymaticsource.com/',
    access: 'Publisher listing verified through indexed content; direct fetch failed and full books were not reviewed.',
    idea: 'Pair an original tone with a clearly labelled membrane-mode visualization; compare boundaries and mode numbers.',
  },
  {
    id: 'solfeggio-provenance',
    title: 'Modern Solfeggio claims',
    kind: 'Esoteric claim provenance',
    claim: 'A publisher-hosted review and author reply connect Healing Codes for the Biological Apocalypse with numerology and healing claims about musical tones.',
    limits: 'This documents what promoters claim. It does not establish an ancient fixed-Hz tuning system, DNA repair or disease treatment.',
    url: 'https://tetrahedron.org/healing-codes-for-the-biological-apocalypse/',
    access: 'Review and author reply read; full book not reviewed. Page dated 2015 includes a review copyrighted 1999.',
    idea: 'Compare a tone labelled by frequency with nearby pitches under hidden labels; record preference without assigning healing powers.',
  },
  {
    id: 'gateway-product',
    title: 'Hemi-Sync · Gateway Experience',
    kind: 'Commercial consciousness program',
    claim: 'The vendor markets eight progressive audio albums for meditation and expanded awareness, including metaphysical exercises.',
    limits: 'Vendor descriptions and government archival interest do not validate paranormal or clinical claims. Focus labels are program names, not EEG measurements.',
    url: 'https://hemi-sync.com/gateway-experience/',
    access: 'Public vendor description checked; historical Army scan reviewed separately with a missing page disclosed. Paid tracks and manuals not accessed.',
    idea: 'An original stereo-beat listening demonstration with gentle fades and plain attention prompts; no copied script or recording.',
  },
  {
    id: 'brainfm-product',
    title: 'Brain.fm · Modulated music',
    kind: 'Commercial product and preliminary research',
    claim: 'The vendor uses amplitude modulation in music. A 2024 paper reports attention-related effects under specific experimental conditions.',
    limits: 'Effects varied with presentation order and listener characteristics. The paper has 2025 and 2026 corrections; its current disclosures include company employment and equity.',
    url: 'https://www.brain.fm/science',
    access: 'Vendor page and published paper checked. The 2025 correction adds an author; the 2026 correction updates financial-interest disclosures.',
    idea: 'Compare an original steady soundscape with an otherwise identical softly modulated version; treat results as personal observations.',
  },
  {
    id: 'endel-product',
    title: 'Endel · Adaptive soundscapes',
    kind: 'Commercial product and preliminary research',
    claim: 'The vendor offers changing soundscapes for focus, relaxation and sleep. A published study compared soundscapes, playlists and silence.',
    limits: 'The study used an EEG-derived focus measure and found task-dependent results. Arctop and Endel funded it; authors worked for Arctop. This is not independent clinical validation.',
    url: 'https://endel.io/science',
    access: 'Public vendor page and full 2022 study checked; paid app not tested.',
    idea: 'An original slowly evolving noise-and-tone bed with a static comparison and user-selected texture changes.',
  },
];
