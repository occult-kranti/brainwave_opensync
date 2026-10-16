# Frequency hypotheses and bounded model contracts

These are eight original proposed investigations, built from stated physical models. They are not attributed teachings, completed experiments, frequency prescriptions or efficacy claims. The accompanying calculations implement ordinary channel scales, prescribed classical confinement and equal-wave interference. They do not supply a missing mechanism for an unoperationalized claim about location, gravity, healing or energy generation.

The data live in `src/frontier/hypotheses.ts`; pure calculations and tests live in `src/frontier/models.ts` and `src/frontier/models.test.ts`. Source IDs reference `scienceSources.ts`. No audio, hardware, biological model or external service is involved. Existing levitation and Newton–Tesla models are referenced where useful rather than duplicated.

## Three interactive models

### 1. Equal numerical frequency across different channels

`channelComparison(fHz)` accepts a finite frequency from 1 to 100,000 Hz and returns

$$T=1/f,\qquad \lambda_{sound}=343/f,\qquad \lambda_{EM}=c/f,\qquad E_{photon}=hf.$$

Distances are metres, period is seconds and photon energy is joules. The sound speed is an approximate ideal-air value, not a universal material property. Vacuum light speed $c=299792458\,\mathrm{m/s}$ and Planck constant $h=6.62607015\times10^{-34}\,\mathrm{J\,s}$ use the defining SI values documented by [NIST](https://www.nist.gov/si-redefinition/meet-constants).

The ratio of electromagnetic to acoustic wavelength remains $c/343$ at equal frequency. At 440 Hz the values are approximately 0.779545 m and 681346.495 m. The electromagnetic photon calculation does not describe the energy of a sound session, the number of photons present, an absorbed dose or source power. Medium dispersion, attenuation, source amplitude and coupling remain unspecified. [Feynman volume II, chapter 27](https://www.feynmanlectures.caltech.edu/II_27.html) treats electromagnetic field energy and momentum; it is not evidence that sound and electromagnetism become interchangeable at a common frequency.

`channelComparisonCsv(fHz)` exports one numerical row with units, constants and assumptions.

### 2. Classical distribution and relaxation for prescribed stiffness

The thermal model assumes a positive, conservative harmonic potential in one Cartesian coordinate:

$$U(x)=\frac{\kappa x^2}{2},\quad p(x)=\frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{x^2}{2\sigma^2}\right),\quad \sigma=\sqrt{\frac{k_BT}{\kappa}}.$$

This Gaussian and variance are our reduction of the Boltzmann law in [Feynman volume I, chapter 40, §40–2](https://www.feynmanlectures.caltech.edu/I_40.html). The stiffness $\kappa$ is **supplied**, not inferred from acoustic frequency or shown achievable by any apparatus. A 1D RMS is not a 3D radial distance. At $x=\sigma$, the harmonic potential is $k_BT/2$.

For a spherical particle of radius $a$ in a continuum Newtonian liquid with dynamic viscosity $\eta$,

$$\gamma=6\pi\eta a,\qquad D=\frac{k_BT}{\gamma},\qquad\tau=\frac{\gamma}{\kappa},\qquad f_c=\frac{1}{2\pi\tau}.$$

Here $\gamma$ is drag in N·s/m, $D$ is the **free** Stokes–Einstein diffusion coefficient in m²/s, $\tau$ is overdamped relaxation time in seconds, and $f_c$ is the overdamped corner frequency in Hz. The [original Einstein 1905 scan, §§3–5](https://jxshix.people.wm.edu/math490-2009/AEinstein-1905-MovBrowniano.pdf) supports diffusion and free displacement; the harmonic relaxation formulas are our reduction of $\gamma\dot x+\kappa x=\xi(t)$. The identity $\sigma^2=D\tau$ connects equilibrium variance with these dynamics.

Free one-axis RMS displacement after time $t$ is $\sqrt{2Dt}$; it is not the stationary trapped spread $\sigma$. At equilibrium the ideal overdamped autocorrelation is $\langle x(t)x(0)\rangle=\sigma^2e^{-|t|/\tau}$. Adjacent recorded frames can therefore be correlated and cannot automatically be treated as independent observations.

| Input | Bound | Unit |
|---|---:|---|
| `stiffnessNpm` | $10^{-9}$–$10^{-3}$ | N/m |
| `temperatureK` | 250–350 | K |
| `radiusM` | $25\times10^{-9}$–$5\times10^{-6}$ | m |
| `viscosityPas` | $10^{-4}$–0.1 | Pa·s |

Defaults are $\kappa=10^{-6}$ N/m, $T=300$ K, $a=100$ nm and $\eta=0.001$ Pa·s. They yield approximately $\sigma=64.358$ nm, $D=2.19737\times10^{-12}$ m²/s and $f_c=84.4343$ Hz. These are hypothetical inputs, not material calibration. Viscosity and temperature are independently supplied; a real fluid's viscosity may change with temperature.

Continuum no-slip drag, equilibrium, a harmonic range large enough for the fluctuations, negligible wall effects and an overdamped observation regime are assumptions. The model does not receive particle mass, so it cannot verify the inertial crossover. Small-particle slip, molecular effects, inertia, walls, streaming, nonconservative forcing, aggregation and finite trap depth may require different physics. It computes neither capture nor escape probability and establishes no quantum ground state or gravitational cancellation.

`thermalTrap(input)` returns thermal energy, RMS, drag, diffusion, relaxation time and corner frequency. `buildThermalTrapRows(input,count)` exports a Gaussian over $\pm4\sigma$ with absolute density in m⁻¹, relative density and $U/(k_BT)$. The finite plot retains the full Gaussian normalization: it covers approximately 0.99993666 probability and is not rescaled to contain all probability. `thermalTrapCsv` includes parameters, scalar results and those rows.

### 3. Relative phase and path difference

Two equal-amplitude monochromatic waves have local squared-amplitude ratio

$$\delta=\frac{2\pi\Delta L}{\lambda}+\phi,\qquad R=\frac{|1+e^{i\delta}|^2}{4}=\frac{1+\cos\delta}{2},\qquad\lambda=343/f.$$

The API name `normalizedIntensity` denotes this **local mean-square amplitude ratio**. It is not net acoustic intensity through a surface; an ideal standing wave has zero time-averaged net energy flux while its local squared pressure varies. Normalization is always the equal-source constructive maximum, never each curve's own maximum. At zero path difference, phases 0°, 90° and 180° give 1, 0.5 and 0.

`coherence(input)` accepts frequency 1–100,000 Hz, signed path difference −1–1 m and relative source phase −180–180°. It returns wavelength, combined phase in radians, the squared-amplitude ratio and node spacing $\lambda/2$ **for counterpropagating planar geometry only**. In that geometry $\Delta L=2z+\text{constant}$, so a source-relative phase change translates nodes by

$$\Delta z=-\frac{\lambda\Delta\phi}{4\pi}.$$

Path-difference fringes repeat after $\lambda$, while spatial standing-wave nodes repeat after $\lambda/2$. This relative phase is distinct from the spatial phase used in the existing levitation model's $\cos(kz+\phi)$; the relative phase between two counterpropagating waves enters that cosine with a factor of one half.

`buildCoherenceRows(input,count)` samples the selected path difference plus or minus one wavelength, clipped to −1–1 m. This contains at most two fringes. Its minimum of 17 rows provides at least eight intervals per cycle; a full two-metre plot at high frequency would otherwise create false patterns from undersampling. `coherenceCsv` records the actual plot interval and normalization. Fixed monochromatic phase, equal amplitudes and ideal propagation are assumed; partial coherence, attenuation, boundaries and source imbalance are not fitted.

## Hypothesis matrix

Each record contains variables, model, prediction, setup, controls, observable, falsifier, limitations and source IDs. The proposals below are distinguishable from implementation tests: a mathematical identity can test software, while a physical prediction needs independent measurements and calibration.

| ID | Proposed question | Observable and decisive control |
|---|---|---|
| `frontier-channel-match` | Does a shared frequency specify a shared mechanism? | Wavelength/period scaling under explicitly different propagation speeds; no amplitude or coupling inferred |
| `frontier-relative-phase` | Does relative phase move the ordinary interference pattern as predicted? | Local minima and fixed-normalization pressure statistics; phase inversion and single-source reference |
| `frontier-phase-drift` | Does detuning explain a slowly changing phase pattern? | Relative-phase slope $2\pi\Delta f$; zero detuning and sign reversal |
| `frontier-brownian-stiffness` | Does independent stiffness predict held-out one-axis variance? | Position distribution; source-off, tracking-noise, temperature and relevant electric shielding controls |
| `frontier-brownian-drag` | Does drag change relaxation while preserving equilibrium variance? | Free diffusion, trapped correlation and variance measured separately; independent viscosity and stiffness |
| `frontier-sampling-alias` | Could an acquisition chain manufacture a low-frequency line? | Samples and spectra at documented sample rates; bandwidth limit and rate-change controls |
| `frontier-passive-resonance` | Can a larger passive response be explained by the source/loss budget? | Amplitude, phase, cycle-mean input/loss and transient storage; identified system boundaries |
| `frontier-force-energy-budget` | Is force balance sufficient when scaling toward smaller particles? | Potential relative to $k_BT$, confinement directions and tracked motion; field-off, shielding and streaming controls |

The alias proposal uses our identity for cosine samples at 8,000 samples/s: 7,712 Hz and 288 Hz yield the same sample sequence. It does not render the high-frequency signal or perform an actual acquisition. [Shannon's 1949 paper, §II](https://fab.cba.mit.edu/classes/S62.12/docs/Shannon_noise.pdf) supplies the bandwidth/sampling context. A directly synthesized 288 Hz listening illustration cannot show that aliasing occurred.

The final proposal references the existing small-sphere model and [Gor’kov's original paper record](https://www.mathnet.ru/rus/dan25473). At fixed ideal field and contrast, force, weight and acoustic potential scale with volume. Their force ratio can stay fixed while potential energy relative to thermal energy falls. This is not permission to extrapolate that model beyond its stated radius range. It does not identify an achievable nanoscale trap. Electric and acoustic contributions remain separate mechanisms; shielding can help test which contribution dominates in an appropriate measured setup.

Source IDs agreed with the science catalog are `frontier-gorkov-1961`, `frontier-feynman-fields`, `frontier-feynman-energy`, `frontier-einstein-brownian-1905`, `frontier-feynman-statmech` and `frontier-shannon-1949`. Optional listening preset links are pedagogical compositions; neither these papers nor these hypotheses validate a listening outcome.

## Acceptance tests and limits

All scalar inputs reject nonfinite or out-of-bound values. Row counts are integer-bounded to 600 before array allocation: thermal rows accept 3–600, coherence rows 17–600. CSVs have deterministic settings, units and assumptions. No random samples are generated.

The focused model suite checks:

- inverse wavelength/period and direct photon-energy scaling;
- equipartition, $\sigma^2=D\tau$, corner-frequency units, stiffness/temperature/drag scaling;
- Gaussian symmetry, absolute normalization and finite values at all parameter corners;
- constructive/destructive interference, phase compensation and the factor of two between path difference and spatial position;
- fixed normalization, bounded local fringe resolution, invalid inputs, allocation limits and deterministic CSV output.

Independent arithmetic review reproduced the default outputs, scaling identities, Gaussian integral and phase cases. A reviewer also corrected the Brownian-drag falsifier: a reproducible failure of **either** calibrated variance or relaxation prediction can reject the jointly specified model; failure of both is not required. The persistent focused suite contains 41 passing tests. These checks establish implementation consistency under assumptions, not empirical efficacy or a new physical mechanism.
