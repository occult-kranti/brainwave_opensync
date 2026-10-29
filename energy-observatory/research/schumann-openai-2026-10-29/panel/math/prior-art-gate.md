# Mathematical prior-art gate before another research cycle

Reviewer: mathematical physics. Evidence cutoff: 2026-10-29. This gate is separate from the pending final R3 implementation admission. It compares mathematical claims, rather than treating a passing implementation as a novelty certificate. Read locations, versions, and retrieval limits are recorded in [prior-art-sources.json](prior-art-sources.json). No external proof was independently reproduced or formally checked.

**Decision: NO-GO for another cycle whose novelty objective is to prove the present scalar oscillator, spectral compensation, or inverse formulas. NEEDS-EVIDENCE for a new, constrained identification problem. No narrow unsolved mathematical gap has yet been demonstrated.** The existing work has value as a reproducible calibration and counterexample suite. It does not establish new Earth physics, a Schumann anomaly, a Yang–Mills result, or energy generation.

## 1. Exact comparison with prior work

Our model, with the convention exp(iωt), is

\[
 H(\omega)=\frac{q}{F}
 =\frac{1}{m(\omega_0^2-\omega^2+2i\gamma\omega)},
 \qquad m,\omega_0,\gamma>0.
\]

Scalzo and Vaglio [I6], *Dynamic Identification*, equations (3)–(5), explicitly give compliance as displacement/force and the same rational expression with stiffness k and damping c. The dictionary is k=mω₀² and c=2mγ. This dated primary source alone is sufficient to show that our model is prior art; it is not presented as the earliest historical source.

| Project result | Closest checked prior statement or framework | Exact qualification | Novelty disposition |
|---|---|---|---|
| One complex datum gives ω₀²=ω²+Re(1/H)/m and γ=Im(1/H)/(2mω) | I6, compliance equation (4) | Known mass, positive nonzero frequency, calibrated complex force/displacement ratio, one-mode model, positive recovered parameters | Direct algebraic rearrangement of an existing equation; not a new theorem |
| Two frequencies recover a constant positive real receiver gain and oscillator parameters | I6 rational compliance; coefficient identification | Distinct frequencies; receiver gain independent of frequency and phase; known mass identifies gain, unknown mass leaves the mass/gain ratio | Elementary affine coefficient recovery; not demonstrated novel |
| Output PSD alone admits different modes with compensating source PSDs | Blind-factorization ambiguity in I2; our explicit equality below | Equality on a specified band where both transfers are nonzero; admissible forcing remains to be justified physically | Valid elementary noninjectivity example; no defensible new foundational claim or claim to first priority |
| An arbitrary receiver response can disguise a different mode, even with the same known mass | Blind-factorization framework I2 | Allowed receiver class must include the constructed ratio; stable causal alone is insufficient | Useful explicit model counterexample, not an established new theorem |
| Coherent paths have a cross term; incoherent paths add powers | I5, equations (5)–(6) and surrounding LTI assumptions | Cross-spectral matrix must be admissible; complete input coherence can make its inverse singular | Already explicit in established spectral identification theory |
| Structural uniqueness differs from robustness to noise and experimental restrictions | I1, sections 2–3 | Local/global distinction, excitation, unknown-input class and initial conditions matter | Established distinction; a numerical perturbation example is not an uncertainty theorem |
| Displacement maximum, velocity maximum and ringdown frequency differ | Same damped-oscillator model I6; project derivative calculations | Depend on observable and damping regime; a spectral maximum is not automatically a pole | Known-model verification, with useful boundary-case tests |
| Metadata fields can block unsupported anomaly claims | Project intake implementation | Declared completeness is not authenticated data quality or an anomaly test | Reproducibility safeguard; no scientific novelty claim |

The table establishes containment for the inverse and coherence claims. The blindness comparison is deliberately weaker: I2 studies discrete convolution, whereas our construction is a continuous-frequency scalar PSD identity. We do not substitute its theorem for our calculation or claim its hypotheses match Earth observations.

