# Advisor decision: position spectroscopy

Research cutoff: 21 October 2026. This is a new bounded experiment-design page, not an additional Yang–Mills research loop. The historical Tesla and Newton skills guided mechanism specification and inverse-inference criticism. Separate model agents produced the mathematical implementation, source review, experimental skepticism and analysis tools. The coordinating agent implemented the interface and integrated the outputs. No historical scientist participated; no human peer review or hardware experiment is claimed.

## Accepted scope

1. **A defined observation.** Measure finite-band surface velocity, calibrated force-to-velocity transfer where a force reference exists, table acceleration, and separate environmental channels. A point on a table has a spatial transfer function for a specified source and sensor configuration. No universal scalar “frequency of the location” is assumed.
2. **A checked ideal model.** The first three positive radial breathing roots of a homogeneous, isotropic, traction-free sphere are computed from the radial stress boundary condition. For representative copper inputs, the first is about 166.551 kHz. It is not necessarily the lowest mode of the sphere. Numerical agreement does not remove specimen anisotropy, support loading or uncertain material constants.
3. **A discriminating counterexample.** The synthetic readout can switch its tallest peak while all poles remain unchanged. A separate added-spring example changes poles, using an explicitly assumed effective mass. It does not calibrate a real contact.
4. **A testable protocol.** Stationary acquisitions after translation, balanced randomized ABBA/BAAB blocks, return, sham, remount, rotation, thermal and reference controls. A low-friction carriage still supports the sphere; it is not a traction-free boundary. A difference must survive known confounds before a new physical interpretation is considered.
5. **Reproducible analysis.** H1, coherence and table PSD from synchronized calibrated input channels; matched-mode block differences and a Student-t sampling interval. The tools do not acquire hardware or fit the entire sphere spectrum. The relative force-PSD division guard is not an instrument noise-floor test.

## Review-driven changes

The skeptic's derivation and control examples were frozen before producer inspection. Subsequent review found two concrete software issues: low-Q plotting neighborhoods could include negative frequencies, and the sampling plan did not separately check whether the chosen mode lay within the declared band. Both were repaired and independently checked. The analyst's excitation flag was clarified to distinguish numerical validity from physical SNR. The simple sampling checker is therefore described as a numerical planning aid, not a calibration approval.

For the default specimen, the 200 kHz analysis band covers only the first displayed radial mode. The three-mode response illustration extends beyond it and remains synthetic. Ordinary audio microphones cannot measure these illustrative bulk radial modes. In the ultrasonic tier, voltage-normalized piezo response has units (m/s)/V; it becomes mechanical mobility only with a valid force calibration. Excitation contact and preload must be modeled or measured.

## Source interpretation

Direct elastic-sphere, copper RUS, contact, thermal and metrology sources guide the apparatus. Actual venues and reading depths are recorded. Selected accepted ICLR/NeurIPS papers inform future inverse modeling under their own assumptions; they are not validation of this apparatus. The official October OpenAI mathematics release is identified, including a reported full-boundary-data elasticity uniqueness result. That data class is far richer than two spectra, and its proof has not been audited here. Specific Anthropic mathematics and quantum-circuit reports illustrate independently evaluated computational workflows. No unspecified equivalent Anthropic paper dump is invented.

## What has and has not been resolved

The numerical implementation, parameter conversions, scaling and wrong-inference examples are reproducible within their declared models. They are applications and demonstrations of established mechanics and statistical methods, not asserted new laws or verified scientific priority. The page's contribution is the integrated apparatus contract, executable controls, calculators, source network and data-analysis workflow.

No position-dependent intrinsic frequency effect has been measured. Full elastic-tensor recovery, complete modal reconstruction, calibrated achievable precision, experimental sample size and any residual unexplained position effect remain open. A null result must be reported with its interval and scope; absence of a statistically resolved shift is not automatically proof of equivalence.

## Verification record

`physics-verification.json` records the producer's independent-formula numerical checks; `postreview-model-results.json` records the separate skeptic's 312-root sweep. The `initial-review/` directory preserves the pre-comparison evidence. `analysis/verification.json` records synthetic CLI runs and tests. Final interface and release checks are recorded separately in `verification.json`; source hashes bind the reviewed files. This distinction prevents a passing calculation from being described as a completed physical experiment.
