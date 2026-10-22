# Round 3 — Independent reverse review of finite design diagnostics

Seat 2 reviewed the inverse agent's actual integrated design module. This is cross-agent numerical/source review, not human peer review or physical replication. This seat's own modal tests were not rerun or counted as independent evidence.

## Admission decision

**The corrected finite-design module passes the bounded cross-review.** It reports temporal observability and state reachability for its stated three-mode sine-basis model, not instantaneous sensor rank, practical noisy detectability, full-sphere observability or unique localization. The retained Location reflection alias and Position contact-product alias both reproduce. The prerequisite inference limits remain in the protocol and module outputs.

One concrete code defect was found and repaired during this round: the initial participation function converted every sine magnitude below 1e-14 to zero. That was broader than the documented exact-node convention and could turn arbitrarily weak but nonnodal structural participation into a false rank deficiency. I reported the exact source issue to the inverse agent and root before any change; the inverse agent, with root authorization, changed its own module. It now zeros only canonical represented endpoints, the second mode's midpoint, and the third mode's one-third/two-third nodes. All other finite sine amplitudes are retained. Initial defect evidence was source inspection and the explicit nonnodal counterexample, not a claimed pre-repair run of the final script. The numerical results below bind the corrected source.

Two wording corrections were coordinated with their owners, not edited by this seat:

- Design/protocol text now distinguishes true matched natural-frequency ratios from visibility/peak selection and estimator bias. Readout participation alone changes amplitudes, not those true ratios.
- The Models page now says finite-area/nonlinear contact and real fixture calibration are omitted, rather than claiming that all contact is omitted below an implemented contact model.

No app source, tests or protocol files were written by this seat in Round 3. Only the independent staging script, results and report were written.

## Reproducible independent method

Files:

- `integration-panel/elasticity/review_design_round3.py`
- `integration-panel/elasticity/round3-design-results.json`
- `integration-panel/elasticity/round3.md`

From the workspace root:

```sh
python3 -B integration-panel/elasticity/review_design_round3.py
```

The script independently constructs NumPy block matrices A=[0 I; -diag(1,4,9) 0], B, C, O=[C;CA;...;CA^5] and K=[B,AB,...,A^5B]. It uses column-normalized SVD instead of the producer's Gauss-Jordan elimination and independently evaluates original-coordinate kernel residuals. For this distinct-frequency finite generator, an additional algebraic check counts the two state components of each participating mode. Node runs serve only as producers of actual module/archive API outputs. No producer elimination code is reused.

The script independently builds the four-column nuisance designs and their SVD nullspaces; tests repeat/omitted-nuisance/drift stress designs; calls actual retained Location and Position forward models; and verifies both archived model source files remain byte-identical to the pinned source trees. Output binds the checked module, documents, archive sources and script to SHA-256 values.

## Actual executed results

Result: **passed**, no mismatches.

| Check | Executed result |
|---|---|
| Geometry/tolerance stress cases | 105: 35 sensor/drive designs at tolerances 1e-14, 1e-10 and 1e-4 |
| Independent temporal O and K rank comparisons | 210/210 agree with producer; all returned original-coordinate kernel residuals are zero in these fixtures |
| Nuisance design comparisons | Both matrices, ranks, target estimability and nullspaces agree |
| Retained Location reflection cases | 8; maximum relative full sampled-response difference 2.91e-16 |
| Retained Position product alias | Exact 0 Hz pole difference and 0 dB response difference, identical frequency grid |
| Invalid/resource-unbounded design inputs | 7/7 rejected |
| Archived source binding | Location and Position model files both byte-identical to pinned source trees |

Representative independent state-rank results:

| Design | Static C rank | Temporal O rank / 6 | Reachability rank / 6 |
|---|---:|---:|---:|
| Center sensor/drive | 1 | 4 | 4 |
| Add quarter-point sensor only | 2 | 6 | 4 |
| Add quarter-point sensor and drive | 2 | 6 | 6 |
| Generic single quarter-point channel | 1 | 6 | 6 |
| Duplicate center channels | 1 | 4 | 4 |
| Endpoints | 0 | 0 | 0 |
| Canonical one-third node | 1 | 4 | 4 |
| Nonnodal p=1e-16 | 1 | 6 | 6 |
| Nonnodal p=.5+machine epsilon | 1 | 6 | 6 |

The last two rows deliberately distinguish structural information from practically tiny response. Column normalization can reveal algebraic rank while erasing magnitude information; neither this review nor the producer treats it as physical noise weighting or an instrument acceptance test.

