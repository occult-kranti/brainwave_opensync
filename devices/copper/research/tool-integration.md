# Executed tool adapters and their limits

Research snapshot: 22 October 2026. All input records are synthetic. No physical copper sphere was measured, no hardware was driven, and no full-spectrum or location-code claim was tested.

## What ran

`reference/tool-bench.py` integrates three optional packages through their public Python interfaces. It produced `research/tool-bench.json`: **18 acceptance checks passed**, including retained failure history and explicit input rejection. The website has no new Python or numerical runtime dependency; these are reproducible offline tools whose results are displayed by the site.

| Tool | Pinned execution version | License | Executed scope |
|---|---|---|---|
| pyFRF | 1.5.0 | MIT | H1 complex transfer, averaged coherence, duplicate-input pseudoinverse |
| scikit-fem | 12.0.2 | BSD-3-Clause | Radial elastic weak-form assembly, five mesh refinements |
| pyuff | 2.5.8 | MIT | ASCII/binary UFF58 complex-response exchange and units |
| SciPy | 1.17.0 | BSD-3-Clause | Cross spectra, root finding, generalized symmetric eigenproblem |
| NumPy | 2.3.5 | BSD-3-Clause | FFT fixtures, arrays, explicit rank-deficiency witness |
| sdypy-sep005 | 1.0.1 | See package distribution | pyFRF import dependency |

No external source code is copied into the browser bundle. The adapter and weak form are original project code. Installed module hashes are in the result JSON. Repository heads observed during research are recorded separately from the executed PyPI package versions; they are not asserted to be identical builds.

## Reproduce

Use an isolated Python environment. These commands are examples for a local checkout, not browser commands:

```sh
python3 -m venv .venv-tools
.venv-tools/bin/python -m pip install numpy==2.3.5 scipy==1.17.0 pyFRF==1.5.0 sdypy-sep005==1.0.1 scikit-fem==12.0.2 pyuff==2.5.8
.venv-tools/bin/python reference/tool-bench.py --output research/tool-bench.json
```

The executed environment was Python 3.12.14, with optional packages installed in a temporary external package directory. No repository environment or system package was overwritten. A normal dependency-resolving installation may install additional transitive packages. Reproduction requires network access to the package index during installation; the benchmark itself is offline.

## 1. An input/output response, not an isolated FFT

The synthetic model is a passive single-mode receptance:

\[
H(\omega)=\frac{1}{m(\omega_n^2-\omega^2+2i\zeta\omega_n\omega)}.
\]

The selected mode is 23,317.724126 Hz, damping ratio 0.008 and illustrative generalized mass 0.111233599 kg. That mass is a chosen oscillator parameter, not an independently calibrated effective mass of a real shell mode. Forty-eight independent periodic random records have 4,096 samples each at 192 kHz. Response is generated from the known complex transfer. This deliberately ideal fixture has no startup transient, contact nonlinearity, sensor dynamics or antialias-filter uncertainty.

Installed pyFRF source was inspected in its spectral accumulation, H1/H2, coherence and pseudoinverse methods. Its single-input H1 ratio corresponds to

\[
\widehat H_1=\frac{\sum_r X_r^*Y_r}{\sum_r |X_r|^2},\qquad
\widehat\gamma^2=\frac{|\sum_r X_r^*Y_r|^2}{(\sum_r|X_r|^2)(\sum_r|Y_r|^2)}.
\]

We cross-check with SciPy's separately called cross-spectrum and auto-spectrum estimates, using an explicitly matched boxcar window, no overlap and matching record length. The noiseless complex transfer is recovered within **1.45×10⁻¹⁴ relative error** over 1–80 kHz. Added independent output noise gives agreement between the two library paths within about 10⁻¹⁵. This is an implementation check, not evidence that every real measurement chain behaves like the model.

**A useful negative result:** one unaveraged record produces coherence essentially equal to one even after noise is added. The 48-record median coherence is **0.111** for the declared band and noise fixture. A coherence number without the estimator, record count and averaging configuration can therefore be misleading.

