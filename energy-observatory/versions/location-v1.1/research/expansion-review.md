# Independent review: what the measurement can identify

Review date: 22 October 2026. Status: accepted within the declared numerical scope. Two AI agents independently derived the new acquisition calculation and its reference fixtures; this is not human peer review. There are **zero physical measurements**.

The reviewer froze an acceptance contract before inspecting the new acquisition implementation. The contract covered finite sampled channels, aliases, window normalization, damped frequencies, correlated uncertainty, explicit inverse nullspaces, invalid inputs and deterministic reproduction. After inspecting the producer, the reviewer compared it with independently generated NumPy calculations, raised a transient-window objection and verified the response. The historical/source review is separate from this numerical admission.

## Limitations that matter experimentally

| Issue | Why it changes the inference | Action in this release / next experiment |
|---|---|---|
| A single radial family is not the object's spectrum | A solid or shell also has nonradial, torsional and support-coupled modes. Electromagnetic, thermal and optical spectra are different channels. | Keep the reduced model label. Add multiple surface readout points and excitation directions before interpreting an absent peak. The radial finite-element check remains radial only. |
| Eigenmodes need not be integer harmonics | The first three radial frequencies of the reference solid have ratios about **1 : 2.2041 : 3.3529**, not 1 : 2 : 3. A nonlinear driven harmonic and an independent normal mode are different observations. | Use “mode” or “resonance” unless an integer-multiple relation has actually been established. Vary input amplitude to test nonlinear harmonic generation. |
| Instrumental aliasing can look like a new frequency | A real sampled cosine cannot uniquely distinguish frequencies differing by integer multiples of the sample rate or reflection about Nyquist. | New acquisition sandbox and alias controls. A 46,836.628369 Hz component sampled at 48 kS/s without a filter appears at 1,163.371631 Hz. Analog filtering and receiver bandwidth are still absent from the model. |
| Peak picking is not pole fitting | Record duration, window, damping, noise and mode mixture affect the largest FFT bin. A finer display grid does not create new information. | Show bin spacing separately from input oscillation frequency. Compare finite records and close modes; fit a justified time-domain or FRF model in a real study. |
| A Hann window can suppress a ring-down onset | Its first sample has zero weight. Coherent-gain normalization for steady sinusoids does not reconstruct the initial amplitude of a decaying transient. | Reviewer objection led to a warning and a regression showing a first-sample-only transient becomes invisible after Hann weighting. A long record can add mostly noise after decay. |
| One frequency does not identify several material parameters | Different stiffness, density and radius combinations give the same radial frequency. A good fit can still have a nullspace. | Publish the explicit rank/kernel example below. Independently measure geometry and mass; use additional mode shapes and sensitivity directions. |
| A/B uncertainty contains correlations | The same clock, temperature calibration or fitting assumptions can affect both positions. Independent and shared errors propagate differently. | New covariance calculator. Its k-times-standard-uncertainty threshold is not automatically a confidence interval or a statistical power calculation. |
| “Pure copper” and “frictionless” do not define boundary conditions | Texture, seams, residual stress, contact preload, airflow and support stiffness can dominate a small difference. | Run a support/preload and specimen-rotation control before assigning a residual to location. A measured difference alone identifies no destination-selective force. |

## Explicit inverse obstruction

At fixed Poisson ratio, an isotropic radial frequency scales as

\[
f=C(\nu)\frac{\sqrt{E/\rho}}{R}.
\]

For parameters \((\log E,\log\rho,\log R)\), the log-frequency Jacobian is

\[
J=\begin{bmatrix}1/2&-1/2&-1\end{bmatrix}.
\]

It has **rank 1, nullity 2**. Two independent kernel directions are \((1,1,0)\) and \((2,0,1)\). Finite transformations \((E,\rho)\mapsto(aE,a\rho)\) and \((E,R)\mapsto(a^2E,aR)\) leave this frequency unchanged. Repeating the same measurement at matched A/B conditions does not raise the rank. More generally, scaling both the elastic tensor and density by the same positive factor leaves the free-body elastic eigenfrequencies unchanged. This is an identifying-information limit, not a lack of optimizer sophistication.

The new tool benchmark also supplies a distinct example: two duplicate excitation channels have rank 1, nullity 1 and kernel \((1,-1)\). A pseudoinverse can reproduce the output without identifying a unique pair of physical transfers.

## Covariance, not a bin-width error bar

For \(D=f_B-f_A\),

\[
u_D^2=u_A^2+u_B^2-2\operatorname{cov}(f_A,f_B).
\]

A common small multiplicative clock uncertainty \(u_\epsilon\) contributes \(|D|u_\epsilon\) to the standard uncertainty of the difference. Two independent clocks with equal fractional uncertainty contribute \(u_\epsilon\sqrt{f_A^2+f_B^2}\). Shared error therefore does not always cancel completely. The implementation uses the stable form \((a-b)^2+2ab(1-r)\) for a correlated pair's variance and assumes independence between error categories. Sensitivity-coefficient uncertainty, nonlinear calibration and unmodeled covariance remain outside this simple calculator.

