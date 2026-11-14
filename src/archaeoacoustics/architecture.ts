import type { Topic } from './types';

export const architectureTopics: Topic[] = [
  {
    id: 'architecture',
    title: 'How monuments shape sound',
    kicker: 'Archaeoacoustics',
    dek: 'Travel from the chambers of Malta and Newgrange to Maya staircases and Ottoman domes. Hear how standing waves, echoes, and reverberation arise from different structures.',
    sections: [
      {
        title: 'Newgrange and the six-site survey',
        evidence: 'Measured',
        body: 'In a 1996 pilot survey, Jahn, Devereux and Ibison found audible resonances between 95 and 120 Hz in six selected chambers in Britain and Ireland. At Newgrange a central loudspeaker excited a 110 Hz response, and the team mapped variations in sound level along transects. The source could be tuned by ear to within about 1–2 Hz in repeated trials. This survey documents the visited chambers. Estimating how common this band is would require a larger sample and comparison rooms matched for size and shape.',
        refs: [
          { title: 'Jahn, Devereux & Ibison, 1996 · Journal of the Acoustical Society of America', url: 'https://doi.org/10.1121/1.414642' },
          { title: 'Full author report with Newgrange transects', url: 'https://www.academia.edu/1643130/Acoustical_resonances_of_assorted_ancient_structures' },
        ],
      },
      {
        title: 'Malta’s Ħal Saflieni Hypogeum',
        evidence: 'Measured',
        body: 'Debertolis and colleagues reported strong responses near 70 and 114 Hz in the Oracle Chamber using voices and instruments. Rupert Till’s sweep-based measurements documented long bass decay and position-dependent peaks, including 72 and 75 Hz in one response and longer-lived components at 134, 161, 186 and 196 Hz. Till found that modeled speech intelligibility differed by at most 0.03 on the Speech Transmission Index for male and female spectra, below the cited perceptual difference of 0.05. Voice pitch, source placement, and listening location explain why visitors can have different experiences.',
        refs: [
          { title: 'Debertolis, Coimbra & Eneix, 2015 · University of Trieste repository', url: 'https://arts.units.it/handle/11368/2849406' },
          { title: 'Till, 2017 · Antiquity, accepted paper and recordings', url: 'https://eprints.hud.ac.uk/id/eprint/30678/' },
        ],
      },
      {
        title: 'Stonehenge and the sound inside the circle',
        evidence: 'Model',
        body: 'Cox, Fazenda and Greaney measured a 1:12 physical model of a reconstructed Stonehenge. Stone reflections produced a mean mid-frequency reverberation time of 0.64 ± 0.03 seconds and speech amplification of 4.3 ± 0.9 dB. The authors estimated that the bluestone rearrangements they tested made inaudible differences. English Heritage documents about 64 cremations with burial evidence from an early cemetery phase. The scale-model study did not test whether burials coincide with acoustical nodes.',
        refs: [
          { title: 'Cox, Fazenda & Greaney, 2020 · Journal of Archaeological Science', url: 'https://doi.org/10.1016/j.jas.2020.105218' },
          { title: 'Impulse responses and acoustic parameters from the model', url: 'https://doi.org/10.17866/rd.salford.12687554.v1' },
          { title: 'English Heritage · Excavation and construction chronology', url: 'https://www.english-heritage.org.uk/visit/places/stonehenge/history-and-stories/history/' },
        ],
      },
      {
        title: 'Giza’s King’s Chamber and the 440 Hz claim',
        evidence: 'Limited',
        body: 'Flinders Petrie surveyed the King’s Chamber at roughly 10.47 by 5.24 by 5.84 metres. An ideal rigid rectangular room with those dimensions and 343 m/s sound speed has axial fundamentals near 16.4, 32.7 and 29.4 Hz. Those figures are calculations. Smith and Beibin reported taking hand-clap and swept-sine recordings in three Giza chambers in 2026. Engineer Tom Danley describes earlier chamber tests in trade press. The numbers 9, 16.2 and 117.5 Hz circulate in retellings and their attribution to a calibrated measurement remains uncertain. The circulating 440, 432 and 528 Hz claims lack a traceable peer-reviewed chamber measurement in the sources reviewed here.',
        refs: [
          { title: 'Petrie, 1883 · Survey of the pyramids and temples of Gizeh', url: 'https://gizapyramids.org/pdf_library/petrie_gizeh.pdf' },
          { title: 'Smith & Beibin, 2026 · Comparative chamber impulse responses', url: 'https://doi.org/10.14236/ewic/EVA2026.35' },
          { title: 'Danley · First-person account in ProSoundWeb', url: 'https://www.prosoundweb.com/the-great-pyramid-early-reflections-ancient-echoes/' },
        ],
      },
      {
        title: 'Egyptian ritual instruments and material claims',
        evidence: 'Limited',
        body: 'Sistra survive in collections as Egyptian ritual percussion instruments, often associated with Hathor. The archaeological documentation establishes their ceremonial use. Their proposed use in the King’s Chamber and claims about cognitive effects require separate evidence. Experiments on quartz-rich rock show that some samples can exhibit weak piezoelectric responses under applied stress. Assessing a whole chamber would require direct electric-field measurements with controls for machinery, cables, motion, humidity and background fields. Reports of vibration near the Sekhmet statue at Karnak are visitor accounts.',
        refs: [
          { title: 'The Met · Arc sistrum of Tapenu', url: 'https://www.metmuseum.org/art/collection/search/553814' },
          { title: 'Tectonophysics · Piezoelectric effects in quartz-rich rocks', url: 'https://doi.org/10.1016/0040-1951(81)90268-7' },
          { title: 'CNRS–CFEETK · Karnak catalogue, statue of Sekhmet', url: 'https://www.cfeetk.cnrs.fr/archives/?n=186971' },
        ],
      },
      {
        title: 'Chichén Itzá and the staircase chirp',
        evidence: 'Measured',
        body: 'A handclap in front of El Castillo can return as a descending chirp. Declercq and colleagues compared diffraction models with recordings and found dependence on the sound and ground reflections. Bilsen modeled the perceived pitch as arising from progressively longer gaps between reflections, predicting a glide from 796 to 471 Hz-equivalent in 177 ms for one setup. Whether Maya builders intended to evoke a quetzal remains open. Great Ball Court long-distance sound reports refer to another structure.',
        refs: [
          { title: 'Declercq et al., 2004 · El Castillo diffraction and recordings', url: 'https://doi.org/10.1121/1.1764833' },
          { title: 'Bilsen, 2006 · Repetition pitch in the El Castillo echo', url: 'https://doi.org/10.1121/1.2213570' },
          { title: 'Lubman, 2006 · Acoustical Society of America meeting account of the Great Ball Court', url: 'https://acoustics.org/pressroom/httpdocs/152nd/lubman.html' },
        ],
      },
      {
        title: 'Palenque and the claim of golden-ratio tuning',
        evidence: 'Limited',
        body: 'A Palenque conference abstract reports tests of sound projection in the Northern Group plaza. Separately, Hurtak, Howarth and colleagues published 24 selected records from chambers and outdoor points in five Maya archaeological areas, about a tenth of the records they report collecting. The paper highlights 86, 216, 172 and 259 Hz and compares them with notes in modern tuning. That analysis provides no test of intentional golden-ratio tuning, and counting recordings as temples inflates site coverage.',
        refs: [
          { title: 'Zalaquett, 2010 · Palenque Northern Group plaza, conference abstract', url: 'https://doi.org/10.1121/1.3508237' },
          { title: 'Hurtak et al., 2017 · Maya-site acoustic study, INAH Arqueología 54', url: 'https://revistas.inah.gob.mx/index.php/arqueologia/article/download/13160/14280/26313' },
          { title: 'Ancient Mesoamerica · Calibrated field methods at Edzná', url: 'https://www.cambridge.org/core/journals/ancient-mesoamerica/article/acoustic-characterization-of-edzna-exploring-the-use-of-sound-in-prehispanic-maya-culture/5F6A90DCCCBFC7B31CCDA0EB0A2F5DE2' },
        ],
      },
      {
        title: 'Chavín de Huántar and Chaco Canyon',
        evidence: 'Limited',
        body: 'Chavín’s galleries and ducts can change how sound travels and where it seems to come from. Miriam Kolar’s research considers acoustic measurements and listening experiments alongside recovered shell trumpets called pututus and their depictions. In the US Southwest, research on Chaco Canyon and its great-house communities has instead modeled outdoor audibility for voice and shell trumpet. The acoustic behavior of a specific kiva and sipapu would require measurements of that site and configuration.',
        refs: [
          { title: 'Kolar, 2017 · Sensing sonically at Chavín de Huántar', url: 'https://doi.org/10.1080/1751696X.2016.1272257' },
          { title: 'Kolar · Conch calls and recovered pututus', url: 'https://elischolar.library.yale.edu/yjmr/vol5/iss2/4/' },
          { title: 'Primeau & Witt, 2019 · Audibility in downtown Chaco', url: 'https://doi.org/10.3390/acoustics1010007' },
          { title: 'Van Dyke et al. · Modeling audibility in Chacoan great-house communities', url: 'https://doi.org/10.15184/aqy.2024.54' },
        ],
      },
      {
        title: 'Epidaurus and the Roman Pantheon',
        evidence: 'Model',
        body: 'At Epidaurus a model predicts that diffraction from periodic stone seat rows reduces some lower frequency energy relative to higher-frequency components. Field measurements add evidence about reflections and how they vary across seats. The popular claim of universal whisper intelligibility omits source loudness, wind, background noise, and occupancy. Rome’s Pantheon offers a different problem: a large domed enclosure can produce focusing and a prolonged decay. The widely repeated seven-second value needs a calibrated measurement, frequency band, and measurement positions before it can serve as a reference.',
        refs: [
          { title: 'Declercq & Dekeyser, 2007 · Epidaurus seat-row diffraction', url: 'https://doi.org/10.1121/1.2709842' },
          { title: 'Aalto University · Epidaurus field measurements and visualization', url: 'https://research.cs.aalto.fi/acoustics/virtual-acoustics/research/room-acoustics-and-physics/75-epidaurus.html' },
          { title: 'Sperling · Pantheon rotunda acoustics conference report', url: 'https://ftp.gwdg.de/pub/misc/EMIS/journals/NNJ/conf_reps_v6n1-Sperling.html' },
        ],
      },
      {
        title: 'Cathedrals, mosques and reverberation',
        evidence: 'Measured',
        body: 'Room impulse responses record early reflections and the decay that follows. Notre-Dame measurements from 1987 and 2015 document its long decay, while measurements after the 2019 fire document a changed room. Istanbul field studies document frequency- and location-dependent decay in Süleymaniye and Hagia Sophia. Stanford’s Hagia Sophia auralization reported roughly 11 seconds under its conditions. Different states of occupancy, carpet, and restoration alter the decay. Treat the Sultan Ahmed Mosque as a distinct building. A niche can scatter or focus sound, and its dimensions and finish determine the effect.',
        refs: [
          { title: 'Katz & Weber, 2020 · Notre-Dame acoustics before and after the fire', url: 'https://doi.org/10.3390/acoustics2040044' },
          { title: 'Sü Gül et al. · Field measurements in Hagia Sophia and Süleymaniye Mosque', url: 'https://www.mdpi.com/2624-599X/1/3/28' },
          { title: 'Stanford Arts · Hagia Sophia acoustic reconstruction', url: 'https://arts.stanford.edu/excavating-an-echo/' },
          { title: 'Archnet · Sultan Ahmed Mosque', url: 'https://www.archnet.org/sites/2026' },
        ],
      },
    ],
  },
  {
    id: 'geometry',
    title: 'Geometry in stone and sound',
    kicker: 'Cymatics and architectural motifs',
    dek: 'Compare rose windows, carved cubes, tessellations, and temple plans with figures generated on virtual plates. Use controlled comparisons to see what a visual resemblance can tell us.',
    sections: [
      {
        title: 'From a driving tone to a plate figure',
        evidence: 'Measured',
        body: 'Sand on a vibrating plate often collects at nodal lines, where the plate moves least. A drive frequency excites modes according to the plate’s geometry, elastic properties, thickness, boundary constraints, and exciter position. Experiments with square brass plates show that changing the material’s orientation changes the resulting patterns. Try the same frequency on a virtual square plate and circular disk in Cymatic Studio. Those specimens also differ in dimensions and boundary conditions. Change just the drive frequency on either specimen to test its effect.',
        refs: [
          { title: 'Tuan et al., 2018 · Point-driven Chladni figures and symmetry breaking', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6052176/' },
        ],
      },
      {
        title: 'Troia Cathedral and the 394 Hz claim',
        evidence: 'Measured',
        body: 'A conservation survey maps eleven columns radiating from the medieval rose window’s center and dates the window to the 13th century. The pierced tracery varies across the eleven sectors. Ground-penetrating radar, ultrasound, and thermography in that survey assess the stone and construction. The claim that eleven spokes imply 394 Hz gives no physical plate or drive specification. For comparison, equal-tempered G4 at A4 = 440 Hz is about 392.0 Hz. A synthetic 394 Hz plate preview can help examine the resemblance if the plate parameters and comparison criteria are disclosed.',
        refs: [
          { title: 'Nuzzo et al., 2010 · Troia Cathedral rose window survey, figure 1', url: 'https://doi.org/10.5194/adgeo-24-69-2010' },
          { title: 'Italian Ministry of Culture · Troia Cathedral and its tracery', url: 'https://catalogo.cultura.gov.it/approfondimento/puglia-provincia-foggia/chiesa-cattedrale-troia' },
        ],
      },
      {
        title: 'Chartres, Strasbourg, and León',
        evidence: 'Unverified',
        body: 'Radiating stone tracery organizes windows into repeating sectors. At Chartres, the west, north, and south roses carry distinct iconographic programs. The proposed mapping of windows at Chartres, Strasbourg, and León to piano pitches such as A2, B2, and C2 has no common published protocol in the reviewed sources. A visual comparison needs a preselected window, tuning system, plate, threshold, and score to distinguish a robust result from a hand-picked match.',
        refs: [
          { title: 'UNESCO · Chartres Cathedral and its rose-window iconography', url: 'https://whc.unesco.org/en/list/81/' },
          { title: 'Chartres Cathedral · Visitor guide to the windows', url: 'https://www.cathedrale-chartres.org/en/what-can-we-see/' },
        ],
      },
      {
        title: 'Rosslyn Chapel and the modern Rosslyn Motet',
        evidence: 'Limited',
        body: 'Rosslyn Chapel documents the carved cubes in the Lady Chapel and describes the Rosslyn Motet as a recently composed interpretation. A musical decoding would need a complete catalogue of blocks, an independently justified reading order, and a mapping from marks to pitches that predicts marks or notes held out of the analysis. Comparing the proposed score with shuffled and alternative mappings could show how much freedom the reconstruction permits.',
        refs: [
          { title: 'Rosslyn Chapel Trust · Carved cubes and their modern interpretation', url: 'https://www.rosslynchapel.com/visit/things-to-do/explore-the-carvings/' },
        ],
      },
      {
        title: 'Islamic geometric design',
        evidence: 'Tradition',
        body: 'Interlocking circles, stars, and polygons offer repeat units that can tile large surfaces. Museum objects preserve these constructions in stone, ceramic, wood, textile, and manuscript decoration. Similar symmetries in water or sand are a reason to compare how patterns are generated. An acoustic interpretation of a given tile panel would require historical evidence and a reproducible apparatus or measurement.',
        refs: [
          { title: 'The Met · Geometric patterns in Islamic art', url: 'https://www.metmuseum.org/essays/geometric-patterns-in-islamic-art' },
          { title: 'The Met · Carved panel with geometric pattern and inscriptions', url: 'https://www.metmuseum.org/art/collection/search/457717' },
        ],
      },
      {
        title: 'Borobudur, Angkor Wat, and Indian stepwells',
        evidence: 'Unverified',
        body: 'Borobudur’s terraces, central axis, and stupas belong to an Indonesian Buddhist monument, while Angkor Wat belongs to a Khmer temple complex with its own religious history and axial plan. Their proposed frequency matches at 3457 Hz and 3333 Hz, and the 3326–3337 Hz claim for Indian stepwells, lack a reproducible acoustic survey or documented device recipe in the reviewed sources. A terrain plan and a plate displacement field measure different things. Compare their symmetry with a consistent scale, orientation and scoring rule.',
        refs: [
          { title: 'UNESCO · Borobudur Temple Compounds', url: 'https://whc.unesco.org/en/list/592/' },
          { title: 'UNESCO · Angkor', url: 'https://whc.unesco.org/en/list/668/' },
          { title: 'UNESCO · Rani-ki-Vav stepwell, Patan', url: 'https://whc.unesco.org/en/list/922/' },
        ],
      },
      {
        title: 'How to test a claimed match',
        evidence: 'Model',
        body: 'Choose a measured drawing and fix the registration before looking at the result. Record plate, drive, and rendering settings. Compare a preregistered frequency with nearby frequencies, alternative plates, rotated images, and purpose-built radial patterns. Score each pairing with the same overlap or symmetry metric. Reporting the full set of comparisons reveals how often an impressive match appears by chance when several images and frequencies are tried.',
        refs: [
          { title: 'Tuan et al. · Experimental control of Chladni pattern parameters', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6052176/' },
          { title: 'Nuzzo et al. · Example of measured geometry for an architectural feature', url: 'https://doi.org/10.5194/adgeo-24-69-2010' },
        ],
      },
    ],
  },
];