## 2. What the exact calculations establish

Let S₁ be continuous and strictly positive on a compact band K and H₁,H₂ continuous and nonzero there. Define

\[
 S_2=S_1\left|H_1/H_2\right|^2.
\]

Then S₂ is positive, bounded and integrable on K, and |H₂|²S₂=|H₁|²S₁ pointwise. This supplies an exact nonunique factorization within that class. It does not certify a particular lightning process, a spectrum outside K, or a physical source that realizes the compensation. Transfer zeros require separate treatment. More samples of the same exact output spectrum cannot remove this constructed ambiguity.

For complex observations Y=GH, choosing G=H₂/H₁ gives Y=H₂. For our damped oscillators this can be written in the Laplace variable as

\[
 G(s)=\frac{m_1}{m_2}
 \frac{s^2+2\gamma_1s+\omega_{01}^2}
      {s^2+2\gamma_2s+\omega_{02}^2}.
\]

With positive damping and natural frequencies this ratio is real, proper, and has stable poles and zeros. A causal stable realization with direct feedthrough therefore exists in the ordinary finite-dimensional system model. **Merely requiring the receiver to be stable and causal does not rescue uniqueness.** This is an analytic qualification of the same counterexample, not a fourth experimental round. No claim is made that the response is passive, calibrated, cheap to build, or the actual station receiver. Equal masses are allowed, so mass uncertainty is not essential to this ambiguity.

For the narrower nuisance G=g>0 constant, put Z=1/Y and A=m/g. Then

\[
 \Re Z=A(\omega_0^2-\omega^2),\qquad
 \Im Z=2A\gamma\omega.
\]

Two distinct positive frequencies determine A from the slope in ω², followed by ω₀ and γ. Known m also determines g=m/A. Thus “unknown gain makes identification impossible” is too broad; the precise admissible gain class matters. Additional independent frequencies test consistency with this model but cannot establish that the model is physically complete.

Structural uniqueness also does not promise practical precision. For complex error δH,

\[
 \delta(1/H)=-\frac{\delta H}{H(H+\delta H)}.
\]

If |δH|≤ε|H|, ε<1, the inverse error is at most ε|1/H|/(1−ε). Recovering ω₀² can still involve cancellation between ω² and Re(1/H)/m. A deterministic perturbation exercise neither estimates a noise distribution nor provides confidence coverage. Numerical range guards address an implementation domain, not the statistical identification problem.

## 3. Primary literature and current methods: what transfers

