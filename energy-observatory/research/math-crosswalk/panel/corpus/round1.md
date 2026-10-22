# Round 1: OpenAI corpus and status audit

Research cutoff: 21 October 2026. Role: corpus/version auditor, using Investigative Evidence Research and Newton Analysis/Synthesis. This is a model-agent document audit. It is not an independent verification of the collection's mathematical proofs.

## Finding

The current `openai/math` revision is `1581d4cbdd69a0faf34b2089614fe2a814316a6a`, committed 12 October 2026. It is the same revision already cited by our Copper Location Spectrum research. A fresh GitHub commit lookup found no newer main-branch revision at this check.

The collection contains **372 family headings and 719 unique manuscript links**, reproduced by parsing the entire current manuscript map. Its largest family identifier is **377**. Five identifiers are absent: 045, 061, 070, 123 and 163. Thus 377 is a label in the catalogue, not its family count. This is a possible explanation for the number in the question; the user's original source for that number was not supplied and its provenance remains unconfirmed. Do not attribute all five numbering gaps to the three withdrawals.

The original 6 October README at `adc7f1241b42e322a6451854ab7e4b4c146bf78a` reports 722 manuscripts and the same 372 families. The reduction to 719 is consistent with the three subsequently reported withdrawals. This before/after count is now checked against both pinned README versions.

None of these counts is a count of problems independently certified as solved. A family may contain a main result, companion statements, consequences or alternative proofs. The README describes mixed verification stages and acknowledges that some unformalized results may have issues. It also reports approximately 4,000 posed problems, a different denominator again.

## Exact source and count contract

Eight files were acquired through the GitHub connector, with no whole-repository clone. The retained UTF-8 bytes match their Git blob SHA values. SHA-256 hashes and pinned URLs are in `inventory.json` and `sources.json`. A hash certifies the retained bytes, not mathematical correctness.

`parse_catalogue.py` uses the numbered family headings and constituent paper links in `CONTENTS.md`, extracts discipline assignments from `overview.tex`, and joins exact paths to `lean/formalization.yaml`. It rejects duplicate family IDs and paper paths. Run:

```sh
python3 research/math-crosswalk/panel/corpus/parse_catalogue.py --snapshot PATH_TO_PINNED_OPENAI_FILES --output /tmp/openai-inventory.json
```

The snapshot must contain the paths listed in `snapshot-manifest.json` and the supplied `git-expected.json`. PyYAML is required. This parser does not run Lean or prove any mathematical theorem.

| Quantity | Observed value | Interpretation |
|---|---:|---|
| Family headings | 372 | Count independently reproduced from the catalogue structure. |
| Distinct manuscript links | 719 | Count independently reproduced from listed paper paths. |
| Largest family identifier | 377 | Not a count of families or solved problems. |
| Subject categories | 17 | Counted from overview discipline assignments. |
| Family links to Lean scope notes | 242 | A scope note can describe only a companion/supporting result. |
| Sources in `formalization.yaml` | 173 | Structured paper metadata entries, not a complete certified-result census. |
| Main-result declarations in YAML | 200 | Named formal declarations, not interchangeable with papers or families. |
| YAML paper paths matching the current catalogue exactly | 172 | One version-path discrepancy is retained below. |
| Top-line results formalized | 300 / 719 | Publisher-reported in history; not independently established by this audit as 300 successful main-theorem checks. |

The formalization YAML calls its scope partial progress and its review status unchecked. Those metadata words alone neither refute nor certify the formal proofs. The Comparator README explicitly lists five supporting-result comparisons that do not verify their associated paper's main theorem. Correct use requires the particular theorem declaration, mathematical statement, assumptions, version and actual successful build/check output.

## Revisions matter

The 7 October history reports three withdrawn manuscripts following a sign error in a stabilization/trace cancellation argument and its dependent construction:

- *Algebraicity of Weil classes on split abelian eightfolds*.
- *Algebraicity of Kuga–Satake Correspondences for K3 Surfaces*.
- *The rational Hodge conjecture for products of K3 surfaces*.

