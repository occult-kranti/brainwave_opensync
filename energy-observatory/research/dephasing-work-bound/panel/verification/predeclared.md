# Independent Round 1 predeclaration

Frozen before checker execution or exposure to any producer artifact. Inputs seen: the E1 contract, the verifier skill and its navigation reference, and the baseline commit identifier. No other panel output or implementation has been inspected.

## Construction and expectations

Use `numpy.complex128` to assemble `rho=[[1-p,c],[conj(c),p]]` and its dephased state directly. For ascending eigenvectors `V=(v_minus,v_plus)`, construct `U=V[:,::-1].conj().T`. The expected extracted state is `diag(lambda_plus,lambda_minus)`. Check Hermiticity, trace, positivity, unitarity, preservation of eigenvalues, the passive ordering, and energy before minus energy after. Independent Haar-like sampled unitaries may not beat the passive energy.

Let `z=1-2p` and `R(d)=sqrt(z*z+4*d*d*abs(c)**2)`. The characteristic polynomial gives eigenvalues `(1±R(d))/2`; hence normalized work is `(R(d)-z)/2` and loss is `(R(1)-R(d))/2`. This scalar reconstruction is a cross-check of matrix extraction, not the sole oracle. Monotonicity gives zero loss exactly when `c=0` or `d=1`. The Euclidean norm triangle inequality gives loss at most `abs(c)*(1-d)`; nontrivial equality requires `z=0`. Consequently upper equality holds exactly when `c=0`, `d=1`, or `p=1/2`. The constant one is sharp at `p=1/2`, nonzero coherence, and `d<1`. These are algebraic expectations, not conclusions inferred from tolerances.

## Declared test families

- Endpoints `p=0,1`; passive, balanced and inverted incoherent states; `d=0,1`.
- Balanced coherent states, mixed and pure states, full phase rotation, and generic non-balanced coherent states.
- Pure-state boundary and the nearest floating-point value below the maximum admissible coherence.
- Near-balanced populations, adjacent representable values around `1/2`, coherence down to `1e-150`, and `d=nextafter(1,0)`.
- Seeded random admissible density matrices, with independently sampled unitary controls.
- Positive gaps `epsilon=1,1e-23,1e23`; all acceptance errors are normalized by epsilon before comparison.

Matrix invariants and normalized work/inequality residuals use absolute tolerance `5e-13`; no theorem equality is inferred from this tolerance. Very small positive gaps are separately reconstructed with 400-digit Hermitian eigendecomposition, including a case where float64 subtraction reports zero.

## Discriminating controls

The plausible substitution “loss always equals `abs(c)*(1-d)`” must fail off the equator, while preserving its legitimate balanced-state equality. A computational-basis-swap-only operation class must fail to reproduce arbitrary-unitary work for a coherent passive-population state. Both controls require a residual above `1e-3`, vastly above the acceptance tolerance.
