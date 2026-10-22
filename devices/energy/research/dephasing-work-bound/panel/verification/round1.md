# Verification Round 1 — independent freeze

**Outcome:** PASS for the declared finite numerical checks; no producer comparison yet. Baseline: `8e9f131cb8f9da82532812a66e144b67e969cb0d`. Actual exposure was limited to the contract, verifier skill/navigation, baseline identifier and my own artifacts. No repository `AGENTS.md` was found in checked ancestors or `research/`. Shared model family and contract limit the strength of “independent.”

## Independent derivation

Write `z=1−2p`, `r=|c|`, `R_d=sqrt(z²+4d²r²)`. The characteristic polynomial gives eigenvalues `(1±R_d)/2`. Mapping the larger-eigenvalue eigenvector to the ground state and the smaller one to the excited state attains normalized work `(R_d−z)/2`. In code, ascending eigenvector columns `V` give the explicit extraction unitary `U=V[:,::-1].conj().T`.

Loss is `(R_1−R_d)/2`. It vanishes iff `r=0` or `d=1`. Apply the norm triangle inequality to `(z,2dr)+(0,2r(1−d))`. This proves the upper bound. For `r>0,d<1`, triangle equality requires `z=0`, including the zero first vector when `d=0`. Thus upper equality holds iff `r=0`, `d=1`, or `p=1/2`. Nonzero balanced coherence with `d<1` proves sharpness. Degenerate incoherent endpoints need no division.

## Executed evidence

`predeclared.md` records cases, controls and tolerances before checker execution. `check_independent.py` constructs complex density matrices and extraction unitaries with NumPy, checks normalization, positivity, spectra, passive rearrangement, and energy accounting, then compares independently sampled unitaries.

Executed from repository root:

```sh
python research/dephasing-work-bound/panel/verification/check_independent.py > research/dephasing-work-bound/panel/verification/round1-results.json
```

Final exit status **0**. NumPy **2.3.5**. Results: **2,555** states, **5,110** extraction unitaries, **16,800** sampled unitaries, **15,330** gap rescalings. Families include complex phases, incoherent passive/inverted states, pure boundaries, balanced populations, adjacent representable populations/dephasing values, `d=0,1`, and coherence to `1e-150`. All acceptance residuals use normalized energy, absolute tolerance **5e-13**, independently of gaps `1`, `1e-23`, `1e23`. Largest invariant residual was **1.70e-15**; upper-bound violation from rounding was **1.39e-16**. Boundary positivity deviations were at most **8.33e-17**.

The false assertion that every loss equals the upper bound fails by **0.10659** off the equator, while balanced equality survives. Restricting extraction to computational swaps fails by **0.14051** for coherent passive populations. Both controls exceed the predeclared `1e-3` discrimination threshold.

400-digit Decimal diagonalization, explicit rotations and energy evaluation recover a loss approximately **1.92e-300** where float64 matrix subtraction returns zero. Balanced tiny-coherence loss approximately **8e-151** is likewise hidden. Exact binary64 inputs are reconstructed before high-precision comparison. `mpmath` was unavailable in both Python environments, so standard-library Decimal implements the declared high-precision purpose. An initial eigenvector parametrization lost precision through subtraction; choosing the component pair with the larger diagonal gap corrected that verifier defect before this freeze.

## Hash binding and limits

SHA-256:

- Contract: `ed0289dbad37b2059f781d500c7986ef8fde81e7e42f2ef96a08d51b33fb9ee2`
- Predeclaration: `55552a1767ac10afb3b967adb5bd94510d81ed46e5486ab70a3a87d92e0a1808`
- Checker: `27b8d92a37652d7b6756a051d35a6d6d13d02b7c64462ada5a2115881523339d`
- Executed results: `8cab7cf918c89342faffdcbb956579cac5a2252db02af71c6211211309cac272`

Finite samples and hashes do not establish an all-parameter theorem or formal verification. Float64 approximate equality is not algebraic equality; distinctions erased during input conversion cannot be recovered. Producer-code agreement and its numerical stabilization remain unexamined until advisor authorization for Round 2.