[JCGM 100:2008](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf), section 5.2 and Annex F.1.2, is the primary metrology reference for correlated input quantities and common-instrument effects. The calculator applies first-order covariance propagation; it does not implement the complete GUM workflow.

## Concrete numerical defect found and repaired

The previous radial root solver started its search at \(x=10^{-5}\). Near the allowed auxetic boundary \(\nu\to-1^+\), a legitimate first root lies below that cutoff, so the solver returned the next radial root. The default copper calculation at \(\nu=0.35\) was unaffected.

For the combined traction residual,

\[
F_\nu(x)=j_0(x)-4q\,j_1(x)/x,\qquad q=\frac{1-2\nu}{2(1-\nu)},
\]

\[
F_\nu(0)=\frac{1+\nu}{3(1-\nu)},\qquad
x_1^2\sim\frac{10(1+\nu)}{3-\nu}.
\]

The repaired search begins at the positive continuous limit at zero. For small x, it evaluates the combined power series directly instead of subtracting nearly equal terms. A subsequent stress check found another cancellation in the modal mass: computing \(j_2=3j_1/x-j_0\) gave a mass ratio of 1.5 at the nearest binary64 value above \(\nu=-1\), while the independently integrated limit is 0.6. Stable small-x series for \(j_1\) and \(j_2\) now repair that case too.

The roots were independently recomputed with 90-digit Decimal sine/cosine series and the direct traction equation. Modal masses were checked by SciPy quadrature of the normalized radial displacement. Four near-boundary fixtures, plus the copper reference, are reproducible in `reference/acquisition-reference.py`. These exotic Poisson-ratio checks stress a public mathematical input domain; they are not a claim that copper has these properties.

## Executed checks and admission

- **13 independent sampled-signal fixtures and 5 covariance fixtures: 15,395 numerical comparisons passed.** Maximum absolute amplitude-spectrum discrepancy against NumPy: **6.03×10⁻¹⁴**. Cases include DC/Nyquist scaling, leakage, damping, folded ultrasonic signals, close modes, zero projection, zero signal, a window-suppressed transient, and the maximum 65,536-sample/eight-mode workload.
- The explicit rank/nullity/kernel example and two distinct frequencies producing indistinguishable real samples passed separate controls.
- The original **127 independent sphere/support/table comparisons** still pass after the root and mass repairs, with maximum relative discrepancy **4.79×10⁻¹²**. Default copper results remain consistent to floating-point precision.
- The reviewer inspected the radial finite-element weak form, mass measure, regularity and free-surface boundary, FRF normalization and comparison band, and independently reran the tool adapter script: **18/18 checks passed**. This rerun is a reproduction of the adapter, not another independent implementation of those libraries. The finite-element versus Bessel comparison provides distinct formulations within the same radial model.

Read `research/acquisition-review-results.json` and `research/producer-comparison-v1.1.json` for current source hashes, fixture hashes, counted results and limits. The original `research/producer-comparison.json` is retained as the 21 October release record. Numerical counts refer to scalar comparisons, not independent physical experiments. Near-tied FFT maxima are accepted as tied candidates within arithmetic tolerance rather than assigned a fictitious unique frequency.

Reproduction:

```sh
python reference/acquisition-reference.py
node --test tests/acquisition-independent.test.mjs tests/models.test.mjs tests/independent.test.mjs
# Optional packages are installed separately as documented in tool-integration.md:
PYTHONPATH=/path/to/optional/packages python reference/tool-bench.py
```

The [SciPy Hann documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.windows.hann.html) distinguishes periodic spectral-analysis windows from symmetric filter-design windows. This implementation uses the periodic convention. [Wang, Li and Kuok, SHM 2025](https://www.dpi-proceedings.com/index.php/shm2025/article/download/37321/35895), pages 3–4, supplies a relevant modern modal-identification comparison: its scale normalization and uncertainty formulas depend on explicit mode separation, noise, record-length and damping assumptions. Its Bayesian algorithm was read but not implemented or independently validated here.

## Proposed discriminating experiment sequence

1. **Samplerate control:** acquire a calibrated in-band source at two suitable rates with characterized analog filters, then deliberately demonstrate a synthetic alias offline. Prediction: the unfiltered digital alias follows the folding law; an intrinsic mechanical pole does not move simply because a DAQ setting changes.
2. **Visibility control:** keep specimen and support fixed; change readout spot/direction and measured excitation. Prediction: amplitudes and observable mode participation change. A mode absent from one channel can reappear in another, without establishing any change of eigenfrequency.
3. **Linear-regime control:** vary small drive amplitude and support preload in separate series. Prediction: a valid linear model has invariant fitted poles over its operating range. Amplitude-dependent peaks or extra harmonics signal nonlinearity, heating or a changed boundary condition requiring a different model.
4. **Matched A/B test:** only after the controls, alternate stationary A/B measurements with the same carrier, orientation, sensor geometry, specimen thermometry and common timebase. Preregister the selected mode, correction model, uncertainty budget and effect threshold. A residual requires independent replication and alternative-cause tests.

All four are proposed experimental protocols. No instrument was operated, no new physical law was discovered, and no finite measurement captures every frequency or every state variable of an object.
