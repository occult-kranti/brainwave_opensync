# Round 1 — independent verification plan

Date: 2026-10-29. Worker: `/root/contact_verifier`, a separate model-agent, not a human scientist. Status: planning only; no later-round code or physical observations have been generated. The implementation worker's proposal and output were not read before this plan was written.

## Incoming constraints and admission

Read the Energy Observatory `AGENTS.md`, the resonance-research-advisor skill and measurement contract, and the complete previous `schumann-openai-2026-10-29/prior-art-gate.md`. That gate excludes rediscovery claims for the oscillator inverse, spectral compensation, and ordinary source/cavity confounding. It leaves recent Schumann anomalies unresolved for lack of a calibrated paired data packet. This plan does not change those decisions.

Admit a bounded **method/engineering benchmark**, conditional on an advisor-frozen contract. Do not admit a new coupling, a successful contact event, an extraterrestrial source, or a novel theorem. A six-round workflow can improve a protocol without providing six independent scientific confirmations.

## Four distinct claim gates

| Claim | Required observation | Decisive check | Insufficient substitute |
| --- | --- | --- | --- |
| Frequencies overlap | A named spectrum with channel, units, time window and uncertainty | Recompute each estimator in its own channel; distinguish angular and cyclic frequency, carrier and envelope | Shared number such as 7.83, a Focus label, symbolic correspondence |
| Physical coupling | Independently calibrated input and output plus a dimensioned transfer law | Predict held-out amplitude, phase, geometry and frequency response; drive-off/dummy/independent-readout controls | Spectrum resemblance or post-hoc peak alignment |
| Statistical association | Paired timestamped measurements and predeclared outcomes | Valid null, nuisance controls, complete analysis-family correction, untouched evaluation data | A selected spectrogram, selected lag, or an uncorrected small p-value |
| External/ET agency | Information or physical observations that discriminate specified alternatives | Blinded target generation, sealed responses, leakage audit and independently repeated predictions | An association, subjective intensity, unexplained residual, or rejected ordinary null |

The last row is a separate identification problem. Even a technically correct association test does not select an extraterrestrial explanation from all remaining causes.

## Candidate independent numerical checks, to freeze before execution

1. **Channel and dimension audit.** If a coil/loop induction illustration is selected, independently derive sinusoidal flux and induced emf from its stated area, orientation, turns, field-amplitude convention and frequency. Check DC, zero area, zero field, reversed orientation and linear scaling. A toy loop calculation describes that detector; it supplies no physiological threshold, human transfer function, or global energy budget. Missing source/target coupling parameters remain null rather than inferred from a resonance match.
2. **Finite exact statistical oracle.** Use a small declared transformation set that can be enumerated independently. Compare counts, ordering, ties and p-values with producer output. If sampling transformations, freeze inclusion of identity, replacement scheme, seed, exceedance convention and resolution. A `(b+1)/(B+1)` correction alone cannot repair an invalid transformation/null pairing.
3. **Analysis-family correction.** If the target statistic selects the largest correlation over lags, bands, outcomes or stations, repeat that entire selection inside every null replicate. Include a deliberately uncorrected comparison, clearly labelled invalid for the selected family. Do not treat a corrected p-value for one family as correction for unreported searches.
4. **Dependence and clock checks.** Row shuffling destroys serial dependence. Circular shifts require a defensible shift-invariance model and are not automatically valid for a finite nonstationary or masked record. A block scheme needs declared block selection, boundary treatment and residual assumptions. Compare a valid synthetic null with a counterexample violating its assumptions; do not call either a field-data calibration. Timestamp offsets, gaps, local-time conversion and daylight-saving ambiguity must be explicit.
5. **Power and negative results.** Freeze a minimal meaningful effect and an injected-effect simulation before interpreting a null result. Report Monte Carlo uncertainty and attainable p-value resolution. A nonsignificant test cannot establish absence of coupling or contact. Synthetic injected effects verify sensitivity to their chosen model only.

