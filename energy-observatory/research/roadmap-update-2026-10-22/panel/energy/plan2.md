# Energy final planning round

**Status:** bounded attempt specified; no implementation or experiment. E1 precedes E2. Established theory is being applied, with no novelty, capacity-theorem or hardware-efficiency claim.

**Objection → revision.** Plan1's joint reset exceeded its 8×8 matrix cap. Choose a **16×16 joint swap**, raise only that dimensional cap, and preserve the 16-agent-hour, five-CPU-minute and 512-MiB limits. This simpler construction retains the complete used-reservoir state rather than tracing away its internal correlations.

**E1 target and endpoints.** For ε>0, p,d∈[0,1] and |c|²≤p(1−p), prove the planned bound 0≤W(1)−W(d)≤ε|c|(1−d). Lower equality occurs exactly when c=0 or d=1. Upper equality occurs when c=0, d=1 or p=1/2. At p=0,1, positivity forces c=0. At p=1/2,d=0, use the explicit absolute-value branch, not division by a vanishing Bloch length. The proof and independent direct-unitary examples must reject W=E for a passive diagonal state. Numerical samples cannot replace the continuum proof.

**E2 exact construction.** Let X=S⊗B be four-dimensional, H_X=H_S+H_B with equal gaps ε, 0<ν<1/2, βε=log[(1−ν)/ν], and τ_X=τ⊗τ. Use d=1 throughout.

1. Start X in τ_X. Restrict MVP preparation to ρ=U(θ,φ)τU† on S; arbitrary mixed-state preparation and attainability are deferred. This four-dimensional operation has explicit simulated work.
2. Apply the existing four-dimensional energy-conserving excitation exchange, then a four-dimensional local extraction unitary. Retain the complete pre-reset state ω_X.
3. Supply a four-dimensional reference R in τ_X, initially uncorrelated. Apply SWAP_XR on dimension16, with identical endpoint Hamiltonians and zero endpoint interactions. The result is τ_X⊗ω_R. Device X closes; the used reservoir R retains ω_X, including its internal correlations.

The ideal swap commutes with total H and has simulated W_on=0; this is **not** a claim of costless physical switching or reservoir regeneration. Record its opposite signed energy transfers, entropy changes and signed lower bound W_reset,on≥F(τ_X)−F(ω_X). Preserve the reservoir output; prohibit reuse or an apparatus-closure claim without a regeneration/control model.

First prove the previously planned operation identity β(W_on−ΔF_X)=D(bath′∥Gibbs)+I′ under its initial-product/unitary/endpoint assumptions. For this constructive MVP, target the stronger accounting identity W_cycle,on=D(ω_X∥τ_X)/β≥0. Preparation, exchange and extraction preserve joint entropy; the swap closes X. Ideal classical drives are assumptions, not verified controller resource closure. Bounds, simulated work and measured cost remain distinct fields.

**Decisive control and tolerances.** Compare diag(1−ν,0,0,ν) with τ⊗τ: marginal energies agree, but trace distance is 2ν(1−ν) and correlation free energy is h(ν)/β. A marginal/energy-only reset gate must fail. Exercise this directly on the state-closure function; the rank-two fixture is not claimed reachable from the MVP full-rank unitary orbit. Freeze separate thresholds: joint trace distance≤10⁻¹², state trace/positivity error≤10⁻¹², system–reference mutual information≤10⁻¹² nats, and energy residual/ε≤10⁻¹². None substitutes for another. Retain omitted-reset, inverted/second-temperature and lower-bound-as-measured-cost controls.

**Remaining acceptance.** Future `research/thermal-cycle-v1/` artifacts remain as in Plan1. Freeze at most54 producer cases and independent reviewer cases before execution. Methods reviews operators/entropy; skeptic reviews premises and closure. Caps remain E1:3, E2:10, review:3 agent-hours. Stop on unresolved proof, missing ports, failed independent controls or cap exhaustion. Record an obstruction; do not enlarge the scope. REVIEW and Plan1 remain preserved; this finishes planning.
