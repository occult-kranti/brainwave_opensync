# Copper sphere: a reproducible, bounded spectral model

This package verifies a calculation and supplies synthetic controls. No copper sphere has been measured. The new work applies established elastic-sphere theory; scientific novelty is not asserted.

## The measurable question

At two marked positions A and B, does the fitted frequency of the *same identified mechanical mode* change after accounting for temperature, support, orientation, excitation, optical geometry and clock drift? A material point on a table has a frequency-dependent response to excitation, rather than one context-free “true frequency.” A finite measurement can report a calibrated channel over a specified bandwidth and noise floor; it cannot capture every mechanical, electromagnetic, atomic and other degree of freedom.

Translation in a homogeneous environment does not change the ideal free object's elastic eigenvalues. In the model, translating both its domain and displacement coordinates preserves the elastic differential operator and traction boundary condition. Real spatial gradients and changed contacts can break those premises. Ordinary changed spectral amplitude is also possible without changed eigenvalues.

## Scope frozen for the calculator

The material is an effective homogeneous isotropic linear elastic solid, with Young's modulus E, Poisson ratio nu, density rho and radius R. The surface has zero imposed traction. The calculator returns the first three positive roots in the spherically symmetric spheroidal family, angular index l=0. These are radial breathing modes. They are neither the three lowest modes of the entire sphere nor integer harmonics. Torsional and other spheroidal families, anisotropy, damping-dependent complex eigenvalues, oxide layers, air loading and support effects are outside this calculation.

Chemical purity does not ensure elastic isotropy. A single copper crystal is anisotropic; a polycrystal can have texture, large grains and residual stress. E, nu and rho in this model need sample-specific measurement or justified effective values before precision predictions.

## Derivation

Use SI units. The Lamé constants and sound speeds are

\[
\mu=\frac{E}{2(1+\nu)},\qquad
\lambda=\frac{E\nu}{(1+\nu)(1-2\nu)},\qquad
c_T=\sqrt{\mu/\rho},\quad c_L=\sqrt{(\lambda+2\mu)/\rho}.
\]

The elastodynamic equation is

\[
\rho\,\partial_t^2\mathbf u=(\lambda+\mu)\nabla(\nabla\cdot\mathbf u)+\mu\nabla^2\mathbf u.
\]

A regular radial solution has \(u_r=A j_1(k_Lr)e^{i\omega t}\), with \(k_L=\omega/c_L\). The radial traction is

\[
\sigma_{rr}=(\lambda+2\mu)\partial_r u_r+2\lambda u_r/r.
\]

