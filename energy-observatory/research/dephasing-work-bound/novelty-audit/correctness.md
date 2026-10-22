# E1 correctness audit — 2026-10-22

## Verdict and scope

**The E1 formula, loss inequalities, complete equality conditions and sharp constant are mathematically correct under the declared model.** This is an independent rereading and rederivation of the existing proof, with a fresh execution of its implementation checks. It is not formal proof-assistant verification, an experiment, or evidence of priority.

Audited source commit: `2bf9252f17f38db500b1e920612ddb43565c4fe7`.

Read directly: `AGENTS.md`, the E1 contract, the full E1 proof, `src/dephasing-bound.mjs`, the release-checker source and replay output. No frozen source or receipt was modified.

## Independent mathematical rederivation

Let the admissible state be rho = [[1-p,c],[c*,p]], with r=|c|, z=1-2p, r²≤p(1-p), and let rho_d have coherence dc for 0≤d≤1. The characteristic polynomial gives eigenvalues

lambda_plus/minus = (1 ± sqrt(z²+4d²r²))/2.

The state remains positive because multiplication by d cannot enlarge the determinant's negative coherence term. Its trace and mean energy remain 1 and epsilon*p respectively. For any unitary U, the final energy is epsilon times a Rayleigh quotient of rho_d and therefore is at least epsilon*lambda_minus. Mapping the largest-eigenvalue eigenvector to the ground state attains this minimum. Consequently

W(d) = epsilon*(sqrt(z²+4d²r²)-z)/2.

This establishes optimality over the entire stated unitary class; sampling unitaries is unnecessary for that proof. The explicit eigenvectors and unitary written in the existing proof have the correct complex-conjugate phases and diagonalize the state in passive order.

For an alternative proof of the upper bound, let F(t)=sqrt(z²+4r²t²). When z≠0 and r>0,

0 ≤ F'(t)=4r²t/F(t) < 2r for 0≤t≤1.

Integrating from d to 1 proves 0≤L<epsilon*r*(1-d) whenever r>0, d<1 and z≠0. If z=0, F(t)=2rt and the upper equality is exact, including d=0. If r=0 or d=1 both sides vanish. Thus upper equality holds exactly when r=0, d=1, or p=1/2. Since p=1/2 permits any 0<r≤1/2, the constant 1 is sharp.

For the lower equality, F(1)²-F(d)²=4r²(1-d²), so equality holds exactly when r=0 or d=1. The restriction d∈[0,1] is used here. All formulas cover the diagonal endpoints: p=0 forces r=0 and W=0; p=1 forces r=0 and W=epsilon. At full dephasing, W(0)=epsilon*max(0,2p-1). At p=1/2,r=0 the state is maximally mixed and every unitary has the same zero extractable work.

## Fresh executable verification

Executed from `energy-observatory/`:

```sh
python3 -B research/dephasing-work-bound/check_release.py --output /tmp/e1-novelty-replay.json
```

The command exited 0 and reported **PASS**. A copy of that exact output is `replay.json` beside this report. The checker verified all 95 recorded source hashes and the presence/integrity requirements for the 18 panel reports, then executed six groups on a temporary source copy: producer, independent matrix checks, producer comparison, skeptic, physical interpretation, and UI boundary checks.

Selected evidence actually reproduced:

- Independent matrix checks: 2,555 states, 5,110 extraction unitaries, 16,800 sampled unitaries and 15,330 energy-gap rescalings.
- Producer comparison: 3,780 exactly admitted matrix cases; maximum normalized matrix/producer error 2.93839617399499e-16 against a 5e-13 absolute tolerance.
- 315 exact boundary-helper checks; rejection of 600 inadmissible original API pairs and 17 invalid cases. The 714 recorded rounding repairs belong to constructing admitted comparisons, not silent evaluator repair.
- Eight high-precision producer comparisons, plus independent skeptic controls, including a known wrong dephasing model that fails the asserted bound.
- 14 physical-meaning checks and seven UI boundary checks.

Audited proof SHA-256: `f03a826adc11b734c5a7955dc11c4ebc6967529d96fcd3f3cc8f97ef85de0ccb`.

Audited scientific module SHA-256: `05b2ad552c3bb0c1812dd3553163a59f28bc77b9bc55861c96d673fd85afb78b`.

## Significance and limits

The mathematical content is a tight sensitivity statement: under this pure-dephasing channel, the reduction in ideally accessible average work is at most epsilon times the decrease in coherence magnitude. Balanced populations saturate it; elsewhere the exact closed formula usually gives a stricter value. It can be useful as a benchmark for implementations and controlled qubit experiments. This audit alone does not establish that the statement or its equality cases are historically new.

Mean state energy does not decrease during the dephasing in this model. The loss concerns accessibility of already stored energy; it is not energy emitted by dephasing and does not yield an energy source. An extraction apparatus, coherent control/reference, preparation, reset, finite control time, dissipation and control energy costs are outside the theorem. An arbitrary cyclic unitary is an ideal admissible operation, not a demonstrated implementation. W is an optimized expectation-value decrease, not a guarantee of deterministic single-shot work.

The model specifies one two-level system and fixed populations. It supplies no conclusion about a copper ball's complete spectrum, acoustic energy harvesting, Yang–Mills mass gaps, or net energy generation. Changing populations, Hamiltonians or the admissible controls requires a new statement.

The all-parameter result is supported by algebra; finite numerical samples cannot establish it. The calculator's clipped loss ratio cannot independently verify its own inequality. Replayed matrix and high-precision checks provide separate implementation evidence, but no global floating-point error guarantee. Exact positivity admission refers to supplied binary64 inputs; it is not an error bound on experimental state estimation. Subnormal arithmetic can have poor relative accuracy (the retained skeptic example exhibits about 2.93%); range flags must not be read as accuracy certificates or exact-equality witnesses.
