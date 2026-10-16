# Levitation laboratory: mathematical model contracts

These deterministic calculations compare ordinary force mechanisms. They contain no audio rendering, ultrasound driver, magnet controller, biological model or hardware instructions. Numerical pressure and field gradients are hypothetical inputs, not operating recommendations. Source equations and our translations are distinguished below. Source access checked 16 October 2026.

Implementation: `src/levitation/models.ts`. Tests: `src/levitation/models.test.ts`. All functions are pure and reject malformed records, nonfinite values and out-of-range inputs before allocating numerical rows. Acoustic and magnetic plots accept 2–600 rows; mechanical sweeps accept 3–600. The UI downloads CSV through the existing export helper.

## 1. Ideal standing acoustic wave and gravity

The primary derivation is [Settnes and Bruus, *Physical Review E* 85, 016327 (2012), author preprint](https://arxiv.org/pdf/1110.6037). We use its inviscid small-sphere limit, not its more general viscous correction. Its liquid examples are not a validation of an air experiment. Fixed teaching parameters are air density $\rho_0=1.2\,\mathrm{kg/m^3}$, sound speed $c_0=343\,\mathrm{m/s}$ and $g=9.80665\,\mathrm{m/s^2}$.

Let upward position be $z$, $k=2\pi f/c_0$, and $\theta=kz+\phi$. The imposed fields are

$$p(z,t)=p_A\cos\theta\cos\omega t,\qquad v(z,t)=\frac{p_A}{\rho_0c_0}\sin\theta\sin\omega t.$$

$p_A$ is the **peak pressure at an antinode**, not RMS. Exported pressure and velocity amplitudes are signed spatial coefficients with different temporal phases; they are not simultaneous instantaneous peaks. Pressure RMS at a location is $|p_A\cos\theta|/\sqrt2$.

For a homogeneous sphere with volume $V=4\pi a^3/3$, particle density $\rho_p$ and compressibility $\kappa_p$,

$$\kappa_0=\frac{1}{\rho_0c_0^2},\quad f_1=1-\frac{\kappa_p}{\kappa_0},\quad f_2=\frac{2(\rho_p-\rho_0)}{2\rho_p+\rho_0},\quad \Phi=\frac{f_1}{3}+\frac{f_2}{2}.$$

Our coefficient convention follows the cited preprint; other papers can number these coefficients differently or call $3\Phi$ the contrast factor. With $E_{ac}=p_A^2/(4\rho_0c_0^2)$,

$$U_{ac}=VE_{ac}[f_1\cos^2\theta-\tfrac32f_2\sin^2\theta],\qquad F_{ac}=-\frac{dU_{ac}}{dz}=3VkE_{ac}\Phi\sin2\theta.$$

The sphere experiences weight $\rho_pVg$ downward and buoyancy $\rho_0Vg$ upward. Define $W=(\rho_p-\rho_0)Vg>0$ over the chosen range. Then

$$U_{total}=U_{ac}+Wz,\qquad F_{net}=F_{ac}-W.$$

Force and acoustic potential repeat after $\lambda/2$. The signed pressure field repeats after $\lambda$; a half-wavelength changes its sign. The gravity tilt makes total potential nonperiodic. Increasing spatial phase by $\Delta\phi$ translates the landscape by $-\Delta\phi/k$. This phase is a coordinate of the ideal standing wave, **not a claimed mapping to two real transducer controls**.

Writing $A=3VkE_{ac}\Phi$, an equilibrium solves $A\sin2\theta=W$. If $|A|<W$, every net force is downward and no equilibrium exists. If $|A|>W$, one local restoring root and one unstable root occur per force period. The restoring condition is $dF_{net}/dz=2kA\cos2\theta<0$, and its stiffness is $K_z=2k\sqrt{A^2-W^2}$. Both positive and negative contrast are handled. At $|A|=W$ the roots merge with zero stiffness: this is **marginal**, not stable. Numerical equality uses a relative force-ratio tolerance of $10^{-10}$.

`minimumPressurePeakPa` is the algebraic force-ceiling threshold, not a pressure recommendation and not a sufficient condition for real trapping. Strictly restoring equilibrium requires pressure above this equality. It is `null` when contrast cancels within $10^{-14}$. Force, weight and stiffness scale with particle volume, while their force ratio and pressure threshold do not within this approximation. Real size effects outside the model do not cancel.

| Acoustic input | Bound | Unit |
|---|---:|---|
| `frequencyHz` | 20,000–80,000 | Hz |
| `pressurePeakPa` | 0–3,000 | Pa peak, virtual |
| `particleRadiusMm` | 0.05–0.2 | mm |
| `particleDensityKgM3` | 10–3,000 | kg/m³ |
| `particleCompressibilityPaInv` | 0–0.00002 | Pa⁻¹ |
| `phaseDeg` | −180–180 | degrees of spatial phase |

The rectangular size/frequency range keeps $ka<0.294$. This is our numerical restriction, not a universal error bound or validity theorem. The inviscid approximation additionally requires the viscous boundary layer to be small relative to the sphere; thermal effects in gas may matter. Neither is modeled. Streaming drag, finite boundaries, attenuation, material resonances, particle deformation, interactions and transverse confinement are absent. A 1D restoring slope says nothing about full 3D confinement or asymptotic settling without damping. Density and compressibility are independent hypothetical inputs, not calibrated material presets.

API: `calculateAcousticTrap`, `buildAcousticRows`, `acousticCsv`, `DEFAULT_ACOUSTIC_INPUT`. The summary labels weight, buoyancy, effective weight, contrast, $ka$, energy density, force margin, phase translation, root classification and vertical stiffness. Positions are reported in metres in one force period, including nullable stable, unstable and marginal roots. Rows give pressure/velocity spatial coefficients, forces and potentials.

## 2. Local diamagnetic force budget

[Berry and Geim, *Of flying frogs and levitrons* (1997)](https://www.physics.umd.edu/grt/taj/411c/FlyingFrogs.pdf) discusses magnetic potential, levitation and spatial stability. We implement only the local weak, linear, isotropic susceptibility approximation:

$$U=\rho Vgz-\frac{\chi V}{2\mu_0}B^2,\qquad F_{mag,z}=\frac{\chi V}{2\mu_0}\frac{d(B^2)}{dz},\qquad F_{net,z}=F_{mag,z}-\rho Vg.$$

$\chi$ is dimensionless **SI volume susceptibility**, negative here. With $z$ upward, a negative $d(B^2)/dz$ gives an upward diamagnetic force. The gradient is $d(B^2)/dz=2B\,dB/dz$, so substituting a published $B\,dB/dz$ number without multiplying by two would be an error. We use $\mu_0\approx4\pi\times10^{-7}\,\mathrm{H/m}$ as a teaching approximation; it is not an exact defining constant in revised SI.

The local balance gradient is $2\mu_0\rho g/\chi$. Both magnetic force and weight scale with $V$, so their ratio and balance gradient are independent of sphere radius in this approximation. A uniform field has no force. A positive gradient pushes this diamagnet downward and adds to weight.

| Magnetic input | Bound | Unit |
|---|---:|---|
| `susceptibility` | −0.0005 to −0.0000001 | dimensionless SI |
| `densityKgM3` | 100–20,000 | kg/m³ |
| `radiusMm` | 0.1–10 | mm |
| `fieldSquaredGradientT2PerM` | −5,000–5,000 | T²/m, signed |

The material is assumed small relative to the field-variation length; its backreaction and demagnetization corrections are omitted. Anisotropic materials require a tensor susceptibility. Buoyancy is omitted in this separate model. No field geometry is specified or certified realizable. The gradient sweep compares independent local budgets, not positions along a real magnetic field. **Force balance alone cannot establish stability:** a spatial potential and restoring behavior in every relevant direction are needed. The output deliberately has no stability field.

API: `calculateDiamagneticBalance`, `buildDiamagneticRows`, `diamagneticCsv`, `DEFAULT_DIAMAGNETIC_INPUT`. The summary returns signed magnetic and net force, positive weight, force/weight ratio, required signed gradient and the local classification `balanced`, `upward-excess` or `downward-excess`.

## 3. Driven mechanical vibration comparison

[OpenStax, Forced Oscillations](https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations) presents the driven damped oscillator. This panel is explicitly **not a levitation or feedback model**. A conventional linear spring supports the mass; gravity gives static downward sag $mg/k_s$. Dynamic displacement $x$ is measured from that equilibrium:

$$m\ddot x+b\dot x+k_sx=F_A\cos\omega t,\quad \omega_0=\sqrt{k_s/m},\quad b=2\zeta\sqrt{k_sm}.$$

With $r=\omega/\omega_0$, the steady displacement peak and force-relative phase are

$$X=\frac{F_A/k_s}{\sqrt{(1-r^2)^2+(2\zeta r)^2}},\qquad\alpha=-\operatorname{atan2}(2\zeta r,1-r^2).$$

Negative phase denotes displacement lag. Differentiating that amplitude equation gives our displacement-response maximum at $f_0\sqrt{1-2\zeta^2}$ only for $\zeta<1/\sqrt2$; otherwise there is no positive-frequency displacement maximum. It is distinct from natural frequency $f_0$. At $f_0$ the transfer phase is −90°. The transfer magnification remains defined at zero forcing, while actual dynamic motion and power are zero.

Source work and viscous dissipation are computed independently:

$$\overline P_{input}=\tfrac12F_A\omega X(-\sin\alpha),\qquad\overline P_{loss}=\tfrac12b(\omega X)^2.$$

They agree in steady state. The source supplies the loss; no extra gravity or energy term is added. Linear motion can exceed real spring travel within hypothetical combinations; the model does not assess a device's mechanical limits.

| Mechanical input | Bound | Unit |
|---|---:|---|
| `massGrams` | 1–100 | g, converted to kg |
| `stiffnessNPerM` | 1–100 | N/m |
| `dampingRatio` | 0.05–2 | dimensionless |
| `forcePeakN` | 0–0.05 | N peak |
| `frequencyHz` | 0.2–100 | Hz |

API: `calculateDrivenOscillator`, `buildMechanicalRows`, `mechanicalCsv`, `DEFAULT_MECHANICAL_INPUT`. The split logarithmic frequency sweep includes $f_0$ exactly and is clipped to 0.2–100 Hz. Returned displacement/velocity are peak quantities, power is a cycle mean, and sag is a positive downward distance.

## Reproducibility and checks

Each CSV begins with settings, units, fixed assumptions, a source link and a statement that rows are model output rather than measurements. All values are deterministic; no random seed, browser sensor or audio context is involved.

Tests cover dimensional conversions, pressure-squared and volume scaling, potential/force differentiation, restoring versus unstable derivatives, both contrast signs, no-equilibrium cases, the marginal boundary, spatial translation and half-wavelength periodicity, signed magnetic gradients and their factor of two, local balance without stability, ordinary source/loss power balance, damping-dependent displacement peaks, zero forcing, asymptotic response, bounded allocation and reproducible CSVs.
