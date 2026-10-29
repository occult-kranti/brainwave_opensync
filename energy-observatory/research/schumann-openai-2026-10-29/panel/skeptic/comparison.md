# Comparison panel — independent skeptic

Date: 2026-10-29. Initial papers/Schumann reports were frozen before this cross-review. Skills: paired-physics research and Newton analysis–synthesis. This report compares existing packets; it does not execute a new research round, replay the upstream Yang–Mills proofs, run Lean, or fit station data.

## Decisions that change, and those that do not

| Claim | Comparison verdict | Reason and remaining obligation |
| --- | --- | --- |
| Our project solved an OpenAI theorem target | Not established | The old selected crosswalk found restricted overlaps, not theorem equivalence. The new release supplies no exact matching proof by this project. Catalogue census changes from 372 families/719 manuscripts to 373/721; maximum ID 378 is not a solved-problem count. |
| The Oct 26 announcement disproves our fixed-spacing Yang–Mills results | No contradiction identified | Upstream Round 33 concerns named SU(2) constructions on a fixed lattice at a small perturbative coupling. An announced continuum existence result is neither its negation nor its proof. The physics artifacts are withheld in the inspected announcement. |
| New Yang–Mills existence closes our continuum/mass-gap goal | Unsupported implication | Existence and a positive mass gap are separate Clay obligations. Our sufficient condition is tau=96/g^4, abs(tau)<=10^-8. A trajectory g(a)->0 leaves this condition. Neither changing units nor importing an existence headline repairs it. |
| Our E1 bound is a novel physical theorem | Already defeated by explicit prior-art containment | The Oct 22 audit maps the bound exactly to Hovhannisyan–Simon–Anders, Appendix A, Eq. A13, printed p.9. New OpenAI announcements do not reopen that verdict. |
| The current evidence demonstrates a global Schumann anomaly | Not admitted; not disproved | Dated geomagnetic series and qualitative station quick-looks exist, but no calibrated multi-day Schumann series with baseline and uncertainty was supplied. |
| A changed spectral peak necessarily means a changed cavity pole | False in the stated linear model class | Readout, source color and mode mixing can move maxima with fixed poles. The proposed controls below discriminate this implication directly. |

The old crosswalk's “not located as an exact OpenAI catalogue target” is a time-bounded Oct 21 search result. Update its current relationship through an additive Oct 26 announcement node; do not rewrite it into either an erroneous historical claim or a verified new theorem match.

## Exact remaining novelty and proof claims

**Yang–Mills.** Round 33 admits locality estimates, whole-sequence convergence for F1/F2 named constructions, specified compact-time dynamics, limit certificates, and restricted group/graph applications. Its handoff explicitly excludes uniformity in lattice spacing, uniqueness of every ground state and an area law. The roadmap is `planned_not_executed`: route-B dynamics; uniqueness beyond named constructions (O1b); finite-box certificates including the F2 N=2,3 sign; correlation rates beyond the retained N-range; and a Z2 construction chain. These remain candidates, not achievements of this comparison. Scientific priority of the existing constants/lemmas was not established by the source packet. The current OpenAI release does not supply an inspectable lemma that discharges any of those named missing premises.

**E1.** Retain mathematical correctness within the ideal pure-dephasing qubit model, exact equality cases and useful implementation assurance. Claim no new upper-bound theorem: equal mean energies plus trace distance |c|(1-d) give the bound from prior A13. The exact qubit ergotropy formula and saturation mechanism also have prior sources. Priority of the complete endpoint/exposition/calculator package remains unestablished. A distinct constrained-control or uncertainty-certified question would require a new contract and prior-art comparison. This is a possible direction, not a novelty claim.

**Schumann work.** Damped-oscillator peaks, the energy balance and unknown-input inverse ambiguity are established modeling principles. A reproducible implementation, evidence intake contract and explicit wrong-model controls can be useful project contributions, but the packet supplies no basis to call them a new physical law or first theorem. No copper location-dependent intrinsic spectrum or energy source follows.

## New-proof bridges that fail today

1. **Local smoothing to cavity inversion:** the public Euclidean half-wave estimate assumes R^n, Schwartz data, a specified time interval and Sobolev/Lp norms. The real cavity requires curved boundaries, dispersive conductivity, damping, source statistics and a calibrated observation operator. A forward bound alone would still not imply inverse uniqueness. A shared word such as wave, energy or quaternion supplies no bridge.
2. **ETH to practical research speed:** fixed-k canonical CNF, encoded input length and an asymptotic counting bound are not a benchmark for continuous inverse PDEs. A correct finite encoding, size/rate preservation, implementation and measured costs are missing. The formalized documented exponent has an extra log-log factor relative to the manuscript's sharper claim. Preserve that distinction.
3. **Public formalization to local verification:** the Comparator challenge placeholders are targets, not submitted proof failures. Conversely reading solution wrappers is not compiling their dependency closure. All reviewers report zero local Lean runs. Do not transfer a family badge to a stronger unselected conclusion.
4. **Geomagnetic context to Schumann causation:** Kp, local background B, solar-wind IMF, ELF E/B amplitude, mode frequency and linewidth are different observables. A verified association would require aligned, calibrated records and controls for lightning/source geometry, local interference, receiver response and temporal dependence.

