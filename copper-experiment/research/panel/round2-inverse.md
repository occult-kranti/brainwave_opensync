# Seat 3 — Round 2: critique and bounded implementation

Read the Round 1 elasticity and history reports and root's Round 1 advisor decision before selecting this work. The advisor's integration direction survives with narrower attribution and executable ambiguity controls. No future Round 3 review is precomputed here.

## First objection sent before implementation

A changed mode ratio rejects a common multiplicative scale change, not every nuisance explanation and not specifically contact. Unknown Poisson ratio, anisotropy, support participation and mode identity can span the same ratio change. A shared-pole comparison is also nondiscriminating if the alternative receives extra poles/residual flexibility, or if heldout-geometry residues are freely fitted rather than predicted from a separately calibrated participation map. Equal model order, nuisance treatment, complete-record/configuration holdouts and explicit conditional rejection are required. Neither result identifies an absolute-location cause.

The useful elastic distinction is retained: the whole-sphere-mass independent-spring toy is not the passive finite multimode rank-one contact model. Radius/thermal/clock common scaling and contact-model ratio predictions can be displayed as named finite alternatives, with no exclusive cause badge. Common-pole fitting remains a proposal; the current H1 peak picker does not implement it.

## Implemented owned files

- `copper-experiment/src/design-diagnostics.mjs`
- `copper-experiment/tests/design-diagnostics.test.mjs`
- `copper-experiment/research/design-diagnostics.md`

Only these new app files and this seat's Round 2 staging files were written. Root supplied the unchanged retained Location `models.mjs`; this module imports its `simulateComparison` read-only.

### API and executed controls

`finiteModalDiagnostics({sensorPositions:[.5], drivePositions:[.5], tolerance:1e-10})` declares a dimensionless sine-basis model `q''+diag(1,4,9)q=Bq*u`, six states, and independently commandable drive channels. It reports temporal observability and controllability ranks, state nullities, original-coordinate kernels, kernel residuals, rank method, pivot tolerance, per-column L2 scaling and caveats. Controllability analyzes `K^T`, so its kernel consists of unreachable state directions rather than redundant input-history coefficients.

| Executed case | Observability rank / 6 | Controllability rank / 6 |
|---|---:|---:|
| Center drive / center sensor | 4 | 4 |
| Add quarter-point sensor only | 6 | 4 |
| Add independent quarter-point drive too | 6 | 6 |
| Duplicate center channels | 4 | 4 |
| Endpoint channels | 0 | 0 |

A single generic quarter-point channel can observe distinct known modes over time, so the implementation does not equate instantaneous sensor-count with temporal observability. The sine basis is explicitly not a copper sphere or real table mode shape. Structural full rank does not evaluate calibration, finite observation time, noisy conditioning, Fisher information or a complete physical spectrum.

`nuisanceDesignDiagnostics({design:'locked-temperature'|'independent-temperature', tolerance:1e-10})` returns four named columns, design rows, rank/nullity, original-coordinate kernel and `locationTargetEstimable`. Locked temperature yields rank 3/nullity 1 with target-changing kernel proportional to `(0,0,.2,-1)`; independent thermal-control variation yields rank 4/nullity 0 in this declared family. Rank is a finite-model estimability condition, not evidence of randomization or absence of omitted nuisance variables.

`globalAliasDiagnostics()` evaluates actual retained Location model positions `.25/.75` with matched temperature, nonzero coupling `.08` and fixed receiver. Both full calculated curves and poles are identical; the result reports an ambiguity class and explicitly prohibits unique-location inference. This checks global nonuniqueness that a local derivative could miss.

## Verification and preserved limitations

`node --test tests/design-diagnostics.test.mjs`: **8 passed, 0 failed**. Controls include sensor-only failure to repair excitation, duplicate channels, endpoint kernels, finite bounds, invalid geometry/tolerance, target-changing nuisance kernel, and the actual global forward alias. `round2-results.json` binds executed results to SHA-256 values of the new module/tests/docs and retained core. These are same-author implementation tests; independent reverse review remains Round 3 work.

Power stays offline and conditional: Round 1's independent normal-block paired-t fixture gives power `.3528241493` for 12 blocks and first exceeds `.80` at 34 (`.8077775013`) for effect `.5*sigma_d`, alpha `.05`. This is documented, not a universal sample-size calculator or measured experiment power. No browser statistics engine or common-pole fitter was introduced.

The APIs and exact returned field names were sent to root and seat 6. UI integration and independent review of seat 2's actual modal diagnostics are outstanding root-directed work; they are not marked verified here.

**Novelty:** these are established observability, linear-design and inverse-kernel methods applied to the project. No physical discovery or new location law is claimed.

Round 2 complete. Waiting for root's Round 3 assignment.
