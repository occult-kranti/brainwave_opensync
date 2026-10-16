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
