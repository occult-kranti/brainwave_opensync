# Historical/mechanism seat — Round 3 admission review

22 October 2026. The review examined the actual integrated source/graph files, `research/gateway-analysis.md`, `research/working-thesis.md`, source/graph rendering code, and the Gateway skill prose/references. It is an AI-agent review, not human peer review, a new physical measurement or scientific approval.

## Findings and repairs

**R3-01: public display URLs.** Seven imported `local:` locators and the project’s deployment-root URL were unsuitable public links. The merger now exposes the root-specified pinned GitHub or `./` app-relative URLs, while preserving original identity URLs, observation URLs and raw records. Each nonpublic original locator is explicitly identified as provenance. All 131 canonical identities/IDs remain unchanged. The validator permits only public HTTP(S) or build-root-contained `./` display links, checks relative file targets and requires graph work-node URLs to match source display URLs. External HTTP protocol/identity is checked; no blanket claim of successful retrieval from every external host is made.

**R3-02: analytical evidence versus the source making the rejected claim.** The initial history graph’s evaluative edges could point only to the record that asserted a claim—for example Gateway §19 or the derivative photon/Q rebuttal. That record does not author this project’s rejection. The repaired graph’s 52 evaluative/analogical edges identify the project analytical audit explicitly. Their primary `sourceId` points to the existing project-interpretation work; `sourceIds`/`evidence` retain all original claim citations. `evaluationProvenance.observationAlias` names the new `integration-round3-audit:bridge-audit` observation and records `evidenceKind=project-analytical-audit`. Original edge objects, origins and scopes remain intact.

The original project-interpretation observation was restored rather than overwritten. The current analytical review is appended as a separate observation on the same work identity. The final source contract therefore contains 139 imported observations, one original project interpretation and one current analytical audit: **141 observations, 131 work identities**, with **192 nodes and 151 edges**. No new physical evidence or source identity was invented.

**R3-03: visible scope and attribution.** The frontend seat repaired the relationship list to display edge type, label, scope, original origin and evaluation note with canonical citations. It also gives Bentov/Purce cards a visible “original work unread/report attribution locator” distinction. Reading depth, status, limits, review date and source revision remain per observation; no work-wide confidence/status was created by deduplication. Duplicate raw-record JSON is hidden from the card, while preserved raw records remain available in the source data. This seat inspected the rendering code; browser/visual execution belongs to the frontend reviewer’s separate receipt.

## Integrated prose and skill review

The integrated Gateway analysis correctly distinguishes the available ten-blob repository from missing advertised assets, selected official/mirror pages from a complete-manuscript review, and the full derivative transcript from original-scan fidelity. It preserves official/mirror/printed page coordinates, the printed-page-25 gap, attribution to unread Bentov/Purce/Jager originals, and endpoint-specific access limitations. Its coupling fields are unspecified/null, not measured zero. No physical sphere, EEG or clinical result is claimed.

The working thesis presents apparatus response and identifiability as a project synthesis. It preserves conditional linear-model scope, mobility/receptance units, candidate-peak versus fitted-pole distinctions, exact parameter fibers, prospective controls and held-out alternatives. Rejecting one toy or observing a null does not establish universal physical absence; a residual does not become an absolute-location law. The supported Tesla phase edge denotes the specified mechanism described by the patent, not measured efficiency or proof of every historical performance claim; its source observation retains that limitation.

The canonical skill at `/root/.codex/skills/remote-skills/skill-6ad97178dff48191830dac4cb3b89446` and the app review copy were byte-identical for all three reviewed prose files:

| File | SHA-256 |
|---|---|
| `SKILL.md` | `ba4e82f71cfa15bdcd0c0f57faf5df7e64ca83acf7e16e8f7090034bd548a68c` |
| `references/evidence-contract.md` | `625ebeae8f09b0afb078524030432e6ba5acc13c4264579a341a6a85bb7a7a84` |
| `references/source-leads.md` | `47cc795276789511d8b62c0e55c8328c5e4db3e934fdb744cd5c9c048c07b08d` |

No historical overreach was found in that prose: examples are dated and selected; bibliography-wide reading, historical participation, recovered proprietary audio, exact geophysics, clinical transfer and invented body–sphere coupling are expressly excluded. The source-custody and page rules match the inspected records. The skill’s executable parser was being reviewed separately by the Gateway seat; this report does not claim its full behavioral certification or installation/push verification.

## Actual verification and admission boundary

- Deterministic source/graph/report regeneration passes in normal and optimized Python.
- All 139 imported raw records and original observation URLs were compared against the captured inputs and remain exact. The original project-interpretation raw record is retained, and the analytical audit is a separate observation.
- All qualified aliases, unique IDs, 151 edge endpoints and canonical evidence pointers resolve; the six original interpretation-pointer repairs remain identifiable.
- All eight corrected display mappings resolve to their intended pinned URLs or build input targets. The source/graph schemas keep nonpublic original locators out of public display anchors.
- After the root rebuilt the 308-file distribution, `python scripts/merge_sources.py --check --build-target dist` and the same command under `python -O` both passed. They checked relative targets and exact assembled source/graph/report bytes for the 141-observation build. The earlier stale-distribution rejection was resolved by rebuilding; it was not bypassed.

**Admission is limited to provenance, source/graph contracts and the bounded prose reviewed here.** Physical performance, complete source coverage, human review and a new theory remain unestablished. No mandatory finding in this seat's assigned source/prose scope remains open.

## Final artifact receipt

Final counts: 139 imported records plus the preserved project interpretation and separately appended current analytical audit; 141 observations, 131 conservative work identities, 192 unique nodes, 151 retained edges, 52 explicitly audited evaluative/analogical edges.

| Artifact | SHA-256 |
|---|---|
| `scripts/merge_sources.py` | `8e5b648889c13d62c1dcf299af83db846a049ab2914d4ee0b133562e76e131dd` |
| `imports/source-records.json` | `89be603f3c0ba3245d5d4da5ce7a8cb2afb47297bbee57be0a4ba92036d14e07` |
| `data/sources.json` | `f781861ea2bfa57e2263efe77e13962450704beb464b88ff5e76ef8e748f5d59` |
| `data/graph.json` | `b36dace979dd8ca91919e11eda5fa04c0513986414b64d919f67aaa2c65cde26` |
| `research/source-merge.md` | `57e2613f292ed874fcf059b278e68226fee11888dcf678ad6ce7ef903c308c22` |
| `research/bridge-audit.md` | `136b778c1b5a5dc80f78e2fa29a804ebd5c32e8b5cb26fc291bf35530c80eae0` |
| `research/working-thesis.md` | `659f2d3e2050499f199b483cc4c6ed250352db17e0e6d05ba68e0611832beb59` |
| `research/gateway-analysis.md` | `0356727ee6f7924cb6770495ae10496ba0dc44938907495c144f269d9cde0034` |

This receipt binds the exact locally reviewed outputs. A later source push, skill synchronization or website deployment requires its own remote receipt; none is inferred from these local hashes.