It also reports substantive repairs/clarifications in 14 other manuscripts, dependency-reference updates in 13 additional manuscripts, six added formalizations and five supporting-result additions. These are attributed change-log statements. This auditor read the change log, not every repaired or withdrawn proof.

A concrete metadata discrepancy remains: the YAML entry for *Taming implies compatibility on four-manifolds* refers to the September 23 directory, while the current family 342 catalogue entry refers to October 6. History records a corrected cone-equality claim and a strict-inclusion example in that topic. The exact-path join intentionally does not silently promote the newer paper to formalized status. The mismatch is a revision-link issue, not a proof that the main mathematical claim is false. Its detailed scope needs paper-specific inspection.

## Candidate comparison lanes

The complete inventory records all 372 families. The following IDs are selected by the question's model/observable scope, not by prestige or the strength of a title's wording. Paper openings and proof scope are delegated to the domain specialists. `candidates.json` contains the same selection with pinned constituent-paper links.

| Lane | Family IDs | Potential connection | Required distinction |
|---|---|---|---|
| Yang–Mills adjacent spectral/continuum methods | 211, 215, 261, 262, 265, 268, 269, 270, 271, 282, 290, 300 | Spectral convergence, transfer gaps, matrix inequalities, locality and operator reconstruction. | Different state spaces, dimensions, Hamiltonians and physical scales. A gap assumed in an area-law theorem cannot establish our gap. |
| Quantum and electromagnetic models | 273, 276, 362 | Photon-number entropy, generalized amplitude-damping channels, relativistic Vlasov–Maxwell. | Capacity/entropy/global smoothness are different target observables from ergotropy or net apparatus work. |
| Statistical free energy | 217, 221, 222, 234 | Variational thermodynamic limits and statistical-model inference. | Thermodynamic free energy is not source-free useful energy. |
| Sound, sampling and inverse measurements | 075, 077, 079, 080, 130, 365, 369, 372 | Fourier limits, wave estimates, exact arithmetic DFT, boundary reconstruction and elasticity. | Infinite/operator-valued data and exact arithmetic assumptions do not automatically apply to a finite noisy spectrum. |
| Dynamics and transfer boundaries | 363, 364, 371, 374, 376 | Nonuniqueness, kinetic limits, nonlinear waves, transport stability, forced-flow simulation. | Retain forcing, local conservation, singular-limit order and actual physical domain; do not substitute unforced global claims. |

A literal search of the full manuscript map found no occurrence of Yang–Mills, source-free energy or perpetual motion under the registered patterns. This is a limited text-search observation. It does not prove that no theorem could aid Yang–Mills or energy research. In particular, family 215's claimed two-dimensional O(3)/O(4) results deserve a model-by-model comparison, not a translation into a four-dimensional gauge-theory solution.

## What the existing project had already attempted

Before this audit, our location-spectrum source register already linked the exact current OpenAI revision and discussed families 365 and 372 as inverse-problem context, with explicit measurement and formalization limits. The current `openai/math` commit therefore is not entirely new knowledge to the project. Domain specialists must still establish whether our executed model problem matches any particular theorem, rather than treating a previous citation as an attempted solution.

The corpus audit itself establishes no prior solution by our project. Exact-problem equivalence requires a proposition-level match: assumptions, unknown, domain, observation operator, quantifiers, conclusion and accepted proof/calculation. Keyword or graph connections are insufficient.

## Round 2 recommendation

1. Independently recount family/manuscript IDs and challenge the tempting but wrong 377 = family-count interpretation.
2. Test a paper-level formalization admission rule with a family whose scope note covers a different companion, and the family 342 version mismatch. Preserve refusal/unknown outcomes.
3. Have the subject specialists nominate at most two tractable transfers each, with explicit assumptions and a counterexample to an overbroad transfer. No broad mathematical solve claim enters the public graph without matching proof evidence.

Round 1 is complete. Round 2 is intentionally unexecuted until the advisor selects it from the panel's objections.
