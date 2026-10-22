# Seat 3 — Round 3: independent modal and integration verification

**Admission:** the actual integrated `src/modal-diagnostics.mjs` passes this independent finite numerical review. Its three-coordinate grounded point spring and legacy diagonal toy remain separate models. The inspected labels preserve synthetic-data, selected-mode and attribution limits. No physical sphere/contact calibration, unique-location inference or full-domain interval proof is established.

This is cross-review of seat 2's implemented module, not independent execution of my own design module. The numerical reference was freshly implemented with direct SciPy radial stress roots, numerical volume quadrature and a generalized symmetric eigensolver. It does not copy the producer's trigonometric root residual, analytic Bessel mass integral or Jacobi rotations. Both implementations necessarily share the declared finite physical premises; numerical agreement is not independent empirical evidence.

## Executed independent reconstruction

For radial displacement `u(r)=j1(x*r/R)/j1(x)`, the reference solves the surface-stress equation

`x*j1'(x)+2*lambda/(lambda+2*mu)*j1(x)=0`

using `scipy.special.spherical_jn(..., derivative=True)` and `brentq` on three positive-root intervals. It then evaluates

`m_n=4*pi*rho*R^3 * integral_0^1 [j1(x_n*y)/j1(x_n)]^2*y^2 dy`

by adaptive quadrature. With these independently reconstructed masses and natural frequencies, `scipy.linalg.eigh(K0+k*ones((3,3)),diag(m_n))` supplies the comparison spectrum. Producer eigenvectors are checked against these reconstructed original-coordinate M and K, rather than accepting the producer's own residual flag.

The **794-case finite grid** spans seven Poisson ratios `[-.9,-.5,0,.3,.35,.45,.49]`, four radii `[1e-5,.0125,.04445,1] m`, five modulus/density pairs including domain extremes, and relative contact levels `[0,1e-8,.001,.1,1,99]` capped at the absolute `1e12 N/m` limit, with duplicate capped points removed. Six explicit default/Position-size cases use k=0, 1e8 and 1e10 N/m. This is a parameter stress grid, not proof over the continuous domain.

| Independent check | Maximum error across executed grid |
|---|---:|
| Free natural frequency, relative | 4.23e-14 |
| Surface-normalized modal mass, relative | 9.84e-14 |
| Coupled natural frequency, relative | 4.41e-14 |
| Original-coordinate generalized eigenpair residual | 8.57e-15 |
| Mass-inner-product orthogonality error | 9.86e-14 |
| Trace identity, relative | 1.50e-14 |

The generalized residual is `||Ku-lambda*Mu||/(||K||F*||u||+|lambda|*||Mu||)`. The maximum producer-reported symmetric residual was 2.22e-15, below its 2e-12 threshold. At most nine Jacobi rotations were used in this grid. These are binary64 numerical checks; quadrature error estimates are not rigorous enclosures.

The root domain endpoints `nu=-.9,.49` remain positive/resolved in the executed cases. Negative contact, a wrong-unit `radiusMm` key, `nu=.5` and excessive relative contact were actually rejected. A separate relative-bound control accepts ratios 99 and 100 and rejects 101 for a specimen whose absolute cap permits that comparison. No-argument defaults match the independently reconstructed explicit defaults: R=.04445 m, k=1e8 N/m, total mass 3.29618755155 kg, and modal masses `[3.71880692070,4.69202747026,4.83527334171] kg`.

## Cross terms and the misleading diagonal substitution

Every contact-stiffness entry is k; the contact energy is exactly `k*(q1+q2+q3)^2/2`. The direction `(1,-1,0)` has zero contact contribution while the full free-plus-contact energy remains positive. Removing off-diagonal terms changes this finite model, even if the masses are kept correct.

For R=.0125 m and the reference copper constants:

| k / N/m | Full point-contact first / Hz | Full minus correct-mass diagonal / Hz | Full minus legacy whole-mass diagonal / Hz |
|---:|---:|---:|---:|
| 1e8 | 166642.945123 | -0.028462 | -11.810679 |
| 1e10 | 175236.816154 | -268.384183 | -1383.607248 |

The first column follows the complete generalized eigenproblem. The second comparison isolates the off-diagonal terms; the third also changes modal-mass normalization. Their agreement only in a weak-limit approximation would not make the models interchangeable. At zero contact the reference returns the free spectrum up to numerical rounding.