**I1 — Villaverde (2025), structural identification.** The paper distinguishes local and global identification for analytic dynamical models and shows how known input classes, multiple experiments, unknown inputs and initial conditions alter rank analysis. Sections 3.5–3.7 warn against overreading truncated rank or numerical diagnostics. This supports specifying the actual experiment before claiming identifiability. It does not make an arbitrary partially observed field globally identifiable. We inspected the relevant body and examples, not an independent proof of every rank result. [Primary article](https://link.springer.com/article/10.1007/s11538-025-01415-3).

**I2 — Choudhary and Mitra (2014), unconstrained blind convolution.** The finite, noiseless real linear-convolution model has unavoidable scaling equivalence and broader nonuniqueness. The inspected Theorem 2 has explicit even dimensions m,n≥4 and endpoint/measure assumptions. Its conclusion cannot be quoted as a theorem for all continuous spectra or every fixed oscillator family. Its relevance is the prior mathematical study of blind factorization, not a direct Schumann proof. [Primary preprint, v1](https://arxiv.org/pdf/1411.3810).

**I3 — Li, Lee and Bresler (2015), constraints that restore identification.** For circular convolution in specified known subspaces or sparse dictionaries, Theorems 3.1–3.2 provide generic identification up to scale with sample thresholds n>d for a fixed pair and n>2d for uniform pair recovery, with d defined by the constraint case. The stability statement requires its specified random dictionary model. Neither genericity nor the sample threshold transfers automatically to physical station channels. This supplies an established route—explicit restrictive priors—rather than evidence our particular application is unsolved. [Primary preprint, v2](https://arxiv.org/pdf/1507.01308).

**I4 — Liu and colleagues (2026), a current unknown-input method.** The September paper combines multirate acceleration and strain with a structural model, augmented states and damage assumptions. Its observability discussion uses a finite-window linearized matrix and necessary input-dimension conditions. Numerical beam/truss demonstrations do not prove universal recovery under arbitrary forcing and receiver uncertainty. Some equations were not exposed in the retrieved HTML, and we did not rerun its filter. Its value here is a current comparison method and a reminder that additional measurements must have genuinely different information. [Primary article](https://onlinelibrary.wiley.com/doi/10.1155/stc/6594136).

**I5 — Howes and colleagues (2025), correlated-input spectral identification.** Equations (1)–(6) cover LTI transfer estimation, cross spectra, multi-input inversion and interference. An H₁ cross-spectrum estimate equals the physical response only under the stated input/output-noise and missing-correlated-input restrictions. The multi-input inversion needs a nonsingular input spectral matrix. Those qualifications are directly relevant to any claim that a measured spectral ratio removes unknown forcing. The article appeared in February 2025; June 2026 is its repository availability date. [Author manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC11870678/).

**I6 — Scalzo and Vaglio (2025), exact compliance formula.** Their experimental modal-identification section explicitly supplies the same input/output compliance and parameterization used by our inverse. Their controlled shaker/force/acceleration setup illustrates how calibration enters the mathematical ratio. We use only that exact model identity, not a low-damping approximation equating every peak with the natural frequency. [Primary article](https://link.springer.com/article/10.1007/s11340-025-01201-1).

This is a targeted primary-source comparison, not an exhaustive priority, patent, or conference census. Three recent September/October 2026 leads could not be read in full; they are listed as unadmitted in the source ledger. They cannot support a theorem import, a claim to have surveyed all current SOTA, or a claim that a proposed gap remains unsolved. Historical Bellman–Åström and profile-likelihood leads likewise are not used for detailed conclusions without their full text.

## 4. Conditions for a defensible next problem

A possible next problem is to identify, or bound, a modal change under **specified** source and receiver uncertainty using independent calibrated observables. This is a problem formulation to investigate, not an assertion of novelty. Before authorizing a novelty-driven three-round cycle, require:

1. A concrete forward model and target quantity: a pole change, damping change, or a precisely defined spectral statistic. Do not interchange them.
2. A declared nuisance class: calibrated receiver bounds, allowed phase variation, source covariance constraints, missingness and noise model. Check that the constructed H₂/H₁ receiver and compensating PSD are actually excluded by justified evidence.
3. An independent observable or intervention. More frequency bins or q and its numerical derivative do not by themselves resolve the factorization. Multiple stations need a joint source/geometry/receiver model, not only different station names.
4. A closest-method comparison against standard modal/FRF identification and applicable constrained or unknown-input methods. If proposing a theorem, state a strict improvement in assumptions, conclusion, or bounds; if proposing an application, identify a previously untested data/model regime.
5. Data adequate for that claim. Current quicklooks and geomagnetic indices do not supply calibrated Schumann time series, uncertainty, a matched baseline and an anomaly decision rule. Metadata acceptance alone cannot fill this gap.
6. A falsifiable success criterion fixed before computation: e.g. a uniform bound under a stated nuisance set, or calibrated uncertainty coverage and false-alarm performance on held-out data. Finite benchmark success must remain distinct from proof.

The existing verified synthetic identities can serve as negative and calibration controls for such a study. They do not require another three rounds to become novel. Until the evidence and closest-literature gap are established, retain the roadmap status **needs evidence and precise problem definition**, with no new theorem, Earth anomaly, or energy claim.
