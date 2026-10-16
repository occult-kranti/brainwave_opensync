# Newton–Tesla research network: complete dossier

Prepared 16 October 2026. Selected source audit, mathematical reconstructions and proposed experiments; no exhaustive-corpus, completed-discovery or clinical-efficacy claim.

This document combines the network analysis with its primary-text, patent, model and listening appendices. Historical claims, modern equations and untested proposals retain their separate labels.

Contents:
- [Network and path certificates](#network-and-path-certificates)
- [Appendix A: Newton primary audit](#appendix-a-newton-primary-audit)
- [Appendix B: Tesla patent audit](#appendix-b-tesla-patent-audit)
- [Appendix C: mathematical models](#appendix-c-mathematical-models)
- [Appendix D: listening comparisons](#appendix-d-listening-comparisons)

## Network and path certificates

# Newton–Tesla network: what each connection establishes

Checked 16 October 2026. The implementation is `src/newton-tesla/network.ts`: 23 nodes, 34 typed edges and six proposed experiments. These counts describe the selected catalog, not the fraction of a corpus understood or a scientific problem solved. No experiment in this ledger has participant or physical-bench results.

The historical-physics-panel method informs this audit: historical passage → declared modern interpretation → model → observable → discriminating control. A connected drawing is not evidence of influence, causation or a common hidden mechanism. Nodes identify topics rather than perfectly equivalent physical entities. Arrows name a directed relationship; they do not automatically represent causal arrows.

## Edge contract

| Status | What the edge warrants | What it does not warrant |
| --- | --- | --- |
| Documented | The cited record states or measures the named relationship | Every claim in a patent, a source’s whole worldview, or performance of another apparatus |
| Derived | Our mathematical consequence under explicit assumptions | Historical authorship, physical measurement or independent discovery |
| Analogy | A stated structural comparison | Identity of material, energy, sensation or mechanism |
| Unsupported | The proposed bridge is absent from the inspected evidence | Proof that no relevant document could ever exist |

`missingBridge` describes the next necessary evidence even for an otherwise supported edge. Unsupported edges remain visible to show why an attractive route fails. They must not be drawn as established pathways or removed from an export that otherwise implies their conclusion.

## Path certificates

### A. Motion → mechanical oscillator → electrical oscillator

The historical entry is Newton’s [*De motu*, Theorems 2–3 and Problems 2–3](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00089). The following is our modern specialization, not Newton’s notation:

\[
m\ddot x+b\dot x+kx=F(t),\qquad
L\ddot q+R\dot q+q/C=V(t).
\]

| Coordinate or coefficient | Mechanical units | Corresponding electrical quantity and units |
| --- | --- | --- |
| Displacement \(x\) | m | Charge \(q\), C |
| Mass \(m\) | kg | Inductance \(L\), H |
| Damping \(b\) | kg/s | Resistance \(R\), Ω |
| Stiffness \(k\) | N/m | Inverse capacitance \(1/C\), F⁻¹ |
| Driving force \(F\) | N | Source voltage \(V\), V |

Both reduce to a second-order linear equation after the coordinate and time scales are specified. The [MIT oscillator lecture](https://ocw.mit.edu/courses/18-034-honors-differential-equations-spring-2009/5143aa0eeba318f53ff7fc53c150b585_MIT18_034s09_lec07.pdf) explicitly presents the mechanical/electrical correspondence. We re-derived the charge form rather than copying PDF text extraction: its circuit example uses capacitor voltage, and OCR can obscure factors of capacitance.

The shared normalized displacement/capacitor-voltage magnitude is

\[
H(r,\zeta)=[(1-r^2)^2+(2\zeta r)^2]^{-1/2}.
\]

For mechanics, \(\omega_0=\sqrt{k/m}\) and \(\zeta=b/(2\sqrt{mk})\); for a series circuit, \(\omega_0=1/\sqrt{LC}\) and \(\zeta=(R/2)\sqrt{C/L}\). Here \(r=\omega/\omega_0\), and \(\omega\) uses rad/s. The output matters: capacitor magnitude peaks below \(\omega_0\) when \(\zeta<1/\sqrt2\); current magnitude peaks at \(\omega_0\). Neither gain is an efficiency.

**Certificate:** `motion-to-oscillator` (derived) + `mechanical-to-rlc` (derived) supports the restricted equation correspondence. It does not establish that tissue, a musical instrument and a coil have interchangeable parameters, or that Newton supplied Tesla’s circuit theory. Identifying parameters requires measured forcing, output, time calibration and a justified model. Equal normalized curves leave a family of dimensional systems unresolved.

### B. Tesla’s tuned receiver → later coupled modes → loss accounting

[US645576A](https://patents.google.com/patent/US645576A/en) describes a proposed synchronized source/receiver arrangement. [Kurs et al., *Science* 317 (2007), pp. 83–86](https://www.sawaya.ecei.tohoku.ac.jp/common/item/pdf/doctor/091208.pdf) explicitly situates its own work after Tesla’s wireless proposals. That is an actual source connection, not proof the devices are identical. Its cited Tesla patent is US1119732; our selected historical patent is US645576A.

The paper’s near-field experiment and two-mode model have an identified load and losses. Its reported transfer efficiency around 40–50% at the example distance is distinct from its 15% wall-to-load example. Omitting the driver changes the denominator. These are apparatus-specific results, not performance claims for the teaching model.

For our proposed passive two-mode check, use

\[
\dot a_1=(i\omega_1-\gamma_1)a_1+i\kappa a_2,
\quad
\dot a_2=(i\omega_2-\gamma_2)a_2+i\kappa a_1.
\]

Take real reciprocal \(\kappa\), nonnegative \(\gamma_i\), no forcing, and energy-normalized amplitudes in \(\sqrt{\mathrm J}\). Frequencies and rates have units s⁻¹. Direct differentiation cancels the coupling terms:

\[
\frac{d}{dt}(|a_1|^2+|a_2|^2)
=-2\gamma_1|a_1|^2-2\gamma_2|a_2|^2\leq0.
\]

Individual mode energy can increase through exchange while total stored energy falls. Set coupling to zero as a decisive control: equal frequencies alone cannot transfer energy. A driven calculation needs a source term; a loaded efficiency calculation also needs an extraction term. This proposed solver does not exist in the current three-model bench and is not a hardware reconstruction.

**Certificate:** `tesla-tuned-receiver` and `tesla-kurs-comparison` document a proposal and a later comparison. `rlc-coupling-reduction` is our mathematical bridge, conditional on a valid reduction. `transfer-loss-boundary` restricts any performance inference. No step licenses free energy or replication of an Earth-scale transmission system.

### C. Phase plot → rotating-field teaching model

The [1888 motor patent](https://patents.google.com/patent/US381968A/en) documents progressive pole motion through independently supplied circuits. Our normalized construction is

\[
x=\cos\theta,\quad y=\cos(\theta-\phi).
\]

At quadrature it traces a unit circle; at zero phase it traces a line. Over one cycle the signed area is \(\pi\sin\phi\). The area changes sign on phase reversal. These statements are direct trigonometric consequences, not motor measurements. The implemented model also permits amplitude imbalance.

**Certificate:** `motor-phase-model` is derived from a stated idealization. It establishes a geometric comparison. There is no torque, slip, winding distribution, saturation, rotor inertia or electrical load in that plot. A field circle cannot be relabeled as an efficiency curve or a clinical exposure.

### D. Light and sound → same wave form, different physical quantities

[Maxwell’s 1865 paper, Part VI, §§94–97, pp. 497–499](https://jensen.thphys.uni-heidelberg.de/~ewerz/ps/Maxwell1865.pdf) connects electromagnetic propagation with light in the notation and physical interpretation of its time. In modern vacuum notation, \(c=1/\sqrt{\epsilon_0\mu_0}\). An ideal small-amplitude fluid sound wave instead has \(c_s=\sqrt{B/\rho}\), with bulk modulus \(B\) in Pa and density \(\rho\) in kg/m³; see [OpenStax’s sound-speed derivation](https://openstax.org/books/university-physics-volume-1/pages/17-2-speed-of-sound).

Both permit \(\lambda=v/f\), but the dependent variables, boundary conditions, source coupling and energy densities differ. [NIST’s current SI value](https://physics.nist.gov/cuu/Constants/Value/c.html) fixes vacuum light speed at 299,792,458 m/s. This is not Maxwell’s historical numerical estimate. Using a classroom air speed of 343 m/s produces the same period at a chosen frequency and a very different wavelength.

**Certificate:** `light-sound-wave-form` is an analogy, not an equality of fields. `newton-to-maxwell` compares an overlapping optical observable without assigning Maxwell’s theory to Newton. `colour-to-audio` is a chosen sonification; no unique conversion from optical wavelength to musical pitch follows. A screen colour, an audio spectrum and a measured percept must remain distinct.

### E. Electromagnetic cavity → Schumann peaks → failed mental-state bridge

The [NASA-hosted Simões, Pfaff and Freudenreich manuscript](https://ntrs.nasa.gov/api/citations/20120000051/downloads/20120000051.pdf) reports C/NOFS electric-field observations and contrasts ideal modes with lossy, variable boundaries. Its thin lossless-sphere formula is an angular frequency:

\[
\omega_n=\frac{c}{R}\sqrt{n(n+1)},\qquad
f_n=\frac{c}{2\pi R}\sqrt{n(n+1)}.
\]

With an illustrative mean Earth radius \(R=6.371\times10^6\) m, the first ideal value is about 10.59 Hz. The reported lowest observed peak is near 7.8 Hz. The difference cannot be removed by dropping the \(2\pi\) or quietly fitting a new speed. Boundary conductivity, leakage and variability are part of the model discrepancy. These modes are driven by lightning and have finite bandwidth.

**Certificate:** `maxwell-schumann` and `schumann-loss` support a geophysical chain. `schumann-to-experience` is unsupported by this source. Sharing a numerical rate with an EEG-band label supplies neither exposure at a person nor a biological coupling mechanism. An audio envelope cannot stand in for an electromagnetic cavity measurement.

### F. Manuscript or integer → device or experience

The inspected [Newton notebook](https://newton.dlib.indiana.edu/text/ALCH00109/normalized) and Tesla patent are separate records. The edge `alchemy-to-tesla` fails without dated transmission evidence such as an attributable citation or correspondence. Similar vocabulary is insufficient. The selected [1892 Tesla lecture](https://www.gutenberg.org/files/13476/13476-h/13476-h.htm) discusses physical tuning and loss; it does not supply a universal 3–6–9 resonance law. This conclusion is bounded to inspected material and is not a complete quotation census.

The proposed matched-label audit starts with byte-identical arrays. Their identical digital spectra are a mathematical control, not a participant result. [Enstroem and Schmaltz (2022)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.873517/full) separate actual music format from format labels in a perception experiment. That supplies a methodological precedent, not evidence for these number labels or for a medical effect. Any future participant study requires a reviewed design and genuine outcome measurements.

### G. Fluxions → inverse information → an uncertainty obligation

The [1666 fluxions tract, opening f. 48v](https://www.newtonproject.ox.ac.uk/view/texts/diplomatic/NATP00100) supplies a historical record of substitution and rates. Our modern counterexample is that every \(y=x^2+C\) has the same derivative. An initial value supplies information that differentiation discarded. For a forward finite difference with independent measurement errors of variance \(\sigma^2\),

\[
\operatorname{Var}\left[\frac{\epsilon(t+h)-\epsilon(t)}h\right]
=\frac{2\sigma^2}{h^2}.
\]

With \(y\) measured in metres and \(h\) in seconds, this variance has units m²/s². Smaller steps reduce the leading truncation bias for sufficiently smooth functions but amplify this noise contribution. Correlation changes the variance; unknown timing introduces another error term.

**Certificate:** `fluxions-inverse-motion` and `fluxions-error-control` are our derivations. They motivate additional observations and a declared noise model, not a claim that a historical technique automatically solves an inverse problem.

### H. Stored charge and remote commands → separate budgets

[US685957A](https://patents.google.com/patent/US685957A/en) proposes external radiant input and stored charge. A modern bookkeeping model might use \(C\dot V=I_{in}-V/R_{leak}-I_{load}\), with charge rates in amperes and stored energy \(CV^2/2\) in joules. This does not establish a microscopic conversion mechanism or actual collection current. With zero external input and initially empty passive storage, there is no sustained output.

[US613809A](https://patents.google.com/patent/US613809A/en) describes received control disturbances while onboard batteries power propulsion. A valid command cannot supply work from an empty battery; a full battery cannot decode an absent command.

**Certificate:** `radiant-storage-budget` and `remote-battery-budget` are documented distinctions within patent descriptions. A state machine or charging curve would be a new model, not evidence of measured patent performance. Neither device is recreated physically here.

### I. Interpretive traditions → an anticipated proof remains anticipated

Newton’s [Hermetic copy, English ff. 2r–2v](https://newton.dlib.indiana.edu/text/ALCH00017/normalized), his [theological codebook chapter](https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00196), and [Vivekananda’s letter of 13 February 1896](https://www.ramakrishnavivekananda.info/vivekananda/volume_5/epistles_first_series/057_blessed_and_beloved.htm) have different authorship and interpretive roles. The letter reports Tesla’s interest and an expected demonstration; it does not contain a completed proof. No equation is inferred from the words *prana*, *akasha* or *spirit*.

**Certificate:** `interpretation-vedanta-comparison` is a methodological analogy, not a doctrine or influence chain. `vedanta-proof-status` documents an expectation. `correspondence-identifiability` is our countercheck: matching \(\sqrt{k/m}\) leaves \(k\) and \(m\) separately unidentified. Dated historical transmission evidence, operational definitions and independent observables are the missing bridges.

## Devices and experiment readiness

| Proposed comparison | Existing software support | Separate work still required |
| --- | --- | --- |
| RLC loss and detuning | RMS current/voltage, phase, power balance and distinct capacitor peak | A physical isolated ≤1 V RMS source, passive R/L/C, known sense resistor and voltage measurement; component tolerances, source/winding resistance and probe loading must enter the comparison |
| Phase circle versus line | Normalized orthogonal components and shape classification | An area-convergence audit; any real motor needs additional fields, dynamics and measurements |
| Refraction with dispersion null | One flat interface, critical angle and total internal reflection | A tested second-interface/dispersion extension; passive tabletop prism, diffuse LED/slit, angle scale and screen for independent ray-angle observations |
| Same rate across media | Related sound bench calculates wavelength for fixed reference media | Explicit electromagnetic comparison and cavity calculation; geophysical field data remain external |
| Coupled-mode energy loss | No coupled-mode transient solver in this release | New solver, conservation residual and step-refinement checks; hardware parameters remain absent |
| Identical audio, different labels | Existing audio construction can supply sample arrays | Hash/spectral equality audit; any perception study is separate, proposed and unperformed |

The physical references are modern low-energy teaching analogues. They are not construction tutorials for patents or permissions to connect mains, high-voltage, RF transmitters or a person. The optical reference uses diffuse low-intensity illumination rather than lasers or focused sunlight. Ordinary component and instrument ratings still apply; a software input bound is not certification of real apparatus.

No clinical endpoint, biological tuning, synthetic participant data or therapeutic dose is generated. The new information is an explicit source-to-model map and its proof obligations, not a novel physical law.

## Source-access ledger

| Record | Actual depth used in this network |
| --- | --- |
| Newton *De motu*, NATP00089 | Normalized primary text, Theorems 2–3 and Problems 2–3; modern oscillator interpretation explicitly ours |
| Newton *Opticks* I.II, NATP00034 | Refraction passages and Proposition VI, including musical proportions and the mixture qualification; selected sections, not complete corpus |
| Newton ALCH00109 | Public normalized manuscript opened; selected 1678 entries checked by the companion Newton audit; no operations reproduced |
| Newton fluxions / Hermetic / theology | Fluxions opening f. 48v and theological chapter read; Hermetic English passage checked by companion audit and source reopened. These are distinct genres, not one physical theory |
| Tesla US381968A / US645576A | Public patent text: progressive-pole description/claims and synchronized source–receiver passages; technical proposal distinguished from test results |
| Tesla US685957A / US613809A | Selected primary patent descriptions of external input/storage and remote control/onboard power checked; no operating-performance replication |
| Vivekananda letter, 13 February 1896 | Complete published transcription read; autograph and anticipated demonstration not obtained |
| Tesla 1892 lecture | Public transcription; tuning/loss passages checked in the companion Tesla audit; no exact-device replication claimed |
| MIT 18.034 Lecture 7 | Five-page PDF available; mechanical/circuit equation page visually inspected; algebra independently derived to avoid OCR errors |
| Kurs et al. 2007 | Four-page published article at a university host; formalism, efficiency accounting, concluding limits and historical citation read; supplement not audited |
| Maxwell 1865 | University-hosted scan; Part VI pp. 497–500 visually inspected; not a claim to read all 54 article pages |
| Simões et al. 2011 | NASA technical-report manuscript, cavity formula, observations and discussion read; figure captions read, underlying satellite data not reanalyzed |
| OpenStax sound / NIST c | Official educational derivation and constant record; these are reference sources rather than new experimental evidence |
| NIDCD hearing | Official explanatory page; transduction pathway only |
| Enstroem and Schmaltz 2022 | Publisher full-text design/results previously checked and source reopened; methodological transfer is ours |

Source hosting alone is not a grade: a submitted speculative document on a government server would still require authorship, publication type and evidence checks. This network uses a specific satellite-observation manuscript for the cavity claim, not a generic appeal to NASA. Partial access and missing measurements remain part of the result.

## Validation of this artifact

The standalone data module passes ESLint and TypeScript transpilation. Executed structural checks found 23 unique nodes, 34 unique edges, six proposed experiments, no dangling endpoints and 19 valid HTTPS source URLs. The edges comprise 12 documented, 10 derived, eight analogy and four unsupported relationships. Validation checks required nonempty predictions, controls, falsifiers and limits.

Independent numerical sanity checks confirmed the stated capacitor/current peak distinction, phase-area sign and circle/line limits, and the illustrative ideal-cavity value 10.59127458 Hz. These are arithmetic/code checks, not newly observed physical effects. The simulation agent independently audited the initial network against selected primary sources; subsequent additions are separately reviewable by their edge IDs. Deployment and the full application test suite belong to the integration review.


---

## Appendix A: Newton primary audit

# Newton primary-text audit: inference, analogy and hidden causes

Checked live on 16 October 2026. This report supports the six records in `src/newton-tesla/newton.ts`. It covers selected passages, with two companion readings, rather than Newton’s complete corpus. The earlier `research-atlas/archive/newton-tesla-alchemy` dossier served as a discovery lead; its claims were not inherited as verified facts.

The Newton analysis-and-synthesis skill and its research and hidden-causes references guided the method: identify the observation; reconstruct a candidate explanation; derive a consequence; expose information lost in the reverse inference; and seek a counterexample. The mathematical reconstructions below are ours. Historical authority supplies neither a modern physical proof nor evidence that a preset improves health.

## Edition and access register

| Reading | Original date or edition | Locator inspected | Access and limits |
| --- | --- | --- | --- |
| [De motu corporum in gyrum](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00089) | Late 1684, according to the [catalogue](https://www.newtonproject.ox.ac.uk/catalogue/record/NATP00089) | Add. 3965.7, ff. 55r–57r; Theorem 2 with corollaries, Theorem 3, Problems 2–3 | Normalized Latin transcription; selected propositions, not a fresh verification of every geometric proof |
| [Opticks, Book I, Part II](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034) | London, 1704, first edition | Proposition III, Experiment VII, pp. 91–93; Proposition VI, pp. 114–117 | Continuous transcription and edition metadata; modern display color was not calibrated against the historical construction |
| [October 1666 Tract on Fluxions](https://www.newtonproject.ox.ac.uk/view/texts/diplomatic/NATP00100) | October 1666 | Add. 3958.3, f. 48v, opening notes/examples | Diplomatic transcription shows revisions; every symbol was not checked against a manuscript image |
| [Experiments](https://newton.dlib.indiana.edu/text/ALCH00109/normalized) | Selected entries dated 10–17 December 1678 | Add. MS. 3973, ff. 1r–1v | Indiana normalized transcription; selected entries in a much larger notebook |
| [Hermes / Tabula Smaragdina](https://newton.dlib.indiana.edu/text/ALCH00017/normalized) | Composition date not assigned in the inspected record | Keynes MS. 28, ff. 2r–2v; English text and metadata | Normalized and diplomatic views; Latin commentary not fully translated; 2010 is the digital edition date |
| [Of the Prophetic Language](https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00196) | London, 1733, posthumous edition | Part I, Chapter II, pp. 16–23 | Complete short chapter and edition metadata |
| [General Scholium](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00056), companion | London, 1729 English edition, volume 2 | pp. 392–393, with surrounding theological discussion | The edition actually consulted is the English translation, not an original Latin manuscript |
| [Opticks, Book III](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00051), companion | London, 1718 second edition | Query 31, closing analysis/synthesis discussion, pp. 380–382 | Selected closing paragraphs; no claim to have audited every Query |

Normalized transcriptions apply editorial treatment and can conceal revisions. Diplomatic transcriptions retain more of the working document but can still contain unclear symbols. The source locator, edition and access claim are therefore part of the evidence, not decorative bibliographic details. Digital publication dates are kept separate from composition dates.

## 1. Orbital inference: the center and the clock matter

In *De motu*, Theorem 2 links circular motion to centripetal force; its fifth corollary links a period–radius relation to inverse-square dependence. Theorem 3 turns local geometry into an inverse problem. Problems 2 and 3 then distinguish the ellipse’s center from a focus as the force center. The manuscript supplies a particularly useful warning against identifying a law from shape alone.

Our restricted modern reconstruction is

\[
a=\frac{v^2}{r}=\frac{4\pi^2r}{T^2}.
\]

For uniform circular motion and a shared constant `k`, assuming `T²=kr³` gives `a=(4π²/k)r⁻²`. The units are acceleration; mass has not been inferred. The calculation does not establish a universal interaction law from one orbit. The assumptions include circularity, an identified center, time measurement and comparability between observations.

A stronger counterexample is available without collecting new data. Let

\[
x(t)=A\cos(\omega t),\qquad y(t)=B\sin(\omega t).
\]

Then `r̈=−ω²r` points toward the geometric center while the path is an ellipse. A Kepler ellipse instead has a focus-directed inverse-square acceleration and a different timing law. Thus the bare ellipse cannot identify the mechanism. A visual loop with no scale, timestamps or force center is even less informative.

**Proposed lab exercise:** compare exact synthetic trajectories and show the center, time parametrization, acceleration and conserved quantity. Fit only a subset of observations, then evaluate withheld positions or times. The result tests the stated mathematical models. It does not discover a new force or connect orbital geometry to human physiology.

## 2. Optical and musical proportions: preserve the analogy’s status

In *Opticks* I.II, Proposition III, Newton describes an assistant marking color boundaries and compares the divisions with monochord lengths. Proposition VI uses musical proportions in a color circle and predicts mixtures by a weighted center. He then records a two-color mixture that fails to match the center’s whiteness prediction. These are observations and a historical construction with stated limitations, not a universal conversion between light and sound.

A modern schematic version can use

\[
Z=\frac{\sum_i w_i p_i}{\sum_i w_i},\qquad w_i\ge0,\quad \sum_iw_i>0,
\]

with explicitly chosen planar points `pᵢ`. This is a geometric weighted mean. It is not automatically a calibrated model of color perception. Newton’s own failed mixture should not be restated as the modern claim that no pair of lights can match white.

For a separate ideal-string model,

\[
f=\frac{1}{2L}\sqrt{\frac{\mathcal{T}}{\mu}},
\]

where `L` is length, `𝒯` tension and `μ` linear mass density. Inverting length ratios gives frequency ratios only when the other quantities stay fixed. Newton’s optical comparison does not select an absolute reference pitch. Multiplying every audible frequency by the same positive factor preserves the interval ratios, so the historical analogy cannot uniquely determine a modern sound preset.

**Proposed lab exercise:** compare multiple declared mappings and reference pitches while holding ratios fixed. Display which choices are historical and which are the designer’s. A changing output under equally admissible mappings rejects uniqueness. A coherent audiovisual illustration can still be an artistic or educational choice; that coherence does not demonstrate a cross-modal treatment mechanism.

## 3. Fluxions: a reversible-looking calculation can lose information

The opening fluxions notes introduce a quantity and its rate, substitute auxiliary symbols, perform the rate calculation and restore the original values. The diplomatic page also exposes working revisions. The relevant practice is decomposition and reconstruction, not an anachronistic claim that Newton wrote the notation used below.

For a continuously differentiable relation `F(x,y)=0`, our modern local calculation is

\[
F_x+F_y\frac{dy}{dx}=0,
\qquad \frac{dy}{dx}=-\frac{F_x}{F_y},\quad F_y\ne0.
\]

The condition on the denominator is essential. At a point where it fails, another parametrization may work even though this formula does not. For the unit circle the formula is `−x/y`; at `y=0` the curve has not disappeared, but this local representation has failed.

Reverse inference has another ambiguity: `d(x²+C)/dx=2x` for every constant `C`. An initial value removes that freedom. In general, an inverse calculation must say which information has been discarded and which additional observation restores it.

Numerical differentiation also separates mathematical identity from measured estimation. For independent additive errors of variance `σ²` in two samples, the forward difference has noise variance `2σ²/h²`. Smaller `h` can reduce smooth-function truncation error while amplifying sample noise. No historical manuscript claim is needed for this algebraic consequence.

**Proposed lab exercise:** use a known synthetic function, preserve its exact derivative, and vary step size and controlled synthetic noise. Report both approximation error and noise. Reconstruct several integration constants to show nonuniqueness directly. This is a numerical lesson, not a claim about neural measurements or healing rates.

## 4. Experimental notebooks: failure is evidence to retain

The selected December 1678 entries in *Experiments* record weights, residues and appearances, including outcomes that did not combine as intended. A working notebook contains a different kind of claim from a published theorem or a copied authority. Its failed operations must remain in view when interpreting the apparent successes.

Our modern analogy is an error-aware balance, written abstractly as

\[
r=I_{measured}-O_{accounted}.
\]

The residual does not identify its cause. Measurement uncertainty, unrecorded transfers and incomplete collection can contribute. An unexplained remainder is therefore a reason to expand the accounting, not permission to label a hidden agent. This is a bookkeeping example; no material identities, quantities, temperatures or recreatable operations are supplied.

A useful textual audit would distinguish four layers: what was observed, what was measured, what was inferred and what remained uncertain. Historical vocabulary also needs contextual interpretation. A term translated as a spirit or a process described as vegetation cannot simply be replaced by electromagnetic energy, a cell process or a modern substance name.

**Proposed lab exercise:** annotate the inspected entries without deleting negative outcomes, then use an entirely synthetic balance sheet to show how an omitted channel changes the inferred residual. A second reader can disagree with the annotation and point to the text. Neither a color change nor a numerical remainder establishes elemental transformation, a therapeutic effect or a new field.

## 5. Hermetic correspondence and the problem of hidden causes

Keynes MS. 28 preserves an English *Tabula Smaragdina* alongside bibliographic references, a Latin version and commentary. The inspected English passage invokes correspondence between above and below. It is a transmitted Hermetic text in Newton’s papers, not a theorem authored by Newton. The catalogue inspected here does not justify assigning a precise composition date.

One productive modern question is whether two defined systems share an observable under a specified map. It requires domains, units and a relation between their dynamics. For linear models `u̇=Au` and `v̇=Bv`, a candidate mapping `v=Tu` has defect

\[
D=TA-BT.
\]

If `D=0`, the mapped trajectory obeys the second equation for states in the declared domain. If the map is non-invertible, even zero defect does not establish equivalence of the whole systems. A nonzero defect requires a bound before an approximate correspondence can be used. The historical metaphor supplies none of these premises.

Identifiability is a separate requirement. In an ideal oscillator, `ω₀=√(k/m)`. Parameter pairs `(k,m)` and `(αk,αm)` share that frequency for any positive `α`, while static compliance `1/k` changes. Matching one frequency therefore cannot identify all underlying properties. An independent calibrated observable can distinguish the candidates within this model.

The [1729 *General Scholium*, pp. 392–393](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00056), supplies an instructive companion. Newton distinguishes a law of gravity from an unassigned cause, then discusses a subtle spirit while acknowledging insufficient experiments to determine its laws. The coexistence of speculation and an evidential boundary should be preserved. Its vocabulary does not establish modern electromagnetism, a biological energy field or a healing mechanism.

**Proposed lab exercise:** display synthetic systems with a shared frequency and different compliance, or show a mapping’s computed defect. Label these modern examples. The inspected Newton passages provide no evidence of historical transmission to Tesla; that would require a separate dated source showing contact, citation or another specific route.

## 6. Theological interpretation has its own object and standards

The 1733 chapter *Of the Prophetic Language* maps natural imagery to political and ecclesiastical meanings and allows contextual variations. It is an explicit interpretive vocabulary. It should be read as theological interpretation rather than silently converted into mechanics, medicine or evidence of ceremonial practice.

Our transferable method is to expose an interpretive dictionary. Write `g(symbol, context)=interpretation`, record exceptions and distinguish a fixed rule from a rule revised after reading the desired outcome. A codebook can be evaluated for consistency without claiming that its vocabulary is a physical law. A comparison that redefines every symbol after seeing the result has no discriminating power between competing interpretations.

**Proposed textual exercise:** establish a small codebook on one passage and examine a separate passage with it, preserving disagreements. This tests the stated interpretive procedure. It does not establish the truth or falsity of religious belief, predict an event, derive a physical constant or measure a physiological effect. Theology, chymistry and Hermetic copying remain distinct documentary categories even when a historical author engaged with all of them.

## What the concept network may connect

| Connection | Warranted relation | Missing premise for a stronger claim |
| --- | --- | --- |
| Newton’s geometry → inverse-model lab | Modern methodological adaptation | Measurement model, assumptions, identifiability and error bounds |
| Optical divisions ↔ musical proportions | Explicit historical analogy | A unique physical cross-modal conversion or outcome mechanism |
| Notebook failure → uncertainty log | Modern adaptation of a documented practice | Complete measurements and a discriminating causal test |
| Hermetic correspondence → model mapping | A modern question inspired by a historical text | Defined map, domain, dynamics and controlled defect |
| Newton → Tesla | Comparative subject grouping in this lab | A specific historical transmission source, not similarity alone |
| Shared oscillation equation → shared biological effect | No such implication follows | Actual coupling, exposure, biological measurements and outcome evidence |

The closing [analysis/synthesis discussion in *Opticks* III, Query 31, pp. 380–382](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00051), itself treats induction as revisable and leaves hints for further examination. That is compatible with keeping a hypothesis notebook open. It does not authorize promoting a hypothesis whenever a simulation produces an attractive pattern.

## Review boundaries and next useful evidence

This pass did not audit the entire *Principia*, all optical correspondence, the complete chymical notebooks, Latin Hermetic commentary or Newton’s full theology. It did not reproduce a historical experiment, translate every uncertain mathematical glyph, prove a Newton–Tesla lineage or validate an occult mechanism. Those are separate tasks with their own source requirements.

The six `experimentIdea` entries are proposed bounded software or textual exercises. They are not records of completed experiments. Their useful outputs would be a counterexample, a measured numerical error, an explicitly missing parameter or a documented interpretive disagreement. None supplies a medical preset, hazardous laboratory recipe or electromagnetic treatment instruction.

Further work should resolve a concrete missing bridge: compare a manuscript image where a formula is ambiguous; test a stated model on observations not used to choose it; locate a dated transmission source; or obtain an independent observable that distinguishes parameter sets. More analogy alone cannot remove the ambiguity.


---

## Appendix B: Tesla patent audit

# Tesla primary-record audit

Checked 2026-10-16. Nine selected records: six U.S. patent grants, one contemporary lecture, one contemporary letter by another author and one retrospective autobiographical article. This is a source audit and a set of proposed digital investigations, not exhaustive reading of Tesla, a count of inventions, or certification of historical performance. The corresponding data is `src/newton-tesla/tesla.ts`.

Patent text and original drawing scans were retrieved from Google Patents, a host of primary patent records. Its automated classifications, legal-status estimates and chemical/biological keyword annotations were not used as evidence. OCR has damaged words and some claim boundaries; the specific passages below identify the checked scope. Original drawing sheets were downloaded from the linked patent PDFs and inspected at readable resolution. The descriptions sometimes incorporate claims in the same extracted text.

Dates marked as grants are not invention dates or demonstrations. National equivalents and related applications must be grouped before anyone counts invention families. This audit neither establishes complete family membership nor treats each national filing as a separate invention. Earlier repository research was a discovery aid; the linked texts were checked again.

## Patent record scope

| U.S. grant | Application date in record | Grant date | Checked passages and drawings |
| --- | --- | --- | --- |
| [381968, Electro-magnetic motor](https://patents.google.com/patent/US381968A/en) | 1887-10-12 | 1888-05-01 | Description of phase sequence and Figs. 1–9; claims 1–3; original drawing sheet 1 |
| [454622, System of electric lighting](https://patents.google.com/patent/US454622A/en) | 1891-04-25 | 1891-06-23 | Supply, condenser, coupled-coil and lamp descriptions; claims 1–6; original drawing sheet |
| [645576, System of transmission of electrical energy](https://patents.google.com/patent/US645576A/en) | 1897-09-02 | 1900-03-20 | Conductive-atmosphere hypothesis, source/receiver and loss discussion; claims 1–4 and 6–9; original drawing |
| [685957, Apparatus for the utilization of radiant energy](https://patents.google.com/patent/US685957A/en) | 1901-03-21 | 1901-11-05 | External radiation, charge collection, slow charging and discharge/load descriptions; claims 2–6; Figs. 1–4 |
| [613809, Control of moving vessels or vehicles](https://patents.google.com/patent/US613809A/en) | 1898-07-01 | 1898-11-08 | Command reception, selectivity, onboard storage batteries and motor passages; claims 2–4 and 12–13; original drawing sheet 1 |
| [514169, Reciprocating engine](https://patents.google.com/patent/US514169A/en) | 1893-08-19 | 1894-02-06 | Restoring-force premise, pressure input, thermal losses, load examples and limits; claims 1–5; original sectional drawing |

The following equations are modern explanatory reconstructions. They are not quotations, patent claims or evidence that Tesla used this notation. Proposed outcomes are predictions of the stated models; no new physical measurement is reported here.

## Phase motor: US381968

The claimed combination links separate generator circuits to corresponding motor circuits to move the resultant magnetic direction. Its energy source is the generator, and useful output is shaft work. The patent discusses lamination and other practical arrangements; the field plot alone omits rotor dynamics, heat, core loss and friction.

For an ideal local two-component field,

\[
B_x=B_0\cos(\omega t),\qquad B_y=B_0\sin(\omega t),\qquad |B|=B_0.
\]

This explains the rotating direction. Equal-frequency components in phase trace a line; reversing one component reverses the rotation. Unequal amplitudes generally produce an ellipse. These are useful digital controls. A complete torque/efficiency prediction needs the rotor and load model; no efficiency number is inferred from the grant. The patent describes multiple arrangements, so this reconstruction is not a replica of every motor in it.

## Lighting converter: US454622

The generator, condenser, coupled coils and luminous load are visible in the drawing and described in the text. The source replenishes stored energy. Inductive and capacitive coupling convey it; the description also discusses dissipation and material deterioration. A brighter light or higher voltage is not itself an input/output energy measurement.

A digital coupled-circuit model can include mutual inductance \(M=k\sqrt{L_1L_2}\), with \(|k|<1\) for a nondegenerate passive inductance matrix. Magnetic storage includes the mutual term \(Mi_1i_2\). Ignoring that term while assessing energy can create a false apparent surplus. The model must also include the load and losses. The control is zero coupling with an initially unenergized receiver. This abstraction excludes discharge physics and physical apparatus instructions.

## Empirical tuning: the 1892 London lecture

[Tesla’s lecture transcription](https://www.gutenberg.org/files/13476/13476-h/13476-h.htm) was checked around the coil description, adjustment of capacitance/self-induction, discussion of conductor length, and gaseous/dielectric losses. Tesla reports empirical adjustment and explicitly says a proposed loss relation needs experimental confirmation. The full lecture and every demonstration were not audited. Historical statements that demonstrations were harmless are not adopted as present-day guidance.

For a linear series RLC teaching model with capacitor charge \(q\),

\[
L\ddot q+R\dot q+q/C=V(t),\qquad
E=\tfrac12 L\dot q^2+q^2/(2C),\qquad
\dot E=V\dot q-R\dot q^2.
\]

The ideal undamped angular frequency is \(1/\sqrt{LC}\); underdamped free oscillation has \(\omega_d^2=1/(LC)-R^2/(4L^2)\). A driven maximum also depends on the observed quantity. Proposed controls compare detuning, added resistance and drive-off decay. None identifies an acoustic treatment frequency or validates a historical nonlinear apparatus.

## Long-distance proposal: US645576

The patent explicitly includes generator G, transmitting and receiving transformers, elevated terminals, earth connections, lamps and motors. Its consequential assumption is a conducting atmospheric route capable of useful distant delivery. The document's broad performance assertions are the inventor’s claims; this audit supplies no independent efficiency measurement.

For any proposed transfer experiment, account for source work, initial/final field storage, ground and atmospheric losses, and receiver load work. Matched frequencies with negligible coupling do not deliver useful power. An unloaded receiving voltage also does not establish load power. A virtual coupled-oscillator example can teach these distinctions but cannot replace an Earth/atmosphere propagation calculation. This patent is not a derivation of modern Earth–ionosphere modes or evidence for a universal beneficial frequency.

## Collection is not source-free: US685957

The external radiation source, exposed conductor, condenser, return connection, controller and receiving circuit are explicit. One variant also uses a local auxiliary supply. Tesla proposes a historical particle explanation and reports slow accumulation; neither a modern microscopic theory nor a measured useful-power specification is supplied by this audit.

An abstract charge budget is

\[
C\dot V=I_{\mathrm{external}}-V/R_{\mathrm{leak}}-I_{\mathrm{load}},\qquad E_C=CV^2/2.
\]

The driving current is an assumed model input, not a value predicted from the patent. Removing input after discharge leaves no sustained passive output. Any auxiliary supply belongs in the complete budget. The educational experiment varies virtual input, leakage and load only; it does not call for radiation sources, exposed conductors or a physical build.

## Command versus propulsion: US613809

The propulsion paragraph explicitly identifies motor D and storage batteries E. The control mechanism uses received disturbances and local circuits. Those separate functions prevent an incorrect inference that the control signal supplies all propulsion energy. Selectivity and interference are discussed, but the patent is not a modern error-rate or range certification.

The proposed digital counterpart is a simple boat state machine with separate communication and battery variables. Missing commands and depleted energy produce different failures. The prediction is checked by independently removing each resource. Only benign navigation/control logic is retained; no military adaptation or physical radio construction is provided.

## Mechanical oscillator: US514169

The source is pressurized fluid, the working element is a piston and the restoring element is elastic. The constant-period argument explicitly assumes restoring force proportional to displacement within limits. The text also recognizes heat from imperfect elasticity and proposes recovering some of it; that is not a measured efficiency figure.

The local linear model \(m\ddot x+b\dot x+kx=F_{\mathrm{drive}}-F_{\mathrm{load}}\) has undamped frequency \(\sqrt{k/m}\). It requires input work to replace dissipation and extracted work. Adding a cubic restoring term provides an amplitude-dependent counterexample to unrestricted constant-period claims. The digital comparison involves no pressurized machinery or structural excitation. The source is not proof of popular destructive-oscillator stories.

## Vedanta correspondence: 13 February 1896

The [complete published letter from Vivekananda to E. T. Sturdy](https://www.ramakrishnavivekananda.info/vivekananda/volume_5/epistles_first_series/057_blessed_and_beloved.htm) was read. The edition labels it LVII; date and recipient are more stable locators than numbering across sites. It reports Tesla’s interest in prana, akasha and kalpas, and an anticipated mathematical demonstration. It does not contain the promised proof. The autograph manuscript was not inspected.

This establishes a contemporary report of philosophical conversation. It does not establish equivalence between Vedantic terms and measured physical variables, a completed mass–energy derivation, paranormal ability, or occult organizational membership. Vedanta retains its own religious/philosophical context. A testable modern translation must define observables, dimensions, dynamics and a result that could contradict it; otherwise it remains historical interpretation.

## Retrospective imagination and 3–6–9 provenance

The public [My Inventions I transcription](https://teslauniverse.com/nikola-tesla/articles/my-inventions-i-my-early-life) identifies the February 1919 *Electrical Experimenter*, pages 696–697 and 743–747. The text, including visualization and repeated acts divisible by three, was read. The original magazine download was member-gated, so this is a transcription-based review rather than manuscript/facsimile authentication. Editorial praise is distinct from Tesla’s first-person account.

His retrospective claims about mentally running machines are not independently measured cognitive performance. They can inspire writing predictions before testing a model, then recording mismatches. The selected account supplies no physical 3–6–9 law. In base \(b\), digit sums preserve value modulo \(b-1\); decimal patterns therefore change with the notation. That arithmetic does not identify a physical resonance. No authenticated primary derivation of the popular cosmological claim was found in this bounded survey; this is not a claim to have searched every surviving document.

## Boundaries and next evidence

These records can motivate mathematical analogies between phase, resonance and energy accounting. They do not establish Newtonian alchemy as a cause of Tesla’s inventions, an equivalence between electric fields and listening audio, or therapeutic effects. Patent claims, observations reported by an inventor, other people’s letters, retrospective memories and new model predictions stay separate in the data.

All recreation ideas are conceptual or digital. There are no mains, high-voltage, radio-transmitter, body-contact, radiation-source, pressure-system or structural-test instructions. No paid text, commercial audio or membership content was copied. A broader investigation would require complete patent-family review, authenticated correspondence, notebook comparisons, measured device data and independent replication; those are recorded as future work rather than implied accomplishments.


---

## Appendix C: mathematical models

# Newton–Tesla laboratory: model definitions

These are modern textbook teaching models grouped under the historical research laboratory. The grouping does not attribute every equation to Newton or Tesla. Code lives in `src/newton-tesla/models.ts`; tests live beside it. All plots and CSV files use deterministic arithmetic. No simulation controls hardware or predicts biological response.

## Orthogonal field geometry

The abstract field components are `Bx = cos θ` and `By = a cos(θ−φ)`, where `a` is an amplitude ratio and `φ` is phase. For `a=1` and `φ=90°`, the vector traces a unit circle as θ increases. Unequal amplitudes or other nonsingular phases give an ellipse. At zero/180° phase, or zero second-axis amplitude, the path is a line. The sign of `sin φ` sets the rotation direction in the Cartesian plot.

The quadrature construction is a deliberately reduced illustration of the two-phase treatment in [MIT Electromechanical Dynamics, Chapter 4, §4.1.3–4.1.4](https://ocw.mit.edu/courses/res-6-003-electromechanical-dynamics-spring-2009/30dd72688208782bff485372c57bd3c3_chap04_emd.pdf), particularly equations 4.1.24–27 and 4.1.32–33. It is not a finite-element field solution or motor model. The component axes are dimensionless: no tesla, ampere, coil geometry, torque or exposure is calculated.

The summary computes exact minimum and maximum vector magnitude from the singular values of `M = [[1,0],[a cos φ,a sin φ]]`. Let `s=1+a²` and `d=a² sin²φ`; the larger squared radius is `(s+sqrt(s²−4d))/2`, and the smaller is `d/larger`. The latter form avoids subtractive cancellation near a line. Geometry classification uses a small numerical tolerance at exact degeneracies. These implementation checks follow directly from linear algebra, independently of any historical interpretation.

## Passive series RLC

The circuit contains one ideal resistor, inductor and capacitor in series, driven by the specified sinusoidal voltage source. All displayed voltage/current magnitudes use RMS convention. Inputs convert from millihenries to henries (`×10⁻³`) and nanofarads to farads (`×10⁻⁹`) before calculation.

With `ω=2πf`, the reactances are `XL=ωL`, `XC=1/(ωC)`, and the impedance is `Z=R+j(XL−XC)`. Hence

`Irms = Vrms / sqrt(R²+(XL−XC)²)`.

The plotted current phase relative to source voltage is `−atan2(XL−XC,R)`: positive means leading, negative means lagging. Mean supplied power is `Vrms Irms cos(arg Z)`, equal to resistor dissipation `Irms² R`. Reactive power is `Irms²(XL−XC)` in var; apparent power is `Vrms Irms` in VA. Ideal L and C exchange stored energy with the source and consume no mean real power. Resonant voltage magnification does not create energy.

These relations follow [MIT 6.071/22.071, Frequency response: resonance, bandwidth and Q](https://ocw.mit.edu/courses/6-071j-introduction-to-electronics-signals-and-measurement-spring-2006/5bcec4bfba5f2e99754b77509e9e7ab4_resonance_qfactr.pdf), with conversion from peak to RMS convention where appropriate. The circuit is passive; losses beyond R, transient startup, saturation, parasitic effects and component ratings are outside the model.

### Three different frequency statements

The ideal series current reaches its maximum at `f0=1/(2πsqrt(LC))`, where `XL=XC` and `I=V/R`. The quality factor is `Q=ω0L/R`. These current-resonance definitions agree with [OpenStax University Physics Volume 2, §15.5](https://openstax.org/books/university-physics-volume-2/pages/15-5-resonance-in-an-ac-circuit). The plot normalizes current by `V/R`, rather than by an arbitrary sampled maximum.

The capacitor-voltage maximum is a different observable. Put `r=f/f0`. Directly dividing the capacitor impedance by total impedance gives

`|VC/V| = 1/sqrt((1−r²)²+(r/Q)²)`.

Differentiating its denominator gives a positive-frequency maximum at `r=sqrt(1−1/(2Q²))` only when `Q>1/sqrt(2)`. The model reports the resulting frequency; otherwise it returns `null` to indicate no positive-frequency capacitor-voltage maximum. This is an analytical derivation from the stated circuit, not an independent experimental finding. It may lie outside the plot interval. At current resonance the separate L/C voltage magnitudes equal `Q V`; their phases oppose each other.

Neither frequency should be confused with the damped natural frequency of an unforced transient. That transient is not simulated here.

The numerical teaching domain is L=1–100 mH, C=100–10000 nF, R=100–2000 Ω, f=20–20000 Hz, and source=0.1–1 Vrms. These are calculation bounds, not instructions for constructing a device or a real-component safety assessment. The sweep covers `max(20,0.1f0)` through `min(20000,3f0)` Hz, with split logarithmic spacing and an explicit sample at `f0`.

## Refraction and critical angle

This model uses Snell's law, `n1 sin θ1 = n2 sin θ2`, with all angles measured from the surface normal. The supplied refractive indices are dimensionless parameters. It assumes homogeneous isotropic media and one flat interface. It does not assign a material, model dispersion, compute Fresnel power fractions or map colors to audible tones.

For `n1>n2`, the critical angle is `asin(n2/n1)`. At exactly that angle the geometric transmitted ray is grazing (`θ2=90°`). Above it the model reports total internal reflection and `transmittedDeg=null`, rather than taking an inverse sine outside its domain. Below critical incidence, or when entering a higher-index medium, it returns the refracted angle. The reflected ray has the incident angle. An evanescent field can exist under total internal reflection, but this ray model does not calculate it.

The source is [OpenStax University Physics Volume 3, §1.4](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection). The model permits supplied indices 1–2.5 and incident angles 0–89.9°. It is a modern optics demonstration, not a claim that Snell's law originated with Newton.

## Validation and exports

Every input is checked before allocating arrays; malformed objects, missing/nonnumeric/nonfinite values and domain violations throw clear errors. Every plot contains at most 600 rows. RLC needs at least three to retain both endpoints and resonance; field/refraction sweeps need at least two. All functions return reproducible data without random numbers.

Each CSV includes version, model identity, assumptions, complete inputs and named units. RLC also records the selected operating point, including mean power balance and the distinct capacitor maximum. Empty optical transmission cells mean no propagating transmitted ray, with a separate 0/1 TIR column; no NaN is exported. Metadata lines begin with `#`.

Tests check circle/ellipse/line geometry, rotation reversal, analytic magnitude bounds, unit conversions, current resonance, source/resistor power equality, the power triangle, phase signs, voltage/current peak distinction, source scaling, bounded sweep frequencies, Snell's law, reversibility, the critical-angle boundary, invalid inputs, allocation limits and CSV reproducibility. Sources were accessed on 2026-10-16; the code and explanatory diagrams are original calculations rather than copied source illustrations.


---

## Appendix D: listening comparisons

# Original audio companions for the Newton–Tesla page

These four listening recipes are authored for this app. Newton and Tesla did not compose them, specify their digital gains, or validate listening benefits. Historical sources supply context for thinking about periodicity and tuning; the audio is a limited acoustic illustration. All four entries are grade D, in the Experimental tier.

`NEWTON_TESLA_PRESETS` is exported from `src/data/newtonTeslaPresets.ts`. Registration and preview regeneration are separate integration steps. The shared engine, live audio graph and historical presets are unchanged by this file.

| ID | Audible content | Duration | Comparison |
|---|---|---:|---|
| `nt-phase-drift` | Left 240 Hz, right 240.5 Hz | 5 min | Slow change in relative phase |
| `nt-detuning-3` | Left 240 Hz, right 243 Hz | 5 min | Same carrier and gain, greater detuning |
| `nt-ratio-steps` | 320 → 384 → 512 → 256 Hz, both ears | 6 min | Ratios 5:4 → 3:2 → 2:1 → 1:1 against a chosen root |
| `nt-tempered-steps` | Approximately 322.54 → 383.57 → 512 → 256 Hz, both ears | 6 min | Equal-tempered semitones 4 → 7 → 12 → 0 against the same root |

Every phase and saved mixer has a −28 dBFS ceiling. Each recipe fully specifies a clean sine mixer: noise off, nature off, bowls empty, interval bell off. Loading therefore replaces unrelated layers from an earlier session. Automatic stop and the authored time limit are enabled. Digital gain is not a measured sound-pressure level at the ear; the existing governor and device-volume controls still apply.

## What phase drift means here

For two channel signals with frequencies \(f_L\) and \(f_R\), their relative phase evolves as

\[
\Delta\phi(t)=\Delta\phi(0)+2\pi(f_R-f_L)t.
\]

With a 0.5 Hz difference, that phase advances one full turn every two seconds. With a 3 Hz difference, it advances three turns per second. The initial offset is not an authored preset control. These examples therefore demonstrate **phase drift from detuning**, not a fixed phase difference, a rotating magnetic field, or a specific perceived moving sound.

The two frequencies remain separate in stereo headphones. Neither channel contains a standalone 0.5 Hz or 3 Hz pressure-wave tone. Acoustic summation through speakers is a different listening arrangement. There is no EEG input and no measured brain-state outcome.

[OpenStax, Mathematics of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves) supplies the wave-phase notation; [OpenStax, Beats](https://openstax.org/books/university-physics-volume-1/pages/17-6-beats) supplies the frequency-difference context. [Tesla’s US381968A patent](https://patents.google.com/patent/US381968A/en) is a historical electrical source involving phased currents and a motor. Sharing a phase concept does not make the headphone signals an implementation of that device.

## What the tuning comparison means

The reference \(f_0=256\) Hz is a design choice. One sequence uses \(f=f_0r\) with ratios \(r=5/4,3/2,2,1\). The other uses \(f=f_0 2^{n/12}\) with semitone offsets \(n=4,7,12,0\). Both keep duration, sequence order, waveform and gain fixed. The first two tones differ between systems; octave and root agree.

The sequences begin with the third above the root so their short previews are distinguishable. The root is played last. These are successive pitches, not simultaneous harmonic spectra. No numerical result is presented as a body frequency or a resonance measurement. A resonance experiment would additionally require a specified driven system and an observed response.

[Newton’s *Opticks* (1704), Book I, Part II, Proposition VI, pp. 114–117](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034), apportions a color circle using musical intervals and constructs a weighted center for a mixture. That documented analogy motivates examining proportions; it is not a derivation of our four tones, an equal-temperament prescription, or a physical equivalence between light and sound. Newton also reports that the two-color mixture expected at the circle’s center did not give him perfect white: his own observation limits the diagram’s predictive reach. We use the Newton Project’s normalized transcription of the 1704 text.

[CMU’s Steps and Pitch](https://www.cs.cmu.edu/~15322/book/ch04/01.html) documents the modern equal-temperament formula. [Tesla’s 1892 lecture](https://www.gutenberg.org/files/13476/13476-h/13476-h.htm), in the discussion following the induction-coil description, considers how capacitance and self-inductance affect current and how small adjustments can change electrical behavior. This is a useful example of tuning tied to an identified physical system and measurable response. It does not justify an absolute healing pitch or convert this musical interval exercise into an electrical-circuit simulation. The original compositions do not rely on invented quotations or historical attribution of the 256 Hz root.

## Playback and verification boundaries

All phases use the existing binaural implementation; with a zero frequency difference, this yields identical steady sine tones in both channels. This avoids the existing nonzero-rate monaural distinction between live two-tone playback and offline sine AM. Live and offline gain paths and sequence transitions are still not promised to be sample-identical. The stored 15-second ramp value is metadata; it does not override those transition rules.

Tests check recipe bounds, complete mixer replacement, original/Experimental labeling, exact channel frequencies using two-second spectral projections, no extra low-frequency tone, matched controls, tuning arithmetic, deterministic finite output and four distinct short previews. The renderer tests use short buffers rather than allocating full sessions. Listening preference and health effects have not been measured.

At two seconds of 48 kHz stereo PCM16, each generated WAV would add 384,044 bytes including its header. Four add 1,536,176 bytes. This calculation is a planning estimate, not proof of the final preview-directory size; the integration renderer must check its manifest and its existing 60 MB limit.
