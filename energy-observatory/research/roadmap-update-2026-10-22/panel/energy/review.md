# Energy roadmap review

**Recommendation:** prioritize a bounded full-cycle resource ledger; use the exact dephasing/work-loss lemma as a small supporting result. Keep a thermal-Gaussian beam-splitter example optional. These are tractable applications and tests of known theory, not proposed solutions of OpenAI capacity/EPnI theorems or evidence for source-free energy.

Stage: **review only**, 22 October 2026. No new model code, simulation or physical experiment has been executed. Await the advisor's first planning-round selection. This review preserves `research/math-crosswalk` unchanged and uses the Tesla-mechanism-resonance and resonance-research-advisor skills.

I read the consolidated comparison report and the independent three-case thermal cross-check. The baseline already has 5,184 producer cases, a separate six-case skeptic review and a three-case/63-comparison second review. That supports the ideal thermal-channel arithmetic within those scopes. It does not supply preparation, bath-reset, interaction-switching or wall-plug costs. The full-cycle gap is therefore the most useful next target.

## Three bounded candidates

| ID | Proposed deliverable | Why it is tractable now | Physical result still unavailable |
|---|---|---|---|
| E2 — first priority | Conditional single-temperature cycle certificate and a joint-state energy/entropy/free-energy ledger | At most 4×4 matrices; the existing explicit qubit–bath dilation supplies the exchange step | Actual preparation, controls, refrigeration, reset and measurement costs |
| E1 — supporting result | All-parameter dephasing/work-loss inequality, with endpoint cases and a small independent operator check | Closed-form 2×2 state spectrum | How much work the laboratory's restricted controls actually extract |
| E3 — optional | Independent thermal bosonic inputs through a beam splitter; correlated-input countercontrol | Closed-form 4×4 Gaussian covariance model; no generic infinite-dimensional theorem required | Calibrated optical mode covariances/powers and an actual quantum entropy measurement |

### E2: close a declared single-temperature cycle

The prior calculation has a signed one-use heat ledger, but tracing out the bath removes correlations relevant to resetting it. A stronger plan must define the endpoints and all auxiliary resources first.

The proposed core is a finite-dimensional nonequilibrium free-energy bound. For a fixed Hamiltonian, one full-rank positive-temperature Gibbs state \(\tau\), and an explicitly Gibbs-preserving channel \(\Phi\), target

\[
\mathcal W_{\rm erg}(\Phi(\rho))
\le F_\beta(\rho)-F_\beta(\tau)
\le W_{\rm preparation,on}.
\]

This is a necessary average-work bound. It is not a promise that the preparation bound is attainable in a finite-copy device. The proof would use relative-entropy contraction and Gibbs free-energy minimization, then distinguish the mathematical inequality from physical costs.

The smallest useful cycle is preparation → the existing equal-gap two-qubit exchange → local extraction → joint reset. Start with no added dephasing, so its environment is not silently omitted. The cycle ledger must retain the joint state, because at noninteracting endpoints

\[
F(\omega_{SB})=F(\omega_S)+F(\omega_B)+k_BT I(S:B).
\]

Resetting marginal states is not sufficient to establish that the correlated joint state has returned to the starting point. The reset step needs signed work bounds and explicit heat/entropy exchange; a reset bound can be negative if remaining free energy is recoverable. Do not replace that nuance with a universally positive “reset fee,” and do not omit reset or declare its physical implementation free.

Acceptance would require an analytic telescoping cycle bound, frozen independent finite examples and explicit abstention for an incomplete ledger. Wrong controls would omit bath restoration, erase correlations by substituting a product state, or import an inverted/second-temperature reservoir while claiming the single ordinary-bath assumptions. All phase references, controllers and measurement records must either return to their initial uncorrelated states or have their resource changes recorded.

A conditional mathematical ledger is feasible in one to two focused days. A complete apparatus-efficiency result is not available without a calibrated experiment; the software should say “incomplete ledger” rather than invent its costs.

### E1: quantify work accessibility lost under dephasing

For fixed post-damping population \(p_*\), coherence magnitude \(|c_*|\), and energy gap \(\epsilon>0\), energy-basis dephasing retains a fraction \(d\in[0,1]\) of the coherence. The proposed lemma targets

\[
0\le \mathcal W(1)-\mathcal W(d)
\le \epsilon |c_*|(1-d),
\]

using the exact qubit spectrum. It must state the equality cases and explicitly handle zero coherence and the degenerate point \(p_*=1/2,d=0\). The claim concerns a dephasing step at fixed population, not the complete damping map, which can exchange energy with the bath.

The acceptance proof is algebraic over the full parameter domain. A small separately chosen numerical set checks extraction unitaries and eigenvalues; it does not become the proof. Discriminating mistakes are “stored energy equals extractable work,” a derivative formula that divides by the zero Bloch length, and incorrectly assuming that damping preserves population. This should take roughly half a focused day.

A future experimental protocol would compare calibrated state tomography and extraction under controlled dephasing while matching population. It must measure control costs separately. No quantum hardware access or measurements are presumed in this plan.

### E3: build one honest bosonic bridge

OpenAI family 273 assumes independent bosonic inputs. The repository currently has no bosonic model. A restricted thermal-Gaussian example is useful only if its scope stays explicit.

For independent same-frequency thermal inputs with finite means \(N_A,N_B\), the beam splitter should give

\[
N_C=\eta N_A+(1-\eta)N_B,\quad
N_D=(1-\eta)N_A+\eta N_B.
\]

Thermal output marginals give the equality case of the entropy-photon-number formula, and total photon energy is conserved. The proposed covariance checker would also enforce the uncertainty relation and the symplectic transformation. It would not adopt the unreviewed general EPnI proof or claim a channel capacity.

A strong planned wrong control uses a correlated coherent-state mixture with amplitudes \(\alpha\) and \(-\alpha\), where \(\alpha\) is complex Gaussian. Both input marginals are thermal with mean \(N>0\), yet a balanced sum port is vacuum while the other port carries mean \(2N\). The product-input right-hand side would be \(N\). That apparent violation diagnoses the omitted independence premise; energy remains in the other output.

This could be a one-day covariance/proof exercise after E2. A later optical protocol needs calibrated powers and covariances. Correlated RF-noise cancellation can illustrate classical port accounting but cannot be relabeled a quantum entropy experiment. Different-frequency conversion would introduce a pump/work port and is outside this passive certificate.

## Source and admission boundaries

Exact pinned URLs and reading depth are in `candidates.json`. Family 276 supplies the shared channel map; its capacity target is different from these work questions. Family 273 supplies the product-input premise; the proposed Gaussian special case would be derived directly. Their full proofs have not been independently audited here.

The 2025 coherent-ergotropy experiment motivates E1; its published control-cost metric is not complete device electricity. The 2026 generalized multilevel damping preprint motivates E2, but only its abstract/metadata were read and no detailed claims are imported. The 2026 microcavity-battery experiment explicitly converts incident optical energy and illustrates a resource input. The 1975 relative-entropy contraction result supplies an established mathematical tool; its publisher abstract/metadata were checked, not its whole proof re-audited.

The two planning rounds should freeze the selected statement, assumptions, bounds and wrong controls before any new implementation. The most valuable outcome is a small conditional certificate with clearly identified missing measurements, not a larger claim with an incomplete resource boundary.