The finite spring does not model finite-area/Hertzian/nonlinear contact, rigid motion, nonradial modes, anisotropy, damping, a real fixture or sensor loading. A real point contact can couple omitted families. Ratio changes reject only specified common-scale alternatives; they do not identify contact or an absolute location. Source/readout participation alone leaves correctly matched natural-frequency ratios unchanged, while visible peaks or an invalid estimator can change.

## Integration labels and adversarial state inspection

Inspected `models.html`, the modal rendering in `src/app.mjs`, acquisition state transitions and `src/run-export.mjs`:

- Models are labeled simulated; plotted m/N responses are distinguished from calibrated hardware records. The three-mode reference is explicitly a solid sphere using the applied radius even when the main model is a shell. The grounded spring is distinguished from the dynamic fixture.
- The UI states that no pole fitting is performed. Contact ratios are not labelled a unique attribution or location result. The legacy independent-spring display is explicitly a separate teaching model.
- A scope sentence originally said “contact effects omitted” despite including an ideal point spring. Seat 6 corrected it to finite-area/nonlinear contact and real-fixture calibration limits. The module's fuller limits already made this distinction.
- Mechanical and acquisition exports use applied/validated snapshots and generation guards. Raw CSV is bundled with its JSON provenance and file hashes. Invalid acquisition inputs block exports while retaining the old chart as reference. An invalid uncertainty budget is explicitly labelled unadopted with null result, not silently passed as a valid interval. The acquisition bridge uses only intrinsic mode A as a lightly damped synthetic approximation, not a measured response or complete transient model.

I identified two storage edge cases by adversarial code inspection and alerted root/seat 6: a failed dirty/invalid localStorage write could leave an older valid bridge record even though the toast said transfer was disabled, and an absent/malformed runId could throw in the bridge display. Seat 6 added a per-tab failure marker/stale-record invalidation attempt and a 64-hex runId guard. I read the repaired code; seat 6 separately executed the forced-storage-failure/corrupt-identity browser controls. Those browser tests are seat 6's evidence, not mine. I did not conduct a separate browser or deployment audit.

## Reverse feedback on my Round 2 contribution

Seat 2 independently found that my broad `abs(sin)<1e-14` zeroing changed nearby nonnodes into exact nodes, contradicting the structural-rank interpretation. Root authorized a narrow repair: zero only the canonical represented sine nodes, retain all other values, add near-node controls and clarify column scaling versus noisy detectability. The corrected module passes nine same-author targeted tests. Seat 2 independently checked the updated bytes against 210 NumPy O/K rank comparisons and original-coordinate kernels, and separately reviewed the nuisance design and global aliases. My tests are not counted as independent validation of that repair.

Corrected design module SHA256: `3661b2aa99cd6e1f0292543fde54a30bae7652378bc5f85972a8b541d58daccb`. Corrected design document SHA256: `81fa971d099a59a1913f48dabd04679ec4925a67aeb8b043af43721d2525bc3f`.

## Reproduction and portability

The original independent workspace verifier and receipt are preserved unchanged under `research/panel/independent/inverse/` as `round3-independent-modal.py` and `round3-independent-results.json`. The original verifier's `--root` assumes the recorded two-checkout workspace layout. Its receipt includes exact compared-source SHA256 values and all 794 finite cases.

A **path-only portability copy**, `scripts/verify_modal_independent.py`, accepts `--app-root` (default: the app containing its `scripts` directory). The SciPy algorithms, cases, thresholds and controls are unchanged. From an extracted source package, with its NumPy/SciPy dependencies installed:

```sh
python scripts/verify_modal_independent.py --output /tmp/copper-modal-review.json
```

From another directory:

```sh
python /path/to/copper-experiment/scripts/verify_modal_independent.py --app-root /path/to/copper-experiment --output /tmp/copper-modal-review.json
```

The portable copy was executed once against the current app into a fresh temporary directory. It reproduced **exactly 794 cases**, with all numeric case results, reference cases, maxima, invalid controls and default/bound controls identical to the preserved receipt. This is algorithmic reproduction for path wiring, not a second independent derivation. The portability receipt records this distinction.

The finite numerical and stated UI contracts are admitted within their declared scope. Physical data, a justified noisy inverse fit, independent apparatus replication and any absolute-location law remain absent. No scientific novelty is claimed.
