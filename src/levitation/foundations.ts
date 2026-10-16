import type { LevitationExperiment, LevitationSource } from './types';

export const FOUNDATION_SOURCES: readonly LevitationSource[] = [
  {
    id: 'foundation-energy', title: 'Feynman, Leighton & Sands — Conservation of Energy', date: '1963; online edition inspected 2026-10-16',
    kind: 'Author lecture textbook', country: 'USA', url: 'https://www.feynmanlectures.caltech.edu/I_04.html',
    version: 'Volume I, chapter 4, Caltech online edition', passageRead: 'Sections 4–1 and 4–2; energy accounting and reversible weight-lifting argument.',
    access: 'Full chapter available; selected sections read.', provenance: 'Author-developed teaching argument hosted by Caltech.',
    evidence: 'A repeatable cycle must account for stored energy, heat, work and energy crossing the system boundary. Near Earth, lifting a mass changes potential energy by mgh.',
    limitations: 'This is a conservation argument, not a measurement of any advertised generator. An unexplained residual requires an uncertainty and boundary audit.',
    status: 'derived', topics: ['energy', 'free energy', 'controls', 'Feynman'],
  },
  {
    id: 'foundation-maxwell', title: 'Feynman, Leighton & Sands — Field Energy and Field Momentum', date: '1964; online edition inspected 2026-10-16',
    kind: 'Author lecture textbook', country: 'USA', url: 'https://www.feynmanlectures.caltech.edu/II_27.html',
    version: 'Volume II, chapter 27, Caltech online edition', passageRead: 'Sections 27–2 and 27–6; Poynting balance, field momentum and light recoil.',
    access: 'Selected sections read in full.', provenance: 'Primary teaching derivation from Maxwell equations; not a new reading of Maxwell’s original papers.',
    evidence: 'Field and matter exchange energy and momentum. In vacuum, light carries momentum E/c; ignoring field momentum can create an apparent conservation violation.',
    limitations: 'Material media need their own stress and momentum accounting. Electromagnetic momentum transfer does not by itself establish gravity shielding.',
    status: 'derived', topics: ['Maxwell', 'electromagnetism', 'momentum', 'optical trapping'],
  },
  {
    id: 'foundation-einstein', title: 'Einstein — The Meaning of Relativity', date: '1921 lectures; later collected edition',
    kind: 'Historical scientific book', country: 'International', url: 'https://lectures.princeton.edu/sites/g/files/toruqf296/files/2020-08/_Albert_Einstein__Brian_Greene__The_meaning_of_rel_BookZZ.org_.pdf',
    version: 'Princeton-hosted 103-page PDF; printed pages 32–33 (PDF indices 35–36; reader pages 36–37)',
    passageRead: 'Opening General Theory of Relativity discussion: inertial/gravitational mass and accelerated reference systems.',
    access: 'Selected two-page passage read; full book and later appendices not audited.', provenance: 'Einstein’s lecture text in a later collected English edition.',
    evidence: 'Equality of inertial and gravitational mass connects universal free fall with accelerated-coordinate descriptions.',
    limitations: 'Local equivalence does not erase tidal curvature or show that a laboratory sound frequency alters gravity. No such device follows from the selected passage.',
    status: 'historical', topics: ['Einstein', 'gravity', 'equivalence', 'antigravity'],
  },
  {
    id: 'foundation-casimir', title: 'Casimir — On the attraction between two perfectly conducting plates', date: '1948',
    kind: 'Original theoretical paper', country: 'International', url: 'https://www.mit.edu/~kardar/research/seminars/Casimir/Casimir1948.pdf',
    version: 'Proceedings 51, 793–795; 1997 reprint, digitized 2008, MIT mirror',
    passageRead: 'Original final page 795 visually inspected: energy per area, attractive force and material/separation approximation.',
    access: 'Selected final page read; no experiment reported there.', provenance: 'Casimir’s theoretical result, preserved in an academy reprint.',
    evidence: 'For ideal parallel conductors, U/A = −π²ℏc/(720a³); the attractive pressure magnitude is π²ℏc/(240a⁴).',
    limitations: 'Ideal boundary result, not a gravity-cancellation or cyclic-power demonstration. Resetting plate separation requires an energy budget; real materials, geometry and temperature matter.',
    status: 'derived', topics: ['Casimir', 'quantum', 'vacuum', 'free energy'],
  },
  {
    id: 'foundation-ratchet', title: 'Feynman, Leighton & Sands — Ratchet and pawl', date: '1963; online edition inspected 2026-10-16',
    kind: 'Author lecture textbook', country: 'USA', url: 'https://www.feynmanlectures.caltech.edu/I_46.html',
    version: 'Volume I, chapter 46, sections 46–1 and opening 46–2', passageRead: 'Thermal fluctuations of both vane and pawl; equal-temperature balance and the role of a temperature difference.',
    access: 'Selected sections read.', provenance: 'Author’s microscopic teaching model of the second law.',
    evidence: 'The rectifier fluctuates too. An idealized one-way mechanism cannot continuously extract net work from a single equilibrium heat bath.',
    limitations: 'A temperature difference or another nonequilibrium source changes the energy budget. This example is not a test of every modern energy harvester.',
    status: 'derived', topics: ['thermodynamics', 'free energy', 'Feynman', 'controls'],
  },
];

export const FOUNDATION_EXPERIMENTS: readonly LevitationExperiment[] = [{
  id: 'energy-cycle-audit', title: 'Close the energy budget before claiming excess power', mechanism: 'Conservation and measurement control', status: 'Proposed',
  question: 'Does an apparent output surplus survive a full cycle and explicit stored-energy accounting?',
  prediction: 'The simulated damped oscillator has equal average drive and loss power in steady state; reducing damping changes amplitude, not the source of energy.',
  setup: 'Use the virtual vibration bench. Export the response rows and compare input/loss columns. For a future low-energy instrument study, define a system boundary and calibrated input, load, temperature and storage measurements before collecting data.',
  variables: 'Damping, drive frequency and amplitude; measurement interval and initial/final storage state.',
  control: 'Zero-drive run, detuned run and known passive load. Include phase-sensitive electrical power where applicable, not voltage times current magnitudes alone.',
  measurement: 'Residual R = Eout + ΔEstored − Ein, with the sign convention fixed in advance, all energy channels and a combined uncertainty.',
  falsifier: 'A claimed surplus that disappears after storage, heat or phase correction fails this test. A residual exceeding uncertainty motivates independent replication, not an immediate mechanism claim.',
  limits: 'The software comparison is an identity of its equations. No new physical experiment or free-energy device has been demonstrated.',
  sourceIds: ['foundation-energy', 'foundation-maxwell', 'foundation-ratchet'],
}];
