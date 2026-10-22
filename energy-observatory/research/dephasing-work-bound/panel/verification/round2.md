# Verification Round 2 — producer exchange

**Outcome: PASS within declared numerical scope.** The actual objection was that Round 1 tolerated slightly non-PSD rounded boundary states and lost tiny positive losses in float64 subtraction. I now read the advisor's Round 1 decision, producer proof/module/report, and a producer message suggesting two extreme cases. Independent Round 1 artifacts remain unchanged. This round is cross-review, not fresh-context independence.

## Exact domain and independent comparison

`compare_producer.py` uses Python rational arithmetic to require `r²≤p(1−p)` on the exact supplied binary64 values. It separately checks the exact determinant for the assembled complex matrix. Candidate boundaries violating either condition are reduced with `nextafter` until both are admissible. The matrix calculation still uses the Round 1 explicit eigenspace extraction unitary; it never uses the producer's clipped ratio as its inequality oracle.

**3,780** complex-state comparisons pass with maximum normalized producer/matrix work-or-loss difference **2.94e-16**, below the declared absolute tolerance **5e-13**. The independent matrix upper-bound residual is at most **2.03e-16**. Phase assembly can alter the numerical magnitude by at most **5.56e-17**; this representational mismatch is recorded rather than described as exact scalar identity.

**714** candidate assemblies required repair, at most **two** downward floating-point steps. **600** original scalar boundary pairs were exactly inadmissible and were correctly rejected by the API. There were no silently accepted non-PSD pairs. Across **315** populations, rational arithmetic confirms the helper's value is admissible and its immediate successor is inadmissible, establishing sampled maximality. All **17** invalid-domain/type cases are rejected, including endpoint populations with smallest-positive coherence.

Lower and upper equality flags match the exact parameter predicates on all admitted cases. The proof's necessity and sufficiency arguments remain sound: nontrivial upper equality requires `p=1/2`, while the lower equality requires zero coherence or identity dephasing. Degenerate cases are handled explicitly.

## Precision evidence

Eight additional cases use **800-digit** explicit rotation/energy evaluation with the exact binary64 inputs reconstructed in Decimal. Normal-output acceptance uses relative tolerance **2e-14**; subnormal/underflow outputs instead allow absolute error up to **two minimum subnormals**, without a relative-accuracy claim.

- Tiny loss `1.92e-300` and near-identity loss `2.55869e-17` survive producer stabilization although float64 matrix subtraction cannot reliably resolve them.
- At `p=.2,r=1e-200,d=.5,epsilon=1e300`, normalized loss underflows but the recovered Joule loss is `1.25e-100`.
- At balanced population, minimum-positive coherence, `d=.5,epsilon=1e300`, the recovered Joule loss is `2.47033e-24`; normalized loss underflows without triggering lower equality.
- Tiny energy gaps produce the expected subnormal/underflow flags. A “normal” flag remains a range classification, not a certified error bound.

## Reproduction and binding

Executed from repository root; exit status **0**:

```sh
python research/dephasing-work-bound/panel/verification/compare_producer.py > research/dephasing-work-bound/panel/verification/round2-results.json
```

The checker only prints JSON and invokes `producer_bridge.mjs`; replay may redirect to a temporary location. Source hashes, exact inputs, oracle values, output statuses and domain counts are in `round2-results.json`.

SHA-256:

- Producer module: `05b2ad552c3bb0c1812dd3553163a59f28bc77b9bc55861c96d673fd85afb78b`
- Comparison checker: `28dfd3126ef6dc43a19335316d0cc52ef93742d940ad30e6cc676b2c1bb6d17f`
- Bridge: `48250a34e828b49a651d6f985d16cc5ca98234ed361ad3b304698e1edd422a97`
- Executed results: `b1eb21420d851b1b1485e8bfc32633caec11c0a02a7a3db4394a613670867e43`

No implementation defect remains in this tested scope. Sampling does not certify every binary64 input, subnormal relative accuracy, the website, or apparatus performance. Proof wording and source attribution changed during this round; the receipt binds the inspected source revision. Awaiting the advisor's actual Round 3 objections.
