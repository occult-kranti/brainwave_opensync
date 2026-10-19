// Selected historical and institutional sources. Reviewed 2026-10-16.
// Source status describes the record, not validation of every claim it contains.
export const historySources = [
  {
    id: 'newton-opticks',
    title: 'Opticks, Book III: observations and Query 31',
    url: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00051',
    publisher: 'Isaac Newton; scholarly transcription by the Newton Project',
    date: '1718', kind: 'Historical primary text', status: 'Selected passages read',
    readScope: 'Opening diffraction observations and Query 31 closing analysis/synthesis discussion, printed pp. 380–382; normalized transcription, not every manuscript image.',
    claim: 'Newton separates observations, inference about causes, and further consequences to be examined experimentally.',
    limit: 'The Queries contain exploratory suggestions. They do not establish a modern quantum or frequency-healing mechanism.',
    application: 'Keep measured input, fitted model, forward prediction, and independent test as separate stages.',
    tags: ['Newton', 'Optics', 'Method']
  },
  {
    id: 'newton-vegetation',
    title: 'Of Natures obvious laws & processes in vegetation',
    url: 'https://newton.dlib.indiana.edu/text/ALCH00081/normalized',
    publisher: 'Isaac Newton; Indiana University Chymistry of Isaac Newton',
    date: 'Manuscript date not assigned here; digital edition 2006',
    kind: 'Alchemy manuscript', status: 'Selected passages read',
    readScope: 'Catalogue metadata, opening propositions and similarities/dissimilarities, plus concluding distinction between mechanical rearrangement and vegetation.',
    claim: 'Newton explored analogies between mineral and living processes, including a proposed latent spirit.',
    limit: 'Historical vocabulary is not an operational definition of a field, energy source, or biological mechanism.',
    application: 'Turn an analogy into a declared variable map, then test where that map fails.',
    tags: ['Newton', 'Alchemy', 'Analogy']
  },
  {
    id: 'newton-emerald',
    title: 'Hermes / Tabula Smaragdina, Keynes MS. 28',
    url: 'https://newton.dlib.indiana.edu/text/ALCH00017/normalized',
    publisher: 'Newton manuscript; Indiana University scholarly edition',
    date: 'Manuscript date not assigned here; digital edition June 2010',
    kind: 'Hermetic text in historical manuscript', status: 'Selected passages read',
    readScope: 'Metadata and English Emerald Tablet text on folios 2r–2v; the Latin commentary was not translated in full.',
    claim: 'The manuscript preserves a Hermetic text about correspondences, transformation and unity.',
    limit: 'Copying or translating a text is not proof of its physical claims, nor evidence of a modern levitation device.',
    application: 'Use correspondence as a question about mathematical similarity, with an explicit failure case.',
    tags: ['Newton', 'Hermetic', 'Occult history']
  },
  {
    id: 'tesla-wireless', title: 'US645576A — System of transmission of electrical energy',
    url: 'https://patents.google.com/patent/US645576A/en',
    publisher: 'Nikola Tesla; US patent publication mirrored by Google Patents',
    date: '1900-03-20', kind: 'Patent', status: 'Selected description and claims read',
    readScope: 'Publication metadata; source, transmitting/receiving transformers, atmospheric-conduction assumption, synchronism and loss passages; OCR text.',
    claim: 'The proposal includes an electrical source, a propagation medium, tuned receiving circuits and a load.',
    limit: 'This patent does not provide independently verified global power-transfer efficiency. A lumped coupled-resonator model is not a reconstruction of its atmospheric channel.',
    application: 'Model source-to-load efficiency and detuning while retaining coupling and losses.',
    tags: ['Tesla', 'Patent', 'Resonance', 'Energy']
  },
  {
    id: 'tesla-radiant', title: 'US685957A — Apparatus for the utilization of radiant energy',
    url: 'https://patents.google.com/patent/US685957A/en',
    publisher: 'Nikola Tesla; US patent publication mirrored by Google Patents',
    date: '1901-11-05', kind: 'Patent', status: 'Selected description and claims read',
    readScope: 'Publication metadata; external radiation, accumulation, discharge/load passages and claims 2–7 in OCR text.',
    claim: 'A collector and capacitor receive energy from an external source, then discharge through a receiving circuit.',
    limit: 'External radiation and any auxiliary circuit supply belong in the energy budget. Historical microscopic explanations are not adopted as modern physics.',
    application: 'Compare accumulated input, stored energy, delivered work and losses over the same interval.',
    tags: ['Tesla', 'Patent', 'Energy', 'Harvesting']
  },
  {
    id: 'tesla-colorado', title: 'Colorado Springs Notes, June 21–22, 1899, page 43',
    url: 'https://teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900/43',
    publisher: 'Tesla notebook; Tesla Universe transcription with separately marked editorial annotations',
    date: '1899-06-21/22', kind: 'Notebook transcription', status: 'Transcription read; original page not authenticated',
    readScope: 'Page 43 text on assumptions, loss estimates and two-circuit tuning; editorial energy-equation commentary kept distinct.',
    claim: 'Tesla recorded assumptions, material quantities, revised connections and sharp tuning of interacting oscillations.',
    limit: 'This public transcription has weaker provenance than an inspected archival facsimile; it is not an independent replication.',
    application: 'Record parameter assumptions and load conditions; show that higher voltage can accompany unchanged total energy.',
    tags: ['Tesla', 'Notebook', 'Resonance']
  },
  {
    id: 'nasa-bpp', title: 'Prospects for Breakthrough Propulsion From Physics — NASA/TM-2004-213082',
    url: 'https://ntrs.nasa.gov/citations/20040070788',
    publisher: 'Marc G. Millis, NASA Glenn Research Center',
    date: '2004-05', kind: 'Government research assessment', status: 'Selected report sections read',
    readScope: 'Official PDF: abstract, methods, findings and selected task reports, including 3.1.4 and 3.2.3. Bibliography not independently re-audited.',
    claim: 'The 1996–2002 program pursued incremental tests; the report separates non-viable, unresolved and follow-up opportunities.',
    limit: 'Instrument interference, an unfinished NASA replication and a separately sponsored null replication are different outcomes. This historical report is not a current breakthrough announcement.',
    application: 'Define success as a reliable discriminating result, including a bounded null result.',
    tags: ['USA', 'NASA', 'Government', 'Propulsion']
  },
  {
    id: 'nasa-capacitor', title: 'NASA Marshall Space Flight Center Barrel-Shaped Asymmetrical Capacitor',
    url: 'https://ntrs.nasa.gov/citations/20040171466',
    publisher: 'NASA/TM-2004-213283, Campbell and colleagues',
    date: '2004-06', kind: 'Government experimental report', status: 'Abstract and conclusions read',
    readScope: 'Official record, PDF contents and section 9, printed p. 45. Full apparatus data and all 62 PDF pages were not audited in this pass.',
    claim: 'The authors report thrust in air and no observed performance in hard vacuum; they interpret the observations using ordinary force and momentum mechanisms.',
    limit: 'A null is limited by the tested apparatus and sensitivity. No onboard propellant does not mean no momentum exchange with ambient air.',
    application: 'Expose environment and momentum boundaries; test a missing-medium control in simulation.',
    tags: ['USA', 'NASA', 'Government', 'Controls']
  },
  {
    id: 'gateway-1983', title: 'Analysis and Assessment of Gateway Process — CIA-RDP96-00788R001700210016-5',
    url: 'https://archive.org/details/cia-readingroom-document-cia-rdp96-00788r001700210016-5',
    publisher: 'Wayne M. McDonnell, US Army; released record mirrored by Internet Archive',
    date: '1983-06-09; release marking 2003-09-10', kind: 'Released government memorandum', status: 'Selected OCR passages read; primary host retrieval gap',
    readScope: 'Mirror OCR: cover memorandum and sections 6–10. CIA record/PDF links redirected to the reading-room homepage on 2026-10-16; scan symbols not independently verified.',
    claim: 'The author proposes connections among auditory beats, bodily resonance and consciousness using analogies and cited models.',
    limit: 'The selected passages are an explanatory assessment, not controlled proof of levitation, telepathy, healing or an agency-endorsed physical mechanism.',
    application: 'Separate an acoustic signal, a measured neural response and an extraordinary causal interpretation.',
    tags: ['USA', 'Declassified record', 'Consciousness', 'Provenance']
  },
  {
    id: 'pais-inertia', title: 'US10144532B2 — Craft using an inertial mass reduction device',
    url: 'https://patents.google.com/patent/US10144532B2/en',
    publisher: 'Salvatore Cezar Pais; original assignee US Department of the Navy',
    date: '2018-12-04', kind: 'Government-assigned patent', status: 'Selected description read',
    readScope: 'Publication and original-assignee metadata, proposed cavity/vibration/vacuum mechanism in the description. No new legal-status determination.',
    claim: 'The patent proposes that driven electromagnetic and mechanical behavior could produce an inertial-mass effect.',
    limit: 'Publication and government assignment establish a proposal, not measured reduction of inertial mass. No independently verified performance dataset was identified in the inspected material.',
    application: 'Treat any anomalous force as an additional hypothesis requiring a closed momentum budget and independent calibration.',
    tags: ['USA', 'Patent', 'Government', 'Unverified mechanism']
  },
  {
    id: 'china-elf', title: '今日太空实验室｜在轨两年，无容器柜的工作小结',
    url: 'https://csu.cas.cn/gb/zyxw/202305/t20230505_6748857.html',
    publisher: 'Chinese Academy of Sciences space-utilization center; source credited to China Manned Space Engineering',
    date: '2023-04-28', kind: 'Official program account', status: 'Original Chinese article read',
    readScope: 'Article and captions covering containerless materials experiments and alloy examples; English descriptions are paraphrases, not certified translations.',
    claim: 'The account describes contactless sample processing in the space station’s microgravity environment, including electrostatic levitation experiments.',
    limit: 'The rack does not generate orbital microgravity. Institutional reporting is not a raw-data audit or independent replication of every materials claim.',
    application: 'Distinguish force-based sample positioning from the environmental gravity condition.',
    tags: ['China', 'Government', 'Materials', 'Electrostatics']
  },
  {
    id: 'china-acoustic-sensor', title: 'CN102384983A — 一种超声悬浮加速度计',
    url: 'https://patents.google.com/patent/CN102384983A/zh',
    publisher: 'Nanjing University of Aeronautics and Astronautics; Chinese patent application',
    date: '2012-03-21', kind: 'University patent application', status: 'Original Chinese description and claims read',
    readScope: 'Metadata, mechanism description, force-balance equations (1), (7), (8), and claims 1–3; OCR algebra is not a verified facsimile transcription.',
    claim: 'The proposal combines powered near-field acoustic support with capacitive displacement sensing; gravity remains in its balance equation.',
    limit: 'A near-field squeeze-film proposal cannot be substituted directly into a far-field standing-wave particle model. Publication alone does not establish calibrated sensor performance.',
    application: 'Separate equilibrium height, incremental stiffness, acceleration response and readout calibration.',
    tags: ['China', 'Patent', 'Acoustics', 'Sensing']
  },
  {
    id: 'russia-hts-maglev', title: 'РНФ 17-19-01527 — Magnetic levitation systems based on flexible HTS tapes',
    url: 'https://www.rscf.ru/project/17-19-01527/',
    publisher: 'Russian Science Foundation; MEPhI project led by Igor Rudnev',
    date: '2017 competition; historical project record', kind: 'Government-funded project record', status: 'Original Russian metadata and abstract read',
    readScope: 'Project metadata, author-provided application abstract, proposed magnetic/electrical/thermal model. Listed publications were not independently audited.',
    claim: 'The project proposes modeling and testing superconductor–permanent-magnet levitation systems, including thermal and magnetic losses.',
    limit: 'A funded project and its author-written aims are not independently verified performance. Contactless support does not remove refrigeration or all dissipation.',
    application: 'Retain thermal boundaries and dissipative channels when comparing nominally frictionless devices.',
    tags: ['Russia', 'Government', 'Magnetism', 'Energy']
  },
  {
    id: 'russia-track-maglev', title: 'RU2539304C2 — Устройство магнитной левитации транспортного средства',
    url: 'https://patents.google.com/patent/RU2539304C2/ru',
    publisher: 'Petersburg State Transport University; Russian patent publication',
    date: '2015-01-20', kind: 'University patent', status: 'Original Russian selected description read',
    readScope: 'Metadata, comparison with onboard drive, proposed powered-track arrangement and operating description; English paraphrase, not certified translation.',
    claim: 'The proposal relocates driven rotating magnets to the track and a conductive receiving element to the vehicle.',
    limit: 'Avoiding onboard levitation power does not remove the track’s energy input. No independent efficiency dataset was audited.',
    application: 'Expand the system boundary to include offboard supplies before calculating efficiency.',
    tags: ['Russia', 'Patent', 'Magnetism', 'System boundary']
  }
];