The fixed locked-temperature design has rank 3/nullity 1 and target-changing kernel proportional to `(0,0,.2,-1)`. Repeating it to 800 rows still gives rank 3. The independently varied-temperature design has rank 4 within its four-column family. Adding a previously omitted preload column `.7*x` creates a five-column rank-4 design and exact target-changing null `(0,0,.7,0,-1)`. This verifies the scope warning: full rank in the smaller declared family does not certify nuisance completeness or causal position attribution.

For the independent quadratic-drift stress, one equally spaced ABBA block has contrast -2c and BAAB has +2c. With curvatures 1 and 2 in opposite blocks, their mean residual is 1 rather than zero. The integrated protocol correctly conditions reversal cancellation on matched curvature and does not claim arbitrary drift rejection.

## Retained-model alias assertions

`globalAliasDiagnostics()` checks actual Location core positions .25/.75, matched temperature, fixed receiver and nonzero coupling. Its reported pole and sampled-response differences are exactly zero. Separately, the script calls the retained Location archive for eight p/1-p pairs. Differences elsewhere are only floating-point effects (at most 2.91e-16 relative response). Analytically, sin(pi*(1-p))=sin(pi*p) and the receiver projection is mirror symmetric, so the defined forward matrices/observable coincide in the ideal model. More bins cannot select one branch of that map.

The actual retained Position contact toy evaluated at `(position=.5, stiffness=1e8)` and `(position=1, stiffness=5e7)` has equal added stiffness 5e7 N/m, identical B frequencies and identical complete sampled B response. The algebra identifies a product, not separate factors. This does not establish that a real contact follows that toy law.

## Scope and honest limitations

The checked generator has three known distinct dimensionless frequencies and illustrative sine participation, not Lamb-sphere mode shapes. It excludes degeneracy, damping uncertainty, finite-time/noisy Gramians, empirical transfer calibration and parameter-estimation accuracy. SVD/pivot cutoffs are numerical conventions; agreement across finite fixtures is not a continuous-domain certificate or an experimental detection limit. The report's many matrix comparisons are arithmetic checks, not independent physical trials.

The protocol preserves same-mode requirements, force-versus-voltage units, N preload versus N/m incremental stiffness, explicit contact/cross-mode projection limits, and separate transient/stationary estimator requirements. Frequency-ratio residuals remain conditional tests against common scaling, not evidence for a unique mechanism. Existing H1/FFT peak pickers remain candidate peak tools; no modal-fit accuracy was admitted by this review.

No broad app/browser/build gate was run by this seat because root and software own that verification. This report admits only the finite design calculations and retained alias controls just checked. No scientific-novelty claim is made. The next missing physical premise remains independently calibrated matched-mode data with prospectively varied/constrained nuisance conditions.


## Packaging custody gate — portability only

The original `review_design_round3.py`, `round3-design-results.json` and pre-addendum `round3.md` are preserved byte-for-byte under `research/panel/independent/elasticity/`. The original script still records its original workspace/worktree assumptions; historical files were not rewritten to conceal them.

A portable adapted copy is supplied as `scripts/verify_design_independent.py`. It accepts `--app-root`, defaulting to the parent of its own scripts directory, so it works with an unpacked source bundle and does not require the original two worktrees. It binds the retained archive model bytes to the SHA-256 values verified in the original result:

- Location archive: `2371578a26dba7cdb580940c8cd64b7fa361a3ec2ee2d52581a6fa8fba2445fe`.
- Position archive: `4d464f1a21bbadc88363fe666720994641079eecf7215f3d80e3fe6b4c18e3d6`.

Only path resolution, archived-source hash custody and receipt metadata changed. Exact source comparison confirmed that all five non-main functions, including every numerical algorithm/case and the Node producer call construction, remain unchanged. The adaptation explicitly labels itself **portability only, with no additional independence**. Its SHA-256 is `c3eb410164965033bdeb18fbc1cb2b56ed10de53eb9c8c904601032f104997c6`. This is a packaging check, not another research/review round or additional independent evidence.

The portable copy was run once with process working directory `/tmp` (outside git), using this exact command and a fresh output path:

```sh
python3 -B /workspace/scratch/c230cc629529/sphere-lab-repo/copper-experiment/scripts/verify_design_independent.py --app-root /workspace/scratch/c230cc629529/sphere-lab-repo/copper-experiment --output /tmp/copper-design-portable-nuyxphh0/results.json
```

Result: **passed**, 105 designs and the same **210 O/K rank comparisons**, two nuisance designs, eight Location reflection cases and seven malformed-input rejections. All count fields match the original receipt. The portable run result is retained separately as `research/panel/independent/elasticity/portability-run-results.json`; the original receipt remains unchanged.

For a source ZIP, install/use Python with NumPy and an available Node executable, then run the portable script from any working directory with a fresh output path. `--app-root` can be omitted when scripts/ remains inside the unpacked app. No numerical modules or algorithms were edited for this gate.
