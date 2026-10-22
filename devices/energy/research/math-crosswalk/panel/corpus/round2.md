# Corpus auditor — Round 2

The second census confirms **372 result families and 719 manuscript entries** at OpenAI commit `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. It also found a real defect in our first parser: one family 337 paper URL was truncated at the parenthesis in `CAT(0)`. The frozen Round 1 files remain unchanged. **Use `inventory-round2.json` for the corrected complete inventory.** This is a metadata audit, not verification of 719 mathematical proofs.

Research cutoff retained from the advisor: 2026-10-21. Execution host date: 2026-10-22. The upstream source commit remains 2026-10-12; no additional research round was opened.

## Independent recount and the discovered erratum

Round 1 parsed Markdown family headings and manuscript links in `CONTENTS.md`. Round 2 scans balanced TeX arguments in `overview.tex`, including nested braces and escaped characters, and independently extracts every `\resultentry` and constituent `\href`. This is independence of algorithm and source format, **not independent authorship**: the same auditor wrote both parsers.

The first Round 2 run failed on family 337. The original Markdown pattern stopped at the first closing parenthesis in a URL. Its frozen value was `preprints/Sharp-integral-fillings-in-CAT(0`. Both the complete Markdown link and TeX link instead point to:

`preprints/Sharp-integral-fillings-in-CAT(0)-spaces-September-23-2026/paper.pdf`

The correction is retained as machine-readable `round2Errata`; the original inventory and its hash are preserved. This defect affected one path, not the number of families or manuscripts. After the correction, all 372 family IDs and all 719 per-family manuscript paths reconcile. The earlier YAML join count remains 172 exact current-catalogue paths out of 173 source entries. Family 342 remains the one date-version mismatch identified in Round 1.

| Counting unit | Result | Interpretation |
|---|---:|---|
| Families | 372 | Catalogue groupings, not 372 independently verified solutions |
| Constituent manuscripts | 719 | Distinct linked paths at the pinned revision |
| Highest identifier | 377 | An identifier, not a census |
| Absent IDs in 001–377 | 045, 061, 070, 123, 163 | Cannot all be attributed to the three documented withdrawals |
| YAML source entries | 173 | Partial metadata set |
| YAML main-result declarations | 200 | A different metadata unit |
| Exact YAML-source/current-paper path joins | 172 | No change after the family 337 correction |
| Publisher-reported top-line formalized count | 300/719 | Publisher claim retained; not our Lean execution count |
| Proofs executed by this auditor | 0 | No formal verification claim |

All eight original snapshot files and all fifteen newly downloaded scope, target-statement and comparator-configuration files were hash-checked. Seven Round 1 deliverables were checked against `round1-freeze.json` before and after execution.

## Exact scope admission controls

The executable `round2_audit.py` checks the pinned revision, family, paper path/date, declaration name, and seven manually annotated scope dimensions: objects, domain, boundary data, quantifiers, observable, limit and conclusion. It additionally checks that each scope note actually links the recorded paper, the comparator configuration names the declaration, and the target file declares the theorem. These are **documentary consistency checks**. Comparing annotation strings does not establish semantic equivalence, the truth of a theorem, or correctness of its proof implementation.

| Family | Exact inspected target | What the control rejects |
|---|---|---|
| 365 | Bounded measurable scalar-conductivity **nonuniqueness** companion; `OAI.ScalarConductivity.main_nonuniqueness` | Transferring this companion’s formalization to headline smooth metric/connection uniqueness |
| 215 | Uniform finite-graph classical O(n) correlation decay, n≥3; `OAI.ClassicalON.main` | Substituting a continuum-limit paper, infinite-volume construction, or the separate O(4) gap claim |
| 276 | Generalized amplitude-damping repeated-use capacity/additivity; `OAI.GAD.main` | Arbitrary different partner channels, separate-measurement decoding, an uninspected declaration or revision |
| 342 | September 23 paper path; `OAI.TamingCompatibility.taming_implies_compatibility` | Treating the current October 6 paper as an exact version match without a documented bridge |
| 372 | Full static displacement-to-traction uniqueness; `OAI.Elasticity.global_uniqueness` | Replacing the full boundary operator with finitely many resonance peaks |

All **17 controls** returned their intended results: five exact matches were admitted as **metadata accepted, proof not verified**; nine mismatched or overextended records were rejected as metadata matches; three missing-evidence records caused abstention. The five positive controls matter: this gate can accept a narrow documented match rather than rejecting every claim. The family 342 positive control is explicitly a legacy-version match, outside the current catalogue. Family 372 has a scope note, target declaration and comparator configuration, despite not appearing in the partial YAML main-result list inspected here; that absence is not evidence of non-formalization or falsehood.

A rejected metadata match is **not a disproof**. The family 342 October 6 theorem might agree with the earlier formalized statement; this audit does not establish the version bridge. Missing paper/version/declaration/boundary information triggers abstention, not invented coverage.

The five inspected `ComparatorChallenges/*.lean` files contain `sorry` placeholders for target statements. Their JSON configurations separately name solution modules and permitted axioms (`propext`, `Quot.sound`, `Classical.choice`). We did not read or execute those solution modules, run the comparator, inspect its dependency closure, or observe an axiom-check result. A target placeholder is neither a proof certificate nor evidence that the separate solution implementation fails.

## Cross-review and implications for our research

The selected Yang–Mills, energy, acoustics and methods crosswalks preserve the relevant scope boundaries. No count or formalization-status overreach was found in those selected comparisons. Their conclusions remain local to the inspected targets: **no exact matched OpenAI problem is evidenced solved by our selected artifacts**. A global claim that none of all 719 manuscripts has any overlap would exceed the inspection.

The Yang–Mills comparison retains the distinction between finite-domain O(n) correlations, our fixed-spacing SU(2) work, and a continuum gauge-theory mass gap. The energy comparison distinguishes channel capacity from ergotropy and apparatus energy balance. The acoustics comparison distinguishes full boundary operators from finite frequencies. The methods comparison treats statement fidelity and exact finite certificates as workflow transfers. A research-network edge records a connection; it is not a theorem-solution certificate.

These checks support the advisor’s limited conclusion: the corpus offers useful target statements, hypotheses, and verification practices, while the selected matches do not establish a new Yang–Mills continuum proof, source-free energy, or full-object reconstruction. No physical derivation or experiment result is introduced by this metadata gate.

## Reproduction and handoff

Run from this directory, supplying the pinned source snapshot if it is elsewhere:

```sh
python round2_audit.py --snapshot /path/to/openai-snapshot --output round2-results.json
```

The script requires Python and PyYAML. It produces the corrected `inventory-round2.json` alongside the result file, validates the preserved Round 1 freeze, and records the discovered erratum rather than hiding it. Supporting files are `scope-records.json`, `scope-controls.json`, `round2-sources.json` and `round2-peer-review.json`. `round2-freeze.json` binds this report, the code, records and outputs by SHA-256.

Round 2 is complete. No Lean build, full-paper proof review, new solve claim, or third round is implied.
