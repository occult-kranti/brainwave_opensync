# Selected literature for the position-dependent sphere-spectrum experiment

Research cut-off: 21 October 2026 (America/New_York). Prepared by the `sphere_ai_literature` research subagent. This is a bounded source review, not exhaustive SOTA coverage, human peer review, or reproduction of the cited papers.

## Result

The useful scientific task is to measure specified channels of a copper sphere and its environment at controlled positions, then ask which changes survive instrument, support, temperature and geometry controls. The reviewed AI papers offer methods for inverse inference and checking computations. They do not establish a unique frequency for a spatial point, an object’s complete frequency signature, or motion caused by rewriting that signature.

The accompanying `sources.json` contains 12 selected source records with authors, date, venue, exact URL, reading depth, reported result, possible application, and limits. `graph.json` contains 19 nodes and 19 typed links. Its links are research connections selected by this team; they are not a citation graph and do not imply all authors endorse the proposed experiment. No cited external solver was installed or used to certify the browser simulation in this task.

## What was actually inspected

Primary searches covered official OpenAI and Anthropic pages, the OpenAI mathematics repository, conference proceedings, and metrology papers. We downloaded the OpenAI repository README, history, complete catalogue, and overview source, searched the catalogue/overview for inverse problems, elasticity, spectra, boundary measurements and wave equations, and read two selected manuscript openings. We did not read all manuscripts. We downloaded nine research PDFs (two selected OpenAI manuscripts, the quantum-circuit preprint, four conference papers, and two RUS papers) and extracted their text. Exact inspected pages and sections are in each record. PDF hashes and acquisition URLs are in `raw/retrieval.json`.

The OpenAI repository was inspected at commit `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. The inspected README’s current count differs from the initial announcement because the revision history includes withdrawn papers. Cite the pinned snapshot when displaying counts. The newest relevant Anthropic computational-method paper found here is the 15 October quantum-circuit preprint, publicized on 16 October. Later unrelated subject releases are not presented as pertinent to copper-sphere physics. The 1 October BootLoops essay is a workflow account, and the owner explicitly distinguishes it from an Anthropic-owned project.

## Essential interpretation controls

1. **The full boundary map is much richer than a recording.** A theorem about responses to every allowed boundary input does not guarantee recovery from a few measured resonances. A finite recording also omits modes outside its bandwidth or invisible to the chosen sensor/excitation geometry.
2. **Formalization scope is paper-specific.** The family 372 scope page lists a uniqueness result and explicitly excludes a reconstruction algorithm. The family 365 scope page concerns its scalar-conductivity nonuniqueness companion, not the joint metric/connection-recovery paper. No Lean kernel check was executed here.
3. **An exact mathematical model can still be the wrong physical model.** A corrected posterior sampler removes a specified computational approximation; it does not remove unmodeled table coupling, air-bearing dynamics, sensor loading, anisotropy or temperature drift.
4. **A good-looking reconstruction is not identifying evidence.** A learned prior can produce plausible answers when measurements are weak. Keep raw observations, likelihood, prior assumptions and held-out predictions inspectable.
5. **“Tier A” is not a uniform scientific standard.** We name actual venues: UAI, AISTATS, ICML and L4DC. The first three selected papers are from 2026; the input-design paper is a relevant 2025 foundation. Selection does not assert that these are the best methods for this small experiment.
6. **The smallest valid model comes first.** For a few parameters and frequencies, ordinary calibrated fitting, root finding and covariance analysis are easier to inspect than a neural operator. Learned surrogates are future options if a validated full elastic model becomes expensive and an adequate training set exists.

## What the network should show as solved, reported or open

- Established instrumentation: finite-band modal spectroscopy, controlled excitation, transfer-function estimation and repeatability assessment.
- Reported by recent papers: conditional inverse-PDE results, benchmark improvements, and AI-generated mathematical claims with stated verification scope.
- Proposed here: repeated A/B measurements with swapped receiver geometry, A–B–A returns, an unchanged reference channel, and recorded temperature/support state.
- Still open: whether any measured residual needs an additional physical mechanism after ordinary explanations; and whether the Bashar claim can specify an observable and a falsifiable quantitative prediction.

Do not label a source node “discovery verified” merely because a preprint says it solved a problem. Distinguish the paper’s result from the laboratory’s calculations and from future physical measurements.

## Integration guidance

Use `sources.json` as a searchable bibliography. Let a graph node open the record’s claim, reading depth and limitation. The graph edge types are `supports`, `method`, `tool`, `analogy` and `unverified`. Color and text labels should both carry the distinction. The graph’s source IDs have a `lit-` prefix so other team members can merge their sources without collision.

Keep the raw downloaded PDFs in research staging rather than bundling them into the public website. Link to publisher or author-hosted originals and publish only this short synthesis, the bibliographic records, and retrieval metadata. OpenAI sources can be pinned to the inspected commit; other pages remain live external links. Software repositories are optional resources, not claims that they were integrated or validated by this review.
