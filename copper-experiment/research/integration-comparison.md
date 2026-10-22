# Two copper labs: comparison and integration decision

22 October2026. Compared Location1.1 at07e57b4 and Position1.0 ata8913c8 using actual source, independent numerical checks and targeted interface/data probes. Both earlier projects remain useful within their stated scope; passing old tests did not cover all the new rejection cases. No physical dataset was supplied.

| Layer | Location Spectrum | Position Spectroscopy | Current integrated decision |
|---|---|---|---|
| Object | Default thin shell, separate solid reference | Default solid sphere | Keep geometry and radius convention explicit. The defaults are different specimens, not contradictory predictions. |
| Free elastic modes | Radial solid roots and coordinate modal masses; thin membrane shell | Three free radial solid roots | Keep the checked core and expose three solid radial modes and ratios. Neither is the full elastic spectrum. |
| Fixture | Passive spring energy coupling sphere and a table coordinate, with all cross terms | Separate normalized-residue and independent-spring toys, using whole mass by declaration | Keep the legacy toy visible as historical. New three-radial-coordinate point-spring diagnostic retains rank-one cross terms and modal masses; it is still a finite projection, not calibrated contact. |
| Observation | Displacement/force in m/N; separate empty-table driving-point response | Normalized synthetic magnitude; offline velocity/force and acceleration PSD | Preserve quantities. Use complex derivative conversion only for the same calibrated input/readout geometry. |
| Sampling | Finite ringdowns, FFT/windows/noise/aliases, covariance | Sampling budget and stationary trace analysis | Retain synthetic acquisition and corrected H1 analysis as different tools, not measured data by relabeling. |
| Statistical input | Declared standard-uncertainty comparison; no automatic coverage interpretation | User-entered same-mode block estimates and conditional Student-t comparison | Keep sampling and systematic uncertainty separate. ABBA/pilot counts do not identify a confounded position effect or certify power. |
| Inverse inference | Declared symmetry and material-scaling kernels | Position/support product ambiguity | Make these limitations executable. Add temporal observability, reachability and nuisance-target estimability; full finite rank is not global uniqueness. |
| Code/data trust | Rich JSON provenance, incomplete CSV sidecar; broken standalone test package and stale bridge | Raw hashes, CLI validation; duplicate-header bug and force/voltage contract mismatch | Use validated/applied immutable run exports, paired CSV/JSON run bundle, force-only byte-bound metadata and malformed-input rejection. |
| Sources |80 records with some unresolved project pointers |28 records with evidence-linked topics | Conservatively merge identities, retain per-origin observations and an explicit project-interpretation record; validate every edge's evidence. |
| Preservation | Earlier reports and source hashes | Source ZIP and full file manifest | Preserve three earlier built versions, original file hashes, exact original HTML and recorded archive banners. Current approval does not rewrite old receipts. |

## Quantified differences, with their scope

At a common solid copper radius12.5mm, both solvers give the same first three radial frequencies to numerical accuracy: approximately166551,367097 and558432Hz. At44.45mm the first solid radial mode is approximately46836.6Hz. The default thin-shell reference at that midsurface radius is approximately23317.7Hz. Material constants are reference assumptions, not specimen certification.

For a surface-displacement coordinate, the first three solid radial modal masses are about1.1282,1.4235 and1.4669 times total physical mass in the stated isotropic family. Choosing whole mass independently for each coordinate is an illustrative convention, not an interchangeable physical projection. A single grounded point spring has energy `k(sum q_n)^2/2`; all projected stiffness entries are present. This still omits rigid and nonradial motion and therefore does not fully model a real point contact.

The thin membrane and full radial shell calculations differ by about0.4066Hz at the default shell geometry. A geometric cutoff is not a sub-Hz error guarantee. This is a model-to-model discrepancy, not a measured bias, and unchanged geometric discrepancy should not automatically be counted as independent A/B random error.

For a matched force/displacement response under `exp(iωt)`, mobility is `H_vF=iωH_xF`. At23317.7Hz the magnitude factor is about146510persecond and phase differs byπ/2. An apparent amplitude discrepancy can therefore be a unit/channel mismatch. A normalized synthetic plot has no calibrated conversion unless that normalization and instrument chain are supplied. DC inverse-derivative conversion is undefined.

## What the merged work can newly test

1. Whether a claimed diagnostic survives exact scale invariances, rank-one cross terms and a different modal coordinate normalization.
2. Whether adding a sensor repairs temporal observability while a mode remains unreachable from the chosen drive.
3. Whether a position coefficient is estimable when temperature is locked to position, and why repeated confounded rows do not solve that problem.
4. Whether a force/velocity file survives a strict unit/provenance boundary, rejects duplicate channels and closes a known synthetic complex response.
5. Whether a historical analogy supplies an actual coupling term or merely suggests an experiment. Gateway source labels and numerical similarities do not bypass the same identifying-information contract.

These are original project integrations of established principles, not a validated new law or a claim of scientific novelty. All fitted physical pole identification, actual specimen calibration and held-out physical replication remain future work.
