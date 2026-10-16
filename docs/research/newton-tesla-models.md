# Newton–Tesla laboratory: model definitions

These are modern textbook teaching models grouped under the historical research laboratory. The grouping does not attribute every equation to Newton or Tesla. Code lives in `src/newton-tesla/models.ts`; tests live beside it. All plots and CSV files use deterministic arithmetic. No simulation controls hardware or predicts biological response.

## Orthogonal field geometry

The abstract field components are `Bx = cos θ` and `By = a cos(θ−φ)`, where `a` is an amplitude ratio and `φ` is phase. For `a=1` and `φ=90°`, the vector traces a unit circle as θ increases. Unequal amplitudes or other nonsingular phases give an ellipse. At zero/180° phase, or zero second-axis amplitude, the path is a line. The sign of `sin φ` sets the rotation direction in the Cartesian plot.

The quadrature construction is a deliberately reduced illustration of the two-phase treatment in [MIT Electromechanical Dynamics, Chapter 4, §4.1.3–4.1.4](https://ocw.mit.edu/courses/res-6-003-electromechanical-dynamics-spring-2009/30dd72688208782bff485372c57bd3c3_chap04_emd.pdf), particularly equations 4.1.24–27 and 4.1.32–33. It is not a finite-element field solution or motor model. The component axes are dimensionless: no tesla, ampere, coil geometry, torque or exposure is calculated.

The summary computes exact minimum and maximum vector magnitude from the singular values of `M = [[1,0],[a cos φ,a sin φ]]`. Let `s=1+a²` and `d=a² sin²φ`; the larger squared radius is `(s+sqrt(s²−4d))/2`, and the smaller is `d/larger`. The latter form avoids subtractive cancellation near a line. Geometry classification uses a small numerical tolerance at exact degeneracies. These implementation checks follow directly from linear algebra, independently of any historical interpretation.

## Passive series RLC

The circuit contains one ideal resistor, inductor and capacitor in series, driven by the specified sinusoidal voltage source. All displayed voltage/current magnitudes use RMS convention. Inputs convert from millihenries to henries (`×10⁻³`) and nanofarads to farads (`×10⁻⁹`) before calculation.

With `ω=2πf`, the reactances are `XL=ωL`, `XC=1/(ωC)`, and the impedance is `Z=R+j(XL−XC)`. Hence

`Irms = Vrms / sqrt(R²+(XL−XC)²)`.

The plotted current phase relative to source voltage is `−atan2(XL−XC,R)`: positive means leading, negative means lagging. Mean supplied power is `Vrms Irms cos(arg Z)`, equal to resistor dissipation `Irms² R`. Reactive power is `Irms²(XL−XC)` in var; apparent power is `Vrms Irms` in VA. Ideal L and C exchange stored energy with the source and consume no mean real power. Resonant voltage magnification does not create energy.

These relations follow [MIT 6.071/22.071, Frequency response: resonance, bandwidth and Q](https://ocw.mit.edu/courses/6-071j-introduction-to-electronics-signals-and-measurement-spring-2006/5bcec4bfba5f2e99754b77509e9e7ab4_resonance_qfactr.pdf), with conversion from peak to RMS convention where appropriate. The circuit is passive; losses beyond R, transient startup, saturation, parasitic effects and component ratings are outside the model.

### Three different frequency statements

The ideal series current reaches its maximum at `f0=1/(2πsqrt(LC))`, where `XL=XC` and `I=V/R`. The quality factor is `Q=ω0L/R`. These current-resonance definitions agree with [OpenStax University Physics Volume 2, §15.5](https://openstax.org/books/university-physics-volume-2/pages/15-5-resonance-in-an-ac-circuit). The plot normalizes current by `V/R`, rather than by an arbitrary sampled maximum.

The capacitor-voltage maximum is a different observable. Put `r=f/f0`. Directly dividing the capacitor impedance by total impedance gives

`|VC/V| = 1/sqrt((1−r²)²+(r/Q)²)`.

Differentiating its denominator gives a positive-frequency maximum at `r=sqrt(1−1/(2Q²))` only when `Q>1/sqrt(2)`. The model reports the resulting frequency; otherwise it returns `null` to indicate no positive-frequency capacitor-voltage maximum. This is an analytical derivation from the stated circuit, not an independent experimental finding. It may lie outside the plot interval. At current resonance the separate L/C voltage magnitudes equal `Q V`; their phases oppose each other.

Neither frequency should be confused with the damped natural frequency of an unforced transient. That transient is not simulated here.

The numerical teaching domain is L=1–100 mH, C=100–10000 nF, R=100–2000 Ω, f=20–20000 Hz, and source=0.1–1 Vrms. These are calculation bounds, not instructions for constructing a device or a real-component safety assessment. The sweep covers `max(20,0.1f0)` through `min(20000,3f0)` Hz, with split logarithmic spacing and an explicit sample at `f0`.

## Refraction and critical angle

This model uses Snell's law, `n1 sin θ1 = n2 sin θ2`, with all angles measured from the surface normal. The supplied refractive indices are dimensionless parameters. It assumes homogeneous isotropic media and one flat interface. It does not assign a material, model dispersion, compute Fresnel power fractions or map colors to audible tones.

For `n1>n2`, the critical angle is `asin(n2/n1)`. At exactly that angle the geometric transmitted ray is grazing (`θ2=90°`). Above it the model reports total internal reflection and `transmittedDeg=null`, rather than taking an inverse sine outside its domain. Below critical incidence, or when entering a higher-index medium, it returns the refracted angle. The reflected ray has the incident angle. An evanescent field can exist under total internal reflection, but this ray model does not calculate it.

The source is [OpenStax University Physics Volume 3, §1.4](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection). The model permits supplied indices 1–2.5 and incident angles 0–89.9°. It is a modern optics demonstration, not a claim that Snell's law originated with Newton.

## Validation and exports

Every input is checked before allocating arrays; malformed objects, missing/nonnumeric/nonfinite values and domain violations throw clear errors. Every plot contains at most 600 rows. RLC needs at least three to retain both endpoints and resonance; field/refraction sweeps need at least two. All functions return reproducible data without random numbers.

Each CSV includes version, model identity, assumptions, complete inputs and named units. RLC also records the selected operating point, including mean power balance and the distinct capacitor maximum. Empty optical transmission cells mean no propagating transmitted ray, with a separate 0/1 TIR column; no NaN is exported. Metadata lines begin with `#`.

Tests check circle/ellipse/line geometry, rotation reversal, analytic magnitude bounds, unit conversions, current resonance, source/resistor power equality, the power triangle, phase signs, voltage/current peak distinction, source scaling, bounded sweep frequencies, Snell's law, reversibility, the critical-angle boundary, invalid inputs, allocation limits and CSV reproducibility. Sources were accessed on 2026-10-16; the code and explanatory diagrams are original calculations rather than copied source illustrations.
