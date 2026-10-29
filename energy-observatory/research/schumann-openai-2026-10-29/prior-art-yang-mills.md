# Additional Yang–Mills prior-art gate — 29 October 2026

Advisor follow-up prompted by the user's request to screen novelty before any next three-round cycle. This is a source review, not another proof round. No new three-round cycle is started.

## Primary statements and exact scope

| Primary source | Reading depth / date | What it supplies | Project consequence |
| --- | --- | --- | --- |
| [Douglas, Gross, Jaffe, Klebanov and Nekrasov, working-group statement](https://www.kitp.ucsb.edu/sites/default/files/YM_working_group.pdf) | Entire two-page statement, October 2026 | The authors describe an existence/continuum-limit result, say confinement and the mass gap remain open, and plan validation of definitions and alignment of formal and informal statements before releasing Lean. | Strengthens the distinction already used in our comparison. It is a primary statement about the work, not an accessible proof that can be imported. |
| [Jaffe–Witten, official Clay problem](https://www.claymath.org/wp-content/uploads/2022/06/yangmills.pdf) | Problem statement and surrounding construction/axiom requirements; not an independent proof | Nontrivial theory on R⁴ for compact simple gauge groups, appropriate axioms and a positive mass gap are separate obligations. | Fixed-spacing or fixed-cutoff results cannot close the full problem merely by sharing Yang–Mills terminology. |
| [Sussman–Alpöge public Claude experiment](https://github.com/ethanwsussman/Yang--Mills-LLM-experiment/tree/1b92bd0347e3b8763cd8ecc1f96dc3c2a92dd310) | Root README, tree and RP1 theorem statement; pinned Oct 27 revision | Public QED3/YM3 manuscripts and a YM4 draft. Authors explicitly call the largely LLM-produced material insufficiently vetted. This is an independent researcher project, not an official Anthropic theorem certification. | Useful adjacent constructive-field-theory work to inspect. Not an established proof, a direct disproof of our model, or evidence of our novelty. |
| [RP1 theorem statement at the same pin](https://github.com/ethanwsussman/Yang--Mills-LLM-experiment/blob/1b92bd0347e3b8763cd8ecc1f96dc3c2a92dd310/RP%20O(d)%20trick%20(RP1)/README.md) | Exact Theorem A hypotheses/conclusion read; full proof not audited | A proposed rotation-invariance route from a continuum random-distribution measure, exponential moment bound, full translation invariance and reflection positivity on a specified family of planes; limited tensor rotation weights and disjoint-support moments are part of its statement. | A precise candidate bridge to review only after constructing the requisite continuum measure and proving those hypotheses. It does not itself construct that measure, establish a mass gap or provide lattice-spacing-uniform estimates. |

The RP1 claim concerns d≥2 and a finite-dimensional orthogonal representation with planar weights in −2,…,2. Its moment hypothesis controls the exponential functional by an L¹/L² expression. Reflection positivity is required across coordinate and diagonal planes. These are substantially stronger and more specific premises than an informal statement that a lattice model has reflection symmetry. We have inspected the advertised statement, not certified its validity. Root README blob: `24778ac2d5498b4cab2568447b58ae4e2b9c6612`; RP1 README blob: `1578fbcec3cd49a25c5163ab83c6eb33414250da`.

## Decisions before another proof cycle

**No-go:** claiming OpenAI has resolved our continuum gap; claiming a new construction based only on shared Balaban terminology; claiming the scalar Schumann model is a new Yang–Mills result; treating public tentative manuscripts as established imported lemmas.

**Conditional review target:** the RP1 statement offers a concrete checklist for rotation invariance of a continuum object. A future task may audit that exact proposition against known reconstruction/positivity results and the project's actual fields. It must first establish a named continuum measure, its tensor representation and bounds. The current Round 33 fixed-lattice constructions do not supply that bridge in this review. Therefore this candidate is not admitted as a readily provable novel result.

**Retain existing obligations:** route-B dynamics, broader boundary uniqueness, finite-box certificates and extended finite-N rates remain their own project goals. Novelty for any one needs an exact proposition-to-prior-theorem comparison before code or proof-search loops begin. This follow-up does not revalidate every Round 33 proof.

## Search record and limitations

Searches included OpenAI/Yang–Mills/October 2026 proof, OpenAI QCD collaborators, the committee statement, the cited 2026 Douglas review, and Balaban ultraviolet stability. News pages were discovery leads only; the admissions above rest on primary statements, the official problem and author repository. The Nature review landing page was found, but its full text redirected to an inaccessible identity-provider page; no unseen theorem from it is relied on. We did not audit all historical constructive-QFT literature or all 1,147 pages described by the committee. A bounded search cannot certify worldwide originality or prove that no other proof exists.
