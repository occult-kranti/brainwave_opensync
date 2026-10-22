# Offline measurement analysis

These tools analyze **user-supplied calibrated records**. They do not record hardware, operate a laser, obtain the entire spectrum of an object, or establish an intrinsic frequency assigned to a location. No copper-sphere measurements have been supplied. The demo is synthetic.

Tested with Python 3.12.14, NumPy 2.3.5 and SciPy 1.17.0. Install the pinned packages in an isolated environment with `python -m pip install -r requirements.txt` if needed. Analysis files remain local. From this directory:

```sh
python make_demo.py --output /tmp/position-demo
python analyze.py trace /tmp/position-demo/synthetic-trace.csv --synthetic --f-min 100 --f-max 3000 --nperseg 512 --output /tmp/position-demo/trace-analysis.json
python analyze.py blocks /tmp/position-demo/synthetic-blocks.csv --synthetic --output /tmp/position-demo/block-analysis.json
python ../tests/analysis_test.py
```

Choose fresh output locations; the CLI rejects an existing output rather than overwrite the earlier record. Omit `--synthetic` for actual input records. That label does not authenticate data: the tool stores the input hash, dependencies and analysis assumptions, and marks hardware provenance as unverified.

## Synchronized trace CSV

Required columns: `time_s,force_N,sphere_velocity_m_s,table_acceleration_m_s2`. Times are uniformly spaced samples from synchronized calibrated channels during one stationary acquisition. The object must have settled after translation. A phone microphone or ordinary audio interface cannot substitute for the required calibrated ultrasonic velocity and force channels.

The tool estimates the velocity/force **H1 frequency-response function**, with SciPy's convention `csd(force, velocity) = conj(F) V`:

`H1(f) = S_Fv(f) / S_FF(f)` in `(m/s)/N`.

It also reports `|S_Fv|²/(S_FF S_vv)` magnitude-squared coherence, force PSD in `N²/Hz`, and table acceleration PSD in `(m/s²)²/Hz`. These use Hann-window Welch averaging with 50% overlap and mean detrending per segment. It requires at least three overlapping segments; those segments are not claimed to be statistically independent. Reported peaks are candidate **response-bin maxima**, not fitted modes or resonance poles. A single measured channel can miss modes.

H1 assumes force-channel noise is small compared with the excitation. Record sensor calibration, channel phase alignment, excitation point/direction, LDV direction, fixture, temperature, hardware bandwidth, analog anti-alias filter and sample metadata separately. The numerical guard rejects bins at or below `1e-12 × max(force PSD)` and returns `null`. The retained `usable_excitation` flag means only this numerical division guard passed. It does not establish a measured force-noise floor or adequate excitation SNR; those need a separate noise record and a predeclared criterion. High coherence is a diagnostic, not proof of causality. The software rejects a requested analysis band reaching Nyquist. It cannot detect aliasing already introduced by the acquisition hardware.

The trace demo is a noisy 700 Hz **toy support oscillator** after a bilinear transform. Its digital peak is warped relative to the continuous parameter. It is not a bulk-mode prediction for the copper sphere. It intentionally exercises a lower instrument band rather than pretending to simulate the entire object.

## Matched-mode block CSV

Required columns: `block,order,position,time_s,frequency_hz,temperature_c`. Each block has four rows, orders 1–4, positions ABBA or BAAB. `time_s` is the acquisition **midpoint**, with equal spacing within 0.1%; timestamps must be unique. Both patterns must appear with counts differing by no more than one. Use at least three independent blocks, preferably a pilot-informed larger count. Randomize the order of the two block patterns prospectively. The input cannot prove randomization or independence.

For each block the contrast is `d_b = (mean frequency at B) − (mean frequency at A)`. Symmetric sequencing cancels linear time drift at equal spacing. The estimate is the equal-weight mean of `d_b`; its ordinary Student-t interval is `mean(d) ± t_(1−α/2,n−1) sd(d)/sqrt(n)`. The test uses a separately hand-calculated t fixture and a large injected drift to check this cancellation.

Prerequisites: each row must estimate **the same identified mode**, with the same channel, estimator and fit convention. Do not enter each trace's tallest peak as though it were a common mode. A shift in relative peak amplitude can change the tallest peak without changing any natural pole.

The interval assumes independent, approximately normal block errors. It omits common calibration systematic error and does not add per-run fitting uncertainty. Temperature contrasts are reported without correction; use a separately calibrated thermal coefficient before attributing a shift to location. Contact, orientation, laser geometry, air flow, hysteresis and nonlinear drift can survive the contrast. Multiple modes or comparisons require a predeclared multiplicity strategy. An interval containing zero does not establish equivalence: predeclare a meaningful shift threshold and perform an appropriate equivalence/power analysis.

## Scope of verification

The test covers a known delayed gain with added receiver noise, the independent complex transfer formula, large linear drift cancellation, the Student-t calculation, and rejection of missing timestamps, AABB order, uneven spacing, too few blocks, nonfinite values, constant input, Nyquist-band and single-segment errors. Passing checks establishes these numerical properties of the code, not the accuracy of an actual apparatus or a physical discovery.

Software references: [SciPy csd](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.csd.html), [Welch](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.welch.html), [coherence](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.coherence.html), [Student-t](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.t.html). Consult the page's source ledger for experimental context.
