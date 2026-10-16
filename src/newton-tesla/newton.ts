/** Selected primary-text readings checked live on 2026-10-16. */
export interface NewtonRecord {
  id: string;
  title: string;
  date: string;
  kind: string;
  locator: string;
  documented: string;
  modernModel: string;
  missingBridge: string;
  counterexample: string;
  experimentIdea: string;
  url: string;
  access: string;
}

export const NEWTON_RECORDS: readonly NewtonRecord[] = [
  {
    id: 'newton-orbital-inference',
    title: 'From an orbit to a candidate force law',
    date: 'Late 1684',
    kind: 'Mathematical manuscript',
    locator: 'De motu corporum in gyrum; Add. 3965.7, ff. 55r–57r; Theorem 2, corollaries 1–5, Theorem 3, Problems 2–3.',
    documented: 'Newton relates circular motion to centripetal force and reconstructs laws from geometric motion. His ellipse examples distinguish a force directed toward the ellipse’s center from one directed toward a focus.',
    modernModel: 'Our circular reconstruction: a = 4π²r/T². If T² = kr³ with a common k, then a = (4π²/k)r⁻². This is acceleration per unit mass under the stated assumptions.',
    missingBridge: 'A geometric outline without timing, force direction and a specified model does not identify a unique cause. A circular calculation alone is not a general many-body derivation or evidence for a biological frequency law.',
    counterexample: 'An ellipse can arise under a center-directed linear restoring law or a focus-directed inverse-square law, with different timing. Shape alone cannot choose between them.',
    experimentIdea: 'Proposed computational check: compare two exact synthetic elliptical trajectories, record their time parametrizations and force centers, then test which observations distinguish the laws. Display the assumed equations beside the result.',
    url: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00089',
    access: 'Named Latin passages and catalogue date checked in the Newton Project normalized transcription. Modern equations are our reconstruction; no claim to have re-proved every manuscript proposition.',
  },
  {
    id: 'newton-colour-musical-analogy',
    title: 'Color and music: an explicit analogy with limits',
    date: '1704, first edition',
    kind: 'Published optical argument',
    locator: 'Opticks, Book I, Part II; Proposition III, Experiment VII, pp. 91–93; Proposition VI, Problem II, pp. 114–117.',
    documented: 'Newton compares marked spectral divisions with monochord proportions and uses musical intervals in a color circle. He also records a two-color mixture that does not behave as his circle’s center rule predicts.',
    modernModel: 'A chosen map can assign colors to pitches. A schematic mixture uses Z = Σwᵢpᵢ/Σwᵢ for positive weights. For an ideal string at fixed tension and linear density, frequency is inversely proportional to length; this is our model translation.',
    missingBridge: 'A shared ratio is not a conversion mechanism between light and sound. Color boundaries, a chosen pitch reference and display geometry do not determine universal auditory effects or healing.',
    counterexample: 'Changing the chosen pitch reference changes every audible frequency while preserving all intervals. Newton’s reported mixing exception limits his historical construction; it is not a modern law that two lights can never match white.',
    experimentIdea: 'Proposed software comparison: hold ratios fixed while changing the reference pitch, and compare multiple explicitly named color–pitch maps. If the same source admits different outputs, uniqueness is refuted; no health effect is predicted.',
    url: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034',
    access: 'Named passages checked in the Newton Project transcription of the 1704 edition. This records Newton’s comparison and qualifications, not modern colorimetry or a Newton-authored sound preset.',
  },
  {
    id: 'newton-fluxions-inverse',
    title: 'Fluxions: change, substitution and lost information',
    date: 'October 1666',
    kind: 'Working mathematical manuscript',
    locator: 'October 1666 Tract on Fluxions; Add. 3958.3; opening notes and examples on f. 48v.',
    documented: 'Newton introduces auxiliary quantities and their rates, substitutes them into an equation, and then restores their values. The diplomatic transcription preserves revisions and alternative working.',
    modernModel: 'Our modern reconstruction: F(x,y)=0 gives dy/dx = −Fₓ/Fᵧ locally when F is continuously differentiable and Fᵧ ≠ 0. Conversely, integrating a derivative requires an initial value or other condition.',
    missingBridge: 'A derivative supplies local change, not a unique whole trajectory. Denominators, branch choices, regularity and numerical error cannot be dropped when reversing an operation.',
    counterexample: 'Every y=x²+C has derivative 2x. For x²+y²=1, the displayed derivative formula fails where y=0, even though the curve itself still exists.',
    experimentIdea: 'Proposed synthetic check: differentiate several curves with different constants, then reconstruct them with and without an initial value. Vary numerical step size and show approximation error instead of treating finer sampling as automatic truth.',
    url: 'https://www.newtonproject.ox.ac.uk/view/texts/diplomatic/NATP00100',
    access: 'Opening prose, examples and editorial metadata checked in diplomatic transcription. No facsimile-level verification of every historical symbol; the displayed derivative formula is explicitly modern.',
  },
  {
    id: 'newton-chymical-failures',
    title: 'Chymical notebooks retain unsuccessful outcomes',
    date: '10–17 December 1678 entries',
    kind: 'Laboratory notes',
    locator: 'Experiments; Cambridge Add. MS. 3973, ff. 1r–1v; Indiana edition ALCH00109.',
    documented: 'Dated entries record masses, residues, appearances and mixtures that failed to combine as expected. These are observations in a working notebook, not a demonstration of transmutation or a universal active principle.',
    modernModel: 'Our bookkeeping analogy separates measured input, measured output, unmeasured transfers and uncertainty. A residual r = measured input − accounted output is a discrepancy to investigate, not an automatic measurement of a new cause.',
    missingBridge: 'Historical substance names, symbols and changing operations do not uniquely identify modern materials or mechanisms. An appearance change cannot establish an elemental or biological transformation.',
    counterexample: 'An unmeasured transfer or collection loss can produce a balance residual without a novel mechanism. Selecting only successful-looking entries would erase counterevidence already present in the notebook.',
    experimentIdea: 'Proposed paper-only audit: code the selected entries as observation, interpretation, uncertainty or unsuccessful outcome. Use an abstract synthetic balance to demonstrate how missing measurements change an inferred residual. Do not recreate the operations.',
    url: 'https://newton.dlib.indiana.edu/text/ALCH00109/normalized',
    access: 'Selected dated entries and manuscript metadata read in Indiana’s normalized transcription. The larger 1678–1696 notebook was not read in full; hazardous substances, quantities and procedures are not reproduced.',
  },
  {
    id: 'newton-hermetic-correspondence',
    title: 'Hermetic correspondence is a source, not an identified law',
    date: 'Manuscript undated in inspected record; digital edition 2010',
    kind: 'Translation/copy of an attributed Hermetic text',
    locator: 'Hermes; Keynes MS. 28, ff. 2r–2v; English Tabula Smaragdina; Indiana ALCH00017.',
    documented: 'The manuscript preserves an English Emerald Tablet text with an above/below correspondence and accompanying references. This documents Newton’s engagement with an attributed authority; it does not make him the originator of that text.',
    modernModel: 'Our testable translation asks for two named systems, a map and an observable preserved by that map. In an ideal oscillator, ω₀=√(k/m): one measured frequency identifies a ratio, not both parameters.',
    missingBridge: 'Words such as spirit, unity or correspondence need operational definitions before becoming model variables. The inspected source supplies neither a cross-scale equivalence proof nor a Newton-to-Tesla transmission record.',
    counterexample: 'Scaling k and m by the same positive factor preserves ω₀ while changing the oscillator’s response to a specified external force. Matching frequency therefore does not identify the full system.',
    experimentIdea: 'Proposed synthetic identifiability check: display parameter pairs with the same natural frequency but different static compliance. An additional independent observable can distinguish them; analogy alone cannot.',
    url: 'https://newton.dlib.indiana.edu/text/ALCH00017/normalized',
    access: 'English ff. 2r–2v and catalogue checked; diplomatic view also inspected. Latin commentary was not fully translated. The manuscript’s composition date is not assigned from the digital publication date.',
  },
  {
    id: 'newton-prophetic-language',
    title: 'Prophecy uses an interpretive dictionary',
    date: '1733, posthumous published edition',
    kind: 'Theological interpretation',
    locator: 'Observations upon the Prophecies of Daniel, and the Apocalypse of St. John; Part I, Chapter II, pp. 16–23.',
    documented: 'Newton maps natural-world imagery to political and ecclesiastical meanings and describes contextual exceptions. This is a theological reading of figurative language, not a mechanics experiment or evidence of every practice called occult.',
    modernModel: 'Our methodological analogy is an explicit codebook: symbol plus context maps to an interpretation. Keeping the dictionary visible lets another reader examine consistency and alternative readings.',
    missingBridge: 'Interpretive coherence does not establish a physical force, a numerical constant or a future event forecast. Theology, alchemical practice and ceremonial magic cannot be merged merely because they share symbolic vocabulary.',
    counterexample: 'A dictionary revised after each example may fit incompatible histories. Such flexibility prevents the fit alone from testing a unique prediction; it does not adjudicate religious belief.',
    experimentIdea: 'Proposed textual exercise: specify a small dictionary on one passage, preserve its exceptions, then compare how it handles a separate passage. Report disagreements as interpretive limits, not physiological or prophetic validation.',
    url: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00196',
    access: 'The complete short chapter and 1733 edition metadata checked in the Newton Project normalized transcription. No claim to have reviewed Newton’s entire theological corpus.',
  },
];
