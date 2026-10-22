# E1 completed: qubit dephasing work-loss bound

Selected E1 because its finite-dimensional state space, explicit operation class and short all-parameter proof made it the smallest readily verifiable mathematical task in the roadmap. Six model-agent roles completed three adaptive rounds, with two dedicated workers for proof and independent verification. The root coordinated admissions. No human peer review, Anthropic-agent execution or historical-scientist participation is implied. Project: Hruday N M / BUNZEEY.

## Accepted result

For H=diag(0,ε), ε>0, a valid qubit ρ=[[1−p,c],[c*,p]], and energy-basis dephasing c→dc with d∈[0,1] at unchanged p,

**0 ≤ W(1)−W(d) ≤ ε|c|(1−d).**

W is maximum ideal extractable work over all single-qubit unitaries with cyclic control Hamiltonian endpoints. With R_d=√((1−2p)²+4d²|c|²), spectral minimization gives W(d)=ε(R_d−(1−2p))/2. An eigenbasis unitary attains the minimum energy. The triangle inequality proves the upper bound; radius monotonicity proves the lower bound.

- Lower equality holds exactly when c=0 or d=1.
- Upper equality holds exactly when c=0, d=1 or p=1/2.
- Balanced coherent states with d<1 make the coefficient sharp.
- Degenerate spectra, complete dephasing and population endpoints are included without undefined divisions.

The [complete proof](proof.md) distinguishes established ergotropy/passive-ordering theory and the known qubit coherent-ergotropy formula from our local corollary and implementation assurance. See Allahverdyan–Balian–Nieuwenhuizen (2004), pp.1–2 Eqs.(2),(5)–(9), and Francica et al. (2020), Eqs.(4),(5),(12), linked there. Novelty is unverified. OpenAI family 276 supplies related channel context; its capacity theorem is not an ergotropy theorem or this proof.

## What verification established

| Evidence | Executed scope |
|---|---|
| Independent reconstruction | 2,555 states, 5,110 extraction unitaries, 16,800 sampled unitaries |
| Implementation comparison | 3,780 complex-state cases; largest normalized discrepancy 2.94×10⁻¹⁶ |
| Exact input checks | 315 sampled greatest-admissible boundaries; 600 invalid rounded pairs and 17 invalid-domain cases rejected |
| Precision checks | Eight 800-digit operator comparisons; additional skeptic spectral checks |
| Wrong-model discriminator | Exact complex-state control yields loss 9/20; replacing d by d² gives 9/16 and exceeds the declared bound by 9/80 |
| Physical meaning | 14 controls distinguish energy, ideal work, heat interpretation and phase-specific controls |
| Interface regressions | Seven physical-interface and six skeptical conversion checks; desktop/mobile browser behavior |

These are finite computational checks. The algebra supplies the all-parameter claim. Normalized matrix tolerance was 5×10⁻¹³; high-precision normal-output comparison used relative tolerance 2×10⁻¹⁴. Subnormal checks use absolute tolerances, with no reliable-relative-digits claim. One subnormal case exhibited 2.93% relative error. No Lean or other proof assistant ran.

## What the three rounds changed

1. **Independent derivation.** Two fresh-context workers independently reconstructed the minimizer, bound and equality conditions. The skeptic froze a complex-state wrong-channel control. Review found tiny-loss cancellation, strict-versus-rounded state boundaries, and two incorrect skill navigation paths.
2. **Adversarial exchange.** Independent operator and high-precision checks confirmed the stable formula. Exactly invalid binary64 states were distinguished from tolerance-admitted boundary samples. The proof gained primary citations and precise attribution. The website gained its calculator and typed evidence graph.
3. **Final audit.** Review reproduced positive-input conversion to zero and unflagged stored-energy underflow. Both were repaired with explicit rejection/range information, preserving legitimate zero-coherence endpoints. Review also caught a vacuous empty-manifest release gate; the checker now requires all critical sources and eighteen reports, with an independently executed missing-manifest control. Graph arrows and keyboard links were reviewed.

[Round 1 decision](rounds/round1-decision.md), [Round 2 decision](rounds/round2-decision.md), and [final admission](rounds/final-admission.json) bind the actual reports. Earlier failures, source versions and reports remain preserved. Final execution and publication checks close the release; they are not a fourth research round.

## Updated agent procedures

Current OpenAI/Anthropic guidance and community-maintainer practices informed scoped task packets, focused retrieval, explicit outputs, isolated initial work, progressive skill references and executable acceptance tests. [Reading depths and source links](panel/workflow/sources.json) distinguish documentation, engineering reports and maintainer examples. No comparative prompting-performance improvement was measured.

The two worker procedures, shared navigation, six-role responsibilities and observed corrections are preserved in [workflow/](workflow/navigation.md). The skill files validate locally and were committed. Saving to the Skills service failed with HTTP 422; neither new skill installation nor remote skill synchronization is claimed. The repository copy remains available and reproducible. See [save status](workflow/skill-save.json).

## Reproduce and interpret

From the repository's **energy-observatory/** directory, run:

```sh
python3 -B research/dephasing-work-bound/check_release.py --output /tmp/e1-replay.json
npm run check
```

The replay checks required source hashes, all eighteen reports and round admissions, then executes six check groups in a temporary copy. [receipt.json](receipt.json) freezes inputs; [execution.json](execution.json) records the advisor's actual replay. The browser check is `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" E1_QA_OUTPUT=/tmp/e1-browser node scripts/dephasing-browser-check.cjs`; require an empty pendingLinks list. A Chromium binary and Playwright are needed for that separate UI check.

Mean state energy remains εp. Work accessibility loss is not heat released. Preparation, dephasing hardware, phase-reference/control supplies, extraction efficiency and reset costs remain unmeasured. This result establishes no reusable source-free-energy apparatus, output power, acoustic position effect or continuum Yang–Mills solution. The next physical question would require a separate resource-accounting or calibrated measurement contract; this focused task ends here.
