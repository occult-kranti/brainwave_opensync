# Producer model review

Status: accepted for the declared ideal-sphere calculator and clearly labeled synthetic examples after two repairs. This does not admit a physical location-dependent frequency result. UI and final derivation-document review remain separate until supplied.

The initial independent protocol and eight grouped controls remain frozen by `independent-freeze.json`; they were written before producer inspection. This follow-up inspected `physics/model.mjs` and `physics/verify_physics.py` on the parent's request. Producer files were not edited by the reviewer.

## Confirmed mathematical scope

The radial displacement `u(r)=A j_1(omega r/c_L)` and radial traction boundary condition give

`(lambda+2 mu) x j_1'(x) + 2 lambda j_1(x) = 0`,

or `x j_0(x) - 4(c_T/c_L)^2 j_1(x)=0`. The producer's normalized trigonometric equation is equivalent. It excludes the trivial zero of the unnormalized displacement representation and returns the first three positive roots of the l=0 radial family. It does not calculate the full sphere spectrum or the lowest modes of all families.

The Hz conversion `f=x c_L/(2 pi R)`, GPa-to-Pa and mm-to-m conversions, mass formula, and the E/rho/R scalings are consistent. A negative Lame lambda at an allowed auxetic Poisson ratio is not itself an error: shear and bulk moduli remain positive over the stated domain. The default copper values are effective illustrative material inputs, with isotropy and specimen dependence explicitly outside numerical correctness.

The added-spring formula is algebraically correct for independent modal coordinates with the specified effective mass. The choice of whole-sphere mass is an assumption, not a derived Lamb-mode mass or a calibrated Hertzian contact model. The labels retain that limit. The response-path example retains identical poles and changes observation residues, so it illustrates the failure of selecting the largest peak as a material-frequency test.

The uncertainty function is first-order propagation for independent input standard uncertainties. It correctly separates this prediction uncertainty from the uncertainty of measured A/B differences. It is not a validated coverage interval and excludes model discrepancy, parameter covariance and support/thermal effects. The centered Poisson derivative requires an interior nu value and deliberately rejects exact domain endpoints.

## Findings repaired by the producer

1. Allowed small Q values generated negative extra frequency points in a one-sided display. The producer now filters nonpositive plot points and tests Q=0.51. The reviewer independently exercised that boundary.
2. A Nyquist check for the chosen upper analysis band did not show whether the selected mode lay inside that band. The producer now exposes `modeWithinBand` and `validPlan`. The reviewer checked a case in which Nyquist passes but the selected mode lies outside the declared band. The UI must label this as a numeric sampling check; instrument calibration and anti-alias filtering are still required.

The default 200 kHz sampling budget covers the first predicted radial mode near 166.6 kHz. It does not cover all three modeled radial modes. The broader synthetic response plot is a model illustration and must not inherit the first-mode acquisition status.

## Executed independent review

`python -B review_model.py --model ../physics/model.mjs --output postreview-model-results.json`

The reviewer used the original radial stress expression with independent SciPy spherical-Bessel derivatives, not the producer's simplified characteristic. Across 104 Poisson-ratio values spanning the full allowed range, 312 positive roots agreed to a maximum relative frequency difference below 3.9e-14. Dense per-interval sign scans found one crossing in each requested interval for those test values. This numerical sampling is not a proof of root completeness for a continuum of parameters.

Four grouped follow-up checks also cover low-Q frequency positivity and finite response, selected-mode band coverage, zero-uncertainty inputs and five invalid inputs. Normal and optimized Python outputs match byte for byte. The receipt binds the reviewed model SHA-256. Eight earlier independent grouped controls separately test drift, peak identity, support loading, covariance, shared clocks and thermal bookkeeping.

No blocking mathematical issue remains in these reviewed files for the stated model scope. Actual data collection, calibrated apparatus performance, unknown-position-effect inference and full elastic-mode reconstruction remain unperformed.