Primary references: [pyFRF source](https://github.com/ladisk/pyFRF/blob/ece6d1bdeb3495bfde3b49de40a451ddcc1a2d0c/pyFRF.py), [official tutorial](https://pyfrf.readthedocs.io/en/stable/tutorial.html), [SciPy CSD](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.csd.html), [SciPy coherence](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.coherence.html).

## 2. A fitted response need not identify its causes

Two identical excitation channels form a two-column design of **rank 1 and nullity 1**. The exact kernel vector is `(1, −1)`. pyFRF's pseudoinverse gives a coefficient pair that reproduces the known response; only the sum of the two transfers is identifiable. Reassigning equal and opposite transfer increments produces the same output.

This is a concrete warning for a proposed multi-sensor or multi-driver apparatus: count independent inputs, test singular values and report the nullspace. Adding channels that reproduce each other does not add identifying information. Independent source geometry and held-out drive conditions are a proposed next experiment, not a completed identification result.

The lab wrapper also rejects zero excitation, nonfinite response and mismatched channel lengths before asking a library to produce an FRF. Rejected data are not silently turned into a zero response.

## 3. Radial finite-element refinement

For radial displacement `u(r)`, the nonzero strains are `u′, u/r, u/r`. The stiffness bilinear form is

\[
a(u,v)=4\pi\int_0^R[\lambda(ru'+2u)(rv'+2v)+2\mu(r^2u'v'+2uv)]\,dr,
\]

and the mass form is

\[
b(u,v)=4\pi\rho\int_0^Rr^2uv\,dr.
\]

scikit-fem assembles linear radial elements. Regularity imposes `u(0)=0`; the unconstrained outer boundary has zero radial traction. SciPy solves `Kq=ω²Mq`. Independently, the comparison frequencies come from the free-sphere spherical-Bessel equation used in the existing model, solved by bracketing roots rather than by the finite-element matrix.

Meshes with 16, 32, 64, 128 and 256 elements converge monotonically for the first three radial modes. The finest maximum relative error is **3.65×10⁻⁵**, and the first-mode error is **1.37×10⁻⁶**. Doubling radius halves frequencies; quadrupling Young's modulus doubles them at fixed density and Poisson ratio. The full results include the normalized eigen-equation residual.

**Scope:** the strain energy is three-dimensional, but radial symmetry is imposed and the mesh coordinate is one-dimensional. It excludes torsional and nonradial spheroidal families, anisotropy, seam, real supports, damping and air loading. It must not be presented as a full 3D sphere simulation or proof that all measured modes have been captured.

Reference: [scikit-fem assembly documentation](https://scikit-fem.readthedocs.io/en/stable/api.html), [pinned repository inspection](https://github.com/kinnala/scikit-fem/tree/84ab8f589e1b2d3f598b6d0117fd93e91f64a7ad).

## 4. Data export failures are part of the result

UFF58 stores the complex synthetic response with frequency and response/input unit metadata. The accepted adapter writes a **fresh temporary file in add mode** and explicitly encodes the uniform frequency grid. ASCII roundtrip relative complex error is approximately **2.51×10⁻¹²**; binary roundtrip is exact for this fixture. Both preserve the selected frequency axis and Hz/m/N labels.

Two failures were retained:

- With pyuff 2.5.8, binary `mode='overwrite'` produced a seven-byte file containing only the terminator. Inspection found that the writer reopens the same file in truncating binary and text modes. The adapter uses a fresh file with `mode='add'`; the vendor library was not modified. This is a reproduced local behavior of the pinned release, not a statement about every version.
- Default uneven-grid ASCII formatting rounded some frequencies by **0.05 Hz** in the initial 192 kHz fixture. Uniform-grid encoding fixes this fixture; it does not solve arbitrary irregular-axis precision. Use binary or verify the exported axis against the required error budget.

The binary path also emitted an unclosed-file `ResourceWarning`, retained in the result JSON. The test uses short-lived temporary files, but this writer should not be adopted for a long-running acquisition service without addressing resource handling. The fresh-file workaround repairs the observed data truncation, not every library concern.

Reference: [pyuff](https://github.com/ladisk/pyuff), including its installed `dataset_58.py` writer and reader. No third-party code was patched or republished. No message or bug report was sent to maintainers.

## Investigated but not admitted as executed results

| Candidate | Reading / execution status | Why it remains separate |
|---|---|---|
| pyEMA / sdypy-ema 0.31.0 | Tutorial, migration shim and selected pole/constant routines inspected; import succeeded after dependencies were installed | No accepted pole-fit benchmark. Guided pole selection and residual fitting require separate noise, missing-mode and held-out checks. |
| RUScal | Pinned repository `b3446a804b38ee9e03c1fe9a10ecd2a1771240d3`, README/build/model scope inspected | Free-body Rayleigh–Ritz fitting is relevant, but no C build or fit was executed. Shape support and convergence must be verified for a hollow, seamed specimen. |
| Gmsh | 4.15.2 manual overview and mesh workflow inspected | No mesh generated. A mesh does not establish elastic constants, boundary conditions or eigenvalue convergence. |
| DOLFINx | Official Python documentation entry points inspected | No solver installed or executed. The viewed main documentation was a development version. |
| Neural operators | Assigned to the literature review | No surrogate was trained. A learned inverse does not remove nonidentifiability or justify out-of-distribution geometry. |

This is a selected, tested integration set. It is not a claim that every available tool, patent or research algorithm has been reviewed or validated.
