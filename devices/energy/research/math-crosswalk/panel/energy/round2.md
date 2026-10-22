# Energy specialist — round 2

**Result:** The isolated thermal-qubit demonstrator passed its frozen 5,184-case check. Every modeled battery energy gain is balanced by reservoir energy loss. All three deliberately wrong interpretations were rejected. The accepted zero-temperature calculator remains byte-for-byte unchanged.

This is an implementation and finite numerical check of known quantum-channel accounting. It does not solve the OpenAI family-276 capacity problem, establish a new energy source, estimate a complete device's efficiency, or report hardware measurements.

## What changed after round 1

The advisor selected the strongest usable overlap: generalized amplitude damping extends the channel already used by our ergotropy calculator. The new `thermal-channel.mjs` remains isolated in this panel directory. It introduces the bath's stationary **excited-state** population, complex initial phase, signed reservoir exchange, and a conditional entropy-production calculation. It preserves the distinction between stored energy, passive energy and ergotropy.

`round2-inputs.json` was saved before the first execution. Its SHA-256 is `75aa4c7b213d2986f6cf0410829c0774adc4013d27dae5957afd09d2824b6a15`. Its Cartesian grid contains six initial populations, three coherence fractions, four damping values, six bath populations, three dephasing values and four complex phases. The energy gap is fixed at the exact SI Planck constant times 5 GHz. Ten invalid parameter cases are also rejected. The grid includes endpoints, ordinary thermal states and deliberately inverted resources.

The scalar JavaScript model and its Python checker have the **same author**. The checker is a distinct mathematical formulation, not independent panel review. Separate reviewers were given code hashes and the API after freezing their own small sets of cases. The skeptic has completed six such cases against the frozen implementation: maximum expected-value error was 1.11e-16 in gap-normalized units, with separate Hermitian eigenvalue, trace/positivity, opposite heat-sign and inverted-resource checks. This is separate-agent review of those six cases, not external human peer review or verification of the full numerical domain. Its precise acceptance and bound hashes are in `../skeptic/cross-review-results.json`.

## Analytic statements and conditions

The basis is ground state first, excited state second, with \(H=\operatorname{diag}(0,\epsilon)\), \(\epsilon=hf>0\). Let

\[
\rho=\begin{pmatrix}1-p&c\\c^*&p\end{pmatrix},\quad
c=\kappa\sqrt{p(1-p)}e^{i\phi},\quad
0\le p,\kappa,\gamma,d,\nu\le1.
\]

Generalized damping followed by energy-basis dephasing gives

\[
p'=(1-\gamma)p+\gamma\nu,\qquad
c'=d\sqrt{1-\gamma}\,c,
\]

and therefore, for this fixed Hamiltonian,

\[
E'-E=\epsilon\gamma(\nu-p)=Q_{B\to S},\qquad Q_{S\to B}=-Q_{B\to S}.
\]

The model uses a nonnegative expression for the output determinant to avoid cancellation near pure states:

\[
\det\rho'=\gamma\nu(1-\nu)+\gamma(1-\gamma)(p-\nu)^2
 +(1-\gamma)p(1-p)(1-d^2\kappa^2).
\]

For eigenvalues \(\lambda_-\le\lambda_+\), passive energy is \(\epsilon\lambda_-\), so ideal ergotropy is \(E-\epsilon\lambda_-\). A diagonal thermal state with \(\nu\le1/2\) has zero ergotropy, even when its energy is positive. A diagonal inverted state with \(\nu>1/2\) has ergotropy \(\epsilon(2\nu-1)\); its preparation is a resource.

For \(0<\nu<1\), set \(\tau=\operatorname{diag}(1-\nu,\nu)\) and \(\beta\epsilon=\log[(1-\nu)/\nu]\). Both damping and energy-basis dephasing preserve \(\tau\). The identity

