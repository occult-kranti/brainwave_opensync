# Quantum panel: frozen blind diagnosis, round 3

Date: 2026-10-22. These are independent diagnoses of synthetic records, not physical measurements. Before freezing this response I read only `cards.json`, `card-41.csv`, `card-72.csv`, and `card-19.csv` from the blind-card directory. I did not read the answer key, the card-generating/reference code, or its results. Earlier round-one metrology discussion made the general failure modes known; the diagnoses below are blind to the assignment of those failure modes to these cards.

I independently integrated simultaneous signed voltage–current products with the trapezoid rule. For the calibration card I estimated the waveform frequency by an FFT, then fitted sine, cosine, and constant components by least squares. For the storage card I used the certified linear capacitor's endpoint energy. The executable method and machine-readable results are in `blind_analyze.py` and `blind-diagnosis.json`.

The residual convention is

\[
R=E_{\rm load}+E_{\rm loss}+\Delta U-E_{\rm recorded\ input}.
\]

Positive residual is apparent excess output across the recorded boundary. It does not identify a cause.

| Card | Recorded input (J) | Load (J) | Stated loss (J) | Initial apparent residual (J) | Independent diagnosis |
|---|---:|---:|---:|---:|---|
| 41 | 0.00161789575324 | 0.0016 | 0.000143114854953 | 0.000125219101712 | Differential phase inconsistency; conditional calibration closes the ledger. |
| 72 | 0.1 | 0.18 | 0.02 | 0.1 | Recorded capacitor depletion accounts for the excess in the stated model. |
| 19 | 0.1 | 0.12 | 0.02 | 0.04 | Incomplete boundary; cause remains unresolved. |

## Card 41: conditional phase calibration

The dominant frequency is 1000 Hz. A reference declared in phase has fitted current lag 0.00628318530718 rad (0.36°), corresponding to a principal relative delay of 1 microsecond. The raw input current lag is 85.36°. Applying the reference phase correction gives 85.00° and corrected input energy 0.00174311485495320 J. The corrected residual is approximately −3.7 × 10⁻¹⁷ J, consistent with numerical roundoff for these exact synthetic data.

The correction requires the reference and input channels to share the relevant transfer paths. Simultaneous acquisition alone does not establish that condition. A single-frequency phase also identifies delay only modulo the period. The evidence therefore supports a conditional calibration explanation, not an unconditional identification of a particular instrument fault. Check the common signal paths and differential gain and phase over the occupied bandwidth before applying the same inference to hardware.

## Card 72: stored energy depletion

For the certified constant linear capacitance, `C = 0.02 F`, the initial voltage is √10 V and the final voltage is zero. Consequently

\[
\Delta U=\tfrac12 C(V_f^2-V_i^2)=-0.1\ {\rm J}.
\]

Including this term gives residual approximately −4.2 × 10⁻¹⁷ J. The admitted model closes because the capacitor supplies its stored energy. A repeated-cycle assessment must include charging, recharge, and reset. Numerical closure does not independently certify an apparatus or an exhaustive boundary.

## Card 19: retain the ambiguity

The observed residual is 0.04 J. The inventory names an unmetered controller supply. If that supply were the only missing term, it would have to contribute 0.04 J for closure; this is an algebraic requirement, not a measurement of controller energy. These channels alone cannot distinguish omitted input from a calibration bias, an unrecorded storage change, or another missing transfer.

The next decisive measurement is simultaneous signed voltage–current acquisition on the controller supply, accompanied by a complete port and endpoint-storage inventory. There is no basis here to assign the residual to quantum effects, vacuum energy, or a new energy source.

## Freeze and scope

`blind-freeze.json` records SHA-256 hashes of the four admitted inputs and of the diagnostic script and outputs. This response is frozen before key access. The three diagnoses test synthetic accounting logic only. They do not measure a device, establish net cycle efficiency, or prove a new physical mechanism.
