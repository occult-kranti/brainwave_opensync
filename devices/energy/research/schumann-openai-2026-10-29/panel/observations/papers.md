# Papers panel — observational metrology

Date: 2026-10-29. Reviewer: `oct_observations`. Skills: resonance-research-advisor and tesla-mechanism-resonance, including Earth modes and loading. Independent first handoff; other current panel reports were not read. No Lean execution or full-proof certification is claimed.

## Release reading and actual scope

The [official October 26 announcement](https://openai.com/index/building-scientific-understanding-with-academic-communities/) was read in full through its scientific sections. It distinguishes public local-smoothing and ETH artifacts from physics artifacts whose release is deferred to an external collaboration. It announces pure Yang–Mills existence as a subproblem of a broader QFT construction. This is not an announced positive mass-gap theorem. The physics proof cannot be imported from an announcement alone.

Pinned OpenAI repository: `7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a`, commit dated 2026-10-26T21:18:03Z. Read the main statements, not complete proofs:

- [Local smoothing introduction](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/preprints/Local-smoothing-for-the-Euclidean-wave-equation-October-25-2026/build/sections/introduction.tex): `thm:local-smoothing` treats the Euclidean half-wave propagator on R^n, n>=2, over [1,2], with L^p/Sobolev norms, 2<=p<infinity and an arbitrarily small positive regularity loss (except p=2). `thm:main` is a frequency-annulus estimate at the critical exponent. The stated result concerns propagation and focusing, not the inversion of a noisy instrument spectrum.
- [ETH manuscript](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/build/main_full_version.tex): abstract, introduction and `thm:main` claim a deterministic fixed-k CNF exact-counting algorithm, n>=20, with subexponential bit complexity and polynomial space. The introduction explicitly cautions that arbitrary polynomial-time reductions do not preserve the relevant subexponential bound. No implemented solver was benchmarked here.

## Measurement transfer verdict

Local smoothing does not directly identify a Schumann eigenfrequency. The Earth–ionosphere problem has a curved, lossy, dispersive boundary, stochastic lightning forcing and a calibrated local sensor. A station's time-frequency display lacks the complete spatial initial field and Euclidean free-wave premises in that theorem. Even a verified forward norm estimate would not establish inverse uniqueness or fix an unknown source spectrum. It may motivate a future, separately proved forward-control estimate after a valid model reduction; that bridge is missing today.

The ETH result could become relevant if a concrete finite inference problem is encoded as fixed-width CNF with controlled encoding size and preserved answer semantics. Continuous conductivity and sensor calibration inference are not automatically such a problem. Smaller asymptotic exponents do not certify practical speedup, experimental accuracy or new physical laws. No statement in our existing experimental plans is disproved merely because an algorithmic complexity conjecture changes.

The useful immediate transfer is procedural: pin theorem statements, record hypotheses and separate released artifacts from advertised claims. For the proposed research rounds, independently verify simple response/energy identities and measurement non-identifiability first. Do not present a synthetic damped oscillator as an implementation of the new local-smoothing proof, or a small brute-force enumeration as a reproduction of the new ETH algorithm.

## Questions for comparison panel

1. Which actual project claim requires a continuum QFT existence theorem, and where are its gauge group, topology and physical normalization specified?
2. Can our station model distinguish cavity parameters from lightning-source and sensor-transfer changes using the available channels?
3. What calibrated raw record, baseline and uncertainty would turn a recent-event allegation into an accepted observation?

These are review questions, not completed follow-up research rounds.
