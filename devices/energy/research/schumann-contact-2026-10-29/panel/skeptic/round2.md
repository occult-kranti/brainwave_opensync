# Round 2 — skeptic review of magnetic acquisition arithmetic

Incoming objection: Round 1 rejected frequency resemblance as a coupling law and warned that the strongest relevant magnetoreception experiment used a different field waveform and amplitude. The advisor selected a dimensioned receiver calculation instead of a biological claim.

## Verdict

**Accept the declared ideal-receiver arithmetic, conditional on retaining its explicit scope.** I read the frozen round contract and producer model/results, independently evaluated four baseline quantities using Python's math library without importing producer code, and compared them at the specified relative tolerance. All four agree. This is a narrow calculation check; the dedicated verifier's separate report supplies broader test coverage.

| Quantity | Independent result | Meaning |
| --- | ---: | --- |
| Coil emf | 49.197340955 nV RMS | 1,000 turns × 1 m², aligned with a uniform 7.83 Hz, 1 pT RMS field |
| Circular-path induced E | 2.45986705 × 10⁻¹² V/m RMS | Ideal radius 0.1 m path in the declared uniform axial field |
| Resistor thermal voltage | 4.07035478 nV RMS | Classical 300 K, 1,000 Ω, 1 Hz bandwidth model |
| Equivalent B noise | 0.08273526 pT RMS | Resistor noise divided by this ideal coil sensitivity |

The emf follows Faraday's law: flux per turn is A B cosθ; differentiation changes sinusoidal frequency into the factor 2πf without an extra RMS factor. The circular-path field follows 2πr E=πr² |dB/dt|, giving E=πfr B in RMS form. Units reduce to volts and volts per metre respectively. Producer controls declare exact orthogonality for exactly representable odd multiples of 90°; that is an input convention, not experimental alignment precision.

## Necessary interpretation limits

- The 1,000-turn, 1 m² coil is a declared ideal specification, not a completed apparatus design. Geometry, wire resistance, inductance, loading, self-capacitance, amplifier noise and ambient pickup require a real transfer calibration.
- `identifiable: true` means nonzero algebraic receiver sensitivity. It does **not** certify statistical detectability, unique source identification or calibrated hardware. The UI should spell this out or label it “nonzero ideal sensitivity.”
- The circular-path field is not a measured field in a head, tissue dosimetry, a neural threshold comparison, or an upper bound over all magnetic receptor mechanisms. Tiny induction alone cannot rule out every proposed magnetic transducer.
- Dividing 35 μT by 1 pT gives 35,000,000 only as an amplitude comparison. The 2019 exposure's directional rotations and any Schumann sinusoid do not have equal temporal spectra.
- Johnson noise is a classical, resistor-only, stated-bandwidth approximation. Extrapolation toward zero temperature is not a claim that all physical noise vanishes. An apparent signal/noise ratio from these assumptions is not observed performance or available energy.
- A null equivalent-field result at zero sensitivity correctly means unidentifiable by this coil model, not a measured zero field.

These limits preserve the current engineering acceptance. No measured anomaly, brain coupling, contact information or ET source is admitted.

## Next-round recommendation

Proceed to the proposed **exact finite cyclic-shift selection benchmark**, with a narrow null contract. For finite records x and y, assume a uniformly random relative cyclic offset conditional on their shapes. That explicit randomization assumption, not stationarity alone, justifies enumerating the finite orbit. Choose a fixed small lag set, compute its maximum statistic, and repeat that whole selection at every relative shift. Include identity and ties.

Two controls are essential:

1. If all cyclic lags are searched, the selected maximum is invariant under shifting y. Its permutation p-value is then 1. This is a useful saturation/degeneracy control, not a defect to tune away.
2. A common calendar or nonstationary trend can violate the chosen null while containing no direct coupling. Such a result rejects that null, not an ordinary causal explanation. Label it as an assumption stress test rather than a counterexample to a valid randomization theorem.

A joint max-statistic test controls the stated global null under that invariance. Do not claim strong familywise control for arbitrary mixtures of true/false hypotheses without the additional necessary conditions. Use untouched evaluation fixtures, preserve rejected controls, and do not silently replace real irregular/gapped records with a cyclic stationary model.

## Execution record

The independent values are in `round2-independent-values.json`. Four comparisons were executed successfully. Producer results report 65 assertions; those are the producer's count, not my independent count. No physical data, full apparatus or human trial was tested by this reviewer. Sources and prior-art judgments from Round 1 remain in force.
