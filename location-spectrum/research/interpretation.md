# What does a location-dependent spectrum mean?

Research snapshot: 21 October 2026. This document states the experimental question and the limits of the implemented models. All numerical curves are calculations. No sphere, table or motion experiment has been measured.

## A measurable replacement for “entire true frequency”

An object can have elastic vibration modes, thermal fluctuations, electromagnetic response, electronic transitions and other observables. These do not collapse into one number in hertz. The spectrum of a recorded channel also depends on how that channel is excited and observed. A finite-band measurement cannot identify every mode or reconstruct the object's complete physical state.

The useful question here is: **does the fitted frequency of the same identified elastic mode change between positions A and B beyond the experiment's stated uncertainty, after ordinary changes are controlled?** A second question measures the table's local mechanical response. A third, separate question tests the source's proposed destination-selective motion.

## Forward model and inverse inference

For linear vibration, write M q̈ + C q̇ + K q = B F. At angular frequency ω, the measured response is

    y(ω, x) = H(x) [K(x) − ω²M(x) + iωC(x)]⁻¹ B(x) F(ω) + noise.

M is the modal mass matrix, C the damping matrix, K the stiffness matrix, B the input participation and H the observation projection. Their coordinate dependence must come from a specified physical mechanism. The location x alone is not a new oscillation or a quantity with units of hertz.

Natural frequencies solve det(K − ω²M) = 0 in the undamped approximation. A measured maximum also depends on damping, modal residues, the drive spectrum and the readout. Recording a changed maximum does not uniquely identify which part changed.

If the isolated specimen and a uniform environment are translated together, the translated elastic operator has the same spectrum. Moving only the specimen on a fixed table is a different operation: the support, local table-mode participation, beam angle and temperature may change. Those ordinary mechanisms are explicitly exposed in the simulator.

## What the browser actually calculates

- A homogeneous isotropic solid sphere's first radial breathing root with a traction-free surface. Other spheroidal and torsional modes are not computed.
- A thin hollow sphere's uniform membrane breathing approximation. Radius is the mid-surface radius; seams, anisotropy, bending modes and fluid loading are omitted.
- A passive two-mode sphere/fixture model, with a full contact-spring energy including diagonal stiffness changes. Its fixture frequency, damping and modal mass are assumed inputs, not a prediction for a real table.
- An empty fixture's local driving-point response. Its mode shape enters twice, once through excitation and once through detection. A modal node can hide a resonance without removing the mode from the table.
- A mass-conserving temperature sensitivity and an explicitly defined optical projection. The projection changes amplitude, not poles.

The independent reference also checks a full three-dimensional radial shell determinant against the membrane limit. This checks that approximation under ideal assumptions; it is not a finite-element model of a manufactured shell.

## Interpreting residuals

A residual associated with location can motivate further work. It is not by itself evidence of an absolute spatial frequency, teleportation or a new force. Before extending the model, test the same effect after translating or rotating the table, swapping supports, preserving beam geometry, changing specimen orientation and repeating on a different day. Declare a smallest effect of interest and a detection threshold before inspection so “insufficient sensitivity” does not make the claim unfalsifiable.

A null result is useful: it bounds the chosen mode under the tested conditions. It does not demonstrate that every possible physical channel was captured. A nonzero result requires a new discriminating experiment, not merely a more elaborate frequency label.

## Recent mathematics and AI

The source map includes selected UAI, AISTATS, ICML and L4DC papers, two relevant OpenAI mathematics manuscripts and recent Claude-assisted quantum-circuit work. Their graph edges mean a stated methodological connection; they are not endorsements of this experiment or proof of its motivating claim.

The selected OpenAI elasticity manuscript claims recovery from a complete static boundary operator. That is much richer data than a few peaks. Its scope page lists uniqueness but no reconstruction algorithm; no Lean kernel was run here. The selected boundary-patch family has a formalization page for a different companion result, so the headline theorem is not marked formally checked by this project. The quantum-circuit work informs the proposal-and-independent-evaluator workflow; it supplies no elastic sphere mechanism. Neural inverse methods remain optional future tools, not hidden components of the browser model.

## Historical methods, clearly attributed

Tesla's 1892 lecture motivates recording tuning, coupling and losses. Newton's analysis/synthesis discussion motivates moving from an observation to competing causes and back to a testable prediction. These are methodological inspirations. Neither historical source supplies the contemporary copper-sphere location claim or the modern equations implemented here.

## Further experiments worth doing

1. Establish support and temperature sensitivity on one stationary specimen before interpreting location contrasts.
2. Map an empty table's point-to-point and driving-point response with calibrated excitation and repeat the mapping after loading it.
3. Compare multiple surface observation points to determine whether apparent shifts are actually changes in visible mode identity.
4. Fit a specimen-specific elastic model with held-out modes or positions as validation. Report which parameter combinations are weakly identifiable.
5. Test directed motion only as a separate force and momentum experiment with level, airflow, source-direction and equal-input controls.

The six on-page hypotheses are operational research questions and known model consequences. Scientific novelty is not claimed.
