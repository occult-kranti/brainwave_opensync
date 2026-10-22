# Roadmap review — Yang–Mills specialist

Stage: **review**, 2026-10-22. This precedes the advisor's two adaptive planning rounds. No candidate has been implemented or admitted as a new theorem. The earlier two-round mathematics comparison remains unchanged.

**Recommendation:** choose a precise fixed-spacing certificate problem before seeking a continuum result. The three candidates below are genuine open items in the pinned Round33 roadmap; none repeats the already completed named-state convergence or patterned-model dynamics results. I favor the all-size correlation certificate first because its current bound and precise obstruction are already explicit. Route-B quantitative dynamics is the next option; a small-box Wilson-sign lemma is a bounded alternate.

## Baseline and source reading

Read the new `contract.json`, consolidated `math-crosswalk/report.md`, the Yang–Mills rows and executed-test records in `data/crosswalk.json`, and corresponding typed-network entries. The upstream baseline remains `occult-kranti/yang_mills_workbench` main **f9364d617015e803fda9465aefddd9cbe41854a4**, specifically Round33 roadmap, BB2 correlation proof/limitations, BA2 model and Duhamel statements, BC2 model/inheritance/obligation clauses, BC1 gate and AY1 gate. BC2 and the two gates were fetched at that exact revision for this review. This review did not read every AM2/AV1/AX1 proof dependency or rerun their programs.

The paired-physics and Newton skills supply the model/scale/observable freeze, backward premise analysis and negative-control requirements. They are methodological lenses, not external scientist participation. OpenAI215/265/270 readings remain those recorded by the previous comparison: introductions/main theorem clauses plus 215's scope note, not full proof audits or Lean runs.

Two planning corrections matter:

1. The current correlation roadmap says to choose growing r_N so that exp(|Λ_r|/10⁸) stays bounded. **That factor diverges for every r_N→∞.** The tractable target is the combined factor |Λ_r|exp(|Λ_r|/10⁸)q^(N−r), whose decay can dominate its volume growth. A revised plan must correct the wording and preserve the old frozen report.
2. BC2 already inherits the uniform route-B limit dynamics, stationarity and strongly continuous GNS evolution from AX1/AQ1. What remains open is the **quantitative finite-box dynamics comparison and correlation estimate**, not construction of any dynamics from nothing.

## Candidate YM-P1 — an all-size compact-window correlation certificate

**Exact proposed target.** In the unchanged zero-selected patterned SU(2) model at fixed spacing, |τ|≤10⁻⁸, F1/F2 centered constructions, R={0,e_z} and |θ|≤8, derive an explicit ε_N→0 such that

\[
|c_A^{F,N}(\theta)-c_A^\infty(\theta)|\le\|A\|^2\varepsilon_N
\]

for every integer N≥5 and F∈{F1,F2}. Use the admitted BB2 region estimate on the complete support reached by the local dynamics approximant. Preserve the common state, clock and ordering of cutoff and volume limits.

**Unresolved gap.** BB2's frozen r_N=floor((N−1)/2) makes its region exponential dominate eventually; the reviewed O(1/N) rate is admitted only through N=14000, with its displayed bracket vacuous from N=14419. General convergence is already known, so the new result must be an effective all-size certificate, not convergence itself.

**Proposed route, not a proved target.** Pre-freeze r_N=2 for 5≤N<16 and r_N=floor(N^(1/4)) for N≥16, or a justified alternative selected during planning. Re-derive the bound for that radius; do not relabel the old frozen theorem. The candidate slower rate O(N^(−1/4)) is a proposal, not an achieved result. All constants and any all-N inequality require proof and independently checked arithmetic. The quarter-power is an approximation-radius choice, not a new physical parameter.

**Deliverable and decisive control.** A short derivation plus exact/interval evaluation of the finite exceptions and an analytic tail certificate. The old half-box radius is the required negative control: reject an all-N decay claim made from that bracket, while retaining its valid finite range. Replacing the support |Λ_r| by |R| must also fail. A sampled plot cannot certify every N.

**Why feasible now.** The exact formula, constants, local approximation and failure mechanism are already available. The work is a balance of explicit bounds, with no new lattice simulation or physical data. OpenAI215 contributes the same-observable/scale discipline only; no spin-model constant is imported. Family265 reinforces the need to retain region-size dependence, without implying an entropy or Wilson area law.

## Candidate YM-P2 — route-B quantitative finite-box dynamics

**Exact proposed target.** In the uniform route-B model, every face has ν=ατ/24, the selected triple is (τ/24,τ/24,τ/24), Haar reference h_b=8ΣC_e, and the named boxes FB contain whole stars plus all single-factor selected-face groups. At fixed spacing, |τ|≤10⁻⁸, R={0,e_z}, θ=αt/ℏ and |θ|≤8, establish an explicit bound

