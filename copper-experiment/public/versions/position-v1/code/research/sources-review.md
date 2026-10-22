# Copper sphere position spectroscopy: source review

Research cut-off: **21 October 2026** (America/New_York client date). Source review by the `position_sources` model-agent. This is a selected primary-source review, not an exhaustive literature search or human peer review. `evidence.json` is the UI-ready record: 19 sources, 10 topic nodes and 27 typed edges.

## What the sources change about the design

The defensible target is **the same object's measured modal response at two controlled positions**, within named sensor channels and bandwidths. RUS already measures material-dependent elastic modes, and spatial modal response changes with source and receiver positions. A point on the table therefore needs a specified local acceleration/displacement spectrum or a transfer function, not a purported single intrinsic point frequency.

The strongest material-specific precedent is Reese et al., IEEE TUFFC (2008), which reports noncontact laser RUS on high-purity polycrystalline copper. It measured 40 of the first 50 modes. This directly supports an optical modal-measurement approach while illustrating incomplete mode visibility. Its reported agreement is not an accuracy guarantee for our proposed apparatus.

Tian, Ogi and Hirao, JAP (2004), explicitly models an elastic sphere with contacts and compares measured resonance shifts. This means support stiffness, contact area and preload must be tracked before interpreting A/B differences. A low-friction translation platform addresses motion along the table; it does not automatically make the sphere's elastic boundary traction-free. A stationary acquisition after settling avoids confusing translational motion, changing optical speckle and friction transients with internal modes.

Pastor-Cintas et al., Measurement (2024), measures temperature-dependent modes and optical-path limitations. Log sphere/support temperature and preserve sensor angle and optical path. The paper's polymer coefficients must not be copied to copper. Li et al., Applied Optics (2025), demonstrates simultaneous multipoint phase-sensitive LDV, which is useful for mode shapes; its 25 kHz upper band is an explicit limitation, not a promise to capture high-frequency copper modes.

Practical inference should use the same force/response convention at A and B. SciPy `csd(force, response)` uses conjugate(force FFT) × response FFT; `H1 = Pxy/Pxx` therefore retains the intended phase. Record phase, coherence, mode shape and repeated estimates, not merely the largest spectral bin. A coherence close to one is not by itself a causal test.

## Recent AI releases and leading conferences

The requested OpenAI release is identifiable: **Sharing AI progress in mathematics**, 6 October 2026, updated 15 October. Official repository `openai/math` was checked at commit `1581d4cbdd69a0faf34b2089614fe2a814316a6a`, dated 12 October. The README at that snapshot describes 719 manuscripts in 372 families and varying verification states. This review did not audit all manuscripts.

Family **372, Global Uniqueness for the Smooth Isotropic Elasticity Inverse Problem**, is specifically relevant to inverse identifiability. The authors report uniqueness from the **full static boundary displacement-to-traction map** for smooth isotropic Lamé moduli under positivity assumptions. Their scope note explicitly does not supply a reconstruction algorithm. A finite-band pair of spectra is not that data object. The mathematical proof and Lean build were not checked in this task, and the claim is not a premise for the calculator.

No comparable single Anthropic bulk mathematics release was established by this targeted search. The page instead includes specific official recent work: September 4 FLT formalization and October 16 quantum-circuit design (arXiv submission October 15). Dependency graphs, independent statement checking and executable evaluators inform this project's method. Neither provides copper measurements or a physical location law.

Two accepted leading-ML-conference sources are included with their actual venues:

- **PI-DION, ICLR 2025 main conference**: a PDE inverse-operator method with measurement and physics residuals and problem-specific stability assumptions. The checked theory examples are not a theorem about finite copper spectra. It is a future modeling option, not a shortcut around identifiability.
- **LNO, NeurIPS 2024 main conference**: a latent forward/inverse PDE surrogate that can evaluate at requested spatial points. A copper application would require a validated forward simulator and held-out geometry/support/temperature tests.

Direct experimental papers in specialist journals are prioritized over less relevant conference novelty. There is no universal cross-field “Tier A” label; venue, peer-review status, reading depth and limits are explicit.

## Tools and scope of verification

- **SciPy**: spectral estimation API and complex convention inspected; the production calculator should pin its numerical environment.
- **pyFRF** (`ladisk/pyFRF`, MIT): structural FRF estimators. Repository/API reviewed; not installed or benchmarked in this source task.
- **pyOMA2** (`dagghe/pyOMA2`, MIT code; JOSS paper CC BY 4.0): ambient modal analysis. Assumptions about excitation and stationarity still apply.
- **SfePy** (`sfepy/sfepy`, BSD-3-Clause): future anisotropic sphere/cradle/table finite-element model. No completed FEM run is implied.

No equipment purchase, external message, public upload or repository mutation was performed by this agent. No physical A/B experiment has been run. The page should label simulator outputs as simulations and the residual position hypothesis as unresolved.

## Access and verification notes

Direct full-text sections were inspected for RUS theory (2004), sphere contact (2004), ceramic ball conference setup (2008), climatic modal testing (2024) and PI-DION (2025). The copper-specific source was read through its institutional abstract. The 2025 multibeam LDV source was read through publisher abstract/history/data availability. The September 2026 plate-FRF preprint is retained as a recent lead with search-indexed abstract only because direct retrieval failed. Its dataset was not replayed.

OpenReview browser challenges and some raw-GitHub fetch failures were recorded through the narrower reading-depth fields, not silently treated as full-text reads. Official ICLR/NeurIPS proceedings replaced challenged OpenReview pages. Sources contain paraphrases and links, not republished paper PDFs.

The evidence graph's edges mean “supports a method,” “provides a control,” or “informs verification.” They do not assert that a topic has been newly discovered by this project. Established methods, reported preprints, proposed work and unresolved hypotheses have different labels.
