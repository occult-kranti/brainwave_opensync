import type { Topic } from './types';

export const indiaTopics: Topic[] = [
  {
    id: 'india',
    title: 'Musical Stone in South India',
    kicker: 'Pillars, steps and temple halls',
    dek: 'A ringing shaft, a reverberant hall and a digital sonification each turn architecture into sound in a different way. Hampi offers a place to start with measurements.',
    sections: [
      {
        title: 'What rang at Vitthala Temple',
        evidence: 'Measured',
        body: 'Kumar and colleagues studied 87 columns in 11 selected pillar groups at Hampi. They recorded the sounds and used ultrasound, impact echo and surface microscopy where accessible. The east side of pillar 2, locally associated with seven notes, produced lower peaks spanning 243–396 Hz and higher peaks spanning 687–1000 Hz across its columns. The bell-associated pillar 11 had lower peaks spanning 533–656 Hz. The team observed 54 main pillars at the hall, compared with 56 mentioned in earlier accounts. These are ranges across sampled shafts. Each shaft has its own spectrum.',
        refs: [
          { title: 'Kumar et al., JASA (2008)', url: 'https://pubmed.ncbi.nlm.nih.gov/18681583/' },
          { title: 'Author paper with Table I', url: 'https://www.academia.edu/105050097/Nondestructive_characterization_of_musical_pillars_of_Mahamandapam_of_Vitthala_Temple_at_Hampi_India' },
          { title: 'Hampi conservation report', url: 'https://whc.unesco.org/document/162842' },
        ],
      },
      {
        title: 'Why the dimensions matter',
        evidence: 'Model',
        body: 'The researchers approximated gently tapered shafts by clamped cylinders. For a uniform slender beam, the first bending frequency scales approximately as diameter divided by length squared, times the square root of Young’s modulus divided by density. A 10% increase in length lowers the estimated frequency by about 17% when the other inputs and mounting stay fixed. The idealized ratio of the second bending frequency to the first is about 2.76, distinct from an integer harmonic. Coupling and damage can change the spectrum and decay. The formula models the column as a solid beam, while the Cymatic Studio shows an independently driven virtual plate.',
        refs: [{ title: 'Kumar et al., bending dispersion and Fig. 6', url: 'https://pubmed.ncbi.nlm.nih.gov/18681583/' }],
      },
      {
        title: 'Pillar clusters beyond Hampi',
        evidence: 'Tradition',
        body: 'Sahapedia surveys musical pillars at Meenakshi Amman, Nellaiappar, Suchindram, Varadharaja Perumal, Lepakshi and Padmanabhaswamy. It describes categories associated with individual notes, melody, rhythm and blown sound. These historical and descriptive accounts guide site-specific investigation. The Hampi study links coupling to how long some shafts ring. Testing sympathetic vibration at another site would require simultaneous motion measurements on the excited shaft, neighboring shafts and the floor. For a public comparison, use authorized recordings or a replica. The Archaeological Survey of India introduced recordings at Hampi after restricting access to fragile pillars.',
        refs: [
          { title: 'Sahapedia survey of musical pillars', url: 'https://www.sahapedia.org/pillars-sing-architectural-marvels-indian-temples' },
          { title: 'ASI conservation staff on recording the pillars (2024)', url: 'https://timesofindia.indiatimes.com/city/hubballi/discover-hampis-unique-musical-pillars-with-qr-codes/articleshow/115741580.cms' },
        ],
      },
      {
        title: 'Darasuram and the singing steps',
        evidence: 'Limited',
        body: 'Tamil Nadu Tourism describes musical steps at Airavatesvara Temple. The Archaeological Survey of India dates the temple to Rajaraja II and identifies the front chariot-shaped hall as Rajagambhiran tirumandapam. It also records royal support for singing Tevaram hymns. The available accounts leave the step frequencies, cavity geometry and original tuning uncertain. A comparison with a modern scale requires spectra from individually identified steps and a stated reference tonic.',
        refs: [
          { title: 'Archaeological Survey of India, Great Living Chola Temples', url: 'https://asi.nic.in/pages/WorldHeritageCholaTemples' },
          { title: 'Tamil Nadu Tourism, Airavatesvara Temple', url: 'https://www.youtube.com/watch?v=MqprN2xDdRc' },
        ],
      },
      {
        title: 'Pillar profiles and sound in Belur',
        evidence: 'Limited',
        body: 'UNESCO documents Channakeshava Temple as part of the Sacred Ensembles of the Hoysalas. Vani Vignesh’s thesis records musical practices and interview accounts of the hall’s acoustics. The proposed 572 Hz result assigns cross-sectional dimensions to audio controls in the description supplied for this exhibit. A frequency chosen or produced through such a mapping belongs to that sonification. To verify a physical mode at 572 Hz, look for a recorded impact or sweep, source and receiver positions, and repeatable spectra.',
        refs: [
          { title: 'UNESCO, Sacred Ensembles of the Hoysalas', url: 'https://whc.unesco.org/en/list/1670/' },
          { title: 'Vignesh, thesis on Hoysala temple experience (2023)', url: 'https://digitalcommons.fiu.edu/nanna/record/19400/files/VANI_VIGNESH_THESIS_FINAL_8TH_APRIL.pdf?registerDownload=1&version=1&withMetadata=0&withWatermark=0' },
        ],
      },
      {
        title: 'Impulse responses at Hampi and Pattadakal',
        evidence: 'Measured',
        body: 'Aswathanarayana and Boren measured the room response at Vijaya Vittala in Hampi and Virupaksha in Pattadakal. In the octave band centered at 125 Hz, the reported T30 reverberation times were 2.80 s and 2.94 s respectively. In the 4 kHz band they were 1.78 s and 1.61 s. T30 estimates room decay from a portion of the measured level drop. These are band averages for the buildings, and the Hampi pillar spectra above describe vibrations of individual shafts.',
        refs: [
          { title: 'Aswathanarayana and Boren, JASA Express Letters (2025)', url: 'https://pubmed.ncbi.nlm.nih.gov/40029174/' },
          { title: 'Author copy with decay values and measurement positions', url: 'https://www.researchgate.net/publication/389518398_Acoustic_analysis_of_two_Hindu_temples_in_Southern_India' },
        ],
      },
      {
        title: 'What carries through a sanctum',
        evidence: 'Limited',
        body: 'Prasad and Rajavel compared sound spectra and sound-pressure levels in two modern Hindu temples in New Jersey and New York, a community hall and an anechoic chamber. The measured temples had greater sound levels near the vestibule than the comparison spaces for the reported setup. This is a concrete example of room reinforcement. The accounts about whispers traversing Brihadisvara, Rameswaram and Puri, and specific acoustic instructions in the Shilpa Shastras, still need site measurements or a cited text and passage.',
        refs: [
          { title: 'Prasad and Rajavel, Hindu worship spaces, authors’ conference paper (2013)', url: 'https://www.researchgate.net/publication/270758839_ACOUSTICS_OF_CHANTS_CONCH-SHELLS_BELLS_AND_GONGS_IN_HINDU_WORSHIP_SPACES' },
          { title: 'UNESCO, Great Living Chola Temples', url: 'https://whc.unesco.org/en/list/250' },
        ],
      },
    ],
  },
  {
    id: 'ritual',
    title: 'Ritual Sound and Musical Tuning',
    kicker: 'OM, conch shells, bowls and bells',
    dek: 'Read the traditions in their own terms, then compare the sounds that researchers have measured in individual instruments and performances.',
    sections: [
      {
        title: 'OM in the Upanishads',
        evidence: 'Tradition',
        body: 'The Māṇḍūkya Upanishad opens by identifying OM with the whole of experience and time. In Nāda Yoga and related traditions, sound can serve as a focus of practice or a philosophical way to understand reality. A performance has a pitch that depends on the voice and context. The text supplies a meaning for the syllable, while a modern pitch assignment needs a stated calculation or recording.',
        refs: [
          { title: 'Māṇḍūkya Upanishad, verse 1, Sanskrit and translation', url: 'https://upanishads.org.in/u/mandukya/p/1' },
          { title: 'Lane, The Sound Current Tradition, historical survey', url: 'https://assets.cambridge.org/97810090/48583/excerpt/9781009048583_excerpt.pdf' },
        ],
      },
      {
        title: 'How 136.10 Hz is calculated',
        evidence: 'Model',
        body: 'The modern Cosmic Octave convention associated with Hans Cousto takes the reciprocal of an Earth-year period and raises it by whole octaves. With the selected year of 31,556,925.97 seconds, multiplying its reciprocal by 2³² gives 136.1022 Hz. This shifts a cycle into the audible range through a chosen mathematical rule. At that tonic, a 3:2 fifth lies near 204.15 Hz, and an octave is 272.20 Hz.',
        refs: [{ title: 'Hans Cousto, Cosmic Octave source text', url: 'https://www.planetware.de/download/cousto/Cousto-Die_Oktave_ed07.pdf' }],
      },
      {
        title: 'Sa moves with the performer',
        evidence: 'Measured',
        body: 'In Indian art music, Sa is the performance tonic. Musicians choose it to fit their voices or instruments. A third-party analysis of manually annotated CompMusic data reports 547 vocal recordings, including 364 by men. Of those 364 recordings, 69 were within a quarter-tone of 136.10 Hz. Median tonics in that analysis were 141.0 Hz for men and 197.2 Hz for women. These figures describe the sampled commercial performances.',
        refs: [
          { title: 'Gulati et al., annotated CompMusic tonic datasets', url: 'https://zenodo.org/records/1257114' },
          { title: 'Harmonance, published analysis and histograms', url: 'https://harmonance.com/resources/om-frequency' },
        ],
      },
      {
        title: 'How a shankh changes pitch',
        evidence: 'Measured',
        body: 'A player’s vibrating lips excite the flared duct of the conch shell. In one anechoic recording, Prasad and Rajavel measured a 327.5 Hz fundamental with additional peaks at 655 and 980 Hz. Earlier acoustic work on Turbinella pyrum used X-ray tomography to characterize the duct and found that inserting fingers at the opening lowered the pitch. Shell geometry, player technique and the room all affect the heard result.',
        refs: [
          { title: 'Prasad and Rajavel, Table 3 and Figs. 8–10', url: 'https://www.academia.edu/38208102/Acoustics_of_Chants_pdf' },
          { title: 'Taylor et al., Acoustical Society of America meeting (1994)', url: 'https://www.auditory.org/asamtgs/asa94mit/3pMU/3pMU6.html' },
        ],
      },
      {
        title: 'Bowl rims and water patterns',
        evidence: 'Measured',
        body: 'Terwagne and Bush excited one water-filled standing bowl at its 188 Hz rim mode. Increasing the forcing changed the surface response from weak capillary waves to edge-induced Faraday waves and, under stronger drive, droplet generation. Bowl geometry, fill and forcing amplitude all matter. The Liquid view in Cymatic Studio offers an artistic echo of the effect. The paper and linked videos show the measured behavior.',
        refs: [
          { title: 'Terwagne and Bush, Nonlinearity (2011), Fig. 7', url: 'https://doi.org/10.1088/0951-7715/24/8/R01' },
          { title: 'University of Liège, paper and laboratory footage', url: 'https://orbi.uliege.be/handle/2268/94996' },
        ],
      },
      {
        title: 'Two pitches from a bronze bell',
        evidence: 'Measured',
        body: 'The Hubei Provincial Museum documents the 65 bronze bells from the tomb of Marquis Yi of Zeng. Different strike positions can excite two distinct pitches on one bell, separated by a major or minor third. Inscriptions record pitch information, and the middle register has a chromatic set of pitches. A synthetic pair can demonstrate the difference between a third and a fifth. The historical tuning takes its values from measurements of the individual bells.',
        refs: [
          { title: 'Hubei Provincial Museum, chime bells', url: 'https://hbww.org.cn/treasureofmuseum/p/11496.html' },
          { title: 'UNESCO Memory of the World, Bianzhong', url: 'https://www.unescoicdh.org/eng/sub.php?code1=00000003&listCnt=10&menukey=289&mod=view&no=143135' },
        ],
      },
      {
        title: 'Sound as learned practice',
        evidence: 'Tradition',
        body: 'Gurbani kirtan at the Darbar Sahib, vocal and instrumental offerings at Channakeshava, and Jain congregational hymns each draw on their own devotional practice. In the Mevlevi Sema ceremony, singers and instruments including the ney and kettledrum accompany a structured sequence of recitation and turning. These accounts describe music, setting and ritual meaning. Each practice would need its own recordings and measurement protocol for an acoustic comparison.',
        refs: [
          { title: 'Darbar Sahib and Gurbani kirtan, California Digital Library', url: 'https://repositories.cdlib.org/uc/item/6299151d' },
          { title: 'Vignesh, Jain and Hindu temple music practices', url: 'https://digitalcommons.fiu.edu/nanna/record/19400/files/VANI_VIGNESH_THESIS_FINAL_8TH_APRIL.pdf?registerDownload=1&version=1&withMetadata=0&withWatermark=0' },
          { title: 'Türkiye Ministry of Culture and Tourism, Mevlevi Sema ceremony', url: 'https://yakegm.ktb.gov.tr/TR-345100/mevlevi-sema-ceremony.html' },
        ],
      },
      {
        title: 'How to test shared pitch and decay claims',
        evidence: 'Unverified',
        body: 'Fletcher and colleagues model how players shape the didjeridu sound through vocal-tract resonances. Smithsonian Folkways documents the variety of drums and traditions that inform taiko. The proposed shared 50–100 Hz band, the 7–8 second decay assigned to ghanta bells, and synchronized didjeridu, heartbeat and Schumann activity need matched measurements. For percussion, record each instrument under stated strike and microphone positions and define the decay threshold. Testing synchronization would also require independent, simultaneous recordings of the signals and a rule for comparing them.',
        refs: [
          { title: 'Fletcher et al., didjeridu acoustics (2006)', url: 'https://pubmed.ncbi.nlm.nih.gov/16521781/' },
          { title: 'Smithsonian Folkways, Japanese taiko guide', url: 'https://folkways-media.si.edu/docs/folkways/lessons/SFLN079_teacher_guide.pdf' },
        ],
      },
    ],
  },
];
