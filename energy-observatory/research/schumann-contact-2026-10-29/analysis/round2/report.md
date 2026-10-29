# Round 2 producer — ideal magnetic acquisition arithmetic

Status: **PASS, 65 assertions executed** with `node analysis/round2/run.mjs` from this study directory. This is a known-law engineering replication and a proposed measurement check, not a physical observation or a new theorem. No verifier outputs were read before freezing the producer artifacts. No failed run occurred.

The frozen advisor contract was implemented in an independent new module. Faraday induction uses a stationary ideal air-core coil and a spatially uniform sinusoidal field: `V_rms = N A (2 pi f) B_rms |cos(theta)|`. Integrating the azimuthal field along a circular path gives `2 pi r E_rms = pi r^2 (2 pi f) B_rms`, hence `E_rms = pi f r B_rms`. Both formulas use RMS magnetic amplitude; no extra square-root-of-two enters the result. The classical Johnson voltage uses `sqrt(4 k_B T R bandwidth)` with exact SI `k_B=1.380649e-23 J/K`.

| Illustrative quantity | Result | Scope |
| --- | --- | --- |
| Ideal open-circuit coil voltage | 4.919734095521616e-8 V RMS (49.1973 nV) | N=1000, A=1 m², f=7.83 Hz, B=1 pT RMS, aligned normal |
| Ideal circular-path electric field | 2.459867047760808e-12 V/m RMS | r=0.1 m, uniform axial field; not tissue dosimetry |
| Resistor thermal voltage | 4.070354775692163e-9 V RMS (4.07035 nV) | T=300 K, R=1000 ohm, equivalent noise bandwidth=1 Hz |
| Resistor-only equivalent magnetic noise | 8.273525960269612e-14 T RMS (0.0827353 pT) | Dividing this voltage by ideal coil sensitivity only; not a measured detector threshold |
| 35 µT / 1 pT amplitude ratio | 35,000,000 | A dimensionless amplitude comparison; temporal stimuli and biological mechanisms remain different |

`results.json` records the inputs, all controls, invalid cases and finite-difference checks. Zero B gives zero signal while preserving instrument sensitivity. Zero f/N/A or an exactly orthogonal normal gives zero sensitivity and an explicit `unidentifiable-zero-sensitivity` status with a null equivalent magnetic noise, rather than an infinite pseudo-measurement. Exactly represented odd multiples of 90 degrees are assigned projection zero; otherwise the absolute cosine is evaluated numerically after reduction modulo 360 degrees. Turn count is restricted to a nonnegative safe integer. Invalid negative/nonfinite inputs and overflowing products are rejected; the receiver-only thermal expression requires strictly positive resistance and bandwidth. Zero Kelvin is accepted as the formal classical limit, not a real operating-temperature prediction.

Executed controls double B, f, area and turns, reverse the normal, vary thermal parameters by a factor of four, and check zero circular-field inputs. A separate central-difference derivative of the time-dependent sinusoidal magnetic flux converges quadratically toward the RMS coil formula over three fixed timestep refinements. Expected-zero checks use absolute tolerance 1e-25 and finite nonzero comparisons relative tolerance 1e-10; derivative errors have the separately stated discretization criterion in the runner.

The chosen turn count, geometric area and resistance are independent toy inputs, not a realized manufacturable coil design. Real winding length, self-inductance, capacitance, frequency response, core effective area, amplification, loading, environmental interference and calibration have not been modeled or measured. The bandwidth is an equivalent noise bandwidth for the white-resistor-noise toy. The result is not a total receiver noise floor, detection guarantee or source/load energy budget. It does not establish usable power, a neural effect, an occult interaction or an extraterrestrial sender. A field of 1 pT is an illustrative input, not a newly retrieved station amplitude.

Next unresolved objection: even a calibrated environmental field trace does not identify the cause of an associated subjective/contact score. The next useful computational question concerns independently locked timing, common environmental/calendar causes, scoring leakage, autocorrelation and multiple candidate lags. That is a proposed next direction only; no later-round simulation was executed here.