\[
\sup_{M>N}\|T^{FB,M}_\theta(A)-T^{FB,N}_\theta(A)\|
\le\frac{K_B(\tau)}{N-1}\|A\|,\qquad N\ge2,
\]

with a supported, independently evaluated K_B. The power and constant are proposed deliverables, not admitted before the geometry and integral are checked. A correlation bound for BC2's named state would be a dependent extension, not automatically included in the first milestone.

**Unresolved gap and premises.** BA2 treats the zero-selected model with interaction norm ≤2268|τ|. Route B has ≤2349|τ|, per-site sum 29|τ| and additional bounded single-factor groups. Both the norm and the boundary source ledger must be rebuilt; changing only one coefficient is insufficient. Keep unbounded electric on-site terms in their proved interaction-picture framework. BC2's already accepted static state convergence is a premise, not a new result.

**Deliverable and decisive control.** Freeze the actual FB Hamiltonian, embed smaller boxes in the same tensor-product space, enumerate missing stars and selected-face groups, prove their distances from R, and integrate the applicable Lieb–Robinson estimate. An independent derivation must catch omission of the selected groups and use of the patterned 2268 coefficient. Correct tensor-factor cancellation of exterior on-site evolution is a positive control, not an error to force the checker to reject. A permitted special-model reduction to the patterned case must be labeled separately.

**Why feasible now.** The source gives the interaction-norm input, the finite-box construction, the previous Duhamel route and a defined compact time window. No new continuum analysis is needed. Family270 offers only a reminder to preserve closed operators, domains and norm limits; its threshold theorem supplies no positive gap or dynamics estimate here. A pre-frozen numerical margin can be proposed in planning after reconstructing the source constants; no unsupported numeric target is set in this review.

## Candidate YM-P3 — padded-box Wilson sign at N=2 and N=3

**Exact proposed target.** At τ=+10⁻⁸ in the unchanged zero-selected patterned model, prove that the untruncated F2 ground states of the two specified boxes N=2,3 have positive mean of the original xz Wilson observable W, cover R={0,e_z}. At −τ, use the documented mirror only if applicable; it is not independent replication. Do not bundle finite-box Euclidean nodes into this first question.

**Unresolved gap.** BC1 already certifies the F2 sign for N≥4 and F1 for all N≥2. Its coarse transfer from the limit includes zero for F2 N=2,3. AY1's gate admits a first-order reduced-density remainder for subsequential limits, while the needed box-level reading of AY1 F13–F14 is explicitly ungated. That missing lemma, including cutoff removal at each fixed box, must be checked before any favorable arithmetic is counted.

**Deliverable and sufficient criterion.** Derive a box-specific or box-uniform bound

\[
\|\rho_R^{F2,N}-P_R-\rho_R^{(1)}\|_1\le K_{\mathrm{box}}\tau^2,
\quad \operatorname{Tr}(\rho_R^{(1)}W)=\tau/144.
\]

For ||W||≤1, positivity at the cap is ensured by K_box<1/(144τ)=6,250,000/9. This is an algebraically derived sufficient condition, not a supplied bound. The roadmap's approximately 51.8 sign margin remains a **preview contingent on the ungated box-level lemma**; it is not an acceptance target or result.

**Decisive controls and feasibility.** A remainder widened until the interval includes zero must stop sign certification. Omitting the 616 extra F2 faces at N=2 or 1344 at N=3 must fail the geometry ledger. F1's already certified sign is a positive regression control. Source-level identification of the finite-box vector and fixed-N cutoff removal comes before numerical evaluation; if that step is unavailable, report the obstruction and stop. Only two named finite boxes and one observable are involved; a full Hilbert-space diagonalization is neither necessary nor proposed.

## Grand goal and deferred work

The continuum Yang–Mills goal remains separate. None of these candidates supplies cutoff-uniform estimates on a trajectory with g(a)→0; the τ=96/g⁴ admission obstruction is unchanged. No fraction of a Clay solution is assigned to a finite-lattice milestone.

Uniqueness beyond the named constructions, the complete Z2 AM2/AQ chain and a zero-free-region route to an area law remain deferred. They require additional boundary-class, model-transfer or analytic hypotheses that are not yet frozen. Family215's continuum claim, family265's entropy theorem and family270's threshold state do not close those premises by topic similarity.

Planning should choose one first milestone and one conditional fallback from these candidates, with an explicit stop rule and reviewer, rather than pre-executing every candidate. `candidates.json` provides the exact source links, evidence depth and proposed gates for the advisor's next stage.
