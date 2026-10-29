# OpenAI release panel — source and proof provenance

Reviewer: oct_sources. Date: 2026-10-29. First independent panel report; no other panel report was read before this freeze. Applied paired-physics-research: freeze exact statements, distinguish artifact inspection from proof execution, and require a model dictionary before transferring a theorem.

## Release identification

The relevant official announcement is dated **26 October 2026**, inside both the October 23–29 window and calendar week October 26–29. It announces local smoothing, an ETH refutation, and constructive four-dimensional gauge-field existence. Its physics collaboration explicitly deferred public release of the AI artifacts while preparing an explanation. The announced pure Yang–Mills result concerns existence; the announcement does not claim a mass gap. No public physics manuscript or Lean package was supplied by that announcement for this reviewer to audit. This is an access-depth limit, not a disproof.

Primary announcement: https://openai.com/index/building-scientific-understanding-with-academic-communities/ . Inspected publication date, release-policy paragraphs, all three scientific sections, and outgoing artifact links. Publisher-reported formalization dates are not local proof-check receipts.

## Pinned mathematics collection

Current pin: **7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a**, commit timestamp 2026-10-26T21:18:03Z. Previous comparison pin: **1581d4cbdd69a0faf34b2089614fe2a814316a6a**. GitHub commit API, current README/history/CONTENTS and relevant scope/configuration files were read.

The current catalogue parses to **373 families, 721 unique manuscript PDF links, maximum family identifier 378**. The old snapshot was 372/719. A balanced-parenthesis parser was used; a naive Markdown-link regex returns 720 because it truncates the CAT(0) title. These are catalogue counts, not counts of independently verified theorems. Family 079 was expanded, rather than assigned a new ID; family 378 was added.

## Exact scope and availability

| Family | New or changed material | Transfer boundary |
| --- | --- | --- |
| 079 | New all-dimension Euclidean local-smoothing paper; scope documentation, six-target Comparator configuration and solution wrapper are public | Euclidean half-wave estimates are not automatically a damped, driven spherical Earth cavity theorem |
| 378 | New deterministic fixed-width CNF exact-counting manuscript and formalization | Subexponential asymptotics do not imply P=NP or a practical fast solver for our inverse problem |
| 032 | New CM-abelian-variety Hodge formalization | Its selected statement excludes the manuscript's Tate and Hodge-standard consequences |
| 266 | Restored C++ and numerical records/checker for dimension-six MUB exclusion | Record consistency, compiler behavior and formal mathematical proof remain different checks |

The local-smoothing scope file specifies n≥2, 2≤p<∞, Schwartz initial data on R^n, observation interval [1,2], and Sobolev order s=max(0,(n−1)/2−n/p)+ε, ε>0; p=2 also permits ε=0. It separately lists strict-range consequences. The six configured declarations can be found in the manifest. No endpoint or curved-boundary extension is admitted here.

For ETH, the formal scope is time (L+1)^{O_k(1)} 2^{O_k(n(log log n)^2/sqrt(log n))} with polynomial visited-tape space on canonically encoded fixed-width formulas. The manuscript advertises a sharper exponent with one log log n and a further improvement for linearly many clauses. The documentation itself distinguishes these versions; do not silently give the sharper manuscript rate the formalization's status.

The MUB scope documentation says the selected Lean family bound is at most five, while the computer-assisted paper claims at most three. Its saved-run checker checks parsing, bounds, partitions and coverage; it does not rerun the C++ programs or establish the stipulated floating-point/ABI behavior. This is a useful evidence-design example for our project.

## Verification discipline and decision

Comparator challenge .lean files deliberately contain placeholders. The corresponding JSON points to separate solution modules. Therefore finding sorry in a challenge is not evidence of a defect in the solution. The LocalSmoothing solution wrapper actually dispatches to development theorems; the ETH Main module imports its execution and space developments. This review inspected those wrappers and configurations, not the entire dependency closure.

**Local Lean executions by this reviewer: zero.** No completeness claim is made for source audit, theorem equivalence, or the full collection. Accept release metadata, accessible-artifact mappings and precise scope restrictions. Keep physical theorem transfer pending an actual matching statement and proof. No new OpenAI result inspected here disproves the E1 formula or fills our cutoff-uniform Yang–Mills gap premise.

The associated release-manifest.json records exact pinned file paths. Future steps: compile selected public Comparator targets when practical; inspect statement semantics and dependency axioms; await public Yang–Mills statements before importing lemmas. Do not replace our proof obligations with the announcement.

## Primary locations

- Pinned history: https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/history.md
- Pinned scopes: lean/docs/079.md, 378.md, 032.md, 266.md.
- Pinned verification instructions: lean/ComparatorChallenges/README.md and the MUB saved-run/VERIFY.md path in the manifest.

