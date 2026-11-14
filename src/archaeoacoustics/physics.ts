import type { Topic } from './types';

const metre = { title: 'BIPM, the SI metre and the fixed value of c', url: 'https://www.bipm.org/en/si-base-units/metre' };
const wavelength = { title: 'OpenStax, wave speed, frequency and wavelength', url: 'https://openstax.org/books/college-physics-ap-courses/pages/17-2-speed-of-sound-frequency-and-wavelength' };
const solarModes = { title: 'NASA Marshall, helioseismology and five-minute oscillations', url: 'https://solarscience.msfc.nasa.gov/Helioseismology.shtml' };
const solarAudio = { title: 'NASA and Stanford, SOHO Doppler data and sonification', url: 'https://www.nasa.gov/solar-system/sounds-of-the-sun/' };
const survey = { title: 'Dash and Paulson, the 2015 Great Pyramid base survey', url: 'https://doi.org/10.1177/030751331610200114' };
const schumann = { title: 'Balser and Wagner (1960), Earth–ionosphere cavity observations', url: 'https://doi.org/10.1038/188638a0' };
const schumannModes = { title: 'Morente et al., nominal peaks and electromagnetic cavity model', url: 'https://doi.org/10.1029/2006JA011726' };
const eeg = { title: 'American Epilepsy Society, clinical EEG frequency bands', url: 'https://www.ncbi.nlm.nih.gov/books/NBK390342/?report=reader' };
const cook = { title: 'Cook, Pajot and Leuchter (2008), 110 Hz pilot study', url: 'https://doi.org/10.2752/175169608783489099' };
const cookFull = { title: 'Cook, Pajot and Leuchter, methods and Table 1', url: 'https://icrl.org/wp-content/uploads/2020/02/Brain-Activity-And-Acoustic-Resonance.pdf' };
const review = { title: 'Ingendoh, Posny and Heine (2023), systematic review of binaural beats and EEG', url: 'https://doi.org/10.1371/journal.pone.0286023' };
const beatAnalysis = { title: 'Orozco Perez, Dumas and Lehmann (2020), signal and EEG comparison', url: 'https://doi.org/10.1523/ENEURO.0232-19.2020' };

