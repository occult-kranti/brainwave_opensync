# Round 2 — acquisition and noise budget review

Incoming objection from Round1: equal frequency labels do not provide a physical coupling, and raw sensor sensitivity must precede a cross-domain claim. Read the frozen `rounds/round2-contract.md`. This round is an established-law engineering calculation, not discovery of a biological effect or contact mechanism.

## Contract review

The stationary, uniform-field, air-core model is dimensionally consistent. Faraday circulation gives the coil open-circuit voltage and, under circular symmetry, an induced electric field. RMS conventions must remain explicit; Round1's illustrative peak convention is a different input definition, even though the same numeric amplitude gives the same numeric proportional output. Neither is a measured natural-field sample.

The resistive thermal-noise formula applies to the declared resistor and effective noise bandwidth. N=1000,A=1m²,R=1000Ω is an independently chosen toy parameter set, not a demonstrated winding geometry with that resistance. Coil inductance, parasitic capacitance, amplifier noise/current noise, loading, effective area, frequency response and ambient interference are omitted. Real field inference requires the measured complex transfer function and uncertainty. Dividing this ideal thermal voltage by an ideal sensitivity produces an illustrative receiver-only equivalent field noise, not an observatory detection limit or guaranteed signal-to-noise ratio.

At f=0 or N/A=0 or an exactly orthogonal orientation, the inductive channel supplies no field-amplitude inverse. A static geomagnetic field can therefore coexist with zero ideal coil output. This says nothing about other sensors or biological transduction. Near90° the inverse is poorly conditioned; the software's exact-angle convention is numerical bookkeeping, not a calibrated alignment error model. B=0 is a zero input, not zero receiver thermal noise.

## Independent arithmetic spot check

A separate Python scalar calculation used the contract values and k_B=1.380649×10⁻²³J/K:

| Quantity | Reference value |
|---|---:|
|Ideal coil voltage RMS|4.919734095521616×10⁻⁸V|
|Circular-path induced field RMS|2.4598670477608084×10⁻¹²V/m|
|1kΩ,300K,1Hz thermal voltage RMS|4.070354775692163×10⁻⁹V|
|Receiver-only equivalent field noise RMS|8.273525960269612×10⁻¹⁴T|

These scalars are engineering arithmetic, not physical data or a replacement for the independent worker's complete fixture review. Producer implementation review is pending below.

## Closest primary references

[Feynman Lectures II17.1](https://www.feynmanlectures.caltech.edu/II_17.html), stationary-loop and Maxwell–Faraday passage inspected, directly supplies the induction law. [Flowers-Jacobs et al., NIST2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC7339765/), introduction and Eq1 description inspected, supplies the resistive mean-square thermal voltage. Its apparatus includes frequency-response and nonthermal-noise corrections; our toy omits them. No novelty is claimed for either formula. The NIST paper predates the2019 SI definition; its measured historical k value is not substituted for today's exact stipulated constant.

## Next concern

After numerical acceptance, a positive correlation between a report channel and an environmental record still admits a common clock, common driver, autocorrelation, selection of favorable lags, and reporting schedules. Carry those alternatives into Round3. Reuse the dated October23–29 observation packet explicitly ending29October03:00UTC; this round acquires no newer station record. Do not convert calculated sensitivity into evidence that a recent Schumann anomaly happened or that a contact report had an external sender.

## Producer review status

Pending: no producer output existed when this contract/arithmetic review was drafted. No implementation PASS is claimed by this version.

### Finalization addendum after producer freeze

Subsequently read the actual `analysis/round2/model.mjs`, `results.json`, `report.md` and `freeze.json`. Bound model SHA-256: `0161eee55b8361ae10bd202becee340084a04f4fb31183e81dc46748a69a817c`; results SHA-256: `9cec0283ccac92eece9ddbe948a9f54e7fe5cf8e9f76138fea9a492bc8bfaca6`. The producer reports65 executed assertions; that is its execution count, not a new count by this reviewer. Its four baseline quantities agree with the separate scalar calculation above. The source explicitly handles exact orthogonality and zero sensitivity, retains finite-range checks, uses RMS throughout, and excludes total noise-floor, manufacture, power, biology and ET claims. The finite-difference convergence exercise tests this sinusoidal flux model only.

**Geophysics verdict: accept the physical interpretation and fixture-level arithmetic within the frozen ideal receiver scope.** Full independent worker verification remains a separate record. The finalization supersedes the pending status without deleting its original chronological text. No hardware result or current Schumann event has been admitted.

For the proposed Round3 cyclic-shift test, accept only its exact stated relative-phase symmetry. Real astronomical/calendar schedules, lightning geography and nonstationary station records need not have that symmetry. Searching every circular lag makes the max statistic shift invariant, a useful negative control rather than evidence of universal power or actual-data validity.
