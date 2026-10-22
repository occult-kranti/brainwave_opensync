# Source and graph merge

Generated 2026-10-22 by `scripts/merge_sources.py`. This is a reproducible metadata integration, not a source re-review, physical experiment or scientific endorsement.

**139 original source records** (80 Location, 28 Position, 13 Gateway, 18 historical-panel), **one original project-interpretation observation**, and **one separate Round 3 analytical-audit observation** produce **131 conservative work identities and 141 observations**. All 140 earlier observations remain auditable; the current audit is appended to the existing project work, not substituted or assigned a new work identity. Every record retains a qualified alias, original raw record, reading depth, status, limits, review date/basis and source commit/revision.

The graph has **192 unique nodes and 151 retained edges**. Original source nodes collapse only when their node ID itself matches an origin-qualified source alias. Other nodes retain `oldL:`, `oldP:` or `history:` namespaces, even if they happen to carry a sourceId. All work records also have a source node; some are intentionally unconnected.

## Identity rules

- DOI identity is case-insensitive. An exact shared URL may supply an explicitly recorded DOI to a DOI-less observation. Similar titles, mirror content, editions and guessed DOIs do not trigger merging.
- URL identity lowercases the host and removes only explicit tracking parameters. Path case, arXiv suffixes, git revision paths, patent publication IDs, fragments, ordinary query fields and query order are retained. DOI identities are not used to erase explicit software version/inspection qualifiers.
- Versioned software records retain explicit package versions and inspected repository revisions in identity and observations; unversioned README observations remain separate. An unversioned arXiv link is not silently identified with v1.
- History H2/H3 are unread Bentov/Purce book leads. Their shared GovInfo URL is an attribution locator, not the original books' identity. They remain distinct cited-work records with originalUrl=null and readStatus=UNREAD. This explicitly documented exception avoids falsely merging either book into the inspected report.
- Official GovInfo, CIA endpoint, Black Vault mirror and annotated lead remain distinct URL observations/identities unless their supplied canonical URL or DOI actually matches. Source custody and page-version reading differences remain inspectable.

## Merged duplicate identities

| Canonical work | Qualified original aliases | Identity |
|---|---|---|
| Analysis and Assessment of Gateway Process — official GovInfo scan | gateway:GW-1983-GOVINFO, history:H1 | `url:https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf` |
| Vibrational eigenmodes of an isotropic sphere | location:physics-saviot-calculator, position:PHY-CNRS-CALCULATOR | `url:https://saviot.cnrs.fr/lamb/index.en.html` |
| On the Vibrations of an Elastic Sphere | location:hist2-lamb-sphere, position:lamb1881 | `doi:10.1112/plms/s1-13.1.189` |
| Fixed-phase resonance tracking for fast Nonlinear Resonant Ultrasound Spectroscopy | location:physics-phase-tracking-2026, history:H11 | `doi:10.1016/j.ultras.2026.108257` |
| Resonant Ultrasound Spectroscopy for Irregularly Shaped Samples and Its Application to Uranium Ditelluride | location:lit2-irregular-rus, position:skeptic-rus-loading, history:H10 | `doi:10.1103/physrevlett.132.066003` |
| Global Uniqueness for the Smooth Isotropic Elasticity Inverse Problem | location:lit-openai-elasticity, position:openai-elasticity372 | `url:https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Global-Uniqueness-for-the-Smooth-Isotropic-Elasticity-Inverse-Problem-September-24-2026/article.pdf` |
| Sharing AI progress in mathematics | location:lit-openai-release, position:openai-release2026 | `url:https://openai.com/index/sharing-ai-progress-in-mathematics/` |
| Elastic Properties of Metals and Alloys. II. Copper | location:physics-copper-reference, position:PHY-NIST-COPPER-1974 | `doi:10.1063/1.3253150` |
| Project interpretation: location-spectrum connection graph | location:project-design, integration-round3-audit:bridge-audit | `url:/devices/copper/research/working-thesis.md` |

Every duplicate observation retains its own reading/implementation status. For example, a reviewed abstract and a selected full-text reading do not become a blanket full-paper review after merging. Different software observations do not transfer execution status to each other.

## Six repaired evidence pointers

The original Location graph referenced absent `project-design` evidence six times. The new `location:project-design` record explicitly identifies project-authored reasoning about comparison protocols, simulated controls and a thematic patent relation. It is labelled project interpretation and not primary physical evidence. All six original edge objects, types and scope are preserved alongside their canonical evidence pointer.

## Display links and analytical evaluations

Public display URLs are separate from original identity locators. Seven imported local: locators and the original deployment-root project path remain unchanged in identityUrl and observation/raw provenance. Display links use pinned GitHub records or ./ paths resolved against the deployed app root, preserving any GitHub Pages base path. Work graph-node URLs match their source records. Local provenance strings are explicitly labelled nonpublic; an observation URL is not used as a display link.

The graph contains 52 evaluative/analogical edges. Each retains its original citations and now also points explicitly to the existing project work and its separately appended `integration-round3-audit:bridge-audit` observation. Its primary sourceId is that interpretation work; sourceIds/evidence retain all original claim evidence. Primary historical text does not itself prove this project's rejection. The original edge object is retained unchanged, and evaluationProvenance/evaluationNote identify the current analytical observation and its bounded scope.

## Raw imports and regeneration

`imports/source-records.json` preserves all six raw JSON inputs and capture receipts (path, SHA-256 and bytes), plus origin commits. It includes bibliographic/graph metadata only; no full Gateway transcript, PDF, commercial audio or book was imported. Gateway display titles were supplied by the Gateway source seat; inaccessible-site and unread-transcript qualifiers remain in those titles.

```sh
python scripts/merge_sources.py
python scripts/merge_sources.py --check
python scripts/merge_sources.py --check --build-target dist
```

The default validates relative targets against the app/public build inputs. The build-target option checks the actual assembled output and must be run after its build/copy step.

To intentionally refresh the original workspace snapshot:

```sh
python scripts/merge_sources.py --capture --workspace-root /workspace/scratch/c230cc629529
```

`--check` writes nothing. It verifies exact regeneration, unique source/node/edge IDs, complete alias/observation coverage, all endpoints, all sourceId/sourceIds/evidence pointers and the six interpretation repairs. Internal identity controls cover DOI case, nontracking queries, path case, arXiv/git/patent/software versions and the cited-book collision.

Groups exposed to the frontend are `gateway`, `patents`, `software`, `history`, `measurement`, `ai`, `physics`. Grouping is navigational and carries no evidence grade. The source array contract is id/title/url/group/description/observations/aliases; the graph retains nodes/edges/legend/scope plus original provenance.

## Remaining boundaries

This conservative merge can retain separate identities for the same intellectual work when only different mirrors or a DOI-less publication URL were supplied. That is preferable to asserting unverified equivalence. Capture/review dates are distinguished from publication dates; null sourceCommit for local panel reports is explicit. The raw original record is authoritative for any nuance not represented by normalized display fields. No stronger reading depth, completed theorem, calibrated apparatus result or novel physical law is inferred by the merger.