\[
\Sigma=S(\rho')-S(\rho)-\beta Q_{B\to S}
       =D(\rho\|\tau)-D(\rho'\|\tau)
\]

relates the computed expression to relative-entropy contraction under the composed completely positive trace-preserving map. Nonnegativity uses the established data-processing theorem, not a theorem inferred from the grid; see [Lindblad (1975)](https://link.springer.com/article/10.1007/BF01609396), whose publisher abstract and metadata were checked. The full proof of that external result was not re-audited here.

For an ordinary positive-temperature bath, \(0<\nu<1/2\) and \(\beta=1/(k_BT)>0\). The endpoint \(\nu=1/2\) is the infinite-temperature limit. For \(\nu>1/2\), the algebra remains valid with negative \(\beta\), but the reservoir is labeled **population-inverted resource**, not an ordinary positive-temperature bath. At \(\nu=0,1\), the stationary reference is rank deficient, so the finite-logarithm entropy expression is deliberately left unevaluated. The optional dephasing is energy-neutral only for the fixed energy-basis model; implementing it is not assumed costless.

## What was computed

The checker constructs all four complex Kraus operators, applies a separate I/Z dephasing channel and uses NumPy's Hermitian eigensolver. It also prepares an explicit equal-gap bath qubit in \(\tau\), rotates the joint one-excitation subspace, traces each subsystem, and directly measures both energy changes. This unitary commutes with the total uncoupled Hamiltonian. It supplies an explicit energy-conserving realization of the ideal channel; bath replenishment and real interaction switching are outside the apparatus boundary.

| Check | Cases or result |
|---|---:|
| Frozen parameter combinations | 5,184 |
| Compatibility with accepted calculator at \(\nu=0\) | 864 |
| Full-rank reference entropy checks | 3,456 |
| Ordinary-bath / inverted-reference entropy checks | 2,592 / 864 |
| Ordinary diagonal fixed-point passivity checks | 192 |
| Inverted fixed-point work checks | 96 |
| Phase-invariant energy, work and entropy comparisons | 3,888 |
| Maximum discrepancy across reported numerical checks | \(5.11\times10^{-15}\) |
| Maximum joint energy closure error, in gap units | \(3.33\times10^{-16}\) |
| Maximum compatibility error, in gap units | \(3.33\times10^{-16}\) |
| Absolute numerical tolerance | \(2\times10^{-12}\) |

The smallest computed entropy production was approximately \(-4.49\times10^{-15}\) nats for ordinary baths and \(-4.11\times10^{-15}\) for inversion. Those are floating-point residuals within the frozen tolerance, not evidence of negative physical entropy production.

The wrong-model controls have large discriminating margins:

| Deliberately wrong interpretation | Detected error, divided by \(\epsilon\) |
|---|---:|
| Omit bath input when a ground-state qubit warms | 0.125 |
| Equate a passive thermal state's stored energy with extractable work | 0.25 |
| Keep the old zero-temperature loss formula after allowing bath excitation | 0.125 |

The corrected models close the relevant energy or passivity condition within numerical tolerance. Thus an apparent gain in the first example is explained by an explicitly modeled input, and the second example demonstrates why energy and usable work cannot be interchanged.

## Replay and bindings

From the repository root:

```sh
python energy-observatory/research/math-crosswalk/panel/energy/check-thermal.py
```

Runtime requirements are Node.js and Python with NumPy. Versions used are recorded in `round2-results.json`. The script replays the deterministic grid, checks the accepted source hash and writes the compact result summary. Detailed records are regenerated in memory; their serialized digest is recorded in the result.

| Artifact | SHA-256 |
|---|---|
| `thermal-channel.mjs` | `cc3a6011d89ab2ad2904d216064a32e4af26bec56c54fd1718244165012727be` |
| `emit-thermal-grid.mjs` | `f5b444ce48729271bd410a9bccf5ab2eb159cd146578245973415f270c22d130` |
| `check-thermal.py` | `86278cc285bfbe5421b3065ec2215fa01d84f76b4cdfdbb558cff215217025a5` |
| `round2-results.json` | `ab05013a7ee420683a504706b104f71db6f568ed1ad5ebcdb5be9868485004de` |
| Unchanged `src/quantum.mjs` | `ec9320c28560f80b11e65cb6eb1e08f43bed68ffdf3fd97efacd7109b2cc7b91` |

The importable API is `thermalQubitWork({frequencyHz, population, coherence, phaseRadians, damping, dephasing, bathPopulation})`. Its result contains initial/final density matrices, energy, passive energy, ergotropy, entropy, signed heat into each subsystem, closure residual, bath-resource classification, and a nullable entropy-production value. `apparatusEfficiency` remains `null`.

The remaining physical work is calibration, preparation/control/reset accounting and an actual experiment. The mathematical work is independently checking any specific external theorem before using its conclusion. This two-round panel does not open a third research loop.