## Current anomaly admission and conflicts

I read the retained NOAA/GFZ raw JSONs, dated NOAA bulletin bodies and `verification/observation-checks.json`. The verifier binds their hashes and retrieval times. Each provider has 49 completed three-hour bins from Oct 23 00:00 through Oct 29 03:00 UTC, or 17 for the Oct 27 subset. None of those retained bins reaches Kp=5; maxima are 4.33 NOAA estimated and 4.333 GFZ preliminary. October 29 is incomplete. This supports only the stated provider-specific geomagnetic summary.

There are 28 matched starts with differences exceeding 0.01 and a largest difference of 1.667. Preserve both products; averaging would conceal their distinct estimation/status. The NOAA Oct 29 forecast body has an internal conflict: its Oct 31 table/maximum predicts G1 while its rationale says no G1. Record the conflict and withhold an adjudicated forecast; October 31 is outside the retrospective window anyway. The Oct 26 weekly bulletin's Oct 21 G1 event is also outside that window.

My initial web search/open mismatch retrieved older October bodies from mutable URLs. Those are negative controls for freshness, not contrary current observations. Fresh saved bodies with explicit issue dates supersede their use for current context; the original report remains intact. Tomsk's Oct 27–29 quick-look and Nagycenk's partial Oct 29 UTC chart give availability/qualitative evidence, not a calibrated anomaly test. A visually ordinary first-mode trace cannot rule out changes elsewhere or at other times. **Neither global anomaly nor global absence is established.**

## Recommended first research round: discriminating controls

Select a bounded synthetic response audit before real-data inversion. Freeze equations, units, forcing, sensor response, band and tolerances before computing.

- **Fixed-pole peak control.** For q''+2 gamma q'+omega0^2 q=F, compare white-force displacement peak sqrt(omega0^2-2 gamma^2), when positive, with white-force velocity peak omega0. Keep omega0 and gamma identical. Add a nonconstant source spectrum and a frequency-dependent readout as separate changes; a constant scalar gain alone cannot move a single-channel PSD maximum. Falsifier: code reports all these peaks as the same quantity or claims changed poles from the different maxima. Include an overdamped/no-positive-resonant-maximum boundary case.
- **Exact inverse countermodel.** On a finite band with finite nonzero H1,H2, construct S_F2=S_F1 abs(H1/H2)^2. Compare outputs abs(H1)^2 S_F1 and abs(H2)^2 S_F2. Establish equality algebraically and use numerical residuals only as implementation checks. Falsifier for a peak-only inverse claim: two different admissible parameter sets produce the same declared observations. This is conditional non-identifiability, not evidence that actual lightning used the constructed spectrum.
- **Mode-interference control.** Preserve complex amplitudes until after summation for a common coherent source; for multiple stochastic sources specify their cross-spectral covariance. Test a relative phase or source-weight change with fixed modal poles. Squaring each mode before summing silently imposes uncorrelated sources and is a different model. Do not claim multi-mode or multi-station uniqueness without a rank/nuisance-parameter analysis.
- **Energy control.** Check E'=F q' - 2 gamma q'^2 in normalized units, adding a nonnegative load-loss term when relevant. With zero drive and an initially excited oscillator, output must come from storage depletion; positive steady output requires input. Falsifier: an accounting method credits static B^2/(2 mu0) as replenished power or omits source work. No physical power number may be assigned without normalization and measured coupling.

Recommend the first two controls as the minimal R1 core, with the energy identity as a mandatory sanity check. Choose later rounds from actual residuals and objections, not this prospective list. Current observation gaps should cause an “insufficient evidence” outcome, rather than fabrication of a frequency history.

## Reading and verification boundary

Read the other three reviewers' six frozen first reports; the raw/summary/verification observation packet; `research/math-crosswalk/report.md`; E1 novelty README, correctness and general-theorem reviews; and upstream `research/round33/HANDOFF.md` plus `research/round33/advisor/roadmap.json`. Exact external locators and reading depths remain in the frozen first-panel source ledgers. This comparison relies on those inspected primary records and the explicit local proof scopes; it does not claim an independent reproduction of their complete proofs or datasets.