Using \(j'_1(z)=j_0(z)-2j_1(z)/z\), zero traction at R gives

\[
xj_0(x)-4qj_1(x)=0,\quad x=\omega R/c_L,\quad q=(c_T/c_L)^2.
\]

For positive x this is equivalently

\[
(x^2-4q)\sin x+4qx\cos x=0.
\]

The apparent root x=0 of the multiplied equation is excluded. Code uses the regularized characteristic \(g(x)=\sin(x)/x-4q[\sin(x)-x\cos(x)]/x^3\), with its analytic small-x series. The browser bisects one positive root in each of the first three intervals \((n\pi,(n+1)\pi)\), n=0,1,2. The independent Python calculation uses SciPy's spherical Bessel functions and Brent's method.

The cyclic frequencies and sphere mass are

\[
f_n=\frac{x_nc_L}{2\pi R},\qquad m=\frac43\pi R^3\rho.
\]

These equations agree with the l=0 reduction of Saviot and Murray's free-sphere boundary condition (2005, Section II). The separate l>0 determinant must not be treated as a breathing-mode equation. The CNRS calculator also warns that a commonly cited textbook's l=0 expression is incorrect.

## Illustrative copper input and output

R=12.5 mm, E=123.5 GPa, nu=0.35, rho=8960 kg/m³. E and nu are rounded literature averages from Ledbetter and Naimon (1974), Table 10; density is an illustrative ordinary copper value consistent with sample values in that compilation. They are not a certificate for an unknown purchased ball. Independently averaged E, G, bulk modulus and nu in the source need not satisfy one exact identity; this implementation uses only E and nu and derives the other moduli consistently.

| Quantity | Model result |
|---|---:|
| Mass | 0.07330382858 kg |
| Longitudinal speed | 4703.364541 m/s |
| Transverse speed | 2259.423242 m/s |
| First radial root | 2.78117692164 |
| First radial breathing frequency | 166551.0505 Hz |
| Second radial family frequency | 367096.7937 Hz |
| Third radial family frequency | 558432.0580 Hz |

An ordinary 48 kHz audio interface cannot acquire these bulk-mode frequencies. A declared 200 kHz analysis band covers the first listed mode only. Capturing all three requires a higher verified analog bandwidth, sampling rate and suitable excitation/detection; the strict Nyquist inequality is necessary but does not establish an adequate instrument chain.

## Sampling and uncertainty

For declared band f_max and rate f_s, require f_s>2 f_max and a suitable anti-alias filter. The selected target mode must also lie inside f_max. With duration T, Fourier-bin spacing is 1/T. It is not a universal bound on fitted-frequency uncertainty; noise, damping, model fit, clocks and repeated observations matter. For the oscillator convention Q=1/(2 zeta), the amplitude ringdown e-folding time is Q/(pi f_n), where f_n is the undamped natural frequency. The usual linewidth estimate f_n/Q assumes weak damping.

At fixed nu, \(f\propto R^{-1}E^{1/2}\rho^{-1/2}\). First-order independent-input propagation gives

\[
(u_f/f)^2=(u_R/R)^2+(u_E/2E)^2+(u_\rho/2\rho)^2+
\left(\partial_\nu\ln f\;u_\nu\right)^2.
\]

The calculator's Poisson sensitivity includes the changing characteristic root, not just c_L. It is checked against implicit differentiation. Add covariance terms when inputs are correlated. This propagated model uncertainty excludes anisotropy and support bias, and is distinct from a paired A/B experimental uncertainty where common calibrations can cancel.

For thermal drift,

\[
\frac{d\ln f}{dT}=-\alpha_R+\tfrac12\frac{d\ln E}{dT}
-\tfrac12\frac{d\ln\rho}{dT}+\partial_\nu\ln f\frac{d\nu}{dT}.
\]

If mass is constant and thermal expansion is isotropic, \(d\ln\rho/dT=-3\alpha_R\), so the geometric/density contribution together is +alpha_R/2. Reporting only -alpha_R as copper's frequency temperature coefficient would be incorrect. Use measured mode-specific thermal coefficients for the actual specimen and temperature range.

## Synthetic spectra and falsifiers

The plotted illustrative transfer is a complex sum

\[
H(f)=\sum_j\frac{a_j}{1-(f/f_j)^2+i f/(Qf_j)}.
\]

These normalized modal responses have no calibrated displacement units. In the observation-path scenario, only residues a_j change: the highest peak can jump from one mode to another while every f_j remains fixed. In the support scenario, a deliberately simplified independent spring model uses

\[
f'_j=\frac1{2\pi}\sqrt{(2\pi f_j)^2+k/m_{\rm eff}}.
\]

Here m_eff is explicitly chosen to equal the sphere's total mass for illustration. A real Lamb mode has a mode-shape-dependent effective mass and contact coupling. This toy does not predict the measured frequency shift of a copper sphere on a table. No experimental data are implied. k=0 is an exact null control; positive k shifts the toy modes upward. Changing residues at k=0 must leave intrinsic poles unchanged.

## Experimental interpretation

An air-bearing carriage reduces horizontal sliding resistance; it does not remove sphere support forces, air pressure, acoustic coupling or damping. Transport the same marked cradle and ball without rolling the sphere, hold orientation and optical incidence fixed, stop and settle before acquisition, and monitor temperature. Moving while recording introduces nonstationarity and potential Doppler effects.

Separate a low-frequency tabletop survey from ultrasonic sphere-mode measurements. Map table acceleration or velocity spectra and force-normalized response at A/B with the object absent; then measure the supported ball; then repeat with a second mounting condition. Fit an identified mode and its shape/polarization rather than comparing the tallest raw FFT peak. A voltage-to-velocity transfer is not a force-to-velocity mechanical mobility unless the excitation force is calibrated.

Use a position sequence that includes returns, remounts and reference observations. If A/B changes disappear after support or optical-path matching, the data support a coupling explanation. A persistent residual requires an explicit uncertainty budget and independent replication. A null result reports the detectable shift threshold in the selected band, not proof that all possible frequencies are identical.

## Reproduction

`python -B verify_physics.py --model /absolute/path/model.mjs --check /absolute/path/physics-verification.json`

The verifier runs 29 material/geometry cases against an independent spherical-Bessel formulation, scaling identities, invalid inputs, sampling limits, synthetic null/perturbation controls and an independent implicit derivative. The maximum observed relative frequency difference is about 3.2e-14. That number measures implementation agreement for this model, not the prediction's accuracy for a real copper specimen.
