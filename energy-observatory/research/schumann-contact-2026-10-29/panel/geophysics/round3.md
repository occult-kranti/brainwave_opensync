# Round 3 — temporal-null transfer review

Incoming Round2 objection: a calibrated field channel still does not establish that timing associations identify its cause. Read `rounds/round3-contract.md` before any producer result existed. The selected calculation is an established finite-group randomization benchmark, not a test on actual Schumann or contact observations.

## Contract verdict

The declared null is conditional uniform relative phase among32 cyclic offsets of two fixed shapes. Exact enumeration can test that null, including the identity, with conservative treatment of ties. Recomputing the entire locked max-lag statistic inside every transformation addresses selection over that declared lag family. Reporting a minimum of individual-lag p-values without its selection correction is an appropriate deliberately invalid control. The result is a global-null level statement; it is not automatically strong familywise control for arbitrary mixtures of true and false lag hypotheses.

Stationarity alone is insufficient to identify this finite null. A stationary process sampled for32 points need not make the wraparound pair exchangeable with neighboring samples, and finite-window trends or boundary structure need not survive circular shifting. Real Schumann records have diurnal source geography, seasonal ionosphere behavior, transient lightning, maintenance and noise changes. Contact-session times can track time zones, work schedules or publicity. A shared clock can create structured association without a direct interaction. A valid toy-null result does not remove those alternatives.

If every circular lag is searched, the maximum is invariant under relative shifts: the transformed family merely permutes the same correlations. Thus p=1 for all offsets is a degeneracy control, not a general demonstration that real links are absent. A tiny restricted-family p-value would likewise concern the finite model only.

## Data rules that must survive implementation

- Keep actual UTC stamps, sampling intervals, missingness masks and exclusion reasons. Do not drop missing records and relabel the remaining values as contiguous equally spaced samples.
- Do not shift only convenient values while silently changing which timestamps or environmental states overlap. Jointly shifting a mask also needs a justified null; it is not an automatic solution.
- Freeze component, frequency estimator, time window, lags, preprocessing and admissible station support before observing the association. Independently chosen station/seasonal controls remain necessary.
- Do not merge the NOAA/GFZ Kp timeline with an uncalibrated spectrogram brightness trace and call the result a measured Schumann frequency. The existing packet ends29October03:00UTC in completed bins and retains provider differences.
- A chosen astronomical coordinate can be a measured nuisance predictor. An astrological interpretive label is a different hypothesis and requires an independently locked predictive test.

Prior-art transfer: Round1's inspected Tacza methods already use timing/validity controls and distinguish estimator response from mechanism. This round neither replicates those data nor improves their method. Its useful output is an inspectable failure mode for selected lags.

## Proposed next minimal model

Use a declared synthetic solar/local-time surrogate z, with X=z and Y=2z. The direct model Y=2X and the shared-driver model Y=2z agree at every observed point. The design matrix with columnsX,z has rank1 and nullity1; direction(1,−1) exchanges their coefficients without altering predictions. A duplicate channel adds no identifying variation. Measuring the common driver does not rescue a fit when these columns are exactly collinear.

Now specify a hypothetical externally assigned perturbationu, independent of that driver: X'=z+u while z is fixed. Direct and shared-driver models predict2(z+u) and2z, respectively; the design gains rank ifu is outside the span ofz. This supplies a falsifier for the two stipulated models, not a discovery that sunlight causes channeling or a recommendation to expose people. Unmeasured confounders, actual perturbation feasibility and calibrated endpoint response would remain separate experimental obligations. The established causal/linear-algebra content must be labelled as a benchmark, not new physics.

## Implementation review status

Contract review only at this draft: producer and verifier outputs were not yet available. No implementation pass or empirical outcome is admitted here.

### Finalization after producer freeze

Read the actual producer module, report, freeze, baseline rows and complete fixture-level rejection summaries. Model SHA-256 `4367a5f72935e146618e55f7d4b543ae574f4a7d726c4b15c67c38c3962308b6`; results SHA-256 `32ad1f9fd0edb56396be9717e3c208239463ebde48372768173c27c110115b91`. The producer records407 assertions. In the identical-shape fixture the invalid selected-minimum procedure rejects7/32 offsets while fixed-lag rejects1/32 and the locked maximum rejects0/32. The distinct-shape fixture rejects none under any of those procedures, and that less striking outcome is retained. These are finite-model fractions, not measured contact error rates. The all-lag invariant control reports p=1 throughout.

**Geophysics verdict: accept the stated finite-null interpretation and transfer limitations.** The code and report do not purport to validate shifting an actual station timeline, repair missingness, or infer a sender. Numerical completeness remains independently assessed in the verifier lane. The next common-driver versus direct-coupling test remains the appropriate narrower question; no physical association is admitted by this round.