export const physicsTopics: Topic[] = [
  {
    id: 'celestial',
    title: 'Celestial Music',
    kicker: 'Giza, musical ratios and the Sun',
    dek: 'Follow the claim from pyramid surveys through a unit conversion, a musical interval and a real solar oscillation.',
    sections: [
      {
        title: 'Giza in cubits and metres',
        evidence: 'Measured',
        body: 'Dash and Paulson identified 84 points with evidence of the original Great Pyramid baseline, then estimated the base geometry and its uncertainty. Egyptian measuring rods document a cubit of about 52 cm. Today the metre is defined through the exact SI value c = 299,792,458 m/s, formalized through the 1983 light-based definition and the 2018 revision of the SI.',
        refs: [survey, { title: 'UCL Digital Egypt, cubits and surviving measuring rods', url: 'https://www.ucl.ac.uk/museums-static/digitalegypt/weights/lenght.html' }, metre, { title: '1983 General Conference on Weights and Measures resolution', url: 'https://www.bipm.org/en/committees/cg/cgpm/17-1983/resolution-1' }],
      },
      {
        title: 'The latitude digit match',
        evidence: 'Unverified',
        body: 'A viral version compares 29.9792458° N with 299,792,458 m/s after moving the decimal point. That line crosses the footprint roughly 7 m north of the summit survey’s mast base at 29.9791821° N. The resemblance depends on the choice of line, decimal degrees, metres per second and the decimal shift. Evidence of intentional encoding would need an independently documented ancient rule that predicts the reference point and units in advance.',
        refs: [{ title: 'Glen Dash, 2018 GPS survey of the summit', url: 'https://aeraweb.org/wp-content/uploads/2022/08/aeragram19_1.pdf#page=19' }, { title: 'Full Fact, tracing the selected latitude through Giza', url: 'https://fullfact.org/online/great-pyramid-speed-of-light/' }, metre],
      },
      {
        title: 'A second is different from a metre',
        evidence: 'Model',
        body: 'At 0.1, 1, 10 and 100 Hz, the periods are 10, 1, 0.1 and 0.01 seconds. For wavelengths use λ = v/f. In air at 20 °C with v ≈ 343 m/s the same four frequencies give about 3,430, 343, 34.3 and 3.43 m. Their vacuum electromagnetic wavelengths are 2,997,924,580, 299,792,458, 29,979,245.8 and 2,997,924.58 m. The proposed 10, 1, 0.1 and 0.01 metres require an assumed speed of 1 m/s.',
        refs: [wavelength, metre],
      },
      {
        title: 'The music of the spheres',
        evidence: 'Tradition',
        body: 'Aristotle discussed and challenged the ancient theory that celestial motion made a harmony. Kepler’s Harmonices mundi (1619), Book V, compared the extrema of planets’ apparent daily angular motion as seen from the Sun to musical intervals. With the 100 Hz pitch chosen for the listening example, a just perfect fifth at 3:2 is 150 Hz. The fifth harmonic at 5:1 is 500 Hz.',
        refs: [{ title: 'Aristotle, On the Heavens, Book II, Chapter 9', url: 'https://logoslibrary.org/aristotle/heavens/209.html' }, { title: 'Kepler, Harmonices mundi, first edition at ETH Library', url: 'https://www.e-rara.ch/zut/content/titleinfo/3337735' }],
      },
      {
        title: 'What the Sun actually oscillates at',
        evidence: 'Measured',
        body: 'Leighton, Noyes and Simon reported a photospheric velocity oscillation with a period of 296 ± 3 seconds, equivalent to about 3.38 mHz. Helioseismology resolves many pressure modes. With 3 mHz as a rounded teaching anchor, multiplying by five gives 15 mHz and applying a 3:2 interval gives 4.5 mHz. These calculations alone cannot identify individual solar modes.',
        refs: [{ title: 'Leighton, Noyes and Simon (1962), solar velocity observations', url: 'https://doi.org/10.1086/147285' }, solarModes],
      },
      {
        title: 'Make a physical frequency audible',
        evidence: 'Model',
        body: 'The NASA and Stanford recording starts with 40 days of SOHO Doppler data, filters near 3 mHz and speeds playback up by 42,000. This exhibit uses a synthetic reference tone and an octave-only mapping. Raising 0.003 Hz by 15 octaves multiplies it by 32,768 and gives 98.304 Hz. Use the NASA source to hear the recording made from SOHO data.',
        refs: [solarAudio],
      },
      {
        title: 'Check the difference between radio and chamber sound',
        evidence: 'Model',
        body: 'Balezin and colleagues modeled the pyramid under external radio illumination with wavelengths of 200–600 m, about 0.50–1.50 MHz in vacuum. In a separate 2026 proceedings study, Smith and Beibin reported a workflow for recording hand-clap and swept-sine responses in three Giza chambers. Each experiment measures or models a different interaction. A proposed 440 Hz chamber peak needs a trace, measurement position and recording conditions.',
        refs: [{ title: 'Balezin et al. (2018), numerical electromagnetic model', url: 'https://research.uni-hannover.de/en/publications/electromagnetic-properties-of-the-great-pyramid-first-multipole-r/' }, { title: 'Smith and Beibin (2026), Giza chamber impulse responses', url: 'https://doi.org/10.14236/ewic/EVA2026.35' }, metre],
      },
      {
        title: 'Quartz crystals and granite blocks',
        evidence: 'Limited',
        body: 'Quartz is piezoelectric. In a laboratory unloading test, Sasaoka and colleagues estimated an apparent granite coefficient near 1.4 × 10⁻¹⁵ C/N, about one thousandth of a single quartz crystal. Connecting a particular chamber to that sample result would require measurements of stress and electric field, sensor calibration and controls for electrical noise.',
        refs: [{ title: 'Sasaoka, Yamanaka and Ikeya (1998), electrical potential under granite stress unloading', url: 'https://earthref.org/ERR/18137/' }],
      },
    ],
  },
  {
    id: 'brainwaves',
    title: 'Brainwaves and Earth Resonance',
    kicker: 'EEG, listening tests and Schumann modes',
    dek: 'Compare a sound pitch, an audio modulation rate, a brain recording and an Earth–ionosphere measurement.',
    sections: [
      {
        title: 'Schumann peaks are electromagnetic',
        evidence: 'Measured',
        body: 'Global lightning excites the conducting Earth–ionosphere cavity. Nominal observed peaks occur near 7.8, 14, 20, 26, 33 and 39 Hz, with frequencies and strengths that change over time. The resonances are broad cavity modes with uneven ratios. An arithmetic eighth multiple of 7.83 Hz is 62.64 Hz. Treat 10 Hz as its own comparison value.',
        refs: [schumann, schumannModes, { title: 'Balser and Wagner (1962), variation in cavity frequencies', url: 'https://doi.org/10.1029/JZ067i010p04081' }],
      },
      {
        title: 'EEG bands are measurement conventions',
        evidence: 'Measured',
        body: 'Electroencephalography records changes in electrical potential at the scalp. Common ranges are roughly delta 0.5–4 Hz, theta 4–8 Hz, alpha 8–12 Hz, beta about 13–30 Hz and gamma above about 30 Hz. Boundaries vary by convention and task. 10 Hz falls inside common alpha definitions, while 7.83 Hz is near the theta–alpha boundary. Shared units alone provide no evidence of coupling.',
        refs: [eeg, { title: 'NCBI, normal EEG waveforms', url: 'https://www.ncbi.nlm.nih.gov/books/NBK539805/' }, { title: 'Bitzenhofer (2023), cortical gamma oscillation ranges', url: 'https://doi.org/10.1007/s00424-023-02801-3' }, schumannModes],
      },
      {
        title: 'What the 110 Hz study played',
        evidence: 'Limited',
        body: 'In a pilot with 30 healthy adults whose mean age was 78.6 years, Cook and colleagues presented roughly one minute each of 90, 100, 110, 120 and 130 Hz pure tones in random order through near-ear speakers. Participants listened with eyes closed. The outcome was scalp EEG theta-band cordance at 4–8 Hz. The audio pitches and the EEG analysis band describe two separate measurements.',
        refs: [cook, cookFull],
      },
      {
        title: 'What the 110 Hz study found',
        evidence: 'Limited',
        body: 'At 110 Hz the pilot reported lower left-temporal cordance than at 90 Hz (p = .04) and 130 Hz (p = .01). The comparison with 100 Hz was a trend (p = .07), and 120 Hz showed no significant difference. Prefrontal asymmetry reversed, with reported differences from the 90, 100 and 130 Hz conditions. Language suppression and emotional effects were interpretations. The study did not measure empathy, language performance, gamma enhancement, or entrainment.',
        refs: [cook, cookFull],
      },
      {
        title: 'Pitch and pulse are different listening tests',
        evidence: 'Model',
        body: 'The sustained 110 Hz sine illustrates a sound pitch. The steady and pulsing 220 Hz presets compare a continuous tone with a 10 Hz amplitude envelope. The pulsing preset has the same peak gain setting and lower average signal level. A third method, binaural beats, sends separate pitches to each ear, such as 220 and 230 Hz for a 10 Hz difference. The cymatics views show virtual wave patterns, and scalp electrodes record the listener’s EEG.',
        refs: [wavelength, beatAnalysis],
      },
      {
        title: 'What replication would require',
        evidence: 'Limited',
        body: 'A 2023 review of 14 binaural-beat EEG studies counted five results in line with the entrainment hypothesis, eight that contradicted it, and one mixed result. Designs and EEG outcomes varied substantially. A follow-up to the Cook pilot would use a preregistered comparison, level matching, randomized controls, a larger sample and a specified EEG outcome. The listening examples are comparisons you can hear.',
        refs: [review, cookFull],
      },
      {
        title: 'Claims of EEG and Schumann coherence',
        evidence: 'Limited',
        body: 'Saroka and colleagues reported spectral overlap in retrospective EEG data from 184 people, and brief coherence in a separate small simultaneous recording study. The local measurements used two volunteers and selected 60-second intervals with a visible Schumann signal. Observed coherence can motivate a preregistered, controlled field exposure test with independent instruments and explicit signal-artifact checks.',
        refs: [{ title: 'Saroka, Vares and Persinger (2016), exploratory spectral comparisons', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146595' }, schumannModes],
      },
      {
        title: 'The common-frequency claim needs a mechanism',
        evidence: 'Unverified',
        body: 'A 2021 white paper submitted to a NASA decadal survey proposed shielded-room physiology studies. It documents a research proposal, and the claim that NASA uses 7.83 Hz to retune astronauts remains unverified. A test of ancient stone amplification would need on-site field and pressure measurements against controls. The Schumann listening preset shifts 7.83, 14 and 20 Hz up four octaves to 125.28, 224 and 320 Hz.',
        refs: [{ title: 'Stolc et al. (2021), submitted NASA decadal survey white paper', url: 'https://science.nasa.gov/wp-content/uploads/2023/05/154_48a5766284d47dc2523cb38d856654f6_STOLCVIKTOR.pdf' }, schumann, schumannModes],
      },
    ],
  },
];
