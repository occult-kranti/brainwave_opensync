# Independent round 3 preregistration

Written before reading the round 3 producer source or results. The frozen round 3 contract and the communicated API schema are inputs. Round 2's frozen equal-output parameter pair is an explicitly inherited fixture, not an independent discovery. Additional fixtures are independently chosen. Only this verification directory is writable by this worker.

## Equations and identifying assumptions

For a known positive mass, calibrated force/displacement complex amplitudes, positive probe frequency and the single-mode convention q=Re(Q exp(i omega t)), independently compute H=1/[m(omega0²−omega²+2i gamma omega)] with Python native complex arithmetic. Invert Z=1/H: omega0²=omega²+Re(Z)/m and gamma=Im(Z)/(2m omega). Require finite positive reconstructed omega0² and gamma. One exact complex measurement identifies these two real parameters within this restricted model; it does not establish that the model is valid.

For an unknown positive constant real gain g, Y=gH and Z=1/Y=A(omega0²−omega²+2i gamma omega), A=m/g. Two distinct positive frequencies give A=−[Re(Zb)−Re(Za)]/(omega_b²−omega_a²), omega0²=omega_a²+Re(Za)/A and gamma=Im(Za)/(2A omega_a). Poles can be identified in this restricted class although m and g remain confounded. This is different from an arbitrary frequency-dependent complex receiver: G=H2/H1 gives G H1=H2 wherever H1 is nonzero. Stable positive-damping single modes are continuous, finite and nonzero on our compact positive band, so this nuisance construction is finite there; no claim of a globally realizable causal sensor is made.

## Fixtures, thresholds and controls

- Recover the inherited R2 pair (7.8 and 10.3 Hz) and independent Q=.6 and Q=.4 models from one complex point; predict three additional distinct frequencies (2.3, 11.7 and 17.1 Hz). The reconstruction probes are 6.4, 8.8, 3.7 and 1.3 Hz respectively.
- Numerical parameter/complex API comparisons: relative tolerance 2e-11, absolute tolerance 1e-15 for SI response components and 1e-12 for model parameters. Held-out discriminator: norm complex error <= 1e-15 m/N + 2e-10 times measured norm. These are floating-point test tolerances, not experimental uncertainty.
- Wrong-convention conjugation must fail positivity. A fixed gain 1.35 applied at all probes while the inverse assumes calibrated unit gain, and a coherent sum H1+.8 H2 fit by one mode, must reject or fail a held-out point. A deterministic small complex multiplier 1+1e-4+2e-4 i probes sensitivity; report parameter shifts and held-out errors without general conditioning claims.
- Receiver ratio controls use 1, 2.3, 6.4, 7.8, 10.3, 11.7 and 20 Hz. The wrong reciprocal ratio must fail equality at at least one point. Constant gain g=3.7 is tested independently by the two-frequency slope at 2.3 and 11.7 Hz.
- Invalid numerical inputs include zero mass/frequency, zero transfer, nonfinite and extreme-range data, missing held-out frequencies, duplicated points and reuse of the reconstruction probe. No every-wrong-model claim is intended.

## Metadata readiness, never an anomaly test

The agreed schema requires a station and channel, Schumann-mode-frequency observable in Hz, a calibrated-numeric HTTPS record reference and SHA256, strictly valid UTC interval, retrieval and fixed assessment timestamps, complete interval ending no later than retrieval, valid calibration assertion, QC passed, matched baseline, an uncertainty and decision procedure, station/global scope and an explicit synthetic boolean. For global scope, require two unique station IDs including the focal station, an independence justification and shared-observable model. These strings are assertions whose truth this function cannot verify. Distinct IDs do not prove independent stations; baseline suitability, raw values, calibration, statistical validity and dependence remain external obligations.

Positive controls contain fully specified synthetic metadata and can only become ready-for-analysis. Negative controls delete required fields and mutate units, observable, calendar dates, time ordering, coverage, record type/hash/URL, station uniqueness and global justification. Invalid calendar days (February 30) must not be normalized into valid dates. The actual October evidence inventory consists of quicklook availability and Kp context without calibrated numeric Schumann station records or a matched baseline; it must return insufficient-evidence and anomalyEstablished=false. No SR waveform, baseline or anomaly is manufactured.

The Python oracle freezes fixtures and its hash before any producer implementation is inspected. Actual comparisons bind the final frozen producer module and saved source packet bytes. No fourth round is authorized.
