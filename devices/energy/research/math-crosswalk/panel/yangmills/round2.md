# Round 2 — exact gap and scale checks

Advisor-selected task: **YM-T2**, admitted after all six Round1 reports. Comparison cutoff: 2026-10-21. Executed: 2026-10-22 UTC. The frozen Round1 report hash still matches `round2-admission.json`.

**Result:** all **93 declared finite arithmetic checks passed**. The analytic counterexample shows that even an identical ground-state projector does not imply a positive uniform spectral gap. Exact replay of the existing AZ1 dictionary confirms the recorded strong-coupling admission obstruction. Neither result disputes the valid, separately hypothesized fixed-spacing gap in the Yang–Mills repository or establishes the behavior of the gap outside its certificate.

This is a bounded logical and arithmetic audit selected from Round1 findings, not another broad literature search, a new physical simulation or a new Yang–Mills theorem. No metadata-field matching was counted as proof.

## 1. State convergence is insufficient by itself

For every positive integer N, on the same Hilbert space C², set

\[
P=\begin{pmatrix}1&0\\0&0\end{pmatrix},\quad
H_N=\begin{pmatrix}0&0\\0&1/N\end{pmatrix}=\frac{I-P}{N}.
\]

The unique normalized ground-state density is exactly P for every N. Its trace-norm distance between any two sizes is zero. Direct diagonalization gives eigenvalues 0 and 1/N, so the gap is positive for every finite N but tends to zero. For any proposed constant c>0, choose N=floor(1/c)+1; then 1/N<c and H_N≥c(I−P) fails. This proves the all-N claim analytically. Finite fixtures illustrate and check the identities; they are not used as a substitute for that argument.

The matching positive control K_N=I−P has the same ground-state projector and a uniform gap of 1. Thus the test distinguishes the missing spectral premise while preserving the legitimate possibility of a uniform gap. The code checks projector multiplication, exact matrix identities and the principal-minor criterion for positive semidefiniteness, using rational arithmetic.

| N | Gap of H_N | Candidate lower bound c=1/16 | Gap of K_N |
|---:|---:|---|---:|
| 1 | 1 | Holds | 1 |
| 16 | 1/16 | Holds at equality | 1 |
| 17 | 1/17 | Fails | 1 |
| 10000 | 1/10000 | Fails | 1 |

The number 1/16 in this toy test is an arbitrary test threshold, not the physical Yang–Mills α/16 estimate. BB2/AQ2 includes additional inherited gap hypotheses; this counterexample does not refute that chain.

**Energy reference control.** Take a fixed E★=7>0. The dimensionless gap is 1/(7N). A consistent change of energy units by s_N=N rescales both H_N and E★; their ratio remains 1/(7N). Multiplying only H_N by N while holding E★ fixed produces gap ratio 1/7, but changes the physical operator family. It does not establish a uniform gap for the original family.

## 2. Replaying the actual AZ1 admission arithmetic

For the uniform route-B SU(2) model, the inherited dictionary is

\[
\alpha=\frac{g^2}{2a},\qquad
\lambda=\frac{2}{g^2a},\qquad
\tau=\frac{24\lambda}{\alpha}=\frac{96}{g^4},\qquad
\alpha\lambda a^2=1,
\]

with a>0, g>0 and a fixed positive E★. The code uses only the positive-real-bare-coupling branch. Negative τ in the separate mirrored model is not treated as a real positive-g dictionary.

The inherited route-B certificate requires

\[
\tau\le\frac1{100000000}
\iff g^4\ge9600000000.
\]

The weaker AL1 bridge condition is τ≤3, equivalently g⁴≥32; this weaker condition alone does not provide the stronger route-B certificate. At each boundary, equality is accepted, g⁴ one unit below is rejected, and g⁴ one unit above is accepted.

For the explicitly algebraic toy path g_N=g₀/N, we independently found the first rejected index by sequential exact inequalities and by an integer fourth-root formula. They agree:

| Initial condition | Rule | Last admitted N | First rejected N |
|---|---|---:|---:|
| g₀⁴=9,600,000,000 | Route-B cap | 1 | 2 |
| g₀⁴=9,600,000,000 | AL1 bridge | 131 | 132 |
| g₀=1000 | Route-B cap | 3 | 4 |
| g₀=1000 | AL1 bridge | 420 | 421 |

For example, g₀=1000 gives τ₃=243/31,250,000,000≤1/100,000,000, whereas τ₄=6/244,140,625>1/100,000,000. The full exact boundary fractions are retained in `round2-results.json`. For g₀⁴=9,600,000,000 the code represents g₀⁴ exactly, without numerically approximating its irrational fourth root.

This toy path is not a derived asymptotic-freedom trajectory. The general obstruction needs no chosen toy path: if a→0 along a trajectory with g(a)→0, then eventually g(a)⁴ lies below either positive admission threshold, by the definition of convergence. Failure of this sufficient certificate says nothing about whether the actual gap persists there.

## 3. Length rescaling does not repair coupling admission

At fixed g, replacing a by a/s gives α→sα and λ→sλ. Hence τ and all admission decisions remain unchanged. With E★ held fixed, α/E★ changes by s; this energy change cannot repair the coupling inequality.

Exact controls used a=3/5, E★=7, scale factors s in {1/1000,1,1000}, and both an admitted g=1000 and rejected g=250. Every rescaling preserves its initial admission decision. The inherited expression α/16 is labeled a certificate only in the admitted case; outside it, the same arithmetic expression has no certified lower-bound meaning. Invalid zero E★, zero g and a=0 inputs are rejected rather than silently normalized.

The reviewed gap is volume-uniform at fixed a within its declared regime. This replay does not make it cutoff-uniform along a→0. No earlier Yang–Mills source, theorem or accepted calculator was changed.

## Peer objections retained and advisor handoff

The skeptic's two documentary objections remain decisive: family265 concerns entanglement entropy with an assumed gap, not a Wilson-loop area law; family215's inspected Lean scope concerns finite-domain classical spin correlations, not the O(3) continuum headline. These exact computations cannot supply either missing theorem transfer.

Recommended crosswalk update: leave the exact-OpenAI-overlap finding unchanged and mark the fixed-a-to-continuum shortcut **rejected by assumption mismatch**, supported by an exact counterexample and the prior AZ1 admission obstruction. Keep family215 as a method template for same-field, same-scale reconstruction obligations. The next scientific task would require an actually applicable cutoff-uniform estimate or a different controlled strategy; extending a failing sufficient bound by algebra is not that task.

Reproduction from the project root:

```bash
python research/math-crosswalk/panel/yangmills/verify_round2.py
```

The standalone script uses only Python's standard library and exact `Fraction` values. It writes `round2-results.json` beside itself; `--output` permits a separate replay file. `round2-hashes.json` binds code, output, reports and the advisor admission. The run includes no floating-point eigensolver, experimental data, Lean execution, full manuscript proof audit or revalidation of the historical Yang–Mills gap dependencies. No third research round is proposed or executed here.