These are candidate checks, not preregistered executed experiments. The advisor must select the exact finite model, data-generating law, nuisance class, statistic, tolerance and failure criteria before either worker runs the selected study.

## Data-intake rejection cases

The independent checker should reject or downgrade, rather than silently repair:

- Unknown UTC mapping, impossible/nonfinite times, reversed intervals, duplicate timestamps, future acquisition claims or an unstated interval convention.
- Missing raw numeric bytes, hash, source, license/access scope, component/orientation, calibration, units, uncertainty, sampling/windowing and QC flags.
- Images submitted as calibrated spectra; Kp submitted as an SR field measurement; synthetic traces submitted as observations.
- Contact reports with only upload dates, retrospective event-time choices, missing all-attempt denominators, changing outcomes, or no pre-observation commitment.
- Data-selected calendars, astrological categories, harmonics, frequency bands or lags presented as fixed in advance. Astronomical ephemerides may be timestamp/covariate calculations; interpretive astrology is a different claim.
- Metadata assertions presented as independently authenticated calibration, sensor independence, blinding or absence of leakage.

Use separate statuses such as `insufficient-data`, `metadata-complete-unverified`, `synthetic-benchmark`, and `analysis-eligible-after-audit`. No schema state should output `contact-confirmed` or `ET-confirmed`. Authenticity, physical validity and representativeness cannot be established by parsing JSON.

## Independence and release record

Before comparison, retain the frozen advisor contract and hash the producer outputs. The verifier will implement a separate oracle and adversarial fixtures in `verification/`, without editing `analysis/`. Record exact software/runtime, inputs, tolerances, outputs and all initial failures. A repaired run must retain its superseded result. Root integration and public deployment are separate checks, not additional research rounds. Review network edges for claim type and source provenance; adjacency must not become a causal claim.

## Primary statistical sources actually inspected

- **Hemerik & Goeman**, *Exact testing with random permutations*, online 2017; TEST 27 (2018), 811–825, DOI [10.1007/s11749-017-0571-1](https://link.springer.com/article/10.1007/s11749-017-0571-1). Read primary HTML Introduction, §2.1/2.2 and §3.1–3.3 through Theorem 2. Their finite-group/null-invariance conditions and identity-inclusion result motivate the exact oracle. They do not automatically validate arbitrary shifts of a measured time series. PMC access returned a browser check; publisher HTML succeeded. This is prior art, not a newly discovered test.
- **Phipson & Smyth**, *Permutation P-values Should Never Be Zero*, 2010, corrected 2011, DOI [10.2202/1544-6115.1585](https://doi.org/10.2202/1544-6115.1585). Read the [author-hosted 12-page PDF](https://gksmyth.github.io/pubs/PermPValuesPreprint.pdf), especially §§2–6, via extracted text. Distinguish sampled and exhaustive schemes, retain ties, and never substitute a zero Monte Carlo tail estimate for a valid test probability. The later Hemerik–Goeman assumptions remain necessary for the proposed permutation setting.
- **Theiler et al.**, *Testing for nonlinearity in time series: the method of surrogate data*, Physica D 58 (1992), 77–94, DOI [10.1016/0167-2789(92)90102-S](https://doi.org/10.1016/0167-2789(92)90102-S). Search-result abstract/metadata only; publisher body returned HTTP 403. A relevant prior-art lead, not a full-method audit and not a source for claiming surrogate validity here.

## Recommended next decision

Select one tractable **synthetic falsification benchmark**: a complete finite null group, a predeclared lag-selection statistic, a tied-data fixture and a declared assumption-breaking example. In parallel, finish the primary-source/coupling and real-data feasibility ledger. Only after that review decide whether the next round should test a dimensioned detector model, strengthen intake, or prepare a blinded future experiment. No actual ET/contact inference is presently executable from the supplied materials.
